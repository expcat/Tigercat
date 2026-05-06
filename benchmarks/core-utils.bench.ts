import { bench, describe } from 'vitest'
import {
  classNames,
  createLinearScale,
  createBandScale,
  normalizeChartPadding,
  getChartInnerRect,
  getChartAxisTicks,
  getPieArcs,
  polarToCartesian,
  createPieArcPath,
  getNumberExtent,
  getRadarAngles,
  getRadarPoints,
  createLinePath,
  createAreaPath,
  createPolygonPath,
  getFixedVirtualRange,
  computeTreeMapNodes,
  computeSunburstArcs,
  createGaugeArcPath,
  createGaugeNeedlePath,
  valueToGaugeAngle,
  computeGaugeTicks,
  createChartInteractionHandlers,
  createChartPointerMoveScheduler,
  getActiveIndex,
  getChartElementOpacity,
  getChartAnimationStyle,
  getChartEntranceTransform,
  defaultTooltipFormatter,
  type TreeMapChartDatum,
  type SunburstChartDatum,
  type ChartInteractionState
} from '@expcat/tigercat-core'

describe('classNames', () => {
  bench('simple strings', () => {
    classNames('foo', 'bar', 'baz')
  })

  bench('mixed types (string, boolean, undefined, object)', () => {
    const flag = true
    const off = false
    classNames('base-class', flag && 'conditional', off && 'skipped', undefined, null, {
      active: true,
      disabled: false,
      hover: true
    })
  })

  bench('large input (20 args)', () => {
    const flag = true
    const off = false
    classNames(
      'c1',
      'c2',
      'c3',
      'c4',
      'c5',
      flag && 'c6',
      off && 'c7',
      { c8: true, c9: false, c10: true },
      'c11',
      'c12',
      'c13',
      'c14',
      'c15',
      undefined,
      null,
      { c16: true, c17: true, c18: false },
      'c19',
      'c20'
    )
  })
})

describe('Chart Scales', () => {
  bench('createLinearScale', () => {
    createLinearScale([0, 1000], [0, 600])
  })

  bench('createBandScale (50 categories)', () => {
    const domain = Array.from({ length: 50 }, (_, i) => `cat-${i}`)
    createBandScale(domain, [0, 800], { padding: 0.2 })
  })

  bench('createLinearScale + map 1000 values', () => {
    const scale = createLinearScale([0, 1000], [0, 600])
    for (let i = 0; i < 1000; i++) {
      scale(i)
    }
  })
})

describe('Chart Utilities', () => {
  const numericSeries = Array.from(
    { length: 5000 },
    (_, i) => Math.sin(i / 12) * 500 + Math.cos(i / 27) * 120 + i * 0.05
  )

  bench('normalizeChartPadding', () => {
    normalizeChartPadding({ top: 20, right: 30, bottom: 40, left: 50 })
  })

  bench('getChartInnerRect', () => {
    getChartInnerRect(800, 600, { top: 20, right: 30, bottom: 40, left: 50 })
  })

  bench('getNumberExtent (1000 values)', () => {
    const values = Array.from({ length: 1000 }, () => Math.random() * 1000)
    getNumberExtent(values, { includeZero: true, padding: 0.1 })
  })

  bench('getNumberExtent (5000 deterministic values)', () => {
    getNumberExtent(numericSeries, { includeZero: true, padding: 0.08 })
  })

  bench('getChartAxisTicks (linear scale, 12 ticks)', () => {
    const scale = createLinearScale([-1200, 4200], [0, 960])
    getChartAxisTicks(scale, { tickCount: 12 })
  })
})

describe('Pie Chart', () => {
  const data = Array.from({ length: 8 }, (_, i) => ({ value: (i + 1) * 100, label: `Slice ${i}` }))
  const largeData = Array.from({ length: 128 }, (_, i) => ({
    value: (i % 9) + 1,
    label: `Large slice ${i}`
  }))

  bench('getPieArcs (8 slices)', () => {
    getPieArcs(data)
  })

  bench('getPieArcs (128 slices, cached geometry)', () => {
    getPieArcs(largeData, { padAngle: 0.002 })
  })

  bench('polarToCartesian', () => {
    polarToCartesian(200, 200, 150, Math.PI / 4)
  })

  bench('createPieArcPath', () => {
    createPieArcPath({
      cx: 200,
      cy: 200,
      innerRadius: 0,
      outerRadius: 150,
      startAngle: 0,
      endAngle: Math.PI / 2
    })
  })

  bench('getRadarAngles (12 axes)', () => {
    getRadarAngles(12)
  })
})

