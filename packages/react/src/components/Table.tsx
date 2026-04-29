import React, { useMemo } from 'react'
import {
  classNames,
  getTableWrapperClasses,
  tableBaseClasses,
  tableLoadingOverlayClasses,
  tableExportButtonClasses,
  type RowSelectionConfig,
  type ExpandableConfig
} from '@expcat/tigercat-core'

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
  // v0.6.0 props
  virtual = false,
  virtualHeight = 400,
  virtualItemHeight: _virtualItemHeight = 40,
  editable = false,
  editableCells,
  filterMode = 'basic',
  advancedFilterRules = [],
  columnDraggable = false,
  summaryRow,
  groupBy,
  exportable = false,
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
  onExport,
  className,
  ...props
}: TableProps<T>) {
  const internalRowSelection = rowSelection as
    | RowSelectionConfig<Record<string, unknown>>
    | undefined
  const internalExpandable = expandable as ExpandableConfig<Record<string, unknown>> | undefined
  const internalRowClassName = rowClassName as
    | string
    | ((record: Record<string, unknown>, index: number) => string)
    | undefined

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
    exportFilename,
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
    onColumnOrderChange,
    onExport
  })

  const wrapperStyle = useMemo(() => {
    if (virtual) {
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
  }, [maxHeight, virtual, virtualHeight])

  return (
    <div
      className={getTableWrapperClasses(
        bordered,
        maxHeight || (virtual ? virtualHeight : undefined)
      )}
      style={wrapperStyle}
      aria-busy={loading}>
      {exportable && (
        <div className="mb-2 flex justify-end">
          <button type="button" className={tableExportButtonClasses} onClick={ctx.handleExport}>
            Export CSV
          </button>
        </div>
      )}

      <table
        className={classNames(
          tableBaseClasses,
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
          rowClassName: internalRowClassName
        })}
        {renderSummaryRow(ctx, {
          size,
          rowSelection: internalRowSelection,
          expandable: internalExpandable,
          summaryRow
        })}
      </table>

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

      {renderPagination(ctx, { pagination })}
    </div>
  )
}
