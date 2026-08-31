import { classNames } from './class-names'
import { isBrowser } from './env'
import { formatIntlNumber } from './locale-utils'
import type { ComponentSize } from '../types/base'

export interface StatisticNumberAnimationOptions {
  from: number
  to: number
  duration?: number
  onUpdate: (value: number) => void
  onComplete?: () => void
  requestAnimationFrame?: (callback: FrameRequestCallback) => number
  cancelAnimationFrame?: (handle: number) => void
}

export interface StatisticNumberAnimationController {
  stop: () => void
}

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const statisticBaseClasses = 'inline-block'

const titleSize: Record<ComponentSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
}

const valueSize: Record<ComponentSize, string> = {
  sm: 'text-lg font-semibold',
  md: 'text-2xl font-semibold',
  lg: 'text-4xl font-bold'
}

export function getStatisticTitleClasses(size: ComponentSize): string {
  return classNames(titleSize[size], 'text-[var(--tiger-text-muted,#6b7280)] mb-1')
}

export function getStatisticValueClasses(size: ComponentSize): string {
  return classNames(valueSize[size], 'text-[var(--tiger-text,#111827)]')
}

export const statisticPrefixClasses = 'me-1 text-[var(--tiger-text,#111827)]'
export const statisticSuffixClasses = 'ms-1 text-[var(--tiger-text-muted,#6b7280)]'

export function statisticPrefersReducedMotion(): boolean {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ------------------------------------------------------------------ */
/*  Number animation                                                   */
/* ------------------------------------------------------------------ */

export const STATISTIC_ANIMATION_DURATION_MS = 800

export function easeOutCubic(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress))
  return 1 - (1 - clamped) ** 3
}

export function interpolateStatisticValue(from: number, to: number, progress: number): number {
  return from + (to - from) * easeOutCubic(progress)
}

export function canAnimateStatisticValue(value: string | number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function createStatisticNumberAnimation(
  options: StatisticNumberAnimationOptions
): StatisticNumberAnimationController {
  const duration = options.duration ?? STATISTIC_ANIMATION_DURATION_MS
  const requestFrame =
    options.requestAnimationFrame ??
    (typeof globalThis.requestAnimationFrame === 'function'
      ? globalThis.requestAnimationFrame.bind(globalThis)
      : undefined)
  const cancelFrame =
    options.cancelAnimationFrame ??
    (typeof globalThis.cancelAnimationFrame === 'function'
      ? globalThis.cancelAnimationFrame.bind(globalThis)
      : undefined)

  if (!requestFrame || duration <= 0 || options.from === options.to) {
    options.onUpdate(options.to)
    options.onComplete?.()
    return { stop: () => undefined }
  }

  let frameId: number | null = null
  let startTime: number | null = null
  let stopped = false

  const stop = () => {
    if (stopped) return
    stopped = true
    if (frameId !== null && cancelFrame) cancelFrame(frameId)
    frameId = null
  }

  const tick = (timestamp: number) => {
    if (stopped) return
    if (startTime === null) startTime = timestamp

    const progress = Math.min(1, (timestamp - startTime) / duration)
    options.onUpdate(interpolateStatisticValue(options.from, options.to, progress))

    if (progress < 1) {
      frameId = requestFrame(tick)
      return
    }

    frameId = null
    options.onComplete?.()
  }

  frameId = requestFrame(tick)

  return { stop }
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

export function resolveStatisticPrecision(value: number, precision: number | undefined): number {
  if (precision !== undefined && Number.isFinite(precision)) {
    return Math.max(0, Math.min(20, Math.floor(precision)))
  }
  const text = String(value)
  const dot = text.indexOf('.')
  if (dot === -1) return 0
  return text.length - dot - 1
}

export function formatStatisticValue(
  value: string | number | undefined,
  precision: number | undefined,
  groupSeparator: boolean,
  locale?: string
): string {
  if (value === undefined || value === '') return ''

  if (typeof value === 'string') return value

  const digits = resolveStatisticPrecision(value, precision)
  return formatIntlNumber(value, locale, {
    useGrouping: groupSeparator,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}
