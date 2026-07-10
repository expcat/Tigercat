import { describe, it, expect } from 'vitest'
import { ScatterChart } from '@expcat/tigercat-react'
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
})
