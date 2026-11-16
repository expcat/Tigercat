/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { GaugeChart } from '@expcat/tigercat-vue/GaugeChart'
import { renderWithProps, expectNoA11yViolations } from '../utils'
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

    expect(container.firstElementChild?.classList.contains('my-gauge')).toBe(true)
  })

  it('renders a11y title and desc', () => {
    const { container } = renderWithProps(GaugeChart, {
      value: 50,
      title: 'Gauge Title',
      desc: 'Gauge Description',
      ...defaultSize
    })

    expect(container.querySelector('[role="meter"]')).toHaveAttribute('aria-label', 'Gauge Title')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(GaugeChart, {
        props: {
          value: 50,
          ...defaultSize
        }
      })
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

  it('hides decorative gauge marks from the accessibility tree in the DOM and SSR', async () => {
    const props = { value: 50, ...defaultSize }
    const { container } = renderWithProps(GaugeChart, props)
    const html = await renderToString(createSSRApp({ render: () => h(GaugeChart, props) }))
    const ssr = document.createElement('div')
    ssr.innerHTML = html
    expect(html).toContain('aria-hidden="true"')
    for (const root of [container, ssr]) {
      const marks = root.querySelectorAll('svg path, svg line, svg circle, svg text')
      expect(marks.length).toBeGreaterThan(0)
      for (const mark of marks) {
        expect(mark.getAttribute('aria-hidden')).toBe('true')
      }
    }
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
})
