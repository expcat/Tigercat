import { describe, it, expect } from 'vitest'
import React from 'react'
import { BarChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'

describe('BarChart', () => {
  it('renders bars', () => {
    const { container } = renderWithProps(BarChart, {
      data: [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 }
      ],
      width: 240,
      height: 160
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
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('rect')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders single bar', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 50 }],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('rect')).toHaveLength(1)
  })

  it('handles negative y values', () => {
    const { container } = renderWithProps(BarChart, {
      data: [
        { x: 'A', y: 20 },
        { x: 'B', y: -10 },
        { x: 'C', y: 15 }
      ],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('rect')).toHaveLength(3)
  })

  it('uses custom barColor', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      barColor: '#ff0000',
      width: 240,
      height: 160
    })

    const rect = container.querySelector('rect')
    expect(rect).toHaveAttribute('fill', '#ff0000')
  })

  it('hides axis when showAxis is false', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      showAxis: false,
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(0)
  })

  it('hides grid when showGrid is false', () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }],
      showGrid: false,
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('[data-chart-grid] line')).toHaveLength(0)
  })
})
