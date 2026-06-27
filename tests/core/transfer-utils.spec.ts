import { describe, it, expect } from 'vitest'
import { moveTransferItems, splitTransferData } from '@expcat/tigercat-core'
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

  it('result re-splits consistently', () => {
    const moved = moveTransferItems('right', [], ['a', 'd'], data)
    const { targetItems } = splitTransferData(data, moved.targetKeys)
    expect(targetItems.map((i) => i.key)).toEqual(['a', 'd'])
  })
})
