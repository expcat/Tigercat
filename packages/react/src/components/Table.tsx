import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  classNames,
  canUseTableVirtualWindow,
  createTableResizeObserverController,
  getTableWrapperClasses,
  getCardColumns,
  getCardGridInfo,
  getTableColgroup,
  hasTableSelectionColumn,
  resolveTableExpandSlot,
  tableExportBarClasses,
  getTableResponsiveCardClasses,
  getTableResponsiveTableClasses,
  getTableVirtualRecommendation,
  getTableVirtualWindow,
  devWarn,
  resolveScrollportViewport,
  virtualizeMiddleColumns,
  parseWidthToPx,
  cardVirtualWindow,
  nextGridCell,
  resolveTableKeyboardMode,
  getTableCardSortValue,
  parseTableCardSortValue,
  subscribeTableCardViewport,
  TABLE_CARD_SORT_NONE,
  tableCardListVisibleClasses,
  formatTableSelectRowAriaLabel,
  formatTableSelectionCount,
  formatTableSortAnnouncement,
  formatTableSortByText,
  manageLiveRegion,
  tableRowKeyId,
  getTableLabels,
  isActivationKey,
  tableBaseClasses,
  tableResponsiveCardLabelClasses,
  tableResponsiveCardRowClasses,
  tableResponsiveCardTitleClasses,
  tableResponsiveCardValueClasses,
  tableLoadingOverlayClasses,
  getImmediateTigerLocale,
  isLazyTigerLocale,
  mergeTigerLocale,
  resolveTigerLocale,
  type RowSelectionConfig,
  type ExpandableConfig,
  type TableCardLayoutItem,
  type TableColumn,
  type TigerLocale,
  type TigerLocaleInput
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { Empty } from './Empty'
import { Loading } from './Loading'
import { Radio } from './Radio'
import { Select } from './Select'
import { useTableState } from './Table/state'
import { renderTableHeader } from './Table/render-header'
import { renderTableBody } from './Table/render-body'
import { renderSummaryRow } from './Table/render-summary'
import { renderPagination } from './Table/render-pagination'
import { TableW9Panel } from './Table/w9-panel'
import type { TableProps } from './Table/types'

export type { TableProps } from './Table/types'

