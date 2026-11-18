/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/vue'
import { ScatterChart } from '@expcat/tigercat-vue/ScatterChart'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { renderWithProps, expectNoA11yViolations } from '../utils'

const defaultSize = { width: 240, height: 160 }

describe('ScatterChart', () => {
  it.each(['circle', 'square'] as const)(
    'moves %s focus and tab stop with only a click handler',
    async (pointStyle) => {
      const { container } = renderWithProps(ScatterChart, {
        ...defaultSize,
        data: [
          { x: 10, y: 20 },
          { x: 30, y: 40 }
        ],
        pointStyle,
        onPointClick: vi.fn()
      })
      const [first, second] = container.querySelectorAll<SVGElement>('[data-point-index]')
      first.focus()
      await fireEvent.keyDown(first, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(second)
      expect(first).toHaveAttribute('tabindex', '-1')
      expect(second).toHaveAttribute('tabindex', '0')
    }
  )

  it('renders points', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [
        { x: 10, y: 20 },
        { x: 20, y: 30 },
        { x: 30, y: 40 }
      ],
      ...defaultSize
    })

    expect(container.querySelectorAll('circle')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      title: 'Stores'
    })

    await expectNoA11yViolations(container)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelectorAll('circle')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })
  describe('interaction', () => {
    const interactiveData = [
      { x: 10, y: 20, label: 'Point A' },
      { x: 30, y: 40, label: 'Point B' },
      { x: 50, y: 60, label: 'Point C' }
    ]

    it('adds cursor-pointer class when hoverable', () => {
      const { container } = renderWithProps(ScatterChart, {
        data: interactiveData,
        hoverable: true,
        ...defaultSize
      })

      expect(container.querySelector('circle')?.className).toContain('cursor-pointer')
    })

    it('renders legend when showLegend is true', () => {
      const { container } = renderWithProps(ScatterChart, {
        data: interactiveData,
        showLegend: true,
        ...defaultSize
      })

      expect(container.querySelector('[data-chart-legend="true"]')).toBeTruthy()
    })
  })

  describe('pointStyle and animated', () => {
    const diamondData = [
      { x: 10, y: 25 },
      { x: 55, y: 75 }
    ]

    it('keeps animated points hidden when their legend item is toggled off', async () => {
      const { container } = renderWithProps(ScatterChart, {
        data: diamondData,
        animated: true,
        showLegend: true,
        selectable: true,
        ...defaultSize
      })
      const [first, second] = container.querySelectorAll('[data-point-index]')
      await waitFor(() => expect(first).toHaveClass('tiger-scatter-entrance'))

      await fireEvent.click(container.querySelector('[data-legend-item]')!)

      expect(first).toHaveAttribute('opacity', '0')
      expect(first).not.toHaveClass('tiger-scatter-entrance')
      expect(second).toHaveClass('tiger-scatter-entrance')
    })

    it('keeps distinct SVG translates for animated diamond points', async () => {
      const { container } = renderWithProps(ScatterChart, {
        data: diamondData,
        pointStyle: 'diamond',
        animated: true,
        ...defaultSize
      })

      await waitFor(() => {
        const points = container.querySelectorAll('[data-point-index]')
        expect(points).toHaveLength(2)
        expect([...points].every((el) => el.classList.contains('tiger-scatter-entrance'))).toBe(
          true
        )
      })

      const points = [...container.querySelectorAll('[data-point-index]')]
      expect(container.querySelectorAll('path[data-point-index]')).toHaveLength(2)

      const translates = points.map(readPointTranslate)
      const keys = new Set(translates.map(([x, y]) => `${x},${y}`))
      expect(keys.size).toBe(translates.length)
      expect(translates.every(([x, y]) => x === 0 && y === 0)).toBe(false)
    })

    it('keeps numeric cx/cy on animated circle points', async () => {
      const { container } = renderWithProps(ScatterChart, {
        data: diamondData,
        animated: true,
        ...defaultSize
      })

      await waitFor(() => {
        const circles = container.querySelectorAll('circle[data-point-index]')
        expect(circles).toHaveLength(2)
        expect([...circles].every((el) => el.classList.contains('tiger-scatter-entrance'))).toBe(
          true
        )
      })

      const circles = [...container.querySelectorAll('circle[data-point-index]')]
      const cxs = circles.map((el) => Number(el.getAttribute('cx')))
      const cys = circles.map((el) => Number(el.getAttribute('cy')))
      expect(cxs.every(Number.isFinite)).toBe(true)
      expect(cys.every(Number.isFinite)).toBe(true)
      expect(cxs.every((n) => n === 0) && cys.every((n) => n === 0)).toBe(false)
    })

    it('translates non-animated diamond points without the entrance class', () => {
      const { container } = renderWithProps(ScatterChart, {
        data: diamondData,
        pointStyle: 'diamond',
        ...defaultSize
      })

      const points = [...container.querySelectorAll('[data-point-index]')]
      expect(points).toHaveLength(2)
      points.forEach((el) => {
        expect(el.classList.contains('tiger-scatter-entrance')).toBe(false)
      })

      const translates = points.map(readPointTranslate)
      const keys = new Set(translates.map(([x, y]) => `${x},${y}`))
      expect(keys.size).toBe(translates.length)
      expect(translates.every(([x, y]) => x === 0 && y === 0)).toBe(false)
    })
  })

  it('fires point-click without selectable and localizes legend and tooltip', async () => {
    const view = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20, color: '#abc' }],
      gradient: true,
      showLegend: true,
      locale: zhCN,
      ...defaultSize
    })
    expect(view.container.querySelector('circle[data-point-index]')?.getAttribute('fill')).toMatch(
      /^url\(#tiger-scatter-grad-/
    )
    await fireEvent.click(view.container.querySelector('circle[data-point-index]')!)
    expect(view.emitted()['point-click']).toBeTruthy()
    expect(view.container.querySelector('[aria-label="图表图例"]')).toBeTruthy()
    await fireEvent.mouseEnter(view.container.querySelector('circle[data-point-index]')!)
    expect(document.body.querySelector('[data-chart-tooltip]')?.textContent).toContain('第 1 个点')
  })
  it('ignores hover and click on legend-hidden marks', async () => {
    const onHover = vi.fn()
    const onClick = vi.fn()
    const { container } = renderWithProps(ScatterChart, {
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 }
      ],
      showLegend: true,
      hoverable: true,
      selectable: true,
      'onUpdate:hoveredIndex': onHover,
      onPointClick: onClick
    })
    await fireEvent.click(container.querySelector('[data-legend-item]')!)
    onHover.mockClear()
    const hidden = container.querySelector('[data-point-index="0"]')!
    await fireEvent.mouseEnter(hidden)
    await fireEvent.click(hidden)
    expect(onHover).not.toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
    expect(hidden).toHaveAttribute('pointer-events', 'none')
    expect(hidden).not.toHaveAttribute('tabindex')
  })

  it('names the svg from the title or the zh-CN scatter label', () => {
    const untitled = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      locale: zhCN,
      ...defaultSize
    })
    expect(untitled.container.querySelector('svg')).toHaveAttribute('aria-label', '散点图')
    untitled.unmount()

    const titled = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      locale: zhCN,
      title: '季度',
      ...defaultSize
    })
    expect(titled.container.querySelector('svg')).toHaveAttribute('aria-label', '季度')
  })

  it('keeps legend items as divs when only a point click handler is set', async () => {
    const onPointClick = vi.fn()
    const { container } = renderWithProps(ScatterChart, {
      data: [
        { x: 10, y: 20 },
        { x: 30, y: 40 }
      ],
      showLegend: true,
      onPointClick,
      ...defaultSize
    })
    const items = [...container.querySelectorAll('[data-legend-item]')]
    expect(items.length).toBeGreaterThan(0)
    items.forEach((item) => expect(item.tagName).toBe('DIV'))
    await fireEvent.click(container.querySelector('[data-point-index="0"]')!)
    expect(onPointClick).toHaveBeenCalledTimes(1)
  })
})

function readPointTranslate(el: Element): [number, number] {
  const transform =
    el.getAttribute('transform') ?? el.parentElement?.getAttribute('transform') ?? ''
  const match = /translate\(\s*(-?[\d.]+)\s*(?:,|\s)\s*(-?[\d.]+)\s*\)/.exec(transform)
  expect(match, `expected translate() on point or wrapper, got "${transform}"`).toBeTruthy()
  return [Number(match![1]), Number(match![2])]
}
