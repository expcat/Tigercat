/**
 * @vitest-environment happy-dom
 *
 * Merged from: ChartAxis, ChartCanvas, ChartGrid, ChartLegend, ChartSeries, ChartTooltip
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { waitFor } from '@testing-library/vue'
import { ChartAxis } from '@expcat/tigercat-vue/ChartAxis'
import { ChartCanvas } from '@expcat/tigercat-vue/ChartCanvas'
import { ChartGrid } from '@expcat/tigercat-vue/ChartGrid'
import { ChartLegend } from '@expcat/tigercat-vue/ChartLegend'
import { ChartSeries } from '@expcat/tigercat-vue/ChartSeries'
import { ChartTooltip } from '@expcat/tigercat-vue/ChartTooltip'
import { createLinearScale } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolations } from '../utils'
import { MockResizeObserver } from '../utils/mock-observers'
import { installFrameScheduler } from '../utils/frame-scheduler'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const scale = createLinearScale([0, 100], [0, 200])
const xScale = createLinearScale([0, 100], [0, 200])
const yScale = createLinearScale([0, 100], [100, 0])
const tickValues = [0, 50, 100]

// ===========================================================================
// ChartAxis
// ===========================================================================

describe('ChartAxis', () => {
  it('renders ticks and label', () => {
    const { container } = renderWithProps(ChartAxis, { scale, tickValues, label: 'Value' })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
    expect(container.querySelector('[data-axis-label]')).toHaveTextContent('Value')
  })

  it('hides ticks from the accessibility tree', () => {
    const { container } = renderWithProps(ChartAxis, { scale, tickValues, label: 'Value' })
    expect(container.querySelector('g')?.getAttribute('aria-hidden')).toBe('true')
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

    observer.trigger(360, 180)
    observer.trigger(480, 260)

    expect(frames.requestAnimationFrame).toHaveBeenCalledTimes(1)
    expect(svg).toHaveAttribute('width', '300')

    frames.flush()
    await nextTick()

    expect(svg).toHaveAttribute('width', '480')
    expect(svg).toHaveAttribute('height', '260')
    expect(svg).toHaveAttribute('viewBox', '0 0 480 260')
    expect(group).toHaveAttribute('transform', 'translate(12, 8)')
  })

  it('reports resolved size after ResizeObserver and rAF', async () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    const frames = installFrameScheduler()
    const { emitted } = renderWithProps(ChartCanvas, {
      width: 300,
      height: 160,
      responsive: true
    })

    await waitFor(() => expect(MockResizeObserver.instances).toHaveLength(1))
    const observer = MockResizeObserver.instances[0]

    observer.trigger(360, 180)
    observer.trigger(480, 260)
    frames.flush()
    await nextTick()

    const events = emitted()['resolved-size-change']
    expect(events?.at(-1)?.[0]).toEqual({ width: 480, height: 260 })
  })

  it('observes its own host instead of a legend sibling', async () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    const { container } = renderWithProps(ChartCanvas, {
      width: 320,
      height: 200,
      responsive: true
    })
    await waitFor(() => expect(MockResizeObserver.instances).toHaveLength(1))
    const host = container.querySelector('[data-chart-canvas-host]')
    expect(MockResizeObserver.instances[0].observe).toHaveBeenCalledWith(host)
  })

  it('names the svg when a title is provided', async () => {
    const { container } = renderWithProps(ChartCanvas, { title: 'Sales', desc: 'Quarterly' })
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('role')).toBe('img')
    expect(svg?.querySelector('title')?.textContent).toBe('Sales')
    await expectNoA11yViolations(container)
  })
})

// ===========================================================================
// ChartGrid
// ===========================================================================

describe('ChartGrid', () => {
  it('draws vertical lines from xScale and height', () => {
    const { container } = renderWithProps(ChartGrid, {
      xScale,
      show: 'x',
      height: 80,
      xTickValues: [0, 50, 100]
    })
    expect(container.querySelectorAll('line').length).toBe(3)
    expect(container.querySelector('g')?.getAttribute('aria-hidden')).toBe('true')
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
  it('renders legend items with labels and markers', () => {
    const { container } = renderWithProps(ChartLegend, { items: legendItems })

    expect(container.querySelectorAll('[data-legend-item]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-legend-marker]')).toHaveLength(3)
    expect(container.textContent).toContain('Series A')
    expect(container.textContent).toContain('Series B')
    expect(container.textContent).toContain('Series C')
  })

  it('emits item-click event when interactive', async () => {
    const onItemClick = vi.fn()
    const { container } = renderWithProps(ChartLegend, {
      items: legendItems,
      interactive: true,
      onItemClick
    })

    const firstItem = container.querySelector('[data-legend-item]')
    firstItem?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(onItemClick).toHaveBeenCalledWith(0, legendItems[0])
  })

  it('uses button toggle semantics (not listitem) when interactive (C25-3)', () => {
    const { container } = renderWithProps(ChartLegend, {
      items: legendItems,
      interactive: true
    })
    expect(container.querySelector('[data-chart-legend]')?.getAttribute('role')).toBe('group')
    const items = container.querySelectorAll('[data-legend-item]')
    expect(items[0].tagName).toBe('BUTTON')
    expect(items[0].getAttribute('role')).toBeNull()
    expect(items[0].getAttribute('aria-pressed')).toBe('true')
    expect(items[1].getAttribute('aria-pressed')).toBe('false')
    expect(items[2].getAttribute('aria-pressed')).toBe('false')
  })

  it('keeps list semantics for the static legend', () => {
    const { container } = renderWithProps(ChartLegend, { items: legendItems })
    expect(container.querySelector('[data-chart-legend]')?.getAttribute('role')).toBe('list')
    const items = container.querySelectorAll('[data-legend-item]')
    expect(items[0].getAttribute('role')).toBe('listitem')
    expect(items[0].getAttribute('aria-pressed')).toBeNull()
  })
})

// ===========================================================================
// ChartSeries
// ===========================================================================

describe('ChartSeries', () => {
  it('does not fill a line series group', () => {
    const { container } = renderWithProps(ChartSeries, {
      data: [{ x: 0, y: 10 }],
      type: 'line',
      color: '#2563eb'
    })
    const group = container.querySelector('[data-series-type="line"]')
    expect(group?.getAttribute('fill')).toBe('none')
    expect(group?.getAttribute('stroke')).toBe('#2563eb')
  })
})

// ===========================================================================
// ChartTooltip
// ===========================================================================

describe('ChartTooltip', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders content when open', async () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', open: true, x: 100, y: 100 })
    await new Promise((resolve) => setTimeout(resolve, 0))

    const tooltip = document.querySelector('[data-chart-tooltip]')
    expect(tooltip).toBeTruthy()
    expect(tooltip?.textContent).toContain('Tooltip text')
  })

  it('does not mount when closed', async () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', open: false, x: 100, y: 100 })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.querySelector('[data-chart-tooltip]')).toBeNull()
  })

  it('applies custom className', async () => {
    renderWithProps(ChartTooltip, {
      content: 'Tooltip text',
      open: true,
      x: 100,
      y: 100,
      className: 'custom-tooltip'
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.querySelector('[data-chart-tooltip]')?.className).toContain('custom-tooltip')
  })

  it('positions with transform instead of dynamic left/top', async () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', open: true, x: 100, y: 100 })
    await new Promise((resolve) => setTimeout(resolve, 0))

    const tooltip = document.querySelector('[data-chart-tooltip]') as HTMLElement
    expect(tooltip.style.transform).toMatch(/translate3d\(/)
    expect(tooltip.style.left).toBe('')
    expect(tooltip.style.top).toBe('')
  })
})
