/**
 * Table component utilities and styling functions
 */

import { classNames } from './class-names'
import type {
  TableSize,
  ColumnAlign,
  SortDirection,
  TableColumn,
  TableResponsiveMode,
  TableCardBreakpoint,
  TableFixedCellClassNameContext,
  TableFixedHeaderClassNameContext,
  TableFixedPosition,
  TableCardLayoutItem
} from '../types/table'

/**
 * Base table container classes
 */
export const tableContainerClasses = 'relative w-full overflow-auto'

/**
 * Base table classes
 */
export const tableBaseClasses = 'w-full border-collapse'

export const tableResponsiveTableClasses = 'max-sm:min-w-max'

export const tableResponsiveCardListClasses = 'hidden max-sm:grid max-sm:gap-3 max-sm:p-3'

/**
 * Static breakpoint → class maps for responsive card mode.
 *
 * Tailwind's JIT compiler only sees literal class strings, so each breakpoint
 * must be spelled out in full — never build `max-${bp}:hidden` dynamically.
 */
const CARD_HIDE_CLASSES: Record<TableCardBreakpoint, string> = {
  sm: 'max-sm:hidden',
  md: 'max-md:hidden',
  lg: 'max-lg:hidden'
}

const CARD_MINW_CLASSES: Record<TableCardBreakpoint, string> = {
  sm: 'max-sm:min-w-max',
  md: 'max-md:min-w-max',
  lg: 'max-lg:min-w-max'
}

const CARD_LIST_CLASSES: Record<TableCardBreakpoint, string> = {
  sm: 'hidden max-sm:grid max-sm:gap-3 max-sm:p-3',
  md: 'hidden max-md:grid max-md:gap-3 max-md:p-3',
  lg: 'hidden max-lg:grid max-lg:gap-3 max-lg:p-3'
}

export const tableResponsiveCardClasses =
  'rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] p-3 shadow-sm'

export const tableResponsiveCardRowClasses =
  'grid grid-cols-[minmax(7rem,40%)_1fr] gap-3 border-b border-[var(--tiger-border,#e5e7eb)] py-2 last:border-b-0'

export const tableResponsiveCardLabelClasses =
  'text-xs font-medium uppercase tracking-wider text-[var(--tiger-text-muted,#6b7280)]'

export const tableResponsiveCardValueClasses =
  'min-w-0 text-sm text-[var(--tiger-text,#111827)] break-words'

export const tableResponsiveCardTitleClasses =
  'mb-2 text-sm font-semibold text-[var(--tiger-text,#111827)] break-words'

export const tableBackgroundClasses =
  'bg-[var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-surface,#ffffff)))]'

export const tableHeaderBackgroundClasses =
  'bg-[var(--tiger-table-header-bg,var(--tiger-component-table-header-bg,var(--tiger-surface-muted,#f9fafb)))]'

export const tableRowHoverClasses =
  'hover:bg-[var(--tiger-table-hover-bg,var(--tiger-component-table-hover-bg,var(--tiger-surface-muted,#f9fafb)))] transition-colors'

export const tableRowGroupHoverClasses =
  'group-hover:bg-[var(--tiger-table-hover-bg,var(--tiger-component-table-hover-bg,var(--tiger-surface-muted,#f9fafb)))]'

export const tableRowStripedClasses =
  'bg-[var(--tiger-table-stripe-bg,var(--tiger-component-table-stripe-bg,var(--tiger-surface-muted,#f9fafb)))]/50'

/**
 * Opaque striped background for sticky fixed cells.
 *
 * Fixed cells float above other columns, so the translucent
 * `tableRowStripedClasses` would let underlying content show through while
 * scrolling horizontally. color-mix yields the same visual color as the
 * 50% stripe overlay sitting on the table background.
 */
export const tableFixedCellStripedClasses =
  'bg-[color-mix(in_srgb,var(--tiger-table-stripe-bg,var(--tiger-component-table-stripe-bg,var(--tiger-surface-muted,#f9fafb)))_50%,var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-surface,#ffffff))))]'

