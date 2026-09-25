/**
 * Alert component utilities
 * Shared styles and helpers for Alert components
 */

import { classNames } from './class-names'
import { getFocusableElements } from './overlay-utils'
import { closeIconPathD } from './icons/common'
import {
  statusErrorIconPath,
  statusInfoIconPath,
  statusSuccessIconPath,
  statusWarningIconPath
} from './icons/status'

import type { AlertSize, AlertType } from '../types/alert'

/**
 * Base classes for all alert variants.
 * `relative overflow-hidden` is the containing block for the countdown bar.
 */
export const alertBaseClasses =
  'relative overflow-hidden flex items-start rounded-[var(--tiger-radius-md)] border tiger-motion-aware [transition:var(--tiger-transition-base)]'

/**
 * Size classes for alert variants.
 * `md` reads runtime spacing and type tokens. sm/lg stay on the type scale.
 */
export const alertSizeClasses: Record<AlertSize, string> = {
  sm: 'p-3 text-sm',
  md: 'px-[var(--tiger-spacing-lg)] py-[var(--tiger-spacing-lg)] text-[length:var(--tiger-font-size-base)]',
  lg: 'p-5 text-lg'
} as const

/**
 * Icon size classes. md is the step between sm and lg on the type scale.
 */
export const alertIconSizeClasses: Record<AlertSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
} as const

/**
 * Title size classes
 */
export const alertTitleSizeClasses: Record<AlertSize, string> = {
  sm: 'text-sm font-medium',
  md: 'text-base font-medium',
  lg: 'text-lg font-medium'
} as const

/**
 * Description size classes
 */
export const alertDescriptionSizeClasses: Record<AlertSize, string> = {
  sm: 'text-xs mt-1',
  md: 'text-sm mt-1',
  lg: 'text-base mt-1.5'
} as const

/**
 * Close button base classes
 */
export const alertCloseButtonBaseClasses =
  'ms-auto -me-1 -mt-0.5 rounded-[var(--tiger-radius-md)] p-1.5 inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 tiger-motion-aware transition-colors'

/**
 * Alert icon container base classes
 */
export const alertIconContainerClasses = 'flex-shrink-0'

/**
 * Content next to the type icon. Spacing is only applied when the icon is shown.
 */
export function getAlertContentClasses(showIcon: boolean): string {
  return classNames('flex-1 min-w-0', showIcon && 'ms-3')
}

/**
 * SVG path for close (x) icon
 */
export const alertCloseIconPath = closeIconPathD

/**
 * Icon paths keyed by alert type
 */
const alertIconPaths: Record<AlertType, string> = {
  success: statusSuccessIconPath,
  warning: statusWarningIconPath,
  error: statusErrorIconPath,
  info: statusInfoIconPath
}

/**
 * Get icon path based on alert type
 * @param type - Alert type
 * @returns SVG path string for the icon
 */
export function getAlertIconPath(type: AlertType): string {
  return alertIconPaths[type]
}

export interface AlertLiveState {
  role?: 'alert' | 'status'
  ariaLive?: 'polite'
}

let alertPaintSettled = false

if (typeof queueMicrotask === 'function') {
  queueMicrotask(() => {
    alertPaintSettled = true
  })
}

/** True after the first browser turn. Later mounts are new status, not static copy. */
export function isAlertInsertedAfterPaint(): boolean {
  return alertPaintSettled
}

/**
 * `error` is always `alert`. Other types are a polite `status` only when the
 * alert was inserted after the first paint. Static copy has no live region.
 */
export function resolveAlertLive(
  type: AlertType,
  hasContent: boolean,
  inserted = isAlertInsertedAfterPaint()
): AlertLiveState {
  if (!hasContent) return {}
  if (type === 'error') return { role: 'alert' }
  if (!inserted) return {}
  return { role: 'status', ariaLive: 'polite' }
}

/**
 * Banner mode classes — full-width, no border-radius
 * @since 0.9.0
 */
export const alertBannerClasses = 'rounded-none border-x-0 w-full'

/**
 * Countdown progress bar container classes
 * @since 0.9.0
 */
