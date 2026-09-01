import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createCropUploadSession,
  validateUploadFile,
  readFileAsDataUrl
} from '@expcat/tigercat-core'

const fakeFile = (size: number, name = 'a.png'): File => {
  const blob = new Blob([new Uint8Array(size)], { type: 'image/png' })
  return new File([blob], name, { type: 'image/png' })
}

describe('crop-upload-utils', () => {
  describe('validateUploadFile', () => {
    it('returns null for missing file', () => {
      expect(validateUploadFile(null)).toBeNull()
      expect(validateUploadFile(undefined)).toBeNull()
    })

    it('returns null when no maxSize provided', () => {
      expect(validateUploadFile(fakeFile(1024))).toBeNull()
    })

    it('returns null when file size <= maxSize', () => {
      expect(validateUploadFile(fakeFile(100), 100)).toBeNull()
      expect(validateUploadFile(fakeFile(99), 100)).toBeNull()
    })

    it('returns Error when file size > maxSize', () => {
      const err = validateUploadFile(fakeFile(101), 100)
      expect(err).toBeInstanceOf(Error)
      expect(err?.message).toContain('100')
    })

    it('treats non-positive maxSize as no limit', () => {
      expect(validateUploadFile(fakeFile(1024), 0)).toBeNull()
    })
  })

  describe('createCropUploadSession', () => {
    beforeEach(() => {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:one')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    })
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('opens with an object URL and revokes on replace', () => {
      const onState = vi.fn()
      const onError = vi.fn()
      const session = createCropUploadSession({
        getAccept: () => 'image/*',
        getMaxSize: () => undefined,
        getSizeError: () => 'too big',
        getTypeError: () => 'bad type',
        onState,
        onError
      })

      expect(session.selectFile(fakeFile(10, 'a.png'))).toBe(true)
      expect(session.getState().modalOpen).toBe(true)
      expect(session.getState().imageSrc).toBe('blob:one')
      expect(session.getState().cropperReady).toBe(false)
      expect(session.beginCrop()).toBe(false)

      session.markReady()
      expect(session.beginCrop()).toBe(true)

      session.selectFile(fakeFile(10, 'b.png'))
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:one')
      session.dispose()
    })

    it('rejects non-image files', () => {
      const onError = vi.fn()
      const session = createCropUploadSession({
        getAccept: () => 'image/*',
        getMaxSize: () => undefined,
        getSizeError: () => 'too big',
        getTypeError: () => 'bad type',
        onState: () => undefined,
        onError
      })
      expect(session.selectFile(new File(['x'], 'note.txt', { type: 'text/plain' }))).toBe(false)
      expect(onError).toHaveBeenCalled()
      session.dispose()
    })
  })

  describe('readFileAsDataUrl', () => {
    let originalFileReader: typeof FileReader

    beforeEach(() => {
      originalFileReader = globalThis.FileReader
    })
    afterEach(() => {
      globalThis.FileReader = originalFileReader
    })

    it('resolves with the data URL on load', async () => {
      class MockReader {
        result: string | null = null
        error: Error | null = null
        onload: ((ev: { target: { result: string } }) => void) | null = null
        onerror: (() => void) | null = null
        readAsDataURL() {
          setTimeout(() => {
            this.result = 'data:image/png;base64,XXXX'
            this.onload?.({ target: { result: this.result } })
          }, 0)
        }
      }
      ;(globalThis as unknown as { FileReader: unknown }).FileReader = MockReader
      const url = await readFileAsDataUrl(fakeFile(10))
      expect(url).toBe('data:image/png;base64,XXXX')
    })

    it('rejects with reader.error on failure', async () => {
      class MockReader {
        result: string | null = null
        error: Error | null = null
        onload: ((ev: { target: { result: string } }) => void) | null = null
        onerror: (() => void) | null = null
        readAsDataURL() {
          setTimeout(() => {
            this.error = new Error('boom')
            this.onerror?.()
          }, 0)
        }
      }
      ;(globalThis as unknown as { FileReader: unknown }).FileReader = MockReader
      await expect(readFileAsDataUrl(fakeFile(10))).rejects.toThrow('boom')
    })
  })
})
