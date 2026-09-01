/**
 * Shared fullscreen lightbox: gallery resolution, index clamp, keyboard,
 * swipe, and pointer pan/pinch. Vue/React only bind DOM.
 */

import { isBrowser } from './env'
import { clampScale } from './image-utils'
import {
  createPanState,
  createPinchState,
  movePan,
  movePinch,
  startPan,
  startPinch,
  type PanState,
  type PinchState
} from './image-viewer-utils'
import type { ImageLightboxItem, PreviewNavState } from '../types/image'

export const LIGHTBOX_MIN_SCALE = 0.25
export const LIGHTBOX_MAX_SCALE = 5
export const LIGHTBOX_SCALE_STEP = 0.5
export const LIGHTBOX_SWIPE_THRESHOLD = 48

export interface ResolvedLightboxImage {
  src: string
  alt?: string
}

export function resolveLightboxImages(
  images: readonly ImageLightboxItem[] | undefined
): ResolvedLightboxImage[] {
  if (!images?.length) return []
  return images.map((item) =>
    typeof item === 'string' ? { src: item } : { src: item.src, alt: item.alt }
  )
}

export function clampLightboxIndex(index: number, length: number): number {
  if (length <= 0) return 0
  if (!Number.isFinite(index)) return 0
  return Math.min(Math.max(0, Math.floor(index)), length - 1)
}

export function lightboxShouldClose(open: boolean, length: number): boolean {
  return open && length === 0
}

export function getLightboxNavState(currentIndex: number, total: number): PreviewNavState {
  if (total <= 0) {
    return { hasPrev: false, hasNext: false, counter: '' }
  }
  const index = clampLightboxIndex(currentIndex, total)
  return {
    hasPrev: index > 0,
    hasNext: index < total - 1,
    counter: total > 1 ? `${index + 1} / ${total}` : ''
  }
}

export function formatLightboxImageAlt(
  item: ResolvedLightboxImage | undefined,
  index: number,
  total: number,
  template: string
): string {
  if (!item) return ''
  if (item.alt !== undefined) return item.alt
  return template.replace(/\{index\}/g, String(index + 1)).replace(/\{total\}/g, String(total))
}

export function resolveLightboxScaleRange(input: {
  minScale?: number
  maxScale?: number
  minZoom?: number
  maxZoom?: number
}): { minScale: number; maxScale: number } {
  const minScale = input.minScale ?? input.minZoom ?? LIGHTBOX_MIN_SCALE
  const maxScale = input.maxScale ?? input.maxZoom ?? LIGHTBOX_MAX_SCALE
  return { minScale, maxScale }
}

export type LightboxSwipeDirection = 'prev' | 'next'

export function resolveLightboxSwipe(
  deltaX: number,
  deltaY: number,
  threshold: number
): LightboxSwipeDirection | null {
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)
  if (absX < Math.max(0, threshold) || absX <= absY * 1.2) return null
  return deltaX < 0 ? 'next' : 'prev'
}

export function resolveLightboxNavIndex(
  current: number,
  total: number,
  direction: LightboxSwipeDirection
): number | null {
  if (total <= 1) return null
  const index = clampLightboxIndex(current, total)
  if (direction === 'prev') return index > 0 ? index - 1 : null
  return index < total - 1 ? index + 1 : null
}

export type LightboxKeyAction =
  'prev' | 'next' | 'zoomIn' | 'zoomOut' | 'rotateLeft' | 'rotateRight' | 'reset'

export function resolveLightboxKeyAction(
  key: string,
  options: {
    canNavigate: boolean
    zoomable: boolean
    rotatable: boolean
    rtl?: boolean
  }
): LightboxKeyAction | null {
  switch (key) {
    case 'ArrowLeft':
      if (!options.canNavigate) return null
      return options.rtl ? 'next' : 'prev'
    case 'ArrowRight':
      if (!options.canNavigate) return null
      return options.rtl ? 'prev' : 'next'
    case '+':
    case '=':
      return options.zoomable ? 'zoomIn' : null
    case '-':
    case '_':
      return options.zoomable ? 'zoomOut' : null
    case '[':
      return options.rotatable ? 'rotateLeft' : null
    case ']':
      return options.rotatable ? 'rotateRight' : null
    case '0':
      return options.zoomable ? 'reset' : null
    default:
      return null
  }
}

export interface LightboxGesturePoint {
  clientX: number
  clientY: number
}

export interface LightboxGestureSessionOptions {
  getScale: () => number
  getTranslate: () => { x: number; y: number }
  minScale: number
  maxScale: number
  zoomable: boolean
  swipeable: boolean
  swipeThreshold: number
  imageCount: number
  onTransform: (next: { scale?: number; translateX?: number; translateY?: number }) => void
  onSwipe: (direction: LightboxSwipeDirection) => void
  onDraggingChange?: (dragging: boolean) => void
  ownerDocument?: Document
}

