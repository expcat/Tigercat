import { bench, describe } from 'vitest'
import {
  classNames,
  createLinearScale,
  createBandScale,
  normalizeChartPadding,
  getChartInnerRect,
  getPieArcs,
  polarToCartesian,
  createPieArcPath,
  getNumberExtent,
  getRadarAngles
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
})

describe('Pie Chart', () => {
  const data = Array.from({ length: 8 }, (_, i) => ({ value: (i + 1) * 100, label: `Slice ${i}` }))

  bench('getPieArcs (8 slices)', () => {
    getPieArcs(data)
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
