import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  classNames,
  isActivationKey,
  resolveLocaleText,
  mergeTigerLocale,
  calculateVirtualColumnRange,
  EMPTY_VIRTUAL_TABLE_COLUMNS,
  EMPTY_VIRTUAL_TABLE_ROWS,
  getVirtualTableContainerClasses,
  getVirtualTableRowClasses,
  getVirtualTableRowWindow,
  getVirtualTableSpacerHeights,
  getVirtualTableColumnWidths,
  getNextVirtualTableSelection,
  getVirtualTableFixedInfo,
  getVirtualTableFixedCellStyle,
  getVirtualTableFixedCellClasses,
  getVirtualTableFixedHeaderCellClasses,
  getTableColgroup,
  isVirtualTableCellControlTarget,
  resolveVirtualTableColumnVirtualization,
  resolveVirtualTableRowIdentity,
  resolveVirtualTableSelectedKeys,
  resolveVirtualTableWidth,
  tableBaseClasses,
  tableVirtualSpacerCellClasses,
  virtualTableHeaderClasses,
  virtualTableHeaderCellClasses,
  virtualTableCellClasses,
  virtualTableEmptyClasses,
  virtualTableLoadingClasses,
  virtualTableRowFocusClasses,
  VIRTUAL_TABLE_HEADER_ROW_HEIGHT,
  type RowSelectionConfig,
  type TableColumn,
  type TigerLocale,
  type VirtualTableHandle
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VirtualTableProps<T = Record<string, unknown>> {
  dataSource?: T[]
  columns?: TableColumn<T>[]
  virtualItemHeight?: number
  virtualHeight?: number
  width?: number | 'auto'
  overscan?: number
  stickyHeader?: boolean
  virtualizeColumns?: boolean
  rowKey?: keyof T | ((row: T, index: number) => string | number)
  rowClassName?: string | ((row: T, index: number) => string)
  loading?: boolean
  emptyText?: string
  locale?: Partial<TigerLocale>
  rowSelection?: RowSelectionConfig<T>
  striped?: boolean
  bordered?: boolean
  className?: string
  id?: string
  style?: React.CSSProperties
  onRowClick?: (row: T, index: number) => void
  onSelectionChange?: (selectedKeys: (string | number)[]) => void
}

export type { VirtualTableHandle }

function alignClass(align?: TableColumn['align']): string | undefined {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-end'
  return 'text-start'
}

