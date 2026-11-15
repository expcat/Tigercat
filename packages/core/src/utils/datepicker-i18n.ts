import type {
  DatePickerLabels,
  DatePickerLocaleConfig,
  DatePickerLocalePreset
} from '../types/datepicker'
import type { TigerLocale } from '../types/locale'
import { EN_US_DATEPICKER_LOCALE } from './i18n/datepicker-locales/en-US'
import { deepMergeLocale } from './i18n/locale-merge'

export type DatePickerLocaleSource =
  Partial<TigerLocale> | DatePickerLocalePreset | DatePickerLocaleConfig

function isPreset(value: DatePickerLocaleSource): value is DatePickerLocalePreset {
  return 'labels' in value && !('datePicker' in value) && !('common' in value)
}

function readPreset(locale?: DatePickerLocaleSource): Partial<DatePickerLocalePreset> {
  if (!locale) return {}
  if (isPreset(locale)) return locale
  if ('datePicker' in locale) return locale.datePicker ?? {}
  return {}
}

export function getDatePickerLocaleCode(locale?: DatePickerLocaleSource): string | undefined {
  if (!locale) return undefined
  if ('locale' in locale && typeof locale.locale === 'string' && !isPreset(locale)) {
    return locale.locale
  }
  return readPreset(locale).locale
}

export function getDatePickerLabels(
  locale?: DatePickerLocaleSource,
  overrides?: Partial<DatePickerLabels>
): DatePickerLabels {
  return deepMergeLocale(
    deepMergeLocale({ ...EN_US_DATEPICKER_LOCALE.labels }, readPreset(locale).labels),
    overrides
  ) as DatePickerLabels
}