describe('Chart Paths', () => {
  const wavePoints = Array.from({ length: 240 }, (_, i) => ({
    x: i * 4,
    y: 220 + Math.sin(i / 8) * 90 + Math.cos(i / 17) * 32
  }))
  const radarData = Array.from({ length: 24 }, (_, i) => ({
    value: 20 + ((i * 17) % 80),
    label: `Axis ${i}`
  }))

  bench('createLinePath (240 points, monotone)', () => {
    createLinePath(wavePoints, 'monotone')
  })

  bench('createAreaPath (240 points, natural)', () => {
    createAreaPath(wavePoints, 360, 'natural')
  })

  bench('radar points + polygon path (24 axes)', () => {
    const points = getRadarPoints(radarData, {
      cx: 240,
      cy: 240,
      radius: 180,
      maxValue: 100
    })
    createPolygonPath(points)
  })
})

describe('Virtual List', () => {
  const scrollPositions = Array.from({ length: 500 }, (_, i) => i * 37)

  bench('getFixedVirtualRange (single scroll window)', () => {
    getFixedVirtualRange(12_345, 640, 36, 100_000, 5)
  })

  bench('getFixedVirtualRange (500 sequential scroll windows)', () => {
    for (const scrollTop of scrollPositions) {
      getFixedVirtualRange(scrollTop, 720, 40, 250_000, 8)
    }
  })
})

// --- Helpers for generating hierarchical data ---

function generateTreeMapData(count: number, depth: number = 1): TreeMapChartDatum[] {
  if (depth <= 0 || count <= 0) return []
  const perGroup = Math.max(1, Math.ceil(count / 10))
  const items: TreeMapChartDatum[] = []
  let remaining = count
  let groupIdx = 0
  while (remaining > 0 && groupIdx < 10) {
    const childCount = Math.min(perGroup, remaining)
    if (depth > 1) {
      items.push({
        label: `G${groupIdx}`,
        value: 0,
        children: generateTreeMapData(childCount, depth - 1)
      })
    } else {
      for (let i = 0; i < childCount; i++) {
        items.push({ label: `L${groupIdx}-${i}`, value: Math.floor(Math.random() * 1000) + 1 })
      }
    }
    remaining -= childCount
    groupIdx++
  }
  return items
}

function generateSunburstData(count: number, depth: number = 2): SunburstChartDatum[] {
  if (depth <= 0 || count <= 0) return []
  const groups = Math.min(count, 8)
  const perGroup = Math.max(1, Math.ceil(count / groups))
  const items: SunburstChartDatum[] = []
  let remaining = count
  for (let g = 0; g < groups && remaining > 0; g++) {
    const childCount = Math.min(perGroup, remaining)
    if (depth > 1) {
      items.push({
        label: `Ring${g}`,
        value: 0,
        children: generateSunburstData(childCount, depth - 1)
      })
    } else {
      items.push({ label: `Leaf${g}`, value: Math.floor(Math.random() * 500) + 1 })
    }
    remaining -= childCount
  }
  return items
}

describe('TreeMap Layout', () => {
  const small = generateTreeMapData(50)
  const medium = generateTreeMapData(500, 2)
  const large = generateTreeMapData(2000, 3)

  bench('computeTreeMapNodes (50 leaves, flat)', () => {
    computeTreeMapNodes(small, { width: 800, height: 600 })
  })

  bench('computeTreeMapNodes (500 leaves, 2-level)', () => {
    computeTreeMapNodes(medium, { width: 800, height: 600 })
  })

  bench('computeTreeMapNodes (2000 leaves, 3-level)', () => {
    computeTreeMapNodes(large, { width: 1200, height: 900 })
  })

  bench('computeTreeMapNodes (2000 leaves, memo hit)', () => {
    // Same reference → should return cached result
    computeTreeMapNodes(large, { width: 1200, height: 900 })
  })

  bench('computeTreeMapNodes (2000 leaves, new allocation)', () => {
    // Fresh data each iteration to bypass memo
    const fresh = generateTreeMapData(2000, 3)
    computeTreeMapNodes(fresh, { width: 1200, height: 900 })
  })
})

