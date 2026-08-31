/**
 * Image component utilities
 * Shared styles and helpers for Image, ImagePreview, ImageCropper components
 */

import { classNames } from './class-names'
import { isBrowser } from './env'
import { overlayZIndexClass } from './floating'
import type {
  ImageFit,
  ImagePreviewTrigger,
  CropRect,
  CropHandle,
  PreviewNavState
} from '../types/image'

// ============================================================================
// Image component styles
// ============================================================================

/**
 * Inner frame: clips the bitmap. Preview focus ring lives on the outer host.
 */
export const imageBaseClasses = 'relative inline-block overflow-hidden'

/** Fills the preview host and clips the bitmap. */
export const imageFrameClasses = 'relative block h-full w-full overflow-hidden'

/**
 * Real preview control host. Ring is outside overflow-hidden via ring-offset.
 */
export const imagePreviewHostClasses =
  'relative inline-block p-0 m-0 border-0 bg-transparent appearance-none align-top text-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'

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
  'flex items-center justify-center w-full h-full bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text-secondary,#4b5563)]'

/**
 * In-flow loading placeholder (lazy, no src yet)
 */
export const imageLoadingClasses =
  'flex items-center justify-center w-full h-full bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text-secondary,#4b5563)]'

/**
 * Overlay on top of a bitmap that has not fired load
 */
export const imageLoadingOverlayClasses =
  'absolute inset-0 flex items-center justify-center bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text-secondary,#4b5563)]'

/**
 * Cursor class when preview is enabled
 */
export const imagePreviewCursorClass = 'cursor-pointer'

export function resolveImagePreviewEnabled(preview: boolean, groupPreview?: boolean): boolean {
  if (groupPreview === false) return false
  return preview
}

export function isImageHoverPreviewEnabled(
  previewEnabled: boolean,
  previewTrigger: ImagePreviewTrigger,
  inGroup: boolean
): boolean {
  return previewEnabled && previewTrigger === 'hover' && !inGroup
}

export function resolveImageHoverPlacement(direction?: string): 'left' | 'right' {
  return direction === 'rtl' ? 'left' : 'right'
}

export function formatImagePreviewAriaLabel(
  template: string,
  alt: string | undefined,
  fallbackAlt: string
): string {
  const name = alt?.trim() ? alt.trim() : fallbackAlt
  return template.replace('{alt}', name)
}

export interface ImageLoadState {
  actualSrc: string
  error: boolean
  loading: boolean
}

export function createImageLoadState(src: string | undefined, lazy: boolean): ImageLoadState {
  return {
    actualSrc: lazy ? '' : (src ?? ''),
    error: false,
    loading: true
  }
}

export function resetImageLoadState(
  src: string | undefined,
  lazy: boolean,
  inView: boolean
): ImageLoadState {
  const shouldLoad = !lazy || inView
  return {
    actualSrc: shouldLoad ? (src ?? '') : '',
    error: false,
    loading: true
  }
}

export function applyImageLoadSuccess(state: ImageLoadState): ImageLoadState {
  return { ...state, error: false, loading: false }
}

export function applyImageLoadError(
  state: ImageLoadState,
  fallbackSrc: string | undefined
): ImageLoadState {
  if (fallbackSrc && state.actualSrc !== fallbackSrc) {
    return { actualSrc: fallbackSrc, error: false, loading: true }
  }
  return { ...state, error: true, loading: false }
}

export function resolveImagePreviewSrc(state: ImageLoadState, src?: string): string | undefined {
  if (state.error) return undefined
  return state.actualSrc || src
}

// ============================================================================
// SVG icon path data for image-related icons
// ============================================================================

/** Broken image icon path (used in error state) */
export const imageErrorIconPath =
  'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'

/** Spinner arc path (loading, not the broken-image icon) */
export const imageLoadingSpinnerPath =
  'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'

export const imageLoadingSpinnerClasses = 'w-8 h-8 animate-spin'

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
 * Preview mask/backdrop classes (fills the dialog root).
 */
export const imagePreviewMaskClasses = 'absolute inset-0 bg-black/85'

/**
 * Preview wrapper classes (full screen container, modal stacking).
 */
