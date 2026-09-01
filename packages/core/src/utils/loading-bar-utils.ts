/**
 * LoadingBar utilities
 *
 * Framework-agnostic class builders, percentage math, mount-target
 * resolution, and the trickle controller used by Vue/React hosts.
 */

import type {
  LoadingBarColor,
  LoadingBarContainerProps,
  LoadingBarOptions,
  LoadingBarStatus
} from '../types/loading-bar'
import { classNames } from './class-names'
import { isBrowser } from './env'
import { overlayZIndexClass } from './floating'
import { resolveImperativeMountTarget } from './imperative-host'
import { getLoadingLabel } from './locale-utils'
import { prefersReducedMotion } from './transition'

export const DEFAULT_LOADING_BAR_HEIGHT = 2
export const DEFAULT_LOADING_BAR_COLOR: LoadingBarColor = 'primary'
export const DEFAULT_LOADING_BAR_ARIA_LABEL = 'Loading...'
export const LOADING_BAR_START_PERCENTAGE = 8
export const LOADING_BAR_MAX_TRICKLE_PERCENTAGE = 94
export const LOADING_BAR_TRICKLE_INTERVAL_MS = 200
export const LOADING_BAR_FINISH_HIDE_DELAY_MS = 300

export const loadingBarContainerBaseClasses = `fixed top-0 inset-inline-0 ${overlayZIndexClass.loadingBar} pointer-events-none overflow-hidden`

export const loadingBarFillBaseClasses =
  'block w-full origin-left rtl:origin-right tiger-motion-aware transition-transform duration-200 ease-out motion-reduce:transition-none'

export const loadingBarColorClasses: Record<LoadingBarColor, string> = {
  primary: 'bg-[color:var(--tiger-primary,#2563eb)]',
  success: 'bg-[color:var(--tiger-success,#16a34a)]',
  warning: 'bg-[color:var(--tiger-warning,#f59e0b)]',
  danger: 'bg-[color:var(--tiger-error,#dc2626)]',
  info: 'bg-[color:var(--tiger-info,#0ea5e9)]'
}

export interface LoadingBarRuntimeState extends Required<
  Pick<LoadingBarContainerProps, 'percentage' | 'status' | 'color' | 'height'>
> {
  visible: boolean
  className?: string
  style?: Record<string, string | number>
  ariaLabel?: string
  container?: string | HTMLElement
  startedCount: number
}

export function createInitialLoadingBarState(): LoadingBarRuntimeState {
  return {
    visible: false,
    percentage: 0,
    status: 'idle',
    color: DEFAULT_LOADING_BAR_COLOR,
    height: DEFAULT_LOADING_BAR_HEIGHT,
    startedCount: 0
  }
}

export function clampLoadingBarPercentage(percentage: number): number {
  if (!Number.isFinite(percentage)) return 0
  return Math.max(0, Math.min(100, percentage))
}

export function getLoadingBarProgressValue(percentage: number): number {
  return Math.round(clampLoadingBarPercentage(percentage))
}

export function resolveLoadingBarColor(color?: LoadingBarColor): LoadingBarColor {
  if (color && color in loadingBarColorClasses) return color
  return DEFAULT_LOADING_BAR_COLOR
}

export function resolveLoadingBarHeight(height?: number): number {
  if (typeof height !== 'number' || !Number.isFinite(height) || height <= 0) {
    return DEFAULT_LOADING_BAR_HEIGHT
  }
  return height
}

export function resolveLoadingBarFillColor(
  status: LoadingBarStatus,
  color?: LoadingBarColor
): LoadingBarColor {
  if (status === 'error') return 'danger'
  return resolveLoadingBarColor(color)
}

export function resolveLoadingBarAriaLabel(
  ariaLabel?: string,
  locale?: { common?: { loadingText?: string } }
): string {
  return getLoadingLabel(locale, ariaLabel?.trim())
}

export function getLoadingBarColorClasses(color: LoadingBarColor): string {
  return loadingBarColorClasses[resolveLoadingBarColor(color)]
}

export function getLoadingBarContainerClasses(className?: string): string {
  return classNames(loadingBarContainerBaseClasses, className)
}

export function getLoadingBarFillClasses(
  status: LoadingBarStatus,
  color?: LoadingBarColor
): string {
  return classNames(
    loadingBarFillBaseClasses,
    getLoadingBarColorClasses(resolveLoadingBarFillColor(status, color))
  )
}

export function getLoadingBarFillStyle(
  percentage: number,
  height?: number
): Record<string, string> {
  return {
    transform: `scaleX(${clampLoadingBarPercentage(percentage) / 100})`,
    height: `${resolveLoadingBarHeight(height)}px`
  }
}

/**
 * Deterministic nprogress-like increment. Caps below 100 so `finish`/`error`
 * are the only paths that complete the bar.
 */
export function nextLoadingBarTricklePercentage(
  current: number,
  random: () => number = Math.random
): number {
  const clamped = clampLoadingBarPercentage(current)
  if (clamped >= LOADING_BAR_MAX_TRICKLE_PERCENTAGE) {
    return LOADING_BAR_MAX_TRICKLE_PERCENTAGE
  }

  const remaining = LOADING_BAR_MAX_TRICKLE_PERCENTAGE - clamped
  const rawSample = random()
  const sample = Number.isFinite(rawSample) ? Math.min(1, Math.max(0, rawSample)) : 0.5
  const step = Math.max(0.5, remaining * 0.08 * (0.4 + sample))
  return Math.min(LOADING_BAR_MAX_TRICKLE_PERCENTAGE, clamped + step)
}

