import { describe, it, expect, vi } from 'vitest'
import { PieChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
import { fireEvent } from '@testing-library/react'

const defaultSize = { width: 240, height: 160 }

describe('PieChart', () => {
  it('renders slices', () => {
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 40 }, { value: 30 }, { value: 20 }],
      ...defaultSize
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 40 }, { value: 30 }]
    })

    await expectNoA11yViolations(container)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(PieChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders labels when showLabels is true', () => {
    const { container } = renderWithProps(PieChart, {
      data: [
        { value: 40, label: 'A' },
        { value: 30, label: 'B' }
      ],
      showLabels: true,
      ...defaultSize
    })

    expect(container.querySelectorAll('text').length).toBeGreaterThanOrEqual(2)
  })

  it('uses custom colors when provided', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff']
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 40 }, { value: 30 }, { value: 20 }],
      colors: customColors,
      ...defaultSize
    })

    const slices = container.querySelectorAll('path[data-pie-slice]')
    expect(slices[0]).toHaveAttribute('fill', '#ff0000')
    expect(slices[1]).toHaveAttribute('fill', '#00ff00')
    expect(slices[2]).toHaveAttribute('fill', '#0000ff')
  })

  describe('interaction', () => {
    it('triggers hover events when hoverable', () => {
      const onHoveredIndexChange = vi.fn()
      const { container } = renderWithProps(PieChart, {
        data: [{ value: 40 }, { value: 30 }],
        hoverable: true,
        onHoveredIndexChange,
        ...defaultSize
      })

      fireEvent.mouseEnter(container.querySelector('path[data-pie-slice]')!)
      expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
    })

    it('triggers click events when selectable', () => {
      const onSliceClick = vi.fn()
      const { container } = renderWithProps(PieChart, {
        data: [
          { value: 40, label: 'A' },
          { value: 30, label: 'B' }
        ],
        selectable: true,
        onSliceClick,
        ...defaultSize
      })

      fireEvent.click(container.querySelectorAll('path[data-pie-slice]')[1])
      expect(onSliceClick).toHaveBeenCalled()
    })

    it('renders legend when showLegend is true', () => {
      const { container } = renderWithProps(PieChart, {
        data: [
          { value: 40, label: 'A' },
          { value: 30, label: 'B' }
        ],
        showLegend: true,
        ...defaultSize
      })

      expect(container.querySelector('[role="list"][aria-label="Chart legend"]')).toBeTruthy()
    })

    it('clears hover on mouse leave', () => {
      const onHoveredIndexChange = vi.fn()
      const { container } = renderWithProps(PieChart, {
        data: [{ value: 40 }],
        hoverable: true,
        onHoveredIndexChange,
        ...defaultSize
      })

      const slice = container.querySelector('path[data-pie-slice]')!
      fireEvent.mouseEnter(slice)
      fireEvent.mouseLeave(slice)
      expect(onHoveredIndexChange).toHaveBeenLastCalledWith(null)
    })
  })
})
