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

  it('renders with position bottom', () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxis, {
      scale,
      tickValues: [0, 50, 100],
      position: 'bottom'
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
  })

  it('renders with position top', () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxis, {
      scale,
      tickValues: [0, 50, 100],
      position: 'top'
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
  })

  it('renders with position left', () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxis, {
      scale,
      tickValues: [0, 50, 100],
      position: 'left'
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
  })

  it('renders with position right', () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxis, {
      scale,
      tickValues: [0, 50, 100],
      position: 'right'
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
  })

  it('renders with custom tick format', () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxis, {
      scale,
      tickValues: [0, 50, 100],
      tickFormat: (v: number) => `$${v}`
    })

    const ticks = container.querySelectorAll('[data-axis-tick]')
    expect(ticks[0]).toHaveTextContent('$0')
    expect(ticks[1]).toHaveTextContent('$50')
    expect(ticks[2]).toHaveTextContent('$100')
  })

  it('renders with empty tickValues', () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxis, {
      scale,
      tickValues: []
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(0)
  })
})
