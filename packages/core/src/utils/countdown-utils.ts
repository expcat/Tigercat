import { classNames } from './class-names'
import type {
  CountdownChangePayload,
  CountdownDurationParts,
  CountdownSize,
  CountdownValue
} from '../types/countdown'

export const COUNTDOWN_DEFAULT_FORMAT = 'HH:mm:ss'
export const COUNTDOWN_DEFAULT_INTERVAL_MS = 1000

export const countdownBaseClasses = 'inline-block'

export const countdownValueWrapperClasses = 'flex items-baseline'

export const countdownPrefixClasses = 'me-1 text-[var(--tiger-text,#111827)]'
export const countdownSuffixClasses = 'ms-1 text-[var(--tiger-text-muted,#6b7280)]'

const titleSize: Record<CountdownSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
}

const valueSize: Record<CountdownSize, string> = {
  sm: 'text-lg font-semibold tabular-nums',
  md: 'text-2xl font-semibold tabular-nums',
  lg: 'text-4xl font-bold tabular-nums'
}

export function getCountdownTitleClasses(size: CountdownSize): string {
  return classNames(titleSize[size], 'mb-1 text-[var(--tiger-text-muted,#6b7280)]')
}

export function getCountdownValueClasses(size: CountdownSize): string {
  return classNames(valueSize[size], 'text-[var(--tiger-text,#111827)]')
}

export function parseCountdownTimestamp(value: CountdownValue | undefined): number | undefined {
  if (value === undefined || value === '') return undefined

  if (value instanceof Date) {
    const timestamp = value.getTime()
    return Number.isFinite(timestamp) ? timestamp : undefined
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }

  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : undefined
}

export function getCountdownRemaining(
  value: CountdownValue | undefined,
  now?: CountdownValue
): number {
  const targetTimestamp = parseCountdownTimestamp(value)
  if (targetTimestamp === undefined) return 0

  const nowTimestamp = parseCountdownTimestamp(now) ?? Date.now()
  return Math.max(0, targetTimestamp - nowTimestamp)
}

export function getCountdownParts(remaining: number): CountdownDurationParts {
  const total = Math.max(0, Math.floor(remaining))
  const days = Math.floor(total / 86400000)
  const hours = Math.floor((total % 86400000) / 3600000)
  const minutes = Math.floor((total % 3600000) / 60000)
  const seconds = Math.floor((total % 60000) / 1000)
  const milliseconds = total % 1000

  return { total, days, hours, minutes, seconds, milliseconds }
}

export function padCountdownNumber(value: number, length: number = 2): string {
  return String(Math.max(0, Math.floor(value))).padStart(length, '0')
}

/**
 * Sub-second remainders would floor to `00:00:00` while still unfinished.
 * Without an `SSS` token, bump `(0, 1000)` ms up to one displayed second.
 */
export function getCountdownDisplayRemaining(remaining: number, format: string): number {
  if (remaining <= 0) return 0
  if (remaining < 1000 && !/SSS/.test(format)) return 1000
  return remaining
}

export function formatCountdown(
  remaining: number,
  format: string = COUNTDOWN_DEFAULT_FORMAT
): string {
  const parts = getCountdownParts(getCountdownDisplayRemaining(remaining, format))
  const usesDayToken = /D/.test(format)
  const totalHours = Math.floor(parts.total / 3600000)
  const hours = usesDayToken ? parts.hours : totalHours

  return format.replace(/DD|D|HH|H|mm|m|ss|s|SSS/g, (token, offset, input) => {
    const before = input[offset - 1]
    const after = input[offset + token.length]
    if (/[A-Za-z]/.test(before ?? '') || /[A-Za-z]/.test(after ?? '')) return token

    switch (token) {
      case 'DD':
        return padCountdownNumber(parts.days)
      case 'D':
        return String(parts.days)
      case 'HH':
        return padCountdownNumber(hours)
      case 'H':
        return String(hours)
      case 'mm':
        return padCountdownNumber(parts.minutes)
      case 'm':
        return String(parts.minutes)
      case 'ss':
        return padCountdownNumber(parts.seconds)
      case 's':
        return String(parts.seconds)
      case 'SSS':
        return padCountdownNumber(parts.milliseconds, 3)
      default:
        return token
    }
  })
}

export function createCountdownPayload(
  remaining: number,
  format: string = COUNTDOWN_DEFAULT_FORMAT
): CountdownChangePayload {
  return {
    remaining,
    formatted: formatCountdown(remaining, format),
    parts: getCountdownParts(remaining),
    finished: remaining <= 0
  }
}
