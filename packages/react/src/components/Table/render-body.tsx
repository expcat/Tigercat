import React from 'react'
import {
  classNames,
  getTableRowClasses,
  getTableCellClasses,
  getCheckboxCellClasses,
  getExpandIconCellClasses,
  getExpandedRowClasses,
  getExpandedRowContentClasses,
  tableEmptyStateClasses,
  getEditableCellClasses,
  editableCellInputClasses,
  tableGroupHeaderClasses,
  getGroupHeaderCellClasses,
  type RowSelectionConfig,
  type ExpandableConfig,
  type TableSize
} from '@expcat/tigercat-core'
import { ExpandIcon } from './icons'
import type { TableContext } from './types'

export interface RenderBodyViewProps {
  size: TableSize
  hoverable: boolean
  striped: boolean
  loading: boolean
  emptyText: string
  rowSelection?: RowSelectionConfig
  expandable?: ExpandableConfig
  rowClassName?: string | ((record: Record<string, unknown>, index: number) => string) | undefined
}

export function renderTableBody(ctx: TableContext, view: RenderBodyViewProps): React.ReactNode {
  const { size, hoverable, striped, loading, emptyText, rowSelection, expandable, rowClassName } =
    view

  if (loading) {
    return null
  }

  if (ctx.paginatedData.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={ctx.totalColumnCount} className={tableEmptyStateClasses}>
            <div role="status" aria-live="polite">
              {emptyText}
            </div>
          </td>
        </tr>
      </tbody>
    )
  }

  function renderDataRow(record: Record<string, unknown>, index: number): React.ReactNode {
    const key = ctx.pageRowKeys[index]
    const isSelected = ctx.selectedRowKeySet.has(key)
    const isExpanded = ctx.expandedRowKeySet.has(key)
    const isRowExpandable = expandable
      ? expandable.rowExpandable
        ? expandable.rowExpandable(record)
        : true
      : false
    const rowClass = typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName

    const expandToggleCell = expandable ? (
      <td className={getExpandIconCellClasses(size)}>
        {isRowExpandable && (
          <button
            type="button"
            className="inline-flex items-center justify-center"
            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
            aria-expanded={isExpanded}
            onClick={(e) => {
              e.stopPropagation()
              ctx.handleToggleExpand(key, record)
            }}>
            <ExpandIcon expanded={isExpanded} />
          </button>
        )}
      </td>
    ) : null

    const expandAtStart = expandable?.expandIconPosition !== 'end'

    const rowNode = (
      <tr
        key={key}
        className={classNames(
          getTableRowClasses(hoverable, striped, index % 2 === 0, rowClass),
          ctx.fixedColumnsInfo.hasFixedColumns && 'group'
        )}
        onClick={() => ctx.handleRowClick(record, index)}>
        {expandAtStart && expandToggleCell}

        {rowSelection && rowSelection.showCheckbox !== false && (
          <td className={getCheckboxCellClasses(size)}>
            <input
              type={rowSelection?.type === 'radio' ? 'radio' : 'checkbox'}
              className={
                rowSelection?.type === 'radio'
                  ? 'border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]'
                  : 'rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]'
              }
              checked={isSelected}
              disabled={rowSelection?.getCheckboxProps?.(record)?.disabled}
              onChange={(e) => ctx.handleSelectRow(key, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
            />
          </td>
        )}

        {ctx.displayColumns.map((column) => {
          const dataKey = column.dataKey || column.key
          const cellValue = record[dataKey]

          const isFixedLeft = column.fixed === 'left'
          const isFixedRight = column.fixed === 'right'
          const fixedStyle = isFixedLeft
            ? {
                position: 'sticky' as const,
                left: `${ctx.fixedColumnsInfo.leftOffsets[column.key] || 0}px`,
                zIndex: 10
              }
            : isFixedRight
              ? {
                  position: 'sticky' as const,
                  right: `${ctx.fixedColumnsInfo.rightOffsets[column.key] || 0}px`,
                  zIndex: 10
                }
              : undefined

          const widthStyle = column.width
            ? {
                width: typeof column.width === 'number' ? `${column.width}px` : column.width
              }
            : undefined

          const style = fixedStyle ? { ...widthStyle, ...fixedStyle } : widthStyle

          const stickyBgClass =
            striped && index % 2 === 0
              ? 'bg-[var(--tiger-surface-muted,#f9fafb)]/50'
              : 'bg-[var(--tiger-surface,#ffffff)]'

          const stickyCellClass =
            isFixedLeft || isFixedRight
              ? classNames(
                  stickyBgClass,
                  hoverable && 'group-hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
                )
              : undefined

          const isEditing =
            ctx.editingCell?.rowIndex === index && ctx.editingCell?.columnKey === column.key
          const cellEditable = ctx.isCellEditable(column.key, index)

          return (
            <td
              key={column.key}
              className={classNames(
                getTableCellClasses(size, column.align || 'left', column.className),
                stickyCellClass,
                cellEditable && getEditableCellClasses(!!isEditing)
              )}
              style={style}
              onDoubleClick={
                cellEditable ? () => ctx.startEditing(index, column.key, cellValue) : undefined
              }>
              {isEditing ? (
                <input
                  className={editableCellInputClasses}
                  value={ctx.editingValue}
                  onChange={(e) => ctx.setEditingValue(e.target.value)}
                  onBlur={ctx.commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') ctx.commitEdit()
                    if (e.key === 'Escape') ctx.cancelEdit()
                  }}
                  autoFocus
                />
              ) : column.render ? (
                (column.render(record, index) as React.ReactNode)
              ) : (
                (cellValue as React.ReactNode)
              )}
            </td>
          )
        })}

        {!expandAtStart && expandToggleCell}
      </tr>
    )

    if (expandable && isExpanded && isRowExpandable) {
      const expandedContent = expandable.expandedRowRender
        ? expandable.expandedRowRender(record, index)
        : null

      return (
        <React.Fragment key={key}>
          {rowNode}
          <tr key={`${key}-expanded`} className={getExpandedRowClasses()}>
            <td colSpan={ctx.totalColumnCount} className={getExpandedRowContentClasses(size)}>
              {expandedContent as React.ReactNode}
            </td>
          </tr>
        </React.Fragment>
      )
    }

    return rowNode
  }

  if (ctx.groupedData) {
    return (
      <tbody>
        {Array.from(ctx.groupedData.entries()).map(([groupKey, groupItems]) => (
          <React.Fragment key={`group-${groupKey}`}>
            <tr className={tableGroupHeaderClasses}>
              <td colSpan={ctx.totalColumnCount} className={getGroupHeaderCellClasses(size)}>
                {groupKey} ({groupItems.length})
              </td>
            </tr>
            {groupItems.map((record, idx) => {
              const globalIndex = ctx.paginatedData.indexOf(record)
              return renderDataRow(record, globalIndex >= 0 ? globalIndex : idx)
            })}
          </React.Fragment>
        ))}
      </tbody>
    )
  }

  return <tbody>{ctx.paginatedData.map((record, index) => renderDataRow(record, index))}</tbody>
}
