import { render } from '@testing-library/vue'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { WaterfallChart } from '@expcat/tigercat-vue/WaterfallChart'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { WaterfallChartProps } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

const props: WaterfallChartProps = {
  data: [
    { label: '期初', value: 120, kind: 'total' },
    { label: '新增', value: 40, kind: 'increase' }
  ],
  responsive: false,
  title: '收支'
}

describe('WaterfallChart', () => {
  it('names bars from layout labels in the DOM and SSR', async () => {
    const { container } = render(WaterfallChart, { props })
    const ssr = document.createElement('div')
    ssr.innerHTML = await renderToString(h(WaterfallChart, props))

    for (const root of [container, ssr]) {
      expect(root.querySelector('[data-waterfall-bar="total"]')).toHaveAccessibleName('期初')
      expect(root.querySelector('[data-waterfall-bar="increase"]')).toHaveAccessibleName('新增')
    }
    await expectNoA11yViolationsIsolated(container)
  })

  it('passes padding and desc to the canvas in the DOM and SSR', async () => {
    const desc = '期初与新增金额'
    const chartProps = { ...props, padding: 40, desc }
    const { container } = render(WaterfallChart, { props: chartProps })
    const ssr = document.createElement('div')
    ssr.innerHTML = await renderToString(h(WaterfallChart, chartProps))

    for (const root of [container, ssr]) {
      expect(root.querySelector('svg > g')).toHaveAttribute('transform', 'translate(40, 40)')
      expect(root.querySelector('[data-waterfall-bar="total"]')).toHaveAttribute('y', '50')
      expect(root.querySelector('svg > desc')).toHaveTextContent(desc)
    }
  })

  it('names an untitled waterfall from the zh-CN locale', () => {
    const { container } = render({
      render: () =>
        h(ConfigProvider, { locale: zhCN }, () => h(WaterfallChart, { ...props, title: undefined }))
    })
    expect(container.querySelector('svg')).toHaveAttribute('aria-label', '瀑布图')
  })
})
