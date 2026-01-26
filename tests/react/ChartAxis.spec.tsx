import { describe, it, expect } from 'vitest'
import React from 'react'
import { ChartAxis } from '@expcat/tigercat-react'
import { createLinearScale } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
import type { ChartAxisProps } from '@expcat/tigercat-react'

const ChartAxisWrapper: React.FC<ChartAxisProps> = (props) => (
  <svg>
    <ChartAxis {...props} />
  </svg>
)

describe('ChartAxis', () => {
  it('renders ticks and label', () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxisWrapper, {
      scale,
      tickValues: [0, 50, 100],
      label: 'Value'
    })

    expect(container.querySelectorAll('[data-axis-tick]')).toHaveLength(3)
    expect(container.querySelector('[data-axis-label]')).toHaveTextContent('Value')
  })

  it('passes basic a11y checks', async () => {
    const scale = createLinearScale([0, 100], [0, 200])
    const { container } = renderWithProps(ChartAxisWrapper, {
      scale,
      tickValues: [0, 50, 100]
    })

    await expectNoA11yViolations(container)
  })
})
