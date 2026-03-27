/**
 * VirtualTable types — high-performance table for very large datasets.
 *
 * Unlike Table's `virtual` mode (which adds basic windowing),
 * VirtualTable is optimized from the ground up for 10K+ rows,
 * with fixed headers, column virtualization, and overscan support.
 */

import type { TableColumn } from './table'

export interface VirtualTableProps<T = Record<string, unknown>> {
  /** Data rows */
  data: T[]
  /** Column definitions — reuses Table's TableColumn type */
  columns: TableColumn<T>[]
  /** Fixed row height in px (required for accurate virtualization) */
  rowHeight?: number
  /** Viewport height in px */
  height?: number
  /** Viewport width in px or auto */
  width?: number | 'auto'
  /** Number of extra rows rendered above/below viewport */
  overscan?: number
  /** Enable fixed (sticky) header */
  stickyHeader?: boolean
  /** Enable horizontal column virtualization */
  virtualizeColumns?: boolean
  /** Unique row key field */
  rowKey?: keyof T | ((row: T, index: number) => string | number)
  /** Row class name */
  rowClassName?: string | ((row: T, index: number) => string)
  /** Loading state */
  loading?: boolean
  /** Empty state text */
  emptyText?: string
  /** Enable row selection */
  selectable?: boolean
  /** Selected row keys (controlled) */
  selectedKeys?: (string | number)[]
  /** Striped rows */
  striped?: boolean
  /** Bordered variant */
  bordered?: boolean
  /** Additional CSS class */
  className?: string
}

export interface VirtualTableRange {
  /** Start index (inclusive) */
  start: number
  /** End index (exclusive) */
  end: number
  /** Offset in px from top for first visible row */
  offsetTop: number
  /** Total scrollable height in px */
  totalHeight: number
}
