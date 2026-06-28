/**
 * `defineLocale` — type-safe helper for authoring a custom Tigercat locale.
 *
 * Deep-merges a partial overlay onto the built-in `enUS` baseline so every
 * field that ships with Tigercat resolves to a string, while consumers only
 * need to provide the keys they actually want to translate / override.
 *
 * @example
 * ```ts
 * import { defineLocale } from '@expcat/tigercat-core'
 *
 * export const myLocale = defineLocale({
 *   common: { okText: 'はい' },
 *   pagination: { totalText: '{total} 件' }
 * })
 * ```
 *
 * The result is a fully-populated `TigerLocale` (no optional fields left
 * `undefined`) ready to pass to `<ConfigProvider locale={myLocale} />`.
 */

import type { TigerLocale } from '../../types/locale'
import { enUS } from './locales/en-US'

type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Recursively merges `override` onto `base`, returning a new object.
 *
 * - Plain-object branches are merged key-by-key (deep)
 * - Arrays and non-plain objects from `override` replace the base value
 * - `undefined` values in `override` are skipped (don't blank out the base)
 * - `null` in `override` is preserved as an explicit reset
 */
function deepMerge(base: PlainObject, override: PlainObject | undefined): PlainObject {
  if (!override) return { ...base }
  const out: PlainObject = { ...base }
  for (const key of Object.keys(override)) {
    const next = override[key]
    if (next === undefined) continue
    const prev = base[key]
    if (isPlainObject(prev) && isPlainObject(next)) {
      out[key] = deepMerge(prev, next)
    } else {
      out[key] = next
    }
  }
  return out
}

/**
 * Build a complete `TigerLocale` from a partial overlay on the default
 * (`enUS`) baseline.
 *
 * @param overrides Partial locale; nested objects are deep-merged.
 * @returns A fully populated `TigerLocale`.
 */
export function defineLocale(overrides: Partial<TigerLocale> = {}): TigerLocale {
  return deepMerge(enUS as unknown as PlainObject, overrides as PlainObject) as TigerLocale
}
