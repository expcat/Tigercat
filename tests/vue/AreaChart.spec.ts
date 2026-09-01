/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { AreaChart } from '@expcat/tigercat-vue/AreaChart'
import { renderWithProps, expectNoA11yViolations } from '../utils'

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
      data: basicData,
      title: 'Traffic'
    })

    await expectNoA11yViolations(container)
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
  it('applies the draw class when animated is true', () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      animated: true,
      ...defaultSize
    })

    expect(container.querySelector('.tiger-area-animated')).toBeTruthy()
    expect(container.querySelector('style')).toBeNull()
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

  it('gates point interaction and keyboard focus behind hoverable or point click handlers', async () => {
    const passive = renderWithProps(AreaChart, {
      data: basicData,
      showPoints: true,
      ...defaultSize
    })
    const passivePoint = passive.container.querySelector('circle[data-point-index="0"]')!
    expect(passivePoint).toHaveAttribute('aria-hidden', 'true')
    expect(passivePoint).not.toHaveAttribute('role')
    expect(passivePoint).not.toHaveAttribute('tabindex')

    const clickable = renderWithProps(AreaChart, {
      data: basicData,
      showPoints: true,
      onPointClick: () => {},
      ...defaultSize
    })
    const clickablePoint = clickable.container.querySelector('circle[data-point-index="0"]')!
    expect(clickablePoint).toHaveAttribute('role', 'button')
    expect(clickablePoint).toHaveAttribute('tabindex', '0')
    await fireEvent.keyDown(clickablePoint, { key: ' ' })
    expect(clickable.emitted()['point-click']).toBeTruthy()
  })

  it('does not paint a fill gradient by default and still tracks the plot', async () => {
    const { container } = renderWithProps(AreaChart, {
      data: basicData,
      ...defaultSize
    })
    expect(container.querySelector('linearGradient')).toBeNull()
    await fireEvent.mouseMove(container.querySelector('[data-plot-hit]')!, {
      clientX: 40,
      clientY: 40
    })
    expect(document.body.querySelector('[data-chart-tooltip]')).toBeTruthy()
  })

  it('renders stacked series without rewriting a dashed stroke', () => {
    const { container } = renderWithProps(AreaChart, {
      series: [
        {
          name: 'A',
          data: [
            { x: 'Jan', y: 4 },
            { x: 'Feb', y: 8 }
          ]
        },
        {
          name: 'B',
          data: [
            { x: 'Jan', y: 2 },
            { x: 'Mar', y: -1 }
          ],
          strokeDasharray: '4 2'
        }
      ],
      stacked: true,
      curve: 'monotone',
      animated: true,
      ...defaultSize
    })
    expect(container.querySelectorAll('path[data-area-series]')).toHaveLength(2)
    const dashed = container.querySelector('path[stroke-dasharray="4 2"]')
    expect(dashed).toBeTruthy()
    expect(dashed).not.toHaveAttribute('pathLength')
  })
})
