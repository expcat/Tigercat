import React from 'react'
import {
  classNames,
  isActivationKey,
  getTableRowClasses,
  getTableCellClasses,
  getTableFixedCellClasses,
  getFixedColumnStyle,
  TABLE_FIXED_CELL_Z_INDEX,
  getCheckboxCellClasses,
  getExpandIconCellClasses,
  getExpandedRowClasses,
  getExpandedRowContentClasses,
  tableEmptyStateClasses,
  getEditableCellClasses,
  editableCellInputClasses,
  tableGroupHeaderClasses,
  getGroupHeaderCellClasses,
  getTableChromeSlots,
  hasTableSelectionColumn,
  resolveTableExpandSlot,
  formatTableSelectRowAriaLabel,
  formatTableGroupHeaderText,
  isEscapeKey,
  tableRowDragHandleClasses,
  tableRowKeyId,
  tableVirtualSpacerCellClasses,
  isVirtualTableCellControlTarget,
  resolveCellSpan,
  type RowSelectionConfig,
  type ExpandableConfig,
  type TableSize,
  type TableVirtualWindow,
  type TigerLocaleTable
} from '@expcat/tigercat-core'
import { Checkbox } from '../Checkbox'
import { Radio } from '../Radio'
import { ExpandIcon } from './icons'
import type { TableContext } from './types'
import { Input } from '../Input'
import { InputNumber } from '../InputNumber'
import { Select } from '../Select'

function isRowRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function cellSpanForUnknown(
  span: number | ((record: Record<string, unknown>, index: number) => number) | undefined
): number | ((record: unknown, index: number) => number) | undefined {
  if (typeof span !== 'function') return span
  return (record: unknown, index: number) => (isRowRecord(record) ? span(record, index) : 1)
}

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
  virtualItemHeight?: number
  renderedColumns?: TableContext['displayColumns']
  selectionName?: string
  activeRowIndex?: number
  onActiveRowIndex?: (index: number) => void
  grid?: boolean
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
    virtualWindow,
    virtualItemHeight,
    renderedColumns,
    selectionName,
    activeRowIndex = 0,
    grid = false,
    onActiveRowIndex
  } = view
  const hasRowControls = hasTableSelectionColumn(rowSelection) || Boolean(expandable)
  const chrome = getTableChromeSlots({
    hasSelectionColumn: hasTableSelectionColumn(rowSelection),
    expand: resolveTableExpandSlot(expandable)
  })

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

    const sourceIndex = Number(row.dataset.tigerTableRowIndex)
    if (!Number.isInteger(sourceIndex)) return null

    const pageIndex = ctx.pageSourceIndices.indexOf(sourceIndex)
    if (pageIndex < 0) return null
    const record = ctx.paginatedData[pageIndex]
    const key = ctx.pageRowKeys[pageIndex]
    if (!record || key === undefined) return null

    return { key, record, index: sourceIndex }
  }

  function handleBodyClick(event: React.MouseEvent<HTMLTableSectionElement>) {
    if (isVirtualTableCellControlTarget(event.target)) return
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
    const sourceIndex = ctx.pageSourceIndices[index] ?? index
    const key = ctx.pageRowKeys[index]
    const isSelected = ctx.selectedRowKeySet.has(tableRowKeyId(key))
    const isExpanded = ctx.expandedRowKeySet.has(tableRowKeyId(key))
    const isRowExpandable = expandable
      ? expandable.rowExpandable
        ? expandable.rowExpandable(record)
        : true
      : false
    const rowClass =
      typeof rowClassName === 'function' ? rowClassName(record, sourceIndex) : rowClassName

    const expandToggleCell = (
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
    )

    const selectionCell = (
      <td className={getCheckboxCellClasses(size)} onClick={(e) => e.stopPropagation()}>
        {rowSelection?.type === 'radio' ? (
          <Radio
            size="sm"
            name={selectionName}
            value={key}
            checked={isSelected}
            disabled={rowSelection?.getCheckboxProps?.(record)?.disabled}
            aria-label={
              rowSelection?.getRowLabel?.(record, index + 1) ??
              formatTableSelectRowAriaLabel(labels.selectRowAriaLabel, index + 1)
            }
            onChange={(checked) => {
              if (checked) ctx.handleSelectRow(key, true)
            }}
          />
        ) : (
          <Checkbox
            size="sm"
            checked={isSelected}
            disabled={rowSelection?.getCheckboxProps?.(record)?.disabled}
            aria-label={
              rowSelection?.getRowLabel?.(record, index + 1) ??
              formatTableSelectRowAriaLabel(labels.selectRowAriaLabel, index + 1)
            }
            onChange={(checked) => ctx.handleSelectRow(key, checked)}
          />
        )}
      </td>
    )

    function renderChromeTd(slot: 'expand' | 'selection'): React.ReactNode {
      return slot === 'expand' ? expandToggleCell : selectionCell
    }

    const rowNode = (
      <tr
        key={key}
        data-tiger-table-row-index={sourceIndex}
        className={classNames(
          getTableRowClasses(hoverable, striped, index % 2 === 0, rowClass),
          ctx.fixedColumnsInfo.hasFixedColumns && 'group'
        )}
        aria-selected={rowSelection ? isSelected : undefined}
        style={
          virtualWindow
            ? { minHeight: `${virtualItemHeight}px`, height: `${virtualItemHeight}px` }
            : undefined
        }
        tabIndex={grid ? -1 : hasRowControls ? undefined : index === activeRowIndex ? 0 : -1}
        onKeyDown={
          hasRowControls
            ? undefined
            : (e) => {
                if (e.target !== e.currentTarget) return
                if (isActivationKey(e) && interactiveRows) {
                  e.preventDefault()
                  ctx.handleRowClick(record, sourceIndex, key)
                  return
                }
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault()
                  const next = e.key === 'ArrowDown' ? index + 1 : index - 1
                  if (next < 0 || next >= ctx.paginatedData.length) return
                  onActiveRowIndex?.(next)
                  const row = (e.currentTarget.parentElement?.querySelector(
                    `tr[data-tiger-table-page-index="${next}"]`
                  ) ?? null) as HTMLTableRowElement | null
                  row?.focus()
                }
              }
        }
        data-tiger-table-page-index={index}>
        {rowDraggable ? (
          <td className={getCheckboxCellClasses(size)}>
            <button
              type="button"
              className={tableRowDragHandleClasses}
              draggable
              aria-label={formatTableSelectRowAriaLabel(labels.dragRowAriaLabel, index + 1)}
              data-tiger-row-drag-handle=""
              onDragStart={(event) => {
                event.stopPropagation()
                ctx.handleRowDragStart(key)
              }}>
              ::
            </button>
          </td>
        ) : null}
        {chrome.leading.map((slot) => (
          <React.Fragment key={slot}>{renderChromeTd(slot)}</React.Fragment>
        ))}

        {(renderedColumns ?? ctx.displayColumns).map((column) => {
          const dataKey = column.dataKey || column.key
          const cellValue = record[dataKey]

          const fixedStyle = getFixedColumnStyle(
            column,
            ctx.fixedColumnsInfo,
            TABLE_FIXED_CELL_Z_INDEX
          )

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
            rowIndex: sourceIndex,
            striped,
            stripedActive: striped && index % 2 === 0,
            selected: isSelected,
            hoverable,
            fixedInfo: ctx.fixedColumnsInfo
          })

          const isEditing =
            ctx.editingCell?.rowIndex === sourceIndex && ctx.editingCell?.columnKey === column.key
          const cellEditable = ctx.isCellEditable(column.key, sourceIndex)

          return (
            <td
              key={column.key}
              rowSpan={
                resolveCellSpan(cellSpanForUnknown(column.rowSpan), record, sourceIndex) !== 1
                  ? resolveCellSpan(cellSpanForUnknown(column.rowSpan), record, sourceIndex)
                  : undefined
              }
              colSpan={
                resolveCellSpan(cellSpanForUnknown(column.colSpan), record, sourceIndex) !== 1
                  ? resolveCellSpan(cellSpanForUnknown(column.colSpan), record, sourceIndex)
                  : undefined
              }
              className={classNames(
                getTableCellClasses(size, column.align || 'left', column.className),
                stickyCellClass,
                cellEditable && getEditableCellClasses(!!isEditing)
              )}
              style={style}
              onDoubleClick={
                cellEditable
                  ? () => ctx.startEditing(sourceIndex, column.key, cellValue)
                  : undefined
              }>
              {isEditing ? (
                column.edit === 'number' ? (
                  <InputNumber
                    value={Number(ctx.editingValue)}
                    onChange={(value) => ctx.setEditingValue(value == null ? '' : String(value))}
                    onBlur={ctx.commitEdit}
                  />
                ) : column.edit === 'select' ? (
                  <Select
                    value={ctx.editingValue}
                    options={column.editOptions ?? []}
                    onChange={(value) => ctx.setEditingValue(value == null ? '' : String(value))}
                    onBlur={ctx.commitEdit}
                  />
                ) : column.edit === 'text' ? (
                  <Input
                    value={ctx.editingValue}
                    onChange={(value) => ctx.setEditingValue(String(value))}
                    onBlur={ctx.commitEdit}
                  />
                ) : (
                  <input
                    className={editableCellInputClasses}
                    value={ctx.editingValue}
                    onChange={(e) => ctx.setEditingValue(e.target.value)}
                    onBlur={ctx.commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') ctx.commitEdit()
                      if (isEscapeKey(e)) {
                        e.preventDefault()
                        e.stopPropagation()
                        e.nativeEvent.stopImmediatePropagation()
                        ctx.cancelEdit()
                      }
                    }}
                    autoFocus
                  />
                )
              ) : column.render ? (
                (column.render(record, sourceIndex) as React.ReactNode)
              ) : (
                (cellValue as React.ReactNode)
              )}
            </td>
          )
        })}

        {chrome.trailing.map((slot) => (
          <React.Fragment key={slot}>{renderChromeTd(slot)}</React.Fragment>
        ))}
      </tr>
    )

    if (expandable && isExpanded && isRowExpandable) {
      const expandedContent = expandable.expandedRowRender
        ? expandable.expandedRowRender(record, sourceIndex)
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

  if (ctx.groupBlocks) {
    let rowCursor = 0
    return (
      <tbody
        onClick={handleBodyClick}
        onDragOver={rowDraggable ? handleBodyDragOver : undefined}
        onDrop={rowDraggable ? handleBodyDrop : undefined}>
        {ctx.groupBlocks.map((block) => {
          const collapsed =
            ctx.groupCollapseEnabled && ctx.collapsedGroups.includes(String(block.key))
          const rows = collapsed
            ? []
            : block.records.map((record) => {
                const pageIndex = ctx.paginatedData.indexOf(record, rowCursor)
                const index = pageIndex >= 0 ? pageIndex : rowCursor
                rowCursor = index + 1
                return renderDataRow(record, index)
              })
          const headerText = formatTableGroupHeaderText(
            labels.groupHeaderText,
            block.key,
            block.count
          )
          return (
            <React.Fragment key={`group-${block.key}-${block.continued ? 'cont' : 'new'}`}>
              {block.continued ? null : (
                <tr className={tableGroupHeaderClasses}>
                  <td colSpan={ctx.totalColumnCount} className={getGroupHeaderCellClasses(size)}>
                    {ctx.groupCollapseEnabled ? (
                      <button
                        type="button"
                        data-tiger-group={String(block.key)}
                        aria-expanded={collapsed ? 'false' : 'true'}
                        onClick={() => ctx.toggleGroup(String(block.key))}>
                        {headerText}
                      </button>
                    ) : (
                      headerText
                    )}
                  </td>
                </tr>
              )}
              {rows}
            </React.Fragment>
          )
        })}
      </tbody>
    )
  }

  // Virtual row windowing: render only the visible slice with spacer rows.
  if (virtualWindow) {
    const { startIndex, endIndex, topPad, bottomPad } = virtualWindow
    const windowed: React.ReactNode[] = []
    if (topPad > 0) {
      windowed.push(
        <tr key="virtual-top" data-tiger-table-virtual-spacer="" aria-hidden="true">
          <td
            colSpan={ctx.totalColumnCount}
            className={tableVirtualSpacerCellClasses}
            style={{ height: `${topPad}px` }}
          />
        </tr>
      )
    }
    for (let index = startIndex; index <= endIndex; index++) {
      const record = ctx.paginatedData[index]
      if (record === undefined) continue
      windowed.push(renderDataRow(record, index))
    }
    if (bottomPad > 0) {
      windowed.push(
        <tr key="virtual-bottom" data-tiger-table-virtual-spacer="" aria-hidden="true">
          <td
            colSpan={ctx.totalColumnCount}
            className={tableVirtualSpacerCellClasses}
            style={{ height: `${bottomPad}px` }}
          />
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
