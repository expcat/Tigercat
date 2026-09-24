/**
 * Shared upload session: accept, queue, request, abort, and remove.
 * Vue/React only bind DOM and the controlled `fileList`.
 */

import type {
  UploadChunk,
  UploadFile,
  UploadQueueItem,
  UploadRejectedFile,
  UploadRequestOptions
} from '../types/upload'
import {
  createUploadChunks,
  createUploadQueueItem,
  getUploadResumeKey,
  runUploadQueue
} from './upload-queue-utils'
import {
  fileToUploadFile,
  prepareUploadFiles,
  readUploadResponseUrl,
  startXhrUpload,
  type BeforeUploadHandler
} from './upload-utils'

export interface UploadControllerConfig {
  accept?: string
  limit?: number
  maxSize?: number
  autoUpload: boolean
  queue: boolean
  maxConcurrent: number
  chunkSize?: number
  resumable: boolean
  action?: string
  /** Form field name. Not the multipart filename. */
  name?: string
  /** Multipart filename for the default action request. */
  fileFieldName?: string
  multiple?: boolean
  method?: string
  headers?: Record<string, string>
  data?: Record<string, string | Blob>
  withCredentials?: boolean
  customRequest?: (options: UploadRequestOptions) => void | { abort?: () => void }
  beforeUpload?: BeforeUploadHandler
}

export interface UploadControllerCallbacks {
  onChange?: (file: UploadFile, fileList: UploadFile[]) => void
  onRemove?: (file: UploadFile, fileList: UploadFile[]) => void | boolean | Promise<void | boolean>
  onProgress?: (progress: number, file: UploadFile) => void
  onSuccess?: (response: unknown, file: UploadFile) => void
  onError?: (error: Error, file: UploadFile) => void
  onExceed?: (files: File[], fileList: UploadFile[]) => void
  onReject?: (files: UploadRejectedFile[]) => void
  onQueueChange?: (queue: UploadQueueItem[]) => void
  onChunkProgress?: (chunk: UploadChunk, progress: number, file: UploadFile) => void
}

export interface UploadControllerHost {
  getFileList(): UploadFile[]
  setFileList(list: UploadFile[], changed?: UploadFile): void
}

export interface UploadController {
  processFiles(incoming: File[]): Promise<void>
  submit(): Promise<void>
  abort(uid?: string): void
  retry(file: UploadFile): Promise<void>
  remove(file: UploadFile): Promise<boolean>
  dispose(): void
}

