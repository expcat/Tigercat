import { describe, it, expect, vi } from 'vitest'
import { computeTreeMapNodes, layoutTreeMap } from '@expcat/tigercat-core'

const baseOpts = { width: 400, height: 300 }

describe('layoutTreeMap', () => {
  it('returns empty array for empty data', () => {
    expect(layoutTreeMap([], baseOpts)).toEqual([])
  })

  it('returns empty array when all values are zero', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const data = [
      { label: 'A', value: 0 },
      { label: 'B', value: 0 }
    ]
    expect(layoutTreeMap(data, baseOpts)).toEqual([])
    warn.mockRestore()
  })

  it('returns one node for single item', () => {
    const data = [{ label: 'A', value: 100 }]
    const nodes = layoutTreeMap(data, baseOpts)
    expect(nodes).toHaveLength(1)
    expect(nodes[0].label).toBe('A')
    expect(nodes[0].value).toBe(100)
    expect(nodes[0].datum).toEqual(data[0])
    expect(nodes[0].index).toBe(0)
  })

  it('keeps interaction index aligned with the laid-out array', () => {
    const data = [
      { label: 'A', value: 10 },
      { label: 'B', value: 90 }
    ]
    const nodes = layoutTreeMap(data, { ...baseOpts, gap: 0 })
    expect(nodes.map((node) => node.index)).toEqual(nodes.map((_, i) => i))
    const a = nodes.find((node) => node.label === 'A')!
    const b = nodes.find((node) => node.label === 'B')!
    expect(b.w * b.h).toBeGreaterThan(a.w * a.h)
    expect(nodes[a.index].datum.label).toBe('A')
  })

  it('draws parent rectangles that contain nested children', () => {
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
    const nodes = layoutTreeMap(data, baseOpts)
    const parent = nodes.find((node) => node.label === 'Parent')!
    const child1 = nodes.find((node) => node.label === 'Child1')!
    const child2 = nodes.find((node) => node.label === 'Child2')!
    expect(parent).toBeDefined()
    expect(parent.depth).toBe(0)
    expect(child1.depth).toBe(1)
    expect(child2.depth).toBe(1)
    expect(child1.x).toBeGreaterThanOrEqual(parent.x)
    expect(child1.x + child1.w).toBeLessThanOrEqual(parent.x + parent.w + 0.01)
    expect(child1.y).toBeGreaterThanOrEqual(parent.y)
  })

  it('skips non-finite and negative leaves', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const nodes = layoutTreeMap(
      [
        { label: 'Bad', value: Number.NaN },
        { label: 'Negative', value: -5 },
        { label: 'Good', value: 10 }
      ],
      { ...baseOpts, gap: -8 }
    )
    expect(nodes.map((node) => node.label)).toEqual(['Good'])
    warn.mockRestore()
  })

  it('uses datum color over palette', () => {
    const nodes = layoutTreeMap([{ label: 'A', value: 100, color: '#abc' }], baseOpts)
    expect(nodes[0].color).toBe('#abc')
  })

  it('computeTreeMapNodes is the same layout', () => {
    const data = [
      { label: 'A', value: 40 },
      { label: 'B', value: 60 }
    ]
    expect(computeTreeMapNodes(data, baseOpts)).toEqual(layoutTreeMap(data, baseOpts))
  })
})
