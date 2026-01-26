import { describe, it, expect } from 'vitest'
import React from 'react'
import { ChartSeries } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'

const ChartSeriesWrapper: React.FC<React.ComponentProps<typeof ChartSeries>> = (props) => (
  <svg>
    <ChartSeries {...props} />
  </svg>
)

describe('ChartSeries', () => {
  it('renders series metadata', () => {
    const { container } = renderWithProps(ChartSeriesWrapper, {
      data: [{ x: 0, y: 10 }],
      name: 'Series A',
      type: 'scatter'
    })

    const series = container.querySelector('g')
    expect(series).toHaveAttribute('data-series-name', 'Series A')
    expect(series).toHaveAttribute('data-series-type', 'scatter')
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartSeriesWrapper, {
      data: [{ x: 0, y: 10 }]
    })

    await expectNoA11yViolations(container)
  })
})
