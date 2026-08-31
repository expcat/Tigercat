import { describe, it, expect } from 'vitest'
import { getDatePickerLabels, getDatePickerLocaleCode } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { frFR } from '@expcat/tigercat-core/locales/fr-FR'
import { deDE } from '@expcat/tigercat-core/locales/de-DE'
import { ptBR } from '@expcat/tigercat-core/locales/pt-BR'
import { idID } from '@expcat/tigercat-core/locales/id-ID'
import { viVN } from '@expcat/tigercat-core/locales/vi-VN'
import { ZH_CN_DATEPICKER_LOCALE } from '../../packages/core/src/utils/i18n/datepicker-locales/zh-CN'
import { DATEPICKER_LOCALES } from '../../packages/core/src/utils/i18n/datepicker-locales/registry'

const OK_ALLOWLIST = new Set(['ja-JP', 'fr-FR', 'de-DE', 'pt-BR', 'id-ID', 'vi-VN'])

describe('datepicker-i18n', () => {
  it('reads labels from the official locale object, not a language id string', () => {
    expect(getDatePickerLocaleCode(zhCN)).toBe('zh-CN')
    expect(getDatePickerLabels(zhCN).placeholder).toBe('请选择日期')
    expect(getDatePickerLabels(zhTW).placeholder).toBe('請選擇日期')
    expect(getDatePickerLabels(ZH_CN_DATEPICKER_LOCALE).today).toBe('今天')
  })

  it('prefers TigerLocale.locale over the nested datePicker.locale id', () => {
    expect(getDatePickerLocaleCode(zhCN)).toBe('zh-CN')
    expect(getDatePickerLocaleCode({ locale: 'zh-TW', datePicker: { locale: 'en-US' } })).toBe(
      'zh-TW'
    )
  })

  it('covers every built-in pack with the same leaves as en-US', () => {
    const enLeaves = Object.keys(enUS.datePicker?.labels ?? {}).sort()
    const problems: string[] = []
    for (const preset of DATEPICKER_LOCALES) {
      const labels = preset.labels as Record<string, string>
      const keys = Object.keys(labels).sort()
      if (keys.join() !== enLeaves.join()) {
        problems.push(`${preset.locale} keys ${keys.join(',')} != ${enLeaves.join(',')}`)
      }
      for (const key of enLeaves) {
        const value = labels[key]
        const english = (enUS.datePicker?.labels as Record<string, string>)[key]
        if (!value) problems.push(`${preset.locale}.${key} missing`)
        if (preset.locale !== 'en-US' && value === english) {
          if (key === 'ok' && OK_ALLOWLIST.has(preset.locale)) continue
          problems.push(`${preset.locale}.${key} equals en-US`)
        }
      }
    }
    expect(problems).toEqual([])
  })

  it('allows OK as a proper name in listed locales', () => {
    expect(getDatePickerLabels(jaJP).ok).toBe('OK')
    expect(getDatePickerLabels(frFR).ok).toBe('OK')
    expect(getDatePickerLabels(deDE).ok).toBe('OK')
    expect(getDatePickerLabels(ptBR).ok).toBe('OK')
    expect(getDatePickerLabels(idID).ok).toBe('OK')
    expect(getDatePickerLabels(viVN).ok).toBe('OK')
  })
})
