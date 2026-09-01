import { describe, expect, it, vi } from 'vitest'
import {
  createBandScale,
  createLinearScale,
  createPointScale,
  flattenChartPoints,
  formatChartTemplate,
  getBarValueLabelY,
  getScatterPointPath,
  isNumericChartDomain,
  layoutAreaSeries,
  layoutBarRects,
  layoutLineSeries,
  layoutScatterPoints,
  nextChartPointRef,
  reverseSvgPath,
  scatterPointDisplayLabel,
  stackSeriesData
} from '@expcat/tigercat-core'

describe('layoutBarRects', () => {
  const xScale = createBandScale(['A', 'B'], [0, 100], { paddingInner: 0.2, paddingOuter: 0.1 })
  const yScale = createLinearScale([-10, 20], [100, 0])

  it('lays out positive and negative bars from the zero baseline', () => {
    const bars = layoutBarRects(
      [
        { x: 'A', y: 10 },
        { x: 'B', y: -10 }
      ],
      xScale,
      yScale,
      { palette: ['#111'], innerWidth: 100 }
    )

    expect(bars).toHaveLength(2)
    expect(bars[0].negative).toBe(false)
    expect(bars[0].y).toBeLessThan(yScale.map(0))
    expect(bars[1].negative).toBe(true)
    expect(bars[1].y).toBe(yScale.map(0))
    expect(bars[1].y + bars[1].height).toBeGreaterThan(yScale.map(0))
  })

  it('skips non-finite y and duplicate category x', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const bars = layoutBarRects(
      [
        { x: 'A', y: 10 },
        { x: 'A', y: 4 },
        { x: 'B', y: Number.NaN }
      ],
      xScale,
      yScale,
      { palette: ['#111'], innerWidth: 100 }
    )

    expect(bars).toHaveLength(1)
    expect(bars[0].datum.y).toBe(10)
    warn.mockRestore()
  })

  it('clamps barMaxWidth and applies barMinHeight', () => {
    const bars = layoutBarRects([{ x: 'A', y: 0.1 }], xScale, yScale, {
      palette: ['#111'],
      innerWidth: 100,
      barMaxWidth: 8,
      barMinHeight: 6
    })

    expect(bars[0].width).toBeLessThanOrEqual(8)
    expect(bars[0].height).toBeGreaterThanOrEqual(6)
  })

  it('skips exact-zero bars when min height is off', () => {
    const bars = layoutBarRects([{ x: 'A', y: 0 }], xScale, yScale, {
      palette: ['#111'],
      innerWidth: 100
    })
    expect(bars).toHaveLength(0)
  })
})

describe('getBarValueLabelY', () => {
  it('places a negative top label below the bar', () => {
    expect(getBarValueLabelY(50, 20, 'top', 8, { negative: true })).toBe(78)
  })
})

describe('layoutLineSeries', () => {
  it('uses yScale.map(0) as the area baseline, not the plot bottom', () => {
    const xScale = createPointScale(['A', 'B'], [0, 100], { padding: 0 })
    const yScale = createLinearScale([30, 40], [80, 0])
    const [series] = layoutLineSeries(
      [
        {
          data: [
            { x: 'A', y: 30 },
            { x: 'B', y: 40 }
          ]
        }
      ],
      xScale,
      yScale,
      {
        curve: 'linear',
        palette: ['#111'],
        activeIndex: null,
        showArea: true,
        areaOpacity: 0.2,
        strokeWidth: 2,
        showPoints: true,
        pointSize: 4,
        pointHollow: false
      }
    )

    const baseline = yScale.map(0)
    expect(series.areaPath).toContain(`L ${series.points[1].x} ${baseline}`)
    expect(series.areaPath).not.toContain(' L 100 80')
  })

  it('sorts numeric x before connecting the line', () => {
    const xScale = createLinearScale([1, 3], [0, 100])
    const yScale = createLinearScale([0, 10], [50, 0])
    const [series] = layoutLineSeries(
      [
        {
          data: [
            { x: 3, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 3 }
          ]
        }
      ],
      xScale,
      yScale,
      {
        curve: 'linear',
        palette: ['#111'],
        activeIndex: null,
        showArea: false,
        areaOpacity: 0.2,
        strokeWidth: 2,
        showPoints: true,
        pointSize: 4,
        pointHollow: false
      }
    )

    expect(series.points.map((point) => point.datum.x)).toEqual([1, 2, 3])
  })
})

