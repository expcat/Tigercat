/**
 * Shared locale merge helpers.
 *
 * `TIGER_LOCALE_KEYS` is the single list of `TigerLocale` fields. Lazy module
 * detection, ConfigProvider merge, and new-section typecheck all read it.
 */

import type { TigerLocale, TigerLocaleDirection } from '../../types/locale'

export type TigerLocaleKey = keyof TigerLocale

/**
 * Exhaustive key map: adding a field to `TigerLocale` fails typecheck until
 * it is listed here. `dataExport` / `avatarGroup` live on this list so merge
 * and async locale loaders cannot drop them.
 */
export const TIGER_LOCALE_KEY_SET = {
  locale: true,
  direction: true,
  common: true,
  empty: true,
  modal: true,
  drawer: true,
  qrcode: true,
  marquee: true,
  image: true,
  imageCompare: true,
  descriptions: true,
  list: true,
  scrollArea: true,
  printLayout: true,
  timeline: true,
  progress: true,
  splitter: true,
  resizable: true,
  upload: true,
  pagination: true,
  table: true,
  datePicker: true,
  timePicker: true,
  dataExport: true,
  formWizard: true,
  tour: true,
  calendar: true,
  fileManager: true,
  imageViewer: true,
  imageEditor: true,
  status: true,
  taskBoard: true,
  chatWindow: true,
  code: true,
  commentThread: true,
  activityFeed: true,
  notificationCenter: true,
  select: true,
  colorPicker: true,
  tabs: true,
  rate: true,
  avatarGroup: true,
  carousel: true,
  transfer: true,
  chart: true,
  markdownEditor: true,
  richTextEditor: true,
  cronEditor: true,
  formValidation: true,
  inputOtp: true,
  tagsInput: true
} as const satisfies Record<TigerLocaleKey, true>

export const TIGER_LOCALE_KEYS = Object.keys(TIGER_LOCALE_KEY_SET) as TigerLocaleKey[]

type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Recursively merges `override` onto `base`.
 *
 * - Plain-object branches are merged key-by-key (deep)
 * - Arrays and non-plain objects from `override` replace the base value
 * - `undefined` values in `override` are skipped (don't blank out the base)
 * - `null` in `override` is preserved as an explicit reset
 */
export function deepMergeLocale(base: unknown, override: unknown): unknown {
  if (override === undefined) return base
  if (!isPlainObject(base) || !isPlainObject(override)) return override

  const out: PlainObject = { ...base }
  for (const key of Object.keys(override)) {
    const next = override[key]
    if (next === undefined) continue
    out[key] = deepMergeLocale(base[key], next)
  }
  return out
}

/**
 * When the override switches `locale` and does not set `direction`, do not
 * copy the parent's direction onto a different language. Callers then infer
 * from the override locale id.
 */
function mergeLocaleDirection(
  base?: Partial<TigerLocale>,
  override?: Partial<TigerLocale>
): TigerLocaleDirection | undefined {
  if (override?.direction !== undefined) return override.direction

  const overrideId = override?.locale
  const baseId = base?.locale
  const switchedLanguage =
    typeof overrideId === 'string' && typeof baseId === 'string' && overrideId !== baseId

  if (switchedLanguage) return undefined
  return base?.direction
}

export function mergeTigerLocale(
  base?: Partial<TigerLocale>,
  override?: Partial<TigerLocale>
): Partial<TigerLocale> | undefined {
  if (!base && !override) return undefined

  const result: Partial<TigerLocale> = {}
  for (const key of TIGER_LOCALE_KEYS) {
    if (key === 'direction') continue
    const merged = deepMergeLocale(base?.[key], override?.[key])
    if (merged !== undefined) {
      ;(result as Record<string, unknown>)[key] = merged
    }
  }

  const direction = mergeLocaleDirection(base, override)
  if (direction !== undefined) {
    result.direction = direction
  }

  return result
}
