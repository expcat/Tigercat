/**
 * VirtualTable utility functions
 *
 * Pure functions for virtual scroll calculation and styling.
 */

import type { TableColumn } from '../types/table'
import type { ExclusiveVirtualRange } from '../types/virtual-list'
import { calculateVirtualRange } from './virtual-list-utils'
import { getLogicalInlineScroll } from './infinite-scroll-utils'
import { devWarn } from './dev-warn'
import {
  allocateTableFallbackRowKey,
  getFixedColumnOffsets,
  getFixedColumnPosition,
  getFixedColumnStyle,
  getNextTableSelectAllKeys,
  getTableFixedCellClasses,
  getTableFixedHeaderCellClasses,
  parseWidthToPx,
  readTableRowKeyValue,
  tableHeaderBackgroundClasses,
  tableRowKeyId,
  tableVirtualSpacerCellClasses,
  TABLE_FIXED_CELL_Z_INDEX,
  TABLE_FIXED_HEADER_Z_INDEX
} from './table-utils'

/** Fallback column width (px) when a column has no resolvable `width`. */
export const DEFAULT_VIRTUAL_COLUMN_WIDTH = 150

export const EMPTY_VIRTUAL_TABLE_ROWS: readonly never[] = Object.freeze([])
export const EMPTY_VIRTUAL_TABLE_COLUMNS: readonly never[] = Object.freeze([])

// ─── Tailwind class constants ─────────────────────────────────────

export const virtualTableContainerClasses = `tiger-virtual-table relative overflow-auto border border-[var(--tiger-border)] rounded-[var(--tiger-radius-md)] bg-[var(--tiger-table-bg)]`

export const virtualTableHeaderClasses = `${tableHeaderBackgroundClasses} sticky top-0 z-20 [&_th]:border-b [&_th]:border-[var(--tiger-border)]`

export const virtualTableHeaderCellClasses =
  'px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-[var(--tiger-text-secondary)] overflow-hidden'

export const virtualTableRowClasses =
  'group tiger-motion-aware [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-[var(--tiger-border)]'

export const virtualTableRowHoverClasses =
  'hover:bg-[var(--tiger-table-hover-bg)]'

export const virtualTableRowFocusClasses =
  'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tiger-focus-ring)]/40'

export const virtualTableRowStripedClasses =
  'bg-[var(--tiger-table-stripe-bg)]/50'

export const virtualTableRowSelectedClasses = 'bg-[var(--tiger-primary)]/5'

/**
 * Opaque selected background for sticky fixed cells.
 *
 * Fixed cells float above other columns, so the translucent
 * `virtualTableRowSelectedClasses` would let underlying content show through
 * while scrolling horizontally. color-mix yields the same visual color as the
 * 5% primary overlay sitting on the table background.
 */
export const virtualTableFixedCellSelectedClasses =
  'bg-[color-mix(in_srgb,var(--tiger-primary)_5%,var(--tiger-table-bg))]'

export const virtualTableCellClasses =
  'px-4 py-0 text-sm text-[var(--tiger-text)] whitespace-nowrap'

export const virtualTableBorderedClasses =
  '[&_td]:border-r [&_th]:border-r [&_td:last-child]:border-r-0 [&_th:last-child]:border-r-0'

export const virtualTableEmptyClasses =
  'absolute inset-0 flex items-center justify-center py-12 text-sm text-[var(--tiger-text-secondary)]'

export const virtualTableLoadingClasses =
  'absolute inset-0 flex items-center justify-center bg-[var(--tiger-table-bg)]/60 z-20'

/** Visible column window for horizontal (column) virtualization. */
export interface VirtualColumnRange {
  /** Start column index (inclusive) */
  start: number
  /** End column index (exclusive) */
  end: number
  /** Width before the window, along the inline axis */
  inlineBefore: number
  /** Width after the window, along the inline axis */
  inlineAfter: number
}

/**
 * Column window. `scrollLeft` is converted to distance from the inline start
 * with {@link getLogicalInlineScroll}. Non-positive widths do not enter the
 * window and do not advance the inline offset.
 */
