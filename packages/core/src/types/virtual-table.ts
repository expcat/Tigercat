/**
 * VirtualTable is Table with the virtual strategy. It is not a second table.
 */

import type { ExclusiveVirtualRange } from './virtual-list'
import type { RowSelectionConfig, TableColumn } from './table'

export interface VirtualTableHandle {
  scrollToIndex: (index: number) => void
}

export interface VirtualTableProps<T = Record<string, unknown>> {
  /** Data rows */
  dataSource?: T[]
  /**
   * Column definitions. Reads `key` / `title` / `width` / `dataKey` / `fixed` /
   * `render` / `renderHeader` / `align`. Sort and filter are Table columns.
   */
  columns?: TableColumn<T>[]
  /**
   * Fixed row height in px used by the window. Content is not clipped.
   * @default 48
   */
  virtualItemHeight?: number
  /**
   * Viewport height in px
   * @default 400
   */
  virtualHeight?: number
  /**
   * Viewport width in px or auto. Column virtualization requires a number.
   * @default 'auto'
   */
  width?: number | 'auto'
  /** Number of extra rows rendered above/below viewport */
  overscan?: number
  /** Enable fixed (sticky) header */
  stickyHeader?: boolean
  /**
   * Enable horizontal column virtualization. Requires a numeric `width` and
   * no fixed columns; otherwise the table warns and renders every column.
   */
  virtualizeColumns?: boolean
  /**
   * Unique row key field. Defaults to `id`, matching Table.
   * Missing identities are not used for selection.
   * @default 'id'
   */
  rowKey?: keyof T | ((row: T, index: number) => string | number)
  /** Row class name */
  rowClassName?: string | ((row: T, index: number) => string)
  /** Loading state */
  loading?: boolean
  /** Empty state text */
  emptyText?: string
  /**
   * Row selection. Clicking a row toggles it; there is no checkbox column.
   * Cell controls must stop click from bubbling if they should not select.
   * `undefined` is uncontrolled; an array (including `[]`) is controlled.
   */
  rowSelection?: RowSelectionConfig<T>
  /** Fired when row selection changes. VirtualTable forwards this to Table. */
  onSelectionChange?: (selectedKeys: (string | number)[]) => void
  /** Striped rows */
  striped?: boolean
  /** Bordered variant */
  bordered?: boolean
  /** Additional CSS class */
  className?: string
}

/** Exclusive `[start, end)` row window. Same arithmetic as VirtualList / Table. */
export type VirtualTableRange = ExclusiveVirtualRange
