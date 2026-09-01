import { describe, it, expect, vi } from 'vitest'
import { DonutChart } from '@expcat/tigercat-react/DonutChart'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
import { fireEvent } from '@testing-library/react'
import { DEFAULT_DONUT_INNER_RADIUS_RATIO, PIE_OUTSIDE_RADIUS_RATIO } from '@expcat/tigercat-core'

const defaultSize = { width: 240, height: 160 }
const data = [
  { value: 40, label: 'A' },
  { value: 30, label: 'B' }
]

describe('DonutChart', () => {
  it('renders slices', () => {
    const { container } = renderWithProps(DonutChart, {
      data: [{ value: 40 }, { value: 30 }, { value: 20 }],
      ...defaultSize
    })
    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(DonutChart, { data, title: 'Share' })
    await expectNoA11yViolations(container)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(DonutChart, { data: [], ...defaultSize })
    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
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
    const { container } = renderWithProps(DonutChart, { data: [{ value: 10 }], ...defaultSize })
    expect(container.querySelector('[data-donut-chart]')).toBeTruthy()
  })

  it('uses the shared chart palette', () => {
    const { container } = renderWithProps(DonutChart, { data, ...defaultSize })
    expect(container.querySelector('path[data-pie-slice]')).toHaveAttribute(
      'fill',
      'var(--tiger-chart-1,#2563eb)'
    )
  })

  it('keeps a ring when outside labels shrink the outer radius', () => {
    const { container } = renderWithProps(DonutChart, {
      data,
      labelPosition: 'outside',
      ...defaultSize
    })
    const path = container.querySelector('path[data-pie-slice]')?.getAttribute('d') ?? ''
    expect(path).toContain('A')
    expect(DEFAULT_DONUT_INNER_RADIUS_RATIO).toBeLessThan(PIE_OUTSIDE_RADIUS_RATIO)
  })

  it('keeps center text for every legend position', () => {
    for (const legendPosition of ['top', 'left', 'bottom', 'right'] as const) {
      const { container } = renderWithProps(DonutChart, {
        data,
        showLegend: true,
        legendPosition,
        centerValue: '42',
        ...defaultSize
      })
      expect(container.querySelector('[data-donut-center]')?.textContent).toContain('42')
    }
  })

  it('does not inject a style tag when animated', () => {
    const { container } = renderWithProps(DonutChart, { data, animated: true, ...defaultSize })
    expect(container.querySelector('style')).toBeNull()
  })

  it('forwards slice-click as (index, datum)', () => {
    const onSliceClick = vi.fn()
    const { container } = renderWithProps(DonutChart, { data, onSliceClick, ...defaultSize })
    fireEvent.click(container.querySelectorAll('path[data-pie-slice]')[1])
    expect(onSliceClick).toHaveBeenCalledWith(1, data[1])
  })
})
