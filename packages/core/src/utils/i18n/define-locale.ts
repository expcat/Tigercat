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
import { deepMergeLocale } from './locale-merge'
import { enUS } from './locales/en-US'

/**
 * Build a complete `TigerLocale` from a partial overlay on the default
 * (`enUS`) baseline.
 *
 * @param overrides Partial locale; nested objects are deep-merged.
 * @returns A fully populated `TigerLocale`.
 */
export function defineLocale(overrides: Partial<TigerLocale> = {}): TigerLocale {
  return deepMergeLocale(enUS, overrides) as TigerLocale
}
