/**
 * ImageViewer component utilities
 * @since 0.9.0
 *
 * Chrome classes are aliases of the single ImagePreview set.
 */

import {
  clampScale,
  getTouchDistance,
  zoomInIconPath,
  zoomOutIconPath,
  prevIconPath,
  nextIconPath,
  previewCloseIconPath,
  imagePreviewWrapperClasses,
  imagePreviewImgClasses,
  imagePreviewToolbarClasses,
  imagePreviewToolbarBtnClasses,
  imagePreviewNavBtnClasses,
  imagePreviewCloseBtnClasses,
  imagePreviewCounterClasses
} from './image-utils'

export const imageViewerBackdropClasses = imagePreviewWrapperClasses
export const imageViewerImgClasses = imagePreviewImgClasses
export const imageViewerToolbarClasses = imagePreviewToolbarClasses
export const imageViewerToolbarBtnClasses = imagePreviewToolbarBtnClasses
export const imageViewerNavBtnClasses = imagePreviewNavBtnClasses
export const imageViewerCloseBtnClasses = imagePreviewCloseBtnClasses
export const imageViewerCounterClasses = imagePreviewCounterClasses

/**
 * SVG icon paths for ImageViewer.
 *
 * The shared paths (zoom/prev/next/close) reuse the single-source constants from
 * `image-utils`; only the rotate icons are unique to the viewer.
 */
export const imageViewerIcons = {
  zoomIn: zoomInIconPath,
  zoomOut: zoomOutIconPath,
  rotateLeft: 'M3 10h7V3M21 14h-7v7M16.7 7.3A8 8 0 004.1 9.9M7.3 16.7A8 8 0 0019.9 14.1',
  rotateRight: 'M14 10h7V3M10 14H3v7M7.3 7.3A8 8 0 0119.9 9.9M16.7 16.7A8 8 0 014.1 14.1',
  close: previewCloseIconPath,
  prev: prevIconPath,
  next: nextIconPath
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
  minScale: number
  maxScale: number
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
  return clampScale(currentScale + delta, options.minScale, options.maxScale)
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

// Pinch distance reuses the shared getTouchDistance from image-utils (single source).

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
    initialDistance: getTouchDistance(t1, t2),
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
  minScale: number,
  maxScale: number
): number {
  if (pinch.initialDistance === 0) return pinch.initialScale
  const currentDistance = getTouchDistance(t1, t2)
  const ratio = currentDistance / pinch.initialDistance
  return clampScale(pinch.initialScale * ratio, minScale, maxScale)
}
