import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  classNames,
  isActivationKey,
  resolveLocaleText,
  mergeTigerLocale,
  calculateVirtualRange,
  calculateVirtualColumnRange,
  getVirtualTableContainerClasses,
  getVirtualTableRowClasses,
  getVirtualRowKey,
  getVirtualTableFixedInfo,
  getVirtualTableFixedCellStyle,
  getTableFixedCellClasses,
  getTableFixedHeaderCellClasses,
  getTableColgroup,
  getNextTableSelectAllKeys,
  tableBaseClasses,
  virtualTableHeaderClasses,
  virtualTableHeaderCellClasses,
  virtualTableCellClasses,
  virtualTableEmptyClasses,
  virtualTableLoadingClasses,
  virtualTableFixedCellSelectedClasses,
  type RowSelectionConfig,
  type TableColumn,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VirtualTableProps<T = Record<string, unknown>> {
  dataSource?: T[]
  columns?: TableColumn<T>[]
  virtualItemHeight?: number
  virtualHeight?: number
  /** Viewport width in px or 'auto' */
  width?: number | 'auto'
  overscan?: number
  stickyHeader?: boolean
  /** Enable horizontal column virtualization (when no fixed columns) */
  virtualizeColumns?: boolean
  rowKey?: keyof T | ((row: T, index: number) => string | number)
  /** Row class name (static or per-row resolver) */
  rowClassName?: string | ((row: T, index: number) => string)
  loading?: boolean
  emptyText?: string
  locale?: Partial<TigerLocale>
  rowSelection?: RowSelectionConfig<T>
  striped?: boolean
  bordered?: boolean
  className?: string
  onRowClick?: (row: T, index: number) => void
  onSelectionChange?: (selectedKeys: (string | number)[]) => void
  renderCell?: (value: unknown, row: T, column: TableColumn<T>) => React.ReactNode
}

/** Fallback column width (px) when a column has no numeric `width`. */
const DEFAULT_VIRTUAL_COLUMN_WIDTH = 150