export function getTableResponsiveTableClasses(
  mode: TableResponsiveMode,
  breakpoint: TableCardBreakpoint = 'sm'
): string {
  return mode === 'card' ? CARD_HIDE_CLASSES[breakpoint] : CARD_MINW_CLASSES[breakpoint]
}

/**
 * Resolve the card-list container classes for the configured breakpoint.
 */
export function getTableResponsiveCardListClasses(breakpoint: TableCardBreakpoint = 'sm'): string {
  return CARD_LIST_CLASSES[breakpoint]
}

/**
 * Split visible columns into the card heading column and the body columns.
 *
 * - Columns flagged `hideInCard` are dropped entirely.
 * - The first remaining column flagged `cardTitle` becomes the heading.
 * - Body columns are ordered by `cardPriority` (ascending); columns without a
 *   priority keep their original relative order (Array.sort is stable).
 */
export interface CardColumnLayout<T = Record<string, unknown>> {
  titleColumn?: TableColumn<T>
  bodyColumns: TableColumn<T>[]
}

export function getCardColumns<T = Record<string, unknown>>(
  columns: TableColumn<T>[]
): CardColumnLayout<T> {
  const visible = columns.filter((column) => !column.hideInCard)
  const titleColumn = visible.find((column) => column.cardTitle)
  const bodyColumns = visible
    .filter((column) => column !== titleColumn)
    .sort(
      (a, b) =>
        (a.cardPriority ?? Number.POSITIVE_INFINITY) - (b.cardPriority ?? Number.POSITIVE_INFINITY)
    )

  return { titleColumn, bodyColumns }
}

/**
 * Filter out columns whose key is listed in `hiddenKeys`.
 *
 * Returns the original array reference when no key matches, so memoized
 * consumers (fixed-column offsets, card layout) keep referential stability.
 */
export function filterHiddenColumns<T = Record<string, unknown>>(
  columns: TableColumn<T>[],
  hiddenKeys?: readonly string[]
): TableColumn<T>[] {
  if (!hiddenKeys || hiddenKeys.length === 0) {
    return columns
  }
  const hidden = new Set(hiddenKeys)
  const visible = columns.filter((column) => !hidden.has(column.key))
  return visible.length === columns.length ? columns : visible
}

/**
 * Parse a column width into a pixel number.
 *
 * Notes:
 * - Returns 0 when width is undefined or not a pixel value.
 * - For sticky/fixed columns, a numeric (or px string) width is recommended.
 */
export function parseWidthToPx(width?: string | number): number {
  if (typeof width === 'number' && Number.isFinite(width)) {
    return width
  }

  if (typeof width === 'string') {
    const trimmed = width.trim()
    const match = trimmed.match(/^(\d+(?:\.\d+)?)(px)?$/)
    if (match) {
      return Number(match[1])
    }
  }

  return 0
}

/**
 * Calculate sticky offsets for fixed columns.
 */
export function getFixedColumnOffsets<T = Record<string, unknown>>(
  columns: TableColumn<T>[],
  measuredColumnWidths: Record<string, number> = {}
): {
  leftOffsets: Record<string, number>
  rightOffsets: Record<string, number>
  minTableWidth: number
  hasFixedColumns: boolean
} {
  const leftOffsets: Record<string, number> = {}
  const rightOffsets: Record<string, number> = {}
  let hasLeftFixedColumns = false
  let hasRightFixedColumns = false

  let left = 0
  for (const column of columns) {
    if (column.fixed === 'left') {
      leftOffsets[column.key] = left
      hasLeftFixedColumns = true
    }
    left += measuredColumnWidths[column.key] || parseWidthToPx(column.width)
  }

  let right = 0
  for (let i = columns.length - 1; i >= 0; i--) {
    const column = columns[i]
    if (column.fixed === 'right') {
      rightOffsets[column.key] = right
      hasRightFixedColumns = true
    }
    right += measuredColumnWidths[column.key] || parseWidthToPx(column.width)
  }

  const minTableWidth = columns.reduce(
    (sum, col) => sum + (measuredColumnWidths[col.key] || parseWidthToPx(col.width)),
    0
  )
  const hasFixedColumns = hasLeftFixedColumns || hasRightFixedColumns

  return { leftOffsets, rightOffsets, minTableWidth, hasFixedColumns }
}

