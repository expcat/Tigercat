import { describe, it, expect } from 'vitest'
import React from 'react'
import { PieChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'

describe('PieChart', () => {
  it('renders slices', () => {
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 40 }, { value: 30 }, { value: 20 }],
      width: 240,
      height: 160
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
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders single slice', () => {
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 100 }],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(1)
  })

  it('renders labels when showLabels is true', () => {
    const { container } = renderWithProps(PieChart, {
      data: [
        { value: 40, label: 'A' },
        { value: 30, label: 'B' }
      ],
      showLabels: true,
      width: 240,
      height: 160
    })

    const texts = container.querySelectorAll('text')
    expect(texts.length).toBeGreaterThanOrEqual(2)
  })

  it('uses custom colors when provided', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff']
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 40 }, { value: 30 }, { value: 20 }],
      colors: customColors,
      width: 240,
      height: 160
    })

    const slices = container.querySelectorAll('path[data-pie-slice]')
    expect(slices[0]).toHaveAttribute('fill', '#ff0000')
    expect(slices[1]).toHaveAttribute('fill', '#00ff00')
    expect(slices[2]).toHaveAttribute('fill', '#0000ff')
  })

  it('renders with custom innerRadius (donut style)', () => {
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 40 }, { value: 30 }],
      innerRadius: 30,
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(2)
  })
})
