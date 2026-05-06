import { bench, describe } from 'vitest'
import {
  calculateVirtualRange,
  getVirtualTableContainerClasses,
  getVirtualTableRowClasses,
  getVirtualRowKey,
  getVirtualTableFixedInfo,
  getVirtualTableFixedCellStyle,
  getFixedColumnOffsets,
  type TableColumn
} from '@expcat/tigercat-core'

// ─── Data generators ──────────────────────────────────────────────

function makeColumns(count: number): TableColumn[] {
  const cols: TableColumn[] = []
  for (let i = 0; i < count; i++) {
    const col: TableColumn = { key: `col_${i}`, title: `Column ${i}`, width: 120 }
    if (i < 2) col.fixed = 'left'
    else if (i >= count - 2) col.fixed = 'right'
    cols.push(col)
  }
  return cols
}

function makeRows(rowCount: number, colCount: number): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []
  for (let r = 0; r < rowCount; r++) {
    const row: Record<string, unknown> = { id: r }
    for (let c = 0; c < colCount; c++) {
      row[`col_${c}`] = `R${r}C${c}`
    }
    rows.push(row)
  }
  return rows
}

// ─── calculateVirtualRange ────────────────────────────────────────

describe('VirtualTable: calculateVirtualRange', () => {
  bench('10k rows, single scroll position', () => {
    calculateVirtualRange(4800, 600, 10_000, 48, 5)
  })

  bench('10k rows, 500 sequential scroll positions', () => {
    for (let i = 0; i < 500; i++) {
      calculateVirtualRange(i * 96, 600, 10_000, 48, 5)
    }
  })

  bench('100k rows, single scroll position', () => {
    calculateVirtualRange(240_000, 600, 100_000, 48, 5)
  })
})

// ─── getFixedColumnOffsets (sticky columns) ───────────────────────

describe('VirtualTable: Fixed column offsets', () => {
  const cols50 = makeColumns(50)
  const cols1000 = makeColumns(1000)

  bench('getFixedColumnOffsets — 50 columns', () => {
    getFixedColumnOffsets(cols50)
  })

  bench('getFixedColumnOffsets — 1000 columns', () => {
    getFixedColumnOffsets(cols1000)
  })

  bench('getVirtualTableFixedInfo — 1000 columns', () => {
    getVirtualTableFixedInfo(cols1000)
  })
})

// ─── getVirtualTableFixedCellStyle ────────────────────────────────

describe('VirtualTable: Sticky cell style lookup', () => {
  const cols1000 = makeColumns(1000)
  const fixedInfo = getVirtualTableFixedInfo(cols1000)

  bench('getVirtualTableFixedCellStyle — fixed left column', () => {
    getVirtualTableFixedCellStyle('col_0', fixedInfo)
  })

  bench('getVirtualTableFixedCellStyle — non-fixed column', () => {
    getVirtualTableFixedCellStyle('col_500', fixedInfo)
  })

  bench('getVirtualTableFixedCellStyle — fixed right column', () => {
    getVirtualTableFixedCellStyle('col_999', fixedInfo)
  })

  bench('1000 cells style lookup per row', () => {
    for (let c = 0; c < 1000; c++) {
      getVirtualTableFixedCellStyle(`col_${c}`, fixedInfo)
    }
  })
})

// ─── Row class generation ─────────────────────────────────────────

describe('VirtualTable: Row class generation', () => {
  bench('getVirtualTableRowClasses (plain)', () => {
    getVirtualTableRowClasses(5, false, false)
  })

  bench('getVirtualTableRowClasses (striped + selected)', () => {
    getVirtualTableRowClasses(7, true, true)
  })

  bench('100 rows class generation', () => {
    for (let i = 0; i < 100; i++) {
      getVirtualTableRowClasses(i, true, i % 10 === 0)
    }
  })
})

// ─── Row key extraction ───────────────────────────────────────────

describe('VirtualTable: Row key extraction', () => {
  const rows = makeRows(100, 5)

  bench('getVirtualRowKey — index fallback (100 rows)', () => {
    for (let i = 0; i < 100; i++) {
      getVirtualRowKey(rows[i], i)
    }
  })

  bench('getVirtualRowKey — string key (100 rows)', () => {
    for (let i = 0; i < 100; i++) {
      getVirtualRowKey(rows[i], i, 'id' as keyof (typeof rows)[0])
    }
  })

  bench('getVirtualRowKey — function key (100 rows)', () => {
    const fn = (row: Record<string, unknown>) => row.id as number
    for (let i = 0; i < 100; i++) {
      getVirtualRowKey(rows[i], i, fn)
    }
  })
})

// ─── Container class generation ───────────────────────────────────

describe('VirtualTable: Container classes', () => {
  bench('getVirtualTableContainerClasses (plain)', () => {
    getVirtualTableContainerClasses(false)
  })

  bench('getVirtualTableContainerClasses (bordered + className)', () => {
    getVirtualTableContainerClasses(true, 'custom-class')
  })
})

// ─── Combined: simulate render prep for 1000 cols × visible window ──

describe('VirtualTable: Full render prep (1000 cols, 10k rows)', () => {
  const cols = makeColumns(1000)
  const allRows = makeRows(10_000, 1000)
  const fixedInfo = getVirtualTableFixedInfo(cols)

  bench('calculate range + slice visible rows + all cell styles', () => {
    const range = calculateVirtualRange(4800, 600, 10_000, 48, 5)
    const visible = allRows.slice(range.start, range.end)
    for (const row of visible) {
      getVirtualRowKey(row, 0, 'id' as keyof typeof row)
      for (const col of cols) {
        getVirtualTableFixedCellStyle(col.key, fixedInfo)
      }
    }
  })

  bench('header cell style computation (1000 cols)', () => {
    for (const col of cols) {
      getVirtualTableFixedCellStyle(col.key, fixedInfo)
    }
  })
})
