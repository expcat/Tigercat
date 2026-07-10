/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { HeatmapChart } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'
import { render } from '@testing-library/vue'

const data = [
  { x: 'A', y: 'One', value: 1 },
  { x: 'B', y: 'One', value: 2 },
  { x: 'A', y: 'Two', value: 3 },
  { x: 'B', y: 'Two', value: 4 }
]

const defaultProps = {
  width: 200,
  height: 160,
  padding: 20,
  data,
  xLabels: ['A', 'B'],
  yLabels: ['One', 'Two']
}

function createCanvasContextMock() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    textAlign: 'start',
    textBaseline: 'alphabetic',
    font: '',
    globalAlpha: 1,
    fillStyle: ''
  }
}

describe('HeatmapChart', () => {
  let context: ReturnType<typeof createCanvasContextMock>

  beforeEach(() => {
    context = createCanvasContextMock()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders svg cells by default for small heatmaps', () => {
    const { container } = renderWithProps(HeatmapChart, defaultProps)

    expect(container.querySelector('[data-heatmap-canvas]')).toBeNull()
    expect(container.querySelectorAll('rect')).toHaveLength(4)
  })

  it('uses canvas when auto mode exceeds the threshold', async () => {
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      canvasThreshold: 3,
      cellRadius: 0
    })

    await nextTick()
    await nextTick()

    const canvas = container.querySelector('[data-heatmap-canvas]')

    expect(canvas).toBeTruthy()
    expect(canvas).toHaveAttribute('data-heatmap-render-mode', 'canvas')
    expect(container.querySelectorAll('rect')).toHaveLength(0)
    expect(context.fillRect).toHaveBeenCalledTimes(4)
  })

  it('honors explicit svg mode even above the threshold', () => {
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      renderMode: 'svg',
      canvasThreshold: 3
    })

    expect(container.querySelector('[data-heatmap-canvas]')).toBeNull()
    expect(container.querySelectorAll('rect')).toHaveLength(4)
  })
  it('renders x and y axis labels', () => {
    const { container } = renderWithProps(HeatmapChart, defaultProps)
    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent)
    expect(texts).toEqual(expect.arrayContaining(['A', 'B', 'One', 'Two']))
  })

  it('renders cells with showValues enabled', () => {
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      showValues: true
    })

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent)
    expect(texts).toEqual(expect.arrayContaining(['1', '2', '3', '4']))
  })

  it('formats cell values with valueFormatter', () => {
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      showValues: true,
      valueFormatter: (v: number) => `${v}%`
    })

    const texts = Array.from(container.querySelectorAll('text')).map((t) => t.textContent)
    expect(texts).toEqual(expect.arrayContaining(['1%', '2%', '3%', '4%']))
  })
  it('renders empty data without errors', () => {
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      data: [],
      xLabels: [],
      yLabels: []
    })

    expect(container.querySelectorAll('rect')).toHaveLength(0)
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(HeatmapChart, {
        props: defaultProps
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
