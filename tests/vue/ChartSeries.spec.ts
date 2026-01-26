/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { ChartSeries } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('ChartSeries', () => {
  it('renders series metadata', () => {
    const { container } = renderWithProps(ChartSeries, {
      data: [{ x: 0, y: 10 }],
      name: 'Series A',
      type: 'scatter'
    })

    const series = container.querySelector('g')
    expect(series).toHaveAttribute('data-series-name', 'Series A')
    expect(series).toHaveAttribute('data-series-type', 'scatter')
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartSeries, {
      data: [{ x: 0, y: 10 }]
    })

    await expectNoA11yViolations(container)
  })
})
