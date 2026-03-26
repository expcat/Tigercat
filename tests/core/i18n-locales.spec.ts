import { describe, expect, it } from 'vitest'
import { enUS, zhCN, zhTW, jaJP, koKR, thTH, viVN, idID } from '@expcat/tigercat-core'

const locales = { enUS, zhCN, zhTW, jaJP, koKR, thTH, viVN, idID }

describe('i18n locale presets', () => {
  const requiredKeys = ['common', 'modal', 'drawer', 'pagination', 'formWizard', 'taskBoard']

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

  it('all locales have pagination.totalText', () => {
    for (const [, locale] of Object.entries(locales)) {
      expect(locale.pagination.totalText).toBeDefined()
    }
  })
})
