import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { SunburstChart } from '@expcat/tigercat-react/SunburstChart'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'
import { fireEvent, render } from '@testing-library/react'

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

function readSvgTextPoint(el: Element): { x: number; y: number } {
  return { x: Number(el.getAttribute('x')), y: Number(el.getAttribute('y')) }
}

describe('SunburstChart (React)', () => {
  it('renders SVG with arcs', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(3)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: [],
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
  })
  it('triggers hover events when hoverable', () => {
    const onHoveredIndexChange = vi.fn()
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      hoverable: true,
      onHoveredIndexChange,
      ...defaultSize
    })

    const paths = container.querySelectorAll('path')
    fireEvent.mouseEnter(paths[0])
    expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
  })

  it('triggers click events when selectable', () => {
    const onArcClick = vi.fn()
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      selectable: true,
      onArcClick,
      ...defaultSize
    })

    const paths = container.querySelectorAll('path')
    fireEvent.click(paths[0])
    expect(onArcClick).toHaveBeenCalled()
  })

  it('applies className', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      className: 'my-sunburst',
      ...defaultSize
    })

    expect(container.querySelector('svg.my-sunburst')).toBeTruthy()
  })

  it('renders a11y title and desc', () => {
    const { container } = renderWithProps(SunburstChart, {
      data: sampleData,
      title: 'Sunburst Title',
      desc: 'Sunburst Description',
      ...defaultSize
    })

    expect(container.querySelector('title')?.textContent).toBe('Sunburst Title')
    expect(container.querySelector('desc')?.textContent).toBe('Sunburst Description')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<SunburstChart data={sampleData} width={320} height={320} />)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('showLabels', () => {
    it('paints arc labels at distinct mid-ring points by default', () => {
      const { container } = renderWithProps(SunburstChart, {
        data: pagesData,
        ...defaultSize
      })

      const texts = Array.from(container.querySelectorAll('svg text'))
      expect(texts.length).toBeGreaterThanOrEqual(9)
      const labels = texts.map((el) => el.textContent)
      expect(labels).toContain('亚洲')
      expect(labels).toContain('中国')

      for (const el of texts) {
        const { x, y } = readSvgTextPoint(el)
        expect(Number.isFinite(x)).toBe(true)
        expect(Number.isFinite(y)).toBe(true)
      }
      expect(
        texts.every((el) => el.getAttribute('x') === '0' && el.getAttribute('y') === '0')
      ).toBe(false)

      const asia = texts.find((el) => el.textContent === '亚洲')
      const china = texts.find((el) => el.textContent === '中国')
      expect(asia).toBeTruthy()
      expect(china).toBeTruthy()
      expect(readSvgTextPoint(asia!)).not.toEqual(readSvgTextPoint(china!))
    })

    it('renders zero arc label texts when showLabels is false', () => {
      const { container } = renderWithProps(SunburstChart, {
        data: pagesData,
        showLabels: false,
        ...defaultSize
      })

      const texts = Array.from(container.querySelectorAll('svg text'))
      expect(texts).toHaveLength(0)
    })

    it('renders A, B, C labels for flat sample data', () => {
      const { container } = renderWithProps(SunburstChart, {
        data: sampleData,
        ...defaultSize
      })

      const labels = Array.from(container.querySelectorAll('svg text')).map((el) => el.textContent)
      expect(labels).toEqual(['A', 'B', 'C'])
    })
  })
})
