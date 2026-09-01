/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { SunburstChart } from '@expcat/tigercat-vue/SunburstChart'
import { renderWithProps, expectNoA11yViolations } from '../utils'

const defaultSize = { width: 320, height: 320 }
const sampleData = [
  { label: 'A', value: 40 },
  { label: 'B', value: 30 },
  { label: 'C', value: 20 }
]
const pagesData = [
  {
    label: '亚洲',
    value: 60,
    children: [
      { label: '中国', value: 35 },
      { label: '日本', value: 15 },
      { label: '印度', value: 10 }
    ]
  },
  {
    label: '欧洲',
    value: 25,
    children: [
      { label: '德国', value: 12 },
      { label: '法国', value: 8 },
      { label: '英国', value: 5 }
    ]
  },
  { label: '美洲', value: 15 }
]

describe('SunburstChart (Vue)', () => {
  it('renders SVG with arcs', () => {
    const { container } = renderWithProps(SunburstChart, { data: sampleData, ...defaultSize })
    expect(container.querySelectorAll('[data-sunburst-arc]')).toHaveLength(3)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(SunburstChart, { data: [], ...defaultSize })
    expect(container.querySelectorAll('[data-sunburst-arc]')).toHaveLength(0)
  })

  it('fires arc click without selectable', () => {
    const onArcClick = vi.fn()
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      onArcClick,
      ...defaultSize
    })
    container
      .querySelectorAll('[data-sunburst-arc]')[1]
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onArcClick).toHaveBeenCalledWith(1, sampleData[1])
  })

  it('legend click highlights the matching root arc', () => {
    const onArcClick = vi.fn()
    const { container } = renderWithProps(SunburstChart, {
      data: pagesData,
      showLegend: true,
      onArcClick,
      ...defaultSize
    })
    const legendButtons = container.querySelectorAll('[data-legend-item]')
    legendButtons[legendButtons.length - 1].dispatchEvent(
      new MouseEvent('click', { bubbles: true })
    )
    expect(onArcClick.mock.calls[0][1].label).toBe('美洲')
  })

  it('applies className on the outer wrapper', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      className: 'my-sunburst',
      ...defaultSize
    })
    expect(container.firstElementChild).toHaveClass('my-sunburst')
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      title: 'Regions',
      ...defaultSize
    })
    await expectNoA11yViolations(container)
  })

  it('hides decorative arcs from the accessibility tree by default', () => {
    const { container } = renderWithProps(SunburstChart, { data: sampleData, ...defaultSize })
    const arc = container.querySelector('[data-sunburst-arc]')
    expect(arc).toHaveAttribute('aria-hidden', 'true')
    expect(arc).not.toHaveAttribute('role')
  })

  it('paints distinct labels for nested rings', () => {
    const { container } = renderWithProps(SunburstChart, { data: pagesData, ...defaultSize })
    const labels = Array.from(container.querySelectorAll('svg text')).map((el) => el.textContent)
    expect(labels).toContain('亚洲')
    expect(labels).toContain('中国')
  })
})