export function calculateVirtualColumnRange(
  scrollLeft: number,
  viewportWidth: number,
  columnWidths: number[],
  overscan = 2,
  dir: 'ltr' | 'rtl' = 'ltr'
): VirtualColumnRange {
  const count = columnWidths.length
  const safeViewportWidth = Number.isFinite(viewportWidth) ? Math.max(0, viewportWidth) : 0
  const safeOverscan = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0
  const widths = columnWidths.map((width) => (Number.isFinite(width) && width > 0 ? width : 0))
  const empty = { start: 0, end: 0, inlineBefore: 0, inlineAfter: 0 }
  if (count === 0 || safeViewportWidth <= 0) return empty

  let total = 0
  for (const width of widths) total += width
  const maxScroll = Math.max(0, total - safeViewportWidth)
  const fromStart = getLogicalInlineScroll(
    Number.isFinite(scrollLeft) ? scrollLeft : 0,
    maxScroll,
    dir
  )

  const positive: number[] = []
  for (let i = 0; i < count; i++) {
    if (widths[i] > 0) positive.push(i)
  }
  if (positive.length === 0) return empty

  let acc = 0
  let rawStart = positive[positive.length - 1]
  for (const index of positive) {
    if (acc + widths[index] > fromStart) {
      rawStart = index
      break
    }
    acc += widths[index]
  }

  const viewEnd = fromStart + safeViewportWidth
  let endExclusive = rawStart
  let endAcc = acc
  while (endExclusive < count && endAcc < viewEnd) {
    if (widths[endExclusive] > 0) endAcc += widths[endExclusive]
    endExclusive++
  }

  const startIndex = positive.findIndex((index) => index >= Math.max(0, rawStart - safeOverscan))
  const start = startIndex >= 0 ? positive[Math.max(0, startIndex)] : positive[0]
  let end = Math.min(count, endExclusive + safeOverscan)
  while (end > start && widths[end - 1] <= 0) end--

  let inlineBefore = 0
  for (let i = 0; i < start; i++) inlineBefore += widths[i]
  let inlineAfter = 0
  for (let i = end; i < count; i++) inlineAfter += widths[i]

  return { start, end, inlineBefore, inlineAfter }
}

export function getVirtualTableColumnWidths<T>(
  columns: TableColumn<T>[],
  measuredWidths: Record<string, number> = {}
): number[] {
  return columns.map((column) => {
    const measured = measuredWidths[column.key]
    if (typeof measured === 'number' && Number.isFinite(measured) && measured > 0) return measured
    const parsed = parseWidthToPx(column.width)
    return parsed > 0 ? parsed : 0
  })
}

export function resolveVirtualTableWidth(width: unknown): number | 'auto' {
  if (width === 'auto' || width === undefined || width === null) return 'auto'
  if (typeof width === 'number' && Number.isFinite(width) && width > 0) return width
  if (typeof width === 'string' && width.trim() !== '' && width !== 'auto') {
    devWarn(
      'VirtualTable.width',
      `VirtualTable width must be a number or "auto"; received "${width}"`
    )
  }
  return 'auto'
}

export function resolveVirtualTableColumnVirtualization(input: {
  virtualizeColumns?: boolean
  hasFixedColumns: boolean
  widths: number[]
  viewportWidth: number
}): { active: boolean; viewportWidth: number } {
  if (!input.virtualizeColumns) {
    return { active: false, viewportWidth: 0 }
  }
  if (input.hasFixedColumns) {
    devWarn(
      'VirtualTable.virtualizeColumns.fixed',
      'Column virtualization is ignored when any column is fixed'
    )
    return { active: false, viewportWidth: 0 }
  }
  const viewport = Number.isFinite(input.viewportWidth) ? input.viewportWidth : 0
  const measured = input.widths.length > 0 && input.widths.every((width) => width > 0)
  if (!(viewport > 0) || !measured) {
    devWarn(
      'VirtualTable.virtualizeColumns.width',
      'Column virtualization waits until every column width and the scrollport width are measured'
    )
    return { active: false, viewportWidth: 0 }
  }
  return { active: true, viewportWidth: viewport }
}

export function getVirtualTableRowWindow(
  scrollTop: number,
  viewportHeight: number,
  rowCount: number,
  itemHeight: number,
  overscan: number,
  headerHeight = 0
): ExclusiveVirtualRange {
  const rowViewport = Math.max(0, viewportHeight - Math.max(0, headerHeight))
  return calculateVirtualRange(scrollTop, rowViewport, rowCount, itemHeight, overscan)
}

/**
 * Scroll so row `index` sits in the band below the sticky header.
 * A row already inside that band does not move `scrollTop`.
 */
