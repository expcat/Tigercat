/**
 * ImageViewer component utilities
 * @since 0.9.0
 */

/**
 * ImageViewer backdrop classes
 */
export const imageViewerBackdropClasses =
  'fixed inset-0 bg-[var(--tiger-image-mask,rgba(0,0,0,0.85))] z-50 flex items-center justify-center'

/**
 * ImageViewer image classes
 */
export const imageViewerImgClasses =
  'max-h-[90vh] max-w-[90vw] select-none transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing touch-none'

/**
 * ImageViewer toolbar classes
 */
export const imageViewerToolbarClasses =
  'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[var(--tiger-surface,rgba(0,0,0,0.6))] backdrop-blur-sm rounded-[var(--tiger-radius-md,0.5rem)] px-4 py-2'

/**
 * ImageViewer toolbar button classes
 */
export const imageViewerToolbarBtnClasses =
  'p-2 text-white hover:bg-white/20 rounded-[var(--tiger-radius-md,0.5rem)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white'

/**
 * ImageViewer navigation button classes
 */
export const imageViewerNavBtnClasses =
  'fixed top-1/2 -translate-y-1/2 z-50 p-3 text-white bg-[var(--tiger-surface,rgba(0,0,0,0.4))] hover:bg-[var(--tiger-surface,rgba(0,0,0,0.6))] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white'

/**
 * ImageViewer close button classes
 */
export const imageViewerCloseBtnClasses =
  'fixed top-4 right-4 z-50 p-2 text-white hover:bg-white/20 rounded-[var(--tiger-radius-md,0.5rem)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white'

/**
 * ImageViewer counter classes
 */
export const imageViewerCounterClasses =
  'fixed top-4 left-1/2 -translate-x-1/2 z-50 text-white text-sm bg-[var(--tiger-surface,rgba(0,0,0,0.4))] rounded-full px-3 py-1'

/**
 * SVG icon paths for ImageViewer
 */
export const imageViewerIcons = {
  zoomIn: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7',
  zoomOut: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7',
  rotateLeft: 'M3 10h7V3M21 14h-7v7M16.7 7.3A8 8 0 004.1 9.9M7.3 16.7A8 8 0 0019.9 14.1',
  rotateRight: 'M14 10h7V3M10 14H3v7M7.3 7.3A8 8 0 0119.9 9.9M16.7 16.7A8 8 0 014.1 14.1',
  close: 'M6 18L18 6M6 6l12 12',
  prev: 'M15 19l-7-7 7-7',
  next: 'M9 5l7 7-7 7'
}

/**
 * Clamp zoom level within bounds
 */
export function clampZoom(zoom: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, zoom))
}

/**
 * Normalize rotation to 0-360 range
 */
export function normalizeRotation(rotation: number): number {
  return ((rotation % 360) + 360) % 360
}

// ─── Gesture types ────────────────────────────────────────────────

export interface GestureTransform {
  scale: number
  translateX: number
  translateY: number
  rotation: number
}

/**
 * Create a default gesture transform (1x scale, centered, no rotation).
 */
export function createDefaultTransform(): GestureTransform {
  return { scale: 1, translateX: 0, translateY: 0, rotation: 0 }
}

/**
 * Build a CSS transform string from a GestureTransform.
 */
export function getImageTransformStyle(t: GestureTransform): string {
  return `translate(${t.translateX}px, ${t.translateY}px) scale(${t.scale}) rotate(${t.rotation}deg)`
}

// ─── Wheel zoom ───────────────────────────────────────────────────

export interface WheelZoomOptions {
  minZoom: number
  maxZoom: number
  /** Zoom step per wheel delta (default 0.001) */
  step?: number
}

/**
 * Compute the new scale after a wheel event.
 */
export function applyWheelZoom(
  currentScale: number,
  deltaY: number,
  options: WheelZoomOptions
): number {
  const step = options.step ?? 0.001
  const delta = -deltaY * step
  return clampZoom(currentScale + delta, options.minZoom, options.maxZoom)
}

// ─── Pan (mouse drag) ─────────────────────────────────────────────

export interface PanState {
  isPanning: boolean
  startX: number
  startY: number
  startTranslateX: number
  startTranslateY: number
}

/**
 * Create a fresh pan state.
 */
export function createPanState(): PanState {
  return { isPanning: false, startX: 0, startY: 0, startTranslateX: 0, startTranslateY: 0 }
}

/**
 * Begin panning. Returns new PanState (isPanning = true).
 */
export function startPan(
  clientX: number,
  clientY: number,
  currentTranslateX: number,
  currentTranslateY: number
): PanState {
  return {
    isPanning: true,
    startX: clientX,
    startY: clientY,
    startTranslateX: currentTranslateX,
    startTranslateY: currentTranslateY
  }
}

export interface PanResult {
  translateX: number
  translateY: number
}

/**
 * Compute translate during a pan move.
 */
export function movePan(pan: PanState, clientX: number, clientY: number): PanResult {
  return {
    translateX: pan.startTranslateX + (clientX - pan.startX),
    translateY: pan.startTranslateY + (clientY - pan.startY)
  }
}

// ─── Pinch zoom (two-finger touch) ───────────────────────────────

// Note: image-utils.ts exports getTouchDistance(Touch, Touch).
// We use the same formula here but with a broader signature accepting
// any object with clientX/clientY (works for Touch, PointerEvent, etc.)

function touchDistance(
  t1: { clientX: number; clientY: number },
  t2: { clientX: number; clientY: number }
): number {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

export interface PinchState {
  isPinching: boolean
  initialDistance: number
  initialScale: number
}

/**
 * Create a fresh pinch state.
 */
export function createPinchState(): PinchState {
  return { isPinching: false, initialDistance: 0, initialScale: 1 }
}

/**
 * Begin a pinch gesture.
 */
export function startPinch(
  t1: { clientX: number; clientY: number },
  t2: { clientX: number; clientY: number },
  currentScale: number
): PinchState {
  return {
    isPinching: true,
    initialDistance: touchDistance(t1, t2),
    initialScale: currentScale
  }
}

/**
 * Compute the new scale during a pinch move.
 */
export function movePinch(
  pinch: PinchState,
  t1: { clientX: number; clientY: number },
  t2: { clientX: number; clientY: number },
  minZoom: number,
  maxZoom: number
): number {
  if (pinch.initialDistance === 0) return pinch.initialScale
  const currentDistance = touchDistance(t1, t2)
  const ratio = currentDistance / pinch.initialDistance
  return clampZoom(pinch.initialScale * ratio, minZoom, maxZoom)
}
