import { describe, it, expect, vi } from 'vitest'
import { BarChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
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
