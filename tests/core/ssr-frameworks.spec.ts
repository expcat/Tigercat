import { describe, expect, it } from 'vitest'
import React, { createElement } from 'react'
import { renderToString as renderReactToString } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString as renderVueToString } from '@vue/server-renderer'
import { BackTop as ReactBackTop } from '@expcat/tigercat-react/BackTop'
import { BarChart as ReactBarChart } from '@expcat/tigercat-react/BarChart'
import { ConfigProvider as ReactConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { DatePicker as ReactDatePicker } from '@expcat/tigercat-react/DatePicker'
import { BackTop as VueBackTop } from '@expcat/tigercat-vue/BackTop'
import { BarChart as VueBarChart } from '@expcat/tigercat-vue/BarChart'
import { ConfigProvider as VueConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { DatePicker as VueDatePicker } from '@expcat/tigercat-vue/DatePicker'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

const selectedDate = new Date(2024, 0, 15)
const chartData = [
  { x: 'SSR', y: 12 },
  { x: 'Hydration', y: 18 }
]

function renderReactSsrTree(): string {
  return renderReactToString(
    createElement(
      ReactConfigProvider,
      { locale: zhCN },
      createElement('section', null, [
        createElement(ReactDatePicker, {
          key: 'date',
          value: selectedDate,
          locale: 'zh-CN'
        }),
        createElement(ReactBackTop, { key: 'backtop' }),
        createElement(ReactBarChart, {
          key: 'chart',
          data: chartData,
          width: 320,
          height: 200,
          title: 'React SSR chart',
          gradient: true
        })
      ])
    )
  )
}

async function renderVueSsrTree(): Promise<string> {
  const app = createSSRApp({
    render() {
      return h(VueConfigProvider, { locale: zhCN }, () => [
        h(VueDatePicker, {
          modelValue: selectedDate,
          locale: 'zh-CN'
        }),
        h(VueBackTop),
        h(VueBarChart, {
          data: chartData,
          width: 320,
          height: 200,
          title: 'Vue SSR chart',
          gradient: true
        })
      ])
    }
  })

  return renderVueToString(app)
}

describe('SSR framework smoke coverage', () => {
  it('renders React components to stable HTML for Next.js SSR', () => {
    const first = renderReactSsrTree()
    const second = renderReactSsrTree()

    expect(first).toBe(second)
    expect(first).toContain('tiger-bar-grad-')
    expect(first).toContain('React SSR chart')
    expect(first).toContain('2024-01-15')
  })

  it('renders Vue components to stable HTML for Nuxt SSR', async () => {
    const first = await renderVueSsrTree()
    const second = await renderVueSsrTree()

    expect(first).toBe(second)
    expect(first).toContain('tiger-bar-grad-')
    expect(first).toContain('Vue SSR chart')
    expect(first).toContain('2024-01-15')
  })
})
