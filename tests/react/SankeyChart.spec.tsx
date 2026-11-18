import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SankeyChart } from '@expcat/tigercat-react/SankeyChart'
import type { SankeyChartProps } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
    const chart = <SankeyChart {...props} />
    const { container } = render(chart)
    const ssr = document.createElement('div')
    ssr.innerHTML = renderToStaticMarkup(chart)

    for (const root of [container, ssr]) {
      expect(root.querySelector('[data-sankey-node="source"]')).toHaveAccessibleName('来源')
      expect(root.querySelector('[data-sankey-node="left"]')).toHaveAccessibleName('左支')
    }
    await expectNoA11yViolationsIsolated(container)
  })

  it('passes padding and desc to the canvas in the DOM and SSR', () => {
    const desc = '来源分流到左支'
    const chart = <SankeyChart {...props} padding={40} desc={desc} />
    const { container } = render(chart)
    const ssr = document.createElement('div')
    ssr.innerHTML = renderToStaticMarkup(chart)

    for (const root of [container, ssr]) {
      expect(root.querySelector('svg > g')).toHaveAttribute('transform', 'translate(40, 40)')
      expect(root.querySelector('svg > desc')).toHaveTextContent(desc)
    }
  })

  it('follows the container width when responsive is omitted', () => {
    const { container } = render(<SankeyChart nodes={props.nodes} links={props.links} />)
    expect(container.firstElementChild).toHaveClass('w-full')
  })

  it('forwards native attributes and events to the root', () => {
    const onClick = vi.fn()
    const { container } = render(
      <SankeyChart
        {...props}
        id="flow"
        data-source="sales"
        style={{ opacity: 0.8 }}
        onClick={onClick}
      />
    )
    const root = container.firstElementChild!
    expect(root).toHaveAttribute('id', 'flow')
    expect(root).toHaveAttribute('data-source', 'sales')
    expect(root).toHaveStyle({ opacity: '0.8' })
    fireEvent.click(root)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
