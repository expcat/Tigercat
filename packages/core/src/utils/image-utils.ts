/**
 * Image component utilities
 * Shared styles and helpers for Image, ImagePreview, ImageCropper components
 */

import { classNames } from './class-names'
import type { ImageFit, CropRect, CropHandle, PreviewNavState } from '../types/image'

// ============================================================================
// Image component styles
// ============================================================================

/**
 * Base classes for Image wrapper
 */
export const imageBaseClasses = 'relative inline-block overflow-hidden'

/**
 * Classes for the <img> element based on fit
 */
export function getImageImgClasses(fit: ImageFit): string {
  const fitMap: Record<ImageFit, string> = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down'
  }
  return classNames('block w-full h-full', fitMap[fit])
}

/**
 * Classes for the error placeholder
 */
export const imageErrorClasses =
  'flex items-center justify-center w-full h-full bg-[var(--tiger-image-error-bg,#f3f4f6)] text-[var(--tiger-image-error-text,#9ca3af)]'

/**
 * Classes for the loading placeholder
 */
export const imageLoadingClasses =
  'flex items-center justify-center w-full h-full bg-[var(--tiger-image-error-bg,#f3f4f6)] text-[var(--tiger-image-error-text,#9ca3af)] animate-pulse'

/**
 * Cursor class when preview is enabled
 */
export const imagePreviewCursorClass = 'cursor-pointer'

// ============================================================================
// SVG icon path data for image-related icons
// ============================================================================

/** Broken image icon path (used in error state) */
export const imageErrorIconPath =
  'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'

/** Zoom in icon path */
export const zoomInIconPath = 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7'

/** Zoom out icon path */
export const zoomOutIconPath = 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7'

/** Reset icon path (arrows forming a circle) */
export const resetIconPath =
  'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'

/** Left arrow icon path */
export const prevIconPath = 'M15 19l-7-7 7-7'

/** Right arrow icon path */
export const nextIconPath = 'M9 5l7 7-7 7'

/** Close icon path */
export const previewCloseIconPath = 'M6 18L18 6M6 6l12 12'

// ============================================================================
// ImagePreview styles
// ============================================================================

/**
 * Preview mask/backdrop classes
 */
export const imagePreviewMaskClasses =
  'fixed inset-0 bg-[var(--tiger-image-mask,rgba(0,0,0,0.85))] transition-opacity'

/**
 * Preview wrapper classes (full screen container)
 */
export const imagePreviewWrapperClasses =
  'fixed inset-0 flex items-center justify-center select-none'

/**
 * Preview image classes
 */
export const imagePreviewImgClasses =
  'max-w-none transition-transform duration-150 ease-out cursor-grab active:cursor-grabbing'

/**
 * Preview toolbar classes
 */
export const imagePreviewToolbarClasses =
  'absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--tiger-image-toolbar-bg,rgba(0,0,0,0.6))] text-white'

/**
 * Preview toolbar button classes
 */
export const imagePreviewToolbarBtnClasses =
  'flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-40 disabled:cursor-not-allowed'

/**
 * Preview navigation button classes (prev/next)
 */
export const imagePreviewNavBtnClasses =
  'absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--tiger-image-toolbar-bg,rgba(0,0,0,0.6))] text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-40 disabled:cursor-not-allowed'

/**
 * Preview close button classes
 */
export const imagePreviewCloseBtnClasses =
  'absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--tiger-image-toolbar-bg,rgba(0,0,0,0.6))] text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50'

/**
 * Preview counter text classes
 */
export const imagePreviewCounterClasses = 'text-sm text-white/80 mx-2 tabular-nums'

// ============================================================================
// ImageCropper styles
// ============================================================================

/**
 * Cropper container classes
 */
export const imageCropperContainerClasses =
  'relative overflow-hidden bg-[var(--tiger-image-cropper-bg,#1a1a2e)] select-none touch-none'

/**
 * Cropper image classes (the source image)
 */
export const imageCropperImgClasses = 'absolute top-0 left-0 max-w-none pointer-events-none'

/**
 * Cropper mask overlay classes (semi-transparent overlay outside crop area)
 */
