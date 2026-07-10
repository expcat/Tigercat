import { describe, it, expect, vi } from 'vitest'
import { PieChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'
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

    await expectNoA11yViolationsIsolated(container)
  })

  it('labels slices with role/aria-label, and uses button role when selectable (C27-4)', () => {
    const staticPie = renderWithProps(PieChart, {
      data: [
        { value: 40, label: 'Apples' },
        { value: 30, label: 'Pears' }
      ],
      ...defaultSize
    })
    const staticSlice = staticPie.container.querySelector('path[data-pie-slice]')!
    expect(staticSlice).toHaveAttribute('role', 'img')
    expect(staticSlice).toHaveAttribute('aria-label', 'Apples')

    const selectablePie = renderWithProps(PieChart, {
      data: [{ value: 40, label: 'Apples' }],
      selectable: true,
      ...defaultSize
    })
    const slice = selectablePie.container.querySelector('path[data-pie-slice]')!
    expect(slice).toHaveAttribute('role', 'button')
    expect(slice).toHaveAttribute('tabindex', '0')
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(PieChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
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

  describe('visual enhancements', () => {
    it('applies custom border styles', () => {
      const { container } = renderWithProps(PieChart, {
        data: [{ value: 40 }],
        borderWidth: 3,
        borderColor: '#000000',
        ...defaultSize
      })

      const slice = container.querySelector('path[data-pie-slice]')!
      expect(slice).toHaveAttribute('stroke', '#000000')
      expect(slice.getAttribute('stroke-width')).toBe('3')
    })
  })
})
