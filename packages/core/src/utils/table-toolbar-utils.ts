/**
 * DataTableWithToolbar toolbar controller.
 *
 * Search / filter map / hidden-column toggle / page-size delta live here so
 * Vue and React only bind Input/Select/Button/Popover and Table passthrough.
 */

import { classNames } from './class-names'
import { filterTableData, getTableColumnDataKey } from './table-utils'
import type { TableColumn } from '../types/table'
import type {
  TableQueryField,
  TableToolbarFilter,
  TableToolbarFilterValue,
  TableToolbarProps,
  TableToolbarSearchMode
} from '../types/table-toolbar'

type ToolbarSearchBits = Pick<
  TableToolbarProps,
  | 'search'
  | 'searchPlaceholder'
  | 'searchValue'
  | 'defaultSearchValue'
  | 'showSearchButton'
  | 'onSearchChange'
  | 'onSearch'
  | 'searchMode'
>

type ToolbarFilterSeed = Pick<TableToolbarFilter, 'key' | 'value' | 'defaultValue'>

export function splitCompositeHostAttrs(attrs: Record<string, unknown>): {
  host: Record<string, unknown>
  rest: Record<string, unknown>
} {
  const host: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (
      key === 'id' ||
      key === 'style' ||
      key === 'class' ||
      key === 'className' ||
      key === 'role' ||
      key.startsWith('data-') ||
      key.startsWith('aria-')
    ) {
      host[key] = value
    } else {
      rest[key] = value
    }
  }
  return { host, rest }
}

export function toolbarHasSearch(toolbar: ToolbarSearchBits | undefined): boolean {
  if (!toolbar) return false
  if (toolbar.search === true) return true
  if (toolbar.search === false) return false
  return Boolean(
    toolbar.searchPlaceholder ||
    toolbar.searchValue !== undefined ||
    toolbar.defaultSearchValue !== undefined ||
    toolbar.showSearchButton ||
    toolbar.onSearchChange ||
    toolbar.onSearch ||
    toolbar.searchMode
  )
}

export function isToolbarSearchRemote(toolbar: ToolbarSearchBits | undefined): boolean {
  return toolbar?.searchMode === 'remote'
}

export function canSubmitToolbarSearch(
  toolbar: ToolbarSearchBits | undefined,
  options?: { hasSearchListener?: boolean }
): boolean {
  const hasSearch = toolbarHasSearch(toolbar) || options?.hasSearchListener === true
  if (!hasSearch) return false
  if (toolbar?.search === false) return false
  if (!isToolbarSearchRemote(toolbar)) return true
  return Boolean(toolbar?.onSearch || toolbar?.onSearchChange || options?.hasSearchListener)
}

export function toggleHiddenColumnKey(
  hiddenKeys: readonly string[],
  columnKey: string,
  visible: boolean
): string[] {
  const next = new Set(hiddenKeys)
  if (visible) next.delete(columnKey)
  else next.add(columnKey)
  return Array.from(next)
}

export function seedToolbarFilterState(
  prev: Record<string, TableToolbarFilterValue>,
  defs: readonly ToolbarFilterSeed[] | undefined
): Record<string, TableToolbarFilterValue> {
  if (!defs || defs.length === 0) return prev
  let changed = false
  const next = { ...prev }
  for (const filter of defs) {
    if (filter.value === undefined && !Object.prototype.hasOwnProperty.call(next, filter.key)) {
      next[filter.key] = filter.defaultValue ?? null
      changed = true
    }
  }
  return changed ? next : prev
}

export function resolveToolbarFilterMap(
  defs: readonly ToolbarFilterSeed[] | undefined,
  internal: Record<string, TableToolbarFilterValue>,
  extraKeys: readonly string[] = []
): Record<string, TableToolbarFilterValue> {
  const next: Record<string, TableToolbarFilterValue> = {}
  const defByKey = new Map((defs ?? []).map((filter) => [filter.key, filter] as const))
  const keys = new Set<string>([...defByKey.keys(), ...extraKeys])
  for (const key of keys) {
    const def = defByKey.get(key)
    if (def?.value !== undefined) {
      next[key] = def.value
    } else if (Object.prototype.hasOwnProperty.call(internal, key)) {
      next[key] = internal[key]
    } else if (def) {
      next[key] = def.defaultValue ?? null
    }
  }
  return next
}

/**
 * One controlled entrance: `rowSelection.selectedRowKeys`. Otherwise the
 * toolbar's internal keys. Count is `keys.length`.
 */
export function resolveToolbarSelectedKeys(
  rowSelectionSelected: readonly (string | number)[] | undefined,
  internal: readonly (string | number)[]
): (string | number)[] {
  if (rowSelectionSelected !== undefined) return [...rowSelectionSelected]
  return [...internal]
}