export const VirtualTable = <T extends Record<string, unknown> = Record<string, unknown>>({
  dataSource = [] as unknown as T[],
  columns = [] as unknown as TableColumn<T>[],
  virtualItemHeight = 48,
  virtualHeight = 400,
  width = 'auto',
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
  onRowClick,
  onSelectionChange,
  renderCell,
  ...rest
}: VirtualTableProps<T>) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [uncontrolledSelectedKeys, setUncontrolledSelectedKeys] = useState<(string | number)[]>(
    rowSelection?.defaultSelectedRowKeys ?? rowSelection?.selectedRowKeys ?? []
  )
  const isSelectionControlled = rowSelection?.selectedRowKeys !== undefined
  const selectedKeys = isSelectionControlled
    ? (rowSelection.selectedRowKeys ?? [])
    : uncontrolledSelectedKeys
  const hasSelection = !!rowSelection

  const range = useMemo(
    () =>
      calculateVirtualRange(
        scrollTop,
        virtualHeight,
        dataSource.length,
        virtualItemHeight,
        overscan
      ),
    [scrollTop, virtualHeight, dataSource.length, virtualItemHeight, overscan]
  )

  const visibleData = useMemo(
    () => dataSource.slice(range.start, range.end),
    [dataSource, range.start, range.end]
  )

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys])

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
      if (rowSelection.type === 'radio') {
        commitSelection([key])
        return
      }
      commitSelection(getNextTableSelectAllKeys(selectedKeys, [key], !selectedSet.has(key)))
    },
    [commitSelection, rowSelection, selectedKeys, selectedSet]
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

  // Column virtualization only when explicitly enabled and there are no fixed
  // columns (sticky offsets are incompatible with spacer cells).
  const columnWidths = useMemo(
    () =>
      columns.map((c) => (typeof c.width === 'number' ? c.width : DEFAULT_VIRTUAL_COLUMN_WIDTH)),
    [columns]
  )
  const colVirtualActive = virtualizeColumns && !fixedInfo.hasFixedColumns && width !== 'auto'
  const colRange = useMemo(
    () =>
      colVirtualActive
        ? calculateVirtualColumnRange(scrollLeft, width as number, columnWidths)
        : undefined,
    [colVirtualActive, scrollLeft, width, columnWidths]
  )
  const visibleColumns = colRange ? columns.slice(colRange.start, colRange.end) : columns
  const colIndexOffset = colRange ? colRange.start : 0
  const colgroupEntries = useMemo(
    () =>
      fixedInfo.hasFixedColumns
        ? getTableColgroup({
            columns: visibleColumns,
            size: 'md',
            hasSelectionColumn: false,
            expand: false
          })
        : [],
    [fixedInfo.hasFixedColumns, visibleColumns]
  )

  const resolveRowClassName = (row: T, index: number): string | undefined =>
    typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName

  const bottomHeight = Math.max(0, range.totalHeight - range.end * virtualItemHeight)

  return (
    <div
      ref={containerRef}
      className={classNames(
        containerClasses,
        (rest as Record<string, unknown>).className as string
      )}
      style={{
        height: `${virtualHeight}px`,
        ...(width !== 'auto' ? { width: `${width}px` } : {})
      }}
      onScroll={onScroll}
      role="grid"
      aria-rowcount={dataSource.length}>
      <table className={classNames(tableBaseClasses, 'table-fixed')}>
        {colgroupEntries.length > 0 && (
          <colgroup>
            {colgroupEntries.map((entry) => (
              <col
                key={entry.key}
                data-tiger-table-col={entry.key}
                style={entry.width ? { width: entry.width } : undefined}
              />
            ))}
          </colgroup>
        )}
        <thead className={stickyHeader ? virtualTableHeaderClasses : undefined}>
          <tr>
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
                    getTableFixedHeaderCellClasses({
                      view: 'virtual-table',
                      column: col,
                      stickyHeader,
                      fixedInfo
                    })
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
          <tr style={{ height: `${range.offsetTop}px` }} aria-hidden />
          {visibleData.map((row, localIdx) => {
            const globalIdx = range.start + localIdx
            const key = rowSelection?.getRowKey
              ? rowSelection.getRowKey(row)
              : getVirtualRowKey(row, globalIdx, rowKey)
            const isSelected = selectedSet.has(key)
            const isInteractive = !!onRowClick || hasSelection
            const activate = () => {
              onRowClick?.(row, globalIdx)
              if (hasSelection) toggleRowSelection(key, row)
            }

            return (
              <tr
                key={key}
                className={classNames(
                  getVirtualTableRowClasses(globalIdx, striped, isSelected),
                  resolveRowClassName(row, globalIdx)
                )}
                // header occupies aria-rowindex 1
                aria-rowindex={globalIdx + 2}
                aria-selected={hasSelection ? isSelected : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                onClick={isInteractive ? activate : undefined}
                onKeyDown={
                  isInteractive
                    ? (e) => {
                        if (isActivationKey(e)) {
                          e.preventDefault()
                          activate()
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
                        getTableFixedCellClasses({
                          view: 'virtual-table',
                          column: col,
                          record: row,
                          rowIndex: globalIdx,
                          striped,
                          stripedActive: striped && globalIdx % 2 === 1,
                          selected: isSelected,
                          hoverable: true,
                          fixedInfo,
                          selectedClassName: virtualTableFixedCellSelectedClasses
                        })
                      )}
                      style={getVirtualTableFixedCellStyle(col.key, fixedInfo)}>
                      {renderCell
                        ? renderCell(value, row, col)
                        : col.render
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
          {bottomHeight > 0 && <tr style={{ height: `${bottomHeight}px` }} aria-hidden />}
        </tbody>
      </table>
      {dataSource.length === 0 && !loading && (
        <div className={virtualTableEmptyClasses}>
          {resolveLocaleText('No data', emptyText, mergedLocale?.common?.emptyText)}
        </div>
      )}
      {loading && (
        <div className={virtualTableLoadingClasses}>
          {resolveLocaleText('Loading...', mergedLocale?.common?.loadingText)}
        </div>
      )}
    </div>
  )
}

export default VirtualTable