export const imagePreviewWrapperClasses = `fixed inset-0 flex items-center justify-center select-none ${overlayZIndexClass.modal}`

/**
 * Preview image classes. Motion duration is added only when not dragging.
 */
export const imagePreviewImgClasses =
  'max-h-[90vh] max-w-[90vw] select-none cursor-grab active:cursor-grabbing touch-none'

/** Applied while the bitmap is not being panned or pinched. */
export const imagePreviewImgMotionClasses = 'transition-transform duration-150 ease-out'

/**
 * Preview toolbar classes
 */
export const imagePreviewToolbarClasses =
  'absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 text-white'

/**
 * Preview toolbar button classes
 */
export const imagePreviewToolbarBtnClasses =
  'flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-40 disabled:cursor-not-allowed'

/**
 * Preview navigation button classes (prev/next)
 */
export const imagePreviewNavBtnClasses =
  'absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-40 disabled:cursor-not-allowed'

export const imagePreviewNavPrevClasses = classNames(
  imagePreviewNavBtnClasses,
  'inset-inline-start-4'
)

export const imagePreviewNavNextClasses = classNames(
  imagePreviewNavBtnClasses,
  'inset-inline-end-4'
)

/**
 * Preview close button classes
 */
export const imagePreviewCloseBtnClasses =
  'absolute top-4 inset-inline-end-4 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50'

/**
 * Preview counter text classes
 */
export const imagePreviewCounterClasses = 'text-sm text-white/80 mx-2 tabular-nums'

// ============================================================================
// ImageCropper styles
// ============================================================================

const CROPPER_STYLE_ID = 'tiger-image-cropper-styles'

const CROPPER_CSS = `.tiger-image-cropper-checkerboard {
  background-color: var(--tiger-surface, #ffffff);
  background-image:
    linear-gradient(45deg, var(--tiger-surface-muted, #e5e7eb) 25%, transparent 25%),
    linear-gradient(-45deg, var(--tiger-surface-muted, #e5e7eb) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--tiger-surface-muted, #e5e7eb) 75%),
    linear-gradient(-45deg, transparent 75%, var(--tiger-surface-muted, #e5e7eb) 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}`

/**
 * Inject checkerboard rules if the style node is missing. Presence in the
 * document is the only guard — a sticky module flag would skip re-inject
 * after the node is removed.
 */
