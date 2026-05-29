/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { AreaChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

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

  it('renders multiple series', () => {
    const { container } = renderWithProps(AreaChart, {
      series: [
        { name: 'Series A', data: basicData },
        { name: 'Series B', data: basicData }
      ],
      width: 300,
      height: 200
    })

    const paths = container.querySelectorAll('path[data-area-series]')
    expect(paths.length).toBe(2)
  })

  it('renders stacked areas', () => {
    const { container } = renderWithProps(AreaChart, {
      series: [
        { name: 'A', data: basicData },
        { name: 'B', data: basicData }
      ],
      stacked: true,
      width: 300,
      height: 200
    })

    const paths = container.querySelectorAll('path[data-area-series]')
    expect(paths.length).toBe(2)
  })

  it('renders legend when showLegend is true', () => {
    const { container } = renderWithProps(AreaChart, {
      series: [
        { name: 'Series A', data: basicData },
        { name: 'Series B', data: basicData }
      ],
      showLegend: true,
      width: 300,
      height: 200
    })

    const legend = container.querySelector('[role="list"][aria-label="Chart legend"]')
    expect(legend).toBeTruthy()
  })

  it('applies custom fillOpacity', () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      fillOpacity: 0.5,
      gradient: false,
      width: 300,
      height: 200
    })

    const areaPath = container.querySelector('path[data-area-series]')
    expect(areaPath).toHaveAttribute('fill-opacity', '0.5')
  })

  it('supports different curve types', () => {
    const curves = ['linear', 'monotone', 'step', 'natural'] as const

    curves.forEach((curve) => {
      const { container } = renderWithProps(AreaChart, {
        data: basicData,
        curve,
        width: 300,
        height: 200
      })

      expect(container.querySelector('path')).toBeTruthy()
    })
  })

  it('hides axis when showAxis is false', () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      showAxis: false,
      width: 300,
      height: 200
    })

    const axes = container.querySelectorAll('[data-axis]')
    expect(axes).toHaveLength(0)
  })

  it('renders gradient defs when gradient is true', () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      gradient: true,
      ...defaultSize
    })

    const gradients = container.querySelectorAll('linearGradient')
    expect(gradients.length).toBeGreaterThan(0)
    const areaPath = container.querySelector('path[data-area-series]')
    expect(areaPath?.getAttribute('fill')).toMatch(/^url\(#tiger-area-grad-/)
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

  it('renders hollow points when pointHollow is true', () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      showPoints: true,
      pointHollow: true,
      ...defaultSize
    })

    const circle = container.querySelector('circle')
    expect(circle?.getAttribute('fill')).toBe('white')
    expect(circle?.getAttribute('stroke')).not.toBe('none')
  })

  it('applies outline-none on series group', () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      ...defaultSize
    })

    const seriesGroup = container.querySelector('g[data-series-type="area"]')
    expect(seriesGroup?.getAttribute('class')).toContain('outline-none')
  })

  it('handles series, legend, point, and keyboard interactions', async () => {
    const { container, emitted } = renderWithProps(AreaChart, {
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
      legendFormatter: (series: { name?: string }, index: number) => `${index}:${series.name}`,
      tooltipFormatter: (datum: { y: number }, seriesIndex: number) => `s${seriesIndex}:${datum.y}`,
      ...defaultSize
    })

    const seriesGroups = container.querySelectorAll('g[data-series-type="area"]')
    await fireEvent.mouseEnter(seriesGroups[0])
    await fireEvent.mouseLeave(seriesGroups[0])
    await fireEvent.click(seriesGroups[0])
    await fireEvent.keyDown(seriesGroups[0], { key: 'Enter' })
    await fireEvent.keyDown(seriesGroups[0], { key: 'Escape' })

    expect(emitted()['series-hover']).toBeTruthy()
    expect(emitted()['series-click']).toBeTruthy()
    expect(emitted()['update:selectedIndex']).toBeTruthy()

    const point = container.querySelector('circle[data-point-index="0"]')!
    await fireEvent.mouseEnter(point, { clientX: 10, clientY: 20 })
    await fireEvent.mouseMove(point, { clientX: 30, clientY: 40 })
    await fireEvent.click(point)
    await fireEvent.mouseLeave(point)

    expect(emitted()['point-hover']).toBeTruthy()
    expect(emitted()['point-click']).toBeTruthy()
    expect(container.querySelector('radialGradient')).toBeInTheDocument()
    expect(container.querySelector('linearGradient[id*="stroke"]')).toBeInTheDocument()
  })
})
