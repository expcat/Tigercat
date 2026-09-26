/**
 * @vitest-environment node
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { createSandboxDocument } from '../../examples/example/shared/playground/sandbox'
import { getDemoTigerLocale } from '../../examples/example/shared/tiger-locale'

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

/** Side-by-side Traditional samples. Everything else inherits the page locale. */
const INTENTIONAL_ZH_TW = new Set([
  'examples/example/vue3/src/examples/pagination/02/App.vue',
  'examples/example/react/src/examples/pagination/02/App.tsx',
  'examples/example/vue3/src/examples/pagination/02/demo.json',
  'examples/example/react/src/examples/pagination/02/demo.json',
  // Interactive override starts from the shell locale and can switch to zh-TW.
  'examples/example/vue3/src/examples/config-provider/01/App.vue',
  'examples/example/react/src/examples/config-provider/01/App.tsx'
])

function collectExampleSources(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectExampleSources(full))
      continue
    }
    if (/\.(vue|tsx|json)$/.test(entry.name)) files.push(full)
  }
  return files
}

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
    expect(getDemoTigerLocale('zh-TW')).toBe(zhTW)
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
    expect(html).not.toContain('document: false')
  })

  it('gives Simplified copy to a zh-CN page, and Traditional only to zhTW', () => {
    const page = getDemoTigerLocale('zh-CN')
    expect(page.datePicker?.labels?.placeholder).toBe('请选择日期')
    expect(page.cronEditor?.presetPlaceholder).toBe('选择预设')
    expect(page.cronEditor?.minuteLabel).toBe('分钟')
    expect(page.dataExport?.triggerText).toBe('导出')
    expect(page.timePicker?.selectTime).toBe('请选择时间')
    expect(page.colorPicker?.trigger).toBe('选择颜色')
    expect(page.colorPicker?.swatches).toBe('色板')
    expect(page.carousel?.previousSlideAriaLabel).toBe('上一张')
    expect(page.datePicker?.labels?.placeholder).not.toBe(zhTW.datePicker?.labels?.placeholder)
    expect(zhTW.datePicker?.labels?.placeholder).toBe('請選擇日期')
    expect(zhTW.dataExport?.triggerText).toBe('匯出')
    expect(zhTW.cronEditor?.presetPlaceholder).toBe('選擇預設')
  })

  it('does not pin zh-TW on demos that should follow the page locale', () => {
    const roots = [
      join(repoRoot, 'examples/example/vue3/src/examples'),
      join(repoRoot, 'examples/example/react/src/examples')
    ]
    const offenders: string[] = []
    for (const root of roots) {
      for (const file of collectExampleSources(root)) {
        const rel = relative(repoRoot, file).split('\\').join('/')
        const source = readFileSync(file, 'utf8')
        if (!/zh-TW|zhTW/.test(source)) continue
        if (!INTENTIONAL_ZH_TW.has(rel)) offenders.push(rel)
      }
    }
    expect(offenders).toEqual([])
  })

  it('does not pin zh-CN on demos that should inherit the shell locale', () => {
    const allow = new Set([
      'examples/example/vue3/src/examples/pagination/02/App.vue',
      'examples/example/react/src/examples/pagination/02/App.tsx'
    ])
    const roots = [
      join(repoRoot, 'examples/example/vue3/src/examples'),
      join(repoRoot, 'examples/example/react/src/examples')
    ]
    const offenders: string[] = []
    const pin = /locale=\{zhCN\}|:locale="zhCN"/
    for (const root of roots) {
      for (const file of collectExampleSources(root)) {
        const rel = relative(repoRoot, file).split('\\').join('/')
        if (allow.has(rel) || !pin.test(readFileSync(file, 'utf8'))) continue
        offenders.push(rel)
      }
    }
    expect(offenders).toEqual([])
  })

  it('does not override locale empty or loading copy with a fixed string', () => {
    const roots = [
      join(repoRoot, 'examples/example/vue3/src/examples'),
      join(repoRoot, 'examples/example/react/src/examples')
    ]
    const offenders: string[] = []
    const pin = /empty-text=|emptyText=|loading-text=|loadingText=/
    for (const root of roots) {
      for (const file of collectExampleSources(root)) {
        const rel = relative(repoRoot, file).split('\\').join('/')
        if (pin.test(readFileSync(file, 'utf8'))) offenders.push(rel)
      }
    }
    expect(offenders).toEqual([])
  })
})
