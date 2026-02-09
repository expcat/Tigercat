/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { LineChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'

const basicData = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 40 },
  { x: 'Mar', y: 35 }
]

const defaultSize = { width: 300, height: 200 }

describe('LineChart', () => {
  it('renders line path', () => {
    const { container } = renderWithProps(LineChart, {
      data: basicData,
      ...defaultSize
    })

    const paths = container.querySelectorAll('path[data-line-series]')
    expect(paths.length).toBeGreaterThan(0)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(LineChart, {
      data: basicData
    })

    await expectNoA11yViolations(container)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(LineChart, {
      data: [],
      width: 300,
      height: 200
    })

    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders data points when showPoints is true', () => {
    const { container } = renderWithProps(LineChart, {
      data: basicData,
      showPoints: true,
      width: 300,
      height: 200
    })

    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(basicData.length)
  })

  it('renders multiple series', () => {
    const { container } = renderWithProps(LineChart, {
      series: [
        { name: 'Series A', data: basicData },
        { name: 'Series B', data: basicData }
      ],
      width: 300,
      height: 200
    })

    const paths = container.querySelectorAll('path[data-line-series]')
    expect(paths.length).toBe(2)
  })

  it('renders legend when showLegend is true', () => {
    const { container } = renderWithProps(LineChart, {
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

  it('supports different curve types', () => {
    const curves = ['linear', 'monotone', 'step', 'natural'] as const

    curves.forEach((curve) => {
      const { container } = renderWithProps(LineChart, {
        data: basicData,
        curve,
        width: 300,
        height: 200
      })

      expect(container.querySelector('path')).toBeTruthy()
    })
  })

  it('hides axis when showAxis is false', () => {
    const { container } = renderWithProps(LineChart, {
      data: basicData,
      showAxis: false,
      width: 300,
      height: 200
    })

    const axes = container.querySelectorAll('[data-axis]')
    expect(axes).toHaveLength(0)
  })

  it('applies custom colors', () => {
    const { container } = renderWithProps(LineChart, {
      series: [
        { name: 'A', data: basicData, color: '#ff0000' },
        { name: 'B', data: basicData, color: '#00ff00' }
      ],
      width: 300,
      height: 200
    })

    const paths = container.querySelectorAll('path[data-line-series]')
    expect(paths[0]).toHaveAttribute('stroke', '#ff0000')
    expect(paths[1]).toHaveAttribute('stroke', '#00ff00')
  })

  it('renders area fill when showArea is true', () => {
    const { container } = renderWithProps(LineChart, {
      data: basicData,
      showArea: true,
      width: 300,
      height: 200
    })

    const areaPath = container.querySelector('path[data-area-series]')
    expect(areaPath).toBeTruthy()
    const gradient = container.querySelector('linearGradient')
    expect(gradient).toBeTruthy()
  })

  it('renders hollow points when pointHollow is true', () => {
    const { container } = renderWithProps(LineChart, {
      data: basicData,
      showPoints: true,
      pointHollow: true,
      width: 300,
      height: 200
    })

    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(basicData.length)
    expect(circles[0]).toHaveAttribute('fill', 'white')
    expect(circles[0].getAttribute('stroke')).not.toBe('none')
  })

  it('applies animation attributes when animated is true', () => {
    const { container } = renderWithProps(LineChart, {
      data: basicData,
      animated: true,
      width: 300,
      height: 200
    })

    const path = container.querySelector('path[data-line-series]')
    expect(path).toBeTruthy()
    expect(path!.classList.contains('tiger-line-animated')).toBe(true)
    expect(path!.getAttribute('pathLength')).toBe('1')
  })

  it('supports per-series showArea', () => {
    const { container } = renderWithProps(LineChart, {
      series: [
        { name: 'A', data: basicData, showArea: true },
        { name: 'B', data: basicData }
      ],
      width: 300,
      height: 200
    })

    const areaPaths = container.querySelectorAll('path[data-area-series]')
    expect(areaPaths.length).toBe(1)
  })
})