export interface TableFixedColumnStyle {
  position: 'sticky'
  left?: string
  right?: string
  zIndex: number
}

export interface TableFixedColumnOffsetInfo {
  leftOffsets: Record<string, number>
  rightOffsets: Record<string, number>
}

export function getFixedColumnPosition<T = Record<string, unknown>>(
  column: Pick<TableColumn<T>, 'key' | 'fixed'>,
  fixedInfo: TableFixedColumnOffsetInfo
): TableFixedPosition | undefined {
  if (column.fixed === 'left' || column.key in fixedInfo.leftOffsets) {
    return 'left'
  }

  if (column.fixed === 'right' || column.key in fixedInfo.rightOffsets) {
    return 'right'
  }

  return undefined
}

export function getFixedColumnStyle<T = Record<string, unknown>>(
  column: Pick<TableColumn<T>, 'key' | 'fixed'>,
  fixedInfo: TableFixedColumnOffsetInfo,
  zIndex: number
): TableFixedColumnStyle | undefined {
  const fixed = getFixedColumnPosition(column, fixedInfo)
  if (fixed === 'left') {
    return {
      position: 'sticky',
      left: `${fixedInfo.leftOffsets[column.key] || 0}px`,
      zIndex
    }
  }

  if (fixed === 'right') {
    return {
      position: 'sticky',
      right: `${fixedInfo.rightOffsets[column.key] || 0}px`,
      zIndex
    }
  }

  return undefined
}

function resolveFixedCellClassName<T = Record<string, unknown>>(
  column: TableColumn<T>,
  context: TableFixedCellClassNameContext<T>
): string | undefined {
  if (typeof column.fixedClassName === 'function') {
    return column.fixedClassName(context) || undefined
  }

  return column.fixedClassName || undefined
}

function resolveFixedHeaderClassName<T = Record<string, unknown>>(
  column: TableColumn<T>,
  context: TableFixedHeaderClassNameContext<T>
): string | undefined {
  if (typeof column.fixedHeaderClassName === 'function') {
    return column.fixedHeaderClassName(context) || undefined
  }

  return column.fixedHeaderClassName || undefined
}

export interface TableFixedCellClassOptions<T = Record<string, unknown>> {
  view: 'table' | 'virtual-table'
  column: TableColumn<T>
  record: T
  rowIndex: number
  striped: boolean
  stripedActive: boolean
  selected: boolean
  hoverable: boolean
  fixedInfo: TableFixedColumnOffsetInfo
  selectedClassName?: string
}

export function getTableFixedCellClasses<T = Record<string, unknown>>(
  options: TableFixedCellClassOptions<T>
): string | undefined {
  const fixed = getFixedColumnPosition(options.column, options.fixedInfo)
  if (!fixed) return undefined

  const context: TableFixedCellClassNameContext<T> = {
    view: options.view,
    column: options.column,
    fixed,
    record: options.record,
    rowIndex: options.rowIndex,
    striped: options.striped,
    selected: options.selected,
    hoverable: options.hoverable
  }

  return classNames(
    options.stripedActive ? tableFixedCellStripedClasses : tableBackgroundClasses,
    options.hoverable && tableRowGroupHoverClasses,
    options.selected && options.selectedClassName,
    resolveFixedCellClassName(options.column, context)
  )
}

export interface TableFixedHeaderClassOptions<T = Record<string, unknown>> {
  view: 'table' | 'virtual-table'
  column: TableColumn<T>
  stickyHeader: boolean
  fixedInfo: TableFixedColumnOffsetInfo
}

