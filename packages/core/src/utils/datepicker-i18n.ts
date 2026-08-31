import type {
  DatePickerLabels,
  DatePickerLocaleConfig,
  DatePickerLocalePreset
} from '../types/datepicker'
import type { TigerLocale } from '../types/locale'
import { EN_US_DATEPICKER_LOCALE as EN_US_DATEPICKER_PRESET } from './i18n/datepicker-locales/en-US'

export const EN_US_DATEPICKER_LOCALE: DatePickerLocalePreset = EN_US_DATEPICKER_PRESET

const EN_US_LABELS = EN_US_DATEPICKER_LOCALE.labels as DatePickerLabels

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
  return {
    ...EN_US_LABELS,
    ...(readPreset(locale).labels ?? {}),
    ...(overrides ?? {})
  }
}
