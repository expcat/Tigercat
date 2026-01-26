/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { ChartCanvas } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('ChartCanvas', () => {
  it('renders svg with padding transform', () => {
    const { container } = renderWithProps(ChartCanvas, {
      width: 300,
      height: 160,
      padding: { left: 12, top: 8, right: 6, bottom: 4 }
    })

    const svg = container.querySelector('svg')
    const group = container.querySelector('g')

    expect(svg).toHaveAttribute('width', '300')
    expect(svg).toHaveAttribute('height', '160')
    expect(group).toHaveAttribute('transform', 'translate(12, 8)')
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ChartCanvas, {})
    await expectNoA11yViolations(container)
  })
})