describe('layoutAreaSeries', () => {
  it('reuses the previous top path as the next bottom seam for monotone stacks', () => {
    const xScale = createPointScale(['A', 'B', 'C'], [0, 100], { padding: 0 })
    const yScale = createLinearScale([0, 20], [100, 0])
    const series = [
      {
        data: [
          { x: 'A', y: 4 },
          { x: 'B', y: 8 },
          { x: 'C', y: 3 }
        ]
      },
      {
        data: [
          { x: 'A', y: 2 },
          { x: 'B', y: 5 },
          { x: 'C', y: 6 }
        ]
      }
    ]
    const stacked = stackSeriesData(series.map((item) => item.data))
    const laidOut = layoutAreaSeries(series, xScale, yScale, {
      curve: 'monotone',
      palette: ['#111', '#222'],
      activeIndex: null,
      showArea: true,
      areaOpacity: 0.2,
      strokeWidth: 2,
      showPoints: false,
      pointSize: 4,
      pointHollow: false,
      stacked: true,
      fillOpacity: 0.2,
      stackedData: stacked
    })

    const reversedLowerTop = reverseSvgPath(laidOut[0].linePath).replace(/^M/, 'L')
    expect(laidOut[1].areaPath).toContain(reversedLowerTop)
  })
})

describe('stackSeriesData', () => {
  it('aligns missing x to zero and stacks negatives separately', () => {
    const stacked = stackSeriesData([
      [
        { x: 'Jan', y: 2 },
        { x: 'Feb', y: 4 }
      ],
      [
        { x: 'Jan', y: 3 },
        { x: 'Mar', y: -1 }
      ]
    ])

    expect(stacked[0].map((item) => item.original.x)).toEqual(['Jan', 'Feb', 'Mar'])
    expect(stacked[1][0]).toEqual({ original: { x: 'Jan', y: 3 }, y0: 2, y1: 5 })
    expect(stacked[1][2]).toEqual({ original: { x: 'Mar', y: -1 }, y0: 0, y1: -1 })
  })
})

describe('layoutScatterPoints', () => {
  const xScale = createLinearScale([0, 10], [0, 100])
  const yScale = createLinearScale([0, 10], [100, 0])

  it('skips non-finite coordinates and maps sizeScale to a clamped radius', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const points = layoutScatterPoints(
      [
        { x: 1, y: 2, size: 10, color: '#123' },
        { x: Number.NaN, y: 2 },
        { x: 4, y: 5, size: 1000 }
      ],
      xScale,
      yScale,
      {
        pointSize: 6,
        pointStyle: 'circle',
        palette: ['#000'],
        activeIndex: null,
        hoveredIndex: null,
        sizeScale: { minRadius: 4, maxRadius: 12 }
      }
    )

    expect(points).toHaveLength(2)
    expect(points[0].r).toBe(4)
    expect(points[1].r).toBe(12)
    expect(points[0].color).toBe('#123')
    warn.mockRestore()
  })

  it('keeps item.color when gradient ids are per-point', () => {
    const points = layoutScatterPoints([{ x: 1, y: 2, color: '#abc' }], xScale, yScale, {
      pointSize: 6,
      pointStyle: 'diamond',
      palette: ['#000'],
      activeIndex: null,
      hoveredIndex: null,
      gradient: true,
      gradientPrefix: 'tiger-scatter-grad-1'
    })

    expect(points[0].fill).toBe('url(#tiger-scatter-grad-1-0)')
    expect(points[0].color).toBe('#abc')
    expect(points[0].d).toBe(getScatterPointPath('diamond', 6))
  })
})

describe('formatChartTemplate', () => {
  it('substitutes named placeholders', () => {
    expect(formatChartTemplate('Point {index}: ({x}, {y})', { index: 1, x: 2, y: 3 })).toBe(
      'Point 1: (2, 3)'
    )
  })
})

describe('chart point roving', () => {
  it('keeps one tab stop across series and moves with arrows', () => {
    const flat = flattenChartPoints([
      {
        seriesIndex: 0,
        points: [{ pointIndex: 0 }, { pointIndex: 1 }]
      },
      {
        seriesIndex: 1,
        points: [{ pointIndex: 0 }]
      }
    ])
    expect(isNumericChartDomain([])).toBe(false)
    expect(nextChartPointRef({ seriesIndex: 0, pointIndex: 1 }, 'ArrowRight', flat)).toEqual({
      seriesIndex: 1,
      pointIndex: 0
    })
  })
})

describe('scatterPointDisplayLabel', () => {
  it('uses the locale template when the datum has no label', () => {
    expect(scatterPointDisplayLabel({ x: 10, y: 20 }, 0, 'Point {index}: ({x}, {y})')).toBe(
      'Point 1: (10, 20)'
    )
    expect(
      scatterPointDisplayLabel({ x: 10, y: 20, label: 'East' }, 0, 'Point {index}: ({x}, {y})')
    ).toBe('East')
  })
})
