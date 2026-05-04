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
  getFixedVirtualRange
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
