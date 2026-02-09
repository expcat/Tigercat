/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { DonutChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

const defaultSize = { width: 240, height: 160 }

describe('DonutChart', () => {
  it('renders slices', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 40 }, { value: 30 }, { value: 20 }],
      ...defaultSize
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
      ...defaultSize
    })

    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('uses custom colors and thickness', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 40 }, { value: 30 }],
      colors: ['#ff0000', '#00ff00'],
      thickness: 20,
      ...defaultSize
    })

    const slices = container.querySelectorAll('path[data-pie-slice]')
    expect(slices[0]).toHaveAttribute('fill', '#ff0000')
    expect(slices[1]).toHaveAttribute('fill', '#00ff00')
  })

  it('renders center content when centerValue and centerLabel are provided', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 60 }, { value: 40 }],
      centerValue: '100',
      centerLabel: '总计',
      ...defaultSize
    })

    const center = container.querySelector('[data-donut-center]')
    expect(center).toBeTruthy()
    expect(center!.textContent).toContain('100')
    expect(center!.textContent).toContain('总计')
  })

  it('does not render center content when props are absent', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 50 }, { value: 50 }],
      ...defaultSize
    })

    expect(container.querySelector('[data-donut-center]')).toBeNull()
  })

  it('has a wrapper with data-donut-chart attribute', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 10 }],
      ...defaultSize
    })

    expect(container.querySelector('[data-donut-chart]')).toBeTruthy()
  })

  it('uses ECharts-inspired palette when no custom colors are provided', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 30 }, { value: 20 }],
      ...defaultSize
    })

    const slices = container.querySelectorAll('path[data-pie-slice]')
    // First color in DONUT_PALETTE is #5470c6
    expect(slices[0]).toHaveAttribute('fill', '#5470c6')
  })

  it('applies shadow by default', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 50 }, { value: 50 }],
      ...defaultSize
    })

    const slice = container.querySelector('path[data-pie-slice]')
    const style = slice?.getAttribute('style') ?? ''
    expect(style).toContain('drop-shadow')
  })
})
