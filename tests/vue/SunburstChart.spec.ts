/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
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
  it.each([{ showTooltip: false }, { selectedIndex: 0 }])(
    'moves the tab stop independently of tooltip and selection: %j',
    async (options) => {
      const { container } = renderWithProps(SunburstChart, {
        ...defaultSize,
        data: sampleData.slice(0, 2),
        selectable: true,
        ...options
      })
      const [first, second] = container.querySelectorAll<SVGElement>('[data-sunburst-arc]')
      first.focus()
      await fireEvent.keyDown(first, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(second)
      expect(first).toHaveAttribute('tabindex', '-1')
      expect(second).toHaveAttribute('tabindex', '0')
    }
  )

  it('renders SVG with arcs', () => {
    const { container } = renderWithProps(SunburstChart, { data: sampleData, ...defaultSize })
    expect(container.querySelectorAll('[data-sunburst-arc]')).toHaveLength(3)
    expect(container.querySelector('svg')).toHaveAttribute('data-chart-canvas', '')
    container
      .querySelector('[data-sunburst-arc]')
      ?.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
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
    container
      .querySelectorAll('[data-sunburst-arc]')[1]
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onArcClick).toHaveBeenCalledWith(1, sampleData[1])
  })

  it('legend click hides the matching root arc without selecting it', async () => {
    const onArcClick = vi.fn()
    const { container } = renderWithProps(SunburstChart, {
      data: pagesData,
      showLegend: true,
      onArcClick,
      ...defaultSize
    })
    const legendButtons = container.querySelectorAll('[data-legend-item]')
    const last = legendButtons[legendButtons.length - 1]
    last.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(onArcClick).not.toHaveBeenCalled()
    expect(container.querySelector('[data-legend-hidden="true"]')).toBeTruthy()
  })

  it('maps legend selection state by preorder arc index for nested roots', () => {
    // pagesData preorder: 亚洲=0, 中国=1, 日本=2, 印度=3, 欧洲=4, ..., 美洲=8
    const { container } = renderWithProps(SunburstChart, {
      data: pagesData,
      showLegend: true,
      selectable: true,
      selectedIndex: 4,
      ...defaultSize
    })
    const legendButtons = container.querySelectorAll('[data-legend-item]')
    expect(legendButtons[0].getAttribute('aria-pressed')).toBe('false')
    expect(legendButtons[1].getAttribute('aria-pressed')).toBe('true')
    expect(legendButtons[2].getAttribute('aria-pressed')).toBe('false')
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
  it('ignores hover and click on legend-hidden marks', async () => {
    const onHover = vi.fn()
    const onClick = vi.fn()
    const { container } = renderWithProps(SunburstChart, {
      data: [
        { label: 'Hidden', children: [{ label: 'Child', value: 40 }] },
        { label: 'Visible', value: 20 }
      ],
      showLegend: true,
      hoverable: true,
      selectable: true,
      'onUpdate:hoveredIndex': onHover,
      onArcClick: onClick
    })
    await fireEvent.click(container.querySelector('[data-legend-item]')!)
    onHover.mockClear()
    const hidden = container.querySelector('[data-sunburst-arc][data-index="1"]')!
    await fireEvent.mouseEnter(hidden)
    await fireEvent.click(hidden)
    expect(onHover).not.toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
    expect(hidden).toHaveAttribute('pointer-events', 'none')
    expect(hidden).not.toHaveAttribute('tabindex')
  })
})
