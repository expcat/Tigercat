/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { fixedSizeStrategy, variableSizeStrategy, dynamicSizeStrategy } from '@expcat/tigercat-core'

describe('fixedSizeStrategy', () => {
  const strategy = fixedSizeStrategy(50)

  it('returns correct item height for any index', () => {
    expect(strategy.getItemHeight(0)).toBe(50)
    expect(strategy.getItemHeight(99)).toBe(50)
  })

  it('returns correct item offset', () => {
    expect(strategy.getItemOffset(0)).toBe(0)
    expect(strategy.getItemOffset(5)).toBe(250)
  })

  it('computes range with correct totalHeight', () => {
    const range = strategy.getRange(0, 200, 100, 2)
    expect(range.totalHeight).toBe(5000)
    expect(range.startIndex).toBe(0)
    expect(range.endIndex).toBeLessThanOrEqual(10)
  })

  it('computes range from scrolled position', () => {
    const range = strategy.getRange(500, 200, 100, 0)
    expect(range.startIndex).toBe(10)
    expect(range.offsetTop).toBe(500)
  })

  it('returns an empty range for non-positive item height', () => {
    const zero = fixedSizeStrategy(0)
    const range = zero.getRange(120, 400, 100, 5)
    expect(range).toEqual({ startIndex: 0, endIndex: -1, offsetTop: 0, totalHeight: 0 })
  })

  it('returns an empty range when there are no items', () => {
    const range = strategy.getRange(0, 200, 0, 2)
    expect(range).toEqual({ startIndex: 0, endIndex: -1, offsetTop: 0, totalHeight: 0 })
  })
})

describe('variableSizeStrategy', () => {
  // Item 0 = 20, item 1 = 40, item 2 = 60, item 3 = 30, item 4 = 50
  const heights = [20, 40, 60, 30, 50]
  const getHeight = (i: number) => heights[i] ?? 40
  const strategy = variableSizeStrategy(getHeight, 5)

  it('returns per-item height', () => {
    expect(strategy.getItemHeight(0)).toBe(20)
    expect(strategy.getItemHeight(2)).toBe(60)
  })

  it('returns correct offsets via prefix sum', () => {
    expect(strategy.getItemOffset(0)).toBe(0)
    expect(strategy.getItemOffset(1)).toBe(20)
    expect(strategy.getItemOffset(2)).toBe(60) // 20 + 40
    expect(strategy.getItemOffset(3)).toBe(120) // 20 + 40 + 60
  })

  it('computes range with correct totalHeight', () => {
    const range = strategy.getRange(0, 100, 5, 0)
    expect(range.totalHeight).toBe(200) // 20+40+60+30+50
    expect(range.startIndex).toBe(0)
  })

  it('returns empty range for zero items', () => {
    const empty = variableSizeStrategy(() => 40, 0)
    const range = empty.getRange(0, 100, 0, 2)
    expect(range.startIndex).toBe(0)
    expect(range.endIndex).toBe(-1)
    expect(range.totalHeight).toBe(0)
  })

  it('binary search finds correct start from scrolled position', () => {
    // scroll past item 0 (20px) and item 1 (40px) → should start at item 2
    const range = strategy.getRange(60, 100, 5, 0)
    expect(range.startIndex).toBe(2)
  })
})

describe('dynamicSizeStrategy', () => {
  it('uses estimated height before measurement', () => {
    const strategy = dynamicSizeStrategy(30, 10)
    expect(strategy.getItemHeight(0)).toBe(30)
    expect(strategy.getItemOffset(3)).toBe(90) // 3 * 30
  })

  it('uses measured height after updateItemHeight', () => {
    const strategy = dynamicSizeStrategy(30, 5)
    strategy.updateItemHeight!(0, 50)
    strategy.updateItemHeight!(1, 20)

    expect(strategy.getItemHeight(0)).toBe(50)
    expect(strategy.getItemHeight(1)).toBe(20)
    expect(strategy.getItemHeight(2)).toBe(30) // still estimated

    expect(strategy.getItemOffset(0)).toBe(0)
    expect(strategy.getItemOffset(1)).toBe(50)
    expect(strategy.getItemOffset(2)).toBe(70) // 50 + 20
  })

  it('computes correct totalHeight mixing measured and estimated', () => {
    const strategy = dynamicSizeStrategy(30, 4)
    strategy.updateItemHeight!(1, 50)
    // items: 30 + 50 + 30 + 30 = 140
    const range = strategy.getRange(0, 200, 4, 0)
    expect(range.totalHeight).toBe(140)
  })

  it('rebuilds cached offsets from the earliest changed item', () => {
    const strategy = dynamicSizeStrategy(30, 100_000)
    strategy.updateItemHeight!(10, 50)
    strategy.updateItemHeight!(50_000, 20)

    expect(strategy.getItemOffset(11)).toBe(350)
    expect(strategy.getItemOffset(50_001)).toBe(1_500_040)

    const range = strategy.getRange(2_999_400, 300, 100_000, 2)
    expect(range.startIndex).toBeGreaterThan(99_900)
    expect(range.totalHeight).toBe(3_000_010)
  })

  it('ignores invalid measurements and unchanged heights', () => {
    const strategy = dynamicSizeStrategy(30, 3)
    strategy.updateItemHeight!(-1, 50)
    strategy.updateItemHeight!(3, 50)
    strategy.updateItemHeight!(1, Number.NaN)
    strategy.updateItemHeight!(1, 0)
    strategy.updateItemHeight!(1, 30)

    expect(strategy.getRange(0, 100, 3, 0).totalHeight).toBe(90)
  })

  it('returns empty range for zero items', () => {
    const strategy = dynamicSizeStrategy(30, 0)
    const range = strategy.getRange(0, 100, 0, 2)
    expect(range.endIndex).toBe(-1)
    expect(range.totalHeight).toBe(0)
  })
})
