/**
 * `defineText` — author app-wide custom text without engaging locale presets.
 *
 * Unlike `defineLocale`, this helper does not import Tigercat's built-in
 * language data. It returns only the provided text overlay, cloned so callers
 * can safely reuse the source object.
 */

import type { TigerText } from '../../types/locale'

type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function clonePlainObject(value: PlainObject): PlainObject {
  const out: PlainObject = {}
  for (const key of Object.keys(value)) {
    const next = value[key]
    out[key] = isPlainObject(next) ? clonePlainObject(next) : next
  }
  return out
}

export function defineText(text: TigerText = {}): TigerText {
  return clonePlainObject(text as PlainObject) as TigerText
}
