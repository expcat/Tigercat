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
  name?: string
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
  let processChain: Promise<void> = Promise.resolve()

  function emitList(list: UploadFile[], changed?: UploadFile): void {
    options.host.setFileList(list, changed)
    if (changed) options.callbacks.onChange?.(changed, list)
  }

  function patchUid(uid: string, patch: Partial<UploadFile>): UploadFile | undefined {
    if (removedUids.has(uid)) return undefined
    const list = options.host.getFileList()
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
              const current = patchUid(uploadFile.uid, { status: 'success', progress: 100 })
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
          filename: config.name ?? 'file',
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
    if (removedUids.has(uploadFile.uid)) return false
    const file = uploadFile.file
    if (!file) return false

    const config = options.getConfig()
    if (!config.customRequest && !config.action) return true

    patchUid(uploadFile.uid, { status: 'uploading', progress: 0, error: undefined })

    const chunks =
      config.chunkSize && config.customRequest ? createUploadChunks(file, config.chunkSize) : []
    const resumeKey = config.resumable ? getUploadResumeKey(file) : undefined

    if (chunks.length <= 1) {
      await requestOne(file, uploadFile, { resumeKey })
      return true
    }

    for (const chunk of chunks) {
      if (removedUids.has(uploadFile.uid)) return false
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
    }

    const current = patchUid(uploadFile.uid, { status: 'success', progress: 100 })
    if (current) options.callbacks.onSuccess?.({ chunks: chunks.length, resumeKey }, current)
    return true
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
          const uploadFile =
            options.host.getFileList().find((candidate) => candidate.uid === item.id) ??
            added.find((candidate) => candidate.uid === item.id)
          if (!uploadFile || removedUids.has(item.id)) return false
          return uploadOne(uploadFile)
        },
        { concurrency: config.maxConcurrent, onChange: options.callbacks.onQueueChange }
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
    if (incoming.length === 0) return
    const config = options.getConfig()
    const currentList = options.host.getFileList()
    const prepared = await prepareUploadFiles({
      currentCount: currentList.length,
      incomingFiles: incoming,
      limit: config.limit,
      accept: config.accept,
      maxSize: config.maxSize,
      beforeUpload: config.beforeUpload
    })

    if (prepared.rejectedExceedFiles.length > 0) {
      options.callbacks.onExceed?.(prepared.rejectedExceedFiles, currentList)
    }
    if (prepared.rejectedFiles.length > 0) {
      options.callbacks.onReject?.(prepared.rejectedFiles)
    }

    let nextList = [...currentList]
    const added: UploadFile[] = []
    for (const file of prepared.acceptedFiles) {
      const uploadFile = fileToUploadFile(file)
      added.push(uploadFile)
      nextList = [...nextList, uploadFile]
      emitList(nextList, uploadFile)
    }

    await uploadAccepted(added)
  }

  function processFiles(incoming: File[]): Promise<void> {
    const run = processChain.then(
      () => processFilesInner(incoming),
      () => processFilesInner(incoming)
    )
    processChain = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  async function submit(): Promise<void> {
    const config = options.getConfig()
    const ready = options.host.getFileList().filter((item) => item.status === 'ready' && item.file)
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
          const uploadFile = options.host
            .getFileList()
            .find((candidate) => candidate.uid === item.id)
          if (!uploadFile || removedUids.has(item.id)) return false
          return uploadOne(uploadFile)
        },
        { concurrency: config.maxConcurrent, onChange: options.callbacks.onQueueChange }
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
    if (file.status !== 'error' || !file.file) return
    try {
      await uploadOne(file)
    } catch {
      // error already patched
    }
  }

  async function remove(file: UploadFile): Promise<boolean> {
    const next = options.host.getFileList().filter((item) => item.uid !== file.uid)
    const allowed = await options.callbacks.onRemove?.(file, next)
    if (allowed === false) return false
    removedUids.add(file.uid)
    abort(file.uid)
    emitList(next, file)
    return true
  }

  function dispose(): void {
    abort()
    removedUids.clear()
  }

  return { processFiles, submit, abort, retry, remove, dispose }
}
