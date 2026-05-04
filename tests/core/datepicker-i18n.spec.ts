import { describe, it, expect } from 'vitest'
import { getDatePickerLabels, getDatePickerLocaleCode } from '@expcat/tigercat-core'
import { ZH_CN_DATEPICKER_LOCALE } from '../../packages/core/src/utils/i18n/datepicker-locales/zh-CN'

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
})