export function getTableFixedHeaderCellClasses<T = Record<string, unknown>>(
  options: TableFixedHeaderClassOptions<T>
): string | undefined {
  const fixed = getFixedColumnPosition(options.column, options.fixedInfo)
  if (!fixed) return undefined

  const context: TableFixedHeaderClassNameContext<T> = {
    view: options.view,
    column: options.column,
    fixed,
    stickyHeader: options.stickyHeader
  }

  return classNames(
    tableHeaderBackgroundClasses,
    resolveFixedHeaderClassName(options.column, context)
  )
}

export const TABLE_VIRTUAL_RECOMMENDATION_THRESHOLD = 1000
export const TABLE_AUTO_VIRTUAL_THRESHOLD = 10000

export interface TableVirtualRecommendationOptions {
  virtual?: boolean
  autoVirtual?: boolean
  dataLength: number
  threshold?: number
  autoThreshold?: number
}

export interface TableVirtualRecommendation {
  enabled: boolean
  autoEnabled: boolean
  recommended: boolean
  threshold: number
  autoThreshold: number
  dataLength: number
}

/**
 * Resolve the public Table virtual strategy.
 *
 * Table stays opt-in for virtualization to avoid surprising layout changes.
 * Large data sets surface a recommendation that consumers can inspect and use
 * to switch to `virtual` or the dedicated `VirtualTable` component.
 */
export function getTableVirtualRecommendation(
  options: TableVirtualRecommendationOptions
): TableVirtualRecommendation {
  const threshold = options.threshold ?? TABLE_VIRTUAL_RECOMMENDATION_THRESHOLD
  const autoThreshold = options.autoThreshold ?? TABLE_AUTO_VIRTUAL_THRESHOLD
  const autoEnabled =
    options.virtual !== true && options.autoVirtual !== false && options.dataLength >= autoThreshold
  const enabled = options.virtual === true || autoEnabled

  return {
    enabled,
    autoEnabled,
    recommended: !enabled && options.dataLength >= threshold,
    threshold,
    autoThreshold,
    dataLength: options.dataLength
  }
}

/**
 * Get table wrapper classes
 */
export function getTableWrapperClasses(bordered: boolean, maxHeight?: string | number): string {
  return classNames(
    'relative',
    tableContainerClasses,
    bordered &&
      'border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] overflow-hidden',
    maxHeight && 'overflow-y-auto'
  )
}

/**
 * Get table header classes
 */
export function getTableHeaderClasses(stickyHeader: boolean): string {
  return classNames(
    tableHeaderBackgroundClasses,
    'border-b border-[var(--tiger-border,#e5e7eb)]',
    stickyHeader && 'sticky top-0 z-10'
  )
}

/**
 * Get table header cell classes
 */
export function getTableHeaderCellClasses(
  size: TableSize,
  align: ColumnAlign,
  sortable: boolean,
  customClassName?: string
): string {
  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return classNames(
    'font-medium text-[var(--tiger-text-muted,#6b7280)] text-xs uppercase tracking-wider',
    paddingClasses[size],
    alignClasses[align],
    sortable &&
      'cursor-pointer select-none hover:bg-[var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-surface,#ffffff)))]/60 transition-colors',
    customClassName
  )
}

/**
 * Get table body row classes
 */
export function getTableRowClasses(
  hoverable: boolean,
  striped: boolean,
  isEven: boolean,
  customClassName?: string
): string {
  return classNames(
    'border-b border-[var(--tiger-border,#e5e7eb)] last:border-b-0',
    hoverable && tableRowHoverClasses,
    striped && isEven && tableRowStripedClasses,
    customClassName
  )
}

/**
 * Get table cell classes
 */
export function getTableCellClasses(
  size: TableSize,
  align: ColumnAlign,
  customClassName?: string
): string {
  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return classNames(
    'text-sm text-[var(--tiger-text,#111827)]',
    paddingClasses[size],
    alignClasses[align],
    customClassName
  )
}

/**
 * Get sort icon classes
 */
export function getSortIconClasses(active: boolean): string {
  return classNames(
    'inline-block ml-1 transition-colors',
    active ? 'text-[var(--tiger-primary,#2563eb)]' : 'text-gray-400'
  )
}

/**
 * Get empty state classes
 */
