import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
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
  getTableCellClasses,
  getTableColgroup,
  getTableHeaderCellClasses,
  getTableLabels,
  isVirtualTableCellControlTarget,
  nextEnabledRowIndex,
  resolveVirtualTableColumnVirtualization,
  resolveVirtualTableRowIdentities,
  resolveVirtualTableSelectedKeys,
  tableRowKeyId,
  resolveScrollportViewport,
  resolveVirtualTableWidth,
  scrollTopToRevealVirtualTableRow,
  tableBaseClasses,
  tableVirtualSpacerCellClasses,
  virtualTableHeaderClasses,
  virtualTableHeaderCellClasses,
  virtualTableCellClasses,
  virtualTableEmptyClasses,
  virtualTableLoadingClasses,
  virtualTableRowFocusClasses,
  observeSize,
  type RowSelectionConfig,
  type TableColumn,
  type TigerLocale,
  type VirtualTableColumn,
  type VirtualTableHandle
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VirtualTableProps<T = Record<string, unknown>> {
  dataSource?: T[]
  columns?: VirtualTableColumn<T>[]
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
  const identities = useMemo(
    () =>
      resolveVirtualTableRowIdentities(dataSource, rowKey, rowSelection?.getRowKey),
    [dataSource, rowKey, rowSelection]
  )
  const columns = columnsProp ?? (EMPTY_VIRTUAL_TABLE_COLUMNS as unknown as TableColumn<T>[])
  const width = resolveVirtualTableWidth(widthProp)
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLTableSectionElement>(null)
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0)
  const [scrollport, setScrollport] = useState({ height: 0, width: 0 })
  const [measuredColumnWidths, setMeasuredColumnWidths] = useState<Record<string, number>>({})
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const rowRefs = useRef(new Map<number, HTMLTableRowElement>())
  const pendingRowFocus = useRef(false)
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

  const headerHeight = stickyHeader ? measuredHeaderHeight : 0
  useLayoutEffect(() => {
    const scroller = containerRef.current
    if (!scroller) return undefined
    const readPort = () => {
      setScrollport((current) => {
        const height = scroller.clientHeight
        const width = scroller.clientWidth
        return current.height === height && current.width === width ? current : { height, width }
      })
    }
    readPort()
    return observeSize(scroller, readPort)
  }, [virtualHeight, width])
  useLayoutEffect(() => {
    const header = headerRef.current
    if (!stickyHeader || !header) {
      setMeasuredHeaderHeight(0)
      return
    }
    const read = () => {
      const next = header.getBoundingClientRect().height
      const height = Number.isFinite(next) && next > 0 ? next : 0
      setMeasuredHeaderHeight((current) => (current === height ? current : height))
      const widths: Record<string, number> = {}
      header.querySelectorAll<HTMLElement>('th[data-tiger-table-column-key]').forEach((cell) => {
        const key = cell.dataset.tigerTableColumnKey
        const cellWidth = cell.getBoundingClientRect().width
        if (key && cellWidth > 0) widths[key] = cellWidth
      })
      setMeasuredColumnWidths((current) => {
        const keys = Object.keys(widths)
        if (
          keys.length === Object.keys(current).length &&
          keys.every((key) => current[key] === widths[key])
        ) {
          return current
        }
        return widths
      })
    }
    read()
    return observeSize(header, read)
  }, [stickyHeader, columns, dataSource.length])
  const rowViewport = resolveScrollportViewport(scrollport.height, virtualHeight)
  const range = useMemo(
    () =>
      getVirtualTableRowWindow(
        scrollTop,
        rowViewport,
        dataSource.length,
        virtualItemHeight,
        overscan,
        headerHeight
      ),
    [scrollTop, rowViewport, dataSource.length, virtualItemHeight, overscan, headerHeight]
  )
  const spacers = getVirtualTableSpacerHeights(range, virtualItemHeight)
  const visibleData = useMemo(
    () => dataSource.slice(range.start, range.end),
    [dataSource, range.start, range.end]
  )
  const selectedSet = useMemo(
    () => new Set(selectedKeys.map((key) => tableRowKeyId(key))),
    [selectedKeys]
  )

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = containerRef.current
      const viewport = resolveScrollportViewport(el?.clientHeight ?? scrollport.height, virtualHeight)
      const next = scrollTopToRevealVirtualTableRow({
        scrollTop: el?.scrollTop ?? scrollTop,
        viewportHeight: viewport,
        headerHeight,
        index,
        itemHeight: virtualItemHeight
      })
      if (el && el.scrollTop !== next) el.scrollTop = next
      setScrollTop(next)
    },
    [headerHeight, scrollTop, scrollport.height, virtualHeight, virtualItemHeight]
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
  const columnWidths = useMemo(
    () => getVirtualTableColumnWidths(columns, measuredColumnWidths),
    [columns, measuredColumnWidths]
  )
  const colVirtual = resolveVirtualTableColumnVirtualization({
    virtualizeColumns,
    hasFixedColumns: fixedInfo.hasFixedColumns,
    widths: columnWidths,
    viewportWidth: resolveScrollportViewport(scrollport.width, typeof width === 'number' ? width : 0)
  })
  const colRange = useMemo(
    () =>
      colVirtual.active
        ? calculateVirtualColumnRange(
            scrollLeft,
            colVirtual.viewportWidth,
            columnWidths,
            overscan,
            config.direction === 'rtl' ? 'rtl' : 'ltr'
          )
        : undefined,
    [colVirtual, columnWidths, config.direction, overscan, scrollLeft]
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
    (colRange && colRange.inlineBefore > 0 ? 1 : 0) +
    (colRange && colRange.inlineAfter > 0 ? 1 : 0)

  const resolveRowClassName = (row: T, index: number): string | undefined =>
    typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName

  useEffect(() => {
    if (!rowSelection?.getCheckboxProps || dataSource.length === 0) return
    const next = nextEnabledRowIndex(dataSource.length, activeIndex, (index) =>
      Boolean(rowSelection.getCheckboxProps?.(dataSource[index]!)?.disabled)
    )
    if (next !== activeIndex) setActiveIndex(next)
  }, [activeIndex, dataSource, rowSelection])

  const focusIndex = visibleData.some((_, localIdx) => range.start + localIdx === activeIndex)
    ? activeIndex
    : range.start

  const moveActive = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(dataSource.length - 1, nextIndex))
    pendingRowFocus.current = true
    setActiveIndex(clamped)
    scrollToIndex(clamped)
  }

  useLayoutEffect(() => {
    if (!pendingRowFocus.current || loading) return
    const row = rowRefs.current.get(activeIndex)
    if (!row || row.tabIndex !== 0) return
    pendingRowFocus.current = false
    if (document.activeElement !== row) row.focus()
  }, [activeIndex, loading, range.start, range.end, scrollTop])

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
        aria-label={getTableLabels(mergedLocale).tableAriaLabel}
        aria-rowcount={dataSource.length + 1}
        aria-colcount={columns.length}>
        {colgroupEntries.length > 0 && (
          <colgroup>
            {colRange && colRange.inlineBefore > 0 && <col style={{ width: `${colRange.inlineBefore}px` }} />}
            {colgroupEntries.map((entry) => (
              <col
                key={entry.key}
                data-tiger-table-col={entry.key}
                style={entry.width ? { width: entry.width } : undefined}
              />
            ))}
            {colRange && colRange.inlineAfter > 0 && (
              <col style={{ width: `${colRange.inlineAfter}px` }} />
            )}
          </colgroup>
        )}
        <thead ref={headerRef} className={stickyHeader ? virtualTableHeaderClasses : undefined}>
          <tr aria-rowindex={1}>
            {colRange && colRange.inlineBefore > 0 && (
              <th aria-hidden style={{ width: `${colRange.inlineBefore}px`, padding: 0 }} />
            )}
            {visibleColumns.map((col, colIdx) => {
              const widthStyle = col.width
                ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
                : {}
              const stickyStyle = getVirtualTableFixedCellStyle(col.key, fixedInfo, 'header')
              return (
                <th
                  key={col.key as string}
                  scope="col"
                  aria-colindex={colIndexOffset + colIdx + 1}
                  className={classNames(
                    virtualTableHeaderCellClasses,
                    getTableHeaderCellClasses('md', col.align || 'left', false),
                    getVirtualTableFixedHeaderCellClasses(col, fixedInfo, stickyHeader)
                  )}
                  data-tiger-table-column-key={col.key}
                  style={{ ...widthStyle, ...stickyStyle }}>
                  {col.renderHeader ? (col.renderHeader() as React.ReactNode) : (col.title ?? '')}
                </th>
              )
            })}
            {colRange && colRange.inlineAfter > 0 && (
              <th aria-hidden style={{ width: `${colRange.inlineAfter}px`, padding: 0 }} />
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? null : spacers.top > 0 && (
            <tr data-tiger-table-virtual-spacer="" aria-hidden="true">
              <td
                colSpan={Math.max(1, colSpan)}
                className={tableVirtualSpacerCellClasses}
                style={{ height: `${spacers.top}px` }}
              />
            </tr>
          )}
          {loading
            ? null
            : visibleData.map((row, localIdx) => {
            const globalIdx = range.start + localIdx
            const identity = identities[globalIdx] ?? {
              key: undefined,
              domKey: globalIdx
            }
            const isSelected =
              identity.key !== undefined && selectedSet.has(tableRowKeyId(identity.key))
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
                ref={(node) => {
                  if (node) rowRefs.current.set(globalIdx, node)
                  else rowRefs.current.delete(globalIdx)
                }}
                style={{ minHeight: `${virtualItemHeight}px` }}
                aria-rowindex={globalIdx + 2}
                aria-selected={hasSelection ? isSelected : undefined}
                aria-disabled={isDisabled || undefined}
                tabIndex={tabIndex}
                onClick={isInteractive ? activate : undefined}
                onKeyDown={
                  isInteractive
                    ? (e) => {
                        if (e.target !== e.currentTarget) return
                        if (isVirtualTableCellControlTarget(e.target)) return
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
                {colRange && colRange.inlineBefore > 0 && (
                  <td aria-hidden style={{ width: `${colRange.inlineBefore}px`, padding: 0 }} />
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
                        getTableCellClasses('md', col.align || 'left'),
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
                        minHeight: `${virtualItemHeight}px`,
                        ...getVirtualTableFixedCellStyle(col.key, fixedInfo, 'body')
                      }}>
                      {col.render
                        ? (col.render(row, globalIdx) as React.ReactNode)
                        : (value as React.ReactNode)}
                    </td>
                  )
                })}
                {colRange && colRange.inlineAfter > 0 && (
                  <td aria-hidden style={{ width: `${colRange.inlineAfter}px`, padding: 0 }} />
                )}
              </tr>
            )
          })}
          {!loading && spacers.bottom > 0 && (
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
        <div className={virtualTableEmptyClasses} role="status" aria-live="polite">
          {resolveLocaleText('No data', emptyText, mergedLocale?.common?.emptyText)}
        </div>
      )}
      {loading && (
        <div className={virtualTableLoadingClasses} role="status" aria-live="polite">
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
