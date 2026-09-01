/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadarChart } from '@expcat/tigercat-react/RadarChart'
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
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      title: 'Skills'
    })
    await expectNoA11yViolations(container)
  })

  it('uses a single tab stop when interactive', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      hoverable: true,
      showTooltip: true
    })
    const points = container.querySelectorAll('circle[data-radar-point]')
    expect(points[0]).toHaveAttribute('role', 'button')
    expect(points[0]).toHaveAttribute('tabindex', '0')
    expect(points[1]).toHaveAttribute('tabindex', '-1')
  })

  it('hides decorative points from the accessibility tree by default', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      showTooltip: false
    })
    const point = container.querySelector('circle[data-radar-point]')!
    expect(point).toHaveAttribute('aria-hidden', 'true')
    expect(point).not.toHaveAttribute('role')
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

    const points = container.querySelectorAll('circle[data-radar-point]')
    expect(points).toHaveLength(3)
    await user.hover(points[0])

    // ChartTooltip should be visible in body
    await vi.waitFor(() => {
      const tooltip = document.querySelector('[data-chart-tooltip]')
      expect(tooltip).toBeTruthy()
    })
  })

  it('opens the tooltip on point hover without hoverable', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      showTooltip: true
    })

    const point = container.querySelector('circle[data-radar-point][data-point-index="0"]')!
    fireEvent.mouseEnter(point)
    const tooltip = document.body.querySelector('[data-chart-tooltip]')
    expect(tooltip).toBeTruthy()
    expect(tooltip).toHaveAttribute('role', 'tooltip')
    expect(tooltip?.className).not.toContain('opacity-0')
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

  it('renders polygon split areas as evenodd rings without a --tiger-bg punch', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      showSplitArea: true
    })
    const splitAreas = container.querySelectorAll('[data-radar-split-area]')
    expect(splitAreas.length).toBeGreaterThan(0)
    const html = container.innerHTML
    expect(html).not.toMatch(/--tiger-bg,#fff/i)
    expect(html).not.toMatch(/--tiger-bg,#ffffff/i)
    expect(html).not.toMatch(/--tiger-bg,\s*#fff/i)
    for (const el of splitAreas) {
      const fill = (el.getAttribute('fill') || '').toLowerCase()
      expect(fill).not.toBe('#fff')
      expect(fill).not.toBe('#ffffff')
      for (const sibling of Array.from(el.parentElement?.children ?? [])) {
        if (sibling === el) continue
        const siblingFill = (sibling.getAttribute('fill') || '').toLowerCase()
        expect(siblingFill).not.toBe('#fff')
        expect(siblingFill).not.toBe('#ffffff')
        expect(siblingFill).not.toMatch(/--tiger-bg/)
      }
    }
    expect(
      container.querySelectorAll('path[data-radar-split-area][fill-rule="evenodd"]').length
    ).toBeGreaterThan(0)
  })

  it('renders circle split areas as evenodd rings without a --tiger-bg punch', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      gridShape: 'circle',
      showSplitArea: true
    })
    const splitAreas = container.querySelectorAll('[data-radar-split-area]')
    expect(splitAreas.length).toBeGreaterThan(0)
    const html = container.innerHTML
    expect(html).not.toMatch(/--tiger-bg,#fff/i)
    expect(html).not.toMatch(/--tiger-bg,#ffffff/i)
    expect(html).not.toMatch(/--tiger-bg,\s*#fff/i)
    expect(
      container.querySelectorAll('path[data-radar-split-area][fill-rule="evenodd"]').length
    ).toBeGreaterThan(0)
  })

  it('applies custom splitAreaColors to split fills', () => {
    const { container } = renderWithProps(RadarChart, {
      data: singleSeriesData,
      showSplitArea: true,
      splitAreaColors: ['#f8fafc', '#eef2ff']
    })
    const fills = Array.from(container.querySelectorAll('[data-radar-split-area]')).map((el) =>
      el.getAttribute('fill')
    )
    expect(fills.length).toBeGreaterThan(0)
    expect(fills).toContain('#f8fafc')
    expect(fills).toContain('#eef2ff')
  })
})
