/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadarChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'

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

  it('handles series, legend, point, and keyboard interactions', () => {
    const onHoveredIndexChange = vi.fn()
    const onSelectedIndexChange = vi.fn()
    const onSeriesHover = vi.fn()
    const onSeriesClick = vi.fn()

    const { container } = renderWithProps(RadarChart, {
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
      levelLabelFormatter: (value, level) => `${level}:${Math.round(value)}`,
      labelFormatter: (datum, index) => `${index}-${datum.label}`,
      legendFormatter: (series, index) => `${index}:${series.name}`,
      tooltipFormatter: (datum, seriesIndex) => `s${seriesIndex}:${datum.value}`,
      labelAutoAlign: false,
      onHoveredIndexChange,
      onSelectedIndexChange,
      onSeriesHover,
      onSeriesClick
    })

    const seriesGroups = container.querySelectorAll('g[data-series-type="radar"]')
    fireEvent.mouseEnter(seriesGroups[0], { clientX: 10, clientY: 20 })
    fireEvent.mouseMove(seriesGroups[0], { clientX: 20, clientY: 30 })
    fireEvent.mouseLeave(seriesGroups[0])
    fireEvent.click(seriesGroups[0])
    fireEvent.keyDown(seriesGroups[0], { key: 'Enter' })
    fireEvent.keyDown(seriesGroups[0], { key: 'Escape' })

    expect(onHoveredIndexChange).toHaveBeenCalledWith(expect.any(Number))
    expect(onSeriesHover).toHaveBeenCalledWith(expect.any(Number), expect.any(Object))
    expect(onSeriesHover).toHaveBeenCalledWith(null, null)
    expect(onSelectedIndexChange).toHaveBeenCalledWith(expect.any(Number))
    expect(onSeriesClick).toHaveBeenCalled()

    const point = container.querySelector('circle[data-radar-point][data-point-index="0"]')!
    fireEvent.mouseEnter(point, { clientX: 30, clientY: 40 })
    fireEvent.mouseMove(point, { clientX: 40, clientY: 50 })
    fireEvent.mouseLeave(point)

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