export function scrollTopToRevealVirtualTableRow(input: {
  scrollTop: number
  viewportHeight: number
  headerHeight: number
  index: number
  itemHeight: number
}): number {
  const scrollTop = Number.isFinite(input.scrollTop) ? Math.max(0, input.scrollTop) : 0
  const viewport = Number.isFinite(input.viewportHeight) ? Math.max(0, input.viewportHeight) : 0
  const header = Number.isFinite(input.headerHeight) ? Math.max(0, input.headerHeight) : 0
  const itemHeight = Number.isFinite(input.itemHeight) && input.itemHeight > 0 ? input.itemHeight : 0
  const offset = Math.max(0, input.index) * itemHeight
  const visibleTop = scrollTop + header
  const visibleBottom = scrollTop + viewport
  const itemEnd = offset + itemHeight
  if (itemHeight === 0 || viewport === 0) return scrollTop
  if (offset >= visibleTop && itemEnd <= visibleBottom) return scrollTop
  if (offset < visibleTop) return Math.max(0, offset - header)
  return Math.max(0, itemEnd - viewport)
}

export function getVirtualTableSpacerHeights(
  range: ExclusiveVirtualRange,
  itemHeight: number
): { top: number; bottom: number } {
  const rowHeight = Number.isFinite(itemHeight) && itemHeight > 0 ? itemHeight : 0
  return {
    top: range.offsetTop,
    bottom: Math.max(0, range.totalHeight - range.end * rowHeight)
  }
}

export interface VirtualTableRowIdentity {
  /** Stable selection key; omitted when the row has no identity. */
  key: string | number | undefined
  /** React/Vue reconciliation key (falls back to the dataSource index). */
  domKey: string | number
}

/**
 * Resolve one row. Pass the same `used` set for a list so each row is resolved
 * once and a missing identity cannot collide with `0` or another numeric id.
 * An empty field or empty function return warns and falls back.
 */
export function resolveVirtualTableRowIdentity<T>(
  row: T,
  index: number,
  rowKey?: keyof T | ((row: T, index: number) => string | number),
  used: Set<string> = new Set()
): VirtualTableRowIdentity {
  const resolved = rowKey ?? ('id' as keyof T)
  const raw =
    typeof resolved === 'function'
      ? resolved(row, index)
      : (row as Record<string, unknown>)[String(resolved)]
  const key = readTableRowKeyValue(raw)
  if (key !== undefined) {
    used.add(tableRowKeyId(key))
    return { key, domKey: key }
  }

  devWarn(
    `VirtualTable.rowKey.${index}`,
    `Row at index ${index} has no identity; falling back to a non-index key`
  )
  const fallback = allocateTableFallbackRowKey(index, used)
  return { key: fallback, domKey: fallback }
}

/** Resolve every row once. `getRowKey` and `rowKey` share this function. */
export function resolveVirtualTableRowIdentities<T>(
  rows: readonly T[],
  rowKey?: keyof T | ((row: T, index: number) => string | number),
  getRowKey?: (row: T, index: number) => string | number
): VirtualTableRowIdentity[] {
  const used = new Set<string>()
  const resolver = getRowKey ?? rowKey
  return rows.map((row, index) => resolveVirtualTableRowIdentity(row, index, resolver, used))
}

/** Next row that is not disabled. Stays put when every row is disabled. */
export function nextEnabledRowIndex(
  count: number,
  from: number,
  isDisabled: (index: number) => boolean
): number {
  if (count <= 0) return 0
  const start = ((from % count) + count) % count
  for (let step = 0; step < count; step++) {
    const index = (start + step) % count
    if (!isDisabled(index)) return index
  }
  return start
}

/**
 * Get the row key for a virtual table data item.
 * Defaults to `id`. Missing identities fall back to the dataSource index for DOM only.
 */
export function getVirtualRowKey<T>(
  row: T,
  index: number,
  rowKey?: keyof T | ((row: T, index: number) => string | number)
): string | number {
  return resolveVirtualTableRowIdentity(row, index, rowKey).domKey
}

export function resolveVirtualTableSelectedKeys(selectedRowKeys: unknown): (string | number)[] {
  if (selectedRowKeys === undefined) return []
  if (Array.isArray(selectedRowKeys)) return selectedRowKeys
  devWarn(
    'VirtualTable.rowSelection.selectedRowKeys',
    'selectedRowKeys must be an array; treating as []'
  )
  return []
}

