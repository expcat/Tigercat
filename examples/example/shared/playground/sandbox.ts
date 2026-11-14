import { init, parse } from 'es-module-lexer'
import type { DemoLang } from '../app-config'
import type { DemoFramework, DemoModuleMeta, DemoRuntimeUrls, DemoSandboxEvent } from './types'
import { RESIZE_OBSERVER_LOOP } from './sandbox-errors'

interface SandboxDocumentOptions {
  framework: DemoFramework
  meta: DemoModuleMeta
  js: string
  css: string
  imports: string[]
  runtimeUrls: DemoRuntimeUrls
  stylesheetUrl: string
  channelId: string
  lang: DemoLang
  theme: string
  colorScheme: 'light' | 'dark'
  cssVars: string
  modules?: Record<string, string>
  /** Load `@tailwindcss/browser` Wasm. Stock demos already have parent CSS. */
  enableTailwindJit?: boolean
}

function isHiddenOverlay(node: Element): boolean {
  if (!(node instanceof HTMLElement)) return true
  if (node.hidden || node.getAttribute('aria-hidden') === 'true') return true
  const view = node.ownerDocument.defaultView
  if (!view) return false
  const style = view.getComputedStyle(node)
  return style.display === 'none' || style.visibility === 'hidden'
}

/** Side drawers pin both edges, so their box is the iframe rather than content. */
function panelStretchesToViewport(panel: Element): boolean {
  const view = panel.ownerDocument.defaultView
  if (!view) return false
  const style = view.getComputedStyle(panel)
  if (style.position !== 'absolute' && style.position !== 'fixed') return false
  const top = Number.parseFloat(style.top)
  const bottom = Number.parseFloat(style.bottom)
  return Number.isFinite(top) && Number.isFinite(bottom) && top <= 1 && bottom <= 1
}

/**
 * Dialogs cap themselves with `max-height: 90dvh` and `flex-1` bodies, which
 * collapse to the current iframe. Relax those caps for one measurement so the
 * frame can grow to the panel, then shrink when it closes.
 */
function measureUnconstrainedPanelBottom(panel: HTMLElement, scrollY: number): number {
  const view = panel.ownerDocument.defaultView
  const nodes = [panel, ...panel.querySelectorAll<HTMLElement>('*')]
  const saved = nodes.map((node) => node.style.cssText)
  for (const node of nodes) {
    if (!view) break
    const style = view.getComputedStyle(node)
    const maxHeight = style.maxHeight
    const limitedByViewport =
      /(?:d|s|l)?vh\b/.test(maxHeight) ||
      (maxHeight.endsWith('px') && Number.parseFloat(maxHeight) <= (view.innerHeight || 0))
    if (limitedByViewport) node.style.maxHeight = 'none'
    if (
      style.overflowY === 'auto' ||
      style.overflowY === 'scroll' ||
      style.overflowY === 'hidden'
    ) {
      node.style.overflow = 'visible'
    }
    if (style.flexGrow !== '0') {
      node.style.flexGrow = '0'
      node.style.flexBasis = 'auto'
    }
  }
  const box = panel.getBoundingClientRect()
  const parent = panel.parentElement
  const parentStyle = parent && view ? view.getComputedStyle(parent) : null
  const padding =
    (Number.parseFloat(parentStyle?.paddingTop ?? '') || 0) +
    (Number.parseFloat(parentStyle?.paddingBottom ?? '') || 0)
  const bottom = Math.max(box.bottom + scrollY, box.height + padding)
  nodes.forEach((node, index) => {
    node.style.cssText = saved[index] ?? ''
  })
  return bottom
}

/**
 * Content height of a demo iframe. `html, body { min-height: 100% }` stretches
 * the document to the current frame. Clearing that min-height lets
 * `body.scrollHeight` fall back to in-flow content, but `html.scrollHeight`
 * stays at least the iframe viewport, so it cannot be used or the frame never
 * shrinks. Open overlays are included so the frame can grow, then shrink again.
 * Viewport-filling shells (modal / drawer) contribute their panel, not the
 * stretched iframe, so a closed trigger stays short. Fixed message and
 * notification toasts do not affect scrollHeight, so an open stack is
 * measured from its box.
 * `reserveSandboxToastClearance` shifts in-flow content out from under that
 * stack before this measurement, so the frame grows below the toast instead
 * of leaving demo controls underneath it.
 */
