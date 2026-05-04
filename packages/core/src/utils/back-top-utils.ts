/**
 * BackTop component utilities
 */

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

function isWindowTarget(target: HTMLElement | Window): target is Window {
  return typeof window !== 'undefined' && target === window
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

/**
 * Get the current scroll position of an element or window
 */
export function getScrollTop(target: HTMLElement | Window): number {
  if (isWindowTarget(target)) {
    return target.scrollY || 0
  }
  return (target as HTMLElement).scrollTop
}

export function shouldShowBackTop(target: HTMLElement | Window, visibilityHeight: number): boolean {
  return getScrollTop(target) >= visibilityHeight
}

/**
 * Scroll to top using native browser smooth scrolling when enabled.
 */
export function scrollToTop(
  target: HTMLElement | Window,
  duration: number,
  callback?: () => void
): void {
  const behavior: ScrollBehavior = Number.isFinite(duration) && duration <= 0 ? 'auto' : 'smooth'

  if (isWindowTarget(target)) {
    target.scrollTo({ top: 0, behavior })
    callback?.()
    return
  }

  if (typeof target.scrollTo === 'function') {
    target.scrollTo({ top: 0, behavior })
  } else {
    target.scrollTop = 0
  }

  callback?.()
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
const baseClasses =
  'z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[var(--tiger-primary,#2563eb)] text-white shadow-lg transition-all duration-300 hover:bg-[var(--tiger-primary-hover,#1d4ed8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-offset-2'

/**
 * Default CSS classes for the BackTop button (fixed positioning for window target)
 */
export const backTopButtonClasses = `fixed bottom-8 right-8 ${baseClasses}`

/**
 * CSS classes for the BackTop button when using a custom scroll container (sticky positioning)
 * Should be placed inside the scroll container content to stay visible while scrolling
 */
export const backTopContainerClasses = `sticky bottom-4 ml-auto mr-4 ${baseClasses}`

/**
 * Default CSS classes for hidden state
 */
export const backTopHiddenClasses = 'opacity-0 pointer-events-none translate-y-4'

/**
 * Default CSS classes for visible state
 */
export const backTopVisibleClasses = 'opacity-100 translate-y-0'

/**
 * Default up arrow icon SVG path
 */
export const backTopIconPath = 'M12 19V5M12 5l-7 7M12 5l7 7'
