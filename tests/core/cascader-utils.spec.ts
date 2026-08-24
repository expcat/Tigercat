import { describe, expect, it } from 'vitest'
import {
  getCascaderVirtualAlignScrollTop,
  getCascaderVirtualItemHeight,
  getCascaderVirtualRange,
  CASCADER_DEFAULT_LIST_HEIGHT
} from '@expcat/tigercat-core'

describe('cascader virtual helpers', () => {
  it('reuses Select-sized row heights', () => {
    expect(getCascaderVirtualItemHeight('sm')).toBe(32)
    expect(getCascaderVirtualItemHeight('md')).toBe(40)
    expect(getCascaderVirtualItemHeight('lg')).toBe(48)
    expect(getCascaderVirtualItemHeight()).toBe(40)
  })

  it('computes a fixed-size visible window with overscan', () => {
    const itemHeight = getCascaderVirtualItemHeight('md')
    const range = getCascaderVirtualRange(0, CASCADER_DEFAULT_LIST_HEIGHT, 200, itemHeight)

    expect(range.totalHeight).toBe(200 * itemHeight)
    expect(range.startIndex).toBe(0)
    expect(range.endIndex).toBeGreaterThan(0)
    expect(range.endIndex).toBeLessThan(50)
  })

  it('advances the window after scrolling', () => {
    const itemHeight = 40
    const range = getCascaderVirtualRange(800, 256, 200, itemHeight, 0)

    expect(range.startIndex).toBe(20)
    expect(range.offsetTop).toBe(800)
  })

  it('clamps startIndex so a past-the-end scrollTop cannot produce an empty window', () => {
    const itemHeight = 40
    const range = getCascaderVirtualRange(2944, 256, 8, itemHeight)

    expect(range.endIndex).toBeGreaterThanOrEqual(0)
    expect(range.startIndex).toBeLessThanOrEqual(range.endIndex)
    expect(range.endIndex).toBeLessThan(8)
    expect(range.startIndex).toBeGreaterThanOrEqual(0)
  })

  it('aligns scrollTop so the active index stays in the window', () => {
    const itemHeight = 40
    const listHeight = 256

    expect(getCascaderVirtualAlignScrollTop(0, -1, itemHeight, listHeight)).toBe(0)
    expect(getCascaderVirtualAlignScrollTop(0, 2, itemHeight, listHeight)).toBe(0)

    const scrolledUp = getCascaderVirtualAlignScrollTop(400, 2, itemHeight, listHeight)
    expect(scrolledUp).toBe(80)

    const scrolledDown = getCascaderVirtualAlignScrollTop(0, 80, itemHeight, listHeight)
    expect(scrolledDown).toBe(80 * itemHeight + itemHeight - listHeight)
  })
})
