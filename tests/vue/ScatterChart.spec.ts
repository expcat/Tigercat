/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { ScatterChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

const defaultSize = { width: 240, height: 160 }

describe('ScatterChart', () => {
  it('renders points', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [
        { x: 10, y: 20 },
        { x: 20, y: 30 },
        { x: 30, y: 40 }
      ],
      ...defaultSize
    })

    expect(container.querySelectorAll('circle')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }]
    })

    await expectNoA11yViolations(container)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelectorAll('circle')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('handles negative values', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [
        { x: -10, y: 20 },
        { x: 20, y: -30 }
      ],
      ...defaultSize
    })

    expect(container.querySelectorAll('circle')).toHaveLength(2)
  })

  it('uses custom pointColor and pointSize', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      pointColor: '#ff0000',
      pointSize: 8,
      ...defaultSize
    })

    const circle = container.querySelector('circle')
    expect(circle).toHaveAttribute('fill', '#ff0000')
    expect(circle).toHaveAttribute('r', '8')
  })

  it('hides axis and grid when disabled', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      showAxis: false,
      showGrid: false,
      ...defaultSize
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(0)
    expect(container.querySelectorAll('[data-chart-grid] line')).toHaveLength(0)
  })

  describe('interaction', () => {
    const interactiveData = [
      { x: 10, y: 20, label: 'Point A' },
      { x: 30, y: 40, label: 'Point B' },
      { x: 50, y: 60, label: 'Point C' }
    ]

    it('adds cursor-pointer class when hoverable', () => {
      const { container } = renderWithProps(ScatterChart, {
        data: interactiveData,
        hoverable: true,
        ...defaultSize
      })

      expect(container.querySelector('circle')?.className).toContain('cursor-pointer')
    })

    it('renders legend when showLegend is true', () => {
      const { container } = renderWithProps(ScatterChart, {
        data: interactiveData,
        showLegend: true,
        ...defaultSize
      })

      expect(container.querySelector('[role="list"][aria-label="Chart legend"]')).toBeTruthy()
    })

    it('supports controlled hoveredIndex with opacity changes', () => {
      const { container } = renderWithProps(ScatterChart, {
        data: interactiveData,
        hoverable: true,
        hoveredIndex: 1,
        ...defaultSize
      })

      const circles = container.querySelectorAll('circle')
      expect(circles[0]).toHaveAttribute('opacity', '0.25')
      expect(circles[1]).toHaveAttribute('opacity', '1')
      expect(circles[2]).toHaveAttribute('opacity', '0.25')
    })

    it('supports controlled selectedIndex with opacity changes', () => {
      const { container } = renderWithProps(ScatterChart, {
        data: interactiveData,
        selectable: true,
        selectedIndex: 2,
        ...defaultSize
      })

      const circles = container.querySelectorAll('circle')
      expect(circles[0]).toHaveAttribute('opacity', '0.25')
      expect(circles[1]).toHaveAttribute('opacity', '0.25')
      expect(circles[2]).toHaveAttribute('opacity', '1')
    })
  })
})
