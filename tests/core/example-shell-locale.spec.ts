/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'

import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { createSandboxDocument } from '../../examples/example/shared/playground/sandbox'
import { getDemoTigerLocale } from '../../examples/example/shared/tiger-locale'

const runtimeUrls = {
  framework: 'https://example.test/framework.js',
  tigercat: 'https://example.test/tigercat.js',
  core: 'https://example.test/core.js',
  shared: 'https://example.test/shared.js',
  tailwind: 'https://example.test/tailwind.js'
}

describe('example shell locale', () => {
  it('passes official locale objects, not a six-section overlay', () => {
    expect(getDemoTigerLocale('zh-CN')).toBe(zhCN)
    expect(getDemoTigerLocale('en-US')).toBe(enUS)
    expect(zhCN.table?.emptyText).toBeTruthy()
    expect(zhCN.select?.placeholder).toBeTruthy()
    expect(enUS.datePicker).toBeTruthy()
    expect(enUS.tabs).toBeTruthy()
  })

  it('maps locale subpaths onto the shared sandbox runtime', () => {
    const html = createSandboxDocument({
      framework: 'vue',
      meta: { id: 'select-01', title: 'Select', entry: 'App.vue', order: 1 },
      js: 'export default {}',
      css: '',
      imports: ['@expcat/tigercat-core/locales/zh-CN'],
      runtimeUrls,
      stylesheetUrl: 'https://example.test/sandbox.css',
      channelId: 'locale-test',
      lang: 'en-US',
      theme: 'default',
      colorScheme: 'light',
      cssVars: ''
    })

    expect(html).toContain('"@expcat/tigercat-core/locales/zh-CN":"https://example.test/shared.js"')
    expect(html).toContain('locale: Shared.getDemoTigerLocale(lang), theme, colorScheme')
  })
})