describe('Sunburst Layout', () => {
  const small = generateSunburstData(30, 2)
  const medium = generateSunburstData(200, 3)
  const large = generateSunburstData(1000, 4)

  bench('computeSunburstArcs (30 nodes, 2-level)', () => {
    computeSunburstArcs(small, { cx: 200, cy: 200, innerRadius: 40, outerRadius: 180 })
  })

  bench('computeSunburstArcs (200 nodes, 3-level)', () => {
    computeSunburstArcs(medium, { cx: 300, cy: 300, innerRadius: 50, outerRadius: 250 })
  })

  bench('computeSunburstArcs (1000 nodes, 4-level)', () => {
    computeSunburstArcs(large, { cx: 400, cy: 400, innerRadius: 60, outerRadius: 350 })
  })

  bench('computeSunburstArcs (1000 nodes, memo hit)', () => {
    computeSunburstArcs(large, { cx: 400, cy: 400, innerRadius: 60, outerRadius: 350 })
  })

  bench('computeSunburstArcs (1000 nodes, new allocation)', () => {
    const fresh = generateSunburstData(1000, 4)
    computeSunburstArcs(fresh, { cx: 400, cy: 400, innerRadius: 60, outerRadius: 350 })
  })
})

// ==========================================================================
// Gauge Chart Computation
// ==========================================================================

describe('Gauge Chart', () => {
  bench('createGaugeArcPath (track arc, 270°)', () => {
    createGaugeArcPath(140, 100, 80, 135, 405, 20)
  })

  bench('createGaugeArcPath (value arc, 180°)', () => {
    createGaugeArcPath(140, 100, 80, 135, 315, 20)
  })

  bench('createGaugeNeedlePath', () => {
    createGaugeNeedlePath(140, 100, 54, 270, 4)
  })

  bench('valueToGaugeAngle (single value)', () => {
    valueToGaugeAngle(72, 0, 100, 135, 405)
  })

  bench('valueToGaugeAngle (500 values sweep)', () => {
    for (let i = 0; i < 500; i++) {
      valueToGaugeAngle(i * 0.2, 0, 100, 135, 405)
    }
  })

  bench('computeGaugeTicks (5 ticks)', () => {
    computeGaugeTicks(140, 100, 80, 0, 100, 135, 405, 5)
  })

  bench('computeGaugeTicks (10 ticks)', () => {
    computeGaugeTicks(140, 100, 80, 0, 100, 135, 405, 10)
  })

  bench('computeGaugeTicks (20 ticks, high precision)', () => {
    computeGaugeTicks(200, 150, 120, -50, 250, 135, 405, 20)
  })

  bench('full gauge render prep (arc + needle + 5 ticks)', () => {
    const cx = 140
    const cy = 100
    const r = 80
    const aw = 20
    const startAngle = 135
    const endAngle = 405
    const value = 72
    const min = 0
    const max = 100

    const angle = valueToGaugeAngle(value, min, max, startAngle, endAngle)
    createGaugeArcPath(cx, cy, r, startAngle, endAngle, aw)
    createGaugeArcPath(cx, cy, r, startAngle, angle, aw)
    createGaugeNeedlePath(cx, cy, r - aw - 6, angle, 4)
    computeGaugeTicks(cx, cy, r, min, max, startAngle, endAngle, 5)
  })

  bench('full gauge render prep with 3 segments', () => {
    const cx = 160
    const cy = 110
    const r = 90
    const aw = 20
    const startAngle = 135
    const endAngle = 405
    const min = 0
    const max = 100
    const segments = [
      { range: [0, 40] as [number, number], color: '#ef4444' },
      { range: [40, 70] as [number, number], color: '#f59e0b' },
      { range: [70, 100] as [number, number], color: '#10b981' }
    ]

    createGaugeArcPath(cx, cy, r, startAngle, endAngle, aw)
    for (const seg of segments) {
      const sStart = valueToGaugeAngle(seg.range[0], min, max, startAngle, endAngle)
      const sEnd = valueToGaugeAngle(seg.range[1], min, max, startAngle, endAngle)
      createGaugeArcPath(cx, cy, r, sStart, sEnd, aw)
    }
    const angle = valueToGaugeAngle(72, min, max, startAngle, endAngle)
    createGaugeNeedlePath(cx, cy, r - aw - 6, angle, 4)
    computeGaugeTicks(cx, cy, r, min, max, startAngle, endAngle, 5)
  })
})

