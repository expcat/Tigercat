import { describe, it, expect } from 'vitest'
import { computeFunnelSegments } from '@expcat/tigercat-core'

describe('computeFunnelSegments', () => {
  const data = [
    { label: 'A', value: 100 },
    { label: 'B', value: 80 },
    { label: 'C', value: 40 }
  ]

  it('returns empty array for empty data', () => {
    expect(computeFunnelSegments([], { width: 200, height: 300 })).toEqual([])
  })

  it('returns empty array when all values are zero', () => {
    const zeros = [
      { label: 'X', value: 0 },
      { label: 'Y', value: 0 }
    ]
    expect(computeFunnelSegments(zeros, { width: 200, height: 300 })).toEqual([])
  })

  it('returns correct number of segments', () => {
    const result = computeFunnelSegments(data, { width: 200, height: 300 })
    expect(result).toHaveLength(3)
  })

  it('assigns correct labels and values', () => {
    const result = computeFunnelSegments(data, { width: 200, height: 300 })
    expect(result[0].label).toBe('A')
    expect(result[0].value).toBe(100)
    expect(result[1].label).toBe('B')
    expect(result[2].label).toBe('C')
  })

  it('assigns default label when missing', () => {
    const noLabel = [{ value: 50 }]
    const result = computeFunnelSegments(noLabel as any, { width: 200, height: 300 })
    expect(result[0].label).toBe('Stage 1')
  })

  it('generates valid SVG path strings', () => {
    const result = computeFunnelSegments(data, { width: 200, height: 300 })
    for (const seg of result) {
      expect(seg.path).toMatch(/^M[\d.,-]+\sL[\d.,-]+\sL[\d.,-]+\sL[\d.,-]+\sZ$/)
    }
  })

  it('first segment has full width (topWidth = width)', () => {
    const result = computeFunnelSegments(data, { width: 200, height: 300 })
    // A has value 100 = max, so topWidth = 200 * (100/100) = 200
    expect(result[0].topWidth).toBe(200)
  })

  it('segments have decreasing top widths when values decrease', () => {
    const result = computeFunnelSegments(data, { width: 200, height: 300 })
    expect(result[0].topWidth).toBeGreaterThan(result[1].topWidth)
    expect(result[1].topWidth).toBeGreaterThan(result[2].topWidth)
  })

  it('pinch mode makes last segment bottom width 0', () => {
    const result = computeFunnelSegments(data, { width: 200, height: 300, pinch: true })
    expect(result[result.length - 1].bottomWidth).toBe(0)
  })

  it('non-pinch last segment bottom = same as top', () => {
    const result = computeFunnelSegments(data, { width: 200, height: 300, pinch: false })
    const last = result[result.length - 1]
    expect(last.bottomWidth).toBe(last.topWidth)
  })

  it('cx is centered horizontally', () => {
    const result = computeFunnelSegments(data, { width: 200, height: 300 })
    for (const seg of result) {
      expect(seg.cx).toBe(100) // width / 2
    }
  })

  it('respects gap parameter', () => {
    const noGap = computeFunnelSegments(data, { width: 200, height: 300, gap: 0 })
    const withGap = computeFunnelSegments(data, { width: 200, height: 300, gap: 10 })
    // With larger gap, second segment y-center should shift down
    expect(withGap[1].cy).toBeGreaterThanOrEqual(noGap[1].cy)
    // Segments should be shorter with gap
    const noGapH = noGap[1].cy - noGap[0].cy
    const gapH = withGap[1].cy - withGap[0].cy
    expect(gapH).toBeGreaterThan(noGapH)
  })

  it('uses custom colors when provided', () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff']
    const result = computeFunnelSegments(data, { width: 200, height: 300, colors })
    expect(result[0].color).toBe('#ff0000')
    expect(result[1].color).toBe('#00ff00')
    expect(result[2].color).toBe('#0000ff')
  })

  it('uses datum color over palette color', () => {
    const colored = [{ label: 'X', value: 100, color: '#abc' }]
    const result = computeFunnelSegments(colored, { width: 200, height: 300 })
    expect(result[0].color).toBe('#abc')
  })

  it('handles single item', () => {
    const single = [{ label: 'Only', value: 50 }]
    const result = computeFunnelSegments(single, { width: 200, height: 300 })
    expect(result).toHaveLength(1)
    expect(result[0].topWidth).toBe(200)
  })

  it('assigns sequential indices', () => {
    const result = computeFunnelSegments(data, { width: 200, height: 300 })
    result.forEach((seg, i) => {
      expect(seg.index).toBe(i)
    })
  })
})
