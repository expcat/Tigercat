import { describe, it, expect } from 'vitest'
import {
  imagePreviewImgClasses,
  imagePreviewWrapperClasses,
  imageViewerImgClasses,
  imageViewerBackdropClasses,
  overlayZIndexClass
} from '@expcat/tigercat-core'

describe('image-viewer-utils chrome', () => {
  it('keeps the preview bitmap inside the viewport', () => {
    expect(imagePreviewImgClasses).toContain('max-h-[90vh]')
    expect(imagePreviewImgClasses).toContain('max-w-[90vw]')
    expect(imageViewerImgClasses).toBe(imagePreviewImgClasses)
  })

  it('uses the modal overlay scale, not a one-off z-index', () => {
    expect(imagePreviewWrapperClasses).toContain(overlayZIndexClass.modal)
    expect(imageViewerBackdropClasses).toBe(imagePreviewWrapperClasses)
  })
})
