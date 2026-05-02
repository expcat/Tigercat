import { describe, expect, it, vi } from 'vitest'
import {
  createTableRowKeyCache,
  getFixedColumnOffsets,
  getRowKey,
  type TableColumn
} from '@expcat/tigercat-core'

describe('table-utils', () => {
  describe('getRowKey', () => {
    it('returns explicit property keys before falling back to index', () => {
      expect(getRowKey({ id: 42 }, 'id', 3)).toBe(42)
      expect(getRowKey({ name: 'missing id' }, 'id', 3)).toBe(3)
    })

    it('returns keys from rowKey functions', () => {
      expect(getRowKey({ id: 7 }, (record) => `row-${record.id}`, 0)).toBe('row-7')
    })
  })

  describe('createTableRowKeyCache', () => {
    it('caches explicit function keys for repeated records in one pass', () => {
      const record = { id: 1 }
      const rowKey = vi.fn((row: typeof record) => row.id)
      const cache = createTableRowKeyCache(rowKey)

      expect(cache.get(record, 0)).toBe(1)
      expect(cache.get(record, 5)).toBe(1)
      expect(rowKey).toHaveBeenCalledTimes(1)
    })

    it('caches explicit zero keys even when they match the index', () => {
      const record = { id: 0 }
      const rowKey = vi.fn((row: typeof record) => row.id)
      const cache = createTableRowKeyCache(rowKey)

      expect(cache.get(record, 0)).toBe(0)
      expect(cache.get(record, 1)).toBe(0)
      expect(rowKey).toHaveBeenCalledTimes(1)
    })

    it('does not cache index fallbacks for records without explicit keys', () => {
      const record = { name: 'No id' }
      const cache = createTableRowKeyCache<typeof record>('id')

      expect(cache.get(record, 0)).toBe(0)
      expect(cache.get(record, 5)).toBe(5)
    })

    it('creates key lists with an index offset', () => {
      const cache = createTableRowKeyCache<{ id?: number }>('id')

      expect(cache.getMany([{ id: 8 }, {}, { id: 10 }], 20)).toEqual([8, 21, 10])
    })
  })

  describe('getFixedColumnOffsets', () => {
    it('calculates fixed column offsets and min table width', () => {
      const columns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 120, fixed: 'left' },
        { key: 'age', title: 'Age', width: 80 },
        { key: 'actions', title: 'Actions', width: 100, fixed: 'right' }
      ]

      expect(getFixedColumnOffsets(columns)).toEqual({
        leftOffsets: { name: 0 },
        rightOffsets: { actions: 0 },
        minTableWidth: 300,
        hasFixedColumns: true
      })
    })

    it('reports no fixed columns without key-array checks', () => {
      const columns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 120 },
        { key: 'age', title: 'Age', width: 80 }
      ]

      expect(getFixedColumnOffsets(columns).hasFixedColumns).toBe(false)
    })
  })
})
