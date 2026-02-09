/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { BarChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

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

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }]
    })

    await expectNoA11yViolations(container)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(BarChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelectorAll('rect')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('handles negative y values', () => {
    const { container } = renderWithProps(BarChart, {
      data: [
        { x: 'A', y: 20 },
        { x: 'B', y: -10 }
      ],
      ...defaultSize
    })

    expect(container.querySelectorAll('rect')).toHaveLength(2)
  })

  it('uses custom barColor', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      barColor: '#ff0000',
      ...defaultSize
    })

    expect(container.querySelector('rect')).toHaveAttribute('fill', '#ff0000')
  })

  it('hides axis and grid when disabled', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      showAxis: false,
      showGrid: false,
      ...defaultSize
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(0)
    expect(container.querySelectorAll('[data-chart-grid] line')).toHaveLength(0)
  })

  describe('gradient', () => {
    it('renders gradient defs when gradient is enabled', () => {
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 }
        ],
        gradient: true,
        ...defaultSize
      })

      const gradients = container.querySelectorAll('linearGradient')
      expect(gradients).toHaveLength(2)

      const rect = container.querySelector('rect')
      expect(rect?.getAttribute('fill')).toMatch(/^url\(#tiger-bar-grad-/)
    })

    it('does not render gradient defs when gradient is disabled', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        gradient: false,
        ...defaultSize
      })

      expect(container.querySelectorAll('linearGradient')).toHaveLength(0)
    })
  })

  describe('value labels', () => {
    it('renders value labels when showValueLabels is true', () => {
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 10 },
          { x: 'B', y: 20 }
        ],
        showValueLabels: true,
        ...defaultSize
      })

      const labels = container.querySelectorAll('[data-value-label]')
      expect(labels).toHaveLength(2)
      expect(labels[0].textContent).toBe('10')
      expect(labels[1].textContent).toBe('20')
    })

    it('uses custom valueLabelFormatter', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 100 }],
        showValueLabels: true,
        valueLabelFormatter: (datum: { y: number }) => `$${datum.y}`,
        ...defaultSize
      })

      const label = container.querySelector('[data-value-label]')
      expect(label?.textContent).toBe('$100')
    })

    it('does not render labels when showValueLabels is false', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        showValueLabels: false,
        ...defaultSize
      })

      expect(container.querySelectorAll('[data-value-label]')).toHaveLength(0)
    })
  })

  describe('bar constraints', () => {
    it('applies barMaxWidth to limit bar width', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        barMaxWidth: 20,
        width: 400,
        height: 160
      })

      const rect = container.querySelector('rect')
      const width = Number(rect?.getAttribute('width'))
      expect(width).toBeLessThanOrEqual(20)
    })

    it('applies barMinHeight to near-zero values', () => {
      const { container } = renderWithProps(BarChart, {
        data: [
          { x: 'A', y: 100 },
          { x: 'B', y: 1 }
        ],
        barMinHeight: 4,
        ...defaultSize
      })

      const rects = container.querySelectorAll('rect')
      const height = Number(rects[1].getAttribute('height'))
      expect(height).toBeGreaterThanOrEqual(4)
    })
  })

  describe('animated', () => {
    it('adds transition style when animated is true', () => {
      const { container } = renderWithProps(BarChart, {
        data: [{ x: 'A', y: 10 }],
        animated: true,
        ...defaultSize
      })

      const rect = container.querySelector('rect')
      const style = rect?.getAttribute('style') ?? ''
      expect(style).toContain('transition')
    })

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

      expect(container.querySelector('[role="list"][aria-label="Chart legend"]')).toBeTruthy()
    })
  })
})
