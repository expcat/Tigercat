/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { ChartGrid } from '@expcat/tigercat-vue'
import { createLinearScale } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('ChartGrid', () => {
  it('renders grid lines for both axes', () => {
    const xScale = createLinearScale([0, 100], [0, 200])
    const yScale = createLinearScale([0, 100], [100, 0])

    const { container } = renderWithProps(ChartGrid, {
      xScale,
      yScale,
      xTickValues: [0, 50, 100],
      yTickValues: [0, 50, 100]
    })

    expect(container.querySelectorAll('line')).toHaveLength(6)
  })

  it('passes basic a11y checks', async () => {
    const xScale = createLinearScale([0, 100], [0, 200])
    const yScale = createLinearScale([0, 100], [100, 0])

    const { container } = renderWithProps(ChartGrid, {
      xScale,
      yScale
    })

    await expectNoA11yViolations(container)
  })

  it('renders only horizontal lines when show is y', () => {
    const xScale = createLinearScale([0, 100], [0, 200])
    const yScale = createLinearScale([0, 100], [100, 0])

    const { container } = renderWithProps(ChartGrid, {
      xScale,
      yScale,
      xTickValues: [0, 50, 100],
      yTickValues: [0, 50, 100],
      show: 'y'
    })

    expect(container.querySelectorAll('line')).toHaveLength(3)
  })

  it('renders only vertical lines when show is x', () => {
    const xScale = createLinearScale([0, 100], [0, 200])
    const yScale = createLinearScale([0, 100], [100, 0])

    const { container } = renderWithProps(ChartGrid, {
      xScale,
      yScale,
      xTickValues: [0, 50, 100],
      yTickValues: [0, 50, 100],
      show: 'x'
    })

    expect(container.querySelectorAll('line')).toHaveLength(3)
  })

  it('renders dashed lines when lineStyle is dashed', () => {
    const xScale = createLinearScale([0, 100], [0, 200])
    const yScale = createLinearScale([0, 100], [100, 0])

    const { container } = renderWithProps(ChartGrid, {
      xScale,
      yScale,
      xTickValues: [0, 50],
      yTickValues: [0, 50],
      lineStyle: 'dashed'
    })

    const lines = container.querySelectorAll('line')
    expect(lines.length).toBeGreaterThan(0)
    lines.forEach((line) => {
      expect(line.getAttribute('stroke-dasharray')).toBeTruthy()
    })
  })

  it('renders no lines when show is none', () => {
    const xScale = createLinearScale([0, 100], [0, 200])
    const yScale = createLinearScale([0, 100], [100, 0])

    const { container } = renderWithProps(ChartGrid, {
      xScale,
      yScale,
      xTickValues: [0, 50, 100],
      yTickValues: [0, 50, 100],
      show: 'none'
    })

    expect(container.querySelectorAll('line')).toHaveLength(0)
  })
})
