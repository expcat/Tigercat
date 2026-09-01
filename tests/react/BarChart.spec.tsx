import { describe, it, expect, vi, afterEach } from 'vitest'
import { BarChart } from '@expcat/tigercat-react/BarChart'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
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
    expect(bars).toHaveLength(2)
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

    it('keeps near-zero bars at least barMinHeight tall', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 0.1 }],
        barMinHeight: 8,
        ...defaultSize
      })
      expect(
        Number(container.querySelector('rect[data-bar-index]')?.getAttribute('height'))
      ).toBeGreaterThanOrEqual(8)
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
    it('triggers hover events when hoverable', () => {
      const onHoveredIndexChange = vi.fn()
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 }
        ],
        hoverable: true,
        onHoveredIndexChange,
        ...defaultSize
      })

      fireEvent.mouseEnter(container.querySelector('rect')!)
      expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
    })

    it('triggers click events when selectable', () => {
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

      fireEvent.click(container.querySelectorAll('rect[data-bar-index]')[1])
      expect(onBarClick).toHaveBeenCalled()
    })

    it('fires onBarClick without selectable', () => {
      const onBarClick = vi.fn()
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        onBarClick,
        ...defaultSize
      })

      fireEvent.click(container.querySelector('rect[data-bar-index]')!)
      expect(onBarClick).toHaveBeenCalledWith(0, expect.objectContaining({ x: 'A', y: 10 }))
    })

    it('renders a localized legend name', () => {
      const { container } = render(
        <ConfigProvider locale={zhCN}>
          <BarChart
            data={[
              { x: 'A', y: 10, color: '#ff0000' },
              { x: 'B', y: 20, color: '#00ff00' }
            ]}
            showLegend
            {...defaultSize}
          />
        </ConfigProvider>
      )

      expect(container.querySelector('[role="list"][aria-label="图表图例"]')).toBeTruthy()
    })

    it('honors barRadius over the theme token', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        barRadius: 8,
        ...defaultSize
      })
      const bar = container.querySelector('rect[data-bar-index]')!
      expect(bar).toHaveAttribute('rx', '8')
      expect(bar.getAttribute('style') ?? '').not.toContain('--tiger-chart-bar-radius')
    })

    it('places a negative value label below the zero baseline', () => {
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: -10 }
        ],
        showValueLabels: true,
        ...defaultSize
      })
      const labels = container.querySelectorAll('[data-value-label]')
      const baseline = Number(
        container.querySelector('rect[data-bar-index="1"]')?.getAttribute('y')
      )
      expect(Number(labels[1].getAttribute('y'))).toBeGreaterThanOrEqual(baseline)
    })

    it('paints gradient fills with a stable id', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        gradient: true,
        ...defaultSize
      })
      const fill = container.querySelector('rect[data-bar-index]')?.getAttribute('fill') ?? ''
      expect(fill).toMatch(/^url\(#tiger-bar-grad-/)
    })

    it('clears hover on mouse leave', () => {
      const onHoveredIndexChange = vi.fn()
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        hoverable: true,
        onHoveredIndexChange,
        ...defaultSize
      })

      const rect = container.querySelector('rect')!
      fireEvent.mouseEnter(rect)
      fireEvent.mouseLeave(rect)
      expect(onHoveredIndexChange).toHaveBeenLastCalledWith(null)
    })

    it('opens the default tooltip on hover without hoverable', () => {
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 }
        ],
        ...defaultSize
      })

      fireEvent.mouseEnter(container.querySelector('rect[data-bar-index]')!)
      const tooltip = document.body.querySelector('[data-chart-tooltip]')
      expect(tooltip).toBeTruthy()
      expect(tooltip).toHaveAttribute('role', 'tooltip')
      expect(tooltip?.className).not.toContain('opacity-0')
      expect(tooltip?.textContent).toContain('A: 10')
    })

    it('does not open a tooltip when showTooltip is false', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        showTooltip: false,
        ...defaultSize
      })

      fireEvent.mouseEnter(container.querySelector('rect[data-bar-index]')!)
      const tooltip = document.body.querySelector('[data-chart-tooltip]')
      expect(tooltip).toBeNull()
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

      act(() => {
        observer.trigger(926, 688)
      })
      act(() => {
        frames.flush()
      })

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
        act(() => {
          observer.trigger(926, 688)
        })
        act(() => {
          frames.flush()
        })
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