export const tableEmptyStateClasses = 'text-center py-12 text-[var(--tiger-text-muted,#6b7280)]'

/**
 * Get loading overlay classes
 */
export const tableLoadingOverlayClasses = classNames(
  'absolute inset-0 bg-[var(--tiger-surface,#ffffff)]/80 flex items-center justify-center z-20'
)

/**
 * Get checkbox cell classes
 */
export function getCheckboxCellClasses(size: TableSize): string {
  const widthClasses = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12'
  }

  return classNames('text-center', widthClasses[size])
}

/**
 * Default sort function for comparable values
 */
export function defaultSortFn(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b)
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }

  return String(a).localeCompare(String(b))
}

/**
 * Sort data array by column
 */
export function sortData<T>(
  data: T[],
  key: string,
  direction: SortDirection,
  sortFn?: (a: unknown, b: unknown) => number
): T[] {
  if (!direction || !key) {
    return data
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = (a as Record<string, unknown>)[key]
    const bValue = (b as Record<string, unknown>)[key]

    const compareResult = sortFn ? sortFn(aValue, bValue) : defaultSortFn(aValue, bValue)

    return direction === 'asc' ? compareResult : -compareResult
  })

  return sortedData
}

/**
 * Filter data array by filter values
 */
export function filterData<T>(data: T[], filters: Record<string, unknown>): T[] {
  if (!filters || Object.keys(filters).length === 0) {
    return data
  }

  return data.filter((record) => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (filterValue === '' || filterValue === null || filterValue === undefined) {
        return true
      }

      const cellValue = (record as Record<string, unknown>)[key]

      if (typeof filterValue === 'string') {
        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase())
      }

      return cellValue === filterValue
    })
  })
}

/**
 * Paginate data array
 */
export function paginateData<T>(data: T[], current: number, pageSize: number): T[] {
  const startIndex = (current - 1) * pageSize
  const endIndex = startIndex + pageSize
  return data.slice(startIndex, endIndex)
}

/**
 * Calculate pagination info
 */
export function calculatePagination(
  total: number,
  current: number,
  pageSize: number
): {
  totalPages: number
  startIndex: number
  endIndex: number
  hasNext: boolean
  hasPrev: boolean
} {
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (current - 1) * pageSize + 1
  const endIndex = Math.min(current * pageSize, total)

  return {
    totalPages,
    startIndex,
    endIndex,
    hasNext: current < totalPages,
    hasPrev: current > 1
  }
}

/**
 * Get expand icon cell classes (column width for the expand toggle).
 * Reuses checkbox cell sizing since both are narrow action columns.
 */
export function getExpandIconCellClasses(size: TableSize): string {
  return getCheckboxCellClasses(size)
}

/**
 * Get expand icon button/svg classes
 */
export function getExpandIconClasses(expanded: boolean): string {
  return classNames(
    'inline-block transition-transform duration-200 cursor-pointer text-[var(--tiger-text-muted,#6b7280)]',
    expanded && 'rotate-90'
  )
}

/**
 * Get expanded row <tr> classes
 */
export function getExpandedRowClasses(): string {
  return classNames(
    'border-b border-[var(--tiger-border,#e5e7eb)] last:border-b-0',
    'bg-[var(--tiger-surface-muted,#f9fafb)]/30'
  )
}

/**
 * Get expanded row content <td> classes
 */
export function getExpandedRowContentClasses(size: TableSize): string {
  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  }

  return classNames('text-sm text-[var(--tiger-text,#111827)]', paddingClasses[size])
}

/**
 * Get row key from record
 */
export function getRowKey<T>(
  record: T,
  rowKey: string | ((record: T) => string | number),
  index: number
): string | number {
  if (typeof rowKey === 'function') {
    return rowKey(record)
  }

  const key = (record as Record<string, unknown>)[rowKey]

  if (key !== undefined && key !== null) {
    return key as string | number
  }

  return index
}

export interface TableRowKeyCache<T> {
  get: (record: T, index: number) => string | number
  getMany: (records: T[], indexOffset?: number) => (string | number)[]
}

