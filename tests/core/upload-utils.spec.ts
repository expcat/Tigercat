import { describe, it, expect, vi } from 'vitest'
import {
  getUploadDataTransferFiles,
  handleUploadDragLeave,
  handleUploadDragOver,
  handleUploadDrop,
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
