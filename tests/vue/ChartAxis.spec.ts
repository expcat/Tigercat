/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { ChartAxis } from '@expcat/tigercat-vue'
import { createLinearScale } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('ChartAxis', () => {
  it('renders ticks and label', () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxis, {
      scale,
      tickValues: [0, 50, 100],
      label: 'Value'
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
    expect(container.querySelector('[data-axis-label]')).toHaveTextContent('Value')
  })

  it('passes basic a11y checks', async () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxis, {
      scale,
      tickValues: [0, 50, 100]
    })

    await expectNoA11yViolations(container)
  })
})
