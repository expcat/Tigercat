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
 * Base table classes.
 *
 * Uses `border-separate` + `border-spacing-0` (not `border-collapse`) on purpose:
 * `position: sticky` on `<th>`/`<td>` is unreliable under `border-collapse`
 * (fixed/locked columns drift or jitter while scrolling horizontally). In the
 * separate model sticky cells pin correctly. The trade-off is that borders on
 * `<tr>`/`<thead>` are not painted, so every horizontal separator must live on
 * the cells — see `getTableHeaderClasses`, `getTableRowClasses`,
 * `getExpandedRowClasses`, `tableSummaryRowClasses` and `tableGroupHeaderClasses`.
 */
export const tableBaseClasses = 'w-full border-separate border-spacing-0'

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
  'rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-sm'

export function getTableResponsiveCardClasses(cardPadding: string | false | undefined): string {
  return classNames(
    tableResponsiveCardClasses,
    cardPadding === false ? undefined : (cardPadding ?? 'p-3')
  )
}

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
 * Keep fixed columns visually contiguous so sticky offsets never leave gaps.
 */
export function orderTableFixedColumns<T = Record<string, unknown>>(
  columns: TableColumn<T>[]
): TableColumn<T>[] {
  const left: TableColumn<T>[] = []
  const normal: TableColumn<T>[] = []
  const right: TableColumn<T>[] = []

  for (const column of columns) {
    if (column.fixed === 'left') {
      left.push(column)
    } else if (column.fixed === 'right') {
      right.push(column)
    } else {
      normal.push(column)
    }
  }

  if (left.length === 0 && right.length === 0) return columns
  return [...left, ...normal, ...right]
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
 * Tailwind action-column widths used by the selection / expand cells
 * (`getCheckboxCellClasses` / `getExpandIconCellClasses` → `w-8`/`w-10`/`w-12`).
 *
 * Mirrored here so the `<colgroup>` pins those columns to the exact same width
 * the cells already render at.
 */
const TABLE_ACTION_COLUMN_WIDTH: Record<TableSize, string> = {
  sm: '2rem',
  md: '2.5rem',
  lg: '3rem'
}

/**
 * Resolve a single column's pinned `<col>` width.
 *
 * - Declared `width` wins (number → `"Npx"`, string passed through).
 * - Otherwise the frozen (first-measured) width is used.
 * - Returns `undefined` when neither is available so the column stays auto-sized
 *   until its first measurement is captured.
 */
export function resolveTableColumnWidth<T = Record<string, unknown>>(
  column: Pick<TableColumn<T>, 'key' | 'width'>,
  frozenWidths: Record<string, number> = {}
): string | undefined {
  if (column.width !== undefined) {
    return typeof column.width === 'number' ? `${column.width}px` : column.width
  }

  const frozen = frozenWidths[column.key]
  return frozen && frozen > 0 ? `${frozen}px` : undefined
}

export interface TableColgroupEntry {
  key: string
  width?: string
}

export interface TableColgroupOptions<T = Record<string, unknown>> {
  columns: TableColumn<T>[]
  frozenWidths?: Record<string, number>
  size: TableSize
  hasSelectionColumn: boolean
  expand: 'start' | 'end' | false
}

/**
 * Build the ordered `<colgroup>` descriptor for a table.
 *
 * The order mirrors the rendered cells: an optional leading expand column, an
 * optional selection column, the data columns, then an optional trailing expand
 * column. Pinning every column width via `<col>` decouples column width from a
 * column's `fixed`/lock state, so toggling a lock no longer reflows widths and
 * the measure → offset → reflow → re-measure feedback loop is broken.
 */
export function getTableColgroup<T = Record<string, unknown>>(
  options: TableColgroupOptions<T>
): TableColgroupEntry[] {
  const { columns, frozenWidths = {}, size, hasSelectionColumn, expand } = options
  const actionWidth = TABLE_ACTION_COLUMN_WIDTH[size]
  const entries: TableColgroupEntry[] = []

  if (expand === 'start') {
    entries.push({ key: '__expand__', width: actionWidth })
  }
  if (hasSelectionColumn) {
    entries.push({ key: '__selection__', width: actionWidth })
  }
  for (const column of columns) {
    entries.push({ key: column.key, width: resolveTableColumnWidth(column, frozenWidths) })
  }
  if (expand === 'end') {
    entries.push({ key: '__expand__', width: actionWidth })
  }

  return entries
}

export function hasTableSelectionColumn(rowSelection?: { showCheckbox?: boolean } | null): boolean {
  return !!rowSelection && rowSelection.showCheckbox !== false
}

export interface TableSelectionStateInput<T = Record<string, unknown>> {
  records: T[]
  rowKeys: (string | number)[]
  selectedRowKeys: (string | number)[]
  getCheckboxProps?: (record: T) => { disabled?: boolean } | undefined
}

export interface TableSelectionState {
  selectableRowKeys: (string | number)[]
  allSelected: boolean
  someSelected: boolean
}

export function getTableSelectionState<T = Record<string, unknown>>(
  input: TableSelectionStateInput<T>
): TableSelectionState {
  const selectedSet = new Set(input.selectedRowKeys)
  const selectableRowKeys = input.rowKeys.filter((key, index) => {
    const record = input.records[index]
    return !input.getCheckboxProps?.(record)?.disabled
  })
  const allSelected =
    selectableRowKeys.length > 0 && selectableRowKeys.every((key) => selectedSet.has(key))
  const someSelected = selectableRowKeys.some((key) => selectedSet.has(key)) && !allSelected

  return { selectableRowKeys, allSelected, someSelected }
}

export function getNextTableSelectAllKeys(
  selectedRowKeys: (string | number)[],
  selectableRowKeys: (string | number)[],
  checked: boolean
): (string | number)[] {
  const selectableSet = new Set(selectableRowKeys)
  if (!checked) {
    return selectedRowKeys.filter((key) => !selectableSet.has(key))
  }

  const next = [...selectedRowKeys]
  const nextSet = new Set(next)
  for (const key of selectableRowKeys) {
    if (!nextSet.has(key)) {
      next.push(key)
      nextSet.add(key)
    }
  }
  return next
}

/**
 * Freeze the first measured width of each auto-sized column.
 *
 * Columns with a declared `width` are skipped (they pin to the declared value).
 * Existing frozen entries are preserved; removed columns are pruned. When the
 * result is identical to `previousFrozen` the **same reference** is returned so
 * reactive consumers do not re-render — this is what keeps the ResizeObserver
 * from looping.
 */
export function freezeTableColumnWidths<T = Record<string, unknown>>(
  columns: Pick<TableColumn<T>, 'key' | 'width'>[],
  measuredWidths: Record<string, number> = {},
  previousFrozen: Record<string, number> = {}
): Record<string, number> {
  const next: Record<string, number> = {}

  for (const column of columns) {
    if (column.width !== undefined) {
      continue
    }
    const existing = previousFrozen[column.key]
    if (existing !== undefined) {
      next[column.key] = existing
      continue
    }
    const measured = measuredWidths[column.key]
    if (measured && measured > 0) {
      next[column.key] = measured
    }
  }

  const previousKeys = Object.keys(previousFrozen)
  const nextKeys = Object.keys(next)
  const unchanged =
    previousKeys.length === nextKeys.length &&
    nextKeys.every((key) => previousFrozen[key] === next[key])

  return unchanged ? previousFrozen : next
}

function getColumnWidthForOffset<T = Record<string, unknown>>(
  column: Pick<TableColumn<T>, 'key' | 'width'>,
  measuredColumnWidths: Record<string, number>
): number {
  return measuredColumnWidths[column.key] || parseWidthToPx(column.width)
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
      left += getColumnWidthForOffset(column, measuredColumnWidths)
    }
  }

  let right = 0
  for (let i = columns.length - 1; i >= 0; i--) {
    const column = columns[i]
    if (column.fixed === 'right') {
      rightOffsets[column.key] = right
      hasRightFixedColumns = true
      right += getColumnWidthForOffset(column, measuredColumnWidths)
    }
  }

  const minTableWidth = columns.reduce(
    (sum, col) => sum + getColumnWidthForOffset(col, measuredColumnWidths),
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

export interface TableVirtualRecommendationOptions {
  virtual?: boolean
  autoVirtual?: boolean
  dataLength: number
  threshold?: number
}

export interface TableVirtualRecommendation {
  enabled: boolean
  autoEnabled: boolean
  recommended: boolean
  threshold: number
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
  const autoEnabled =
    options.virtual !== true && options.autoVirtual !== false && options.dataLength >= threshold
  const enabled = options.virtual === true || autoEnabled

  return {
    enabled,
    autoEnabled,
    recommended: !enabled && options.dataLength >= threshold,
    threshold,
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
    // border on cells, not <thead> — the table is `border-separate`
    '[&_th]:border-b [&_th]:border-[var(--tiger-border,#e5e7eb)]',
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
    // border on cells, not <tr> — the table is `border-separate`; `:not(:last-child)`
    // reproduces the old `last:border-b-0` (every row except the last gets a bottom rule)
    '[&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-[var(--tiger-border,#e5e7eb)]',
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
 * Filter data using per-column configuration.
 *
 * Like {@link filterData}, but a column's `filter.filterFn(cellValue, filterValue)`
 * (when provided) overrides the default substring/equality matching for that key.
 * Columns without a custom `filterFn` fall back to the default behavior.
 */
export function filterTableData<T>(
  data: T[],
  columns: TableColumn<T>[],
  filters: Record<string, unknown>
): T[] {
  if (!filters || Object.keys(filters).length === 0) {
    return data
  }

  const filterFnByKey = new Map<string, (value: unknown, filterValue: unknown) => boolean>()
  for (const column of columns) {
    if (column.filter?.filterFn) {
      filterFnByKey.set(column.key, column.filter.filterFn)
    }
  }

  return data.filter((record) => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (filterValue === '' || filterValue === null || filterValue === undefined) {
        return true
      }

      const cellValue = (record as Record<string, unknown>)[key]

      const customFn = filterFnByKey.get(key)
      if (customFn) {
        return customFn(cellValue, filterValue)
      }

      if (typeof filterValue === 'string') {
        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase())
      }

      return cellValue === filterValue
    })
  })
}