export function isVirtualTableCellControlTarget(target: EventTarget | null): boolean {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false
  return Boolean(target.closest('button, a, input, select, textarea, [role="button"]'))
}

export function getNextVirtualTableSelection(input: {
  type?: 'checkbox' | 'radio'
  selectedKeys: (string | number)[]
  key: string | number
}): (string | number)[] {
  const id = tableRowKeyId(input.key)
  const selected = input.selectedKeys.some((key) => tableRowKeyId(key) === id)
  if (input.type === 'radio') return [input.key]
  return getNextTableSelectAllKeys(input.selectedKeys, [input.key], !selected)
}

// ─── Class generators ─────────────────────────────────────────────

export function getVirtualTableContainerClasses(bordered: boolean, className?: string): string {
  const parts = [virtualTableContainerClasses]
  if (bordered) parts.push(virtualTableBorderedClasses)
  if (className) parts.push(className)
  return parts.join(' ')
}

export function getVirtualTableRowClasses(
  index: number,
  striped: boolean,
  selected: boolean
): string {
  const parts = [virtualTableRowClasses, virtualTableRowHoverClasses]
  if (striped && index % 2 === 1) parts.push(virtualTableRowStripedClasses)
  if (selected) parts.push(virtualTableRowSelectedClasses)
  return parts.join(' ')
}

// ─── Sticky column helpers ────────────────────────────────────────

export interface VirtualTableFixedInfo {
  startOffsets: Record<string, number>
  endOffsets: Record<string, number>
  hasFixedColumns: boolean
  minTableWidth: number
}

/**
 * Compute fixed column offsets for VirtualTable.
 * Thin wrapper around Table's `getFixedColumnOffsets`.
 */
export function getVirtualTableFixedInfo<T = Record<string, unknown>>(
  columns: TableColumn<T>[]
): VirtualTableFixedInfo {
  const { startOffsets, endOffsets, hasFixedColumns, minTableWidth } =
    getFixedColumnOffsets(columns)
  return { startOffsets, endOffsets, hasFixedColumns, minTableWidth }
}

/**
 * Get inline style for a fixed column cell (th or td).
 * Returns `undefined` when the column is not fixed.
 */
export function getVirtualTableFixedCellStyle(
  columnKey: string,
  fixedInfo: VirtualTableFixedInfo,
  kind: 'header' | 'body' = 'body'
): ReturnType<typeof getFixedColumnStyle> {
  const zIndex = kind === 'header' ? TABLE_FIXED_HEADER_Z_INDEX : TABLE_FIXED_CELL_Z_INDEX
  const fixed =
    columnKey in fixedInfo.startOffsets
      ? 'start'
      : columnKey in fixedInfo.endOffsets
        ? 'end'
        : undefined
  if (!fixed) return undefined
  return getFixedColumnStyle({ key: columnKey, fixed }, fixedInfo, zIndex)
}

export interface VirtualTableFixedCellClassOptions<T = Record<string, unknown>> {
  column: TableColumn<T>
  record: T
  rowIndex: number
  striped: boolean
  selected: boolean
  hoverable?: boolean
  fixedInfo: VirtualTableFixedInfo
}

export function getVirtualTableFixedCellClasses<T = Record<string, unknown>>(
  options: VirtualTableFixedCellClassOptions<T>
): string | undefined {
  return getTableFixedCellClasses({
    view: 'virtual-table',
    column: options.column,
    record: options.record,
    rowIndex: options.rowIndex,
    striped: options.striped,
    stripedActive: options.striped && options.rowIndex % 2 === 1,
    selected: options.selected,
    hoverable: options.hoverable ?? true,
    fixedInfo: options.fixedInfo,
    selectedClassName: virtualTableFixedCellSelectedClasses
  })
}

export function getVirtualTableFixedHeaderCellClasses<T = Record<string, unknown>>(
  column: TableColumn<T>,
  fixedInfo: VirtualTableFixedInfo,
  stickyHeader: boolean
): string | undefined {
  return getTableFixedHeaderCellClasses({
    view: 'virtual-table',
    column,
    stickyHeader,
    fixedInfo
  })
}

export function getVirtualTableFixedColumnPosition<T = Record<string, unknown>>(
  column: TableColumn<T>,
  fixedInfo: VirtualTableFixedInfo
) {
  return getFixedColumnPosition(column, fixedInfo)
}
