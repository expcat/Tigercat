import { describe, it, expect } from 'vitest'
import {
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
  resolveMultiSeriesTooltipContent,
  resolveSeriesData,
  defaultXYTooltipFormatter,
  defaultSeriesXYTooltipFormatter,
  defaultRadarTooltipFormatter,
  DEFAULT_CHART_COLORS
} from '@expcat/tigercat-core'

// ============================================================================
// resolveChartPalette
// ============================================================================

describe('resolveChartPalette', () => {
  it('returns provided colors when non-empty', () => {
    const colors = ['#f00', '#0f0']
    expect(resolveChartPalette(colors)).toBe(colors)
  })

  it('returns fallback color wrapped in array', () => {
    expect(resolveChartPalette(undefined, '#abc')).toEqual(['#abc'])
  })

  it('returns DEFAULT_CHART_COLORS copy when nothing provided', () => {
    const result = resolveChartPalette(undefined)
    expect(result).toEqual([...DEFAULT_CHART_COLORS])
    // Should be a copy, not the same reference
    expect(result).not.toBe(DEFAULT_CHART_COLORS)
  })

  it('ignores empty colors array', () => {
    expect(resolveChartPalette([])).toEqual([...DEFAULT_CHART_COLORS])
  })
})

// ============================================================================
// buildChartLegendItems
// ============================================================================

describe('buildChartLegendItems', () => {
  const palette = ['#r', '#g', '#b']

  it('builds items with label and color', () => {
    const items = buildChartLegendItems({
      data: [{ name: 'A' }, { name: 'B' }],
      palette,
      activeIndex: null,
      getLabel: (d) => d.name
    })

    expect(items).toHaveLength(2)
    expect(items[0]).toEqual({ index: 0, label: 'A', color: '#r', active: true })
    expect(items[1]).toEqual({ index: 1, label: 'B', color: '#g', active: true })
  })

  it('marks only activeIndex item as active', () => {
    const items = buildChartLegendItems({
      data: ['x', 'y', 'z'],
      palette,
      activeIndex: 1,
      getLabel: (d) => d
    })

    expect(items[0].active).toBe(false)
    expect(items[1].active).toBe(true)
    expect(items[2].active).toBe(false)
  })

  it('supports custom getColor', () => {
    const items = buildChartLegendItems({
      data: [{ color: '#custom' }],
      palette,
      activeIndex: null,
      getLabel: () => 'x',
      getColor: (d) => d.color
    })

    expect(items[0].color).toBe('#custom')
  })
})

// ============================================================================
// resolveChartTooltipContent
// ============================================================================

describe('resolveChartTooltipContent', () => {
  const data = [
    { label: 'A', y: 10 },
    { label: 'B', y: 20 }
  ]

  it('returns empty string when hoveredIndex is null', () => {
    expect(resolveChartTooltipContent(null, data, undefined, (d) => d.label!)).toBe('')
  })

  it('returns empty string for out-of-range index', () => {
    expect(resolveChartTooltipContent(99, data, undefined, (d) => d.label!)).toBe('')
  })

  it('uses default formatter', () => {
    expect(resolveChartTooltipContent(0, data, undefined, (d) => `${d.label}: ${d.y}`)).toBe(
      'A: 10'
    )
  })

  it('uses custom formatter over default', () => {
    const custom = (d: (typeof data)[0]) => `custom-${d.label}`
    expect(resolveChartTooltipContent(1, data, custom, () => 'default')).toBe('custom-B')
  })
})

// ============================================================================
// resolveMultiSeriesTooltipContent
// ============================================================================

describe('resolveMultiSeriesTooltipContent', () => {
  const series = [
    { name: 'S1', data: [{ x: 'a', y: 1 }] },
    { name: 'S2', data: [{ x: 'b', y: 2 }] }
  ]

  it('returns empty when hoveredPoint is null', () => {
    expect(resolveMultiSeriesTooltipContent(null, series, undefined, (d) => `${d.x}`)).toBe('')
  })

  it('returns formatted content for hovered point', () => {
    expect(
      resolveMultiSeriesTooltipContent(
        { seriesIndex: 1, pointIndex: 0 },
        series,
        undefined,
        (d, si, _pi, s) => `${s?.name}: ${d.y}`
      )
    ).toBe('S2: 2')
  })
})

// ============================================================================
// resolveSeriesData
// ============================================================================

describe('resolveSeriesData', () => {
  it('returns series when provided and non-empty', () => {
    const s = [{ data: [1, 2] }]
    expect(resolveSeriesData(s, [3, 4])).toBe(s)
  })

  it('wraps data into single series when series is undefined', () => {
    const result = resolveSeriesData(undefined, [1, 2, 3])
    expect(result).toHaveLength(1)
    expect(result[0].data).toEqual([1, 2, 3])
  })

  it('returns empty array when both are empty/undefined', () => {
    expect(resolveSeriesData(undefined, undefined)).toEqual([])
    expect(resolveSeriesData([], [])).toEqual([])
  })
})

// ============================================================================
// Default tooltip formatters
// ============================================================================

describe('defaultXYTooltipFormatter', () => {
  it('uses label when available', () => {
    expect(defaultXYTooltipFormatter({ x: 'A', y: 10, label: 'Custom' }, 0)).toBe('Custom: 10')
  })

  it('falls back to x as string', () => {
    expect(defaultXYTooltipFormatter({ x: 'Jan', y: 5 }, 0)).toBe('Jan: 5')
  })

  it('falls back to # index if no x', () => {
    expect(defaultXYTooltipFormatter({ y: 7 }, 2)).toBe('#3: 7')
  })
})

describe('defaultSeriesXYTooltipFormatter', () => {
  it('includes series name', () => {
    expect(defaultSeriesXYTooltipFormatter({ x: 'Q1', y: 100 }, 0, 0, { name: 'Revenue' })).toBe(
      'Revenue · Q1: 100'
    )
  })

  it('falls back to Series N', () => {
    expect(defaultSeriesXYTooltipFormatter({ x: 'Q1', y: 50 }, 2, 0)).toBe('Series 3 · Q1: 50')
  })
})

describe('defaultRadarTooltipFormatter', () => {
  it('formats with series name, label, and value', () => {
    expect(
      defaultRadarTooltipFormatter({ label: 'Speed', value: 80 }, 0, 0, { name: 'Team A' })
    ).toBe('Team A · Speed: 80')
  })
})
