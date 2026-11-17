/**
 * @vitest-environment node
 */

import { describe, expect, it, vi } from 'vitest'

import { createSandboxDocument } from '../../examples/example/shared/playground/sandbox'
import { DEMO_THEME_PRESETS, resolveDemoTheme } from '../../examples/example/shared/themes'

const runtimeUrls = {
  framework: 'https://example.test/framework.js',
  renderer: 'https://example.test/renderer.js',
  jsxRuntime: 'https://example.test/jsx.js',
  tigercat: 'https://example.test/tigercat.js',
  core: 'https://example.test/core.js',
  shared: 'https://example.test/shared.js',
  tailwind: 'https://example.test/tailwind.js'
}

describe('example shell theme', () => {
  it('maps the old hex palette names onto product presets', () => {
    expect(resolveDemoTheme('green')).toBe('natural')
    expect(resolveDemoTheme('purple')).toBe('vibrant')
    expect(resolveDemoTheme('default')).toBe('default')
    expect(resolveDemoTheme('modern')).toBe('modern')
    expect(DEMO_THEME_PRESETS.map((preset) => preset.value)).toEqual([
      'default',
      'modern',
      'vibrant',
      'minimal',
      'high-contrast',
      'professional',
      'natural'
    ])
  })

  it('copies computed tokens and product theme into the sandbox document', async () => {
    const sources: Record<string, string> = {
      '/framework.js': 'export const framework = true',
      '/renderer.js': 'export const renderer = true',
      '/jsx.js': 'export const jsx = true',
      '/tigercat.js': 'export const tigercat = true',
      '/shared.js': 'export const shared = true',
      '/sandbox.css': 'body { color: red }'
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const source = sources[new URL(url).pathname]
        return new Response(source ?? 'Not found', { status: source === undefined ? 404 : 200 })
      })
    )
    try {
      const html = await createSandboxDocument({
        framework: 'react',
        meta: { id: 'button-01', title: 'Button', entry: 'App.tsx', order: 1 },
        js: 'export default function App(){return null}',
        css: '',
        imports: [],
        runtimeUrls,
        stylesheetUrl: 'https://example.test/sandbox.css',
        channelId: 'theme-test',
        lang: 'zh-CN',
        theme: 'natural',
        colorScheme: 'light',
        cssVars: '--tiger-primary:#059669;--tiger-primary-hover:#047857'
      })

      expect(html).not.toContain('https://example.test/')
      expect(html).toContain('style="--tiger-primary:#059669;--tiger-primary-hover:#047857"')
      expect(html).toContain('const theme = "natural"')
      expect(html).toContain('const colorScheme = "light"')
      expect(html).toContain('locale: Shared.getDemoTigerLocale(lang), theme, colorScheme')
      expect(html).not.toContain('document: false')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
