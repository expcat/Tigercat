import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { FunnelChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'
import { fireEvent, render } from '@testing-library/react'

const defaultSize = { width: 320, height: 300 }

const sampleData = [
  { label: 'Visit', value: 100 },
  { label: 'Cart', value: 60 },
  { label: 'Purchase', value: 20 }
]

describe('FunnelChart (React)', () => {
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
      onHoveredIndexChange,
      ...defaultSize
    })

    const paths = container.querySelector('g[data-series-type="funnel"]')!.querySelectorAll('path')
    fireEvent.mouseEnter(paths[0])
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
    fireEvent.click(paths[1])
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
      const { container } = render(<FunnelChart data={sampleData} width={320} height={300} />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
