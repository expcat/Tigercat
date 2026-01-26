import { describe, it, expect } from 'vitest'
import React from 'react'
import { BarChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'

describe('BarChart', () => {
  it('renders bars', () => {
    const { container } = renderWithProps(BarChart, {
      data: [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 }
      ],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('rect')).toHaveLength(2)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(BarChart, {
      data: [{ x: 'A', y: 10 }]
    })

    await expectNoA11yViolations(container)
  })
})
