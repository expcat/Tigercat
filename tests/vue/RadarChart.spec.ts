/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { RadarChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

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
    await expectNoA11yViolationsIsolated(container)
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

  it('handles tooltip display', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      hoverable: true,
      showTooltip: true
    })

    // Points should be hoverable when showTooltip and hoverable are true
    const points = container.querySelectorAll('circle[data-radar-point]')
    expect(points).toHaveLength(3)

    // Each point should have cursor-pointer class
    points.forEach((point) => {
      expect(point.getAttribute('class')).toContain('cursor-pointer')
    })

    // Hover over a point to show tooltip
    await user.hover(points[0])

    // ChartTooltip should be visible in body
    await vi.waitFor(() => {
      const tooltip = document.querySelector('[data-chart-tooltip]')
      expect(tooltip).toBeTruthy()
    })

    // When showTooltip is false, points should not be hoverable
    const { container: noTooltip } = renderWithProps(RadarChart, {
      data: singleSeriesData.slice(0, 2),
      showTooltip: false,
      hoverable: true
    })
    const noTooltipPoints = noTooltip.querySelectorAll('circle[data-radar-point]')
    noTooltipPoints.forEach((point) => {
      const className = point.getAttribute('class') || ''
      expect(className).not.toContain('cursor-pointer')
    })
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

    expect(container.querySelectorAll('[data-legend-item]')).toHaveLength(2)
  })

  it('renders circle grid when gridShape is circle', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      gridShape: 'circle',
      levels: 4
    })

    // Should render circles instead of polygon paths for grid
    const svgCircles = container.querySelectorAll('svg circle')
    // 4 grid circles + 3 data point circles = 7
    expect(svgCircles.length).toBeGreaterThanOrEqual(4)
  })

  it('renders split area when showSplitArea is enabled', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      showSplitArea: true,
      levels: 3
    })

    expect(container.querySelectorAll('[data-radar-split-area]').length).toBeGreaterThanOrEqual(1)
  })

  it('renders point borders', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      pointBorderWidth: 2,
      pointBorderColor: '#fff'
    })

    const points = container.querySelectorAll('circle[data-radar-point]')
    expect(points).toHaveLength(3)
    points.forEach((point) => {
      expect(point.getAttribute('stroke')).toBe('#fff')
      expect(point.getAttribute('stroke-width')).toBe('2')
    })
  })

  it('renders circle grid with split area', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      gridShape: 'circle',
      showSplitArea: true,
      levels: 3
    })

    expect(container.querySelectorAll('[data-radar-split-area]').length).toBeGreaterThanOrEqual(1)
  })

  it('handles series, legend, point, and keyboard interactions', async () => {
    const { container, emitted } = renderWithProps(RadarChart, {
      series: multiSeriesData.map((item, index) => ({
        ...item,
        color: index === 0 ? '#2563eb' : '#16a34a',
        fillOpacity: 0.35,
        pointSize: 4,
        pointColor: index === 0 ? '#1d4ed8' : '#15803d'
      })),
      hoverable: true,
      selectable: true,
      showLegend: true,
      showTooltip: true,
      gradient: true,
      strokeGradient: true,
      pointGradient: true,
      showSplitArea: true,
      splitAreaColors: ['#f8fafc', '#eef2ff'],
      showLevelLabels: true,
      levelLabelFormatter: (value: number, level: number) => `${level}:${Math.round(value)}`,
      labelFormatter: (datum: { label?: string }, index: number) => `${index}-${datum.label}`,
      legendFormatter: (series: { name?: string }, index: number) => `${index}:${series.name}`,
      tooltipFormatter: (datum: { value: number }, seriesIndex: number) =>
        `s${seriesIndex}:${datum.value}`,
      labelAutoAlign: false
    })

    const seriesGroups = container.querySelectorAll('g[data-series-type="radar"]')
    await fireEvent.mouseEnter(seriesGroups[0], { clientX: 10, clientY: 20 })
    await fireEvent.mouseMove(seriesGroups[0], { clientX: 20, clientY: 30 })
    await fireEvent.mouseLeave(seriesGroups[0])
    await fireEvent.click(seriesGroups[0])
    await fireEvent.keyDown(seriesGroups[0], { key: 'Enter' })
    await fireEvent.keyDown(seriesGroups[0], { key: 'Escape' })

    expect(emitted()['series-hover']).toBeTruthy()
    expect(emitted()['series-click']).toBeTruthy()
    expect(emitted()['update:selectedIndex']).toBeTruthy()

    const point = container.querySelector('circle[data-radar-point][data-point-index="0"]')!
    await fireEvent.mouseEnter(point, { clientX: 30, clientY: 40 })
    await fireEvent.mouseMove(point, { clientX: 40, clientY: 50 })
    await fireEvent.mouseLeave(point)

    expect(container.querySelector('linearGradient[id*="stroke"]')).toBeInTheDocument()
    expect(container.querySelector('radialGradient')).toBeInTheDocument()
    expect(container.querySelectorAll('text[data-radar-level-label]')).toHaveLength(5)
    expect(container.textContent).toContain('0-A')
  })

  it('can hide grid, axis, labels, points, legend, and tooltip layers', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      showGrid: false,
      showAxis: false,
      showLabels: false,
      showPoints: false,
      showTooltip: false,
      maxValue: 0,
      levels: 0,
      fillColor: '#f00',
      strokeColor: '#0f0'
    })

    expect(container.querySelectorAll('circle[data-radar-point]')).toHaveLength(0)
    expect(container.querySelectorAll('text')).toHaveLength(0)
    expect(container.querySelector('path[data-radar-area]')).toBeInTheDocument()
  })
})
