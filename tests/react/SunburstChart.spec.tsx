import { describe, it, expect, vi } from 'vitest'
import { SunburstChart } from '@expcat/tigercat-react/SunburstChart'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
import { fireEvent } from '@testing-library/react'

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

describe('SunburstChart (React)', () => {
  it('renders SVG with arcs', () => {
    const { container } = renderWithProps(SunburstChart, { data: sampleData, ...defaultSize })
    expect(container.querySelectorAll('[data-sunburst-arc]')).toHaveLength(3)
    expect(container.querySelector('svg')).toHaveAttribute('data-chart-canvas', '')
    fireEvent.focus(container.querySelector('[data-sunburst-arc]')!)
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
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
    fireEvent.click(container.querySelectorAll('[data-sunburst-arc]')[1])
    expect(onArcClick).toHaveBeenCalledWith(1, sampleData[1])
  })

  it('legend click hides the matching root arc without selecting it', () => {
    const onArcClick = vi.fn()
    const { container } = renderWithProps(SunburstChart, {
      data: pagesData,
      showLegend: true,
      onArcClick,
      ...defaultSize
    })
    const legendButtons = container.querySelectorAll('[data-legend-item]')
    fireEvent.click(legendButtons[legendButtons.length - 1])
    expect(onArcClick).not.toHaveBeenCalled()
    expect(container.querySelector('[data-legend-hidden="true"]')).toBeTruthy()
  })

  it('paints gradient fills in sunburst user space', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      gradient: true,
      ...defaultSize
    })
    expect(container.querySelector('linearGradient')).toHaveAttribute(
      'gradientUnits',
      'userSpaceOnUse'
    )
    expect(container.querySelector('[data-sunburst-arc]')?.getAttribute('fill')).toMatch(
      /^url\(#tiger-sunburst-/
    )
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
