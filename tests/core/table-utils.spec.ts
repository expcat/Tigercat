import { describe, expect, it, vi } from 'vitest'
import {
  createTableRowKeyCache,
  getFixedColumnOffsets,
  getFixedColumnPosition,
  getFixedColumnStyle,
  getTableFixedCellClasses,
  getTableFixedHeaderCellClasses,
  getTableVirtualRecommendation,
  getRowKey,
  tableBackgroundClasses,
  tableHeaderBackgroundClasses,
  tableRowGroupHoverClasses,
  tableRowStripedClasses,
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

    it('uses measured column widths before declared widths for fixed offsets', () => {
      const columns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 120, fixed: 'left' },
        { key: 'age', title: 'Age', width: 80 },
        { key: 'actions', title: 'Actions', width: 100, fixed: 'right' }
      ]

      expect(getFixedColumnOffsets(columns, { name: 150, age: 90, actions: 110 })).toEqual({
        leftOffsets: { name: 0 },
        rightOffsets: { actions: 0 },
        minTableWidth: 350,
        hasFixedColumns: true
      })
    })

    it('resolves fixed column position and sticky styles', () => {
      const columns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 120, fixed: 'left' },
        { key: 'age', title: 'Age', width: 80 },
        { key: 'actions', title: 'Actions', width: 100, fixed: 'right' }
      ]
      const fixedInfo = getFixedColumnOffsets(columns)

      expect(getFixedColumnPosition(columns[0], fixedInfo)).toBe('left')
      expect(getFixedColumnPosition(columns[2], fixedInfo)).toBe('right')
      expect(getFixedColumnPosition(columns[1], fixedInfo)).toBeUndefined()

      expect(getFixedColumnStyle(columns[0], fixedInfo, 15)).toEqual({
        position: 'sticky',
        left: '0px',
        zIndex: 15
      })
      expect(getFixedColumnStyle(columns[2], fixedInfo, 12)).toEqual({
        position: 'sticky',
        right: '0px',
        zIndex: 12
      })
    })
  })

  describe('fixed column class helpers', () => {
    it('builds default and custom classes for fixed body cells', () => {
      const columns: TableColumn<{ id: number }>[] = [
        {
          key: 'name',
          title: 'Name',
          fixed: 'left',
          fixedClassName: ({ view, fixed, rowIndex, selected }) =>
            selected ? `selected-${view}-${fixed}-${rowIndex}` : 'plain-fixed'
        }
      ]
      const fixedInfo = getFixedColumnOffsets(columns)

      const classes = getTableFixedCellClasses({
        view: 'table',
        column: columns[0],
        record: { id: 1 },
        rowIndex: 0,
        striped: true,
        stripedActive: true,
        selected: true,
        hoverable: true,
        fixedInfo,
        selectedClassName: 'selected-row-bg'
      })

      expect(classes).toContain(tableRowStripedClasses)
      expect(classes).toContain(tableRowGroupHoverClasses)
      expect(classes).toContain('selected-row-bg')
      expect(classes).toContain('selected-table-left-0')
      expect(
        getTableFixedCellClasses({
          view: 'table',
          column: { key: 'age', title: 'Age' },
          record: { id: 1 },
          rowIndex: 0,
          striped: false,
          stripedActive: false,
          selected: false,
          hoverable: true,
          fixedInfo
        })
      ).toBeUndefined()
    })

    it('builds default and custom classes for fixed header cells', () => {
      const columns: TableColumn[] = [
        {
          key: 'actions',
          title: 'Actions',
          fixed: 'right',
          fixedHeaderClassName: ({ view, fixed, stickyHeader }) =>
            `${view}-${fixed}-${stickyHeader ? 'sticky' : 'static'}`
        }
      ]
      const fixedInfo = getFixedColumnOffsets(columns)

      const classes = getTableFixedHeaderCellClasses({
        view: 'virtual-table',
        column: columns[0],
        stickyHeader: true,
        fixedInfo
      })

      expect(classes).toContain(tableHeaderBackgroundClasses)
      expect(classes).toContain('virtual-table-right-sticky')
      expect(
        getTableFixedHeaderCellClasses({
          view: 'table',
          column: { key: 'name', title: 'Name' },
          stickyHeader: false,
          fixedInfo
        })
      ).toBeUndefined()
    })

    it('falls back to the table background for non-striped fixed cells', () => {
      const columns: TableColumn[] = [{ key: 'name', title: 'Name', fixed: 'left' }]
      const fixedInfo = getFixedColumnOffsets(columns)

      const classes = getTableFixedCellClasses({
        view: 'table',
        column: columns[0],
        record: { id: 1 },
        rowIndex: 1,
        striped: true,
        stripedActive: false,
        selected: false,
        hoverable: false,
        fixedInfo
      })

      expect(classes).toContain(tableBackgroundClasses)
    })
  })

  describe('getTableVirtualRecommendation', () => {
    it('recommends virtual mode at or above the threshold without enabling it', () => {
      expect(getTableVirtualRecommendation({ dataLength: 1000 })).toEqual({
        enabled: false,
        autoEnabled: false,
        recommended: true,
        threshold: 1000,
        autoThreshold: 10000,
        dataLength: 1000
      })
    })

    it('does not recommend when virtual mode is already enabled', () => {
      expect(getTableVirtualRecommendation({ virtual: true, dataLength: 2000 })).toEqual({
        enabled: true,
        autoEnabled: false,
        recommended: false,
        threshold: 1000,
        autoThreshold: 10000,
        dataLength: 2000
      })
    })

    it('auto-enables virtual mode at the auto threshold', () => {
      expect(getTableVirtualRecommendation({ dataLength: 10000 })).toEqual({
        enabled: true,
        autoEnabled: true,
        recommended: false,
        threshold: 1000,
        autoThreshold: 10000,
        dataLength: 10000
      })
    })

    it('allows auto virtual mode to be disabled', () => {
      expect(getTableVirtualRecommendation({ autoVirtual: false, dataLength: 10000 })).toEqual({
        enabled: false,
        autoEnabled: false,
        recommended: true,
        threshold: 1000,
        autoThreshold: 10000,
        dataLength: 10000
      })
    })
  })
})
