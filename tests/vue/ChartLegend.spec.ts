/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { ChartLegend } from '@expcat/tigercat-vue'
import { renderWithProps } from '../utils'

const items = [
  { index: 0, label: 'Series A', color: '#2563eb', active: true },
  { index: 1, label: 'Series B', color: '#22c55e', active: true },
  { index: 2, label: 'Series C', color: '#f97316', active: false }
]

describe('ChartLegend', () => {
  it('renders legend items with labels and markers', () => {
    const { container } = renderWithProps(ChartLegend, { items })

    expect(container.querySelectorAll('[data-legend-item]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-legend-marker]')).toHaveLength(3)
    expect(container.textContent).toContain('Series A')
    expect(container.textContent).toContain('Series B')
    expect(container.textContent).toContain('Series C')
  })

  it('applies inactive style to inactive items', () => {
    const { container } = renderWithProps(ChartLegend, { items })

    const legendItems = container.querySelectorAll('[data-legend-item]')
    expect(legendItems[2].className).toContain('opacity')
  })

  it('renders correct layout for position', () => {
    const { container: bottom } = renderWithProps(ChartLegend, { items, position: 'bottom' })
    expect(bottom.querySelector('[data-chart-legend]')?.className).toContain('flex-row')

    const { container: right } = renderWithProps(ChartLegend, { items, position: 'right' })
    expect(right.querySelector('[data-chart-legend]')?.className).toContain('flex-col')
  })

  it('emits item-click event when interactive', async () => {
    const onItemClick = vi.fn()
    const { container } = renderWithProps(ChartLegend, {
      items,
      interactive: true,
      'onItem-click': onItemClick
    })

    const firstItem = container.querySelector('[data-legend-item]')
    firstItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(onItemClick).toHaveBeenCalledWith(0, items[0])
  })

  it('applies custom marker size and gap', () => {
    const { container } = renderWithProps(ChartLegend, { items, markerSize: 16, gap: 12 })

    expect(container.querySelector('[data-legend-marker]')).toHaveStyle({
      width: '16px',
      height: '16px'
    })
    expect(container.querySelector('[data-chart-legend]')).toHaveStyle({ gap: '12px' })
  })
})
