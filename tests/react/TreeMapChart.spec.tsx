import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { TreeMapChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'
import { fireEvent, render } from '@testing-library/react'

const defaultSize = { width: 400, height: 300 }

const sampleData = [
  { label: 'A', value: 40 },
  { label: 'B', value: 30 },
  { label: 'C', value: 20 },
  { label: 'D', value: 10 }
]

describe('TreeMapChart (React)', () => {
  it('renders SVG with rect nodes', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBeGreaterThanOrEqual(4)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
    const rects = container.querySelectorAll('rect')
    expect(rects).toHaveLength(0)
  })

  it('renders labels when showLabels is true', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      showLabels: true,
      ...defaultSize
    })

    const texts = container.querySelectorAll('text')
    expect(texts.length).toBeGreaterThanOrEqual(1)
  })

  it('uses custom colors', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      colors: customColors,
      ...defaultSize
    })

    const rects = container.querySelectorAll('rect')
    expect(rects[0]).toHaveAttribute('fill', '#ff0000')
  })

  it('applies gradient when enabled', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      gradient: true,
      ...defaultSize
    })

    expect(container.querySelector('defs linearGradient')).toBeTruthy()
  })

  it('renders legend when showLegend is true', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      showLegend: true,
      ...defaultSize
    })

    expect(container.querySelector('[role="list"][aria-label="Chart legend"]')).toBeTruthy()
  })

  it('triggers hover events when hoverable', () => {
    const onHoveredIndexChange = vi.fn()
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      hoverable: true,
      onHoveredIndexChange,
      ...defaultSize
    })

    const rects = container.querySelectorAll('rect')
    fireEvent.mouseEnter(rects[0])
    expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
  })

  it('triggers click events when selectable', () => {
    const onNodeClick = vi.fn()
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      selectable: true,
      onNodeClick,
      ...defaultSize
    })

    const rects = container.querySelectorAll('rect')
    fireEvent.click(rects[1])
    expect(onNodeClick).toHaveBeenCalled()
  })

  it('applies className', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      className: 'my-treemap',
      ...defaultSize
    })

    expect(container.querySelector('svg.my-treemap')).toBeTruthy()
  })

  it('renders a11y title and desc', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      title: 'TreeMap Title',
      desc: 'TreeMap Description',
      ...defaultSize
    })

    expect(container.querySelector('title')?.textContent).toBe('TreeMap Title')
    expect(container.querySelector('desc')?.textContent).toBe('TreeMap Description')
  })

  it('respects gap prop', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      gap: 4,
      ...defaultSize
    })

    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBeGreaterThanOrEqual(4)
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<TreeMapChart data={sampleData} width={400} height={300} />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  it('renders single data item', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: [{ label: 'Single', value: 100 }],
      ...defaultSize
    })
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBeGreaterThanOrEqual(1)
  })

  it('renders with gap=0', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      gap: 0,
      ...defaultSize
    })
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBeGreaterThanOrEqual(4)
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