export function measureSandboxContentHeight(doc: Document): number {
  const html = doc.documentElement
  const body = doc.body
  if (!html || !body) return 0
  const htmlMin = html.style.minHeight
  const bodyMin = body.style.minHeight
  html.style.minHeight = '0'
  body.style.minHeight = '0'
  let height = body.scrollHeight
  const view = doc.defaultView
  const scrollY = view?.scrollY ?? 0
  // Keep this literal equal to DEMO_OVERLAY_STAGE_HEIGHT. The function is
  // copied into the iframe via toString(), so it cannot close over imports.
  const overlayStageHeight = 720
  for (const node of doc.querySelectorAll('[data-tiger-overlay-layer]')) {
    if (isHiddenOverlay(node)) continue
    const box = node.getBoundingClientRect()
    height = Math.max(height, box.bottom + scrollY)
    for (const child of node.querySelectorAll('*')) {
      const childBox = child.getBoundingClientRect()
      if (childBox.height > 0) height = Math.max(height, childBox.bottom + scrollY)
    }
    const panel = node.querySelector(
      '[data-tiger-modal]:not([data-tiger-overlay-layer]), [data-tiger-drawer]:not([data-tiger-overlay-layer])'
    )
    if (!(panel instanceof HTMLElement)) continue
    if (panelStretchesToViewport(panel)) {
      height = Math.max(height, overlayStageHeight)
      continue
    }
    height = Math.max(height, measureUnconstrainedPanelBottom(panel, scrollY))
  }
  for (const node of doc.querySelectorAll(
    '[data-tiger-message-container], [data-tiger-notification-container]'
  )) {
    if (isHiddenOverlay(node)) continue
    const box = node.getBoundingClientRect()
    if (box.height > 0) height = Math.max(height, box.bottom + scrollY)
  }
  html.style.minHeight = htmlMin
  body.style.minHeight = bodyMin
  return Math.ceil(height)
}

/**
 * Fixed message and notification stacks paint over the iframe viewport and
 * do not push layout. Pad `#root` so the demo controls clear the stack.
 */
export function reserveSandboxToastClearance(doc: Document): void {
  const root = doc.getElementById('root')
  if (!root) return
  const view = doc.defaultView
  let topInset = 0
  let bottomInset = 0
  for (const node of doc.querySelectorAll(
    '[data-tiger-message-container], [data-tiger-notification-container]'
  )) {
    if (isHiddenOverlay(node)) continue
    const box = node.getBoundingClientRect()
    if (box.height <= 0) continue
    const position =
      node.getAttribute('data-tiger-message-position') ??
      node.getAttribute('data-tiger-notification-position') ??
      'top'
    if (position.startsWith('bottom')) {
      const viewport = view?.innerHeight ?? box.bottom
      bottomInset = Math.max(bottomInset, Math.max(0, viewport - box.top))
    } else {
      topInset = Math.max(topInset, box.bottom)
    }
  }
  const gap = 8
  const body = doc.body
  const bodyStyle = body && view ? view.getComputedStyle(body) : null
  const bodyPadTop = Number.parseFloat(bodyStyle?.paddingTop ?? '') || 0
  const bodyPadBottom = Number.parseFloat(bodyStyle?.paddingBottom ?? '') || 0
  const topNeeded = topInset > 0 ? Math.max(0, Math.ceil(topInset - bodyPadTop + gap)) : 0
  const bottomNeeded =
    bottomInset > 0 ? Math.max(0, Math.ceil(bottomInset - bodyPadBottom + gap)) : 0
  root.style.paddingTop = topNeeded > 0 ? `${topNeeded}px` : ''
  root.style.paddingBottom = bottomNeeded > 0 ? `${bottomNeeded}px` : ''
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/-->/g, '--\\u003e')
}

function createImportMap(
  framework: DemoFramework,
  imports: string[],
  urls: DemoRuntimeUrls
): Record<string, string> {
  const map: Record<string, string> = {}
  const allImports = new Set(imports)

  if (framework === 'react') {
    allImports.add('react')
    allImports.add('react/jsx-runtime')
    allImports.add('react-dom/client')
    allImports.add('@demo-runtime/context')
  } else {
    allImports.add('vue')
  }
  allImports.add('@demo-shared/tiger-locale')

  for (const specifier of allImports) {
    if (specifier === 'react') map[specifier] = urls.framework
    else if (specifier === 'react/jsx-runtime') map[specifier] = urls.jsxRuntime ?? ''
    else if (specifier === 'react-dom/client') map[specifier] = urls.renderer ?? ''
    else if (specifier === 'vue') map[specifier] = urls.framework
    else if (specifier === '@demo-runtime/context') map[specifier] = urls.context ?? ''
    else if (specifier.startsWith('@demo-shared/')) map[specifier] = urls.shared
    else if (specifier.startsWith('@expcat/tigercat-react')) map[specifier] = urls.tigercat
    else if (specifier.startsWith('@expcat/tigercat-vue')) map[specifier] = urls.tigercat
    else if (specifier.startsWith('@expcat/tigercat-core/locales/')) map[specifier] = urls.shared
    else if (specifier === '@expcat/tigercat-core/icons/registry')
      map[specifier] = urls.iconsRegistry
    else if (specifier.startsWith('@expcat/tigercat-core')) map[specifier] = urls.core
  }

  return Object.fromEntries(Object.entries(map).filter(([, value]) => value))
}

