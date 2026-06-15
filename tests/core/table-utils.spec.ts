import { describe, expect, it, vi } from 'vitest'
import {
  createTableRowKeyCache,
  filterHiddenColumns,
  freezeTableColumnWidths,
  getCardColumns,
  getCardGridInfo,
  getFixedColumnOffsets,
  getFixedColumnPosition,
  getFixedColumnStyle,
  getTableColgroup,
  resolveTableColumnWidth,
  getTableFixedCellClasses,
  getTableFixedHeaderCellClasses,
  getTableResponsiveCardListClasses,
  getTableResponsiveTableClasses,
  getTableVirtualRecommendation,
  getRowKey,
  tableBackgroundClasses,
  tableFixedCellStripedClasses,
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

  describe('resolveTableColumnWidth', () => {
    it('uses the declared width (number → px, string passthrough)', () => {
      expect(resolveTableColumnWidth({ key: 'a', width: 120 })).toBe('120px')
      expect(resolveTableColumnWidth({ key: 'a', width: '20%' })).toBe('20%')
    })

    it('falls back to the frozen measured width, then undefined', () => {
      expect(resolveTableColumnWidth({ key: 'a' }, { a: 140 })).toBe('140px')
      expect(resolveTableColumnWidth({ key: 'a' }, { a: 0 })).toBeUndefined()
      expect(resolveTableColumnWidth({ key: 'a' }, {})).toBeUndefined()
    })
  })

  describe('getTableColgroup', () => {
    const columns: TableColumn[] = [
      { key: 'name', title: 'Name' },
      { key: 'age', title: 'Age', width: 80 },
      { key: 'actions', title: 'Actions', width: 100, fixed: 'right' }
    ]

    it('emits one entry per data column with resolved widths', () => {
      expect(
        getTableColgroup({
          columns,
          frozenWidths: { name: 150 },
          size: 'md',
          hasSelectionColumn: false,
          expand: false
        })
      ).toEqual([
        { key: 'name', width: '150px' },
        { key: 'age', width: '80px' },
        { key: 'actions', width: '100px' }
      ])
    })

    it('prepends selection and leading expand columns with size-based widths', () => {
      const entries = getTableColgroup({
        columns,
        size: 'sm',
        hasSelectionColumn: true,
        expand: 'start'
      })

      expect(entries.slice(0, 2)).toEqual([
        { key: '__expand__', width: '2rem' },
        { key: '__selection__', width: '2rem' }
      ])
      expect(entries.map((e) => e.key)).toEqual([
        '__expand__',
        '__selection__',
        'name',
        'age',
        'actions'
      ])
    })

    it('appends a trailing expand column and scales width with size', () => {
      const entries = getTableColgroup({
        columns,
        size: 'lg',
        hasSelectionColumn: false,
        expand: 'end'
      })

      expect(entries[entries.length - 1]).toEqual({ key: '__expand__', width: '3rem' })
    })

    it('leaves auto-sized columns without a frozen width undefined', () => {
      const entries = getTableColgroup({
        columns,
        size: 'md',
        hasSelectionColumn: false,
        expand: false
      })

      expect(entries[0]).toEqual({ key: 'name', width: undefined })
    })
  })

  describe('freezeTableColumnWidths', () => {
    const columns: TableColumn[] = [
      { key: 'name', title: 'Name' },
      { key: 'age', title: 'Age', width: 80 }
    ]

    it('freezes the first measured width of auto-sized columns only', () => {
      expect(freezeTableColumnWidths(columns, { name: 150, age: 90 }, {})).toEqual({ name: 150 })
    })

    it('keeps existing frozen entries instead of re-reading measurements', () => {
      expect(freezeTableColumnWidths(columns, { name: 200 }, { name: 150 })).toEqual({ name: 150 })
    })

    it('ignores non-positive measurements until a real width is known', () => {
      expect(freezeTableColumnWidths(columns, { name: 0 }, {})).toEqual({})
    })

    it('prunes frozen entries for removed columns', () => {
      expect(
        freezeTableColumnWidths([{ key: 'name', title: 'Name' }], {}, { name: 150, gone: 90 })
      ).toEqual({ name: 150 })
    })

    it('returns the same reference when nothing changes (loop-safety)', () => {
      const previous = { name: 150 }
      expect(freezeTableColumnWidths(columns, { name: 150, age: 90 }, previous)).toBe(previous)
    })
  })

  describe('filterHiddenColumns', () => {
    const columns: TableColumn[] = [
      { key: 'name', title: 'Name', width: 120, fixed: 'left' },
      { key: 'age', title: 'Age', width: 80, fixed: 'left' },
      { key: 'email', title: 'Email', width: 200 },
      { key: 'actions', title: 'Actions', width: 100, fixed: 'right' }
    ]

    it('returns the same array reference when no keys are hidden', () => {
      expect(filterHiddenColumns(columns)).toBe(columns)
      expect(filterHiddenColumns(columns, [])).toBe(columns)
      expect(filterHiddenColumns(columns, ['unknown'])).toBe(columns)
    })

    it('filters out hidden columns by key', () => {
      expect(filterHiddenColumns(columns, ['email']).map((c) => c.key)).toEqual([
        'name',
        'age',
        'actions'
      ])
      expect(filterHiddenColumns(columns, ['name', 'actions']).map((c) => c.key)).toEqual([
        'age',
        'email'
      ])
    })

    it('can hide every column', () => {
      expect(filterHiddenColumns(columns, ['name', 'age', 'email', 'actions'])).toEqual([])
    })

    it('shrinks fixed column offsets when a fixed column is hidden', () => {
      const visible = filterHiddenColumns(columns, ['name'])
      expect(getFixedColumnOffsets(visible)).toEqual({
        leftOffsets: { age: 0 },
        rightOffsets: { actions: 0 },
        minTableWidth: 380,
        hasFixedColumns: true
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

      expect(classes).toContain(tableFixedCellStripedClasses)
      // Sticky cells must stay opaque — the translucent row stripe class
      // would let underlying columns show through while scrolling.
      expect(classes).not.toContain(tableRowStripedClasses)
      expect(tableFixedCellStripedClasses).not.toContain('/50')
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

  describe('getCardColumns', () => {
    const cols: TableColumn[] = [
      { key: 'id', title: 'ID', hideInCard: true },
      { key: 'name', title: 'Name', cardTitle: true },
      { key: 'status', title: 'Status', cardPriority: 2 },
      { key: 'role', title: 'Role', cardPriority: 1 },
      { key: 'note', title: 'Note' }
    ]

    it('drops hideInCard columns', () => {
      const { titleColumn, bodyColumns } = getCardColumns(cols)
      const keys = bodyColumns.map((c) => c.key)
      expect(keys).not.toContain('id')
      expect(titleColumn?.key).toBe('name')
    })

    it('extracts the first cardTitle column as the heading', () => {
      const { titleColumn, bodyColumns } = getCardColumns(cols)
      expect(titleColumn?.key).toBe('name')
      expect(bodyColumns.map((c) => c.key)).not.toContain('name')
    })

    it('orders body columns by cardPriority, keeping unprioritized in original order', () => {
      const { bodyColumns } = getCardColumns(cols)
      // role (1), status (2), then note (no priority → last, original order).
      expect(bodyColumns.map((c) => c.key)).toEqual(['role', 'status', 'note'])
    })

    it('passes all columns through when no card options are set', () => {
      const plain: TableColumn[] = [
        { key: 'a', title: 'A' },
        { key: 'b', title: 'B' }
      ]
      const { titleColumn, bodyColumns } = getCardColumns(plain)
      expect(titleColumn).toBeUndefined()
      expect(bodyColumns.map((c) => c.key)).toEqual(['a', 'b'])
    })
  })

  describe('getCardGridInfo', () => {
    it('defaults to a full-width card field', () => {
      expect(getCardGridInfo({ key: 'name', title: 'Name' }).className).toBe(
        'col-span-12 min-w-0 break-words'
      )
    })

    it('keeps fields full-width on the smallest screens and applies custom spans from sm', () => {
      const info = getCardGridInfo({
        key: 'email',
        title: 'Email',
        cardGrid: { colSpan: 6, rowSpan: 2, labelPosition: 'top' }
      })

      expect(info).toEqual({
        className: 'col-span-12 sm:col-span-6 row-span-2 min-w-0 break-words',
        hideLabel: false,
        labelPosition: 'top',
        divider: false,
        labelClassName: undefined,
        valueClassName: undefined
      })
    })

    it('lets cardLayout override column-level cardGrid options', () => {
      const info = getCardGridInfo(
        {
          key: 'status',
          title: 'Status',
          cardGrid: {
            colSpan: 6,
            rowSpan: 2,
            hideLabel: false,
            labelPosition: 'left',
            divider: false,
            labelClassName: 'column-label',
            valueClassName: 'column-value'
          }
        },
        {
          key: 'status',
          colSpan: 3,
          rowSpan: 4,
          hideLabel: true,
          labelPosition: 'top',
          divider: true,
          labelClassName: 'layout-label',
          valueClassName: 'layout-value'
        }
      )

      expect(info).toEqual({
        className: 'col-span-12 sm:col-span-3 row-span-4 min-w-0 break-words',
        hideLabel: true,
        labelPosition: 'top',
        divider: true,
        labelClassName: 'layout-label',
        valueClassName: 'layout-value'
      })
    })

    it('falls back safely for invalid runtime span values', () => {
      const info = getCardGridInfo({ key: 'notes', title: 'Notes' }, {
        key: 'notes',
        colSpan: 99,
        rowSpan: 99
      } as Parameters<typeof getCardGridInfo>[1])

      expect(info.className).toBe('col-span-12 min-w-0 break-words')
    })
  })

  describe('responsive card classes', () => {
    it('maps card mode + breakpoint to the matching max-* hide class', () => {
      expect(getTableResponsiveTableClasses('card')).toBe('max-sm:hidden')
      expect(getTableResponsiveTableClasses('card', 'md')).toBe('max-md:hidden')
      expect(getTableResponsiveTableClasses('card', 'lg')).toBe('max-lg:hidden')
    })

    it('maps scroll mode to the matching min-w class', () => {
      expect(getTableResponsiveTableClasses('scroll')).toBe('max-sm:min-w-max')
      expect(getTableResponsiveTableClasses('scroll', 'md')).toBe('max-md:min-w-max')
    })

    it('resolves the card list container classes per breakpoint', () => {
      expect(getTableResponsiveCardListClasses()).toContain('max-sm:grid')
      expect(getTableResponsiveCardListClasses('lg')).toContain('max-lg:grid')
    })
  })
})
