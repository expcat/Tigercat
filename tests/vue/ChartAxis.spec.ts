/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { ChartAxis } from '@expcat/tigercat-vue'
import { createLinearScale } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolations } from '../utils'

const scale = createLinearScale([0, 100], [0, 200])
const tickValues = [0, 50, 100]

describe('ChartAxis', () => {
  it('renders ticks and label', () => {
    const { container } = renderWithProps(ChartAxis, { scale, tickValues, label: 'Value' })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
    expect(container.querySelector('[data-axis-label]')).toHaveTextContent('Value')
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartAxis, { scale, tickValues })
    await expectNoA11yViolations(container)
  })

  it('renders with all positions', () => {
    const positions = ['bottom', 'top', 'left', 'right'] as const
    positions.forEach((position) => {
      const { container } = renderWithProps(ChartAxis, { scale, tickValues, position })
      expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
    })
  })

  it('renders with custom tick format', () => {
    const { container } = renderWithProps(ChartAxis, {
      scale,
      tickValues,
      tickFormat: (v: number) => `$${v}`
    })

    const ticks = container.querySelectorAll('[data-axis-tick]')
    expect(ticks[0]).toHaveTextContent('$0')
    expect(ticks[1]).toHaveTextContent('$50')
    expect(ticks[2]).toHaveTextContent('$100')
  })

  it('renders with empty tickValues', () => {
    const { container } = renderWithProps(ChartAxis, { scale, tickValues: [] })
    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(0)
  })
})
