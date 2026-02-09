/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { PieChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

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
    it('renders slices with default borders', () => {
      const { container } = renderWithProps(PieChart, {
        data: [{ value: 40 }, { value: 30 }],
        ...defaultSize
      })

      const slice = container.querySelector('path[data-pie-slice]')!
      expect(slice).toHaveAttribute('stroke', '#ffffff')
      expect(slice).toHaveAttribute('stroke-width', '2')
    })

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

    it('applies transition styles for hover animation', () => {
      const { container } = renderWithProps(PieChart, {
        data: [{ value: 40 }],
        hoverable: true,
        ...defaultSize
      })

      const slice = container.querySelector('path[data-pie-slice]')!
      const style = slice.getAttribute('style') ?? ''
      expect(style).toContain('transition')
      expect(style).toContain('transform')
    })

    it('renders outside labels with leader lines', () => {
      const { container } = renderWithProps(PieChart, {
        data: [
          { value: 40, label: 'A' },
          { value: 30, label: 'B' }
        ],
        showLabels: true,
        labelPosition: 'outside',
        ...defaultSize
      })

      expect(container.querySelectorAll('polyline').length).toBeGreaterThanOrEqual(2)
      expect(container.querySelectorAll('text').length).toBeGreaterThanOrEqual(2)
    })

    it('shows percentage in outside labels', () => {
      const { container } = renderWithProps(PieChart, {
        data: [
          { value: 60, label: 'X' },
          { value: 40, label: 'Y' }
        ],
        showLabels: true,
        labelPosition: 'outside',
        ...defaultSize
      })

      const texts = container.querySelectorAll('text')
      const allText = Array.from(texts)
        .map((t) => t.textContent)
        .join(' ')
      expect(allText).toContain('%')
    })

    it('applies shadow filter when shadow prop is true', () => {
      const { container } = renderWithProps(PieChart, {
        data: [{ value: 40 }],
        shadow: true,
        ...defaultSize
      })

      const slice = container.querySelector('path[data-pie-slice]')!
      const style = slice.getAttribute('style') ?? ''
      expect(style).toContain('drop-shadow')
    })

    it('disables borders when borderWidth is 0', () => {
      const { container } = renderWithProps(PieChart, {
        data: [{ value: 40 }],
        borderWidth: 0,
        ...defaultSize
      })

      const slice = container.querySelector('path[data-pie-slice]')!
      expect(slice).toHaveAttribute('stroke-width', '0')
    })
  })
})