export const imageCropperMaskClasses = 'absolute inset-0 pointer-events-none'

/**
 * Cropper selection border classes (the crop box border)
 */
export const imageCropperSelectionClasses =
  'absolute border-2 border-[var(--tiger-image-cropper-border,#ffffff)] pointer-events-none'

/**
 * Cropper guide line classes
 */
export const imageCropperGuideClasses =
  'absolute border-[var(--tiger-image-cropper-border,rgba(255,255,255,0.4))] pointer-events-none'

/**
 * Cropper drag area classes (inside the crop box, handles moving)
 */
export const imageCropperDragAreaClasses = 'absolute cursor-move'

/**
 * Get classes for a resize handle
 */
export function getCropperHandleClasses(handle: CropHandle): string {
  const base =
    'absolute w-3 h-3 bg-[var(--tiger-image-cropper-border,#ffffff)] border border-[var(--tiger-image-cropper-handle-border,rgba(0,0,0,0.3))]'

  const positionMap: Record<CropHandle, string> = {
    nw: '-top-1.5 -left-1.5 cursor-nw-resize',
    n: '-top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize',
    ne: '-top-1.5 -right-1.5 cursor-ne-resize',
    e: 'top-1/2 -right-1.5 -translate-y-1/2 cursor-e-resize',
    se: '-bottom-1.5 -right-1.5 cursor-se-resize',
    s: '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize',
    sw: '-bottom-1.5 -left-1.5 cursor-sw-resize',
    w: 'top-1/2 -left-1.5 -translate-y-1/2 cursor-w-resize'
  }

  return classNames(base, positionMap[handle])
}

/**
 * All 8 crop handles
 */
export const CROP_HANDLES: CropHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

// ============================================================================
// CropUpload styles
// ============================================================================

/**
 * CropUpload trigger button classes
 */
export const cropUploadTriggerClasses =
  'inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-[var(--tiger-border,#d1d5db)] rounded-lg text-[var(--tiger-text-muted,#6b7280)] hover:border-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary,#2563eb)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-2'

/**
 * CropUpload disabled trigger classes
 */
export const cropUploadTriggerDisabledClasses =
  'inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-[var(--tiger-border,#d1d5db)] rounded-lg text-[var(--tiger-text-muted,#9ca3af)] cursor-not-allowed opacity-50'

/**
 * Upload icon path (plus sign in a frame)
 */
export const uploadPlusIconPath = 'M12 4v16m8-8H4'

// ============================================================================
// Calculation utilities (framework-agnostic pure functions)
// ============================================================================

/**
 * Clamp a scale value between min and max
 */
export function clampScale(scale: number, min: number, max: number): number {
  return Math.min(Math.max(scale, min), max)
}

/**
 * Build CSS transform string from scale and offset
 */