export interface LightboxGestureSession {
  pointerDown(event: PointerEvent): void
  dispose(): void
}

function toGesturePoint(event: PointerEvent): LightboxGesturePoint {
  return { clientX: event.clientX, clientY: event.clientY }
}

function isPrimaryPointer(event: PointerEvent): boolean {
  if (event.pointerType === 'mouse') return event.button === 0
  return event.isPrimary !== false
}

export function createLightboxGestureSession(
  options: LightboxGestureSessionOptions
): LightboxGestureSession {
  const ownerDocument = options.ownerDocument ?? (isBrowser() ? document : undefined)
  const pointers = new Map<number, LightboxGesturePoint>()
  let pan: PanState = createPanState()
  let pinch: PinchState = createPinchState()
  let swipe = {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  }
  let listening = false
  let disposed = false

  const setDragging = (next: boolean) => {
    options.onDraggingChange?.(next)
  }

  const resetGestures = () => {
    pan = createPanState()
    pinch = createPinchState()
    swipe.active = false
    setDragging(false)
  }

  const pointerList = (): LightboxGesturePoint[] => [...pointers.values()]

  const handlePointerMove = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return
    pointers.set(event.pointerId, toGesturePoint(event))

    if (pinch.isPinching && pointers.size >= 2) {
      const [first, second] = pointerList()
      if (!first || !second) return
      event.preventDefault()
      options.onTransform({
        scale: movePinch(pinch, first, second, options.minScale, options.maxScale)
      })
      return
    }

    if (pan.isPanning) {
      event.preventDefault()
      const next = movePan(pan, event.clientX, event.clientY)
      options.onTransform({ translateX: next.translateX, translateY: next.translateY })
      return
    }

    if (swipe.active) {
      swipe.currentX = event.clientX
      swipe.currentY = event.clientY
      const deltaX = event.clientX - swipe.startX
      const deltaY = event.clientY - swipe.startY
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        event.preventDefault()
      }
    }
  }

  const endPointer = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return
    pointers.delete(event.pointerId)

    if (swipe.active && pointers.size === 0) {
      const direction = resolveLightboxSwipe(
        event.clientX - swipe.startX,
        event.clientY - swipe.startY,
        options.swipeThreshold
      )
      swipe.active = false
      if (direction) options.onSwipe(direction)
    }

    if (pointers.size < 2) pinch = createPinchState()
    if (pointers.size === 0) {
      pan = createPanState()
      swipe.active = false
      setDragging(false)
      detach()
    }
  }

  const handlePointerUp = (event: PointerEvent) => {
    endPointer(event)
  }

  const handlePointerCancel = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return
    pointers.delete(event.pointerId)
    if (pointers.size < 2) pinch = createPinchState()
    if (pointers.size === 0) {
      resetGestures()
      detach()
    }
  }

  const attach = () => {
    if (!ownerDocument || listening) return
    listening = true
    ownerDocument.addEventListener('pointermove', handlePointerMove)
    ownerDocument.addEventListener('pointerup', handlePointerUp)
    ownerDocument.addEventListener('pointercancel', handlePointerCancel)
  }

  const detach = () => {
    if (!ownerDocument || !listening) return
    listening = false
    ownerDocument.removeEventListener('pointermove', handlePointerMove)
    ownerDocument.removeEventListener('pointerup', handlePointerUp)
    ownerDocument.removeEventListener('pointercancel', handlePointerCancel)
  }

  return {
    pointerDown(event: PointerEvent) {
      if (disposed) return
      if (event.defaultPrevented) return
      if (event.pointerType === 'mouse' && !isPrimaryPointer(event)) return

      event.preventDefault()
      pointers.set(event.pointerId, toGesturePoint(event))
      const target = event.currentTarget
      if (target instanceof Element && typeof target.setPointerCapture === 'function') {
        try {
          target.setPointerCapture(event.pointerId)
        } catch {
          // Not connected (tests / SSR).
        }
      }
      attach()

      if (pointers.size === 2 && options.zoomable) {
        swipe.active = false
        pan = createPanState()
        const [first, second] = pointerList()
        if (first && second) {
          pinch = startPinch(first, second, options.getScale())
          setDragging(true)
        }
        return
      }

      if (pointers.size !== 1) return

      if (options.swipeable && options.imageCount > 1 && options.getScale() === 1) {
        swipe = {
          active: true,
          startX: event.clientX,
          startY: event.clientY,
          currentX: event.clientX,
          currentY: event.clientY
        }
        pan = createPanState()
        return
      }

      swipe.active = false
      const translate = options.getTranslate()
      pan = startPan(event.clientX, event.clientY, translate.x, translate.y)
      setDragging(true)
    },
    dispose() {
      if (disposed) return
      disposed = true
      pointers.clear()
      resetGestures()
      detach()
    }
  }
}

export function clampLightboxScale(scale: number, minScale: number, maxScale: number): number {
  return clampScale(scale, minScale, maxScale)
}
