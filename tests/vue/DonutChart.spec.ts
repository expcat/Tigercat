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

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('uses custom colors when provided', () => {
    const customColors = ['#ff0000', '#00ff00']
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 40 }, { value: 30 }],
      colors: customColors,
      width: 240,
      height: 160
    })

    const slices = container.querySelectorAll('path[data-pie-slice]')
    expect(slices[0]).toHaveAttribute('fill', '#ff0000')
    expect(slices[1]).toHaveAttribute('fill', '#00ff00')
  })

  it('renders with custom thickness', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 40 }, { value: 30 }],
      thickness: 20,
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(2)
  })
})