async function readSandboxResource(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`无法加载示例资源：${url} (${response.status})`)
  return response.text()
}

/** Fetch in the host, then let the opaque-origin frame create its own module blobs. */
async function inlineRuntimeModules(imports: Record<string, string>): Promise<{
  imports: Record<string, string>
  modules: Record<string, string>
}> {
  await init
  const ids = new Map<string, string>()
  const modules: Record<string, string> = {}
  let pending: string[] = []
  const enqueue = (url: string): string => {
    const existing = ids.get(url)
    if (existing) return existing
    const id = `@demo-runtime/module-${ids.size}`
    ids.set(url, id)
    pending.push(url)
    return id
  }
  const mappedImports = Object.fromEntries(
    Object.entries(imports).map(([specifier, url]) => [specifier, enqueue(url)])
  )
  while (pending.length > 0) {
    const batch = pending
    pending = []
    await Promise.all(
      batch.map(async (url) => {
        let source = await readSandboxResource(url)
        const [records] = parse(source)
        for (const record of [...records].reverse()) {
          if (!record.n || !/^(?:[./]|https?:)/.test(record.n)) continue
          const id = enqueue(new URL(record.n, url).href)
          const replacement = record.d === -1 ? id : JSON.stringify(id)
          source = `${source.slice(0, record.s)}${replacement}${source.slice(record.e)}`
        }
        modules[ids.get(url)!] = source
      })
    )
  }
  return { imports: mappedImports, modules }
}

