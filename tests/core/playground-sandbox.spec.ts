/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createCompilerClient } from '../../examples/example/shared/playground/compiler-client'
import {
  createSandboxDocument,
  getSandboxAttribute,
  measureSandboxContentHeight,
  reserveSandboxToastClearance
} from '../../examples/example/shared/playground/sandbox'
import { DEMO_OVERLAY_STAGE_HEIGHT } from '../../examples/example/shared/playground/viewport'
import {
  diagnosticsIncludeWasmOutOfMemory,
  isBenignSandboxRuntimeError,
  isWasmOutOfMemoryError
} from '../../examples/example/shared/playground/sandbox-errors'
import type {
  DemoCompileRequest,
  DemoSourceBundle
} from '../../examples/example/shared/playground/types'

const WASM_OOM =
  'WebAssembly.instantiate(): Out of memory: Cannot allocate Wasm memory for new instance'

const bundle: DemoSourceBundle = {
  entry: '/App.vue',
  files: { '/App.vue': '<template><div /></template>' },
  sourceHash: 'test'
}

function sandboxOptions(enableTailwindJit?: boolean) {
  return {
    framework: 'vue' as const,
    meta: { id: 'demo', title: 'Demo', entry: '/App.vue', order: 1 },
    js: 'export default {}',
    css: '',
    imports: [] as string[],
    runtimeUrls: {
      framework: 'https://example.test/vue.js',
      tigercat: 'https://example.test/tigercat.js',
      core: 'https://example.test/core.js',
      iconsRegistry: 'https://example.test/icons-registry.js',
      shared: 'https://example.test/shared.js',
      tailwind: 'https://example.test/tailwind.js'
    },
    stylesheetUrl: 'https://example.test/parent.css',
    channelId: 'channel-1',
    lang: 'zh-CN' as const,
    theme: 'classic',
    colorScheme: 'light' as const,
    cssVars: '',
    enableTailwindJit
  }
}

