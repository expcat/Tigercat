import React from 'react'
import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WaterfallChart } from '@expcat/tigercat-react/WaterfallChart'
import { SankeyChart } from '@expcat/tigercat-react/SankeyChart'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import type { WaterfallChartProps } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
    const chart = <WaterfallChart {...props} />
    const { container } = render(chart)
    const ssr = document.createElement('div')
    ssr.innerHTML = renderToStaticMarkup(chart)

    for (const root of [container, ssr]) {
      expect(root.querySelector('[data-waterfall-bar="total"]')).toHaveAccessibleName('期初')
      expect(root.querySelector('[data-waterfall-bar="increase"]')).toHaveAccessibleName('新增')
    }
    await expectNoA11yViolationsIsolated(container)
  })

  it('passes padding and desc to the canvas in the DOM and SSR', () => {
    const desc = '期初与新增金额'
    const chart = <WaterfallChart {...props} padding={40} desc={desc} />
    const { container } = render(chart)
    const ssr = document.createElement('div')
    ssr.innerHTML = renderToStaticMarkup(chart)

    for (const root of [container, ssr]) {
      expect(root.querySelector('svg > g')).toHaveAttribute('transform', 'translate(40, 40)')
      expect(root.querySelector('[data-waterfall-bar="total"]')).toHaveAttribute('y', '50')
      expect(root.querySelector('svg > desc')).toHaveTextContent(desc)
    }
  })

  it('names an untitled waterfall from the zh-CN locale', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <WaterfallChart {...props} title={undefined} />
      </ConfigProvider>
    )
    expect(container.querySelector('svg')).toHaveAttribute('aria-label', '瀑布图')
  })

  it('forwards native attributes to the root', () => {
    const { container } = render(<WaterfallChart {...props} id="balance" data-source="sales" />)
    expect(container.firstElementChild).toHaveAttribute('id', 'balance')
    expect(container.firstElementChild).toHaveAttribute('data-source', 'sales')
  })

  it('uses component locale and label overrides for chart and export names', () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <WaterfallChart
          {...props}
          title={undefined}
          locale={zhCN}
          labels={{ waterfallChartAriaLabel: '销售瀑布图' }}
        />
        <SankeyChart nodes={[]} links={[]} locale={zhCN} labels={{ exportText: '下载流向图' }} />
      </ConfigProvider>
    )
    expect(getByRole('group', { name: '销售瀑布图' })).toBeInTheDocument()
    expect(getByRole('button', { name: '导出图表' })).toBeInTheDocument()
    expect(getByRole('group', { name: '图表' })).toBeInTheDocument()
    expect(getByRole('button', { name: '下载流向图' })).toBeInTheDocument()
  })
})
