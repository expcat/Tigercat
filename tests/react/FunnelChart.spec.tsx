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

  it('renders segment labels', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      ...defaultSize
    })

    const texts = container.querySelectorAll('text')
    expect(texts.length).toBeGreaterThanOrEqual(3)
  })

  it('uses custom colors', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff']
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      colors: customColors,
      ...defaultSize
    })

    const paths = container.querySelector('g[data-series-type="funnel"]')!.querySelectorAll('path')
    expect(paths[0]).toHaveAttribute('fill', '#ff0000')
    expect(paths[1]).toHaveAttribute('fill', '#00ff00')
    expect(paths[2]).toHaveAttribute('fill', '#0000ff')
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

  it('applies gradient when enabled', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      gradient: true,
      ...defaultSize
    })

    expect(container.querySelector('defs linearGradient')).toBeTruthy()
  })

  it('renders legend when showLegend is true', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      showLegend: true,
      ...defaultSize
    })

    expect(container.querySelector('[role="list"][aria-label="Chart legend"]')).toBeTruthy()
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
  it('renders single segment without errors', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: [{ label: 'Only', value: 100 }],
      ...defaultSize
    })
    const series = container.querySelector('g[data-series-type="funnel"]')
    expect(series!.querySelectorAll('path')).toHaveLength(1)
  })

  it('renders with minimal dimensions', () => {
    const { container } = renderWithProps(FunnelChart, {
      data: sampleData,
      width: 100,
      height: 80
    })
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '100')
    expect(svg).toHaveAttribute('height', '80')
  })
})