/** The map handed to `onFiltersChange`, with this write winning over a controlled value. */
export function toolbarFilterMapAfterWrite(
  defs: readonly ToolbarFilterSeed[] | undefined,
  internal: Record<string, TableToolbarFilterValue>,
  extraKeys: readonly string[],
  key: string,
  value: TableToolbarFilterValue
): Record<string, TableToolbarFilterValue> {
  const next = resolveToolbarFilterMap(defs, { ...internal, [key]: value }, extraKeys)
  next[key] = value
  return next
}

export function isToolbarScalarFilter(value: TableToolbarFilterValue): boolean {
  return (
    value == null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

export function applyToolbarLocalView<T extends Record<string, unknown>>(
  dataSource: readonly T[],
  columns: readonly TableColumn<T>[],
  search: string,
  filterValues: Record<string, TableToolbarFilterValue>
): T[] {
  const query = search.trim().toLowerCase()
  let rows = dataSource as T[]
  if (query) {
    const keys = columns.map((column) => getTableColumnDataKey(column))
    rows = rows.filter((row) =>
      keys.some((key) =>
        String(row[key] ?? '')
          .toLowerCase()
          .includes(query)
      )
    )
  }
  const columnKeys = new Set(columns.map((column) => column.key))
  const tableFilters: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(filterValues)) {
    if (!columnKeys.has(key)) continue
    if (value === null || value === undefined || value === '') continue
    if (typeof value === 'object') continue
    tableFilters[key] = value
  }
  return filterTableData(rows, columns as TableColumn<T>[], tableFilters)
}

export function resolveToolbarPageChange(
  page: { current: number; pageSize: number },
  previousPageSize: number | undefined
): { kind: 'page' | 'size'; page: { current: number; pageSize: number } } {
  if (previousPageSize !== undefined && previousPageSize !== page.pageSize) {
    return { kind: 'size', page }
  }
  return { kind: 'page', page }
}

export function getDataTableToolbarWrapperClasses(options: {
  bordered?: boolean
  className?: string
}): string {
  return classNames(
    'tiger-data-table-with-toolbar flex flex-col',
    options.bordered
      ? 'border border-[var(--tiger-border)] rounded-[var(--tiger-radius-md)] overflow-hidden bg-[var(--tiger-surface)] shadow-sm'
      : 'gap-3.5',
    options.className
  )
}

export function getDataTableToolbarBarClasses(options: {
  bordered?: boolean
  className?: string
}): string {
  return classNames(
    'tiger-data-table-toolbar flex flex-wrap items-center gap-3 px-4 py-3.5',
    options.bordered
      ? 'bg-[var(--tiger-surface-muted)] border-b border-[var(--tiger-border)]'
      : 'bg-[var(--tiger-surface-muted)]/80 border border-[var(--tiger-border)] rounded-[var(--tiger-radius-md)] shadow-sm',
    options.className
  )
}

export function seedQueryValues(
  fields: readonly TableQueryField[] | undefined
): Record<string, TableToolbarFilterValue> {
  const next: Record<string, TableToolbarFilterValue> = {}
  for (const field of fields ?? []) {
    next[field.key] = field.value !== undefined ? field.value : (field.defaultValue ?? null)
  }
  return next
}

export function readQueryValues(
  fields: readonly TableQueryField[] | undefined,
  draft: Record<string, TableToolbarFilterValue>
): Record<string, TableToolbarFilterValue> {
  const next: Record<string, TableToolbarFilterValue> = {}
  for (const field of fields ?? []) {
    if (field.value !== undefined) next[field.key] = field.value
    else if (Object.prototype.hasOwnProperty.call(draft, field.key))
      next[field.key] = draft[field.key]
    else next[field.key] = field.defaultValue ?? null
  }
  return next
}

export function queryValueIsEmpty(value: TableToolbarFilterValue): boolean {
  if (value == null || value === '') return true
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/** Collapsed summary. Objects are named, not stringified into a local search. */
export function summarizeQueryValues(
  fields: readonly TableQueryField[] | undefined,
  values: Record<string, TableToolbarFilterValue>
): string {
  const parts: string[] = []
  for (const field of fields ?? []) {
    const value = values[field.key]
    if (queryValueIsEmpty(value)) continue
    if (value != null && typeof value === 'object') {
      parts.push(field.label)
      continue
    }
    parts.push(`${field.label}: ${String(value)}`)
  }
  return parts.join(', ')
}

/** Scalars only. Object conditions stay on the submit payload. */
export function queryScalarsForLocalView(
  values: Record<string, TableToolbarFilterValue>
): Record<string, TableToolbarFilterValue> {
  const next: Record<string, TableToolbarFilterValue> = {}
  for (const [key, value] of Object.entries(values)) {
    if (value != null && typeof value === 'object') continue
    next[key] = value
  }
  return next
}

export type { TableToolbarSearchMode }