export async function createSandboxDocument(options: SandboxDocumentOptions): Promise<string> {
  const importMap = createImportMap(options.framework, options.imports, options.runtimeUrls)
  const htmlClass = options.colorScheme === 'dark' ? 'dark' : ''
  const tigerStyleAttr = options.theme ? ` data-tiger-theme="${options.theme}"` : ''
  const cssVarsAttr = options.cssVars ? ` style="${options.cssVars.replace(/"/g, '&quot;')}"` : ''
  const reactRefreshUrl =
    options.framework === 'react' && options.runtimeUrls.framework.includes('/src/')
      ? new URL('/@react-refresh', options.runtimeUrls.framework).href
      : null
  importMap['@demo-runtime/tigercat'] = options.runtimeUrls.tigercat
  importMap['@demo-runtime/shared'] = options.runtimeUrls.shared
  if (reactRefreshUrl) importMap['@demo-runtime/refresh'] = reactRefreshUrl
  if (options.enableTailwindJit) importMap['@demo-runtime/tailwind'] = options.runtimeUrls.tailwind
  const [runtime, stylesheet] = await Promise.all([
    inlineRuntimeModules(importMap),
    readSandboxResource(options.stylesheetUrl)
  ])
  const reactRefreshPreamble = reactRefreshUrl
    ? `
        const RefreshRuntime = (await import('@demo-runtime/refresh')).default
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      `
    : ''
  const mountCode =
    options.framework === 'react'
      ? `
        const ReactModule = await import('react')
        const React = ReactModule.default ?? ReactModule
        const { createRoot } = await import('react-dom/client')
        const Tiger = await import('@demo-runtime/tigercat')
        const Shared = await import('@demo-runtime/shared')
        const Context = await import('@demo-runtime/context')
        const root = createRoot(document.getElementById('root'), { identifierPrefix: channelId + '-' })
        root.render(
          React.createElement(
            Context.LangContext.Provider,
            { value: { lang } },
            React.createElement(
              Tiger.ConfigProvider,
              { locale: Shared.getDemoTigerLocale(lang), theme, colorScheme },
              React.createElement(demo.default)
            )
          )
        )
      `
      : `
        const Vue = await import('vue')
        const Tiger = await import('@demo-runtime/tigercat')
        const Shared = await import('@demo-runtime/shared')
        const Root = Vue.defineComponent({
          setup() {
            Vue.provide('demo-lang', Vue.ref(lang))
            return () => Vue.h(
              Tiger.ConfigProvider,
              { locale: Shared.getDemoTigerLocale(lang), theme, colorScheme },
              { default: () => Vue.h(demo.default) }
            )
          }
        })
        const app = Vue.createApp(Root)
        app.config.idPrefix = channelId + '-'
        app.mount('#root')
      `

  return `<!doctype html>
<html lang="${options.lang}" class="${htmlClass}"${tigerStyleAttr}${cssVarsAttr}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob: http: https:; style-src 'unsafe-inline' http: https:; img-src data: blob: http: https:; font-src data: http: https:; media-src data: blob: http: https:; connect-src http: https:;" />
    <script>
      ;(function () {
        var imports = ${safeJson(runtime.imports)}
        var modules = ${safeJson({ ...runtime.modules, ...options.modules })}
        var urls = {}
        for (var spec in modules) {
          urls[spec] = URL.createObjectURL(
            new Blob([modules[spec]], { type: 'text/javascript' })
          )
        }
        for (var spec in imports) imports[spec] = urls[imports[spec]]
        var mapEl = document.createElement('script')
        mapEl.type = 'importmap'
        mapEl.textContent = JSON.stringify({ imports: { ...imports, ...urls } })
        document.head.appendChild(mapEl)
      })()
    </script>
    <style>${stylesheet}</style>
    <style>${options.css}</style>
    <style>html,body{margin:0;min-height:100%;background:transparent}body{padding:1rem;box-sizing:border-box}#root{min-height:1px}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      const channelId = ${safeJson(options.channelId)}
      const lang = ${safeJson(options.lang)}
      const theme = ${safeJson(options.theme)}
      const colorScheme = ${safeJson(options.colorScheme)}
      const send = (event) => parent.postMessage({ channelId, ...event }, '*')
      const stringify = (value) => {
        try {
          if (typeof value === 'string') return value
          return JSON.stringify(value)
        } catch {
          return String(value)
        }
      }
      for (const level of ['log', 'info', 'warn', 'error']) {
        const original = console[level].bind(console)
        console[level] = (...args) => {
          original(...args)
          send({ type: 'console', level, message: args.map(stringify).join(' ') })
        }
      }
      window.addEventListener('error', (event) => {
        const message = event.error?.stack || event.message || ''
        if (typeof event.message === 'string' && ${RESIZE_OBSERVER_LOOP}.test(event.message)) {
          event.preventDefault()
          return
        }
        if (${RESIZE_OBSERVER_LOOP}.test(message)) return
        send({ type: 'runtime-error', message })
      })
      window.addEventListener('unhandledrejection', (event) => {
        const message = event.reason?.stack || stringify(event.reason)
        if (typeof message === 'string' && ${RESIZE_OBSERVER_LOOP}.test(message)) return
        send({ type: 'runtime-error', message })
      })
      ${isHiddenOverlay.toString()}
      ${panelStretchesToViewport.toString()}
      ${measureUnconstrainedPanelBottom.toString()}
      const measureSandboxContentHeight = ${measureSandboxContentHeight.toString()}
      const reserveSandboxToastClearance = ${reserveSandboxToastClearance.toString()}
      const measureHeight = () => {
        reserveSandboxToastClearance(document)
        return measureSandboxContentHeight(document)
      }
      let lastSentHeight = 0
      let resizeFrame = 0
      const sendResize = () => {
        if (resizeFrame) return
        resizeFrame = window.requestAnimationFrame(() => {
          resizeFrame = 0
          const height = measureHeight()
          if (height === lastSentHeight) return
          lastSentHeight = height
          send({ type: 'resize', height })
        })
      }
      new ResizeObserver(sendResize).observe(document.body)
      new MutationObserver(sendResize).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true
      })

      try {
        ${reactRefreshPreamble}
        ${options.enableTailwindJit ? "await import('@demo-runtime/tailwind')" : ''}
        const source = ${safeJson(options.js)}
        const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
        const demo = await import(url)
        if (!demo.default) throw new Error('示例入口必须默认导出组件')
        ${mountCode}
        send({ type: 'ready' })
      } catch (error) {
        send({ type: 'runtime-error', message: error?.stack || String(error) })
      }
    </script>
  </body>
</html>`
}

export function isSandboxEvent(value: unknown): value is DemoSandboxEvent {
  if (!value || typeof value !== 'object') return false
  const event = value as Partial<DemoSandboxEvent>
  return (
    typeof event.channelId === 'string' &&
    (event.type === 'ready' ||
      event.type === 'resize' ||
      event.type === 'console' ||
      event.type === 'runtime-error')
  )
}

export function getSandboxAttribute(meta: DemoModuleMeta): string {
  const tokens = new Set(['allow-scripts', 'allow-forms'])
  for (const permission of meta.permissions ?? []) {
    if (permission === 'downloads') tokens.add('allow-downloads')
    if (permission === 'modals') tokens.add('allow-modals')
    if (permission === 'popups') tokens.add('allow-popups')
  }
  return [...tokens].join(' ')
}
