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

const DATEPICKER_LABELS_BY_LANGUAGE: Record<string, DatePickerLabels> = {
  en: EN_US_DATEPICKER_LOCALE.labels,
  zh: ZH_CN_DATEPICKER_LOCALE.labels,
  es: {
    today: 'Hoy',
    ok: 'Aceptar',
    calendar: 'Calendario',
    toggleCalendar: 'Abrir calendario',
    clearDate: 'Borrar fecha',
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente'
  },
  fr: {
    today: "Aujourd'hui",
    ok: 'OK',
    calendar: 'Calendrier',
    toggleCalendar: 'Ouvrir le calendrier',
    clearDate: 'Effacer la date',
    previousMonth: 'Mois précédent',
    nextMonth: 'Mois suivant'
  },
  de: {
    today: 'Heute',
    ok: 'OK',
    calendar: 'Kalender',
    toggleCalendar: 'Kalender öffnen',
    clearDate: 'Datum löschen',
    previousMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat'
  },
  pt: {
    today: 'Hoje',
    ok: 'OK',
    calendar: 'Calendário',
    toggleCalendar: 'Abrir calendário',
    clearDate: 'Limpar data',
    previousMonth: 'Mês anterior',
    nextMonth: 'Próximo mês'
  },
  ar: {
    today: 'اليوم',
    ok: 'موافق',
    calendar: 'التقويم',
    toggleCalendar: 'فتح التقويم',
    clearDate: 'مسح التاريخ',
    previousMonth: 'الشهر السابق',
    nextMonth: 'الشهر التالي'
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
  const language = lc.split('-')[0]
  return DATEPICKER_LABELS_BY_LANGUAGE[language] ?? EN_US_DATEPICKER_LOCALE.labels
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
