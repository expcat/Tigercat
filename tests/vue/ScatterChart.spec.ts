/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { ScatterChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('ScatterChart', () => {
  it('renders points', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [
        { x: 10, y: 20 },
        { x: 20, y: 30 },
        { x: 30, y: 40 }
      ],
      width: 240,
      height: 160
    })

    expect(container.querySelectorAll('circle')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }]
    })

    await expectNoA11yViolations(container)
  })
})
