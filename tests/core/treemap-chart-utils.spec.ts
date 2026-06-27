import { describe, it, expect } from 'vitest'
import { computeTreeMapNodes } from '@expcat/tigercat-core'

const baseOpts = { width: 400, height: 300 }

describe('computeTreeMapNodes', () => {
  it('returns empty array for empty data', () => {
    expect(computeTreeMapNodes([], baseOpts)).toEqual([])
  })

  it('returns empty array when all values are zero', () => {
    const data = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 }
    ]
    expect(computeTreeMapNodes(data, baseOpts)).toEqual([])
  })

  it('returns one node for single item', () => {
    const data = [{ label: 'A', value: 100 }]
    const nodes = computeTreeMapNodes(data, baseOpts)
    expect(nodes).toHaveLength(1)
    expect(nodes[0].label).toBe('A')
    expect(nodes[0].value).toBe(100)
  })

  it('single node fills area minus gap', () => {
    const data = [{ label: 'A', value: 100 }]
    const nodes = computeTreeMapNodes(data, { width: 400, height: 300, gap: 4 })
    expect(nodes[0].w).toBe(396) // 400 - 4
    expect(nodes[0].h).toBe(296) // 300 - 4
  })

  it('returns correct number of nodes for flat data', () => {
    const data = [
      { label: 'A', value: 60 },
      { label: 'B', value: 30 },
      { label: 'C', value: 10 }
    ]
    const nodes = computeTreeMapNodes(data, baseOpts)
    expect(nodes).toHaveLength(3)
  })

  it('total area of nodes approximates container area', () => {
    const data = [
      { label: 'A', value: 50 },
      { label: 'B', value: 30 },
      { label: 'C', value: 20 }
    ]
    const nodes = computeTreeMapNodes(data, { ...baseOpts, gap: 0 })
    const totalArea = nodes.reduce((s, n) => s + n.w * n.h, 0)
    const containerArea = 400 * 300
    // Should be close to container area (gap=0)
    expect(totalArea).toBeCloseTo(containerArea, -1)
  })

  it('all nodes have non-negative dimensions', () => {
    const data = [
      { label: 'A', value: 100 },
      { label: 'B', value: 1 },
      { label: 'C', value: 1 }
    ]
    const nodes = computeTreeMapNodes(data, baseOpts)
    for (const n of nodes) {
      expect(n.w).toBeGreaterThanOrEqual(0)
      expect(n.h).toBeGreaterThanOrEqual(0)
      expect(n.x).toBeGreaterThanOrEqual(0)
      expect(n.y).toBeGreaterThanOrEqual(0)
    }
  })

  it('flattens nested children data', () => {
    const data = [
      {
        label: 'Parent',
        value: 0,
        children: [
          { label: 'Child1', value: 60 },
          { label: 'Child2', value: 40 }
        ]
      }
    ]
    const nodes = computeTreeMapNodes(data, baseOpts)
    expect(nodes).toHaveLength(2)
    expect(nodes.map((n) => n.label).sort()).toEqual(['Child1', 'Child2'])
  })

  it('nested children get depth > 0', () => {
    const data = [
      {
        label: 'P',
        value: 0,
        children: [{ label: 'C', value: 50 }]
      }
    ]
    const nodes = computeTreeMapNodes(data, baseOpts)
    expect(nodes[0].depth).toBe(1)
  })

  it('gap affects node sizes', () => {
    const data = [
      { label: 'A', value: 50 },
      { label: 'B', value: 50 }
    ]
    const noGap = computeTreeMapNodes(data, { ...baseOpts, gap: 0 })
    const withGap = computeTreeMapNodes(data, { ...baseOpts, gap: 10 })
    // With gap, individual nodes should be smaller
    const noGapArea = noGap.reduce((s, n) => s + n.w * n.h, 0)
    const gapArea = withGap.reduce((s, n) => s + n.w * n.h, 0)
    expect(gapArea).toBeLessThan(noGapArea)
  })

  it('uses custom colors', () => {
    const data = [{ label: 'A', value: 100 }]
    const colors = ['#ff0000']
    const nodes = computeTreeMapNodes(data, { ...baseOpts, colors })
    expect(nodes[0].color).toBe('#ff0000')
  })

  it('uses datum color over palette', () => {
    const data = [{ label: 'A', value: 100, color: '#abc' }]
    const nodes = computeTreeMapNodes(data, baseOpts)
    expect(nodes[0].color).toBe('#abc')
  })

  it('recomputes same-reference data mutations instead of returning stale cached nodes', () => {
    const data = [{ label: 'A', value: 100 }]
    const r1 = computeTreeMapNodes(data, baseOpts)
    data[0].label = 'Changed'
    data[0].value = 50
    const r2 = computeTreeMapNodes(data, baseOpts)

    expect(r1).not.toBe(r2)
    expect(r2[0].label).toBe('Changed')
    expect(r2[0].value).toBe(50)
  })

  it('recomputes when data reference changes', () => {
    const data1 = [{ label: 'A', value: 100 }]
    const data2 = [{ label: 'B', value: 50 }]
    const r1 = computeTreeMapNodes(data1, baseOpts)
    const r2 = computeTreeMapNodes(data2, baseOpts)
    expect(r1).not.toBe(r2)
  })

  it('larger values get larger areas', () => {
    const data = [
      { label: 'Big', value: 90 },
      { label: 'Small', value: 10 }
    ]
    const nodes = computeTreeMapNodes(data, { ...baseOpts, gap: 0 })
    const big = nodes.find((n) => n.label === 'Big')!
    const small = nodes.find((n) => n.label === 'Small')!
    expect(big.w * big.h).toBeGreaterThan(small.w * small.h)
  })

  it('normalizes invalid dimensions and leaf values', () => {
    expect(computeTreeMapNodes([{ label: 'A', value: 1 }], { width: -1, height: 100 })).toEqual([])

    const nodes = computeTreeMapNodes(
      [
        { label: 'Bad', value: Number.NaN },
        { label: 'Negative', value: -5 },
        { label: 'Good', value: 10 }
      ],
      { ...baseOpts, gap: -8 }
    )

    expect(nodes.map((node) => node.value)).toEqual([10])
    expect(nodes.every((node) => Number.isFinite(node.x) && Number.isFinite(node.w))).toBe(true)
  })
})
