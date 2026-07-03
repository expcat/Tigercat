import { describe, expect, it } from 'vitest'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { koKR } from '@expcat/tigercat-core/locales/ko-KR'
import { thTH } from '@expcat/tigercat-core/locales/th-TH'
import { viVN } from '@expcat/tigercat-core/locales/vi-VN'
import { idID } from '@expcat/tigercat-core/locales/id-ID'
import { esES } from '@expcat/tigercat-core/locales/es-ES'
import { frFR } from '@expcat/tigercat-core/locales/fr-FR'
import { deDE } from '@expcat/tigercat-core/locales/de-DE'
import { ptBR } from '@expcat/tigercat-core/locales/pt-BR'
import { arSA } from '@expcat/tigercat-core/locales/ar-SA'
import {
  defineLocale,
  defineText,
  getLocaleDirection,
  isRtlLocale,
  mergeTigerLocale
} from '@expcat/tigercat-core'
import { FR_FR_DATEPICKER_LOCALE } from '@expcat/tigercat-core/datepicker-locales/fr-FR'

const locales = { enUS, zhCN, zhTW, jaJP, koKR, thTH, viVN, idID, esES, frFR, deDE, ptBR, arSA }

describe('i18n locale presets', () => {
  const requiredKeys = [
    'common',
    'modal',
    'drawer',
    'qrcode',
    'timeline',
    'pagination',
    'table',
    'formWizard',
    'select',
    'taskBoard'
  ]

  for (const [name, locale] of Object.entries(locales)) {
    it(`${name} contains all required sub-interfaces`, () => {
      for (const key of requiredKeys) {
        expect(locale).toHaveProperty(key)
      }
    })
  }

  it('enUS common.okText is "OK"', () => {
    expect(enUS.common.okText).toBe('OK')
  })

  it('zhCN common.okText is "确定"', () => {
    expect(zhCN.common.okText).toBe('确定')
  })

  it('jaJP common.okText is "OK"', () => {
    expect(jaJP.common.okText).toBe('OK')
  })

  it('koKR common.cancelText is "취소"', () => {
    expect(koKR.common.cancelText).toBe('취소')
  })

  it('new western and Arabic locales expose translated labels', () => {
    expect(esES.common.okText).toBe('Aceptar')
    expect(frFR.pagination.nextPageAriaLabel).toBe('Page suivante')
    expect(deDE.formWizard.finishText).toBe('Fertigstellen')
    expect(ptBR.taskBoard.boardAriaLabel).toBe('Quadro de tarefas')
    expect(arSA.common.cancelText).toBe('إلغاء')
  })

  it('marks Arabic as RTL and keeps other built-ins LTR', () => {
    expect(arSA.direction).toBe('rtl')
    expect(isRtlLocale(arSA)).toBe(true)
    expect(isRtlLocale('he-IL')).toBe(true)
    expect(getLocaleDirection(esES)).toBe('ltr')
  })

  it('all locales have pagination.totalText', () => {
    for (const [, locale] of Object.entries(locales)) {
      expect(locale.pagination.totalText).toBeDefined()
    }
  })

  it('all locales have table searchButtonText', () => {
    for (const [, locale] of Object.entries(locales)) {
      expect(locale.table.searchButtonText).toBeDefined()
    }
  })

  it('all locales have select.doneText', () => {
    for (const [, locale] of Object.entries(locales)) {
      expect(locale.select?.doneText).toBeDefined()
    }
  })

  it('all locales have common.noMoreText', () => {
    for (const [, locale] of Object.entries(locales)) {
      expect(locale.common.noMoreText).toBeDefined()
    }
  })

  it('all locales have qrcode and timeline text', () => {
    for (const [, locale] of Object.entries(locales)) {
      expect(locale.qrcode?.ariaLabel).toBeDefined()
      expect(locale.qrcode?.expiredText).toBeDefined()
      expect(locale.qrcode?.refreshText).toBeDefined()
      expect(locale.qrcode?.loadingText).toBeDefined()
      expect(locale.timeline?.pendingText).toBeDefined()
    }
  })

  it('all locales carry their own DatePicker preset', () => {
    for (const [, locale] of Object.entries(locales)) {
      expect(locale.datePicker?.locale).toBe(locale.locale)
      expect(locale.datePicker?.labels?.today).toBeDefined()
    }
  })

  it('mergeTigerLocale preserves and overrides qrcode and timeline text', () => {
    const merged = mergeTigerLocale(
      {
        qrcode: {
          ariaLabel: 'Base QR',
          expiredText: 'Base expired',
          refreshText: 'Base refresh',
          loadingText: 'Base loading'
        },
        timeline: {
          pendingText: 'Base pending'
        }
      },
      {
        qrcode: {
          refreshText: 'Override refresh'
        },
        timeline: {
          pendingText: 'Override pending'
        }
      }
    )

    expect(merged?.qrcode?.ariaLabel).toBe('Base QR')
    expect(merged?.qrcode?.expiredText).toBe('Base expired')
    expect(merged?.qrcode?.refreshText).toBe('Override refresh')
    expect(merged?.qrcode?.loadingText).toBe('Base loading')
    expect(merged?.timeline?.pendingText).toBe('Override pending')
  })

  it('enUS and zhCN expose built-in Upload and TimePicker labels', () => {
    expect(enUS.upload?.selectFileText).toBe('Select File')
    expect(enUS.timePicker?.selectTime).toBe('Select time')
    expect(zhCN.upload?.selectFileText).toBe('选择文件')
    expect(zhCN.timePicker?.selectTime).toBe('请选择时间')
  })

  it('enUS and zhCN expose built-in AvatarGroup labels', () => {
    expect(enUS.avatarGroup?.ariaLabel).toBe('Avatar group')
    expect(enUS.avatarGroup?.overflowAriaLabel).toBe('{count} more')
    expect(zhCN.avatarGroup?.ariaLabel).toBe('头像组')
    expect(zhCN.avatarGroup?.overflowAriaLabel).toBe('还有 {count} 位')
  })

  it('defineText returns only the custom text overlay', () => {
    const source = {
      modal: { okText: 'Confirm', cancelText: 'Dismiss' },
      pagination: { totalText: '{total} results' }
    }
    const text = defineText(source)

    expect(text).toEqual(source)
    expect(text).not.toHaveProperty('locale')
    expect(text).not.toHaveProperty('direction')
    expect(text).not.toHaveProperty('datePicker')
  })

  it('defineLocale accepts an explicit DatePicker preset without registry lookup', () => {
    const locale = defineLocale({
      locale: 'fr-FR',
      datePicker: FR_FR_DATEPICKER_LOCALE,
      common: { okText: 'Valider' }
    })

    expect(locale.locale).toBe('fr-FR')
    expect(locale.common?.okText).toBe('Valider')
    expect(locale.datePicker?.labels?.today).toBe("Aujourd'hui")
  })
})
