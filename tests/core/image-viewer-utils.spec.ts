import { describe, it, expect } from 'vitest'
import {
  imageViewerToolbarClasses,
  imageViewerNavBtnClasses,
  imageViewerCounterClasses
} from '@expcat/tigercat-core'

describe('image-viewer-utils chrome tokens', () => {
  it('lands toolbar fill on ImagePreview dark translucent chrome, not page surface', () => {
    expect(imageViewerToolbarClasses).toContain('--tiger-image-toolbar-bg')
    expect(imageViewerToolbarClasses).toContain('rgba(0,0,0,0.6)')
    expect(imageViewerToolbarClasses).toContain(
      'bg-[var(--tiger-image-toolbar-bg,rgba(0,0,0,0.6))]'
    )
    expect(imageViewerToolbarClasses).not.toContain('--tiger-surface')
    expect(imageViewerToolbarClasses).not.toContain('--tiger-bg')
    expect(imageViewerToolbarClasses).not.toContain('--tiger-fill')
  })

  it('lands nav fill on the same dark translucent chrome with white icons', () => {
    expect(imageViewerNavBtnClasses).toContain('--tiger-image-toolbar-bg')
    expect(imageViewerNavBtnClasses).toContain('text-white')
    expect(imageViewerNavBtnClasses).not.toContain('--tiger-surface')
  })

  it('lands counter fill on the same dark translucent chrome, not page surface', () => {
    expect(imageViewerCounterClasses).toContain('--tiger-image-toolbar-bg')
    expect(imageViewerCounterClasses).not.toContain('--tiger-surface')
  })
})
