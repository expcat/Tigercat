import { describe, it, expect } from 'vitest'
import { waitFor } from '@testing-library/react'
import { ScatterChart } from '@expcat/tigercat-react/ScatterChart'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'
import { zhCN } from '../../packages/core/src/utils/i18n/locales/zh-CN'

const defaultSize = { width: 240, height: 160 }

describe('ScatterChart', () => {
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
      data: [{ x: 10, y: 20 }]
    })

    await expectNoA11yViolationsIsolated(container)
  })

  it('localizes generated point and legend aria labels', () => {
    const { container } = renderWithProps(ScatterChart, {
      data: [{ x: 10, y: 20 }],
      showLegend: true,
      locale: zhCN,
      ...defaultSize
    })

    expect(container.querySelector('[aria-label="第 1 个点：(10, 20)"]')).toBeInTheDocument()
    expect(container.querySelector('[data-chart-legend="true"]')).toHaveAttribute(
      'aria-label',
      '图表图例'
    )
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

      expect(container.querySelector('circle')?.getAttribute('class')).toContain('cursor-pointer')
    })

    it('renders legend when showLegend is true', () => {
      const { container } = renderWithProps(ScatterChart, {
        data: interactiveData,
        showLegend: true,
        ...defaultSize
      })

      expect(container.querySelector('[role="list"][aria-label="Chart legend"]')).toBeTruthy()
    })
  })

  describe('pointStyle and animated', () => {
    const diamondData = [
      { x: 10, y: 25 },
      { x: 55, y: 75 }
    ]

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
})

function readPointTranslate(el: Element): [number, number] {
  const transform =
    el.getAttribute('transform') ?? el.parentElement?.getAttribute('transform') ?? ''
  const match = /translate\(\s*(-?[\d.]+)\s*(?:,|\s)\s*(-?[\d.]+)\s*\)/.exec(transform)
  expect(match, `expected translate() on point or wrapper, got "${transform}"`).toBeTruthy()
  return [Number(match![1]), Number(match![2])]
}
