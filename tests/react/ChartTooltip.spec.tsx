/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ChartTooltip } from '@expcat/tigercat-react'
import { renderWithProps } from '../utils/render-helpers-react'
import { cleanup } from '@testing-library/react'

describe('ChartTooltip', () => {
  beforeEach(() => {
    document.querySelectorAll('[data-chart-tooltip]').forEach((t) => t.remove())
  })

  afterEach(() => {
    cleanup()
    document.querySelectorAll('[data-chart-tooltip]').forEach((t) => t.remove())
  })

  it('renders content when visible', () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', visible: true, x: 100, y: 100 })

    const tooltip = document.querySelector('[data-chart-tooltip]')
    expect(tooltip).toBeTruthy()
    expect(tooltip?.textContent).toContain('Tooltip text')
  })

  it('hides when not visible or empty', () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', visible: false, x: 100, y: 100 })

    const hiddenTooltip = document.querySelector('[data-chart-tooltip]')
    if (hiddenTooltip) {
      expect(hiddenTooltip.className).toContain('opacity-0')
    }

    cleanup()
    renderWithProps(ChartTooltip, { content: '', visible: true, x: 100, y: 100 })
    expect(document.querySelector('[data-chart-tooltip]')).toBeFalsy()
  })

  it('applies custom className', () => {
    renderWithProps(ChartTooltip, {
      content: 'Tooltip text',
      visible: true,
      x: 100,
      y: 100,
      className: 'custom-tooltip'
    })

    expect(document.querySelector('[data-chart-tooltip]')?.className).toContain('custom-tooltip')
  })
})
