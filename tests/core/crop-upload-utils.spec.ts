import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  validateUploadFile,
  readFileAsDataUrl,
  getCropperResult,
  type CropResult
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

  describe('getCropperResult', () => {
    it('returns null when cropper is missing', async () => {
      expect(await getCropperResult(null)).toBeNull()
      expect(await getCropperResult(undefined)).toBeNull()
    })

    it('awaits and returns the cropper result', async () => {
      const result = { dataUrl: 'data:x', file: undefined } as unknown as CropResult
      const cropper = { getCropResult: vi.fn().mockResolvedValue(result) }
      expect(await getCropperResult(cropper)).toBe(result)
      expect(cropper.getCropResult).toHaveBeenCalledTimes(1)
    })

    it('propagates rejections from getCropResult', async () => {
      const cropper = { getCropResult: vi.fn().mockRejectedValue(new Error('crop failed')) }
      await expect(getCropperResult(cropper)).rejects.toThrow('crop failed')
    })
  })
})
