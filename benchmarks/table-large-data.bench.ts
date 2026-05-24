import { bench, describe } from 'vitest'
import {
  getTableCellClasses,
  getTableHeaderCellClasses,
  getTableRowClasses,
  getTableVirtualRecommendation,
  sortData,
  filterData,
  paginateData,
  type TableColumn
} from '@expcat/tigercat-core'

interface BenchRow extends Record<string, unknown> {
  id: number
}

function makeColumns(count: number): TableColumn<BenchRow>[] {
  return Array.from({ length: count }, (_, index) => ({
    key: `field_${index}`,
    title: `Field ${index}`,
    width: 120,
    sortable: index % 3 === 0,
    align: index % 4 === 0 ? 'right' : 'left'
  }))
}

function makeRows(rowCount: number, colCount: number): BenchRow[] {
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const row: BenchRow = { id: rowIndex }
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      row[`field_${colIndex}`] = `R${rowIndex}C${colIndex}`
    }
    return row
  })
}

describe('Table large data render prep', () => {
  const columns = makeColumns(40)
  const rows1k = makeRows(1_000, columns.length)
  const rows5k = makeRows(5_000, columns.length)
  const rows10k = makeRows(10_000, columns.length)

  bench('virtual recommendation for 10k rows', () => {
    getTableVirtualRecommendation({ dataLength: rows10k.length })
  })

  for (const [label, rows] of [
    ['1000 rows', rows1k],
    ['5000 rows', rows5k],
    ['10000 rows', rows10k]
  ] as const) {
    bench(`${label}: visible row and cell class generation`, () => {
      const visibleRows = rows.slice(0, 200)
      for (let rowIndex = 0; rowIndex < visibleRows.length; rowIndex++) {
        getTableRowClasses(true, true, rowIndex % 2 === 0)
        for (const column of columns) {
          getTableCellClasses('md', column.align ?? 'left')
        }
      }
    })
  }

  bench('sort 10k rows by numeric id descending', () => {
    sortData(rows10k, 'id', 'desc')
  })

  bench('filter 10k rows by string cell value', () => {
    filterData(rows10k, { field_2: 'R99' })
  })

  bench('paginate 10k rows at middle page', () => {
    paginateData(rows10k, 50, 100)
  })

  bench('combined sort + filter + paginate 10k rows', () => {
    const filtered = filterData(rows10k, { field_1: 'R1' })
    const sorted = sortData(filtered, 'id', 'asc')
    paginateData(sorted, 2, 100)
  })

  bench('header cell class generation for wide table', () => {
    for (const column of columns) {
      getTableHeaderCellClasses('md', column.align ?? 'left', column.sortable ?? false)
    }
  })
})