function VirtualTableInner<T extends Record<string, unknown> = Record<string, unknown>>(
  {
    dataSource: dataSourceProp,
    columns: columnsProp,
    virtualItemHeight = 48,
    virtualHeight = 400,
    width: widthProp = 'auto',
    overscan = 5,
    stickyHeader = true,
    virtualizeColumns = false,
    rowKey,
    rowClassName,
    loading = false,
    emptyText,
    locale,
    rowSelection,
    striped = false,
    bordered = false,
    className,
    id,
    style,
    onRowClick,
    onSelectionChange,
    ...rest
  }: VirtualTableProps<T>,
  ref: React.ForwardedRef<VirtualTableHandle>
) {
  const dataSource = dataSourceProp ?? (EMPTY_VIRTUAL_TABLE_ROWS as unknown as T[])
  const columns = columnsProp ?? (EMPTY_VIRTUAL_TABLE_COLUMNS as unknown as TableColumn<T>[])
  const width = resolveVirtualTableWidth(widthProp)
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] = useState<(string | number)[]>(
    () => resolveVirtualTableSelectedKeys(rowSelection?.defaultSelectedRowKeys)
  )
  const isSelectionControlled = rowSelection?.selectedRowKeys !== undefined
  const selectedKeys = isSelectionControlled
    ? resolveVirtualTableSelectedKeys(rowSelection.selectedRowKeys)
    : uncontrolledSelectedKeys
  const hasSelection = !!rowSelection
  const isInteractive = !!onRowClick || hasSelection

  const headerHeight = stickyHeader ? VIRTUAL_TABLE_HEADER_ROW_HEIGHT : 0
  const range = useMemo(
    () =>
      getVirtualTableRowWindow(
        scrollTop,
        virtualHeight,
        dataSource.length,
        virtualItemHeight,
        overscan,
        headerHeight
      ),
    [scrollTop, virtualHeight, dataSource.length, virtualItemHeight, overscan, headerHeight]
  )
  const spacers = getVirtualTableSpacerHeights(range, virtualItemHeight)
  const visibleData = useMemo(
    () => dataSource.slice(range.start, range.end),
    [dataSource, range.start, range.end]
  )
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys])

  const scrollToIndex = useCallback(
    (index: number) => {
      const next = Math.max(0, index) * virtualItemHeight
      const el = containerRef.current
      if (el) el.scrollTop = next
      setScrollTop(next)
    },
    [virtualItemHeight]
  )

  useImperativeHandle(ref, () => ({ scrollToIndex }), [scrollToIndex])

  const commitSelection = useCallback(
    (nextKeys: (string | number)[]) => {
      if (!isSelectionControlled) {
        setUncontrolledSelectedKeys(nextKeys)
      }
      onSelectionChange?.(nextKeys)
    },
    [isSelectionControlled, onSelectionChange]
  )

  const toggleRowSelection = useCallback(
    (key: string | number, row: T) => {
      if (!rowSelection || rowSelection.getCheckboxProps?.(row)?.disabled) return
      commitSelection(
        getNextVirtualTableSelection({
          type: rowSelection.type,
          selectedKeys,
          key
        })
      )
    },
    [commitSelection, rowSelection, selectedKeys]
  )

  const onScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop)
      setScrollLeft(containerRef.current.scrollLeft)
    }
  }, [])

  const containerClasses = useMemo(
    () => getVirtualTableContainerClasses(bordered, className),
    [bordered, className]
  )
  const fixedInfo = useMemo(() => getVirtualTableFixedInfo(columns), [columns])
  const columnWidths = useMemo(() => getVirtualTableColumnWidths(columns), [columns])
  const colVirtual = resolveVirtualTableColumnVirtualization({
    virtualizeColumns,
    hasFixedColumns: fixedInfo.hasFixedColumns,
    width
  })
  const colRange = useMemo(
    () =>
      colVirtual.active
        ? calculateVirtualColumnRange(scrollLeft, colVirtual.viewportWidth, columnWidths)
        : undefined,
    [colVirtual, scrollLeft, columnWidths]
  )
  const visibleColumns = colRange ? columns.slice(colRange.start, colRange.end) : columns
  const colIndexOffset = colRange ? colRange.start : 0
  const colgroupEntries = getTableColgroup({
    columns: visibleColumns,
    size: 'md',
    hasSelectionColumn: false,
    expand: false
  })
  const colSpan =
    visibleColumns.length +
    (colRange && colRange.leftPad > 0 ? 1 : 0) +
    (colRange && colRange.rightPad > 0 ? 1 : 0)

  const resolveRowClassName = (row: T, index: number): string | undefined =>
    typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName

  const focusIndex = visibleData.some((_, localIdx) => range.start + localIdx === activeIndex)
    ? activeIndex
    : range.start

  const moveActive = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(dataSource.length - 1, nextIndex))
    setActiveIndex(clamped)
    if (clamped < range.start || clamped >= range.end) {
      scrollToIndex(clamped)
    }
  }

  return (
    <div
      ref={containerRef}
      id={id}
      className={containerClasses}
      style={{
        height: `${virtualHeight}px`,
        ...(width !== 'auto' ? { width: `${width}px` } : {}),
        ...style
      }}
      onScroll={onScroll}
      aria-busy={loading || undefined}
      {...rest}>
      <table
        className={classNames(tableBaseClasses, 'table-fixed')}
        style={
          fixedInfo.minTableWidth > 0 ? { minWidth: `${fixedInfo.minTableWidth}px` } : undefined
        }
        aria-rowcount={dataSource.length + 1}
        aria-colcount={columns.length}>
        {colgroupEntries.length > 0 && (
          <colgroup>
            {colRange && colRange.leftPad > 0 && <col style={{ width: `${colRange.leftPad}px` }} />}
            {colgroupEntries.map((entry) => (
              <col
                key={entry.key}
                data-tiger-table-col={entry.key}
                style={entry.width ? { width: entry.width } : undefined}
              />
            ))}
            {colRange && colRange.rightPad > 0 && (
              <col style={{ width: `${colRange.rightPad}px` }} />
            )}
          </colgroup>
        )}
        <thead className={stickyHeader ? virtualTableHeaderClasses : undefined}>
          <tr aria-rowindex={1}>
            {colRange && colRange.leftPad > 0 && (
              <th aria-hidden style={{ width: `${colRange.leftPad}px`, padding: 0 }} />
            )}
            {visibleColumns.map((col) => {
              const widthStyle = col.width
                ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
                : {}
              const stickyStyle = getVirtualTableFixedCellStyle(col.key, fixedInfo)
              return (
                <th
                  key={col.key as string}
                  className={classNames(
                    virtualTableHeaderCellClasses,
                    alignClass(col.align),
                    getVirtualTableFixedHeaderCellClasses(col, fixedInfo, stickyHeader)
                  )}
                  style={{ ...widthStyle, ...stickyStyle }}>
                  {col.renderHeader ? (col.renderHeader() as React.ReactNode) : (col.title ?? '')}
                </th>
              )
            })}
            {colRange && colRange.rightPad > 0 && (
              <th aria-hidden style={{ width: `${colRange.rightPad}px`, padding: 0 }} />
            )}
          </tr>
        </thead>
        <tbody>
          {spacers.top > 0 && (
            <tr data-tiger-table-virtual-spacer="" aria-hidden="true">
              <td
                colSpan={Math.max(1, colSpan)}
                className={tableVirtualSpacerCellClasses}
                style={{ height: `${spacers.top}px` }}
              />
            </tr>
          )}
          {visibleData.map((row, localIdx) => {
            const globalIdx = range.start + localIdx
            const identity = rowSelection?.getRowKey
              ? { key: rowSelection.getRowKey(row), domKey: rowSelection.getRowKey(row) }
              : resolveVirtualTableRowIdentity(row, globalIdx, rowKey)
            const isSelected = identity.key !== undefined && selectedSet.has(identity.key)
            const isDisabled = !!rowSelection?.getCheckboxProps?.(row)?.disabled
            const tabIndex =
              loading || !isInteractive || isDisabled
                ? undefined
                : globalIdx === focusIndex
                  ? 0
                  : -1
            const activate = (event?: React.SyntheticEvent) => {
              if (event && isVirtualTableCellControlTarget(event.target)) return
              onRowClick?.(row, globalIdx)
              if (hasSelection && identity.key !== undefined && !isDisabled) {
                toggleRowSelection(identity.key, row)
              }
            }

            return (
              <tr
                key={identity.domKey}
                className={classNames(
                  getVirtualTableRowClasses(globalIdx, striped, isSelected),
                  isInteractive && virtualTableRowFocusClasses,
                  resolveRowClassName(row, globalIdx)
                )}
                style={{ height: `${virtualItemHeight}px`, overflow: 'hidden' }}
                aria-rowindex={globalIdx + 2}
                aria-selected={hasSelection ? isSelected : undefined}
                aria-disabled={isDisabled || undefined}
                tabIndex={tabIndex}
                onClick={isInteractive ? activate : undefined}
                onKeyDown={
                  isInteractive
                    ? (e) => {
                        if (isActivationKey(e)) {
                          e.preventDefault()
                          activate(e)
                          return
                        }
                        if (e.key === 'ArrowDown') {
                          e.preventDefault()
                          moveActive(globalIdx + 1)
                        }
                        if (e.key === 'ArrowUp') {
                          e.preventDefault()
                          moveActive(globalIdx - 1)
                        }
                      }
                    : undefined
                }>
                {colRange && colRange.leftPad > 0 && (
                  <td aria-hidden style={{ width: `${colRange.leftPad}px`, padding: 0 }} />
                )}
                {visibleColumns.map((col, colIdx) => {
                  const dataKey = col.dataKey || col.key
                  const value = row[dataKey as keyof T]
                  return (
                    <td
                      key={col.key as string}
                      aria-colindex={colIndexOffset + colIdx + 1}
                      className={classNames(
                        virtualTableCellClasses,
                        alignClass(col.align),
                        getVirtualTableFixedCellClasses({
                          column: col,
                          record: row,
                          rowIndex: globalIdx,
                          striped,
                          selected: isSelected,
                          hoverable: true,
                          fixedInfo
                        })
                      )}
                      style={{
                        height: `${virtualItemHeight}px`,
                        overflow: 'hidden',
                        ...getVirtualTableFixedCellStyle(col.key, fixedInfo)
                      }}>
                      {col.render
                        ? (col.render(row, globalIdx) as React.ReactNode)
                        : (value as React.ReactNode)}
                    </td>
                  )
                })}
                {colRange && colRange.rightPad > 0 && (
                  <td aria-hidden style={{ width: `${colRange.rightPad}px`, padding: 0 }} />
                )}
              </tr>
            )
          })}
          {spacers.bottom > 0 && (
            <tr data-tiger-table-virtual-spacer="" aria-hidden="true">
              <td
                colSpan={Math.max(1, colSpan)}
                className={tableVirtualSpacerCellClasses}
                style={{ height: `${spacers.bottom}px` }}
              />
            </tr>
          )}
        </tbody>
      </table>
      {dataSource.length === 0 && !loading && (
        <div className={virtualTableEmptyClasses}>
          {resolveLocaleText('No data', emptyText, mergedLocale?.common?.emptyText)}
        </div>
      )}
      {loading && (
        <div className={virtualTableLoadingClasses} aria-live="polite">
          {resolveLocaleText('Loading...', mergedLocale?.common?.loadingText)}
        </div>
      )}
    </div>
  )
}

export const VirtualTable = forwardRef(VirtualTableInner) as <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  props: VirtualTableProps<T> & { ref?: React.Ref<VirtualTableHandle> }
) => React.ReactElement

export default VirtualTable
