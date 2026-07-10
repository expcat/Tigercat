/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { GaugeChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'
import { render } from '@testing-library/vue'

const defaultSize = { width: 280, height: 200 }

describe('GaugeChart (Vue)', () => {
  it('renders SVG with track and value arcs', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      ...defaultSize
    })

    expect(container.querySelector('svg')).toBeTruthy()
    // Track arc + value arc = at least 2 path elements
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

    // Default tickCount=5, each tick has a line and a text
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
      const { container } = render(GaugeChart, {
        props: {
          value: 50,
          ...defaultSize
        }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
  it('clamps value that exceeds max', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 150,
      min: 0,
      max: 100,
      ...defaultSize
    })

    const paths = container.querySelectorAll('path')
    const trackPath = paths[0].getAttribute('d')
    const valuePath = paths[1].getAttribute('d')
    expect(valuePath).toBe(trackPath)
  })
})
