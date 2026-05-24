import { describe, it, expect, vi } from 'vitest'
import {
  getUploadDataTransferFiles,
  createUploadChunks,
  createUploadQueueItem,
  getUploadResumeKey,
  handleUploadDragLeave,
  handleUploadDragOver,
  handleUploadDrop,
  runUploadQueue,
  type UploadDragEventLike
} from '@expcat/tigercat-core'

function createDragEvent(files: File[] = []): UploadDragEventLike & { preventDefault: () => void } {
  return {
    preventDefault: vi.fn(),
    dataTransfer: { files }
  }
}

describe('upload-utils drag helpers', () => {
  it('extracts dataTransfer files', () => {
    const first = new File(['a'], 'a.txt', { type: 'text/plain' })
    const second = new File(['b'], 'b.txt', { type: 'text/plain' })

    expect(getUploadDataTransferFiles({ files: [first, second] })).toEqual([first, second])
    expect(getUploadDataTransferFiles(null)).toEqual([])
  })

  it('sets dragging state on drag over', () => {
    const event = createDragEvent()

    expect(handleUploadDragOver(event)).toEqual({ handled: true, isDragging: true, files: [] })
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })

  it('clears dragging state on drag leave', () => {
    const event = createDragEvent()

    expect(handleUploadDragLeave(event)).toEqual({ handled: true, isDragging: false, files: [] })
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })

  it('extracts dropped files and clears dragging state', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const event = createDragEvent([file])

    expect(handleUploadDrop(event)).toEqual({ handled: true, isDragging: false, files: [file] })
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })

  it('does not prevent default when disabled', () => {
    const event = createDragEvent()

    expect(handleUploadDrop(event, true)).toEqual({ handled: false, isDragging: false, files: [] })
    expect(event.preventDefault).not.toHaveBeenCalled()
  })
})

describe('upload-utils chunk and queue helpers', () => {
  it('creates fixed-size upload chunks', () => {
    const file = new File(['abcdef'], 'data.txt', { type: 'text/plain', lastModified: 1 })
    const chunks = createUploadChunks(file, 2)

    expect(chunks).toHaveLength(3)
    expect(chunks.map((chunk) => [chunk.index, chunk.start, chunk.end, chunk.size])).toEqual([
      [0, 0, 2, 2],
      [1, 2, 4, 2],
      [2, 4, 6, 2]
    ])
  })

  it('creates stable resume keys from file identity', () => {
    const file = new File(['abc'], 'resume.txt', { lastModified: 123 })

    expect(getUploadResumeKey(file)).toBe('resume.txt:3:123')
  })

  it('creates queue items with chunks', () => {
    const file = new File(['abcdef'], 'queue.txt')
    const item = createUploadQueueItem(file, 'file-1', 3)

    expect(item).toMatchObject({ id: 'file-1', file, status: 'queued', progress: 0 })
    expect(item.chunks).toHaveLength(2)
  })

  it('runs queued uploads with status updates', async () => {
    const first = createUploadQueueItem(new File(['a'], 'a.txt'), 'a')
    const second = createUploadQueueItem(new File(['b'], 'b.txt'), 'b')
    const onChange = vi.fn()

    const result = await runUploadQueue(
      [first, second],
      async (item) => {
        item.progress = 50
      },
      { concurrency: 1, onChange }
    )

    expect(result.map((item) => item.status)).toEqual(['success', 'success'])
    expect(result.map((item) => item.progress)).toEqual([100, 100])
    expect(onChange).toHaveBeenCalled()
  })
})
