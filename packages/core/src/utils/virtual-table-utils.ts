/**
 * VirtualTable utility functions
 *
 * Pure functions for virtual scroll calculation and styling.
 */

import type { TableColumn } from '../types/table'
import type { ExclusiveVirtualRange } from '../types/virtual-list'
import { calculateVirtualRange } from './virtual-list-utils'
import { devWarn } from './dev-warn'
import {
  getFixedColumnOffsets,
  getFixedColumnPosition,
  getNextTableSelectAllKeys,
  getTableFixedCellClasses,
  getTableFixedHeaderCellClasses,
  parseWidthToPx,
  tableHeaderBackgroundClasses,
  tableVirtualSpacerCellClasses
} from './table-utils'

/** Fallback column width (px) when a column has no resolvable `width`. */
export const DEFAULT_VIRTUAL_COLUMN_WIDTH = 150

/** Assumed sticky header row height subtracted from the row viewport. */
export const VIRTUAL_TABLE_HEADER_ROW_HEIGHT = 40

export const EMPTY_VIRTUAL_TABLE_ROWS: readonly never[] = Object.freeze([])
export const EMPTY_VIRTUAL_TABLE_COLUMNS: readonly never[] = Object.freeze([])

export { tableVirtualSpacerCellClasses }

// ─── Tailwind class constants ─────────────────────────────────────

export const virtualTableContainerClasses = `tiger-virtual-table relative overflow-auto border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-bg,var(--tiger-surface,#ffffff))))]`

export const virtualTableHeaderClasses = `${tableHeaderBackgroundClasses} sticky top-0 z-10 [&_th]:border-b [&_th]:border-[var(--tiger-border,#e5e7eb)]`

export const virtualTableHeaderCellClasses =
  'px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-[var(--tiger-text-secondary,#6b7280)] overflow-hidden'

export const virtualTableRowClasses =
  'group tiger-motion-aware [&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-[var(--tiger-border,#f3f4f6)]'

export const virtualTableRowHoverClasses =
  'hover:bg-[var(--tiger-table-hover-bg,var(--tiger-component-table-hover-bg,var(--tiger-bg-hover,var(--tiger-surface-muted,#f9fafb))))]'

export const virtualTableRowFocusClasses =
  'outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'

export const virtualTableRowStripedClasses =
  'bg-[var(--tiger-table-stripe-bg,var(--tiger-component-table-stripe-bg,var(--tiger-bg-secondary,var(--tiger-surface-muted,#f9fafb))))]/50'

export const virtualTableRowSelectedClasses = 'bg-[var(--tiger-primary,#2563eb)]/5'

/**
 * Opaque selected background for sticky fixed cells.
 *
 * Fixed cells float above other columns, so the translucent
 * `virtualTableRowSelectedClasses` would let underlying content show through
 * while scrolling horizontally. color-mix yields the same visual color as the
 * 5% primary overlay sitting on the table background.
 */
export const virtualTableFixedCellSelectedClasses =
  'bg-[color-mix(in_srgb,var(--tiger-primary,#2563eb)_5%,var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-bg,var(--tiger-surface,#ffffff)))))]'

export const virtualTableCellClasses =
  'px-4 py-0 text-sm text-[var(--tiger-text,#1f2937)] whitespace-nowrap overflow-hidden'

export const virtualTableBorderedClasses =
  '[&_td]:border-r [&_th]:border-r [&_td:last-child]:border-r-0 [&_th:last-child]:border-r-0'

export const virtualTableEmptyClasses =
  'absolute inset-0 flex items-center justify-center py-12 text-sm text-[var(--tiger-text-muted,#9ca3af)]'

export const virtualTableLoadingClasses =
  'absolute inset-0 flex items-center justify-center bg-[var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-bg,var(--tiger-surface,#ffffff))))]/60 z-20'

/** Visible column window for horizontal (column) virtualization. */
export interface VirtualColumnRange {
  /** Start column index (inclusive) */
  start: number
  /** End column index (exclusive) */
  end: number
  /** Spacer width (px) before the rendered columns */
  leftPad: number
  /** Spacer width (px) after the rendered columns */
  rightPad: number
}

/**
 * Compute the visible column window for horizontal column virtualization.
 *
 * Columns without a numeric `width` fall back to `defaultColumnWidth`. Returns
 * the column index range to render plus left/right spacer widths so the table
 * keeps its full horizontal extent.
 */
