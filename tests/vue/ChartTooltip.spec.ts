/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, afterEach } from 'vitest'
import { ChartTooltip } from '@expcat/tigercat-vue'
import { renderWithProps } from '../utils'

describe('ChartTooltip', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders content when visible', async () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', visible: true, x: 100, y: 100 })
    await new Promise((resolve) => setTimeout(resolve, 0))

    const tooltip = document.querySelector('[data-chart-tooltip]')
    expect(tooltip).toBeTruthy()
    expect(tooltip?.textContent).toContain('Tooltip text')
  })

  it('hides when not visible or empty', async () => {
    renderWithProps(ChartTooltip, { content: 'Tooltip text', visible: false, x: 100, y: 100 })
    await new Promise((resolve) => setTimeout(resolve, 0))

    const hiddenTooltip = document.querySelector('[data-chart-tooltip]')
    if (hiddenTooltip) {
      expect(hiddenTooltip.className).toContain('opacity-0')
    }

    document.body.innerHTML = ''
    renderWithProps(ChartTooltip, { content: '', visible: true, x: 100, y: 100 })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.querySelector('[data-chart-tooltip]')).toBeFalsy()
  })

  it('applies custom className', async () => {
    renderWithProps(ChartTooltip, {
      content: 'Tooltip text',
      visible: true,
      x: 100,
      y: 100,
      className: 'custom-tooltip'
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.querySelector('[data-chart-tooltip]')?.className).toContain('custom-tooltip')
  })
})
