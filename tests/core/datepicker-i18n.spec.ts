import { describe, it, expect } from 'vitest'
import { getDatePickerLabels, getDatePickerLocaleCode } from '@expcat/tigercat-core'
import {
  getDatePickerLabelsFromLocale,
  getDatePickerLocalePreset
} from '@expcat/tigercat-core/datepicker-locales/registry'
import { ZH_CN_DATEPICKER_LOCALE } from '../../packages/core/src/utils/i18n/datepicker-locales/zh-CN'
import { FR_FR_DATEPICKER_LOCALE } from '../../packages/core/src/utils/i18n/datepicker-locales/fr-FR'

describe('datepicker-i18n', () => {
  it('resolves locale code from strings and datepicker presets', () => {
    expect(getDatePickerLocaleCode('zh-CN')).toBe('zh-CN')
    expect(getDatePickerLocaleCode(ZH_CN_DATEPICKER_LOCALE)).toBe('zh-CN')
    expect(getDatePickerLocaleCode({ datePicker: ZH_CN_DATEPICKER_LOCALE })).toBe('zh-CN')
  })

  it('merges preset labels with explicit overrides', () => {
    const labels = getDatePickerLabels(ZH_CN_DATEPICKER_LOCALE, { today: '今日' })

    expect(labels.today).toBe('今日')
    expect(labels.ok).toBe('确定')
    expect(labels.previousMonth).toBe('上个月')
  })

  it('supports Tigercat locale-shaped datePicker config', () => {
    const labels = getDatePickerLabels({ datePicker: ZH_CN_DATEPICKER_LOCALE })

    expect(labels.calendar).toBe('日历')
    expect(labels.nextMonth).toBe('下个月')
  })

  it('keeps string locale lookup lightweight without the registry', () => {
    expect(getDatePickerLocaleCode('fr-FR')).toBe('fr-FR')
    expect(getDatePickerLabels('fr-FR').today).toBe('Today')
  })

  it('keeps explicit new DatePicker presets mergeable', () => {
    const labels = getDatePickerLabels(FR_FR_DATEPICKER_LOCALE, { ok: 'Valider' })

    expect(labels.today).toBe("Aujourd'hui")
    expect(labels.ok).toBe('Valider')
  })

  it('resolves built-in labels from locale codes through the opt-in registry', () => {
    expect(getDatePickerLabelsFromLocale('es-ES').today).toBe('Hoy')
    expect(getDatePickerLabelsFromLocale('fr-FR').today).toBe("Aujourd'hui")
    expect(getDatePickerLabelsFromLocale('de-DE').clearDate).toBe('Datum löschen')
    expect(getDatePickerLabelsFromLocale('pt-BR').calendar).toBe('Calendário')
    expect(getDatePickerLabelsFromLocale('ar-SA').previousMonth).toBe('الشهر السابق')
    expect(getDatePickerLocalePreset('fr-CA')?.locale).toBe('fr-FR')
  })
})
