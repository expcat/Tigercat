import { describe, it, expect } from 'vitest'
import { computeSunburstArcs } from '@expcat/tigercat-core'

const baseOpts = { cx: 100, cy: 100, innerRadius: 30, outerRadius: 90 }

describe('computeSunburstArcs', () => {
  it('returns empty array for empty data', () => {
    expect(computeSunburstArcs([], baseOpts)).toEqual([])
  })

  it('returns one arc for single leaf item', () => {
    const data = [{ label: 'A', value: 100 }]
    const arcs = computeSunburstArcs(data, baseOpts)
    expect(arcs).toHaveLength(1)
    expect(arcs[0].label).toBe('A')
    expect(arcs[0].depth).toBe(0)
  })

  it('returns correct number of arcs for flat data', () => {
    const data = [
      { label: 'A', value: 60 },
      { label: 'B', value: 40 }
    ]
    const arcs = computeSunburstArcs(data, baseOpts)
    expect(arcs).toHaveLength(2)
  })

  it('generates arcs for nested data (multi-ring)', () => {
    const data = [
      {
        label: 'A',
        value: 60,
        children: [
          { label: 'A1', value: 30 },
          { label: 'A2', value: 30 }
        ]
      },
      { label: 'B', value: 40 }
    ]
    const arcs = computeSunburstArcs(data, baseOpts)
    // A (depth 0) + A1 (depth 1) + A2 (depth 1) + B (depth 0) = 4
    expect(arcs).toHaveLength(4)
    expect(arcs.filter((a) => a.depth === 0)).toHaveLength(2)
    expect(arcs.filter((a) => a.depth === 1)).toHaveLength(2)
  })

  it('assigns sequential flat indices', () => {
    const data = [
      { label: 'A', value: 60, children: [{ label: 'A1', value: 60 }] },
      { label: 'B', value: 40 }
    ]
    const arcs = computeSunburstArcs(data, baseOpts)
    arcs.forEach((arc, i) => {
      expect(arc.index).toBe(i)
    })
  })

  it('all arcs have valid SVG path strings', () => {
    const data = [
      { label: 'A', value: 50 },
      { label: 'B', value: 50 }
    ]
    const arcs = computeSunburstArcs(data, baseOpts)
    for (const arc of arcs) {
      expect(arc.path).toContain('M')
      expect(arc.path).toContain('A')
    }
  })

  it('arcs span full 360 degrees', () => {
    const data = [
      { label: 'A', value: 50 },
      { label: 'B', value: 50 }
    ]
    const arcs = computeSunburstArcs(data, baseOpts)
    const totalSweep = arcs.reduce((s, a) => s + (a.endAngle - a.startAngle), 0)
    expect(totalSweep).toBeCloseTo(2 * Math.PI, 5)
  })

  it('uses custom colors', () => {
    const colors = ['#ff0000', '#00ff00']
    const data = [
      { label: 'A', value: 50 },
      { label: 'B', value: 50 }
    ]
    const arcs = computeSunburstArcs(data, { ...baseOpts, colors })
    expect(arcs[0].color).toBe('#ff0000')
    expect(arcs[1].color).toBe('#00ff00')
  })

  it('uses datum color over palette', () => {
    const data = [{ label: 'A', value: 100, color: '#abc' }]
    const arcs = computeSunburstArcs(data, baseOpts)
    expect(arcs[0].color).toBe('#abc')
  })

  it('midAngle is between startAngle and endAngle', () => {
    const data = [
      { label: 'A', value: 70 },
      { label: 'B', value: 30 }
    ]
    const arcs = computeSunburstArcs(data, baseOpts)
    for (const arc of arcs) {
      expect(arc.midAngle).toBeGreaterThanOrEqual(arc.startAngle)
      expect(arc.midAngle).toBeLessThanOrEqual(arc.endAngle)
    }
  })

  it('memoizes result for same inputs', () => {
    const data = [{ label: 'A', value: 100 }]
    const r1 = computeSunburstArcs(data, baseOpts)
    const r2 = computeSunburstArcs(data, baseOpts)
    expect(r1).toBe(r2) // same reference
  })

  it('recomputes when data changes', () => {
    const data1 = [{ label: 'A', value: 100 }]
    const data2 = [{ label: 'B', value: 50 }]
    const r1 = computeSunburstArcs(data1, baseOpts)
    const r2 = computeSunburstArcs(data2, baseOpts)
    expect(r1).not.toBe(r2)
    expect(r2[0].label).toBe('B')
  })

  it('handles all-zero leaf values gracefully', () => {
    const data = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 }
    ]
    // totalValue = 0, layout should not crash
    const arcs = computeSunburstArcs(data, baseOpts)
    expect(Array.isArray(arcs)).toBe(true)
  })
})