export function resolveLoadingBarMountTarget(container?: string | HTMLElement): HTMLElement | null {
  return resolveImperativeMountTarget(container)
}

export type LoadingBarTimeoutId = ReturnType<typeof setTimeout>

export interface LoadingBarTimerHooks {
  setTimeout?: (handler: () => void, timeout: number) => LoadingBarTimeoutId
  clearTimeout?: (id: LoadingBarTimeoutId) => void
  prefersReducedMotion?: () => boolean
}

export interface LoadingBarController {
  getState: () => LoadingBarRuntimeState
  start: (options?: LoadingBarOptions) => void
  set: (percentage: number) => void
  inc: (delta?: number) => void
  finish: () => void
  error: () => void
  clear: () => void
  subscribe: (listener: () => void) => () => void
}

function mergeStartOptions(
  state: LoadingBarRuntimeState,
  options: LoadingBarOptions | undefined
): LoadingBarRuntimeState {
  return {
    ...state,
    color: resolveLoadingBarColor(options?.color ?? state.color),
    height: resolveLoadingBarHeight(options?.height ?? state.height),
    className: options?.className ?? state.className,
    style: options?.style ?? state.style,
    ariaLabel: options?.ariaLabel ?? state.ariaLabel,
    container: options?.container ?? state.container
  }
}

export function createLoadingBarController(hooks: LoadingBarTimerHooks = {}): LoadingBarController {
  let state = createInitialLoadingBarState()
  const listeners = new Set<() => void>()
  let trickleTimer: LoadingBarTimeoutId | undefined
  let hideTimer: LoadingBarTimeoutId | undefined

  const schedule =
    hooks.setTimeout ?? ((handler, timeout) => globalThis.setTimeout(handler, timeout))
  const cancel = hooks.clearTimeout ?? ((id) => globalThis.clearTimeout(id))

  function canMutate(): boolean {
    return isBrowser() || Boolean(hooks.setTimeout)
  }

  function reduceMotion(): boolean {
    return hooks.prefersReducedMotion ? hooks.prefersReducedMotion() : prefersReducedMotion()
  }

  function emit(): void {
    listeners.forEach((listener) => listener())
  }

  function stopTrickle(): void {
    if (trickleTimer === undefined) return
    cancel(trickleTimer)
    trickleTimer = undefined
  }

  function stopHide(): void {
    if (hideTimer === undefined) return
    cancel(hideTimer)
    hideTimer = undefined
  }

  function hideNow(): void {
    stopTrickle()
    stopHide()
    state = createInitialLoadingBarState()
    emit()
  }

  function scheduleHide(): void {
    stopHide()
    if (reduceMotion() || (!isBrowser() && !hooks.setTimeout)) {
      hideNow()
      return
    }
    hideTimer = schedule(() => {
      hideTimer = undefined
      hideNow()
    }, LOADING_BAR_FINISH_HIDE_DELAY_MS)
  }

  function tickTrickle(): void {
    if (state.status !== 'loading' || state.startedCount <= 0) {
      stopTrickle()
      return
    }
    state = {
      ...state,
      percentage: nextLoadingBarTricklePercentage(state.percentage)
    }
    emit()
    trickleTimer = schedule(tickTrickle, LOADING_BAR_TRICKLE_INTERVAL_MS)
  }

  function startTrickle(): void {
    stopTrickle()
    if (reduceMotion()) return
    if (!isBrowser() && !hooks.setTimeout) return
    trickleTimer = schedule(tickTrickle, LOADING_BAR_TRICKLE_INTERVAL_MS)
  }

  function start(options?: LoadingBarOptions): void {
    if (!canMutate()) return
    stopHide()
    const nextCount = state.startedCount + 1
    const isFresh = state.status !== 'loading' || !state.visible

    state = mergeStartOptions(state, options)
    state = {
      ...state,
      visible: true,
      status: 'loading',
      startedCount: nextCount,
      percentage: isFresh ? LOADING_BAR_START_PERCENTAGE : state.percentage
    }
    emit()

    if (isFresh) {
      startTrickle()
    }
  }

  function set(percentage: number): void {
    if (!canMutate()) return
    stopTrickle()
    stopHide()
    state = {
      ...state,
      visible: true,
      status: 'loading',
      startedCount: Math.max(1, state.startedCount),
      percentage: clampLoadingBarPercentage(percentage)
    }
    emit()
  }

  function inc(delta = 8): void {
    const amount = Number.isFinite(delta) ? delta : 0
    set(state.percentage + amount)
  }

  function finish(): void {
    if (!canMutate()) return
    if (state.startedCount <= 0 && state.status !== 'loading') {
      return
    }

    const nextCount = Math.max(0, state.startedCount - 1)
    if (nextCount > 0) {
      state = { ...state, startedCount: nextCount }
      emit()
      return
    }

    stopTrickle()
    state = {
      ...state,
      visible: true,
      startedCount: 0,
      percentage: 100,
      status: 'success'
    }
    emit()
    scheduleHide()
  }

  function error(): void {
    if (!canMutate()) return
    stopTrickle()
    state = {
      ...state,
      visible: true,
      startedCount: 0,
      percentage: 100,
      status: 'error'
    }
    emit()
    scheduleHide()
  }

  function clear(): void {
    if (!canMutate()) return
    stopTrickle()
    stopHide()
    state = createInitialLoadingBarState()
    emit()
  }

  return {
    getState: () => state,
    start,
    set,
    inc,
    finish,
    error,
    clear,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }
  }
}
