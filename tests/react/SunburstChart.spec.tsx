import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { SunburstChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'
import { fireEvent, render } from '@testing-library/react'

const defaultSize = { width: 320, height: 320 }

const sampleData = [
  { label: 'A', value: 40 },
  { label: 'B', value: 30 },
  { label: 'C', value: 20 }
]

describe('SunburstChart (React)', () => {
  it('renders SVG with arcs', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(3)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
  })
  it('triggers hover events when hoverable', () => {
    const onHoveredIndexChange = vi.fn()
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      hoverable: true,
      onHoveredIndexChange,
      ...defaultSize
    })

    const paths = container.querySelectorAll('path')
    fireEvent.mouseEnter(paths[0])
    expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
  })

  it('triggers click events when selectable', () => {
    const onArcClick = vi.fn()
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      selectable: true,
      onArcClick,
      ...defaultSize
    })

    const paths = container.querySelectorAll('path')
    fireEvent.click(paths[0])
    expect(onArcClick).toHaveBeenCalled()
  })

  it('applies className', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      className: 'my-sunburst',
      ...defaultSize
    })

    expect(container.querySelector('svg.my-sunburst')).toBeTruthy()
  })

  it('renders a11y title and desc', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      title: 'Sunburst Title',
      desc: 'Sunburst Description',
      ...defaultSize
    })

    expect(container.querySelector('title')?.textContent).toBe('Sunburst Title')
    expect(container.querySelector('desc')?.textContent).toBe('Sunburst Description')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<SunburstChart data={sampleData} width={320} height={320} />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
