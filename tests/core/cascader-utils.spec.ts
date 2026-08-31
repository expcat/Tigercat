import { describe, expect, it } from 'vitest'
import {
  CASCADER_DEFAULT_LIST_HEIGHT,
  CASCADER_DEFAULT_SEARCH_LIMIT,
  filterCascaderOptions,
  flattenCascaderOptions,
  getCascaderColumns,
  getCascaderDisplayLabel,
  getCascaderInlineNav,
  getCascaderTriggerKeyIntent,
  getCascaderVirtualAlignScrollTop,
  getCascaderVirtualItemHeight,
  getCascaderVirtualRange,
  isCascaderOptionExpandable,
  isCascaderValueEmpty,
  normalizeCascaderValue,
  rememberCascaderLabel,
  setCascaderOptionChildren,
  type CascaderOption
} from '@expcat/tigercat-core'

const options: CascaderOption[] = [
  {
    label: 'Zhejiang',
    value: 'zhejiang',
    children: [
      {
        label: 'Hangzhou',
        value: 'hangzhou',
        children: [{ label: 'West Lake', value: 'westlake' }]
      }
    ]
  },
  { label: 'Jiangsu', value: 'jiangsu', children: [{ label: 'Nanjing', value: 'nanjing' }] }
]

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

describe('cascader columns, flatten, and display', () => {
  it('treats isLeaf true as not expandable even with children', () => {
    expect(
      isCascaderOptionExpandable({
        label: 'Leaf',
        value: 'leaf',
        isLeaf: true,
        children: [{ label: 'Hidden', value: 'hidden' }]
      })
    ).toBe(false)
  })

  it('treats isLeaf false with empty children as expandable when loadData is available', () => {
    expect(isCascaderOptionExpandable({ label: 'Lazy', value: 'lazy', isLeaf: false }, true)).toBe(
      true
    )
    expect(isCascaderOptionExpandable({ label: 'Lazy', value: 'lazy', isLeaf: false }, false)).toBe(
      false
    )
  })

  it('does not emit an empty column when options are empty', () => {
    expect(getCascaderColumns([], [])).toEqual([])
  })

  it('does not open a next column for isLeaf true nodes', () => {
    const columns = getCascaderColumns(
      [{ label: 'A', value: 'a', isLeaf: true, children: [{ label: 'B', value: 'b' }] }],
      ['a']
    )
    expect(columns).toHaveLength(1)
  })

  it('flattens labels with the same separator as the trigger', () => {
    const rows = flattenCascaderOptions(options, [], [], false, ' > ')
    expect(rows.some((row) => row.label === 'Zhejiang > Hangzhou > West Lake')).toBe(true)
    expect(rows.every((row) => !row.label.includes(' / '))).toBe(true)
  })

  it('limits search hits to the documented default', () => {
    const many: CascaderOption[] = Array.from({ length: 80 }, (_, i) => ({
      label: `Item ${i}`,
      value: i
    }))
    const flat = flattenCascaderOptions(many)
    expect(filterCascaderOptions(flat, 'Item').length).toBe(CASCADER_DEFAULT_SEARCH_LIMIT)
    expect(filterCascaderOptions(flat, 'Item', { limit: 80 }).length).toBe(80)
  })

  it('keeps a cached label when the path is missing from options', () => {
    const cache = new Map<string, string>()
    rememberCascaderLabel(cache, ['zhejiang', 'hangzhou'], 'Zhejiang / Hangzhou')
    expect(getCascaderDisplayLabel([], ['zhejiang', 'hangzhou'], ' / ', cache)).toBe(
      'Zhejiang / Hangzhou'
    )
  })

  it('uses a custom separator for in-tree labels', () => {
    expect(getCascaderDisplayLabel(options, ['zhejiang', 'hangzhou'], ' | ')).toBe(
      'Zhejiang | Hangzhou'
    )
  })

  it('treats undefined as empty and [] as empty', () => {
    expect(isCascaderValueEmpty(undefined)).toBe(true)
    expect(isCascaderValueEmpty([])).toBe(true)
    expect(normalizeCascaderValue([])).toBeUndefined()
    expect(isCascaderValueEmpty(['a'])).toBe(false)
  })

  it('merges loaded children onto the matching path', () => {
    const next = setCascaderOptionChildren(
      [{ label: 'A', value: 'a', isLeaf: false, children: [] }],
      ['a'],
      [{ label: 'B', value: 'b' }]
    )
    expect(next[0]?.children?.[0]?.value).toBe('b')
  })
})

describe('cascader keyboard direction', () => {
  it('maps LTR right to into and left to out', () => {
    expect(getCascaderInlineNav('ArrowRight', 'ltr')).toBe('into')
    expect(getCascaderInlineNav('ArrowLeft', 'ltr')).toBe('out')
  })

  it('swaps inline keys in RTL', () => {
    expect(getCascaderInlineNav('ArrowLeft', 'rtl')).toBe('into')
    expect(getCascaderInlineNav('ArrowRight', 'rtl')).toBe('out')
  })

  it('opens from a closed trigger and clears when requested', () => {
    expect(
      getCascaderTriggerKeyIntent({
        key: 'ArrowDown',
        open: false,
        searchable: false,
        clearable: true,
        hasValue: false
      }).type
    ).toBe('open')
    expect(
      getCascaderTriggerKeyIntent({
        key: 'Backspace',
        open: false,
        searchable: false,
        clearable: true,
        hasValue: true
      }).type
    ).toBe('clear')
  })
})
