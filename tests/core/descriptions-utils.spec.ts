/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { getDescriptionsHorizontalColSpan, groupItemsIntoRows } from '@expcat/tigercat-core'

describe('groupItemsIntoRows', () => {
  it('packs uniform span-1 items', () => {
    const rows = groupItemsIntoRows([{ span: 1 }, { span: 1 }, { span: 1 }, { span: 1 }], 3)
    expect(rows).toHaveLength(2)
    expect(rows[0].map((item) => item.span)).toEqual([1, 1, 1])
    expect(rows[1].map((item) => item.span)).toEqual([3])
  })

  it('wraps when span does not fit the remainder', () => {
    const rows = groupItemsIntoRows([{ span: 2 }, { span: 2 }], 3)
    expect(rows[0].map((item) => item.span)).toEqual([3])
    expect(rows[1].map((item) => item.span)).toEqual([3])
  })

  it('clamps span larger than column', () => {
    const rows = groupItemsIntoRows([{ span: 8 }], 3)
    expect(rows).toEqual([[{ span: 3 }]])
  })

  it('fills the last item of a short row', () => {
    const rows = groupItemsIntoRows([{ span: 1 }, { span: 1 }], 3)
    expect(rows).toEqual([[{ span: 1 }, { span: 2 }]])
  })

  it('treats column <= 0 as 1', () => {
    const rows = groupItemsIntoRows([{ span: 2 }, { span: 1 }], 0)
    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row[0].span === 1)).toBe(true)
  })

  it('derives horizontal td colSpan from the filled span', () => {
    expect(getDescriptionsHorizontalColSpan(1)).toBe(1)
    expect(getDescriptionsHorizontalColSpan(3)).toBe(5)
  })
})
