/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { DonutChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('DonutChart', () => {
  it('renders slices', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 40 }, { value: 30 }, { value: 20 }],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 40 }, { value: 30 }]
    })

    await expectNoA11yViolations(container)
  })
})
