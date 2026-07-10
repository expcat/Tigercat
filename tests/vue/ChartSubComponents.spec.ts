/**
 * @vitest-environment happy-dom
 *
 * Merged from: ChartAxis, ChartCanvas, ChartGrid, ChartLegend, ChartSeries, ChartTooltip
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { waitFor } from '@testing-library/vue'
import {
  ChartAxis,
  ChartCanvas,
  ChartGrid,
  ChartLegend,
  ChartSeries,
  ChartTooltip
} from '@expcat/tigercat-vue'
import { createLinearScale } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'
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

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartAxis, { scale, tickValues })
    await expectNoA11yViolationsIsolated(container)
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

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartCanvas, {})
    await expectNoA11yViolationsIsolated(container)
  })
})

// ===========================================================================
// ChartGrid
// ===========================================================================

describe('ChartGrid', () => {
  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartGrid, { xScale, yScale })
    await expectNoA11yViolationsIsolated(container)
  })
})

// ===========================================================================
// ChartLegend
// ===========================================================================

const legendItems = [
  { index: 0, label: 'Series A', color: '#2563eb', active: true },
  { index: 1, label: 'Series B', color: '#22c55e', active: true },
  { index: 2, label: 'Series C', color: '#f97316', active: false }
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

  it('applies inactive style to inactive items', () => {
    const { container } = renderWithProps(ChartLegend, { items: legendItems })

    const items = container.querySelectorAll('[data-legend-item]')
    expect(items[2].className).toContain('opacity')
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
  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartSeries, {
      data: [{ x: 0, y: 10 }]
    })

    await expectNoA11yViolationsIsolated(container)
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

  it('hides when not open or empty', async () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', open: false, x: 100, y: 100 })
    await new Promise((resolve) => setTimeout(resolve, 0))

    const hiddenTooltip = document.querySelector('[data-chart-tooltip]')
    if (hiddenTooltip) {
      expect(hiddenTooltip.className).toContain('opacity-0')
    }

    document.body.innerHTML = ''
    renderWithProps(ChartTooltip, { content: '', open: true, x: 100, y: 100 })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.querySelector('[data-chart-tooltip]')).toBeFalsy()
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
    expect(tooltip.style.transform).toBe('translate3d(112px, 92px, 0)')
    expect(tooltip.style.left).toBe('')
    expect(tooltip.style.top).toBe('')
    expect(tooltip.className).toContain('left-0')
    expect(tooltip.className).toContain('top-0')
  })
})
