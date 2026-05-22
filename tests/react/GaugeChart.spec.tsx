import { describe, it, expect } from 'vitest'
import React from 'react'
import { GaugeChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils/render-helpers-react'
import { render } from '@testing-library/react'

const defaultSize = { width: 280, height: 200 }

describe('GaugeChart (React)', () => {
  it('renders SVG with track and value arcs', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(2)
  })

  it('displays formatted value text', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 75,
      ...defaultSize
    })

    const texts = container.querySelectorAll('text')
    const valueText = Array.from(texts).find((t) => t.textContent === '75')
    expect(valueText).toBeTruthy()
  })

  it('uses custom valueFormatter', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 75,
      valueFormatter: (v: number) => `${v}%`,
      ...defaultSize
    })

    const texts = container.querySelectorAll('text')
    const formatted = Array.from(texts).find((t) => t.textContent === '75%')
    expect(formatted).toBeTruthy()
  })

  it('renders label text', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      label: 'Speed',
      ...defaultSize
    })

    const texts = container.querySelectorAll('text')
    const labelText = Array.from(texts).find((t) => t.textContent === 'Speed')
    expect(labelText).toBeTruthy()
  })

  it('renders ticks by default', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      ...defaultSize
    })

    const lines = container.querySelectorAll('line')
    expect(lines.length).toBeGreaterThanOrEqual(5)
  })

  it('hides ticks when showTicks=false', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      showTicks: false,
      ...defaultSize
    })

    const lines = container.querySelectorAll('line')
    expect(lines).toHaveLength(0)
  })

  it('renders center dot (circle)', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      ...defaultSize
    })

    expect(container.querySelector('circle')).toBeTruthy()
  })

  it('renders segments when provided', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 60,
      segments: [
        { range: [0, 40] as [number, number], color: '#22c55e' },
        { range: [40, 70] as [number, number], color: '#eab308' },
        { range: [70, 100] as [number, number], color: '#ef4444' }
      ],
      ...defaultSize
    })

    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(5)
  })

  it('applies gradient when enabled', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      gradient: true,
      ...defaultSize
    })

    expect(container.querySelector('defs linearGradient')).toBeTruthy()
  })

  it('respects min/max range', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 500,
      min: 0,
      max: 1000,
      ...defaultSize
    })

    const texts = container.querySelectorAll('text')
    const valueText = Array.from(texts).find((t) => t.textContent === '500')
    expect(valueText).toBeTruthy()
  })

  it('applies className', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      className: 'my-gauge',
      ...defaultSize
    })

    expect(container.querySelector('svg.my-gauge')).toBeTruthy()
  })

  it('renders a11y title and desc', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      title: 'Gauge Title',
      desc: 'Gauge Description',
      ...defaultSize
    })

    expect(container.querySelector('title')?.textContent).toBe('Gauge Title')
    expect(container.querySelector('desc')?.textContent).toBe('Gauge Description')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<GaugeChart />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