// ==========================================================================
// Chart Interaction Hot Paths
// ==========================================================================

describe('Chart Interaction', () => {
  const data = Array.from({ length: 50 }, (_, i) => ({ label: `Item ${i}`, value: i * 10 }))

  bench('createChartInteractionHandlers (setup)', () => {
    const state: ChartInteractionState = { hoveredIndex: null, selectedIndex: null }
    createChartInteractionHandlers(data, state, {
      hoverable: true,
      selectable: true
    })
  })

  bench('interaction handler: 100 sequential hover enter/leave', () => {
    const state: ChartInteractionState = { hoveredIndex: null, selectedIndex: null }
    const handlers = createChartInteractionHandlers(data, state, {
      hoverable: true,
      selectable: true,
      onHoverChange: () => {},
      onSelectChange: () => {}
    })
    for (let i = 0; i < 100; i++) {
      handlers.onMouseEnter(i % 50, data[i % 50])
      handlers.onMouseLeave()
    }
  })

  bench('interaction handler: 100 sequential click toggles', () => {
    const state: ChartInteractionState = { hoveredIndex: null, selectedIndex: null }
    const handlers = createChartInteractionHandlers(data, state, {
      hoverable: true,
      selectable: true,
      onSelectChange: () => {}
    })
    for (let i = 0; i < 100; i++) {
      handlers.onClick(i % 50, data[i % 50])
    }
  })

  bench('getActiveIndex (all 4 sources)', () => {
    getActiveIndex(1, 2, 3, 4)
  })

  bench('getActiveIndex (500 lookups, mixed scenarios)', () => {
    for (let i = 0; i < 500; i++) {
      const mod = i % 4
      if (mod === 0) getActiveIndex(i, null, null, null)
      else if (mod === 1) getActiveIndex(null, i, null, null)
      else if (mod === 2) getActiveIndex(null, null, i, null)
      else getActiveIndex(null, null, null, i)
    }
  })

  bench('getChartElementOpacity (single)', () => {
    getChartElementOpacity(3, 5, { activeOpacity: 1, inactiveOpacity: 0.25 })
  })

  bench('getChartElementOpacity (50 elements batch)', () => {
    for (let i = 0; i < 50; i++) {
      getChartElementOpacity(i, 25, { activeOpacity: 1, inactiveOpacity: 0.25 })
    }
  })

  bench('getChartAnimationStyle (50 elements with stagger)', () => {
    const config = { animated: true, duration: 300, easing: 'ease-out' as const, stagger: 50 }
    for (let i = 0; i < 50; i++) {
      getChartAnimationStyle(config, i)
    }
  })

  bench('getChartEntranceTransform (scale, 100 frames)', () => {
    for (let i = 0; i <= 100; i++) {
      getChartEntranceTransform('scale', i / 100, { originX: 200, originY: 200 })
    }
  })

  bench('getChartEntranceTransform (slide-up, 100 frames)', () => {
    for (let i = 0; i <= 100; i++) {
      getChartEntranceTransform('slide-up', i / 100)
    }
  })

  bench('defaultTooltipFormatter (500 calls)', () => {
    for (let i = 0; i < 500; i++) {
      defaultTooltipFormatter(`Label ${i}`, i * 3.14, 'Series A', i)
    }
  })

  bench('createChartPointerMoveScheduler (setup + schedule + cancel)', () => {
    const scheduler = createChartPointerMoveScheduler({
      onPositionChange: () => {},
      requestFrame: () => 1,
      cancelFrame: () => {}
    })
    scheduler.schedule({ x: 100, y: 200 })
    scheduler.cancel()
  })
})
