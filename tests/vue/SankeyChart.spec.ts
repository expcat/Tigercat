import { render } from '@testing-library/vue'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { SankeyChart } from '@expcat/tigercat-vue/SankeyChart'
import type { SankeyChartProps } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

const props: SankeyChartProps = {
  nodes: [
    { id: 'source', label: '来源' },
    { id: 'left', label: '左支' }
  ],
  links: [{ source: 'source', target: 'left', value: 8 }],
  responsive: false,
  title: '流向'
}

describe('SankeyChart', () => {
  it('names nodes from layout labels in the DOM and SSR', async () => {
    const { container } = render(SankeyChart, { props })
    const ssr = document.createElement('div')
    ssr.innerHTML = await renderToString(h(SankeyChart, props))

    for (const root of [container, ssr]) {
      expect(root.querySelector('[data-sankey-node="source"]')).toHaveAccessibleName('来源')
      expect(root.querySelector('[data-sankey-node="left"]')).toHaveAccessibleName('左支')
    }
    await expectNoA11yViolationsIsolated(container)
  })

  it('passes padding and desc to the canvas in the DOM and SSR', async () => {
    const desc = '来源分流到左支'
    const chartProps = { ...props, padding: 40, desc }
    const { container } = render(SankeyChart, { props: chartProps })
    const ssr = document.createElement('div')
    ssr.innerHTML = await renderToString(h(SankeyChart, chartProps))

    for (const root of [container, ssr]) {
      expect(root.querySelector('svg > g')).toHaveAttribute('transform', 'translate(40, 40)')
      expect(root.querySelector('svg > desc')).toHaveTextContent(desc)
    }
  })

  it('follows the container width when responsive is omitted', () => {
    const { container } = render(SankeyChart, {
      props: { nodes: props.nodes, links: props.links }
    })
    expect(container.firstElementChild).toHaveClass('w-full')
  })

  it('merges className with the attrs class', () => {
    const { container } = render(SankeyChart, {
      props: { ...props, className: 'prop-class' },
      attrs: { class: 'attr-class' }
    })
    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveClass('prop-class')
    expect(root).toHaveClass('attr-class')
  })
})
