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
  tableBaseClasses,
  virtualTableHeaderClasses,
  virtualTableHeaderCellClasses,
  virtualTableCellClasses,
  virtualTableEmptyClasses,
  virtualTableLoadingClasses,
  virtualTableFixedCellSelectedClasses,
  type TableColumn,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VirtualTableProps<T = Record<string, unknown>> {
  data?: T[]
  columns?: TableColumn<T>[]
  rowHeight?: number
  height?: number
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
  selectable?: boolean
  selectedKeys?: (string | number)[]
  striped?: boolean
  bordered?: boolean
  className?: string
  onRowClick?: (row: T, index: number) => void
  onSelect?: (key: string | number, row: T, index: number) => void
  renderCell?: (value: unknown, row: T, column: TableColumn<T>) => React.ReactNode
}

/** Fallback column width (px) when a column has no numeric `width`. */
const DEFAULT_VIRTUAL_COLUMN_WIDTH = 150

export const VirtualTable = <T extends Record<string, unknown> = Record<string, unknown>>({
  data = [] as unknown as T[],
  columns = [] as unknown as TableColumn<T>[],
  rowHeight = 48,
  height = 400,
  width = 'auto',
  overscan = 5,
  stickyHeader = true,
  virtualizeColumns = false,
  rowKey,
  rowClassName,
  loading = false,
  emptyText,
  locale,
  selectable = false,
  selectedKeys = [],
  striped = false,
  bordered = false,
  className,
  onRowClick,
  onSelect,
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

  const range = useMemo(
    () => calculateVirtualRange(scrollTop, height, data.length, rowHeight, overscan),
    [scrollTop, height, data.length, rowHeight, overscan]
  )

  const visibleData = useMemo(
    () => data.slice(range.start, range.end),
    [data, range.start, range.end]
  )

  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys])

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

  const bottomHeight = Math.max(0, range.totalHeight - range.end * rowHeight)

  return (
    <div
      ref={containerRef}
      className={classNames(
        containerClasses,
        (rest as Record<string, unknown>).className as string
      )}
      style={{
        height: `${height}px`,
        ...(width !== 'auto' ? { width: `${width}px` } : {})
      }}
      onScroll={onScroll}
      role="grid"
      aria-rowcount={data.length}>
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
                  {col.title ?? ''}
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
            const key = getVirtualRowKey(row, globalIdx, rowKey)
            const isSelected = selectedSet.has(key)
            const isInteractive = !!onRowClick || selectable
            const activate = () => {
              onRowClick?.(row, globalIdx)
              if (selectable) onSelect?.(key, row, globalIdx)
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
                aria-selected={selectable ? isSelected : undefined}
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
                {visibleColumns.map((col, colIdx) => (
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
                      ? renderCell(row[col.key as keyof T], row, col)
                      : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
                {colRange && colRange.rightPad > 0 && (
                  <td aria-hidden style={{ width: `${colRange.rightPad}px`, padding: 0 }} />
                )}
              </tr>
            )
          })}
          {bottomHeight > 0 && <tr style={{ height: `${bottomHeight}px` }} aria-hidden />}
        </tbody>
      </table>
      {data.length === 0 && !loading && (
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
