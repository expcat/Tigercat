import type {
  DatePickerLabels,
  DatePickerLocaleConfig,
  DatePickerLocaleInput,
  DatePickerLocalePreset
} from '../types/datepicker'

export const EN_US_DATEPICKER_LOCALE: DatePickerLocalePreset = {
  locale: 'en-US',
  labels: {
    today: 'Today',
    ok: 'OK',
    calendar: 'Calendar',
    toggleCalendar: 'Toggle calendar',
    clearDate: 'Clear date',
    previousMonth: 'Previous month',
    nextMonth: 'Next month'
  }
}

export const ZH_CN_DATEPICKER_LOCALE: DatePickerLocalePreset = {
  locale: 'zh-CN',
  labels: {
    today: '今天',
    ok: '确定',
    calendar: '日历',
    toggleCalendar: '打开日历',
    clearDate: '清除日期',
    previousMonth: '上个月',
    nextMonth: '下个月'
  }
}

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
  const lc = (getDatePickerLocaleCode(locale) ?? '').toLowerCase()
  return lc.startsWith('zh') ? ZH_CN_DATEPICKER_LOCALE.labels : EN_US_DATEPICKER_LOCALE.labels
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
