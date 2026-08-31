import { describe, it, expect } from 'vitest'
import {
  defaultTransferFilter,
  filterTransferItems,
  moveTransferItems,
  splitTransferData,
  toggleTransferKey
} from '@expcat/tigercat-core'
import type { TransferItem } from '@expcat/tigercat-core'

const data: TransferItem[] = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
  { key: 'c', label: 'C', disabled: true },
  { key: 'd', label: 'D' }
]

describe('moveTransferItems', () => {
  it('moves enabled selected keys to the right (append)', () => {
    const result = moveTransferItems('right', ['d'], ['a', 'b'], data)
    expect(result.movedKeys).toEqual(['a', 'b'])
    expect(result.targetKeys).toEqual(['d', 'a', 'b'])
  })

  it('skips disabled items when moving right', () => {
    const result = moveTransferItems('right', [], ['a', 'c'], data)
    expect(result.movedKeys).toEqual(['a'])
    expect(result.targetKeys).toEqual(['a'])
  })

  it('treats 1 and "1" as the same key and does not push twice', () => {
    const numbered: TransferItem[] = [
      { key: 1, label: 'One' },
      { key: '2', label: 'Two' }
    ]
    const result = moveTransferItems('right', [1], ['1', 1], numbered)
    expect(result.movedKeys).toEqual([1])
    expect(result.targetKeys).toEqual([1])
  })

  it('removes selected keys when moving left', () => {
    const result = moveTransferItems('left', ['a', 'b', 'd'], ['b'], data)
    expect(result.movedKeys).toEqual(['b'])
    expect(result.targetKeys).toEqual(['a', 'd'])
  })

  it('skips disabled items when moving left', () => {
    const result = moveTransferItems('left', ['a', 'c'], ['c'], data)
    expect(result.movedKeys).toEqual([])
    expect(result.targetKeys).toEqual(['a', 'c'])
  })

  it('ignores selected keys not present in the data source', () => {
    const result = moveTransferItems('right', [], ['a', 'zzz'], data)
    expect(result.movedKeys).toEqual(['a'])
  })

  it('renders target items in targetKeys order', () => {
    const moved = moveTransferItems('right', [], ['d', 'a'], data)
    const { targetItems } = splitTransferData(data, moved.targetKeys)
    expect(targetItems.map((item) => item.key)).toEqual(['d', 'a'])
  })
})

describe('defaultTransferFilter', () => {
  it('matches description as well as label', () => {
    const item: TransferItem = { key: 'auth', label: '鉴权', description: '核心权限' }
    expect(defaultTransferFilter('核心', item)).toBe(true)
    expect(filterTransferItems([item], '监控')).toEqual([])
    expect(toggleTransferKey([1], '1')).toEqual([])
  })
})
