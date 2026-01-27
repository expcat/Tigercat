/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import { RadarChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'

const singleSeriesData = [
  { label: 'A', value: 80 },
  { label: 'B', value: 65 },
  { label: 'C', value: 90 }
]

const multiSeriesData = [
  { name: 'Series A', data: singleSeriesData },
  {
    name: 'Series B',
    data: [
      { label: 'A', value: 70 },
      { label: 'B', value: 75 },
      { label: 'C', value: 60 }
    ]
  }
]

describe('RadarChart', () => {
  it('renders radar area and points', () => {
    const { container } = renderWithProps(RadarChart, { data: singleSeriesData })

    expect(container.querySelectorAll('path[data-radar-area]')).toHaveLength(1)
    expect(container.querySelectorAll('circle[data-radar-point]')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(RadarChart, { data: singleSeriesData })
    await expectNoA11yViolations(container)
  })

  it('renders multiple series', () => {
    const { container } = renderWithProps(RadarChart, { series: multiSeriesData })
    expect(container.querySelectorAll('path[data-radar-area]')).toHaveLength(2)
  })

  it('renders level labels when enabled', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      levels: 3,
      showLevelLabels: true
    })

    expect(container.querySelectorAll('text[data-radar-level-label]')).toHaveLength(3)
  })

  it('applies hover highlight opacity', () => {
    const { container } = renderWithProps(RadarChart, {
      series: multiSeriesData,
      hoverable: true,
      hoveredIndex: 1,
      activeOpacity: 1,
      inactiveOpacity: 0.25
    })

    expect(container.querySelector('g[data-series-name="Series A"]')).toHaveAttribute(
      'opacity',
      '0.25'
    )
    expect(container.querySelector('g[data-series-name="Series B"]')).toHaveAttribute(
      'opacity',
      '1'
    )
  })

  it('handles tooltip display', () => {
    const { container } = renderWithProps(RadarChart, { data: singleSeriesData })
    expect(container.querySelectorAll('circle[data-radar-point] title')).toHaveLength(3)

    const { container: noTooltip } = renderWithProps(RadarChart, {
      data: singleSeriesData.slice(0, 2),
      showTooltip: false
    })
    expect(noTooltip.querySelectorAll('circle[data-radar-point] title')).toHaveLength(0)
  })

  it('selects series on click when selectable', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProps(RadarChart, {
      series: multiSeriesData,
      selectable: true,
      inactiveOpacity: 0.25
    })

    const seriesA = container.querySelector('g[data-series-name="Series A"]') as SVGGElement
    await user.click(seriesA)

    expect(seriesA).toHaveAttribute('opacity', '1')
    expect(container.querySelector('g[data-series-name="Series B"]')).toHaveAttribute(
      'opacity',
      '0.25'
    )
  })

  it('renders legend when enabled', () => {
    const { container } = renderWithProps(RadarChart, {
      series: [
        { name: 'Series A', data: [{ label: 'A', value: 80 }] },
        { name: 'Series B', data: [{ label: 'A', value: 70 }] }
      ],
      showLegend: true
    })

    expect(container.querySelectorAll('button')).toHaveLength(2)
  })
})