export function createUploadController(options: {
  host: UploadControllerHost
  getConfig: () => UploadControllerConfig
  callbacks: UploadControllerCallbacks
}): UploadController {
  const removedUids = new Set<string>()
  const abortByUid = new Map<string, () => void>()
  const inflightUids = new Set<string>()
  const completedChunks = new Map<string, Set<number>>()
  let processChain: Promise<void> = Promise.resolve()
  let disposed = false
  const queueAbort = new AbortController()

  function enqueue(task: () => Promise<void>): Promise<void> {
    const run = processChain.then(
      () => (disposed ? undefined : task()),
      () => (disposed ? undefined : task())
    )
    processChain = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  function liveList(): UploadFile[] {
    const list = options.host.getFileList()
    return Array.isArray(list) ? list : []
  }

  function emitList(list: UploadFile[], changed?: UploadFile): void {
    const liveIds = new Set(liveList().map((item) => item.uid))
    const kept = list.filter((item) => liveIds.has(item.uid) || item.uid === changed?.uid)
    options.host.setFileList(kept, changed)
    if (changed) options.callbacks.onChange?.(changed, kept)
  }

  function patchUid(uid: string, patch: Partial<UploadFile>): UploadFile | undefined {
    if (removedUids.has(uid)) return undefined
    const list = liveList()
    let changed: UploadFile | undefined
    const next = list.map((item) => {
      if (item.uid !== uid) return item
      changed = { ...item, ...patch }
      return changed
    })
    if (!changed) return undefined
    emitList(next, changed)
    return changed
  }

  function requestOne(
    file: File,
    uploadFile: UploadFile,
    extra: {
      originalFile?: File
      chunk?: UploadChunk
      totalChunks?: number
      resumeKey?: string
    } = {}
  ): Promise<void> {
    const config = options.getConfig()

    return new Promise((resolve, reject) => {
      let settled = false
      const finish = (fn: () => void): void => {
        if (settled) return
        settled = true
        abortByUid.delete(uploadFile.uid)
        fn()
      }

      const applyProgress = (progress: number): void => {
        const nextProgress = extra.chunk
          ? Math.round(((extra.chunk.index + progress / 100) / (extra.totalChunks ?? 1)) * 100)
          : progress
        const current = patchUid(uploadFile.uid, { progress: nextProgress, status: 'uploading' })
        if (!current) return
        if (extra.chunk) options.callbacks.onChunkProgress?.(extra.chunk, progress, current)
        options.callbacks.onProgress?.(nextProgress, current)
      }

      const request: UploadRequestOptions = {
        file,
        originalFile: extra.originalFile,
        chunk: extra.chunk,
        chunkIndex: extra.chunk?.index,
        totalChunks: extra.totalChunks,
        resumeKey: extra.resumeKey,
        onProgress: applyProgress,
        onSuccess: (response) => {
          finish(() => {
            if (removedUids.has(uploadFile.uid)) {
              resolve()
              return
            }
            if (!extra.chunk) {
              const url = readUploadResponseUrl(response)
              const current = patchUid(uploadFile.uid, {
                status: 'success',
                progress: 100,
                ...(url ? { url } : {})
              })
              if (current) options.callbacks.onSuccess?.(response, current)
            }
            resolve()
          })
        },
        onError: (error) => {
          finish(() => {
            if (removedUids.has(uploadFile.uid)) {
              reject(error)
              return
            }
            const current = patchUid(uploadFile.uid, {
              status: 'error',
              error: error.message
            })
            if (current) options.callbacks.onError?.(error, current)
            reject(error)
          })
        },
        onAbort: (abort) => {
          abortByUid.set(uploadFile.uid, () => {
            abort()
            finish(() => reject(new Error('Upload aborted')))
          })
        }
      }

      let abortHandle: { abort?: () => void } | void
      if (config.customRequest) {
        abortHandle = config.customRequest(request)
      } else if (config.action) {
        abortHandle = startXhrUpload({
          file,
          action: config.action,
          filename: config.fileFieldName || 'file',
          method: config.method,
          headers: config.headers,
          data: config.data,
          withCredentials: config.withCredentials,
          onProgress: request.onProgress,
          onSuccess: request.onSuccess,
          onError: request.onError
        })
      } else {
        finish(() => resolve())
        return
      }

      const abort = abortHandle?.abort
      if (typeof abort === 'function') {
        abortByUid.set(uploadFile.uid, () => {
          abort()
          finish(() => reject(new Error('Upload aborted')))
        })
      }
    })
  }

  async function uploadOne(uploadFile: UploadFile): Promise<boolean> {
    if (disposed || removedUids.has(uploadFile.uid)) return false
    if (inflightUids.has(uploadFile.uid)) return false
    const file = uploadFile.file
    if (!file) return false

    const config = options.getConfig()
    if (!config.customRequest && !config.action) return true

    inflightUids.add(uploadFile.uid)
    try {
      patchUid(uploadFile.uid, { status: 'uploading', progress: 0, error: undefined })

      const chunks =
        config.chunkSize && config.customRequest ? createUploadChunks(file, config.chunkSize) : []
      const resumeKey = config.resumable ? getUploadResumeKey(file) : undefined
      const done = resumeKey ? (completedChunks.get(resumeKey) ?? new Set<number>()) : null

      if (chunks.length <= 1) {
        await requestOne(file, uploadFile, { resumeKey })
        if (resumeKey) completedChunks.delete(resumeKey)
        return true
      }

      for (const chunk of chunks) {
        if (disposed || removedUids.has(uploadFile.uid)) return false
        if (done?.has(chunk.index)) continue
        const chunkFile = new File([chunk.blob], file.name, {
          type: file.type,
          lastModified: file.lastModified
        })
        await requestOne(chunkFile, uploadFile, {
          originalFile: file,
          chunk,
          totalChunks: chunks.length,
          resumeKey
        })
        if (resumeKey) {
          const set = completedChunks.get(resumeKey) ?? new Set<number>()
          set.add(chunk.index)
          completedChunks.set(resumeKey, set)
        }
      }

      if (resumeKey) completedChunks.delete(resumeKey)
      const current = patchUid(uploadFile.uid, { status: 'success', progress: 100 })
      if (current) options.callbacks.onSuccess?.({ chunks: chunks.length, resumeKey }, current)
      return true
    } finally {
      inflightUids.delete(uploadFile.uid)
    }
  }

  async function uploadAccepted(added: UploadFile[]): Promise<void> {
    const config = options.getConfig()
    if (!config.autoUpload) return
    if (!config.customRequest && !config.action) return

    if (config.queue) {
      const queueItems = added.flatMap((item) =>
        item.file ? [createUploadQueueItem(item.file, item.uid, config.chunkSize)] : []
      )
      options.callbacks.onQueueChange?.(queueItems)
      await runUploadQueue(
        queueItems,
        async (item) => {
          const uploadFile = liveList().find((candidate) => candidate.uid === item.id)
          if (!uploadFile || removedUids.has(item.id) || disposed) return false
          return uploadOne(uploadFile)
        },
        {
          concurrency: config.maxConcurrent,
          onChange: options.callbacks.onQueueChange,
          signal: queueAbort.signal
        }
      )
      return
    }

    for (const uploadFile of added) {
      if (removedUids.has(uploadFile.uid)) continue
      try {
        await uploadOne(uploadFile)
      } catch {
        // error already patched
      }
    }
  }

  async function processFilesInner(incoming: File[]): Promise<void> {
    if (disposed || incoming.length === 0) return
    const config = options.getConfig()
    const currentList = liveList()
    const prepared = await prepareUploadFiles({
      currentCount: currentList.length,
      incomingFiles: incoming,
      limit: config.limit,
      accept: config.accept,
      maxSize: config.maxSize,
      multiple: config.multiple,
      beforeUpload: config.beforeUpload
    })

    if (prepared.rejectedExceedFiles.length > 0) {
      options.callbacks.onExceed?.(prepared.rejectedExceedFiles, currentList)
    }
    if (prepared.rejectedFiles.length > 0) {
      options.callbacks.onReject?.(prepared.rejectedFiles)
    }

    const added: UploadFile[] = []
    for (const file of prepared.acceptedFiles) {
      const uploadFile = fileToUploadFile(file)
      if (config.queue && config.autoUpload) uploadFile.status = 'queued'
      added.push(uploadFile)
      emitList([...liveList(), uploadFile], uploadFile)
    }

    await uploadAccepted(added)
  }

  function processFiles(incoming: File[]): Promise<void> {
    return enqueue(() => processFilesInner(incoming))
  }

  async function submit(): Promise<void> {
    return enqueue(() => submitInner())
  }

  async function submitInner(): Promise<void> {
    const config = options.getConfig()
    const ready = liveList().filter(
      (item) => (item.status === 'ready' || item.status === 'queued') && item.file
    )
    if (config.queue) {
      for (const item of ready) {
        if (item.status !== 'queued') patchUid(item.uid, { status: 'queued' })
      }
    }
    if (ready.length === 0) return
    if (!config.customRequest && !config.action) return

    if (config.queue) {
      const queueItems = ready.map((item) =>
        createUploadQueueItem(item.file as File, item.uid, config.chunkSize)
      )
      options.callbacks.onQueueChange?.(queueItems)
      await runUploadQueue(
        queueItems,
        async (item) => {
          const uploadFile = liveList().find((candidate) => candidate.uid === item.id)
          if (!uploadFile || removedUids.has(item.id) || disposed) return false
          return uploadOne(uploadFile)
        },
        {
          concurrency: config.maxConcurrent,
          onChange: options.callbacks.onQueueChange,
          signal: queueAbort.signal
        }
      )
      return
    }

    for (const item of ready) {
      try {
        await uploadOne(item)
      } catch {
        // error already patched
      }
    }
  }

  function abort(uid?: string): void {
    if (uid) {
      abortByUid.get(uid)?.()
      abortByUid.delete(uid)
      return
    }
    abortByUid.forEach((fn) => fn())
    abortByUid.clear()
  }

  async function retry(file: UploadFile): Promise<void> {
    return enqueue(async () => {
      if (disposed || file.status !== 'error' || !file.file) return
      try {
        await uploadOne(file)
      } catch {
        // error already patched
      }
    })
  }

  async function remove(file: UploadFile): Promise<boolean> {
    const next = liveList().filter((item) => item.uid !== file.uid)
    const allowed = await options.callbacks.onRemove?.(file, next)
    if (allowed === false) return false
    removedUids.add(file.uid)
    abort(file.uid)
    emitList(next, file)
    return true
  }

  function dispose(): void {
    disposed = true
    queueAbort.abort()
    abort()
  }

  return { processFiles, submit, abort, retry, remove, dispose }
}
