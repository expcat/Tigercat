import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  classNames,
  isActivationKey,
  resolveLocaleText,
  mergeTigerLocale,
  calculateVirtualRange,
  getVirtualTableContainerClasses,
  getVirtualTableRowClasses,
  getVirtualRowKey,
  getVirtualTableFixedInfo,
  getVirtualTableFixedCellStyle,
  getTableFixedCellClasses,
  getTableFixedHeaderCellClasses,
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
  overscan?: number
  stickyHeader?: boolean
  rowKey?: keyof T | ((row: T, index: number) => string | number)
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

export const VirtualTable = <T extends Record<string, unknown> = Record<string, unknown>>({
  data = [] as unknown as T[],
  columns = [] as unknown as TableColumn<T>[],
  rowHeight = 48,
  height = 400,
  overscan = 5,
  stickyHeader = true,
  rowKey,
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
    }
  }, [])

  const containerClasses = useMemo(
    () => getVirtualTableContainerClasses(bordered, className),
    [bordered, className]
  )

  const fixedInfo = useMemo(() => getVirtualTableFixedInfo(columns), [columns])

  const bottomHeight = Math.max(0, range.totalHeight - range.end * rowHeight)

  return (
    <div
      ref={containerRef}
      className={classNames(
        containerClasses,
        (rest as Record<string, unknown>).className as string
      )}
      style={{ height: `${height}px` }}
      onScroll={onScroll}
      role="grid"
      aria-rowcount={data.length}>
      <table className="w-full table-fixed">
        <thead className={stickyHeader ? virtualTableHeaderClasses : undefined}>
          <tr>
            {columns.map((col) => {
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
                className={getVirtualTableRowClasses(globalIdx, striped, isSelected)}
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
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key as string}
                    aria-colindex={colIdx + 1}
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
