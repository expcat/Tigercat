/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { PieChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

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

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(PieChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })
  describe('interaction', () => {
    it('triggers hover events when hoverable', async () => {
      const onHoveredIndexChange = vi.fn()
      const { container } = renderWithProps(PieChart, {
        data: [{ value: 40 }, { value: 30 }],
        hoverable: true,
        'onUpdate:hoveredIndex': onHoveredIndexChange,
        ...defaultSize
      })

      container
        .querySelector('path[data-pie-slice]')
        ?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
    })

    it('triggers click events when selectable', async () => {
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

      container
        .querySelectorAll('path[data-pie-slice]')[1]
        .dispatchEvent(new MouseEvent('click', { bubbles: true }))
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
      expect(slice).toHaveAttribute('stroke-width', '3')
    })
  })
})
