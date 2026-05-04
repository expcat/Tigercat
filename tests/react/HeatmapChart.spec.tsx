/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeatmapChart } from '@expcat/tigercat-react'
import { renderWithProps } from '../utils/render-helpers-react'

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

  it('uses canvas when auto mode exceeds the threshold', () => {
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      canvasThreshold: 3,
      cellRadius: 0
    })

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
})
