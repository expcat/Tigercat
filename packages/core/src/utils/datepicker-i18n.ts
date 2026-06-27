import type {
  DatePickerLabels,
  DatePickerLocaleConfig,
  DatePickerLocaleInput,
  DatePickerLocalePreset
} from '../types/datepicker'
import { AR_SA_DATEPICKER_LOCALE } from './i18n/datepicker-locales/ar-SA'
import { DE_DE_DATEPICKER_LOCALE } from './i18n/datepicker-locales/de-DE'
import { EN_US_DATEPICKER_LOCALE as EN_US_DATEPICKER_PRESET } from './i18n/datepicker-locales/en-US'
import { ES_ES_DATEPICKER_LOCALE } from './i18n/datepicker-locales/es-ES'
import { FR_FR_DATEPICKER_LOCALE } from './i18n/datepicker-locales/fr-FR'
import { ID_ID_DATEPICKER_LOCALE } from './i18n/datepicker-locales/id-ID'
import { JA_JP_DATEPICKER_LOCALE } from './i18n/datepicker-locales/ja-JP'
import { KO_KR_DATEPICKER_LOCALE } from './i18n/datepicker-locales/ko-KR'
import { PT_BR_DATEPICKER_LOCALE } from './i18n/datepicker-locales/pt-BR'
import { TH_TH_DATEPICKER_LOCALE } from './i18n/datepicker-locales/th-TH'
import { VI_VN_DATEPICKER_LOCALE } from './i18n/datepicker-locales/vi-VN'
import { ZH_CN_DATEPICKER_LOCALE as ZH_CN_DATEPICKER_PRESET } from './i18n/datepicker-locales/zh-CN'
import { ZH_TW_DATEPICKER_LOCALE } from './i18n/datepicker-locales/zh-TW'

export const EN_US_DATEPICKER_LOCALE: DatePickerLocalePreset = EN_US_DATEPICKER_PRESET

export const ZH_CN_DATEPICKER_LOCALE: DatePickerLocalePreset = ZH_CN_DATEPICKER_PRESET

const DATEPICKER_LOCALES = [
  EN_US_DATEPICKER_PRESET,
  ZH_CN_DATEPICKER_PRESET,
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
  DATEPICKER_LOCALES.map((preset) => [preset.locale.toLowerCase(), preset] as const)
)

const DATEPICKER_LOCALE_BY_LANGUAGE = new Map<string, DatePickerLocalePreset>()
for (const preset of DATEPICKER_LOCALES) {
  const language = preset.locale.split('-')[0]?.toLowerCase()
  if (language && !DATEPICKER_LOCALE_BY_LANGUAGE.has(language)) {
    DATEPICKER_LOCALE_BY_LANGUAGE.set(language, preset)
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
  return (
    DATEPICKER_LOCALE_BY_ID.get(lc)?.labels ??
    DATEPICKER_LOCALE_BY_LANGUAGE.get(language)?.labels ??
    EN_US_DATEPICKER_LOCALE.labels
  )
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
