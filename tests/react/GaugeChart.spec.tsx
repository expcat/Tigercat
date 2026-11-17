import { describe, it, expect } from 'vitest'
import React from 'react'
import { GaugeChart } from '@expcat/tigercat-react/GaugeChart'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
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
  it('renders ticks by default', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      ...defaultSize
    })

    const lines = container.querySelectorAll('line')
    expect(lines.length).toBeGreaterThanOrEqual(5)
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

    expect(container.firstElementChild).toHaveClass('my-gauge')
  })

  it('exposes a meter with the current value', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      label: 'CPU',
      ...defaultSize
    })
    const meter = container.querySelector('[role="meter"]')
    expect(meter).toHaveAttribute('aria-valuenow', '50')
    expect(meter).toHaveAttribute('aria-label', 'CPU')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<GaugeChart value={50} />)
      await expectNoA11yViolations(container)
    })
  })
  it.each([
    [150, 100],
    [-10, 0]
  ])('clamps the rendered and accessible value for %s', (value, expected) => {
    const { container } = renderWithProps(GaugeChart, {
      value,
      showTicks: false,
      min: 0,
      max: 100,
      ...defaultSize
    })

    const paths = container.querySelectorAll('path')
    const trackPath = paths[0].getAttribute('d')
    const valuePath = paths[1].getAttribute('d')
    if (expected === 100) expect(valuePath).toBe(trackPath)
    const meter = container.querySelector('[role="meter"]')
    expect(meter).toHaveAttribute('aria-valuenow', `${expected}`)
    expect(meter).toHaveAttribute('aria-valuetext', `${expected}`)
    expect(container.querySelector('text')?.textContent).toBe(`${expected}`)
  })

  it('keeps one tick label and an ordered meter range when min exceeds max', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 40,
      min: 100,
      max: 0,
      tickCount: 4,
      ...defaultSize
    })
    const tickLabels = [...container.querySelectorAll('text')].filter((node) =>
      (node.getAttribute('style') || '').includes('10px')
    )
    expect(tickLabels).toHaveLength(1)
    expect(tickLabels[0].textContent).toBe('100')
    const meter = container.querySelector('[role="meter"]')
    expect(Number(meter?.getAttribute('aria-valuemin'))).toBeLessThanOrEqual(
      Number(meter?.getAttribute('aria-valuemax'))
    )
  })

  it('does not paint the value arc with a gradient when segments cover the gauge', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 72,
      gradient: true,
      segments: [{ range: [0, 100], color: '#ccc' }],
      ...defaultSize
    })
    const valueArc = [...container.querySelectorAll('path')].find((path) => {
      const fill = path.getAttribute('fill') || ''
      return fill !== 'var(--tiger-border)' && fill !== '#ccc'
    })
    expect(valueArc).toBeTruthy()
    expect(valueArc?.getAttribute('fill')?.startsWith('url(#')).toBe(false)
  })

  it('uses the title when the meter label is an empty string', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 40,
      label: '',
      title: '压力',
      ...defaultSize
    })
    expect(container.querySelector('[role="meter"]')).toHaveAttribute('aria-label', '压力')
  })
})
