/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { HeatmapChart } from '@expcat/tigercat-react/HeatmapChart'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
import { act, fireEvent, render } from '@testing-library/react'

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
    setTransform: vi.fn(),
    textAlign: 'start',
    textBaseline: 'alphabetic',
    font: '',
    globalAlpha: 1,
    fillStyle: ''
  }
}

describe('HeatmapChart', () => {
  it.each(['auto', 'canvas'] as const)(
    'exposes every formatted cell value in a readable table in %s DOM and SSR',
    (renderMode) => {
      const props = { ...defaultProps, renderMode, valueFormatter: (value: number) => `${value}%` }
      const { container } = renderWithProps(HeatmapChart, props)
      const ssr = document.createElement('div')
      ssr.innerHTML = renderToString(<HeatmapChart {...props} />)

      for (const root of [container, ssr]) {
        const table = root.querySelector('[data-heatmap-table]')
        expect(table).toHaveClass('sr-only')
        expect(Array.from(table!.querySelectorAll('tbody td'), (cell) => cell.textContent)).toEqual(
          ['1%', '2%', '3%', '4%']
        )
      }
    }
  )

  it.each(['svg', 'canvas'] as const)(
    'moves the %s cell tab stop without tooltip tracking',
    (renderMode) => {
      const { container } = renderWithProps(HeatmapChart, {
        ...defaultProps,
        renderMode,
        showTooltip: false,
        onCellClick: vi.fn()
      })
      if (renderMode === 'canvas') {
        const canvas = container.querySelector<HTMLCanvasElement>('[data-heatmap-canvas]')!
        act(() => canvas.focus())
        fireEvent.keyDown(canvas, { key: 'ArrowRight' })
        expect(canvas).toHaveAttribute('aria-label', expect.stringContaining('B × One: 2'))
      } else {
        const [first, second] = container.querySelectorAll<SVGElement>('[data-heatmap-cell]')
        act(() => first.focus())
        fireEvent.keyDown(first, { key: 'ArrowRight' })
        expect(document.activeElement).toBe(second)
        expect(first).toHaveAttribute('tabindex', '-1')
        expect(second).toHaveAttribute('tabindex', '0')
      }
    }
  )

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
    expect(container.querySelectorAll('[data-heatmap-cell]')).toHaveLength(4)
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
    expect(container.querySelectorAll('[data-heatmap-cell]')).toHaveLength(0)
    expect(context.fillRect).toHaveBeenCalled()
  })

  it('honors explicit svg mode even above the threshold', () => {
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      renderMode: 'svg',
      canvasThreshold: 3
    })

    expect(container.querySelector('[data-heatmap-canvas]')).toBeNull()
    expect(container.querySelectorAll('[data-heatmap-cell]')).toHaveLength(4)
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

    expect(container.querySelectorAll('[data-heatmap-cell]')).toHaveLength(0)
  })

  it('keeps the user cellRadius on the SVG attribute', () => {
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      cellRadius: 8
    })
    const cell = container.querySelector('[data-heatmap-cell]')
    expect(cell).toHaveAttribute('rx', '8')
    expect((cell as SVGRectElement).style.rx).toBe('')
  })

  it('applies className on the outer wrapper', () => {
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      className: 'my-heatmap'
    })
    expect(container.firstElementChild).toHaveClass('my-heatmap')
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(HeatmapChart, { ...defaultProps, title: 'Traffic' })
    await expectNoA11yViolations(container)
  })

  it('hides decorative cells from the accessibility tree by default', () => {
    const { container } = renderWithProps(HeatmapChart, defaultProps)
    const cell = container.querySelector('[data-heatmap-cell]')
    expect(cell).toHaveAttribute('aria-hidden', 'true')
    expect(cell).not.toHaveAttribute('role')
  })

  it('uses a single tab stop when selectable', () => {
    const { container } = renderWithProps(HeatmapChart, { ...defaultProps, selectable: true })
    const cells = container.querySelectorAll('[data-heatmap-cell]')
    expect(cells[0]).toHaveAttribute('role', 'button')
    expect(cells[0]).toHaveAttribute('tabindex', '0')
    expect(cells[1]).toHaveAttribute('tabindex', '-1')
  })

  it('opens the default tooltip on cell hover without hoverable', () => {
    const { container } = renderWithProps(HeatmapChart, defaultProps)

    fireEvent.mouseEnter(container.querySelector('[data-heatmap-cell]')!)
    const tooltip = document.body.querySelector('[data-chart-tooltip]')
    expect(tooltip).toBeTruthy()
    expect(tooltip).toHaveAttribute('role', 'tooltip')
    expect(tooltip?.className).not.toContain('opacity-0')
    expect(tooltip?.textContent).toContain('A × One: 1')
  })

  it('fires cell click for the drawn cell without selectable', () => {
    const onCellClick = vi.fn()
    const columnMajor = [
      { x: 'A', y: 'One', value: 1 },
      { x: 'A', y: 'Two', value: 3 },
      { x: 'B', y: 'One', value: 2 },
      { x: 'B', y: 'Two', value: 4 }
    ]
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      data: columnMajor,
      onCellClick
    })
    fireEvent.click(container.querySelectorAll('[data-heatmap-cell]')[1])
    expect(onCellClick).toHaveBeenCalledWith(1, { x: 'B', y: 'One', value: 2 })
  })

  it('passes null for a missing cell', () => {
    const onCellClick = vi.fn()
    const { container } = renderWithProps(HeatmapChart, {
      ...defaultProps,
      data: [{ x: 'A', y: 'One', value: 1 }],
      onCellClick
    })
    fireEvent.click(container.querySelectorAll('[data-heatmap-cell]')[1])
    expect(onCellClick).toHaveBeenCalledWith(1, null)
  })

  it('uses zh-CN tooltip copy from ConfigProvider', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <HeatmapChart {...defaultProps} />
      </ConfigProvider>
    )
    fireEvent.mouseEnter(container.querySelector('[data-heatmap-cell]')!)
    expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('A × One：1')
  })
})
