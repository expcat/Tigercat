/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { AreaChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'

const basicData = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 40 },
  { x: 'Mar', y: 35 }
]

const defaultSize = { width: 300, height: 200 }

describe('AreaChart', () => {
  it('renders area path', () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      ...defaultSize
    })

    const paths = container.querySelectorAll('path[data-area-series]')
    expect(paths.length).toBeGreaterThan(0)
  })

  it('applies asymmetric default padding leaving room for y-axis labels (S4)', () => {
    const { container } = renderWithProps(AreaChart, {
      data: [
        { x: 'A', y: 100 },
        { x: 'B', y: 200 }
      ],
      ...defaultSize
    })

    // ChartCanvas wraps the plot in <g transform="translate(padding.left, padding.top)">.
    // The default must stay generous enough that 3-digit / currency y-axis tick labels
    // and the bottom x-axis label are not clipped.
    const wrapper = container.querySelector('g[transform]')
    const m = /translate\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)/.exec(
      wrapper?.getAttribute('transform') || ''
    )
    expect(m).not.toBeNull()
    expect(Number(m![1])).toBeGreaterThanOrEqual(40)
    expect(Number(m![2])).toBeGreaterThanOrEqual(16)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData
    })

    await expectNoA11yViolationsIsolated(container)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(AreaChart, {
      data: [],
      width: 300,
      height: 200
    })

    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders data points when showPoints is true', () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      showPoints: true,
      width: 300,
      height: 200
    })

    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(basicData.length)
  })
  it('renders animation styles when animated is true', () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      animated: true,
      ...defaultSize
    })

    const styleEl = container.querySelector('style')
    expect(styleEl?.textContent).toContain('tiger-area-animated')
  })
  it('handles series, legend, point, and keyboard interactions', () => {
    const onHoveredIndexChange = vi.fn()
    const onSelectedIndexChange = vi.fn()
    const onSeriesHover = vi.fn()
    const onSeriesClick = vi.fn()
    const onPointHover = vi.fn()
    const onPointClick = vi.fn()

    const { container } = renderWithProps(AreaChart, {
      series: [
        { name: 'Series A', data: basicData, showPoints: true, pointHollow: true },
        { name: 'Series B', data: basicData, showPoints: true, strokeDasharray: '4 2' }
      ],
      showPoints: true,
      hoverable: true,
      selectable: true,
      showLegend: true,
      pointGradient: true,
      strokeGradient: true,
      animated: true,
      legendFormatter: (series, index) => `${index}:${series.name}`,
      tooltipFormatter: (datum, seriesIndex) => `s${seriesIndex}:${datum.y}`,
      onHoveredIndexChange,
      onSelectedIndexChange,
      onSeriesHover,
      onSeriesClick,
      onPointHover,
      onPointClick,
      ...defaultSize
    })

    const seriesGroups = container.querySelectorAll('g[data-series-type="area"]')
    fireEvent.mouseEnter(seriesGroups[0])
    fireEvent.mouseLeave(seriesGroups[0])
    fireEvent.click(seriesGroups[0])
    fireEvent.keyDown(seriesGroups[0], { key: 'Enter' })
    fireEvent.keyDown(seriesGroups[0], { key: 'Escape' })

    expect(onHoveredIndexChange).toHaveBeenCalledWith(expect.any(Number))
    expect(onSeriesHover).toHaveBeenCalledWith(expect.any(Number), expect.any(Object))
    expect(onSeriesHover).toHaveBeenCalledWith(null, null)
    expect(onSelectedIndexChange).toHaveBeenCalledWith(expect.any(Number))
    expect(onSeriesClick).toHaveBeenCalled()

    const point = container.querySelector('circle[data-point-index="0"]')!
    fireEvent.mouseEnter(point, { clientX: 10, clientY: 20 })
    fireEvent.mouseMove(point, { clientX: 30, clientY: 40 })
    fireEvent.click(point)
    fireEvent.mouseLeave(point)

    expect(onPointHover).toHaveBeenCalledWith(expect.any(Number), 0, expect.any(Object))
    expect(onPointHover).toHaveBeenCalledWith(null, null, null)
    expect(onPointClick).toHaveBeenCalledWith(expect.any(Number), 0, expect.any(Object))
    expect(container.querySelector('radialGradient')).toBeInTheDocument()
    expect(container.querySelector('linearGradient[id*="stroke"]')).toBeInTheDocument()
  })

  it('gates point interaction and keyboard focus behind hoverable or point click handlers', () => {
    const onPointClick = vi.fn()

    const passive = renderWithProps(AreaChart, {
      data: basicData,
      showPoints: true,
      ...defaultSize
    })
    const passivePoint = passive.container.querySelector('circle[data-point-index="0"]')!
    expect(passivePoint).toHaveAttribute('role', 'img')
    expect(passivePoint).not.toHaveAttribute('tabindex')

    const clickable = renderWithProps(AreaChart, {
      data: basicData,
      showPoints: true,
      onPointClick,
      ...defaultSize
    })
    const clickablePoint = clickable.container.querySelector('circle[data-point-index="0"]')!
    expect(clickablePoint).toHaveAttribute('role', 'button')
    expect(clickablePoint).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(clickablePoint, { key: ' ' })
    expect(onPointClick).toHaveBeenCalledWith(0, 0, expect.any(Object))
  })
})
