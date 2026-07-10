/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { LineChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

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

  it('applies asymmetric default padding leaving room for y-axis labels (S4)', () => {
    const { container } = renderWithProps(LineChart, {
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
    const { container } = renderWithProps(LineChart, {
      data: basicData
    })

    await expectNoA11yViolationsIsolated(container)
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
  it('keeps named series SVG identities stable when series are inserted', async () => {
    const alpha = { name: 'Alpha Series', data: basicData, showArea: true }
    const beta = { name: 'Beta Series', data: basicData, showArea: true }
    const inserted = { name: 'Inserted Series', data: basicData, showArea: true }

    const props = {
      series: [alpha, beta],
      showArea: true,
      strokeGradient: true,
      pointGradient: true,
      showPoints: true,
      width: 300,
      height: 200
    }
    const { container, rerender } = renderWithProps(LineChart, props)

    const alphaArea = container.querySelector(
      'path[data-area-series="0"][data-series-key="line-alpha-series"]'
    )
    const alphaLine = container.querySelector(
      'path[data-line-series="0"][data-series-key="line-alpha-series"]'
    )
    const alphaAreaFill = alphaArea?.getAttribute('fill')
    const alphaLineStroke = alphaLine?.getAttribute('stroke')

    expect(alphaAreaFill).toContain('line-alpha-series')
    expect(alphaLineStroke).toContain('line-alpha-series')

    await rerender({ ...props, series: [inserted, alpha, beta] })

    const movedAlphaArea = container.querySelector(
      'path[data-area-series="1"][data-series-key="line-alpha-series"]'
    )
    const movedAlphaLine = container.querySelector(
      'path[data-line-series="1"][data-series-key="line-alpha-series"]'
    )

    expect(movedAlphaArea?.getAttribute('fill')).toBe(alphaAreaFill)
    expect(movedAlphaLine?.getAttribute('stroke')).toBe(alphaLineStroke)
  })

  it('gates point interaction and keyboard focus behind hoverable or point click handlers', async () => {
    const passive = renderWithProps(LineChart, {
      data: basicData,
      showPoints: true,
      ...defaultSize
    })
    const passivePoint = passive.container.querySelector('circle[data-point-index="0"]')!
    expect(passivePoint).toHaveAttribute('role', 'img')
    expect(passivePoint).not.toHaveAttribute('tabindex')

    const clickable = renderWithProps(LineChart, {
      data: basicData,
      showPoints: true,
      onPointClick: () => {},
      ...defaultSize
    })
    const clickablePoint = clickable.container.querySelector('circle[data-point-index="0"]')!
    expect(clickablePoint).toHaveAttribute('role', 'button')
    expect(clickablePoint).toHaveAttribute('tabindex', '0')
    await fireEvent.keyDown(clickablePoint, { key: 'Enter' })
    expect(clickable.emitted()['point-click']).toBeTruthy()
  })
})
