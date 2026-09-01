import type { DemoFramework, DemoModuleMeta, DemoRuntimeUrls, DemoSandboxEvent } from './types'

interface SandboxDocumentOptions {
  framework: DemoFramework
  meta: DemoModuleMeta
  js: string
  css: string
  imports: string[]
  runtimeUrls: DemoRuntimeUrls
  stylesheetUrl: string
  channelId: string
  lang: 'zh-CN' | 'en-US'
  theme: string
  colorScheme: 'light' | 'dark'
  cssVars: string
  modules?: Record<string, string>
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
    else if (specifier.startsWith('@expcat/tigercat-core')) map[specifier] = urls.core
  }

  return Object.fromEntries(Object.entries(map).filter(([, value]) => value))
}

export function createSandboxDocument(options: SandboxDocumentOptions): string {
  const importMap = createImportMap(options.framework, options.imports, options.runtimeUrls)
  const htmlClass = options.colorScheme === 'dark' ? 'dark' : ''
  const tigerStyleAttr =
    options.theme === 'modern' ? ' data-tiger-style="modern"' : ' data-tiger-style="classic"'
  const cssVarsAttr = options.cssVars ? ` style="${options.cssVars.replace(/"/g, '&quot;')}"` : ''
  const reactRefreshUrl =
    options.framework === 'react' && options.runtimeUrls.framework.includes('/src/')
      ? new URL('/@react-refresh', options.runtimeUrls.framework).href
      : null
  const reactRefreshPreamble = reactRefreshUrl
    ? `
        const RefreshRuntime = (await import('${reactRefreshUrl}')).default
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
        const Tiger = await import('${options.runtimeUrls.tigercat}')
        const Shared = await import('${options.runtimeUrls.shared}')
        const Context = await import('@demo-runtime/context')
        const root = createRoot(document.getElementById('root'))
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
        const Tiger = await import('${options.runtimeUrls.tigercat}')
        const Shared = await import('${options.runtimeUrls.shared}')
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
        Vue.createApp(Root).mount('#root')
      `

  return `<!doctype html>
<html lang="${options.lang}" class="${htmlClass}"${tigerStyleAttr}${cssVarsAttr}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob: http: https:; style-src 'unsafe-inline' http: https:; img-src data: blob: http: https:; font-src data: http: https:; media-src data: blob: http: https:; connect-src http: https:;" />
    <script type="importmap" id="demo-importmap">${safeJson({ imports: importMap })}</script>
    <script>
      ;(function () {
        var mapEl = document.getElementById('demo-importmap')
        if (!mapEl) return
        var json = JSON.parse(mapEl.textContent || '{"imports":{}}')
        var modules = ${safeJson(options.modules ?? {})}
        for (var spec in modules) {
          json.imports[spec] = URL.createObjectURL(
            new Blob([modules[spec]], { type: 'text/javascript' })
          )
        }
        mapEl.textContent = JSON.stringify(json)
      })()
    </script>
    <link rel="stylesheet" href="${options.stylesheetUrl}" />
    <style>${options.css}</style>
    <style>html,body{margin:0;min-height:100%;background:transparent}body{padding:1rem;box-sizing:border-box}#root{min-height:1px}</style>
    <script type="module" src="${options.runtimeUrls.tailwind}"></script>
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
        if (/ResizeObserver loop/.test(message)) return
        send({ type: 'runtime-error', message })
      })
      window.addEventListener('unhandledrejection', (event) => {
        send({ type: 'runtime-error', message: event.reason?.stack || stringify(event.reason) })
      })
      const measureHeight = () => {
        let height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
        for (const node of document.querySelectorAll('[data-tiger-overlay-layer]')) {
          const box = node.getBoundingClientRect()
          height = Math.max(height, box.bottom + window.scrollY)
          for (const child of node.querySelectorAll('*')) {
            const childBox = child.getBoundingClientRect()
            if (childBox.height > 0) height = Math.max(height, childBox.bottom + window.scrollY)
          }
        }
        return Math.ceil(height)
      }
      const sendResize = () => send({ type: 'resize', height: measureHeight() })
      new ResizeObserver(sendResize).observe(document.body)
      new MutationObserver(sendResize).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true
      })

      try {
        ${reactRefreshPreamble}
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
  const tokens = new Set(['allow-scripts', 'allow-forms', 'allow-same-origin'])
  for (const permission of meta.permissions ?? []) {
    if (permission === 'downloads') tokens.add('allow-downloads')
    if (permission === 'modals') tokens.add('allow-modals')
    if (permission === 'popups') tokens.add('allow-popups')
  }
  return [...tokens].join(' ')
}