export function Table<T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  columnLockable = false,
  dataSource,
  hiddenColumnKeys,
  defaultHiddenColumnKeys,
  sort,
  defaultSort,
  filters,
  defaultFilters,
  size = 'md',
  bordered = false,
  striped = false,
  hoverable = true,
  loading = false,
  locale,
  labels,
  emptyText,
  pagination,
  rowSelection,
  expandable,
  rowKey = 'id',
  rowClassName,
  stickyHeader = false,
  maxHeight,
  tableLayout = 'auto',
  responsiveMode = 'scroll',
  cardBreakpoint = 'sm',
  cardClassName,
  renderCard,
  cardLayout,
  cardSelectionPosition = 'controls-row',
  cardPadding,
  cardFieldGap = 'gap-3',
  // v0.6.0 props
  virtual = false,
  autoVirtual = false,
  virtualHeight = 400,
  virtualItemHeight = 40,
  virtualThreshold = 1000,
  virtualizeColumns = false,
  width = 'auto',
  overscan = 5,
  scrollToIndex,
  sorts,
  columnWidths,
  grid = false,
  collapsedGroupKeys,
  cardItemHeight,
  editable = false,
  editableCells,
  filterMode = 'basic',
  advancedFilterRules,
  columnDraggable = false,
  rowDraggable = false,
  summaryRow,
  groupBy,
  exportable = false,
  exportScope = 'all',
  exportFilename = 'export',
  columnOrder,
  columnFixed,
  cardViewport,
  ariaLabel,
  onChange,
  onRowClick,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  onHiddenColumnKeysChange,
  onPageChange,
  onExpandChange,
  onCellChange,
  onColumnOrderChange,
  onColumnFixedChange,
  onRowOrderChange,
  onExport,
  onSelectLoaded,
  className,
  ...props
}: TableProps<T>) {
  const config = useTigerConfig()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const tableRef = useRef<HTMLTableElement | null>(null)
  const [measuredColumnWidths, setMeasuredColumnWidths] = useState<Record<string, number>>({})
  const [measuredRowHeights, setMeasuredRowHeights] = useState<Record<number, number>>({})
  const [measuredContainerSize, setMeasuredContainerSize] = useState({ width: 0, height: 0 })
  const [uncontrolledCardViewport, setUncontrolledCardViewport] = useState(false)
  const [activeRowIndex, setActiveRowIndex] = useState(0)
  const [gridCell, setGridCell] = useState({ row: 0, column: 0 })
  const cardViewportControlled = cardViewport !== undefined
  const isCardViewport = cardViewportControlled ? Boolean(cardViewport) : uncontrolledCardViewport
  const selectionGroupName = useId()
  const internalRowSelection = rowSelection as
    RowSelectionConfig<Record<string, unknown>> | undefined
  const internalExpandable = expandable as ExpandableConfig<Record<string, unknown>> | undefined
  const internalRowClassName = rowClassName as
    string | ((record: Record<string, unknown>, index: number) => string) | undefined
  const paginationLocaleInput: TigerLocaleInput | false | undefined =
    pagination !== false && typeof pagination === 'object' ? pagination.locale : undefined
  const tableLocaleInput: TigerLocaleInput | undefined = locale
  const isPaginationI18nDisabled = paginationLocaleInput === false
  const immediatePaginationLocale = useMemo(
    () =>
      paginationLocaleInput && !isPaginationI18nDisabled
        ? getImmediateTigerLocale(paginationLocaleInput)
        : undefined,
    [isPaginationI18nDisabled, paginationLocaleInput]
  )
  const [resolvedPaginationLocale, setResolvedPaginationLocale] = useState<
    Partial<TigerLocale> | undefined
  >(immediatePaginationLocale)
  const immediateTableLocale = useMemo(
    () => (tableLocaleInput ? getImmediateTigerLocale(tableLocaleInput) : undefined),
    [tableLocaleInput]
  )
  const [resolvedTableLocale, setResolvedTableLocale] = useState<Partial<TigerLocale> | undefined>(
    immediateTableLocale
  )

  useEffect(() => {
    let active = true
    setResolvedPaginationLocale(immediatePaginationLocale)

    if (
      paginationLocaleInput &&
      !isPaginationI18nDisabled &&
      isLazyTigerLocale(paginationLocaleInput)
    ) {
      resolveTigerLocale(paginationLocaleInput)
        .then((nextLocale) => {
          if (active) setResolvedPaginationLocale(nextLocale)
        })
        .catch(() => {
          if (active) setResolvedPaginationLocale(immediatePaginationLocale)
        })
    }

    return () => {
      active = false
    }
  }, [isPaginationI18nDisabled, paginationLocaleInput, immediatePaginationLocale])

  useEffect(() => {
    let active = true
    setResolvedTableLocale(immediateTableLocale)

    if (tableLocaleInput && isLazyTigerLocale(tableLocaleInput)) {
      resolveTigerLocale(tableLocaleInput)
        .then((nextLocale) => {
          if (active) setResolvedTableLocale(nextLocale)
        })
        .catch(() => {
          if (active) setResolvedTableLocale(immediateTableLocale)
        })
    }

    return () => {
      active = false
    }
  }, [tableLocaleInput, immediateTableLocale])

  const paginationLocale = useMemo(
    () =>
      isPaginationI18nDisabled
        ? undefined
        : mergeTigerLocale(config.locale, resolvedPaginationLocale),
    [config.locale, isPaginationI18nDisabled, resolvedPaginationLocale]
  )

  const tableLocale = useMemo(
    () => mergeTigerLocale(config.locale, resolvedTableLocale),
    [config.locale, resolvedTableLocale]
  )

  const tableLabelOverrides = useMemo(
    () => (emptyText === undefined ? labels : { ...labels, emptyText }),
    [emptyText, labels]
  )

  const tableLabels = useMemo(
    () => getTableLabels(tableLocale, tableLabelOverrides),
    [tableLabelOverrides, tableLocale]
  )

  const ctx = useTableState({
    columns: columns as TableProps['columns'],
    dataSource: dataSource as Record<string, unknown>[],
    hiddenColumnKeys,
    defaultHiddenColumnKeys,
    sort,
    defaultSort,
    filters,
    defaultFilters,
    pagination,
    rowSelection: internalRowSelection,
    expandable: internalExpandable,
    rowKey: rowKey as string | ((record: Record<string, unknown>) => string | number),
    editable,
    editableCells,
    filterMode,
    advancedFilterRules,
    groupBy,
    sorts,
    columnWidths,
    collapsedGroupKeys,
    exportScope,
    exportFilename,
    columnOrder,
    columnFixed,
    sortLocale: tableLocale?.locale,
    rowDraggable,
    measuredColumnWidths,
    containerWidth: measuredContainerSize.width,
    onChange,
    onRowClick: onRowClick as
      ((record: Record<string, unknown>, index: number) => void) | undefined,
    onSelectionChange,
    onSortChange,
    onFilterChange,
    onHiddenColumnKeysChange,
    onPageChange,
    onExpandChange: onExpandChange as
      | ((
          expandedKeys: (string | number)[],
          record: Record<string, unknown>,
          expanded: boolean
        ) => void)
      | undefined,
    onCellChange: onCellChange
      ? (rowIndex, columnKey, newValue, nextData) => {
          onCellChange(rowIndex, columnKey, newValue, nextData as T[])
        }
      : undefined,
    onColumnOrderChange: onColumnOrderChange as ((columns: TableColumn[]) => void) | undefined,
    onColumnFixedChange: onColumnFixedChange as TableProps['onColumnFixedChange'],
    onRowOrderChange: onRowOrderChange as ((rows: Record<string, unknown>[]) => void) | undefined,
    onExport,
    onSelectLoaded
  })

  const cardLayoutMap = useMemo(() => {
    const map = new Map<string, TableCardLayoutItem>()
    if (cardLayout) {
      for (const item of cardLayout) {
        map.set(item.key, item)
      }
    }
    return map
  }, [cardLayout])

  const hasCustomCardLayout = useMemo(() => {
    return ctx.displayColumns.some((col) => col.cardGrid) || (cardLayout && cardLayout.length > 0)
  }, [ctx.displayColumns, cardLayout])

  const virtualRecommendation = useMemo(
    () =>
      getTableVirtualRecommendation({
        virtual,
        autoVirtual,
        dataLength: ctx.paginatedData.length,
        threshold: virtualThreshold
      }),
    [autoVirtual, ctx.paginatedData.length, virtual, virtualThreshold]
  )

  const virtualAllowed = canUseTableVirtualWindow({ expandable: internalExpandable, groupBy })
  if (virtualRecommendation.enabled && !virtualAllowed) {
    devWarn(
      'Table.virtual',
      'Table virtual window is off because expanded rows or groups do not have one fixed height'
    )
  }
  const showCardTree = responsiveMode === 'card' && isCardViewport
  const showTableTree = !showCardTree

  const liveRegion = useRef<ReturnType<typeof manageLiveRegion> | null>(null)
  useEffect(() => {
    const region = manageLiveRegion('polite')
    liveRegion.current = region
    return () => {
      region.destroy()
      liveRegion.current = null
    }
  }, [])
  const announcedRef = useRef<{ count: number; sort: string } | null>(null)
  const selectedCount = ctx.selectedRowKeySet.size
  const sortSignature = `${ctx.sortState.key ?? ''}:${ctx.sortState.direction ?? ''}`
  useEffect(() => {
    const previous = announcedRef.current
    announcedRef.current = { count: selectedCount, sort: sortSignature }
    if (!previous || !liveRegion.current) return
    if (previous.count !== selectedCount) {
      liveRegion.current.announce(
        formatTableSelectionCount(
          tableLabels.selectionCountText,
          selectedCount,
          tableLocale?.locale
        )
      )
    }
    if (previous.sort !== sortSignature && ctx.sortState.key && ctx.sortState.direction) {
      const column = ctx.displayColumns.find((item) => item.key === ctx.sortState.key)
      liveRegion.current.announce(
        formatTableSortAnnouncement(
          tableLabels.sortAnnouncementText,
          String(column?.title ?? ctx.sortState.key),
          ctx.sortState.direction === 'asc'
            ? tableLabels.sortAscendingText
            : tableLabels.sortDescendingText
        )
      )
    }
  }, [
    ctx.displayColumns,
    ctx.sortState.direction,
    ctx.sortState.key,
    selectedCount,
    sortSignature,
    tableLabels.selectionCountText,
    tableLabels.sortAnnouncementText,
    tableLabels.sortAscendingText,
    tableLabels.sortDescendingText,
    tableLocale?.locale
  ])

  useEffect(() => {
    if (cardViewportControlled || responsiveMode !== 'card') {
      if (!cardViewportControlled) setUncontrolledCardViewport(false)
      return undefined
    }
    return subscribeTableCardViewport(cardBreakpoint, setUncontrolledCardViewport)
  }, [cardViewportControlled, responsiveMode, cardBreakpoint])

  // Row windowing: track the scroll position and compute the visible slice.
  const [virtualScrollTop, setVirtualScrollTop] = useState(0)
  const [columnScrollLeft, setColumnScrollLeft] = useState(0)
  const virtualScrollerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (typeof scrollToIndex !== 'number' || !virtualScrollerRef.current) return
    const top = Math.max(0, scrollToIndex) * virtualItemHeight
    virtualScrollerRef.current.scrollTop = top
    setVirtualScrollTop(top)
  }, [scrollToIndex, virtualItemHeight])
  const [virtualClientHeight, setVirtualClientHeight] = useState(0)
  const declaredRowHeight = virtualItemHeight
  const unevenRows = Object.values(measuredRowHeights).some(
    (height) => Math.abs(height - declaredRowHeight) > 1
  )
  if (virtualRecommendation.enabled && virtualAllowed && unevenRows) {
    devWarn(
      'Table.virtual.rowHeight',
      'Table virtual window is off because a measured row does not match virtualItemHeight'
    )
  }
  const virtualViewport = resolveScrollportViewport(
    virtualClientHeight,
    typeof virtualHeight === 'number' ? virtualHeight : 0
  )
  const pageFits =
    virtualViewport > 0 && ctx.paginatedData.length * declaredRowHeight <= virtualViewport
  const effectiveVirtual =
    virtualRecommendation.enabled && virtualAllowed && !unevenRows && !pageFits && !showCardTree
  const virtualWindow = useMemo(
    () =>
      effectiveVirtual
        ? getTableVirtualWindow(
            virtualScrollTop,
            virtualViewport,
            declaredRowHeight,
            ctx.paginatedData.length
          )
        : undefined,
    [
      effectiveVirtual,
      virtualScrollTop,
      virtualViewport,
      declaredRowHeight,
      ctx.paginatedData.length
    ]
  )
  const shouldObserveGeometry =
    effectiveVirtual ||
    columnLockable ||
    ctx.displayColumns.some((column) => column.fixed === 'start' || column.fixed === 'end')

  useEffect(() => {
    setVirtualScrollTop(0)
    if (virtualScrollerRef.current) virtualScrollerRef.current.scrollTop = 0
  }, [ctx.currentPage])

  const wrapperStyle = useMemo(() => {
    return maxHeight
      ? {
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
        }
      : undefined
  }, [maxHeight])

  useEffect(() => {
    if (!shouldObserveGeometry) {
      return undefined
    }

    const wrapper = wrapperRef.current
    if (!wrapper) {
      return undefined
    }

    const controller = createTableResizeObserverController({
      onResize: (snapshot) => {
        setMeasuredColumnWidths((prev) =>
          areNumberRecordsEqual(prev, snapshot.columnWidths) ? prev : snapshot.columnWidths
        )
        setMeasuredRowHeights((prev) =>
          areNumberRecordsEqual(prev, snapshot.rowHeights) ? prev : snapshot.rowHeights
        )
        setMeasuredContainerSize((prev) =>
          prev.width === snapshot.containerWidth && prev.height === snapshot.containerHeight
            ? prev
            : { width: snapshot.containerWidth, height: snapshot.containerHeight }
        )
        const scroller = virtualScrollerRef.current
        if (scroller) {
          const next = scroller.clientHeight
          setVirtualClientHeight((current) => (current === next ? current : next))
        }
      }
    })

    controller.observe(wrapper, tableRef.current)
    return () => controller.disconnect()
  }, [shouldObserveGeometry, ctx.displayColumns.length, ctx.paginatedData.length])

  const columnSlice = virtualizeMiddleColumns({
    columns: ctx.displayColumns,
    widths: ctx.displayColumns.map((column) => parseWidthToPx(column.width)),
    scrollLeft: columnScrollLeft,
    viewportWidth: typeof width === 'number' ? width : 0,
    overscan,
    enabled: virtualizeColumns
  })
  const renderedColumns = columnSlice.active
    ? [...columnSlice.start, ...columnSlice.middle, ...columnSlice.end]
    : undefined

  const tableInner = (
    <table
      ref={tableRef}
      className={classNames(
        tableBaseClasses,
        responsiveMode === 'scroll'
          ? getTableResponsiveTableClasses(responsiveMode, cardBreakpoint)
          : undefined,
        tableLayout === 'fixed' ? 'table-fixed' : 'table-auto',
        className
      )}
      {...props}
      data-keyboard-mode={grid ? resolveTableKeyboardMode(true) : undefined}
      data-grid-cell={grid ? `${gridCell.row}-${gridCell.column}` : undefined}
      tabIndex={grid ? 0 : undefined}
      onKeyDown={
        grid
          ? (event) => {
              const next = nextGridCell({
                row: gridCell.row,
                column: gridCell.column,
                rowCount: ctx.paginatedData.length,
                columnCount: ctx.displayColumns.length,
                key: event.key
              })
              if (!next || !event.key.startsWith('Arrow')) return
              event.preventDefault()
              setGridCell(next)
            }
          : undefined
      }
      aria-label={ariaLabel || tableLabels.tableAriaLabel}
      aria-rowcount={virtual ? ctx.paginatedData.length + 1 : undefined}
      aria-colcount={virtualizeColumns ? ctx.displayColumns.length : undefined}
      style={
        ctx.fixedColumnsInfo.hasFixedColumns && ctx.fixedColumnsInfo.minTableWidth
          ? {
              ...(props as React.HTMLAttributes<HTMLTableElement>).style,
              minWidth: `${ctx.fixedColumnsInfo.minTableWidth}px`
            }
          : (props as React.HTMLAttributes<HTMLTableElement>).style
      }>
      {(columnLockable || ctx.fixedColumnsInfo.hasFixedColumns) && (
        <colgroup>
          {getTableColgroup({
            columns: ctx.displayColumns,
            frozenWidths: ctx.frozenColumnWidths,
            size,
            hasSelectionColumn: hasTableSelectionColumn(internalRowSelection),
            expand: resolveTableExpandSlot(internalExpandable)
          }).map((entry, index) => (
            <col
              key={`${entry.key}-${index}`}
              style={entry.width ? { width: entry.width } : undefined}
            />
          ))}
        </colgroup>
      )}
      {renderTableHeader(ctx, {
        size,
        stickyHeader,
        rowSelection: internalRowSelection,
        expandable: internalExpandable,
        columnLockable,
        columnDraggable,
        lockColumnAriaLabel: tableLabels.lockColumnAriaLabel,
        unlockColumnAriaLabel: tableLabels.unlockColumnAriaLabel,
        labels: tableLabels,
        selectionName: selectionGroupName,
        filterMode,
        renderedColumns
      })}
      {renderTableBody(ctx, {
        size,
        hoverable,
        striped,
        loading,
        emptyText: tableLabels.emptyText,
        rowSelection: internalRowSelection,
        expandable: internalExpandable,
        labels: tableLabels,
        rowClassName: internalRowClassName,
        rowDraggable,
        interactiveRows: !!onRowClick || !!internalRowSelection,
        virtualWindow,
        virtualItemHeight,
        renderedColumns,
        selectionName: selectionGroupName,
        activeRowIndex,
        onActiveRowIndex: setActiveRowIndex,
        grid
      })}
      {renderSummaryRow(ctx, {
        size,
        rowSelection: internalRowSelection,
        expandable: internalExpandable,
        summaryRow
      })}
    </table>
  )

  const virtualScrollerStyle = {
    height: typeof virtualHeight === 'number' ? `${virtualHeight}px` : virtualHeight,
    overflow: 'auto' as const
  }

  const cardHeightWindow = cardVirtualWindow({
    scrollTop: virtualScrollTop,
    viewportHeight: typeof virtualHeight === 'number' ? virtualHeight : 240,
    cardHeight: cardItemHeight,
    variable: false,
    count: ctx.paginatedData.length
  })

  const tableContent =
    showTableTree &&
    (effectiveVirtual ? (
      <div
        ref={virtualScrollerRef}
        style={virtualScrollerStyle}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement
          setVirtualScrollTop(target.scrollTop)
          setColumnScrollLeft(target.scrollLeft)
        }}>
        {tableInner}
      </div>
    ) : (
      tableInner
    ))

  return (
    <div
      ref={wrapperRef}
      className={getTableWrapperClasses(bordered, maxHeight, !effectiveVirtual)}
      style={wrapperStyle}
      data-tiger-virtual={effectiveVirtual ? 'enabled' : undefined}
      data-tiger-virtual-recommended={virtualRecommendation.recommended ? 'true' : undefined}
      data-tiger-virtual-threshold={
        virtualRecommendation.recommended ? virtualRecommendation.threshold : undefined
      }
      data-tiger-measured-row-height={Object.values(measuredRowHeights)[0] || undefined}
      data-tiger-table-layout={showCardTree ? 'card' : 'table'}
      aria-busy={loading}>
      <TableW9Panel
        active={sorts !== undefined}
        columns={ctx.displayColumns}
        sorts={ctx.multiSort}
        pageKeys={ctx.pageRowKeys}
        loadedKeys={ctx.processedRowKeys}
        disabledKeys={ctx.paginatedData.flatMap((record, index) => {
          const key = ctx.pageRowKeys[index]
          const checkbox = internalRowSelection?.getCheckboxProps?.(record)
          return checkbox?.disabled && key !== undefined ? [key] : []
        })}
        pageRecords={ctx.paginatedData}
        processedRecords={ctx.processedData}
        processedKeys={ctx.processedRowKeys}
        selectedKeys={ctx.selectedRowKeys ?? []}
        onSort={(key) => ctx.applyMultiSort(key)}
        onFilter={(key, value) => ctx.handleFilter(key, value)}
        onHide={(key) => {
          const hidden = ctx.hiddenColumnKeys.includes(key)
            ? ctx.hiddenColumnKeys.filter((item) => item !== key)
            : [...ctx.hiddenColumnKeys, key]
          ctx.handleSetHiddenColumns(hidden)
        }}
        onResize={(key, width) => ctx.applyColumnWidth(key, width)}
        onSelection={(keys) => ctx.replaceSelectedKeys(keys)}
        onRemoteSelect={() => ctx.handleSelectLoaded(true)}
      />
      {ctx.dragLive ? (
        <div role="status" data-tiger-drag-live="">
          {ctx.dragLive}
        </div>
      ) : null}
      {exportable && (
        <div className={tableExportBarClasses}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label={tableLabels.exportCsvAriaLabel}
            onClick={ctx.handleExport}>
            {tableLabels.exportCsvText}
          </Button>
        </div>
      )}

      {tableContent}

      {showCardTree && (
        <div
          className={tableCardListVisibleClasses}
          data-tiger-table-mobile="card"
          data-tiger-card-window={
            cardHeightWindow ? `${cardHeightWindow.start}-${cardHeightWindow.end}` : undefined
          }>
          {internalRowSelection?.type !== 'radio' &&
          internalRowSelection?.showCheckbox !== false &&
          internalRowSelection &&
          !loading &&
          ctx.paginatedData.length > 0 ? (
            <div className="flex items-center justify-between rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-3 py-2">
              <Checkbox
                size="sm"
                checked={ctx.allSelected}
                indeterminate={ctx.someSelected}
                onChange={(checked) => ctx.handleSelectAll(checked)}>
                {tableLabels.selectAllText}
              </Checkbox>
            </div>
          ) : null}
          {ctx.displayColumns.some((column) => column.sortable) ? (
            <div className="rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-3 py-2">
              <Select
                size="sm"
                aria-label={tableLabels.sortMenuAriaLabel}
                value={getTableCardSortValue(ctx.sortState)}
                options={[
                  { label: tableLabels.clearSortText, value: TABLE_CARD_SORT_NONE },
                  ...ctx.displayColumns
                    .filter((column) => column.sortable)
                    .flatMap((column) => [
                      {
                        label: `${formatTableSortByText(tableLabels.sortByText, column.title)} ↑`,
                        value: `${column.key}:asc`
                      },
                      {
                        label: `${formatTableSortByText(tableLabels.sortByText, column.title)} ↓`,
                        value: `${column.key}:desc`
                      }
                    ])
                ]}
                clearable={false}
                onChange={(value) => {
                  ctx.handleSetSort(parseTableCardSortValue(value))
                }}
              />
            </div>
          ) : null}
          {loading ? null : ctx.paginatedData.length === 0 ? (
            <div
              className={getTableResponsiveCardClasses(cardPadding)}
              role="status"
              aria-live="polite">
              <Empty showImage={false} description={tableLabels.emptyText} />
            </div>
          ) : (
            <>
              {effectiveVirtual && virtualWindow && virtualWindow.topPad > 0 ? (
                <div aria-hidden="true" style={{ height: `${virtualWindow.topPad}px` }} />
              ) : null}
              {ctx.paginatedData
                .slice(
                  cardHeightWindow
                    ? cardHeightWindow.start
                    : effectiveVirtual && virtualWindow
                      ? virtualWindow.startIndex
                      : 0,
                  cardHeightWindow
                    ? cardHeightWindow.end
                    : effectiveVirtual && virtualWindow
                      ? virtualWindow.endIndex + 1
                      : ctx.paginatedData.length
                )
                .map((record, offset) => {
                  const index =
                    (effectiveVirtual && virtualWindow ? virtualWindow.startIndex : 0) + offset
                  const sourceIndex = ctx.pageSourceIndices[index] ?? index
                  const key = ctx.pageRowKeys[index]
                  const isExpanded = ctx.expandedRowKeySet.has(tableRowKeyId(key))
                  const isSelected = ctx.selectedRowKeySet.has(tableRowKeyId(key))
                  const isRowExpandable = internalExpandable
                    ? internalExpandable.rowExpandable
                      ? internalExpandable.rowExpandable(record)
                      : true
                    : false
                  const expandedContent =
                    internalExpandable && isExpanded && isRowExpandable
                      ? internalExpandable.expandedRowRender?.(record, sourceIndex)
                      : null
                  const expandedNode = expandedContent as React.ReactNode
                  const renderContext = {
                    record: record as T,
                    index: sourceIndex,
                    columns: ctx.displayColumns as TableColumn<T>[],
                    selected: isSelected,
                    expanded: isExpanded,
                    toggleExpand: () => ctx.handleToggleExpand(key, record),
                    selectRow: (checked: boolean) => ctx.handleSelectRow(key, checked)
                  }
                  const customCard = renderCard?.(renderContext)
                  const resolvedCardClassName =
                    typeof cardClassName === 'function'
                      ? cardClassName(record as T, sourceIndex)
                      : cardClassName
                  const controlsNode =
                    (internalRowSelection?.showCheckbox !== false && internalRowSelection) ||
                    (internalExpandable && isRowExpandable) ? (
                      <>
                        {internalRowSelection && internalRowSelection.showCheckbox !== false && (
                          <span onClick={(event) => event.stopPropagation()}>
                            {internalRowSelection.type === 'radio' ? (
                              <Radio
                                name={selectionGroupName}
                                value={key}
                                checked={isSelected}
                                disabled={internalRowSelection.getCheckboxProps?.(record)?.disabled}
                                aria-label={formatTableSelectRowAriaLabel(
                                  tableLabels.selectRowAriaLabel,
                                  sourceIndex + 1,
                                  tableLocale?.locale
                                )}
                                onChange={() => ctx.handleSelectRow(key, true)}
                              />
                            ) : (
                              <Checkbox
                                size="sm"
                                checked={isSelected}
                                disabled={internalRowSelection.getCheckboxProps?.(record)?.disabled}
                                aria-label={formatTableSelectRowAriaLabel(
                                  tableLabels.selectRowAriaLabel,
                                  sourceIndex + 1,
                                  tableLocale?.locale
                                )}
                                onChange={(checked) => ctx.handleSelectRow(key, checked)}
                              />
                            )}
                          </span>
                        )}
                        {internalExpandable && isRowExpandable && (
                          <button
                            type="button"
                            className="text-sm text-[var(--tiger-primary)]"
                            aria-expanded={isExpanded}
                            onClick={(event) => {
                              event.stopPropagation()
                              ctx.handleToggleExpand(key, record)
                            }}>
                            {isExpanded ? tableLabels.collapseText : tableLabels.expandText}
                          </button>
                        )}
                      </>
                    ) : null

                  const hasCardControls = Boolean(controlsNode)
                  const cardInteractive = Boolean(onRowClick || internalRowSelection)

                  return (
                    <div
                      key={key}
                      className={classNames(
                        getTableResponsiveCardClasses(cardPadding),
                        resolvedCardClassName
                      )}
                      tabIndex={cardInteractive && !hasCardControls ? 0 : undefined}
                      onClick={() => ctx.handleRowClick(record, sourceIndex, key)}
                      onKeyDown={
                        cardInteractive && !hasCardControls
                          ? (event) => {
                              if (event.target !== event.currentTarget) return
                              if (isActivationKey(event)) {
                                event.preventDefault()
                                ctx.handleRowClick(record, sourceIndex, key)
                              }
                            }
                          : undefined
                      }>
                      {customCard !== undefined && customCard !== null ? (
                        (customCard as React.ReactNode)
                      ) : (
                        <>
                          {(() => {
                            const { titleColumn, bodyColumns } = getCardColumns(ctx.displayColumns)
                            const renderCellContent = (column: TableColumn) => {
                              const dataKey = column.dataKey || column.key
                              return column.render
                                ? (column.render(record, sourceIndex) as React.ReactNode)
                                : (record[dataKey] as React.ReactNode)
                            }

                            if (hasCustomCardLayout) {
                              return (
                                <>
                                  {titleColumn && (
                                    <div
                                      className={classNames(
                                        tableResponsiveCardTitleClasses,
                                        cardSelectionPosition === 'title-inline' &&
                                          controlsNode &&
                                          'flex items-center gap-3'
                                      )}>
                                      {cardSelectionPosition === 'title-inline' && controlsNode}
                                      <span className="min-w-0 flex-1">
                                        {renderCellContent(titleColumn)}
                                      </span>
                                    </div>
                                  )}
                                  {(!titleColumn || cardSelectionPosition !== 'title-inline') &&
                                    controlsNode && (
                                      <div className="mb-2 flex items-center gap-3">
                                        {controlsNode}
                                      </div>
                                    )}
                                  <div
                                    className={classNames('grid grid-cols-12 mt-2', cardFieldGap)}>
                                    {bodyColumns.map((column) => {
                                      const layoutItem = cardLayoutMap.get(column.key)
                                      const gridInfo = getCardGridInfo(column, layoutItem)

                                      if (gridInfo.hideLabel) {
                                        return (
                                          <div
                                            key={column.key}
                                            className={classNames(
                                              gridInfo.className,
                                              gridInfo.divider &&
                                                'border-t border-[var(--tiger-border)] pt-3'
                                            )}>
                                            {renderCellContent(column)}
                                          </div>
                                        )
                                      }

                                      if (gridInfo.labelPosition === 'top') {
                                        return (
                                          <div
                                            key={column.key}
                                            className={classNames(
                                              gridInfo.className,
                                              gridInfo.divider &&
                                                'border-t border-[var(--tiger-border)] pt-3'
                                            )}>
                                            <div
                                              className={classNames(
                                                'text-xs font-medium uppercase tracking-wider text-[var(--tiger-text-secondary)] mb-1',
                                                gridInfo.labelClassName
                                              )}>
                                              {column.title}
                                            </div>
                                            <div
                                              className={classNames(
                                                'min-w-0 text-sm text-[var(--tiger-text)] break-words',
                                                gridInfo.valueClassName
                                              )}>
                                              {renderCellContent(column)}
                                            </div>
                                          </div>
                                        )
                                      }

                                      return (
                                        <div
                                          key={column.key}
                                          className={classNames(
                                            gridInfo.className,
                                            'grid grid-cols-[auto_1fr] gap-2 items-baseline',
                                            gridInfo.divider &&
                                              'border-t border-[var(--tiger-border)] pt-3'
                                          )}>
                                          <div
                                            className={classNames(
                                              'text-xs font-medium uppercase tracking-wider text-[var(--tiger-text-secondary)] shrink-0',
                                              gridInfo.labelClassName
                                            )}>
                                            {column.title}
                                          </div>
                                          <div
                                            className={classNames(
                                              'min-w-0 text-sm text-[var(--tiger-text)] break-words',
                                              gridInfo.valueClassName
                                            )}>
                                            {renderCellContent(column)}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </>
                              )
                            }

                            return (
                              <>
                                {titleColumn && (
                                  <div
                                    className={classNames(
                                      tableResponsiveCardTitleClasses,
                                      cardSelectionPosition === 'title-inline' &&
                                        controlsNode &&
                                        'flex items-center gap-3'
                                    )}>
                                    {cardSelectionPosition === 'title-inline' && controlsNode}
                                    <span className="min-w-0 flex-1">
                                      {renderCellContent(titleColumn)}
                                    </span>
                                  </div>
                                )}
                                {(!titleColumn || cardSelectionPosition !== 'title-inline') &&
                                  controlsNode && (
                                    <div className="mb-2 flex items-center gap-3">
                                      {controlsNode}
                                    </div>
                                  )}
                                {bodyColumns.map((column) => (
                                  <div key={column.key} className={tableResponsiveCardRowClasses}>
                                    <div className={tableResponsiveCardLabelClasses}>
                                      {column.title}
                                    </div>
                                    <div className={tableResponsiveCardValueClasses}>
                                      {renderCellContent(column)}
                                    </div>
                                  </div>
                                ))}
                              </>
                            )
                          })()}

                          {expandedNode && (
                            <div className="mt-3 border-t border-[var(--tiger-border)] pt-3">
                              {expandedNode}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              {effectiveVirtual && virtualWindow && virtualWindow.bottomPad > 0 ? (
                <div aria-hidden="true" style={{ height: `${virtualWindow.bottomPad}px` }} />
              ) : null}
            </>
          )}
        </div>
      )}

      {loading && (
        <div
          className={tableLoadingOverlayClasses}
          role="status"
          aria-live="polite"
          aria-label={tableLabels.loadingText}>
          <Loading aria-hidden role="presentation" />
          <span className="sr-only">{tableLabels.loadingText}</span>
        </div>
      )}

      {renderPagination(ctx, {
        pagination,
        locale: paginationLocale,
        disableI18n: isPaginationI18nDisabled,
        size
      })}
    </div>
  )
}

function areNumberRecordsEqual(
  current: Record<string | number, number>,
  next: Record<string | number, number>
): boolean {
  const currentKeys = Object.keys(current)
  const nextKeys = Object.keys(next)
  return (
    currentKeys.length === nextKeys.length && nextKeys.every((key) => current[key] === next[key])
  )
}
