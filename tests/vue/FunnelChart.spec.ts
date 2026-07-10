/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { FunnelChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'
import { render } from '@testing-library/vue'

const defaultSize = { width: 320, height: 300 }

const sampleData = [
  { label: 'Visit', value: 100 },
  { label: 'Cart', value: 60 },
  { label: 'Purchase', value: 20 }
]

describe('FunnelChart (Vue)', () => {
  it('renders SVG with segments', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
    const series = container.querySelector('g[data-series-type="funnel"]')
    expect(series).toBeTruthy()
    expect(series!.querySelectorAll('path')).toHaveLength(3)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
    const series = container.querySelector('g[data-series-type="funnel"]')
    expect(series!.querySelectorAll('path')).toHaveLength(0)
  })
  it('renders with horizontal direction', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      direction: 'horizontal',
      ...defaultSize
    })

    const paths = container.querySelector('g[data-series-type="funnel"]')!.querySelectorAll('path')
    expect(paths).toHaveLength(3)
  })
  it('triggers hover events when hoverable', () => {
    const onHoveredIndexChange = vi.fn()
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      hoverable: true,
      'onUpdate:hoveredIndex': onHoveredIndexChange,
      ...defaultSize
    })

    const paths = container.querySelector('g[data-series-type="funnel"]')!.querySelectorAll('path')
    paths[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
  })

  it('triggers click events when selectable', () => {
    const onSegmentClick = vi.fn()
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      selectable: true,
      onSegmentClick,
      ...defaultSize
    })

    const paths = container.querySelector('g[data-series-type="funnel"]')!.querySelectorAll('path')
    paths[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onSegmentClick).toHaveBeenCalled()
  })

  it('applies className', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      className: 'my-funnel',
      ...defaultSize
    })

    expect(container.querySelector('svg.my-funnel')).toBeTruthy()
  })

  it('renders a11y title and desc', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      title: 'Funnel Title',
      desc: 'Funnel Description',
      ...defaultSize
    })

    expect(container.querySelector('title')?.textContent).toBe('Funnel Title')
    expect(container.querySelector('desc')?.textContent).toBe('Funnel Description')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(FunnelChart, {
        props: { data: sampleData, width: 320, height: 300 }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
