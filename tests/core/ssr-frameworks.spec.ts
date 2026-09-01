import { describe, expect, it, vi } from 'vitest'
import { act, createElement, type ReactNode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString as renderReactToString } from 'react-dom/server'
import { createSSRApp, h, type App } from 'vue'
import { renderToString as renderVueToString } from '@vue/server-renderer'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { BarChart as ReactBarChart } from '@expcat/tigercat-react/BarChart'
import { Button as ReactButton } from '@expcat/tigercat-react/Button'
import { ConfigProvider as ReactConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { DatePicker as ReactDatePicker } from '@expcat/tigercat-react/DatePicker'
import { BarChart as VueBarChart } from '@expcat/tigercat-vue/BarChart'
import { Button as VueButton } from '@expcat/tigercat-vue/Button'
import { ConfigProvider as VueConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { DatePicker as VueDatePicker } from '@expcat/tigercat-vue/DatePicker'

const selectedDate = '2024-01-15'
const reactChartData = [
  { x: 'React SSR', y: 22 },
  { x: 'Hydration', y: 28 },
  { x: 'Next', y: 19 }
]
const vueChartData = [
  { x: 'Vue SSR', y: 18 },
  { x: 'Hydration', y: 24 },
  { x: 'Nuxt', y: 16 }
]

function stringifyLog(value: unknown): string {
  if (typeof value === 'string') return value
  if (value instanceof Error) return value.message
  return String(value)
}

function isHydrationMismatch(value: unknown): boolean {
  const text = stringifyLog(value)
  return /hydrat/i.test(text) && /mismatch|did not match|failed|text content/i.test(text)
}

function expectSmokeHtml(html: string, title: string): void {
  expect(html).toContain('保存')
  expect(html).toContain(selectedDate)
  expect(html).toContain('tiger-bar-grad-')
  expect(html).toContain('url(#')
  expect(html).toContain(title)
}

function createReactSmokeTree(): ReactNode {
  return createElement(
    ReactConfigProvider,
    { locale: zhCN, colorScheme: 'light' },
    createElement(ReactButton, { variant: 'primary' }, '保存'),
    createElement(ReactDatePicker, {
      value: selectedDate,
      format: 'yyyy-MM-dd',
      onChange: () => undefined
    }),
    createElement(ReactBarChart, {
      data: reactChartData,
      width: 420,
      height: 240,
      title: 'Next SSR chart',
      desc: 'Bar chart rendered through Next.js SSR',
      gradient: true
    })
  )
}

function createVueSmokeApp(): App {
  return createSSRApp({
    render() {
      return h(VueConfigProvider, { locale: zhCN, colorScheme: 'light' }, () => [
        h(VueButton, { variant: 'primary' }, () => '保存'),
        h(VueDatePicker, {
          modelValue: selectedDate,
          format: 'yyyy-MM-dd',
          'onUpdate:modelValue': () => undefined
        }),
        h(VueBarChart, {
          data: vueChartData,
          width: 420,
          height: 240,
          title: 'Nuxt SSR chart',
          desc: 'Bar chart rendered through Nuxt SSR',
          gradient: true
        })
      ])
    }
  })
}

describe('SSR framework smoke coverage', () => {
  it('renders the Next example tree to stable HTML', () => {
    const first = renderReactToString(createReactSmokeTree())
    const second = renderReactToString(createReactSmokeTree())

    expect(first).toBe(second)
    expectSmokeHtml(first, 'Next SSR chart')
  })

  it('hydrates the Next example tree without mismatch', async () => {
    const html = renderReactToString(createReactSmokeTree())
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)

    const recoverable: unknown[] = []
    const consoleErrors: unknown[] = []
    const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      consoleErrors.push(...args)
    })

    const root = await act(async () =>
      hydrateRoot(container, createReactSmokeTree(), {
        onRecoverableError(error) {
          recoverable.push(error)
        }
      })
    )

    spy.mockRestore()
    const mismatches = [...recoverable, ...consoleErrors].filter(isHydrationMismatch)
    expect(mismatches).toEqual([])
    expectSmokeHtml(container.innerHTML, 'Next SSR chart')
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it('renders the Nuxt example tree to stable HTML', async () => {
    const first = await renderVueToString(createVueSmokeApp())
    const second = await renderVueToString(createVueSmokeApp())

    expect(first).toBe(second)
    expectSmokeHtml(first, 'Nuxt SSR chart')
  })

  it('hydrates the Nuxt example tree without mismatch', async () => {
    const html = await renderVueToString(createVueSmokeApp())
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)

    const warnings: string[] = []
    const app = createVueSmokeApp()
    app.config.warnHandler = (message) => {
      warnings.push(message)
    }
    app.config.errorHandler = (error) => {
      warnings.push(stringifyLog(error))
    }

    app.mount(container)
    expect(warnings.filter(isHydrationMismatch)).toEqual([])
    expectSmokeHtml(container.innerHTML, 'Nuxt SSR chart')
    app.unmount()
    container.remove()
  })
})
