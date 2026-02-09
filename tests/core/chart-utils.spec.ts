import { describe, it, expect } from 'vitest'
import {
  normalizeChartPadding,
  getChartInnerRect,
  createLinearScale,
  createPointScale,
  createBandScale,
  getChartAxisTicks,
  getChartGridLineDasharray,
  getNumberExtent,
  getPieArcs,
  polarToCartesian,
  createPieArcPath,
  getRadarAngles,
  getRadarPoints,
  createPolygonPath,
  createLinePath,
  createAreaPath,
  stackSeriesData,
  DEFAULT_CHART_COLORS,
  clampBarWidth,
  ensureBarMinHeight,
  getBarValueLabelY,
  getBarGradientPrefix,
  computePieHoverOffset,
  computePieLabelLine,
  PIE_EMPHASIS_SHADOW,
  PIE_BASE_SHADOW
} from '@expcat/tigercat-core'

describe('chart-utils', () => {
  // ==========================================================================
  // Padding & Layout
  // ==========================================================================

  describe('normalizeChartPadding', () => {
    it('returns zero padding when undefined', () => {
      const result = normalizeChartPadding(undefined)
      expect(result).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    })

    it('expands number to all sides', () => {
      const result = normalizeChartPadding(10)
      expect(result).toEqual({ top: 10, right: 10, bottom: 10, left: 10 })
    })

    it('handles partial object with defaults', () => {
      const result = normalizeChartPadding({ top: 5, left: 10 })
      expect(result).toEqual({ top: 5, right: 0, bottom: 0, left: 10 })
    })

    it('handles full object', () => {
      const result = normalizeChartPadding({ top: 1, right: 2, bottom: 3, left: 4 })
      expect(result).toEqual({ top: 1, right: 2, bottom: 3, left: 4 })
    })
  })

  describe('getChartInnerRect', () => {
    it('calculates inner rect with number padding', () => {
      const result = getChartInnerRect(100, 80, 10)
      expect(result).toEqual({ x: 10, y: 10, width: 80, height: 60 })
    })

    it('calculates inner rect with object padding', () => {
      const result = getChartInnerRect(200, 150, { top: 20, right: 30, bottom: 40, left: 10 })
      expect(result).toEqual({ x: 10, y: 20, width: 160, height: 90 })
    })

    it('returns zero dimensions when padding exceeds size', () => {
      const result = getChartInnerRect(50, 50, 30)
      expect(result.width).toBe(0)
      expect(result.height).toBe(0)
    })
  })

  // ==========================================================================
  // Scales
  // ==========================================================================

  describe('createLinearScale', () => {
    it('maps values linearly', () => {
      const scale = createLinearScale([0, 100], [0, 200])
      expect(scale.map(0)).toBe(0)
      expect(scale.map(50)).toBe(100)
      expect(scale.map(100)).toBe(200)
    })

    it('handles inverted range', () => {
      const scale = createLinearScale([0, 100], [200, 0])
      expect(scale.map(0)).toBe(200)
      expect(scale.map(100)).toBe(0)
    })

    it('handles zero span domain', () => {
      const scale = createLinearScale([50, 50], [0, 100])
      expect(scale.map(50)).toBe(50) // midpoint
    })

    it('converts string values to numbers', () => {
      const scale = createLinearScale([0, 100], [0, 200])
      expect(scale.map('25')).toBe(50)
    })

    it('has correct type and domain/range', () => {
      const scale = createLinearScale([10, 20], [100, 200])
      expect(scale.type).toBe('linear')
      expect(scale.domain).toEqual([10, 20])
      expect(scale.range).toEqual([100, 200])
    })
  })

  describe('createPointScale', () => {
    it('maps categorical values to evenly spaced points', () => {
      const scale = createPointScale(['a', 'b', 'c'], [0, 100], { padding: 0 })
      expect(scale.map('a')).toBe(0)
      expect(scale.map('b')).toBe(50)
      expect(scale.map('c')).toBe(100)
    })

    it('applies padding to offset from edges', () => {
      const scale = createPointScale(['a', 'b'], [0, 100], { padding: 0.5 })
      // With padding, points are inset from edges
      expect(scale.map('a')).toBeGreaterThan(0)
      expect(scale.map('b')).toBeLessThan(100)
    })

    it('centers single value', () => {
      const scale = createPointScale(['only'], [0, 100])
      expect(scale.map('only')).toBe(50)
    })

    it('returns first position for unknown value', () => {
      const scale = createPointScale(['a', 'b'], [0, 100], { padding: 0 })
      expect(scale.map('unknown')).toBe(scale.map('a'))
    })

    it('has correct type and step', () => {
      const scale = createPointScale(['a', 'b', 'c'], [0, 100], { padding: 0 })
      expect(scale.type).toBe('point')
      expect(scale.step).toBe(50)
    })
  })

  describe('createBandScale', () => {
    it('maps categorical values with bandwidth', () => {
      const scale = createBandScale(['a', 'b'], [0, 100], { paddingInner: 0, paddingOuter: 0 })
      expect(scale.bandwidth).toBeGreaterThan(0)
      expect(scale.map('a')).toBeLessThan(scale.map('b'))
    })

    it('respects inner padding', () => {
      const scaleNoPad = createBandScale(['a', 'b'], [0, 100], { paddingInner: 0, paddingOuter: 0 })
      const scaleWithPad = createBandScale(['a', 'b'], [0, 100], {
        paddingInner: 0.5,
        paddingOuter: 0
      })
      expect(scaleWithPad.bandwidth).toBeLessThan(scaleNoPad.bandwidth!)
    })

    it('has correct type', () => {
      const scale = createBandScale(['x', 'y'], [0, 200])
      expect(scale.type).toBe('band')
    })
  })

  // ==========================================================================
  // Axis & Grid
  // ==========================================================================

  describe('getChartAxisTicks', () => {
    it('generates linear ticks', () => {
      const scale = createLinearScale([0, 100], [0, 200])
      const ticks = getChartAxisTicks(scale, { tickCount: 5 })
      expect(ticks.length).toBeGreaterThan(0)
      expect(ticks[0]).toHaveProperty('value')
      expect(ticks[0]).toHaveProperty('position')
      expect(ticks[0]).toHaveProperty('label')
    })

    it('uses provided tickValues', () => {
      const scale = createLinearScale([0, 100], [0, 200])
      const ticks = getChartAxisTicks(scale, { tickValues: [0, 50, 100] })
      expect(ticks.map((t) => t.value)).toEqual([0, 50, 100])
    })

    it('applies tickFormat', () => {
      const scale = createLinearScale([0, 100], [0, 200])
      const ticks = getChartAxisTicks(scale, {
        tickValues: [25],
        tickFormat: (v) => `$${v}`
      })
      expect(ticks[0].label).toBe('$25')
    })

    it('generates ticks for point scale from domain', () => {
      const scale = createPointScale(['Jan', 'Feb', 'Mar'], [0, 100])
      const ticks = getChartAxisTicks(scale)
      expect(ticks.map((t) => t.value)).toEqual(['Jan', 'Feb', 'Mar'])
    })

    it('positions band scale ticks at center of band', () => {
      const scale = createBandScale(['a', 'b'], [0, 100], { paddingInner: 0, paddingOuter: 0 })
      const ticks = getChartAxisTicks(scale)
      // Position should be base + bandwidth/2
      const bandwidth = scale.bandwidth!
      expect(ticks[0].position).toBe(scale.map('a') + bandwidth / 2)
    })
  })

  describe('getChartGridLineDasharray', () => {
    it('returns undefined for solid', () => {
      expect(getChartGridLineDasharray('solid')).toBeUndefined()
    })

    it('returns dash pattern for dashed', () => {
      expect(getChartGridLineDasharray('dashed')).toBe('4 4')
    })

    it('returns dot pattern for dotted', () => {
      expect(getChartGridLineDasharray('dotted')).toBe('1 4')
    })
  })

  // ==========================================================================
  // Data Extent
  // ==========================================================================

  describe('getNumberExtent', () => {
    it('returns min and max from values', () => {
      expect(getNumberExtent([1, 5, 3, 9, 2])).toEqual([1, 9])
    })

    it('returns fallback for empty array', () => {
      expect(getNumberExtent([])).toEqual([0, 1])
      expect(getNumberExtent([], { fallback: [10, 20] })).toEqual([10, 20])
    })

    it('includes zero when requested', () => {
      expect(getNumberExtent([5, 10], { includeZero: true })).toEqual([0, 10])
      expect(getNumberExtent([-10, -5], { includeZero: true })).toEqual([-10, 0])
    })

    it('handles single value by adding padding', () => {
      const [min, max] = getNumberExtent([50])
      expect(min).toBeLessThan(50)
      expect(max).toBeGreaterThan(50)
    })

    it('applies padding to extend range', () => {
      const [min, max] = getNumberExtent([0, 100], { padding: 0.1 })
      expect(min).toBeLessThan(0)
      expect(max).toBeGreaterThan(100)
    })
  })

  // ==========================================================================
  // Pie/Donut
  // ==========================================================================

  describe('getPieArcs', () => {
    it('divides circle proportionally by value', () => {
      const data = [{ value: 1 }, { value: 1 }, { value: 2 }]
      const arcs = getPieArcs(data)

      expect(arcs.length).toBe(3)
      // First two should have equal angles (1/4 each), third should have half (2/4)
      const arc0Angle = arcs[0].endAngle - arcs[0].startAngle
      const arc1Angle = arcs[1].endAngle - arcs[1].startAngle
      const arc2Angle = arcs[2].endAngle - arcs[2].startAngle

      expect(arc0Angle).toBeCloseTo(arc1Angle, 5)
      expect(arc2Angle).toBeCloseTo(arc0Angle * 2, 5)
    })

    it('respects custom start and end angles', () => {
      const data = [{ value: 1 }]
      const arcs = getPieArcs(data, { startAngle: 0, endAngle: Math.PI })
      expect(arcs[0].startAngle).toBe(0)
      expect(arcs[0].endAngle).toBeCloseTo(Math.PI, 5)
    })

    it('applies pad angle between slices', () => {
      const data = [{ value: 1 }, { value: 1 }]
      const arcs = getPieArcs(data, { padAngle: 0.1 })
      expect(arcs[0].padAngle).toBe(0.1)
      // Gap between end of first and start of second
      expect(arcs[1].startAngle - arcs[0].endAngle).toBeCloseTo(0.1, 5)
    })

    it('returns empty array when total is zero', () => {
      expect(getPieArcs([{ value: 0 }, { value: 0 }])).toEqual([])
    })

    it('ignores negative values', () => {
      const arcs = getPieArcs([{ value: -5 }, { value: 10 }])
      expect(arcs[0].value).toBe(0)
      expect(arcs[1].value).toBe(10)
    })
  })

  describe('polarToCartesian', () => {
    it('converts polar to cartesian coordinates', () => {
      const { x, y } = polarToCartesian(0, 0, 10, 0)
      expect(x).toBeCloseTo(10, 5)
      expect(y).toBeCloseTo(0, 5)
    })

    it('handles 90 degree angle', () => {
      const { x, y } = polarToCartesian(0, 0, 10, Math.PI / 2)
      expect(x).toBeCloseTo(0, 5)
      expect(y).toBeCloseTo(10, 5)
    })

    it('handles center offset', () => {
      const { x, y } = polarToCartesian(50, 50, 10, 0)
      expect(x).toBeCloseTo(60, 5)
      expect(y).toBeCloseTo(50, 5)
    })
  })

  describe('createPieArcPath', () => {
    const baseOptions = { cx: 50, cy: 50, outerRadius: 40, startAngle: 0, endAngle: Math.PI / 2 }

    it('creates path starting from center for pie (no inner radius)', () => {
      const path = createPieArcPath(baseOptions)
      expect(path).toContain('M 50 50') // starts at center
      expect(path).toContain('A 40 40') // arc command
      expect(path).toContain('Z') // closed
    })

    it('creates donut path with inner radius', () => {
      const path = createPieArcPath({ ...baseOptions, innerRadius: 20 })
      expect(path).toContain('A 40 40') // outer arc
      expect(path).toContain('A 20 20') // inner arc
    })

    it('returns empty string for zero angle', () => {
      const path = createPieArcPath({ ...baseOptions, endAngle: 0 })
      expect(path).toBe('')
    })

    it('handles full circle', () => {
      const path = createPieArcPath({ ...baseOptions, endAngle: Math.PI * 2 })
      expect(path.length).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // Pie Hover & Label Helpers
  // ==========================================================================

  describe('computePieHoverOffset', () => {
    it('returns offset along bisector angle', () => {
      const { dx, dy } = computePieHoverOffset(0, Math.PI, 10)
      // Bisector = PI/2, cos(PI/2) ≈ 0, sin(PI/2) ≈ 1
      expect(dx).toBeCloseTo(0, 1)
      expect(dy).toBeCloseTo(10, 1)
    })

    it('returns zero offset when distance is 0', () => {
      const { dx, dy } = computePieHoverOffset(0, Math.PI, 0)
      expect(dx).toBe(0)
      expect(dy).toBe(0)
    })

    it('handles full circle arc', () => {
      const { dx, dy } = computePieHoverOffset(0, Math.PI * 2, 8)
      // Bisector = PI, cos(PI) ≈ -1, sin(PI) ≈ 0
      expect(dx).toBeCloseTo(-8, 1)
      expect(dy).toBeCloseTo(0, 1)
    })
  })

  describe('computePieLabelLine', () => {
    it('returns anchor, elbow, label positions and textAnchor', () => {
      const result = computePieLabelLine(50, 50, 40, 0, Math.PI / 2)
      expect(result.anchor).toBeDefined()
      expect(result.elbow).toBeDefined()
      expect(result.label).toBeDefined()
      expect(result.textAnchor).toBeDefined()
    })

    it('sets textAnchor to start for right-side labels', () => {
      // Arc from -PI/4 to PI/4 → bisector at 0 → cos(0) > 0 → right side
      const result = computePieLabelLine(50, 50, 40, -Math.PI / 4, Math.PI / 4)
      expect(result.textAnchor).toBe('start')
    })

    it('sets textAnchor to end for left-side labels', () => {
      // Arc around PI → bisector at ~PI → cos(PI) < 0 → left side
      const result = computePieLabelLine(50, 50, 40, Math.PI * 0.75, Math.PI * 1.25)
      expect(result.textAnchor).toBe('end')
    })

    it('places label further out than anchor', () => {
      const result = computePieLabelLine(50, 50, 40, 0, Math.PI / 2)
      const anchorDist = Math.sqrt((result.anchor.x - 50) ** 2 + (result.anchor.y - 50) ** 2)
      const labelDist = Math.sqrt((result.label.x - 50) ** 2 + (result.label.y - 50) ** 2)
      expect(labelDist).toBeGreaterThan(anchorDist)
    })
  })

  describe('PIE shadow constants', () => {
    it('exports shadow filter strings', () => {
      expect(PIE_EMPHASIS_SHADOW).toContain('drop-shadow')
      expect(PIE_BASE_SHADOW).toContain('drop-shadow')
    })
  })

  // ==========================================================================
  // Radar
  // ==========================================================================

  describe('getRadarAngles', () => {
    it('divides circle evenly', () => {
      const angles = getRadarAngles(4)
      expect(angles.length).toBe(4)
      // Each angle should be PI/2 apart
      for (let i = 1; i < angles.length; i++) {
        expect(angles[i] - angles[i - 1]).toBeCloseTo(Math.PI / 2, 5)
      }
    })

    it('starts at top (-PI/2) by default', () => {
      const angles = getRadarAngles(3)
      expect(angles[0]).toBe(-Math.PI / 2)
    })

    it('respects custom start angle', () => {
      const angles = getRadarAngles(3, 0)
      expect(angles[0]).toBe(0)
    })

    it('returns empty array for zero count', () => {
      expect(getRadarAngles(0)).toEqual([])
    })
  })

  describe('getRadarPoints', () => {
    const baseOptions = { cx: 50, cy: 50, radius: 40 }

    it('calculates point positions', () => {
      const data = [{ value: 20 }, { value: 40 }]
      const points = getRadarPoints(data, { ...baseOptions, maxValue: 40 })

      expect(points.length).toBe(2)
      expect(points[0].radius).toBe(20) // half of max
      expect(points[1].radius).toBe(40) // full
    })

    it('auto-calculates max value if not provided', () => {
      const data = [{ value: 10 }, { value: 30 }]
      const points = getRadarPoints(data, baseOptions)
      expect(points[1].radius).toBe(40) // scaled to full radius
    })

    it('returns empty array for empty data', () => {
      expect(getRadarPoints([], baseOptions)).toEqual([])
    })

    it('clamps negative values to zero', () => {
      const data = [{ value: -10 }, { value: 20 }]
      const points = getRadarPoints(data, { ...baseOptions, maxValue: 20 })
      expect(points[0].value).toBe(0)
    })
  })

  describe('createPolygonPath', () => {
    it('creates closed polygon path', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 }
      ]
      const path = createPolygonPath(points)
      expect(path).toBe('M 0 0 L 10 0 L 10 10 Z')
    })

    it('returns empty string for empty array', () => {
      expect(createPolygonPath([])).toBe('')
    })
  })

  // ==========================================================================
  // Line/Area
  // ==========================================================================

  describe('createLinePath', () => {
    const points = [
      { x: 0, y: 10 },
      { x: 10, y: 20 },
      { x: 20, y: 15 }
    ]

    it('creates linear path by default', () => {
      const path = createLinePath(points)
      expect(path).toBe('M 0 10 L 10 20 L 20 15')
    })

    it('handles single point', () => {
      const path = createLinePath([{ x: 5, y: 5 }])
      expect(path).toBe('M 5 5')
    })

    it('returns empty string for empty array', () => {
      expect(createLinePath([])).toBe('')
    })

    it('creates step path', () => {
      const path = createLinePath(points, 'step')
      expect(path).toContain('H') // horizontal commands
      expect(path).toContain('V') // vertical commands
    })

    it('creates stepBefore path', () => {
      const path = createLinePath(points, 'stepBefore')
      expect(path).toContain('V')
    })

    it('creates stepAfter path', () => {
      const path = createLinePath(points, 'stepAfter')
      expect(path).toContain('H')
    })

    it('creates monotone curve', () => {
      const path = createLinePath(points, 'monotone')
      expect(path).toContain('C') // cubic bezier
    })

    it('creates natural curve', () => {
      const path = createLinePath(points, 'natural')
      expect(path).toContain('C')
    })
  })

  describe('createAreaPath', () => {
    const points = [
      { x: 0, y: 10 },
      { x: 10, y: 5 }
    ]

    it('creates closed area with baseline', () => {
      const path = createAreaPath(points, 50)
      expect(path).toContain('M 0 10')
      expect(path).toContain('L 10 50') // to baseline
      expect(path).toContain('L 0 50') // along baseline
      expect(path).toContain('Z')
    })

    it('returns empty string for empty array', () => {
      expect(createAreaPath([], 0)).toBe('')
    })
  })

  describe('stackSeriesData', () => {
    it('stacks series data by x value', () => {
      const series1 = [
        { x: 'a', y: 10 },
        { x: 'b', y: 20 }
      ]
      const series2 = [
        { x: 'a', y: 5 },
        { x: 'b', y: 15 }
      ]

      const stacked = stackSeriesData([series1, series2])

      expect(stacked.length).toBe(2)
      // First series starts at 0
      expect(stacked[0][0].y0).toBe(0)
      expect(stacked[0][0].y1).toBe(10)
      // Second series stacks on top
      expect(stacked[1][0].y0).toBe(10)
      expect(stacked[1][0].y1).toBe(15)
    })

    it('returns empty array for empty input', () => {
      expect(stackSeriesData([])).toEqual([])
    })
  })

  // ==========================================================================
  // Constants
  // ==========================================================================

  describe('DEFAULT_CHART_COLORS', () => {
    it('has 6 colors', () => {
      expect(DEFAULT_CHART_COLORS.length).toBe(6)
    })

    it('uses CSS variables with fallbacks', () => {
      expect(DEFAULT_CHART_COLORS[0]).toMatch(/var\(--tiger-chart-\d+,#[0-9a-f]+\)/i)
    })
  })

  // ==========================================================================
  // Bar Chart Utilities
  // ==========================================================================

  describe('clampBarWidth', () => {
    it('returns original width when no maxWidth', () => {
      expect(clampBarWidth(50)).toBe(50)
      expect(clampBarWidth(50, undefined)).toBe(50)
    })

    it('clamps width to maxWidth', () => {
      expect(clampBarWidth(100, 50)).toBe(50)
    })

    it('returns original when under maxWidth', () => {
      expect(clampBarWidth(30, 50)).toBe(30)
    })

    it('ignores maxWidth <= 0', () => {
      expect(clampBarWidth(50, 0)).toBe(50)
      expect(clampBarWidth(50, -10)).toBe(50)
    })
  })

  describe('ensureBarMinHeight', () => {
    it('returns original values when height >= minHeight', () => {
      const result = ensureBarMinHeight(50, 20, 100, 4)
      expect(result).toEqual({ y: 50, height: 20 })
    })

    it('extends upward for positive bars below minHeight', () => {
      const result = ensureBarMinHeight(98, 2, 100, 6)
      expect(result).toEqual({ y: 94, height: 6 })
    })

    it('extends downward for negative bars below minHeight', () => {
      const result = ensureBarMinHeight(100, 2, 100, 6)
      expect(result).toEqual({ y: 100, height: 6 })
    })

    it('returns original when minHeight <= 0', () => {
      const result = ensureBarMinHeight(50, 2, 100, 0)
      expect(result).toEqual({ y: 50, height: 2 })
    })

    it('returns original for zero-height bars', () => {
      const result = ensureBarMinHeight(100, 0, 100, 4)
      expect(result).toEqual({ y: 100, height: 0 })
    })
  })

  describe('getBarValueLabelY', () => {
    it('positions label above bar for top position', () => {
      const y = getBarValueLabelY(30, 50, 'top', 8)
      expect(y).toBe(22) // barY - offset
    })

    it('positions label at center for inside position', () => {
      const y = getBarValueLabelY(30, 50, 'inside')
      expect(y).toBe(55) // barY + barHeight / 2
    })

    it('uses custom offset for top position', () => {
      const y = getBarValueLabelY(30, 50, 'top', 12)
      expect(y).toBe(18)
    })
  })

  describe('getBarGradientPrefix', () => {
    it('returns unique prefixes on successive calls', () => {
      const a = getBarGradientPrefix()
      const b = getBarGradientPrefix()
      expect(a).not.toBe(b)
      expect(a).toMatch(/^tiger-bar-grad-\d+$/)
    })
  })
})