export const alertCountdownContainerClasses = 'absolute inset-x-0 bottom-0 h-1 overflow-hidden'

/**
 * Countdown progress bar classes. Duration is set via `animationDuration`.
 * @since 0.9.0
 */
/** Width comes from the shared remaining-time ratio, not a CSS animation. */
export const alertCountdownBarClasses = 'h-full me-auto'

export const alertCountdownBaseStyles = {} as const

/**
 * Countdown bar color classes by alert type
 * @since 0.9.0
 */
export const alertCountdownColorClasses: Record<AlertType, string> = {
  success: 'bg-[var(--tiger-success)]',
  warning: 'bg-[var(--tiger-warning)]',
  error: 'bg-[var(--tiger-error)]',
  info: 'bg-[var(--tiger-info)]'
}

export interface AlertCountdown {
  getRemaining(): number
  /** 1 at the start of the current duration, 0 when the timer elapses. */
  getRatio(): number
  subscribe(listener: () => void): () => void
  /**
   * Start, pause, or restart. The same duration does not reset remaining.
   * Reduced motion freezes the clock and the bar together.
   */
  sync(duration: number | undefined, reducedMotion: boolean): void
  dispose(): void
}

const ALERT_COUNTDOWN_TICK_MS = 50

/**
 * One remaining-time clock for the auto-close timer and the countdown bar.
 * Pass `enabled: false` on the server so no timer is armed.
 */
export function createAlertCountdown(options: {
  onElapsed: () => void
  enabled?: boolean
  now?: () => number
  setInterval?: (handler: () => void, timeout: number) => ReturnType<typeof setInterval>
  clearInterval?: (id: ReturnType<typeof setInterval>) => void
}): AlertCountdown {
  const listeners = new Set<() => void>()
  const now = options.now ?? (() => Date.now())
  const schedule = options.setInterval ?? ((handler, timeout) => setInterval(handler, timeout))
  const cancel = options.clearInterval ?? ((id) => clearInterval(id))
  let total = 0
  let remaining = 0
  let durationKey: number | null = null
  let reduced = false
  let timer: ReturnType<typeof setInterval> | null = null
  let elapsedNotified = false
  let runningStamp = 0

  function emit(): void {
    listeners.forEach((listener) => listener())
  }

  function stopTimer(): void {
    if (timer === null) return
    cancel(timer)
    timer = null
  }

  function tick(): void {
    const elapsed = now() - runningStamp
    remaining = Math.max(0, total - elapsed)
    if (remaining <= 0) {
      stopTimer()
      emit()
      if (!elapsedNotified) {
        elapsedNotified = true
        options.onElapsed()
      }
      return
    }
    emit()
  }

  function startTimer(): void {
    stopTimer()
    if (options.enabled === false || reduced || total <= 0) return
    runningStamp = now() - (total - remaining)
    timer = schedule(tick, ALERT_COUNTDOWN_TICK_MS)
  }

  return {
    getRemaining: () => remaining,
    getRatio: () => (total <= 0 ? 0 : remaining / total),
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    sync(duration, reducedMotion) {
      const next = typeof duration === 'number' && Number.isFinite(duration) ? duration : 0
      const active = next > 0
      const changed = durationKey !== next
      reduced = reducedMotion
      if (!active) {
        durationKey = next
        total = 0
        remaining = 0
        elapsedNotified = false
        stopTimer()
        emit()
        return
      }
      if (changed) {
        durationKey = next
        total = next
        remaining = next
        elapsedNotified = false
      }
      if (reduced || options.enabled === false) {
        stopTimer()
        emit()
        return
      }
      if (timer === null) startTimer()
      emit()
    },
    dispose() {
      stopTimer()
      listeners.clear()
    }
  }
}

/** Move focus from inside `root` to the next tabbable element after it. */
export function focusAfterElement(root: HTMLElement | null | undefined): void {
  if (!root?.ownerDocument?.body) return
  const active = root.ownerDocument.activeElement
  if (!(active instanceof HTMLElement) || !root.contains(active)) return
  const next = getFocusableElements(root.ownerDocument.body).find(
    (element) =>
      !root.contains(element) &&
      (root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  )
  next?.focus()
}
