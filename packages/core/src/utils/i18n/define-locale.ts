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

import type { TigerLocale, TigerText } from '../../types/locale'
import { enUS } from './locales/en-US'
import { AR_SA_DATEPICKER_LOCALE } from './datepicker-locales/ar-SA'
import { DE_DE_DATEPICKER_LOCALE } from './datepicker-locales/de-DE'
import { EN_US_DATEPICKER_LOCALE } from './datepicker-locales/en-US'
import { ES_ES_DATEPICKER_LOCALE } from './datepicker-locales/es-ES'
import { FR_FR_DATEPICKER_LOCALE } from './datepicker-locales/fr-FR'
import { ID_ID_DATEPICKER_LOCALE } from './datepicker-locales/id-ID'
import { JA_JP_DATEPICKER_LOCALE } from './datepicker-locales/ja-JP'
import { KO_KR_DATEPICKER_LOCALE } from './datepicker-locales/ko-KR'
import { PT_BR_DATEPICKER_LOCALE } from './datepicker-locales/pt-BR'
import { TH_TH_DATEPICKER_LOCALE } from './datepicker-locales/th-TH'
import { VI_VN_DATEPICKER_LOCALE } from './datepicker-locales/vi-VN'
import { ZH_CN_DATEPICKER_LOCALE } from './datepicker-locales/zh-CN'
import { ZH_TW_DATEPICKER_LOCALE } from './datepicker-locales/zh-TW'

type PlainObject = Record<string, unknown>

const DATEPICKER_LOCALES = [
  EN_US_DATEPICKER_LOCALE,
  ZH_CN_DATEPICKER_LOCALE,
  ZH_TW_DATEPICKER_LOCALE,
  JA_JP_DATEPICKER_LOCALE,
  KO_KR_DATEPICKER_LOCALE,
  TH_TH_DATEPICKER_LOCALE,
  VI_VN_DATEPICKER_LOCALE,
  ID_ID_DATEPICKER_LOCALE,
  ES_ES_DATEPICKER_LOCALE,
  FR_FR_DATEPICKER_LOCALE,
  DE_DE_DATEPICKER_LOCALE,
  PT_BR_DATEPICKER_LOCALE,
  AR_SA_DATEPICKER_LOCALE
]

const DATEPICKER_LOCALE_BY_ID = new Map(
  DATEPICKER_LOCALES.map((locale) => [locale.locale, locale] as const)
)

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
  const locale = overrides.locale ? DATEPICKER_LOCALE_BY_ID.get(overrides.locale) : undefined
  const normalizedOverrides =
    locale && !overrides.datePicker ? { ...overrides, datePicker: locale } : overrides
  return deepMerge(enUS as unknown as PlainObject, normalizedOverrides as PlainObject) as TigerLocale
}

/**
 * `defineText` — author app-wide custom text without engaging the i18n system.
 *
 * Thin alias over {@link defineLocale} for single-language projects: takes a
 * flat {@link TigerText} overlay (no `locale` code / `direction` needed) and
 * returns a fully-populated `TigerLocale` ready for
 * `<ConfigProvider locale={...} />`. Use this when you just want to override the
 * built-in wording and never ship multiple languages.
 *
 * @example
 * ```ts
 * import { defineText } from '@expcat/tigercat-core'
 *
 * export const appText = defineText({
 *   modal: { okText: 'Confirm', cancelText: 'Dismiss' },
 *   pagination: { totalText: '{total} results' }
 * })
 * ```
 */
export function defineText(text: TigerText = {}): TigerLocale {
  return defineLocale(text as Partial<TigerLocale>)
}
