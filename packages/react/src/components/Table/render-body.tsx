import React from 'react'
import {
  classNames,
  isActivationKey,
  getTableRowClasses,
  getTableCellClasses,
  getTableFixedCellClasses,
  getFixedColumnStyle,
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
  type TableSize,
  type TableVirtualWindow,
  type TigerLocaleTable
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
  labels: Required<TigerLocaleTable>
  rowClassName?: string | ((record: Record<string, unknown>, index: number) => string) | undefined
  rowDraggable?: boolean
  /** Whether rows respond to click/keyboard activation (onRowClick or rowSelection). */
  interactiveRows?: boolean
  /** When set, only the windowed row slice is rendered (virtual scrolling). */
  virtualWindow?: TableVirtualWindow
}

export function renderTableBody(ctx: TableContext, view: RenderBodyViewProps): React.ReactNode {
  const {
    size,
    hoverable,
    striped,
    loading,
    emptyText,
    rowSelection,
    expandable,
    labels,
    rowClassName,
    rowDraggable,
    interactiveRows,
    virtualWindow
  } = view

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

  function getDelegatedRow(event: React.SyntheticEvent): {
    key: string | number
    record: Record<string, unknown>
    index: number
  } | null {
    const row = (event.target as HTMLElement | null)?.closest<HTMLTableRowElement>(
      'tr[data-tiger-table-row-index]'
    )
    if (!row) return null

    const index = Number(row.dataset.tigerTableRowIndex)
    if (!Number.isInteger(index)) return null

    const record = ctx.paginatedData[index]
    const key = ctx.pageRowKeys[index]
    if (!record || key === undefined) return null

    return { key, record, index }
  }

  function handleBodyClick(event: React.MouseEvent<HTMLTableSectionElement>) {
    const row = getDelegatedRow(event)
    if (!row) return
    ctx.handleRowClick(row.record, row.index, row.key)
  }

  function handleBodyDragStart(event: React.DragEvent<HTMLTableSectionElement>) {
    if (!rowDraggable) return
    const row = getDelegatedRow(event)
    if (!row) return
    ctx.handleRowDragStart(row.key)
  }

  function handleBodyDragOver(event: React.DragEvent<HTMLTableSectionElement>) {
    if (!rowDraggable) return
    event.preventDefault()
  }

  function handleBodyDrop(event: React.DragEvent<HTMLTableSectionElement>) {
    if (!rowDraggable) return
    const row = getDelegatedRow(event)
    if (!row) return
    ctx.handleRowDrop(row.key)
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
            aria-label={isExpanded ? labels.collapseRowAriaLabel : labels.expandRowAriaLabel}
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
        data-tiger-table-row-index={index}
        className={classNames(
          getTableRowClasses(hoverable, striped, index % 2 === 0, rowClass),
          ctx.fixedColumnsInfo.hasFixedColumns && 'group'
        )}
        aria-selected={rowSelection ? isSelected : undefined}
        tabIndex={interactiveRows ? 0 : undefined}
        onKeyDown={
          interactiveRows
            ? (e) => {
                // Ignore activation bubbling up from interactive cell content.
                if (e.target !== e.currentTarget) return
                if (isActivationKey(e)) {
                  e.preventDefault()
                  ctx.handleRowClick(record, index, key)
                }
              }
            : undefined
        }
        draggable={rowDraggable ? true : undefined}>
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

          const fixedStyle = getFixedColumnStyle(column, ctx.fixedColumnsInfo, 10)

          const widthStyle = column.width
            ? {
                width: typeof column.width === 'number' ? `${column.width}px` : column.width
              }
            : undefined

          const style = fixedStyle ? { ...widthStyle, ...fixedStyle } : widthStyle

          const stickyCellClass = getTableFixedCellClasses({
            view: 'table',
            column,
            record,
            rowIndex: index,
            striped,
            stripedActive: striped && index % 2 === 0,
            selected: isSelected,
            hoverable,
            fixedInfo: ctx.fixedColumnsInfo
          })

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
      <tbody
        onClick={handleBodyClick}
        onDragStart={rowDraggable ? handleBodyDragStart : undefined}
        onDragOver={rowDraggable ? handleBodyDragOver : undefined}
        onDrop={rowDraggable ? handleBodyDrop : undefined}>
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

  // Virtual row windowing: render only the visible slice with spacer rows.
  if (virtualWindow && virtualWindow.endIndex >= virtualWindow.startIndex) {
    const { startIndex, endIndex, topPad, bottomPad } = virtualWindow
    const windowed: React.ReactNode[] = []
    if (topPad > 0) {
      windowed.push(
        <tr key="virtual-top" aria-hidden="true">
          <td colSpan={ctx.totalColumnCount} style={{ height: `${topPad}px`, padding: 0 }} />
        </tr>
      )
    }
    for (let index = startIndex; index <= endIndex; index++) {
      windowed.push(renderDataRow(ctx.paginatedData[index], index))
    }
    if (bottomPad > 0) {
      windowed.push(
        <tr key="virtual-bottom" aria-hidden="true">
          <td colSpan={ctx.totalColumnCount} style={{ height: `${bottomPad}px`, padding: 0 }} />
        </tr>
      )
    }
    return (
      <tbody
        onClick={handleBodyClick}
        onDragStart={rowDraggable ? handleBodyDragStart : undefined}
        onDragOver={rowDraggable ? handleBodyDragOver : undefined}
        onDrop={rowDraggable ? handleBodyDrop : undefined}>
        {windowed}
      </tbody>
    )
  }

  return (
    <tbody
      onClick={handleBodyClick}
      onDragStart={rowDraggable ? handleBodyDragStart : undefined}
      onDragOver={rowDraggable ? handleBodyDragOver : undefined}
      onDrop={rowDraggable ? handleBodyDrop : undefined}>
      {ctx.paginatedData.map((record, index) => renderDataRow(record, index))}
    </tbody>
  )
}
