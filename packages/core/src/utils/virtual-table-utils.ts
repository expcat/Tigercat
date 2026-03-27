/**
 * VirtualTable utility functions
 *
 * Pure functions for virtual scroll calculation and styling.
 */

import type { VirtualTableRange } from '../types/virtual-table'

// ─── Tailwind class constants ─────────────────────────────────────

export const virtualTableContainerClasses =
  'tiger-virtual-table relative overflow-auto border border-[var(--tiger-border,#e5e7eb)] rounded-lg bg-[var(--tiger-bg,#ffffff)]'

export const virtualTableHeaderClasses =
  'sticky top-0 z-10 bg-[var(--tiger-bg-secondary,#f9fafb)] border-b border-[var(--tiger-border,#e5e7eb)]'

export const virtualTableHeaderCellClasses =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--tiger-text-secondary,#6b7280)]'

export const virtualTableRowClasses =
  'border-b border-[var(--tiger-border,#f3f4f6)] transition-colors'

export const virtualTableRowHoverClasses = 'hover:bg-[var(--tiger-bg-hover,#f9fafb)]'

export const virtualTableRowStripedClasses = 'bg-[var(--tiger-bg-secondary,#f9fafb)]/50'

export const virtualTableRowSelectedClasses = 'bg-[var(--tiger-primary,#2563eb)]/5'

export const virtualTableCellClasses =
  'px-4 py-3 text-sm text-[var(--tiger-text,#1f2937)] whitespace-nowrap'

export const virtualTableBorderedClasses =
  '[&_td]:border-r [&_th]:border-r [&_td:last-child]:border-r-0 [&_th:last-child]:border-r-0'

export const virtualTableEmptyClasses =
  'flex items-center justify-center py-12 text-sm text-[var(--tiger-text-muted,#9ca3af)]'

export const virtualTableLoadingClasses =
  'absolute inset-0 flex items-center justify-center bg-[var(--tiger-bg,#ffffff)]/60 z-20'

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
  if (totalRows === 0 || rowHeight <= 0) {
    return { start: 0, end: 0, offsetTop: 0, totalHeight: 0 }
  }

  const totalHeight = totalRows * rowHeight

  const startRaw = Math.floor(scrollTop / rowHeight)
  const visibleCount = Math.ceil(viewportHeight / rowHeight)

  const start = Math.max(0, startRaw - overscan)
  const end = Math.min(totalRows, startRaw + visibleCount + overscan)

  const offsetTop = start * rowHeight

  return { start, end, offsetTop, totalHeight }
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