/**
 * Create a scoped row-key resolver for one Table derivation pass.
 */
export function createTableRowKeyCache<T>(
  rowKey: string | ((record: T) => string | number)
): TableRowKeyCache<T> {
  const explicitKeyCache = new WeakMap<object, string | number>()

  function get(record: T, index: number): string | number {
    const objectRecord =
      typeof record === 'object' && record !== null ? (record as object) : undefined

    if (objectRecord && explicitKeyCache.has(objectRecord)) {
      return explicitKeyCache.get(objectRecord)!
    }

    const key =
      typeof rowKey === 'function'
        ? rowKey(record)
        : ((record as Record<string, unknown>)[rowKey] as string | number | null | undefined)

    if (key !== undefined && key !== null) {
      if (objectRecord) {
        explicitKeyCache.set(objectRecord, key)
      }
      return key
    }

    return index
  }

  function getMany(records: T[], indexOffset = 0): (string | number)[] {
    return records.map((record, index) => get(record, indexOffset + index))
  }

  return { get, getMany }
}

// --- v0.6.0 additions ---

/**
 * Summary row footer classes
 */
export const tableSummaryRowClasses =
  'bg-[var(--tiger-surface-muted,#f3f4f6)] font-semibold border-t-2 border-[var(--tiger-border,#e5e7eb)]'

/**
 * Editable cell classes
 */
export function getEditableCellClasses(isEditing: boolean): string {
  return classNames(
    isEditing
      ? 'ring-2 ring-[var(--tiger-primary,#2563eb)] ring-inset bg-[var(--tiger-surface,#ffffff)]'
      : 'cursor-pointer hover:bg-[var(--tiger-primary,#2563eb)]/5'
  )
}

/**
 * Editable cell input classes
 */
export const editableCellInputClasses =
  'w-full bg-transparent border-none outline-none text-sm text-[var(--tiger-text,#111827)] p-0'

/**
 * Column drag handle classes
 */
export const columnDragHandleClasses =
  'cursor-grab active:cursor-grabbing text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-text,#111827)] transition-colors'

/**
 * Column drag over indicator classes
 */
export const columnDragOverClasses = 'border-l-2 border-[var(--tiger-primary,#2563eb)]'

const COL_SPAN_CLASSES: Record<number, string> = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
  5: 'sm:col-span-5',
  6: 'sm:col-span-6',
  7: 'sm:col-span-7',
  8: 'sm:col-span-8',
  9: 'sm:col-span-9',
  10: 'sm:col-span-10',
  11: 'sm:col-span-11',
  12: 'sm:col-span-12'
}

const ROW_SPAN_CLASSES: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
  5: 'row-span-5',
  6: 'row-span-6'
}

export interface CardGridInfo {
  className: string
  hideLabel: boolean
  labelPosition: 'left' | 'top'
}

export function getCardGridInfo(
  column: TableColumn,
  layoutItem?: TableCardLayoutItem
): CardGridInfo {
  const colSpan = layoutItem?.colSpan !== undefined ? layoutItem.colSpan : column.cardGrid?.colSpan
  const rowSpan = layoutItem?.rowSpan !== undefined ? layoutItem.rowSpan : column.cardGrid?.rowSpan
  const hideLabel =
    layoutItem?.hideLabel !== undefined
      ? layoutItem.hideLabel
      : (column.cardGrid?.hideLabel ?? false)
  const labelPosition =
    layoutItem?.labelPosition !== undefined
      ? layoutItem.labelPosition
      : (column.cardGrid?.labelPosition ?? 'left')

  const colClass =
    colSpan && COL_SPAN_CLASSES[colSpan]
      ? classNames('col-span-12', COL_SPAN_CLASSES[colSpan])
      : 'col-span-12'
  const rowClass = rowSpan && ROW_SPAN_CLASSES[rowSpan] ? ROW_SPAN_CLASSES[rowSpan] : ''

  return {
    className: classNames(colClass, rowClass, 'min-w-0 break-words'),
    hideLabel,
    labelPosition
  }
}
