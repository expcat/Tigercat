/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { TreeMapChart } from '@expcat/tigercat-vue'
import { renderWithProps } from '../utils'

const defaultSize = { width: 400, height: 300 }

const sampleData = [
  { label: 'A', value: 40 },
  { label: 'B', value: 30 },
  { label: 'C', value: 20 },
  { label: 'D', value: 10 }
]

describe('TreeMapChart (Vue)', () => {
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
      'onUpdate:hoveredIndex': onHoveredIndexChange,
      ...defaultSize
    })

    const rects = container.querySelectorAll('rect')
    rects[0].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
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
    rects[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
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
})
