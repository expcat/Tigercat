/**
 * Table row grouping utilities
 */

import type { TableColumn } from '../types/table'
import { getTableColumnDataKey } from './table-utils'

export function resolveGroupCellValue<T>(
  record: T,
  groupBy: string,
  columns?: TableColumn<T>[]
): string {
  const column = columns?.find((item) => item.key === groupBy)
  const field = column ? getTableColumnDataKey(column) : groupBy
  return String((record as Record<string, unknown>)[field] ?? '')
}

export interface TableGroupBlock<T> {
  key: string
  /** Size of the whole group, including rows on other pages. */
  count: number
  /** This page continues a group that started earlier. Do not draw another header. */
  continued: boolean
  records: T[]
}

/**
 * Slice already-grouped rows. `groupKeys[i]` is the group of `rows[i]`.
 * A page may start in the middle of a group; that block is `continued`.
 */
export function buildTableGroupBlocks<T>(options: {
  rows: T[]
  groupKeys: string[]
  pageStart: number
  pageEnd: number
}): TableGroupBlock<T>[] {
  const counts = new Map<string, number>()
  for (const key of options.groupKeys) counts.set(key, (counts.get(key) ?? 0) + 1)

  const start = Math.max(0, options.pageStart)
  const end = Math.min(options.rows.length, options.pageEnd)
  const blocks: TableGroupBlock<T>[] = []
  for (let index = start; index < end; index++) {
    const key = options.groupKeys[index] ?? ''
    const previous = index > 0 ? options.groupKeys[index - 1] : undefined
    const last = blocks[blocks.length - 1]
    if (!last || last.key !== key) {
      blocks.push({
        key,
        count: counts.get(key) ?? 0,
        continued: previous === key,
        records: [options.rows[index]!]
      })
    } else {
      last.records.push(options.rows[index]!)
    }
  }
  return blocks
}

/**
 * Group data by a column key.
 *
 * `groupBy` is a column key. When `columns` is passed, values are read from
 * `dataKey || key`.
 */
export function groupDataByColumn<T>(
  data: T[],
  groupBy: string,
  columns?: TableColumn<T>[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>()

  for (const record of data) {
    const key = resolveGroupCellValue(record, groupBy, columns)
    const existing = groups.get(key)
    if (existing) {
      existing.push(record)
    } else {
      groups.set(key, [record])
    }
  }

  return groups
}

/**
 * Get group header row classes
 */
export const tableGroupHeaderClasses =
  'bg-[var(--tiger-surface-muted)] font-semibold text-sm text-[var(--tiger-text)] [&>td]:border-b [&>td]:border-[var(--tiger-border)]'

/**
 * Get group header cell padding classes
 */
export function getGroupHeaderCellClasses(size: 'sm' | 'md' | 'lg'): string {
  const padding: Record<string, string> = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  }
  return padding[size] || padding.md
}