/**
 * Visible row window for Table virtual scrolling.
 */
export interface TableVirtualWindow {
  startIndex: number
  endIndex: number
  /** Spacer height (px) above the rendered rows */
  topPad: number
  /** Spacer height (px) below the rendered rows */
  bottomPad: number
}

/**
 * Compute the visible row window for fixed-height table virtual scrolling.
 *
 * Returns the index range to render plus top/bottom spacer heights so the
 * scrollable area keeps its full height.
 */
export function getTableVirtualWindow(
  scrollTop: number,
  viewportHeight: number,
  itemHeight: number,
  rowCount: number,
  overscan = 5
): TableVirtualWindow {
  if (rowCount <= 0 || itemHeight <= 0) {
    return { startIndex: 0, endIndex: -1, topPad: 0, bottomPad: 0 }
  }
  const safeScrollTop = Math.max(0, Number.isFinite(scrollTop) ? scrollTop : 0)
  const startIndex = Math.max(0, Math.floor(safeScrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(Math.max(0, viewportHeight) / itemHeight) + overscan * 2
  const endIndex = Math.min(rowCount - 1, startIndex + visibleCount)
  return {
    startIndex,
    endIndex,
    topPad: startIndex * itemHeight,
    bottomPad: Math.max(0, (rowCount - 1 - endIndex) * itemHeight)
  }
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
    // border on cells, not <tr> — the table is `border-separate`
    '[&:not(:last-child)>td]:border-b [&:not(:last-child)>td]:border-[var(--tiger-border,#e5e7eb)]',
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
  'bg-[var(--tiger-surface-muted,#f3f4f6)] font-semibold [&>td]:border-t-2 [&>td]:border-[var(--tiger-border,#e5e7eb)]'

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
  divider: boolean
  labelClassName?: string
  valueClassName?: string
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
  const divider =
    layoutItem?.divider !== undefined ? layoutItem.divider : (column.cardGrid?.divider ?? false)
  const labelClassName =
    layoutItem?.labelClassName !== undefined
      ? layoutItem.labelClassName
      : column.cardGrid?.labelClassName
  const valueClassName =
    layoutItem?.valueClassName !== undefined
      ? layoutItem.valueClassName
      : column.cardGrid?.valueClassName

  const colClass =
    colSpan && COL_SPAN_CLASSES[colSpan]
      ? classNames('col-span-12', COL_SPAN_CLASSES[colSpan])
      : 'col-span-12'
  const rowClass = rowSpan && ROW_SPAN_CLASSES[rowSpan] ? ROW_SPAN_CLASSES[rowSpan] : ''

  return {
    className: classNames(colClass, rowClass, 'min-w-0 break-words', layoutItem?.className),
    hideLabel,
    labelPosition,
    divider,
    labelClassName,
    valueClassName
  }
}
