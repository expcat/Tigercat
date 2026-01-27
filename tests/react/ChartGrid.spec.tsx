/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import { ChartGrid } from '@expcat/tigercat-react'
import { createLinearScale } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'

const ChartGridWrapper: React.FC<React.ComponentProps<typeof ChartGrid>> = (props) => (
  <svg>
    <ChartGrid {...props} />
  </svg>
)

const xScale = createLinearScale([0, 100], [0, 200])
const yScale = createLinearScale([0, 100], [100, 0])
const tickValues = [0, 50, 100]

describe('ChartGrid', () => {
  it('renders grid lines for both axes', () => {
    const { container } = renderWithProps(ChartGridWrapper, {
      xScale,
      yScale,
      xTickValues: tickValues,
      yTickValues: tickValues
    })

    expect(container.querySelectorAll('line')).toHaveLength(6)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartGridWrapper, { xScale, yScale })
    await expectNoA11yViolations(container)
  })

  it('respects show option for x, y, or none', () => {
    const baseProps = { xScale, yScale, xTickValues: tickValues, yTickValues: tickValues }

    const { container: yOnly } = renderWithProps(ChartGridWrapper, { ...baseProps, show: 'y' })
    expect(yOnly.querySelectorAll('line')).toHaveLength(3)

    const { container: xOnly } = renderWithProps(ChartGridWrapper, { ...baseProps, show: 'x' })
    expect(xOnly.querySelectorAll('line')).toHaveLength(3)

    const { container: none } = renderWithProps(ChartGridWrapper, { ...baseProps, show: 'none' })
    expect(none.querySelectorAll('line')).toHaveLength(0)
  })

  it('renders dashed lines when lineStyle is dashed', () => {
    const { container } = renderWithProps(ChartGridWrapper, {
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
