import { describe, it, expect, vi } from 'vitest'
import { BarChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'
import { fireEvent } from '@testing-library/react'

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
      data: [{ x: 'A', y: 10 }]
    })

    await expectNoA11yViolationsIsolated(container)
  })

  it('labels bars with role/aria-label, matching Vue/Scatter (C26-4)', () => {
    const { container } = renderWithProps(BarChart, {
      data: [
        { x: 'A', y: 10, label: 'Alpha' },
        { x: 'B', y: 20 }
      ],
      ...defaultSize
    })
    const bars = container.querySelectorAll('rect[data-bar-index]')
    expect(bars).toHaveLength(2)
    expect(bars[0]).toHaveAttribute('role', 'img')
    expect(bars[0]).toHaveAttribute('aria-label', 'Alpha')
    expect(bars[1]).toHaveAttribute('aria-label', 'B')
  })

  it('uses button role on bars when selectable (C26-4)', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      selectable: true,
      ...defaultSize
    })
    const bar = container.querySelector('rect[data-bar-index]')!
    expect(bar).toHaveAttribute('role', 'button')
    expect(bar).toHaveAttribute('tabindex', '0')
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
  describe('gradient', () => {})

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

  describe('bar constraints', () => {})

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

      fireEvent.click(container.querySelectorAll('rect')[1])
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

      expect(container.querySelector('[role="list"][aria-label="Chart legend"]')).toBeTruthy()
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
  })
})
