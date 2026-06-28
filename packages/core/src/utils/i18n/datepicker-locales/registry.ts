import type { DatePickerLabels, DatePickerLocalePreset } from '../../../types/datepicker'
import { AR_SA_DATEPICKER_LOCALE } from './ar-SA'
import { DE_DE_DATEPICKER_LOCALE } from './de-DE'
import { EN_US_DATEPICKER_LOCALE } from './en-US'
import { ES_ES_DATEPICKER_LOCALE } from './es-ES'
import { FR_FR_DATEPICKER_LOCALE } from './fr-FR'
import { ID_ID_DATEPICKER_LOCALE } from './id-ID'
import { JA_JP_DATEPICKER_LOCALE } from './ja-JP'
import { KO_KR_DATEPICKER_LOCALE } from './ko-KR'
import { PT_BR_DATEPICKER_LOCALE } from './pt-BR'
import { TH_TH_DATEPICKER_LOCALE } from './th-TH'
import { VI_VN_DATEPICKER_LOCALE } from './vi-VN'
import { ZH_CN_DATEPICKER_LOCALE } from './zh-CN'
import { ZH_TW_DATEPICKER_LOCALE } from './zh-TW'

export const DATEPICKER_LOCALES: readonly DatePickerLocalePreset[] = [
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
  DATEPICKER_LOCALES.map((preset) => [preset.locale.toLowerCase(), preset] as const)
)

const DATEPICKER_LOCALE_BY_LANGUAGE = new Map<string, DatePickerLocalePreset>()
for (const preset of DATEPICKER_LOCALES) {
  const language = preset.locale.split('-')[0]?.toLowerCase()
  if (language && !DATEPICKER_LOCALE_BY_LANGUAGE.has(language)) {
    DATEPICKER_LOCALE_BY_LANGUAGE.set(language, preset)
  }
}

export function getDatePickerLocalePreset(locale?: string): DatePickerLocalePreset | undefined {
  const lc = (locale ?? '').toLowerCase()
  const language = lc.split('-')[0]
  return DATEPICKER_LOCALE_BY_ID.get(lc) ?? DATEPICKER_LOCALE_BY_LANGUAGE.get(language)
}

export function getDatePickerLabelsFromLocale(
  locale?: string,
  overrides?: Partial<DatePickerLabels>
): DatePickerLabels {
  return {
    ...(getDatePickerLocalePreset(locale)?.labels ?? EN_US_DATEPICKER_LOCALE.labels),
    ...(overrides ?? {})
  }
}
