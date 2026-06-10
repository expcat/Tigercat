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
import { getLocaleDirection, isRtlLocale } from '@expcat/tigercat-core'

const locales = { enUS, zhCN, zhTW, jaJP, koKR, thTH, viVN, idID, esES, frFR, deDE, ptBR, arSA }

describe('i18n locale presets', () => {
  const requiredKeys = ['common', 'modal', 'drawer', 'pagination', 'table', 'formWizard', 'taskBoard']

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
})
