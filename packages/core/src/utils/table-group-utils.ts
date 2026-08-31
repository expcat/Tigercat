/**
 * Table row grouping utilities
 */

import type { TableColumn } from '../types/table'
import { getTableColumnDataKey } from './table-utils'

function resolveGroupCellValue<T>(record: T, groupBy: string, columns?: TableColumn<T>[]): string {
  const column = columns?.find((item) => item.key === groupBy)
  const field = column ? getTableColumnDataKey(column) : groupBy
  return String((record as Record<string, unknown>)[field] ?? '')
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
  'bg-[var(--tiger-surface-muted,#f3f4f6)] font-semibold text-sm text-[var(--tiger-text,#111827)] [&>td]:border-b [&>td]:border-[var(--tiger-border,#e5e7eb)]'

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
