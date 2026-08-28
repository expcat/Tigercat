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
  DEFAULT_CODE_LABELS,
  DEFAULT_COLOR_PICKER_LABELS,
  ZH_CN_CODE_LABELS,
  ZH_CN_COLOR_PICKER_LABELS,
  defineLocale,
  defineText,
  formatColorPickerSelectPreset,
  getCodeLabels,
  getColorPickerLabels,
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
    'colorPicker',
    'taskBoard',
    'chatWindow',
    'code',
    'commentThread',
    'activityFeed',
    'notificationCenter'
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

  it('all locales have colorPicker trigger / panelTitle / clear', () => {
    for (const [, locale] of Object.entries(locales)) {
      expect(locale.colorPicker?.trigger).toBeDefined()
      expect(locale.colorPicker?.panelTitle).toBeDefined()
      expect(locale.colorPicker?.clear).toBeDefined()
    }
  })

  it('enUS colorPicker trigger is Pick color and zhCN is 选择颜色', () => {
    expect(enUS.colorPicker?.trigger).toBe('Pick color')
    expect(enUS.colorPicker?.panelTitle).toBe('Color')
    expect(enUS.colorPicker?.clear).toBe('Clear')
    expect(zhCN.colorPicker?.trigger).toBe('选择颜色')
    expect(zhCN.colorPicker?.panelTitle).toBe('颜色')
    expect(zhCN.colorPicker?.clear).toBe('清空')
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

  it('enUS chatWindow.sendText is "Send" and zhCN is "发送"', () => {
    expect(enUS.chatWindow.sendText).toBe('Send')
    expect(zhCN.chatWindow.sendText).toBe('发送')
  })

  it('enUS code labels are English and zhCN are Simplified Chinese', () => {
    expect(enUS.code.copyLabel).toBe('Copy')
    expect(enUS.code.copiedLabel).toBe('Copied')
    expect(enUS.code.copyFailedLabel).toBe('Copy failed')
    expect(zhCN.code.copyLabel).toBe('复制')
    expect(zhCN.code.copiedLabel).toBe('已复制')
    expect(zhCN.code.copyFailedLabel).toBe('复制失败')
  })

  it('getCodeLabels(undefined) is English Copy / Copied / Copy failed', () => {
    expect(getCodeLabels(undefined)).toEqual(DEFAULT_CODE_LABELS)
    expect(getCodeLabels()).toEqual({
      copyLabel: 'Copy',
      copiedLabel: 'Copied',
      copyFailedLabel: 'Copy failed'
    })
  })

  it('getCodeLabels zh-CN is 复制 / 已复制 / 复制失败', () => {
    expect(getCodeLabels({ locale: 'zh-CN' })).toEqual(ZH_CN_CODE_LABELS)
    expect(getCodeLabels(zhCN)).toEqual({
      copyLabel: '复制',
      copiedLabel: '已复制',
      copyFailedLabel: '复制失败'
    })
  })

  it('getColorPickerLabels(undefined) is English Pick color / Color / Clear', () => {
    expect(getColorPickerLabels(undefined)).toEqual(DEFAULT_COLOR_PICKER_LABELS)
    expect(getColorPickerLabels()).toEqual({
      trigger: 'Pick color',
      panelTitle: 'Color',
      clear: 'Clear',
      hue: 'Hue',
      alpha: 'Alpha',
      value: 'Color value',
      preview: 'Color preview',
      selectPreset: 'Select {color}'
    })
  })

  it('getColorPickerLabels zh-CN is 选择颜色 / 颜色 / 清空', () => {
    expect(getColorPickerLabels({ locale: 'zh-CN' })).toEqual(ZH_CN_COLOR_PICKER_LABELS)
    expect(getColorPickerLabels(zhCN).trigger).toBe('选择颜色')
  })

  it('formatColorPickerSelectPreset substitutes {color}', () => {
    expect(formatColorPickerSelectPreset('Select {color}', '#ff0000')).toBe('Select #ff0000')
    expect(formatColorPickerSelectPreset('选择 {color}', '#00ff00')).toBe('选择 #00ff00')
  })

  it('mergeTigerLocale keeps colorPicker blocks', () => {
    const merged = mergeTigerLocale(
      { colorPicker: { trigger: 'Base trigger', clear: 'Base clear' } },
      { colorPicker: { trigger: 'Override trigger' } }
    )
    expect(merged?.colorPicker?.trigger).toBe('Override trigger')
    expect(merged?.colorPicker?.clear).toBe('Base clear')
  })

  it('mergeTigerLocale keeps chatWindow / commentThread / activityFeed / notificationCenter blocks', () => {
    const merged = mergeTigerLocale(
      {
        chatWindow: { sendText: 'Base send', emptyText: 'Base empty' },
        commentThread: { likeText: 'Base like' },
        activityFeed: { emptyText: 'Base activity' },
        notificationCenter: { title: 'Base title', markAllReadText: 'Base mark' }
      },
      {
        chatWindow: { sendText: 'Override send' },
        commentThread: { likeText: 'Override like' },
        activityFeed: { emptyText: 'Override activity' },
        notificationCenter: { markAllReadText: 'Override mark' }
      }
    )

    expect(merged?.chatWindow?.sendText).toBe('Override send')
    expect(merged?.chatWindow?.emptyText).toBe('Base empty')
    expect(merged?.commentThread?.likeText).toBe('Override like')
    expect(merged?.activityFeed?.emptyText).toBe('Override activity')
    expect(merged?.notificationCenter?.title).toBe('Base title')
    expect(merged?.notificationCenter?.markAllReadText).toBe('Override mark')
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
