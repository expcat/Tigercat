import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  createTableResizeObserverController,
  getTableWrapperClasses,
  getCardColumns,
  getTableResponsiveCardListClasses,
  getTableResponsiveTableClasses,
  getTableVirtualRecommendation,
  tableBaseClasses,
  tableResponsiveCardClasses,
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
  type TableColumn,
  type TigerLocale,
  type TigerLocaleInput
} from '@expcat/tigercat-core'
import { tableExportButtonClasses } from '@expcat/tigercat-core'

import { useTigerConfig } from './ConfigProvider'
import { LoadingSpinner } from './Table/icons'
import { useTableState } from './Table/state'
import { renderTableHeader } from './Table/render-header'
import { renderTableBody } from './Table/render-body'
import { renderSummaryRow } from './Table/render-summary'
import { renderPagination } from './Table/render-pagination'
import type { TableProps } from './Table/types'

export type { TableProps } from './Table/types'

export function Table<T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  columnLockable = false,
  dataSource = [],
  sort,
  defaultSort,
  filters,
  defaultFilters,
  size = 'md',
  bordered = false,
  striped = false,
  hoverable = true,
  loading = false,
  emptyText = 'No data',
  pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: [10, 20, 50, 100],
    showSizeChanger: true,
    showTotal: true
  },
  rowSelection,
  expandable,
  rowKey = 'id',
  rowClassName,
  stickyHeader = false,
  maxHeight,
  tableLayout = 'auto',
  responsiveMode = 'scroll',
  cardBreakpoint = 'sm',
  // v0.6.0 props
  virtual = false,
  autoVirtual = true,
  virtualHeight = 400,
  virtualItemHeight: _virtualItemHeight = 40,
  autoVirtualThreshold = 10000,
  virtualThreshold = 1000,
  editable = false,
  editableCells,
  filterMode = 'basic',
  advancedFilterRules = [],
  columnDraggable = false,
  rowDraggable = false,
  summaryRow,
  groupBy,
  exportable = false,
  exportFormat = 'csv',
  exportFilename = 'export',
  onChange,
  onRowClick,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  onPageChange,
  onExpandChange,
  onCellChange,
  onColumnOrderChange,
  onRowOrderChange,
  onExport,
  className,
  ...props
}: TableProps<T>) {
  const config = useTigerConfig()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const tableRef = useRef<HTMLTableElement | null>(null)
  const [measuredColumnWidths, setMeasuredColumnWidths] = useState<Record<string, number>>({})
  const [measuredRowHeights, setMeasuredRowHeights] = useState<number[]>([])
  const internalRowSelection = rowSelection as
    | RowSelectionConfig<Record<string, unknown>>
    | undefined
  const internalExpandable = expandable as ExpandableConfig<Record<string, unknown>> | undefined
  const internalRowClassName = rowClassName as
    | string
    | ((record: Record<string, unknown>, index: number) => string)
    | undefined
  const paginationLocaleInput: TigerLocaleInput | false | undefined =
    pagination !== false && typeof pagination === 'object' ? pagination.locale : undefined
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

  const paginationLocale = useMemo(
    () =>
      isPaginationI18nDisabled
        ? undefined
        : mergeTigerLocale(config.locale, resolvedPaginationLocale),
    [config.locale, isPaginationI18nDisabled, resolvedPaginationLocale]
  )

  const ctx = useTableState({
    columns: columns as TableProps['columns'],
    dataSource: dataSource as Record<string, unknown>[],
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
    exportFormat,
    exportFilename,
    measuredColumnWidths,
    onChange,
    onRowClick: onRowClick as
      | ((record: Record<string, unknown>, index: number) => void)
      | undefined,
    onSelectionChange,
    onSortChange,
    onFilterChange,
    onPageChange,
    onExpandChange: onExpandChange as
      | ((
          expandedKeys: (string | number)[],
          record: Record<string, unknown>,
          expanded: boolean
        ) => void)
      | undefined,
    onCellChange,
    onColumnOrderChange: onColumnOrderChange as ((columns: TableColumn[]) => void) | undefined,
    onRowOrderChange: onRowOrderChange as ((rows: Record<string, unknown>[]) => void) | undefined,
    onExport
  })

  const virtualRecommendation = useMemo(
    () =>
      getTableVirtualRecommendation({
        virtual,
        autoVirtual,
        dataLength: dataSource.length,
        threshold: virtualThreshold,
        autoThreshold: autoVirtualThreshold
      }),
    [autoVirtual, autoVirtualThreshold, dataSource.length, virtual, virtualThreshold]
  )

  const effectiveVirtual = virtualRecommendation.enabled

  const wrapperStyle = useMemo(() => {
    if (effectiveVirtual) {
      return {
        height: typeof virtualHeight === 'number' ? `${virtualHeight}px` : virtualHeight,
        overflow: 'auto' as const
      }
    }
    return maxHeight
      ? {
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
        }
      : undefined
  }, [effectiveVirtual, maxHeight, virtualHeight])

  useEffect(() => {
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
          areNumberArraysEqual(prev, snapshot.rowHeights) ? prev : snapshot.rowHeights
        )
      }
    })

    controller.observe(wrapper, tableRef.current)
    return () => controller.disconnect()
  }, [ctx.displayColumns.length, ctx.paginatedData.length])

  return (
    <div
      ref={wrapperRef}
      className={getTableWrapperClasses(
        bordered,
        maxHeight || (virtual ? virtualHeight : undefined)
      )}
      style={wrapperStyle}
      data-tiger-virtual={virtualRecommendation.enabled ? 'enabled' : undefined}
      data-tiger-virtual-auto={virtualRecommendation.autoEnabled ? 'true' : undefined}
      data-tiger-virtual-recommended={virtualRecommendation.recommended ? 'true' : undefined}
      data-tiger-virtual-threshold={
        virtualRecommendation.recommended ? virtualRecommendation.threshold : undefined
      }
      data-tiger-measured-row-height={measuredRowHeights[0] || undefined}
      aria-busy={loading}>
      {exportable && (
        <div className="mb-2 flex justify-end">
          <button type="button" className={tableExportButtonClasses} onClick={ctx.handleExport}>
            {exportFormat === 'excel' ? 'Export Excel' : 'Export CSV'}
          </button>
        </div>
      )}

      <table
        ref={tableRef}
        className={classNames(
          tableBaseClasses,
          getTableResponsiveTableClasses(responsiveMode, cardBreakpoint),
          tableLayout === 'fixed' ? 'table-fixed' : 'table-auto',
          className
        )}
        {...props}
        style={
          ctx.fixedColumnsInfo.hasFixedColumns && ctx.fixedColumnsInfo.minTableWidth
            ? {
                ...(props as React.HTMLAttributes<HTMLTableElement>).style,
                minWidth: `${ctx.fixedColumnsInfo.minTableWidth}px`
              }
            : (props as React.HTMLAttributes<HTMLTableElement>).style
        }>
        {renderTableHeader(ctx, {
          size,
          stickyHeader,
          rowSelection: internalRowSelection,
          expandable: internalExpandable,
          columnLockable,
          columnDraggable
        })}
        {renderTableBody(ctx, {
          size,
          hoverable,
          striped,
          loading,
          emptyText,
          rowSelection: internalRowSelection,
          expandable: internalExpandable,
          rowClassName: internalRowClassName,
          rowDraggable
        })}
        {renderSummaryRow(ctx, {
          size,
          rowSelection: internalRowSelection,
          expandable: internalExpandable,
          summaryRow
        })}
      </table>

      {responsiveMode === 'card' && (
        <div
          className={getTableResponsiveCardListClasses(cardBreakpoint)}
          data-tiger-table-mobile="card">
          {ctx.paginatedData.length === 0 ? (
            <div className={tableResponsiveCardClasses}>{emptyText}</div>
          ) : (
            ctx.paginatedData.map((record, index) => {
              const key = ctx.pageRowKeys[index]
              const isExpanded = ctx.expandedRowKeySet.has(key)
              const isRowExpandable = internalExpandable
                ? internalExpandable.rowExpandable
                  ? internalExpandable.rowExpandable(record)
                  : true
                : false
              const expandedContent =
                internalExpandable && isExpanded && isRowExpandable
                  ? internalExpandable.expandedRowRender?.(record, index)
                  : null
              const expandedNode = expandedContent as React.ReactNode

              return (
                <div
                  key={key}
                  className={tableResponsiveCardClasses}
                  onClick={() => ctx.handleRowClick(record, index, key)}>
                  {(internalRowSelection?.showCheckbox !== false && internalRowSelection) ||
                  (internalExpandable && isRowExpandable) ? (
                    <div className="mb-2 flex items-center gap-3">
                      {internalRowSelection && internalRowSelection.showCheckbox !== false && (
                        <input
                          type={internalRowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                          checked={ctx.selectedRowKeySet.has(key)}
                          disabled={internalRowSelection.getCheckboxProps?.(record)?.disabled}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => ctx.handleSelectRow(key, event.target.checked)}
                        />
                      )}
                      {internalExpandable && isRowExpandable && (
                        <button
                          type="button"
                          className="text-sm text-[var(--tiger-primary,#2563eb)]"
                          aria-expanded={isExpanded}
                          onClick={(event) => {
                            event.stopPropagation()
                            ctx.handleToggleExpand(key, record)
                          }}>
                          {isExpanded ? 'Collapse' : 'Expand'}
                        </button>
                      )}
                    </div>
                  ) : null}

                  {(() => {
                    const { titleColumn, bodyColumns } = getCardColumns(ctx.displayColumns)
                    const renderCellContent = (column: TableColumn) => {
                      const dataKey = column.dataKey || column.key
                      return column.render
                        ? (column.render(record, index) as React.ReactNode)
                        : (record[dataKey] as React.ReactNode)
                    }

                    return (
                      <>
                        {titleColumn && (
                          <div className={tableResponsiveCardTitleClasses}>
                            {renderCellContent(titleColumn)}
                          </div>
                        )}
                        {bodyColumns.map((column) => (
                          <div key={column.key} className={tableResponsiveCardRowClasses}>
                            <div className={tableResponsiveCardLabelClasses}>{column.title}</div>
                            <div className={tableResponsiveCardValueClasses}>
                              {renderCellContent(column)}
                            </div>
                          </div>
                        ))}
                      </>
                    )
                  })()}

                  {expandedNode && (
                    <div className="mt-3 border-t border-[var(--tiger-border,#e5e7eb)] pt-3">
                      {expandedNode}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {loading && (
        <div
          className={tableLoadingOverlayClasses}
          role="status"
          aria-live="polite"
          aria-label="Loading">
          <LoadingSpinner />
          <span className="sr-only">Loading</span>
        </div>
      )}

      {renderPagination(ctx, {
        pagination,
        locale: paginationLocale,
        disableI18n: isPaginationI18nDisabled
      })}
    </div>
  )
}

function areNumberRecordsEqual(
  current: Record<string, number>,
  next: Record<string, number>
): boolean {
  const currentKeys = Object.keys(current)
  const nextKeys = Object.keys(next)
  return (
    currentKeys.length === nextKeys.length && nextKeys.every((key) => current[key] === next[key])
  )
}

function areNumberArraysEqual(current: number[], next: number[]): boolean {
  return current.length === next.length && next.every((value, index) => current[index] === value)
}