export function calculateVirtualColumnRange(
  scrollLeft: number,
  viewportWidth: number,
  columnWidths: number[],
  overscan = 2
): VirtualColumnRange {
  const count = columnWidths.length
  const safeViewportWidth = Number.isFinite(viewportWidth) ? Math.max(0, viewportWidth) : 0
  const safeScrollLeft = Number.isFinite(scrollLeft) ? Math.max(0, scrollLeft) : 0
  const safeOverscan = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0
  const widths = columnWidths.map((width) => (Number.isFinite(width) && width > 0 ? width : 0))

  if (count === 0 || safeViewportWidth <= 0) {
    return { start: 0, end: 0, leftPad: 0, rightPad: 0 }
  }

  let acc = 0
  let rawStart = 0
  for (let i = 0; i < count; i++) {
    if (acc + widths[i] > safeScrollLeft) {
      rawStart = i
      break
    }
    acc += widths[i]
    if (i === count - 1) rawStart = count - 1
  }

  const viewEnd = safeScrollLeft + safeViewportWidth
  let endExclusive = rawStart
  let endAcc = acc
  while (endExclusive < count && endAcc < viewEnd) {
    endAcc += widths[endExclusive]
    endExclusive++
  }

  const start = Math.max(0, rawStart - safeOverscan)
  const end = Math.min(count, endExclusive + safeOverscan)

  let leftPad = 0
  for (let i = 0; i < start; i++) leftPad += widths[i]
  let rightPad = 0
  for (let i = end; i < count; i++) rightPad += widths[i]

  return { start, end, leftPad, rightPad }
}

export function getVirtualTableColumnWidths<T>(
  columns: TableColumn<T>[],
  defaultWidth = DEFAULT_VIRTUAL_COLUMN_WIDTH
): number[] {
  return columns.map((column) => {
    const parsed = parseWidthToPx(column.width)
    return parsed > 0 ? parsed : defaultWidth
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
  width?: number | 'auto' | string
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
  if (typeof input.width !== 'number' || !Number.isFinite(input.width) || input.width <= 0) {
    devWarn(
      'VirtualTable.virtualizeColumns.width',
      'Column virtualization needs a numeric width and no fixed columns'
    )
    return { active: false, viewportWidth: 0 }
  }
  return { active: true, viewportWidth: input.width }
}

export function getVirtualTableRowWindow(
  scrollTop: number,
  viewportHeight: number,
  rowCount: number,
  itemHeight: number,
  overscan: number,
  headerHeight = VIRTUAL_TABLE_HEADER_ROW_HEIGHT
): ExclusiveVirtualRange {
  const rowViewport = Math.max(0, viewportHeight - Math.max(0, headerHeight))
  return calculateVirtualRange(scrollTop, rowViewport, rowCount, itemHeight, overscan)
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
 * Resolve row identity. Default field is `id`, matching Table.
 * Missing keys are not turned into window indexes for selection.
 */
export function resolveVirtualTableRowIdentity<T>(
  row: T,
  index: number,
  rowKey?: keyof T | ((row: T, index: number) => string | number)
): VirtualTableRowIdentity {
  const resolved = rowKey ?? ('id' as keyof T)
  if (typeof resolved === 'function') {
    const key = resolved(row, index)
    return { key, domKey: key }
  }

  const value = (row as Record<string, unknown>)[String(resolved)]
  if (typeof value === 'string' || typeof value === 'number') {
    return { key: value, domKey: value }
  }

  devWarn(
    'VirtualTable.rowKey',
    `Row at index ${index} has no "${String(resolved)}" identity; selection is skipped`
  )
  return { key: undefined, domKey: index }
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
  if (input.type === 'radio') return [input.key]
  return getNextTableSelectAllKeys(
    input.selectedKeys,
    [input.key],
    !input.selectedKeys.includes(input.key)
  )
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
  leftOffsets: Record<string, number>
  rightOffsets: Record<string, number>
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
  const { leftOffsets, rightOffsets, hasFixedColumns, minTableWidth } =
    getFixedColumnOffsets(columns)
  return { leftOffsets, rightOffsets, hasFixedColumns, minTableWidth }
}

/**
 * Get inline style for a fixed column cell (th or td).
 * Returns `undefined` when the column is not fixed.
 */
export function getVirtualTableFixedCellStyle(
  columnKey: string,
  fixedInfo: VirtualTableFixedInfo
): { position: 'sticky'; left?: string; right?: string; zIndex: number } | undefined {
  if (columnKey in fixedInfo.leftOffsets) {
    return {
      position: 'sticky' as const,
      left: `${fixedInfo.leftOffsets[columnKey]}px`,
      zIndex: 1
    }
  }
  if (columnKey in fixedInfo.rightOffsets) {
    return {
      position: 'sticky' as const,
      right: `${fixedInfo.rightOffsets[columnKey]}px`,
      zIndex: 1
    }
  }
  return undefined
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