export function calculateTransform(scale: number, offsetX: number, offsetY: number): string {
  return `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
}

/**
 * Get navigation state for multi-image preview
 */
export function getPreviewNavState(currentIndex: number, total: number): PreviewNavState {
  return {
    hasPrev: currentIndex > 0,
    hasNext: currentIndex < total - 1,
    counter: total > 1 ? `${currentIndex + 1} / ${total}` : ''
  }
}

/**
 * Constrain a crop rect to stay within image bounds, optionally enforcing aspect ratio
 */
export function constrainCropRect(
  rect: CropRect,
  imageWidth: number,
  imageHeight: number,
  aspectRatio?: number
): CropRect {
  let { x, y, width, height } = rect

  // Enforce aspect ratio
  if (aspectRatio && aspectRatio > 0) {
    const currentRatio = width / height
    if (currentRatio > aspectRatio) {
      width = height * aspectRatio
    } else {
      height = width / aspectRatio
    }
  }

  // Clamp dimensions
  width = Math.min(width, imageWidth)
  height = Math.min(height, imageHeight)

  // Clamp position
  x = Math.max(0, Math.min(x, imageWidth - width))
  y = Math.max(0, Math.min(y, imageHeight - height))

  return { x, y, width, height }
}

/**
 * Resize a crop rect by dragging a handle
 */
export function resizeCropRect(
  rect: CropRect,
  handle: CropHandle,
  dx: number,
  dy: number,
  imageWidth: number,
  imageHeight: number,
  aspectRatio?: number,
  minW = 20,
  minH = 20
): CropRect {
  let { x, y, width, height } = rect

  switch (handle) {
    case 'nw':
      x += dx
      y += dy
      width -= dx
      height -= dy
      break
    case 'n':
      y += dy
      height -= dy
      break
    case 'ne':
      width += dx
      y += dy
      height -= dy
      break
    case 'e':
      width += dx
      break
    case 'se':
      width += dx
      height += dy
      break
    case 's':
      height += dy
      break
    case 'sw':
      x += dx
      width -= dx
      height += dy
      break
    case 'w':
      x += dx
      width -= dx
      break
  }

  // Enforce minimum dimensions
  if (width < minW) {
    if (handle.includes('w')) {
      x = rect.x + rect.width - minW
    }
    width = minW
  }
  if (height < minH) {
    if (handle.includes('n')) {
      y = rect.y + rect.height - minH
    }
    height = minH
  }

  // Enforce aspect ratio
  if (aspectRatio && aspectRatio > 0) {
    const newRatio = width / height
    if (
      handle === 'n' ||
      handle === 's' ||
      handle === 'nw' ||
      handle === 'sw' ||
      handle === 'ne' ||
      handle === 'se'
    ) {
      width = height * aspectRatio
    }
    if (handle === 'e' || handle === 'w') {
      height = width / aspectRatio
    }
    if (
      newRatio !== aspectRatio &&
      (handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se')
    ) {
      width = height * aspectRatio
    }
  }

  return constrainCropRect({ x, y, width, height }, imageWidth, imageHeight, aspectRatio)
}

/**
 * Move a crop rect by a delta, clamped within bounds
 */
export function moveCropRect(
  rect: CropRect,
  dx: number,
  dy: number,
  boundW: number,
  boundH: number
): CropRect {
  const x = Math.max(0, Math.min(rect.x + dx, boundW - rect.width))
  const y = Math.max(0, Math.min(rect.y + dy, boundH - rect.height))
  return { x, y, width: rect.width, height: rect.height }
}

/**
 * Create an initial crop rect centered in the image, optionally with aspect ratio
 */
export function getInitialCropRect(
  imageWidth: number,
  imageHeight: number,
  aspectRatio?: number
): CropRect {
  const padding = 0.1
  let cropW = imageWidth * (1 - padding * 2)
  let cropH = imageHeight * (1 - padding * 2)

  if (aspectRatio && aspectRatio > 0) {
    if (cropW / cropH > aspectRatio) {
      cropW = cropH * aspectRatio
    } else {
      cropH = cropW / aspectRatio
    }
  }

  return {
    x: (imageWidth - cropW) / 2,
    y: (imageHeight - cropH) / 2,
    width: cropW,
    height: cropH
  }
}

/**
 * Perform canvas cropping and return the cropped canvas + dataUrl.
 * Note: Call canvas.toBlob() asynchronously in the component layer for the Blob.
 */
export function cropCanvas(
  image: HTMLImageElement,
  cropRect: CropRect,
  displayWidth: number,
  displayHeight: number,
  outputType: string = 'image/png',
  quality: number = 0.92
): { canvas: HTMLCanvasElement; dataUrl: string } {
  // Calculate the ratio between natural and displayed size
  const scaleX = image.naturalWidth / displayWidth
  const scaleY = image.naturalHeight / displayHeight

  const sx = cropRect.x * scaleX
  const sy = cropRect.y * scaleY
  const sw = cropRect.width * scaleX
  const sh = cropRect.height * scaleY

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(sw)
  canvas.height = Math.round(sh)

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  }

  const dataUrl = canvas.toDataURL(outputType, quality)
  return { canvas, dataUrl }
}

/**
 * Get touch distance for pinch-to-zoom
 */
export function getTouchDistance(touch1: Touch, touch2: Touch): number {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Convert a dimension value (number or string) to a CSS string
 */
export function toCSSSize(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}
