import type { UploadChunk, UploadQueueItem } from '../types/upload'
import { generateFileId } from './upload-utils'

export const DEFAULT_UPLOAD_CHUNK_SIZE = 1024 * 1024

export function createUploadChunks(
  file: File,
  chunkSize: number = DEFAULT_UPLOAD_CHUNK_SIZE
): UploadChunk[] {
  const safeChunkSize = Math.max(1, Math.floor(chunkSize))
  const total = Math.max(1, Math.ceil(file.size / safeChunkSize))

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
}

export async function runUploadQueue<T extends UploadQueueItem>(
  items: T[],
  upload: (item: T) => Promise<void>,
  options: RunUploadQueueOptions<T> = {}
): Promise<T[]> {
  const concurrency = Math.max(1, Math.floor(options.concurrency ?? 2))
  let cursor = 0

  const notify = () => options.onChange?.([...items])

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const item = items[cursor]
      cursor += 1
      item.status = 'uploading'
      notify()

      try {
        await upload(item)
        item.status = 'success'
        item.progress = 100
      } catch (error) {
        item.status = 'error'
        item.error = error instanceof Error ? error.message : String(error)
      }

      notify()
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return items
}