export function injectImageCropperStyles(): void {
  if (!isBrowser()) return
  if (document.getElementById(CROPPER_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = CROPPER_STYLE_ID
  style.textContent = CROPPER_CSS
  document.head.appendChild(style)
}

/**
 * Cropper container classes. Overflow clip lives on the bitmap frame so
 * handles and their focus rings stay visible at 0/100%.
 */
export const imageCropperContainerClasses =
  'relative select-none touch-none rounded-[var(--tiger-radius-lg,0.75rem)] shadow-inner border border-[var(--tiger-border,#e5e7eb)] tiger-image-cropper-checkerboard'

/** Bitmap + mask clip layer */
export const imageCropperFrameClasses = 'relative overflow-hidden'

/**
 * Cropper image classes (the source image)
 */
export const imageCropperImgClasses = 'absolute top-0 left-0 max-w-none pointer-events-none'

/**
 * Cropper mask overlay classes (semi-transparent overlay outside crop area)
 */
export const imageCropperMaskClasses = 'absolute inset-0 pointer-events-none'

/** SVG mask fill — a fixed overlay, not a theme token that is never written */
export const IMAGE_CROPPER_MASK_FILL = 'rgba(0,0,0,0.55)'

/**
 * Cropper selection border classes (the crop box border)
 */
export const imageCropperSelectionClasses =
  'absolute border-2 border-white pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.4)]'

/**
 * Cropper guide line classes
 */
export const imageCropperGuideClasses = 'absolute border-white/25 pointer-events-none opacity-40'

/**
 * Cropper drag area classes (inside the crop box, handles moving)
 */
export const imageCropperDragAreaClasses =
  'absolute cursor-move outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'

const CROPPER_HANDLE_CURSORS: Record<CropHandle, string> = {
  nw: 'cursor-nw-resize',
  n: 'cursor-n-resize',
  ne: 'cursor-ne-resize',
  e: 'cursor-e-resize',
  se: 'cursor-se-resize',
  s: 'cursor-s-resize',
  sw: 'cursor-sw-resize',
  w: 'cursor-w-resize'
}

/**
 * Get classes for a resize handle. Position is applied via
 * {@link getCropperHandleStyle} so the knob center sits on the edge.
 */
export function getCropperHandleClasses(handle: CropHandle): string {
  return classNames(
    'absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-[var(--tiger-primary,#2563eb)] shadow-md hover:scale-125 hover:bg-[var(--tiger-primary,#2563eb)] hover:border-white transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]',
    CROPPER_HANDLE_CURSORS[handle]
  )
}

/**
 * Place a handle so its center sits on the matching crop-rect edge.
 */
export function getCropperHandleStyle(handle: CropHandle, rect: CropRect): Record<string, string> {
  let x = rect.x + rect.width / 2
  let y = rect.y + rect.height / 2
  if (handle.includes('w')) x = rect.x
  if (handle.includes('e')) x = rect.x + rect.width
  if (handle.includes('n')) y = rect.y
  if (handle.includes('s')) y = rect.y + rect.height
  return {
    top: `${y}px`,
    left: `${x}px`,
    transform: 'translate(-50%, -50%)'
  }
}

/**
 * All 8 crop handles
 */
export const CROP_HANDLES: CropHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

export function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

// ============================================================================
// CropUpload styles
// ============================================================================

/**
 * CropUpload trigger button classes
 */
export const cropUploadTriggerClasses =
  'inline-flex items-center justify-center gap-2.5 px-5 py-2.5 border-2 border-dashed border-[var(--tiger-border,#d1d5db)] rounded-[var(--tiger-radius-lg,0.75rem)] text-[var(--tiger-text-secondary,#4b5563)] bg-[var(--tiger-surface-muted,#f9fafb)] hover:bg-[var(--tiger-surface,#ffffff)] hover:border-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary,#2563eb)] hover:scale-[1.02] active:scale-[0.98] hover:shadow-md transition-all duration-300 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-2 dark:bg-neutral-900 dark:hover:bg-neutral-800'

/**
 * CropUpload disabled trigger classes
 */
export const cropUploadTriggerDisabledClasses =
  'inline-flex items-center justify-center gap-2.5 px-5 py-2.5 border-2 border-dashed border-[var(--tiger-border,#d1d5db)] rounded-[var(--tiger-radius-lg,0.75rem)] text-[var(--tiger-text-disabled,#9ca3af)] bg-[var(--tiger-surface-muted,#f9fafb)] cursor-not-allowed opacity-60 dark:bg-neutral-900/50'

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
 * Get navigation state for multi-image preview. Index is clamped first.
 */
export function getPreviewNavState(currentIndex: number, total: number): PreviewNavState {
  if (total <= 0) {
    return { hasPrev: false, hasNext: false, counter: '' }
  }
  const index = Number.isFinite(currentIndex)
    ? Math.min(Math.max(0, Math.floor(currentIndex)), total - 1)
    : 0
  return {
    hasPrev: index > 0,
    hasNext: index < total - 1,
    counter: total > 1 ? `${index + 1} / ${total}` : ''
  }
}

/**
 * Constrain a crop rect to stay within image bounds, optionally enforcing
 * aspect ratio and minimum size. When the image is smaller than minW/minH,
 * the rect is clamped to the image — min cannot exceed the bitmap.
 */
export function constrainCropRect(
  rect: CropRect,
  imageWidth: number,
  imageHeight: number,
  aspectRatio?: number,
  minW = 0,
  minH = 0
): CropRect {
  const maxW = isPositiveFinite(imageWidth) ? imageWidth : 0
  const maxH = isPositiveFinite(imageHeight) ? imageHeight : 0
  const minWidth = Math.min(Math.max(minW, 0), maxW)
  const minHeight = Math.min(Math.max(minH, 0), maxH)

  let { x, y, width, height } = rect
  width = Math.min(Math.max(width, minWidth), maxW)
  height = Math.min(Math.max(height, minHeight), maxH)

  if (aspectRatio && aspectRatio > 0 && height > 0) {
    const currentRatio = width / height
    if (currentRatio > aspectRatio) {
      width = height * aspectRatio
    } else {
      height = width / aspectRatio
    }
    width = Math.min(width, maxW)
    height = Math.min(height, maxH)
    if (width / height > aspectRatio) {
      width = height * aspectRatio
    } else {
      height = width / aspectRatio
    }
  }

  x = Math.max(0, Math.min(x, maxW - width))
  y = Math.max(0, Math.min(y, maxH - height))

  return { x, y, width, height }
}

/**
 * Resize a crop rect by dragging a handle. Aspect-locked resizes keep the
 * opposite edge/corner fixed (nw locks se, e locks the west edge).
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
  const startLeft = rect.x
  const startTop = rect.y
  const startRight = rect.x + rect.width
  const startBottom = rect.y + rect.height

  let left = startLeft
  let top = startTop
  let right = startRight
  let bottom = startBottom

  if (handle.includes('w')) left += dx
  if (handle.includes('e')) right += dx
  if (handle.includes('n')) top += dy
  if (handle.includes('s')) bottom += dy

  const lockLeft = !handle.includes('w')
  const lockTop = !handle.includes('n')
  const maxW = Math.min(Math.max(minW, 0), imageWidth)
  const maxH = Math.min(Math.max(minH, 0), imageHeight)

  if (right - left < maxW) {
    if (lockLeft) right = left + maxW
    else left = right - maxW
  }
  if (bottom - top < maxH) {
    if (lockTop) bottom = top + maxH
    else top = bottom - maxH
  }

  if (aspectRatio && aspectRatio > 0) {
    let width = right - left
    let height = bottom - top
    const horizontalOnly =
      (handle === 'e' || handle === 'w') && !handle.includes('n') && !handle.includes('s')
    const verticalOnly = handle === 'n' || handle === 's'

    if (verticalOnly) {
      width = height * aspectRatio
      const cx = (startLeft + startRight) / 2
      left = cx - width / 2
      right = left + width
    } else if (horizontalOnly) {
      height = width / aspectRatio
      const cy = (startTop + startBottom) / 2
      top = cy - height / 2
      bottom = top + height
    } else {
      width = height * aspectRatio
      if (lockLeft) right = left + width
      else left = right - width
    }
  }

  return constrainCropRect(
    { x: left, y: top, width: right - left, height: bottom - top },
    imageWidth,
    imageHeight,
    aspectRatio,
    minW,
    minH
  )
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
  aspectRatio?: number,
  minW = 20,
  minH = 20
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

  return constrainCropRect(
    {
      x: (imageWidth - cropW) / 2,
      y: (imageHeight - cropH) / 2,
      width: cropW,
      height: cropH
    },
    imageWidth,
    imageHeight,
    aspectRatio,
    minW,
    minH
  )
}

/**
 * Fit a natural-size bitmap into a container without upscaling.
 */
export function getCropperDisplaySize(
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number,
  containerHeight: number
): { width: number; height: number } | null {
  if (!isPositiveFinite(naturalWidth) || !isPositiveFinite(naturalHeight)) return null
  const containerW = isPositiveFinite(containerWidth) ? containerWidth : naturalWidth
  const containerH = isPositiveFinite(containerHeight) ? containerHeight : 400
  const ratio = Math.min(containerW / naturalWidth, containerH / naturalHeight, 1)
  const width = naturalWidth * ratio
  const height = naturalHeight * ratio
  if (!isPositiveFinite(ratio) || !isPositiveFinite(width) || !isPositiveFinite(height)) return null
  return { width, height }
}

/**
 * Map a crop rect from one display size to another.
 */
export function remapCropRect(
  rect: CropRect,
  fromWidth: number,
  fromHeight: number,
  toWidth: number,
  toHeight: number,
  aspectRatio?: number,
  minW?: number,
  minH?: number
): CropRect {
  if (!isPositiveFinite(fromWidth) || !isPositiveFinite(fromHeight)) {
    return getInitialCropRect(toWidth, toHeight, aspectRatio, minW, minH)
  }
  const scaleX = toWidth / fromWidth
  const scaleY = toHeight / fromHeight
  return constrainCropRect(
    {
      x: rect.x * scaleX,
      y: rect.y * scaleY,
      width: rect.width * scaleX,
      height: rect.height * scaleY
    },
    toWidth,
    toHeight,
    aspectRatio,
    minW,
    minH
  )
}

export interface CropperImageLoader {
  load: (
    src: string,
    callbacks: {
      onLoad: (image: HTMLImageElement, naturalWidth: number, naturalHeight: number) => void
      onError: () => void
    }
  ) => void
  dispose: () => void
}

/**
 * Load an image for crop geometry. Does not set CORS — display is a separate
 * `<img>`. Changing `src` aborts the previous load.
 */
export function createCropperImageLoader(): CropperImageLoader {
  let generation = 0
  let current: HTMLImageElement | null = null

  const dispose = (): void => {
    generation += 1
    if (current) {
      current.onload = null
      current.onerror = null
      current = null
    }
  }

  return {
    load(src, callbacks) {
      dispose()
      const gen = generation
      if (!src || !isBrowser()) {
        callbacks.onError()
        return
      }
      const img = new window.Image()
      current = img
      img.onload = () => {
        if (gen !== generation) return
        const naturalWidth = img.naturalWidth
        const naturalHeight = img.naturalHeight
        if (!isPositiveFinite(naturalWidth) || !isPositiveFinite(naturalHeight)) {
          callbacks.onError()
          return
        }
        callbacks.onLoad(img, naturalWidth, naturalHeight)
      }
      img.onerror = () => {
        if (gen !== generation) return
        callbacks.onError()
      }
      img.src = src
    },
    dispose
  }
}

export function formatCropperResizeAriaLabel(template: string, handleName: string): string {
  return template.replace('{handle}', handleName)
}

const CROPPER_HANDLE_LABEL_KEYS: Record<CropHandle, string> = {
  nw: 'resizeHandleNw',
  n: 'resizeHandleN',
  ne: 'resizeHandleNe',
  e: 'resizeHandleE',
  se: 'resizeHandleSe',
  s: 'resizeHandleS',
  sw: 'resizeHandleSw',
  w: 'resizeHandleW'
}

export function getCropperHandleName(handle: CropHandle, labels: Record<string, string>): string {
  return labels[CROPPER_HANDLE_LABEL_KEYS[handle]] ?? handle
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
  if (!isBrowser()) {
    throw new Error('Image canvas cropping is only available in the browser')
  }
  if (
    !isPositiveFinite(displayWidth) ||
    !isPositiveFinite(displayHeight) ||
    !isPositiveFinite(cropRect.width) ||
    !isPositiveFinite(cropRect.height)
  ) {
    throw new Error('Image canvas cropping requires a finite display size and crop rect')
  }

  const scaleX = image.naturalWidth / displayWidth
  const scaleY = image.naturalHeight / displayHeight
  if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY) || scaleX <= 0 || scaleY <= 0) {
    throw new Error('Image canvas cropping requires a finite scale')
  }

  const sx = cropRect.x * scaleX
  const sy = cropRect.y * scaleY
  const sw = cropRect.width * scaleX
  const sh = cropRect.height * scaleY

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(sw)
  canvas.height = Math.round(sh)
  if (canvas.width <= 0 || canvas.height <= 0) {
    throw new Error('Image canvas cropping produced an empty canvas')
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Image canvas cropping is unavailable without a 2D context')
  }
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

  const dataUrl = canvas.toDataURL(outputType, quality)
  return { canvas, dataUrl }
}

/** Minimal touch-point shape for distance calculations. */
export interface TouchPoint {
  clientX: number
  clientY: number
}

/**
 * Get the distance between two touch points for pinch-to-zoom.
 *
 * Accepts any object with `clientX`/`clientY` (native `Touch`, `PointerEvent`,
 * synthetic points, etc.) so it can back every pinch implementation.
 */
export function getTouchDistance(touch1: TouchPoint, touch2: TouchPoint): number {
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
