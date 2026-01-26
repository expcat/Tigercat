import { describe, it, expect } from 'vitest'
import React from 'react'
import { ScatterChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'

describe('ScatterChart', () => {
  it('renders points', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [
        { x: 10, y: 20 },
        { x: 20, y: 30 },
        { x: 30, y: 40 }
      ],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('circle')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }]
    })

    await expectNoA11yViolations(container)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('circle')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders single point', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 50, y: 50 }],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('circle')).toHaveLength(1)
  })

  it('handles negative values', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [
        { x: -10, y: 20 },
        { x: 20, y: -30 },
        { x: -5, y: -15 }
      ],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('circle')).toHaveLength(3)
  })

  it('uses custom pointColor', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      pointColor: '#ff0000',
      width: 240,
      height: 160
    })

    const circle = container.querySelector('circle')
    expect(circle).toHaveAttribute('fill', '#ff0000')
  })

  it('uses custom pointSize', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      pointSize: 8,
      width: 240,
      height: 160
    })

    const circle = container.querySelector('circle')
    expect(circle).toHaveAttribute('r', '8')
  })

  it('hides axis when showAxis is false', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      showAxis: false,
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(0)
  })

  it('hides grid when showGrid is false', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      showGrid: false,
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('[data-chart-grid] line')).toHaveLength(0)
  })
})
