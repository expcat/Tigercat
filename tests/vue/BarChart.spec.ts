/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { fireEvent, render, waitFor } from '@testing-library/vue'
import { BarChart } from '@expcat/tigercat-vue/BarChart'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { renderWithProps, expectNoA11yViolations } from '../utils'
import { h } from 'vue'
import { MockResizeObserver } from '../utils/mock-observers'
import { installFrameScheduler } from '../utils/frame-scheduler'

const defaultSize = { width: 240, height: 160 }

describe('BarChart', () => {
  it('renders bars', () => {
    const { container } = renderWithProps(BarChart, {
      data: [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 }
      ],
      ...defaultSize
    })

    expect(container.querySelectorAll('rect')).toHaveLength(2)
  })

  it('lets a responsive chart wrapper fill the available width', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      responsive: true,
      ...defaultSize
    })

    expect(container.querySelector('svg')?.parentElement).toHaveClass('w-full', 'min-w-0')
  })

  it('applies asymmetric default padding leaving room for y-axis labels (S4)', () => {
    const { container } = renderWithProps(BarChart, {
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
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      title: 'Sales'
    })

    await expectNoA11yViolations(container)
  })

  it('hides decorative bars from the accessibility tree by default', () => {
    const { container } = renderWithProps(BarChart, {
      data: [
        { x: 'A', y: 10, label: 'Alpha' },
        { x: 'B', y: 20 }
      ],
      ...defaultSize
    })
    const bars = container.querySelectorAll('rect[data-bar-index]')
    expect(bars[0]).toHaveAttribute('aria-hidden', 'true')
    expect(bars[0]).not.toHaveAttribute('role')
  })

  it('uses a single tab stop when selectable', () => {
    const { container } = renderWithProps(BarChart, {
      data: [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 }
      ],
      selectable: true,
      ...defaultSize
    })
    const bars = container.querySelectorAll('rect[data-bar-index]')
    expect(bars[0]).toHaveAttribute('role', 'button')
    expect(bars[0]).toHaveAttribute('tabindex', '0')
    expect(bars[1]).toHaveAttribute('tabindex', '-1')
  })

  it('fires onBarClick without selectable', async () => {
    const onBarClick = vi.fn()
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      onBarClick,
      ...defaultSize
    })
    await fireEvent.click(container.querySelector('rect[data-bar-index]')!)
    expect(onBarClick).toHaveBeenCalled()
  })

  it('applies legendFormatter to legend labels', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      showLegend: true,
      legendFormatter: () => 'Formatted A',
      ...defaultSize
    })
    expect(container.textContent).toContain('Formatted A')
  })

  it('renders a localized legend name', () => {
    const { container } = render({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhCN }, () =>
            h(BarChart, {
              data: [{ x: 'A', y: 10 }],
              showLegend: true,
              ...defaultSize
            })
          )
      }
    })
    expect(container.querySelector('[role="list"][aria-label="图表图例"]')).toBeTruthy()
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(BarChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelectorAll('rect')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })
  it('uses custom barColor', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      barColor: '#ff0000',
      ...defaultSize
    })

    expect(container.querySelector('rect')).toHaveAttribute('fill', '#ff0000')
  })

  describe('value labels', () => {
    it('does not render labels when showValueLabels is false', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        showValueLabels: false,
        ...defaultSize
      })

      expect(container.querySelectorAll('[data-value-label]')).toHaveLength(0)
    })
  })

  describe('animated', () => {
    it('has no transition style when animated is false', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        animated: false,
        ...defaultSize
      })

      const rect = container.querySelector('rect')
      const style = rect?.getAttribute('style') ?? ''
      expect(style).not.toContain('transition')
    })
  })

  describe('interaction', () => {
    it('triggers hover events when hoverable', async () => {
      const onHoveredIndexChange = vi.fn()
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 }
        ],
        hoverable: true,
        'onUpdate:hoveredIndex': onHoveredIndexChange,
        ...defaultSize
      })

      container
        .querySelector('rect')
        ?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
    })

    it('triggers click events when selectable', async () => {
      const onBarClick = vi.fn()
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 }
        ],
        selectable: true,
        onBarClick,
        ...defaultSize
      })

      container
        .querySelectorAll('rect')[1]
        .dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(onBarClick).toHaveBeenCalled()
    })

    it('renders legend when showLegend is true', () => {
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 10, color: '#ff0000' },
          { x: 'B', y: 20, color: '#00ff00' }
        ],
        showLegend: true,
        ...defaultSize
      })

      expect(container.querySelector('[data-chart-legend="true"]')).toBeTruthy()
    })

    it('opens the default tooltip on hover without hoverable', async () => {
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 }
        ],
        ...defaultSize
      })

      await fireEvent.mouseEnter(container.querySelector('rect[data-bar-index]')!)
      const tooltip = document.body.querySelector('[data-chart-tooltip]')
      expect(tooltip).toBeTruthy()
      expect(tooltip).toHaveAttribute('role', 'tooltip')
      expect(tooltip?.classList.contains('opacity-0')).toBe(false)
      expect(tooltip?.textContent).toContain('A: 10')
    })

    it('does not open a tooltip when showTooltip is false', async () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        showTooltip: false,
        ...defaultSize
      })

      await fireEvent.mouseEnter(container.querySelector('rect[data-bar-index]')!)
      expect(document.body.querySelector('[data-chart-tooltip]')).toBeNull()
    })
  })

  describe('responsive plot scale', () => {
    afterEach(() => {
      MockResizeObserver.reset()
      vi.unstubAllGlobals()
    })

    const pagesLikeData = [
      { x: 'A', y: 10 },
      { x: 'B', y: 20 },
      { x: 'C', y: 30 }
    ]

    it('recomputes bar geometry after observing the parent size', async () => {
      vi.stubGlobal('ResizeObserver', MockResizeObserver)
      const frames = installFrameScheduler()
      const { container } = renderWithProps(BarChart, {
        data: pagesLikeData,
        width: 420,
        height: 240,
        responsive: true
      })

      await waitFor(() => expect(MockResizeObserver.instances).toHaveLength(1))
      const svg = container.querySelector('svg')
      const observer = MockResizeObserver.instances[0]

      observer.trigger(926, 688)
      frames.flush()
      await nextTick()
      await nextTick()

      expect(svg).toHaveAttribute('width', '926')
      expect(svg).toHaveAttribute('height', '688')
      expect(svg).toHaveAttribute('viewBox', '0 0 926 688')

      await waitFor(() => {
        const bars = container.querySelectorAll('rect[data-bar-index]')
        const last = bars[bars.length - 1]
        const lastRight = Number(last.getAttribute('x')) + Number(last.getAttribute('width'))
        const tallest = Math.max(...[...bars].map((bar) => Number(bar.getAttribute('height'))))
        expect(lastRight).toBeGreaterThan(500)
        expect(tallest).toBeGreaterThan(300)
      })
    })

    it('does not move bar geometry off the prop innerRect when responsive is false', async () => {
      vi.stubGlobal('ResizeObserver', MockResizeObserver)
      const frames = installFrameScheduler()
      const { container } = renderWithProps(BarChart, {
        data: pagesLikeData,
        width: 420,
        height: 240,
        responsive: false
      })

      const svg = container.querySelector('svg')
      expect(svg).toHaveAttribute('width', '420')
      expect(svg).toHaveAttribute('height', '240')

      const observer = MockResizeObserver.instances[0]
      if (observer) {
        observer.trigger(926, 688)
        frames.flush()
        await nextTick()
        await nextTick()
      }

      expect(svg).toHaveAttribute('width', '420')
      expect(svg).toHaveAttribute('height', '240')
      const bars = container.querySelectorAll('rect[data-bar-index]')
      const last = bars[bars.length - 1]
      const lastRight = Number(last.getAttribute('x')) + Number(last.getAttribute('width'))
      const tallest = Math.max(...[...bars].map((bar) => Number(bar.getAttribute('height'))))
      expect(lastRight).toBeLessThan(400)
      expect(tallest).toBeLessThan(200)
    })
  })
})
