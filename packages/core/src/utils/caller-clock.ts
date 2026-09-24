/**
 * Caller-supplied clock. Render paths must not call `Date.now()` or `new Date()`
 * to mean "today" or to format a clock that depends on the host timezone.
 */

export type CallerInstant = Date | number | string

export function resolveCallerInstant(value: CallerInstant | null | undefined): Date | null {
  if (value == null || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** IANA zone. Invalid names are rejected so formatting does not throw. */
export function resolveCallerTimeZone(timeZone: string | null | undefined): string | null {
  if (!timeZone) return null
  const trimmed = timeZone.trim()
  if (!trimmed) return null
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed }).format(0)
    return trimmed
  } catch {
    return null
  }
}

/** Document timezone. Call after mount, never during the first render. */
export function readDocumentTimeZone(): string | null {
  if (typeof Intl === 'undefined') return null
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}
