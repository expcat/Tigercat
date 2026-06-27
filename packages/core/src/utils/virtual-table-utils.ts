/**
 * VirtualTable utility functions
 *
 * Pure functions for virtual scroll calculation and styling.
 */

import type { VirtualTableRange } from '../types/virtual-table'
import type { TableColumn } from '../types/table'
import {
  getFixedColumnOffsets,
  getTableFixedCellClasses,
  getTableFixedHeaderCellClasses,
  getFixedColumnPosition,
  tableHeaderBackgroundClasses
} from './table-utils'

// ─── Tailwind class constants ─────────────────────────────────────

export const virtualTableContainerClasses = `tiger-virtual-table relative overflow-auto border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-bg,var(--tiger-surface,#ffffff))))]`

export const virtualTableHeaderClasses = `${tableHeaderBackgroundClasses} sticky top-0 z-10 border-b border-[var(--tiger-border,#e5e7eb)]`

export const virtualTableHeaderCellClasses =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--tiger-text-secondary,#6b7280)]'

export const virtualTableRowClasses =
  'group border-b border-[var(--tiger-border,#f3f4f6)] transition-colors'

export const virtualTableRowHoverClasses =
  'hover:bg-[var(--tiger-table-hover-bg,var(--tiger-component-table-hover-bg,var(--tiger-bg-hover,var(--tiger-surface-muted,#f9fafb))))] transition-colors'

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
  'px-4 py-3 text-sm text-[var(--tiger-text,#1f2937)] whitespace-nowrap'

export const virtualTableBorderedClasses =
  '[&_td]:border-r [&_th]:border-r [&_td:last-child]:border-r-0 [&_th:last-child]:border-r-0'

export const virtualTableEmptyClasses =
  'flex items-center justify-center py-12 text-sm text-[var(--tiger-text-muted,#9ca3af)]'

export const virtualTableLoadingClasses =
  'absolute inset-0 flex items-center justify-center bg-[var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-bg,var(--tiger-surface,#ffffff))))]/60 z-20'

// ─── Virtual range calculation ────────────────────────────────────

/**
 * Calculate the visible range of rows based on scroll position.
 */
export function calculateVirtualRange(
  scrollTop: number,
  viewportHeight: number,
  totalRows: number,
  rowHeight: number,
  overscan: number = 5
): VirtualTableRange {
  const safeTotalRows = Number.isFinite(totalRows) ? Math.max(0, Math.floor(totalRows)) : 0
  const safeRowHeight = Number.isFinite(rowHeight) ? rowHeight : 0
  const safeViewportHeight = Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0
  const safeScrollTop = Number.isFinite(scrollTop) ? Math.max(0, scrollTop) : 0
  const safeOverscan = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0

  if (safeTotalRows === 0 || safeRowHeight <= 0 || safeViewportHeight <= 0) {
    return { start: 0, end: 0, offsetTop: 0, totalHeight: 0 }
  }

  const totalHeight = safeTotalRows * safeRowHeight

  const startRaw = Math.floor(safeScrollTop / safeRowHeight)
  const visibleCount = Math.ceil(safeViewportHeight / safeRowHeight)

  const start = Math.max(0, Math.min(safeTotalRows, startRaw - safeOverscan))
  const end = Math.max(start, Math.min(safeTotalRows, startRaw + visibleCount + safeOverscan))

  const offsetTop = start * safeRowHeight

  return { start, end, offsetTop, totalHeight }
}

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
  if (count === 0 || viewportWidth <= 0) {
    return { start: 0, end: count, leftPad: 0, rightPad: 0 }
  }
  const safeScrollLeft = Math.max(0, Number.isFinite(scrollLeft) ? scrollLeft : 0)
  const safeOverscan = Math.max(0, Math.floor(overscan))

  let acc = 0
  let rawStart = 0
  for (let i = 0; i < count; i++) {
    if (acc + columnWidths[i] > safeScrollLeft) {
      rawStart = i
      break
    }
    acc += columnWidths[i]
    if (i === count - 1) rawStart = count - 1
  }

  const viewEnd = safeScrollLeft + viewportWidth
  let endExclusive = rawStart
  let endAcc = acc
  while (endExclusive < count && endAcc < viewEnd) {
    endAcc += columnWidths[endExclusive]
    endExclusive++
  }

  const start = Math.max(0, rawStart - safeOverscan)
  const end = Math.min(count, endExclusive + safeOverscan)

  let leftPad = 0
  for (let i = 0; i < start; i++) leftPad += columnWidths[i]
  let rightPad = 0
  for (let i = end; i < count; i++) rightPad += columnWidths[i]

  return { start, end, leftPad, rightPad }
}

/**
 * Get the row key for a virtual table data item.
 */
export function getVirtualRowKey<T>(
  row: T,
  index: number,
  rowKey?: keyof T | ((row: T, index: number) => string | number)
): string | number {
  if (!rowKey) return index
  if (typeof rowKey === 'function') return rowKey(row, index)
  return row[rowKey] as unknown as string | number
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
}

/**
 * Compute fixed column offsets for VirtualTable.
 * Thin wrapper around Table's `getFixedColumnOffsets`.
 */
export function getVirtualTableFixedInfo<T = Record<string, unknown>>(
  columns: TableColumn<T>[]
): VirtualTableFixedInfo {
  const { leftOffsets, rightOffsets, hasFixedColumns } = getFixedColumnOffsets(columns)
  return { leftOffsets, rightOffsets, hasFixedColumns }
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
