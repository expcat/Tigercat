import { describe, it, expect, vi } from 'vitest'
import {
  computeSunburstArcs,
  getSunburstLabelPoint,
  layoutSunburst,
  nextSunburstArcIndex
} from '@expcat/tigercat-core'

const baseOpts = { cx: 100, cy: 100, innerRadius: 30, outerRadius: 90 }

describe('layoutSunburst', () => {
  it('returns empty array for empty data', () => {
    expect(layoutSunburst([], baseOpts)).toEqual([])
  })

  it('returns one arc for single leaf item', () => {
    const data = [{ label: 'A', value: 100 }]
    const arcs = layoutSunburst(data, baseOpts)
    expect(arcs).toHaveLength(1)
    expect(arcs[0].label).toBe('A')
    expect(arcs[0].depth).toBe(0)
    expect(arcs[0].datum).toEqual(data[0])
  })

  it('assigns sequential flat indices', () => {
    const data = [
      { label: 'A', value: 60, children: [{ label: 'A1', value: 60 }] },
      { label: 'B', value: 40 }
    ]
    const arcs = layoutSunburst(data, baseOpts)
    arcs.forEach((arc, i) => {
      expect(arc.index).toBe(i)
    })
  })

  it('keeps root legend indices on the full arc table', () => {
    const data = [
      {
        label: '亚洲',
        value: 60,
        children: [
          { label: '中国', value: 35 },
          { label: '日本', value: 15 },
          { label: '印度', value: 10 }
        ]
      },
      { label: '欧洲', value: 25 },
      { label: '美洲', value: 15 }
    ]
    const arcs = layoutSunburst(data, { cx: 100, cy: 100, innerRadius: 0, outerRadius: 90 })
    const america = arcs.find((arc) => arc.label === '美洲')!
    const roots = arcs.filter((arc) => arc.depth === 0)
    expect(roots.map((arc) => arc.label)).toEqual(['亚洲', '欧洲', '美洲'])
    expect(america.index).not.toBe(2)
    expect(arcs[america.index].label).toBe('美洲')
  })

  it('extends a shallow leaf to the outer radius', () => {
    const data = [
      { label: 'A', value: 50, children: [{ label: 'A1', value: 50 }] },
      { label: 'B', value: 50 }
    ]
    const arcs = layoutSunburst(data, baseOpts)
    const leaf = arcs.find((arc) => arc.label === 'B')!
    const child = arcs.find((arc) => arc.label === 'A1')!
    expect(leaf.outerRadius).toBe(baseOpts.outerRadius)
    expect(child.outerRadius).toBe(baseOpts.outerRadius)
    expect(leaf.innerRadius).toBeLessThan(child.innerRadius)
  })

  it('inherits parent color onto children without their own color', () => {
    const data = [
      {
        label: 'A',
        value: 50,
        color: '#abc',
        children: [{ label: 'A1', value: 50 }]
      }
    ]
    const arcs = layoutSunburst(data, baseOpts)
    expect(arcs.find((arc) => arc.label === 'A1')!.color).toBe('#abc')
  })

  it('skips non-positive values instead of emitting empty paths', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const arcs = layoutSunburst(
      [
        { label: 'Bad', value: Number.NaN },
        { label: 'Negative', value: -5 },
        { label: 'Good', value: 10 }
      ],
      baseOpts
    )
    expect(arcs.map((arc) => arc.label)).toEqual(['Good'])
    expect(arcs.every((arc) => arc.path.length > 0 && !arc.path.includes('NaN'))).toBe(true)
    warn.mockRestore()
  })

  it("starts at 12 o'clock", () => {
    const arcs = layoutSunburst([{ label: 'A', value: 10 }], baseOpts)
    expect(arcs[0].startAngle).toBeCloseTo(-Math.PI / 2)
  })

  it('places nested labels on distinct mid-radii', () => {
    const data = [
      {
        label: '亚洲',
        value: 60,
        children: [
          { label: '中国', value: 35 },
          { label: '日本', value: 15 },
          { label: '印度', value: 10 }
        ]
      }
    ]
    const arcs = layoutSunburst(data, baseOpts)
    const asia = arcs.find((a) => a.label === '亚洲')!
    const china = arcs.find((a) => a.label === '中国')!
    const asiaPoint = getSunburstLabelPoint(asia, baseOpts.cx, baseOpts.cy)
    const chinaPoint = getSunburstLabelPoint(china, baseOpts.cx, baseOpts.cy)
    expect(asiaPoint).not.toEqual(chinaPoint)
  })

  it('moves around siblings and into children', () => {
    const data = [
      { label: 'A', value: 50, children: [{ label: 'A1', value: 50 }] },
      { label: 'B', value: 50 }
    ]
    const arcs = layoutSunburst(data, baseOpts)
    const a = arcs.find((arc) => arc.label === 'A')!
    const b = arcs.find((arc) => arc.label === 'B')!
    const a1 = arcs.find((arc) => arc.label === 'A1')!
    expect(nextSunburstArcIndex(a.index, 'ArrowRight', arcs)).toBe(b.index)
    expect(nextSunburstArcIndex(a.index, 'ArrowDown', arcs)).toBe(a1.index)
    expect(nextSunburstArcIndex(a1.index, 'ArrowUp', arcs)).toBe(a.index)
  })

  it('computeSunburstArcs is the same layout', () => {
    const data = [
      { label: 'A', value: 40 },
      { label: 'B', value: 60 }
    ]
    expect(computeSunburstArcs(data, baseOpts)).toEqual(layoutSunburst(data, baseOpts))
  })
})
