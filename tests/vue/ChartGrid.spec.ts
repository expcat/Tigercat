/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { ChartGrid } from '@expcat/tigercat-vue'
import { createLinearScale } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolations } from '../utils'

const xScale = createLinearScale([0, 100], [0, 200])
const yScale = createLinearScale([0, 100], [100, 0])
const tickValues = [0, 50, 100]

describe('ChartGrid', () => {
  it('renders grid lines for both axes', () => {
    const { container } = renderWithProps(ChartGrid, {
      xScale,
      yScale,
      xTickValues: tickValues,
      yTickValues: tickValues
    })

    expect(container.querySelectorAll('line')).toHaveLength(6)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartGrid, { xScale, yScale })
    await expectNoA11yViolations(container)
  })

  it('respects show option for x, y, or none', () => {
    const baseProps = { xScale, yScale, xTickValues: tickValues, yTickValues: tickValues }

    const { container: yOnly } = renderWithProps(ChartGrid, { ...baseProps, show: 'y' })
    expect(yOnly.querySelectorAll('line')).toHaveLength(3)

    const { container: xOnly } = renderWithProps(ChartGrid, { ...baseProps, show: 'x' })
    expect(xOnly.querySelectorAll('line')).toHaveLength(3)

    const { container: none } = renderWithProps(ChartGrid, { ...baseProps, show: 'none' })
    expect(none.querySelectorAll('line')).toHaveLength(0)
  })

  it('renders dashed lines when lineStyle is dashed', () => {
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
})
