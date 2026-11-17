/**
 * @vitest-environment happy-dom
 *
 * Merged from: ChartAxis, ChartCanvas, ChartGrid, ChartLegend, ChartSeries, ChartTooltip
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { act, waitFor, cleanup, fireEvent, render } from '@testing-library/react'
import { ChartAxis } from '@expcat/tigercat-react/ChartAxis'
import { ChartCanvas } from '@expcat/tigercat-react/ChartCanvas'
import { ChartGrid } from '@expcat/tigercat-react/ChartGrid'
import { ChartLegend } from '@expcat/tigercat-react/ChartLegend'
import { ChartSeries } from '@expcat/tigercat-react/ChartSeries'
import { ChartTooltip } from '@expcat/tigercat-react/ChartTooltip'
import type { ChartAxisProps } from '@expcat/tigercat-react/ChartAxis'
import { createLinearScale } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
import { MockResizeObserver } from '../utils/mock-observers'
import { installFrameScheduler } from '../utils/frame-scheduler'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const scale = createLinearScale([0, 100], [0, 200])
const xScale = createLinearScale([0, 100], [0, 200])
const yScale = createLinearScale([0, 100], [100, 0])
const tickValues = [0, 50, 100]

// ---------------------------------------------------------------------------
// SVG wrappers (React sub-components render <g> elements, need parent <svg>)
// ---------------------------------------------------------------------------

const ChartAxisWrapper: React.FC<ChartAxisProps> = (props) => (
  <svg>
    <ChartAxis {...props} />
  </svg>
)

const ChartGridWrapper: React.FC<React.ComponentProps<typeof ChartGrid>> = (props) => (
  <svg>
    <ChartGrid {...props} />
  </svg>
)

const ChartSeriesWrapper: React.FC<React.ComponentProps<typeof ChartSeries>> = (props) => (
  <svg>
    <ChartSeries {...props} />
  </svg>
)

// ===========================================================================
// ChartAxis
// ===========================================================================

describe('ChartAxis', () => {
  it('renders ticks and label', () => {
    const { container } = renderWithProps(ChartAxisWrapper, { scale, tickValues, label: 'Value' })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
    expect(container.querySelector('[data-axis-label]')).toHaveTextContent('Value')
  })

  it('keeps tick text in the accessibility tree', () => {
    const { container } = renderWithProps(ChartAxisWrapper, { scale, tickValues, label: 'Value' })
    expect(container.querySelector('g')).not.toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('[data-axis-label]')).toHaveTextContent('Value')
  })

  it('keeps a caller aria-hidden on the root and omits it when absent', () => {
    const hidden = renderWithProps(ChartAxisWrapper, {
      scale,
      tickValues,
      'aria-hidden': true
    })
    expect(hidden.container.querySelector('g')).toHaveAttribute('aria-hidden', 'true')
    hidden.unmount()

    const plain = renderWithProps(ChartAxisWrapper, { scale, tickValues })
    expect(plain.container.querySelector('g')).not.toHaveAttribute('aria-hidden')
  })
})

// ===========================================================================
// ChartCanvas
// ===========================================================================

describe('ChartCanvas', () => {
  afterEach(() => {
    MockResizeObserver.reset()
    vi.unstubAllGlobals()
  })

  it('renders svg with padding transform', () => {
    const { container } = renderWithProps(ChartCanvas, {
      width: 300,
      height: 160,
      padding: { left: 12, top: 8, right: 6, bottom: 4 }
    })

    const svg = container.querySelector('svg')
    const group = container.querySelector('g')

    expect(svg).toHaveAttribute('width', '300')
    expect(svg).toHaveAttribute('height', '160')
    expect(group).toHaveAttribute('transform', 'translate(12, 8)')
  })

  it('preserves caller aria references without a title or description', () => {
    const { container } = renderWithProps(ChartCanvas, {
      'aria-labelledby': 'sales-label',
      'aria-describedby': 'sales-description'
    })
    expect(container.querySelector('svg')).toHaveAttribute('aria-labelledby', 'sales-label')
    expect(container.querySelector('svg')).toHaveAttribute('aria-describedby', 'sales-description')
  })

  it('uses an explicit aria-label before the title', () => {
    const { container } = renderWithProps(ChartCanvas, { title: 'Sales', 'aria-label': 'Custom' })
    expect(container.querySelector('svg')).toHaveAccessibleName('Custom')
  })

  it('resizes responsively with ResizeObserver and rAF batching', async () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    const frames = installFrameScheduler()
    const { container } = renderWithProps(ChartCanvas, {
      width: 300,
      height: 160,
      responsive: true,
      padding: { left: 12, top: 8, right: 6, bottom: 4 }
    })

    await waitFor(() => expect(MockResizeObserver.instances).toHaveLength(1))
    const svg = container.querySelector('svg')
    const group = container.querySelector('g')
    const observer = MockResizeObserver.instances[0]

    act(() => {
      observer.trigger(360, 180)
      observer.trigger(480, 260)
    })

    expect(frames.requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(svg).toHaveAttribute('width', '300')

    act(() => {
      frames.flush()
    })

    expect(svg).toHaveAttribute('width', '480')
    expect(svg).toHaveAttribute('height', '260')
    expect(svg).toHaveAttribute('viewBox', '0 0 480 260')
    expect(group).toHaveAttribute('transform', 'translate(12, 8)')
  })

  it('reports resolved size after ResizeObserver and rAF', async () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    const frames = installFrameScheduler()
    const onResolvedSizeChange = vi.fn()
    renderWithProps(ChartCanvas, {
      width: 300,
      height: 160,
      responsive: true,
      onResolvedSizeChange
    })

    await waitFor(() => expect(MockResizeObserver.instances).toHaveLength(1))
    const observer = MockResizeObserver.instances[0]

    act(() => {
      observer.trigger(360, 180)
      observer.trigger(480, 260)
    })
    act(() => {
      frames.flush()
    })

    expect(onResolvedSizeChange).toHaveBeenCalledWith({ width: 480, height: 260 })
  })

  it('observes its own host instead of a legend sibling', async () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    const { container } = render(
      <div data-testid="shell">
        <ChartCanvas width={320} height={200} responsive />
        <div data-testid="legend" style={{ height: 40 }} />
      </div>
    )

    await waitFor(() => expect(MockResizeObserver.instances).toHaveLength(1))
    const host = container.querySelector('[data-chart-canvas-host]')
    expect(MockResizeObserver.instances[0].observe).toHaveBeenCalledWith(host)
    expect(host).not.toBe(container.querySelector('[data-testid="shell"]'))
  })

  it('names the svg when a title is provided', async () => {
    const { container } = renderWithProps(ChartCanvas, { title: 'Sales', desc: 'Quarterly' })
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('role', 'group')
    expect(svg?.querySelector('title')).toHaveTextContent('Sales')
    await expectNoA11yViolations(container)
  })
})

// ===========================================================================
// ChartGrid
// ===========================================================================

describe('ChartGrid', () => {
  it('draws vertical lines from xScale and height', () => {
    const { container } = renderWithProps(ChartGridWrapper, {
      xScale,
      show: 'x',
      height: 80,
      xTickValues: [0, 50, 100]
    })
    const lines = container.querySelectorAll('line')
    expect(lines.length).toBe(3)
    expect(container.querySelector('g')).toHaveAttribute('aria-hidden', 'true')
  })
})

// ===========================================================================
// ChartLegend
// ===========================================================================

const legendItems = [
  { index: 0, label: 'Series A', color: '#2563eb', active: true, selected: true },
  { index: 1, label: 'Series B', color: '#22c55e', active: true, selected: false },
  { index: 2, label: 'Series C', color: '#f97316', active: false, selected: false }
]

describe('ChartLegend', () => {
  it('chains root leave and blur listeners even when interaction is disabled', () => {
    const calls: string[] = []
    const onItemLeave = vi.fn(() => calls.push('internal'))
    const onMouseLeave = vi.fn(() => calls.push('mouseleave'))
    const onBlur = vi.fn(() => calls.push('blur'))
    const props = { items: legendItems, onItemLeave, onMouseLeave, onBlur }
    const { getByRole, rerender } = render(<ChartLegend {...props} interactive />)
    const legend = getByRole('group')
    fireEvent.mouseLeave(legend)
    fireEvent.blur(legend)
    expect(calls).toEqual(['internal', 'mouseleave', 'internal', 'blur'])

    fireEvent.blur(legend, { relatedTarget: getByRole('button', { name: 'Series B' }) })
    expect(onItemLeave).toHaveBeenCalledTimes(2)
    expect(onBlur).toHaveBeenCalledTimes(2)

    rerender(<ChartLegend {...props} interactive={false} />)
    fireEvent.mouseLeave(getByRole('list'))
    fireEvent.blur(getByRole('list'))
    expect(onItemLeave).toHaveBeenCalledTimes(2)
    expect(onMouseLeave).toHaveBeenCalledTimes(2)
    expect(onBlur).toHaveBeenCalledTimes(3)
    expect(calls.slice(-2)).toEqual(['mouseleave', 'blur'])
  })

  it('renders legend items with labels and markers', () => {
    const { container } = renderWithProps(ChartLegend, { items: legendItems })

    expect(container.querySelectorAll('[data-legend-item]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-legend-marker]')).toHaveLength(3)
    expect(container.textContent).toContain('Series A')
    expect(container.textContent).toContain('Series B')
    expect(container.textContent).toContain('Series C')
  })

  it('calls onItemClick when interactive', () => {
    const onItemClick = vi.fn()
    const { container } = renderWithProps(ChartLegend, {
      items: legendItems,
      interactive: true,
      onItemClick
    })

    const firstItem = container.querySelector('[data-legend-item]')
    if (firstItem) fireEvent.click(firstItem)

    expect(onItemClick).toHaveBeenCalledWith(0, legendItems[0])
  })

  it('uses button toggle semantics (not listitem) when interactive (C25-3)', () => {
    const { container } = renderWithProps(ChartLegend, {
      items: legendItems,
      interactive: true
    })
    const group = container.querySelector('[data-chart-legend]')!
    expect(group).toHaveAttribute('role', 'group')

    const items = container.querySelectorAll('[data-legend-item]')
    expect(items[0].tagName).toBe('BUTTON')
    expect(items[0]).not.toHaveAttribute('role', 'listitem')
    expect(items[0]).toHaveAttribute('aria-pressed', 'true')
    expect(items[1]).toHaveAttribute('aria-pressed', 'false')
    expect(items[2]).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps list semantics for the static legend', () => {
    const { container } = renderWithProps(ChartLegend, { items: legendItems })
    expect(container.querySelector('[data-chart-legend]')).toHaveAttribute('role', 'list')
    const items = container.querySelectorAll('[data-legend-item]')
    expect(items[0]).toHaveAttribute('role', 'listitem')
    expect(items[0]).not.toHaveAttribute('aria-pressed')
  })
  it('calls hover callbacks when interactive', () => {
    const onItemHover = vi.fn()
    const onItemLeave = vi.fn()
    const { container } = renderWithProps(ChartLegend, {
      items: legendItems,
      interactive: true,
      onItemHover,
      onItemLeave
    })

    const firstItem = container.querySelector('[data-legend-item]')
    const group = container.querySelector('[data-chart-legend]')
    if (firstItem && group) {
      fireEvent.mouseEnter(firstItem)
      expect(onItemHover).toHaveBeenCalledWith(0, legendItems[0], expect.anything())

      fireEvent.mouseLeave(group)
      expect(onItemLeave).toHaveBeenCalled()
    }
  })
})

// ===========================================================================
// ChartSeries
// ===========================================================================

describe('ChartSeries', () => {
  it.each(['custom', undefined] as const)('preserves caller paint with type %s', (type) => {
    const { container } = renderWithProps(ChartSeriesWrapper, {
      data: [{ x: 0, y: 10 }],
      type,
      color: '#2563eb',
      fill: 'red',
      stroke: 'green'
    })
    expect(container.querySelector('g')).toHaveAttribute('fill', 'red')
    expect(container.querySelector('g')).toHaveAttribute('stroke', 'green')
  })

  it('does not fill a line series group', () => {
    const { container } = renderWithProps(ChartSeriesWrapper, {
      data: [{ x: 0, y: 10 }],
      type: 'line',
      color: '#2563eb',
      children: <path d="M0 0 L10 10" />
    })
    const group = container.querySelector('[data-series-type="line"]')
    expect(group).toHaveAttribute('fill', 'none')
    expect(group).toHaveAttribute('stroke', '#2563eb')
  })
})

// ===========================================================================
// ChartTooltip
// ===========================================================================

describe('ChartTooltip', () => {
  beforeEach(() => {
    document.querySelectorAll('[data-chart-tooltip]').forEach((t) => t.remove())
  })

  afterEach(() => {
    cleanup()
    document.querySelectorAll('[data-chart-tooltip]').forEach((t) => t.remove())
  })

  it('keeps the anchor coordinates in the first server render', () => {
    const html = renderToStaticMarkup(<ChartTooltip content="Tooltip text" open x={100} y={100} />)
    expect(html).toContain('translate3d(100px, 100px, 0)')
  })

  it('renders content when open', () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', open: true, x: 100, y: 100 })

    const tooltip = document.querySelector('[data-chart-tooltip]')
    expect(tooltip).toBeTruthy()
    expect(tooltip?.textContent).toContain('Tooltip text')
  })

  it('does not mount when closed', () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', open: false, x: 100, y: 100 })
    expect(document.querySelector('[data-chart-tooltip]')).toBeNull()
  })

  it('does not mount a tooltip when content is only a newline', () => {
    const newline = renderWithProps(ChartTooltip, { content: '\n', open: true, x: 10, y: 10 })
    expect(document.querySelector('[role="tooltip"]')).toBeNull()
    newline.unmount()

    const empty = renderWithProps(ChartTooltip, { content: '', open: true, x: 10, y: 10 })
    expect(document.querySelector('[role="tooltip"]')).toBeNull()
    empty.unmount()
  })

  it('renders a list when content has two lines', () => {
    renderWithProps(ChartTooltip, { content: 'a\nb', open: true, x: 10, y: 10 })
    const tip = document.querySelector('[role="tooltip"]')
    expect(tip?.querySelector('ul')).not.toBeNull()
    expect(tip?.textContent).toBe('ab')
  })

  it('applies custom className', () => {
    renderWithProps(ChartTooltip, {
      content: 'Tooltip text',
      open: true,
      x: 100,
      y: 100,
      className: 'custom-tooltip'
    })

    expect(document.querySelector('[data-chart-tooltip]')?.className).toContain('custom-tooltip')
  })

  it('positions with transform instead of dynamic left/top', () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', open: true, x: 100, y: 100 })

    const tooltip = document.querySelector('[data-chart-tooltip]') as HTMLElement
    expect(tooltip.style.transform).toBe('translate3d(112px, 92px, 0)')
    expect(tooltip.style.left).toBe('')
    expect(tooltip.style.top).toBe('')
  })
})
