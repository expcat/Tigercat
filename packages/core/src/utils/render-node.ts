/**
 * Plain data must not be handed to a framework renderer to guess.
 * Elements, vnodes, and text stay with the caller.
 */

export function isPlainDataRecord(value: unknown): boolean {
  if (value == null || typeof value !== 'object') return false
  if (Array.isArray(value)) return false
  if (typeof Element !== 'undefined' && value instanceof Element) return false
  const record = value as Record<string, unknown>
  if (typeof record.$$typeof === 'symbol') return false
  if (record.__v_isVNode === true) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/** Finite numbers and strings are text. Anything else is not. */
export function textFromUnknown(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'bigint') return String(value)
  return undefined
}