describe('example playground sandbox', () => {
  beforeEach(() => {
    const sources: Record<string, string> = {
      '/parent.css': 'body { color: red }',
      '/vue.js': 'export const framework = true',
      '/tigercat.js': 'export { core } from "./core.js"',
      '/core.js': 'export const core = true',
      '/icons-registry.js': 'export const iconsRegistry = true',
      '/shared.js': 'export const shared = true',
      '/tailwind.js': 'globalThis.tailwindLoaded = true'
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const source = sources[new URL(url).pathname]
        return new Response(source ?? 'Not found', { status: source === undefined ? 404 : 200 })
      })
    )
  })

  afterEach(() => vi.unstubAllGlobals())

  it('keeps script and form support without granting access to the parent origin', () => {
    const tokens = getSandboxAttribute({
      ...sandboxOptions().meta,
      permissions: ['downloads', 'modals', 'popups', 'fullscreen']
    }).split(' ')
    expect(tokens).toContain('allow-scripts')
    expect(tokens).toContain('allow-forms')
    expect(tokens).not.toContain('allow-same-origin')
    expect(tokens).toContain('allow-downloads')
    expect(tokens).toContain('allow-modals')
    expect(tokens).toContain('allow-popups')
  })

  it('treats Chrome ResizeObserver loop notices as benign', () => {
    expect(
      isBenignSandboxRuntimeError('ResizeObserver loop completed with undelivered notifications.')
    ).toBe(true)
    expect(isBenignSandboxRuntimeError('TypeError: boom')).toBe(false)
  })

  it('detects Wasm out-of-memory compile diagnostics', () => {
    expect(isWasmOutOfMemoryError(WASM_OOM)).toBe(true)
    expect(diagnosticsIncludeWasmOutOfMemory([{ text: WASM_OOM }])).toBe(true)
    expect(diagnosticsIncludeWasmOutOfMemory([{ text: 'syntax error' }])).toBe(false)
  })

  it('measures content height instead of the stretched iframe', () => {
    document.body.innerHTML = '<div id="root" style="height:72px">demo</div>'
    document.documentElement.style.minHeight = '100%'
    document.body.style.minHeight = '100%'
    const scrollHeight = function (this: HTMLElement) {
      return this.style.minHeight === '0' ? 72 : 520
    }
    Object.defineProperty(document.body, 'scrollHeight', {
      configurable: true,
      get: scrollHeight
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get: scrollHeight
    })

    expect(measureSandboxContentHeight(document)).toBe(72)
    expect(document.documentElement.style.minHeight).toBe('100%')
    expect(document.body.style.minHeight).toBe('100%')

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      get() {
        return 520
      }
    })
    expect(measureSandboxContentHeight(document)).toBe(72)

    const layer = document.createElement('div')
    layer.setAttribute('data-tiger-overlay-layer', '')
    layer.getBoundingClientRect = () =>
      ({
        bottom: 210,
        height: 120,
        top: 90,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 90,
        toJSON() {
          return {}
        }
      }) as DOMRect
    document.body.appendChild(layer)
    expect(measureSandboxContentHeight(document)).toBe(210)

    const hidden = document.createElement('div')
    hidden.setAttribute('data-tiger-overlay-layer', '')
    hidden.hidden = true
    hidden.getBoundingClientRect = () =>
      ({
        bottom: 900,
        height: 900,
        top: 0,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON() {
          return {}
        }
      }) as DOMRect
    document.body.appendChild(hidden)
    expect(measureSandboxContentHeight(document)).toBe(210)
  })

  it('sizes an open modal to its panel instead of the short iframe', () => {
    document.body.innerHTML = '<div id="root" style="height:72px">demo</div>'
    const layer = document.createElement('div')
    layer.setAttribute('data-tiger-overlay-layer', '')
    layer.setAttribute('data-tiger-modal-root', '')
    layer.getBoundingClientRect = () =>
      ({
        bottom: 120,
        height: 120,
        top: 0,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 0,
        toJSON() {
          return {}
        }
      }) as DOMRect
    const panel = document.createElement('div')
    panel.setAttribute('data-tiger-modal', '')
    panel.style.maxHeight = '90px'
    panel.getBoundingClientRect = () => {
      const relaxed = panel.style.maxHeight === 'none'
      const height = relaxed ? 240 : 90
      return {
        bottom: 64 + height,
        height,
        top: 64,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 64,
        toJSON() {
          return {}
        }
      } as DOMRect
    }
    layer.appendChild(panel)
    document.body.appendChild(layer)
    expect(measureSandboxContentHeight(document)).toBe(304)
    expect(panel.style.maxHeight).toBe('90px')
  })

  it('reserves a stage for an open side drawer that stretches to the iframe', () => {
    document.body.innerHTML = '<div id="root" style="height:72px">demo</div>'
    const layer = document.createElement('div')
    layer.setAttribute('data-tiger-overlay-layer', '')
    layer.setAttribute('data-tiger-drawer-root', '')
    const panel = document.createElement('div')
    panel.setAttribute('data-tiger-drawer', '')
    panel.style.position = 'absolute'
    panel.style.top = '0px'
    panel.style.bottom = '0px'
    layer.appendChild(panel)
    document.body.appendChild(layer)
    expect(measureSandboxContentHeight(document)).toBe(DEMO_OVERLAY_STAGE_HEIGHT)
  })

  it('includes an open message stack that is position fixed', () => {
    document.body.innerHTML = '<div id="root" style="height:72px">demo</div>'
    const toast = document.createElement('div')
    toast.setAttribute('data-tiger-message-container', '')
    toast.getBoundingClientRect = () =>
      ({
        bottom: 148,
        height: 104,
        top: 44,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 44,
        toJSON() {
          return {}
        }
      }) as DOMRect
    document.body.appendChild(toast)
    expect(measureSandboxContentHeight(document)).toBe(148)

    toast.hidden = true
    expect(measureSandboxContentHeight(document)).toBe(72)
  })

  it('includes an open notification stack that is position fixed', () => {
    document.body.innerHTML = '<div id="root" style="height:72px">demo</div>'
    const toast = document.createElement('div')
    toast.setAttribute('data-tiger-notification-container', '')
    toast.getBoundingClientRect = () =>
      ({
        bottom: 160,
        height: 120,
        top: 40,
        left: 0,
        right: 0,
        width: 0,
        x: 0,
        y: 40,
        toJSON() {
          return {}
        }
      }) as DOMRect
    document.body.appendChild(toast)
    expect(measureSandboxContentHeight(document)).toBe(160)
  })

  it('pads the demo root so controls clear a fixed message stack', () => {
    document.body.innerHTML = '<div id="root" style="height:40px">demo</div>'
    document.body.style.paddingTop = '16px'
    document.body.style.paddingBottom = '16px'
    const toast = document.createElement('div')
    toast.setAttribute('data-tiger-message-container', '')
    toast.setAttribute('data-tiger-message-position', 'top')
    toast.getBoundingClientRect = () =>
      ({
        bottom: 68,
        height: 44,
        top: 24,
        left: 200,
        right: 420,
        width: 220,
        x: 200,
        y: 24,
        toJSON() {
          return {}
        }
      }) as DOMRect
    document.body.appendChild(toast)

    reserveSandboxToastClearance(document)
    expect(document.getElementById('root')?.style.paddingTop).toBe('60px')
    expect(document.getElementById('root')?.style.paddingBottom).toBe('')

    toast.hidden = true
    reserveSandboxToastClearance(document)
    expect(document.getElementById('root')?.style.paddingTop).toBe('')
  })

  it('pads the demo root above a bottom-fixed message stack', () => {
    document.body.innerHTML = '<div id="root">demo</div>'
    document.body.style.paddingBottom = '16px'
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 180 })
    const toast = document.createElement('div')
    toast.setAttribute('data-tiger-message-container', '')
    toast.setAttribute('data-tiger-message-position', 'bottom-left')
    toast.getBoundingClientRect = () =>
      ({
        bottom: 156,
        height: 44,
        top: 112,
        left: 24,
        right: 244,
        width: 220,
        x: 24,
        y: 112,
        toJSON() {
          return {}
        }
      }) as DOMRect
    document.body.appendChild(toast)

    reserveSandboxToastClearance(document)
    expect(document.getElementById('root')?.style.paddingBottom).toBe('60px')
    expect(document.getElementById('root')?.style.paddingTop).toBe('')
  })

  it('pads the demo root so controls clear a fixed notification stack', () => {
    document.body.innerHTML = '<div id="root" style="height:40px">demo</div>'
    document.body.style.paddingTop = '16px'
    const toast = document.createElement('div')
    toast.setAttribute('data-tiger-notification-container', '')
    toast.setAttribute('data-tiger-notification-position', 'top-left')
    toast.getBoundingClientRect = () =>
      ({
        bottom: 136,
        height: 112,
        top: 24,
        left: 24,
        right: 228,
        width: 204,
        x: 24,
        y: 24,
        toJSON() {
          return {}
        }
      }) as DOMRect
    document.body.appendChild(toast)

    reserveSandboxToastClearance(document)
    expect(document.getElementById('root')?.style.paddingTop).toBe('128px')
  })

  it('inlines the content-height measurement in the sandbox document', async () => {
    const stock = await createSandboxDocument(sandboxOptions())
    expect(stock).toContain('function measureSandboxContentHeight')
    expect(stock).toContain('data-tiger-overlay-layer')
    expect(stock).toContain('data-tiger-modal')
    expect(stock).toContain('data-tiger-message-container')
    expect(stock).toContain('data-tiger-notification-container')
    expect(stock).toContain('function reserveSandboxToastClearance')
    expect(stock).toContain('reserveSandboxToastClearance(document)')
    expect(stock).toContain(`overlayStageHeight = ${DEMO_OVERLAY_STAGE_HEIGHT}`)
  })

  it('maps the icons registry subpath to the module that exports rocketIcon', async () => {
    const { rocketIcon } =
      await import('../../examples/example/shared/playground/runtime-icons-registry')
    expect(rocketIcon.viewBox).toBe('0 0 24 24')
    expect(rocketIcon.paths.length).toBeGreaterThan(0)

    const doc = await createSandboxDocument({
      ...sandboxOptions(),
      imports: ['@expcat/tigercat-core/icons/registry', '@expcat/tigercat-core']
    })
    expect(doc).toContain('"@expcat/tigercat-core/icons/registry"')
    expect(doc).toContain('export const iconsRegistry = true')
    expect(doc).toContain('"@expcat/tigercat-core"')
    expect(doc).toContain('export const core = true')
  })

  it('inlines runtime dependencies and styles, loading Tailwind only for edited demos', async () => {
    const stock = await createSandboxDocument(sandboxOptions())
    expect(stock).toContain('body { color: red }')
    expect(stock).toContain('export const core = true')
    expect(stock).not.toContain('https://example.test/')
    expect(stock).not.toContain('tailwindLoaded')

    const edited = await createSandboxDocument(sandboxOptions(true))
    expect(edited).toContain('globalThis.tailwindLoaded = true')
    expect(edited).not.toContain('https://example.test/')
  })

  it('terminates the compiler worker and retries once after Wasm OOM', async () => {
    let created = 0
    let attempts = 0

    const client = createCompilerClient(() => {
      created += 1
      return {
        onmessage: null,
        onmessageerror: null,
        onerror: null,
        postMessage(data: DemoCompileRequest) {
          attempts += 1
          queueMicrotask(() => {
            const payload =
              attempts === 1
                ? {
                    type: 'compile-error' as const,
                    requestId: data.requestId,
                    diagnostics: [{ text: WASM_OOM }]
                  }
                : {
                    type: 'compiled' as const,
                    requestId: data.requestId,
                    js: 'ok',
                    css: '',
                    imports: []
                  }
            this.onmessage?.({ data: payload } as MessageEvent)
          })
        },
        terminate() {}
      } as unknown as Worker
    })

    const result = await client.compile(bundle)
    expect(result.js).toBe('ok')
    expect(created).toBe(2)
    expect(attempts).toBe(2)
  })
})
