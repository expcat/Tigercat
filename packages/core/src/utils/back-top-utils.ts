/**
 * BackTop component utilities
 */

import type { BackTopPosition } from '../types/back-top'
import type { ViewportOffset, ViewportPlacement } from '../types/viewport'
import { classNames } from './class-names'
import { isBrowser } from './env'
import { overlayZIndexClass } from './floating'
import { getViewportOffsetStyle, viewportFloatingBaseClasses } from './viewport-floating-utils'

export type BackTopFrameCallback = (timestamp: number) => void

export type BackTopFrameRequest = (callback: BackTopFrameCallback) => number

export type BackTopFrameCancel = (handle: number) => void

export interface BackTopVisibilityControllerOptions {
  target: HTMLElement | Window
  getVisibilityHeight: () => number
  onChange: (visible: boolean) => void
  requestFrame?: BackTopFrameRequest
  cancelFrame?: BackTopFrameCancel
}

export interface BackTopVisibilityController {
  schedule: () => void
  update: () => void
  cancel: () => void
}

const DEFAULT_VISIBILITY_HEIGHT = 400

const BACK_TOP_PLACEMENT_CLASSES: Record<ViewportPlacement, string> = {
  'top-left': 'top-0 start-0',
  'top-right': 'top-0 end-0',
  'bottom-left': 'bottom-0 start-0',
  'bottom-right': 'bottom-0 end-0'
}

function isWindowTarget(target: HTMLElement | Window): target is Window {
  return isBrowser() && target === window
}

function requestDefaultFrame(callback: BackTopFrameCallback): number {
  if (globalThis.requestAnimationFrame) {
    return globalThis.requestAnimationFrame(callback)
  }

  return globalThis.setTimeout(() => callback(globalThis.performance?.now?.() ?? Date.now()), 16)
}

function cancelDefaultFrame(handle: number): void {
  if (globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame(handle)
    return
  }

  globalThis.clearTimeout(handle)
}

export function resolveBackTopVisibilityHeight(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_VISIBILITY_HEIGHT
}

export function resolveBackTopScrollBehavior(duration: number | undefined): ScrollBehavior {
  if (typeof duration === 'number' && Number.isFinite(duration) && duration <= 0) {
    return 'auto'
  }
  return 'smooth'
}

/**
 * Get the current scroll position of an element or window
 */
export function getScrollTop(target: HTMLElement | Window): number {
  if (isWindowTarget(target)) {
    return target.scrollY || 0
  }
  return (target as HTMLElement).scrollTop
}

export function shouldShowBackTop(
  target: HTMLElement | Window,
  visibilityHeight: number | undefined
): boolean {
  return getScrollTop(target) >= resolveBackTopVisibilityHeight(visibilityHeight)
}

/**
 * Scroll to top. `duration <= 0` is instant; any positive value is native smooth.
 */
export function scrollToTop(target: HTMLElement | Window, duration?: number): void {
  const behavior = resolveBackTopScrollBehavior(duration)

  if (isWindowTarget(target)) {
    target.scrollTo({ top: 0, behavior })
    return
  }

  if (typeof target.scrollTo === 'function') {
    target.scrollTo({ top: 0, behavior })
    return
  }

  target.scrollTop = 0
}

export function createBackTopVisibilityController(
  options: BackTopVisibilityControllerOptions
): BackTopVisibilityController {
  const requestFrame = options.requestFrame ?? requestDefaultFrame
  const cancelFrame = options.cancelFrame ?? cancelDefaultFrame
  let frameHandle: number | undefined

  const update = (): void => {
    frameHandle = undefined
    options.onChange(shouldShowBackTop(options.target, options.getVisibilityHeight()))
  }

  const schedule = (): void => {
    if (frameHandle !== undefined) return
    frameHandle = requestFrame(update)
  }

  const cancel = (): void => {
    if (frameHandle === undefined) return
    cancelFrame(frameHandle)
    frameHandle = undefined
  }

  return {
    schedule,
    update,
    cancel
  }
}

/**
 * Base CSS classes for the BackTop button (without positioning)
 */
export const backTopBaseClasses = `${overlayZIndexClass.viewport} tiger-motion-aware flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[var(--tiger-primary,#2563eb)] text-white shadow-lg transition-opacity duration-300 motion-reduce:duration-0 hover:bg-[var(--tiger-primary-hover,#1d4ed8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-offset-2`

export const backTopStickyClasses = `sticky bottom-4 ms-auto me-4 ${backTopBaseClasses}`

export const backTopHiddenClasses = 'opacity-0 pointer-events-none'

export const backTopVisibleClasses = 'opacity-100'

export const backTopIconPath = 'M12 19V5M12 5l-7 7M12 5l7 7'

export function getBackTopPositionClasses(options: {
  position?: BackTopPosition
  placement?: ViewportPlacement
}): string {
  const position = options.position ?? 'auto'
  const placement = options.placement ?? 'bottom-right'
  if (position === 'sticky') return backTopStickyClasses
  return classNames(
    viewportFloatingBaseClasses,
    BACK_TOP_PLACEMENT_CLASSES[placement],
    backTopBaseClasses
  )
}

export function getBackTopOffsetStyle(
  position: BackTopPosition | undefined,
  placement: ViewportPlacement | undefined,
  offset?: ViewportOffset
): Record<string, string> | undefined {
  if ((position ?? 'auto') === 'sticky') return undefined
  const physical = getViewportOffsetStyle(placement ?? 'bottom-right', offset)
  const style: Record<string, string> = {}
  if (physical.top) style.top = physical.top
  if (physical.bottom) style.bottom = physical.bottom
  if (physical.left) style.insetInlineStart = physical.left
  if (physical.right) style.insetInlineEnd = physical.right
  return style
}

export function getBackTopVisibilityClasses(visible: boolean): string {
  return visible ? backTopVisibleClasses : backTopHiddenClasses
}
