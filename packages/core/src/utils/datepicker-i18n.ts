import type {
  DatePickerLabels,
  DatePickerLocaleConfig,
  DatePickerLocaleInput,
  DatePickerLocalePreset
} from '../types/datepicker'
import { EN_US_DATEPICKER_LOCALE as EN_US_DATEPICKER_PRESET } from './i18n/datepicker-locales/en-US'

export const EN_US_DATEPICKER_LOCALE: DatePickerLocalePreset = EN_US_DATEPICKER_PRESET

function isDatePickerLocaleConfig(value: unknown): value is DatePickerLocaleConfig {
  return Boolean(value && typeof value === 'object' && 'datePicker' in value)
}

function getLocalePreset(locale?: DatePickerLocaleInput): Partial<DatePickerLocalePreset> | null {
  if (!locale || typeof locale === 'string') return null
  if (isDatePickerLocaleConfig(locale)) return locale.datePicker ?? null
  return locale
}

export function getDatePickerLocaleCode(locale?: DatePickerLocaleInput): string | undefined {
  if (typeof locale === 'string') return locale
  return getLocalePreset(locale)?.locale
}

function getDefaultDatePickerLabels(locale?: DatePickerLocaleInput): DatePickerLabels {
  return getLocalePreset(locale)?.labels ?? EN_US_DATEPICKER_LOCALE.labels
}

export function getDatePickerLabels(
  locale?: DatePickerLocaleInput,
  overrides?: Partial<DatePickerLabels>
): DatePickerLabels {
  return {
    ...getDefaultDatePickerLabels(locale),
    ...(getLocalePreset(locale)?.labels ?? {}),
    ...(overrides ?? {})
  }
}
