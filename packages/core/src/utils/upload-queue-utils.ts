import type { UploadChunk, UploadQueueItem } from '../types/upload'
import { generateFileId } from './upload-utils'

export const DEFAULT_UPLOAD_CHUNK_SIZE = 1024 * 1024
/** Upper bound so a tiny chunk size cannot allocate an unbounded chunk list. */
export const MAX_UPLOAD_CHUNKS = 10_000

export function createUploadChunks(
  file: File,
  chunkSize: number = DEFAULT_UPLOAD_CHUNK_SIZE
): UploadChunk[] {
  const safeChunkSize = Math.max(1, Math.floor(chunkSize))
  const total = Math.max(1, Math.ceil(file.size / safeChunkSize))
  if (total > MAX_UPLOAD_CHUNKS) {
    throw new Error(`Upload exceeds the chunk limit of ${MAX_UPLOAD_CHUNKS}`)
  }

  return Array.from({ length: total }, (_, index) => {
    const start = index * safeChunkSize
    const end = Math.min(file.size, start + safeChunkSize)
    return {
      index,
      start,
      end,
      size: end - start,
      blob: file.slice(start, end)
    }
  })
}

export function getUploadResumeKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export function createUploadQueueItem(
  file: File,
  id: string = generateFileId(),
  chunkSize?: number
): UploadQueueItem {
  return {
    id,
    file,
    status: 'queued',
    progress: 0,
    chunks: chunkSize ? createUploadChunks(file, chunkSize) : []
  }
}

export interface RunUploadQueueOptions<T extends UploadQueueItem> {
  concurrency?: number
  onChange?: (items: T[]) => void
  /** Stop claiming further items. The in-flight upload is the caller's to abort. */
  signal?: AbortSignal
}

export async function runUploadQueue<T extends UploadQueueItem>(
  items: T[],
  upload: (item: T) => Promise<void | boolean>,
  options: RunUploadQueueOptions<T> = {}
): Promise<T[]> {
  const concurrency = Math.max(1, Math.floor(options.concurrency ?? 2))
  const signal = options.signal
  let cursor = 0

  const notify = () => options.onChange?.([...items])

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      if (signal?.aborted) return
      const item = items[cursor]
      cursor += 1
      if (!item) return
      item.status = 'uploading'
      notify()

      try {
        const result = await upload(item)
        if (signal?.aborted) {
          if (item.status === 'uploading') {
            item.status = 'error'
            item.error = 'Upload cancelled'
          }
          notify()
          return
        }
        if (result === false) {
          if (item.status === 'uploading' || item.status === 'queued') {
            item.status = 'error'
            item.error = item.error ?? 'Upload rejected'
          }
        } else {
          item.status = 'success'
          item.progress = 100
        }
      } catch (error) {
        item.status = 'error'
        item.error = signal?.aborted
          ? 'Upload cancelled'
          : error instanceof Error
            ? error.message
            : String(error)
        if (signal?.aborted) {
          notify()
          return
        }
      }

      notify()
    }
  }

  const workers = Math.min(concurrency, Math.max(items.length, 1))
  if (items.length === 0 || signal?.aborted) return items
  await Promise.all(Array.from({ length: workers }, () => worker()))
  return items
}
