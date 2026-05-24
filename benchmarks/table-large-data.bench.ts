import { bench, describe } from 'vitest'
import {
  getTableCellClasses,
  getTableHeaderCellClasses,
  getTableRowClasses,
  getTableVirtualRecommendation,
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
  const columns = makeColumns(80)
  const rows = makeRows(50_000, columns.length)

  bench('virtual recommendation for 50k rows', () => {
    getTableVirtualRecommendation(rows.length, columns.length)
  })

  bench('visible row and cell class generation', () => {
    for (let rowIndex = 0; rowIndex < 200; rowIndex++) {
      getTableRowClasses(rowIndex, true, rowIndex % 11 === 0, false, 'md')
      for (const column of columns) {
        getTableCellClasses(column.align, column.fixed, false, 'md')
      }
    }
  })

  bench('header cell class generation for wide table', () => {
    for (const column of columns) {
      getTableHeaderCellClasses(column.align, column.sortable ?? false, 'md', column.fixed)
    }
  })
})
