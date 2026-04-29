import React from 'react'
import {
  classNames,
  getTableHeaderClasses,
  getTableHeaderCellClasses,
  getCheckboxCellClasses,
  getExpandIconCellClasses,
  type RowSelectionConfig,
  type ExpandableConfig,
  type TableSize
} from '@expcat/tigercat-core'
import { LockIcon, SortIcon } from './icons'
import type { TableContext } from './types'

export interface RenderHeaderViewProps {
  size: TableSize
  stickyHeader: boolean
  rowSelection?: RowSelectionConfig
  expandable?: ExpandableConfig
  columnLockable: boolean
  columnDraggable: boolean
}

export function renderTableHeader(ctx: TableContext, view: RenderHeaderViewProps): React.ReactNode {
  const { size, stickyHeader, rowSelection, expandable, columnLockable, columnDraggable } = view
  const expandHeaderTh = expandable ? (
    <th className={getExpandIconCellClasses(size)} aria-label="Expand" />
  ) : null
  const expandAtStart = expandable?.expandIconPosition !== 'end'

  return (
    <thead className={getTableHeaderClasses(stickyHeader)}>
      <tr>
        {expandAtStart && expandHeaderTh}

        {rowSelection && rowSelection.showCheckbox !== false && rowSelection.type !== 'radio' && (
          <th className={getCheckboxCellClasses(size)}>
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]"
              checked={ctx.allSelected}
              ref={(el) => {
                if (el) el.indeterminate = ctx.someSelected
              }}
              onChange={(e) => ctx.handleSelectAll(e.target.checked)}
            />
          </th>
        )}

        {ctx.displayColumns.map((column) => {
          const isSorted = ctx.sortState.key === column.key
          const sortDirection = isSorted ? ctx.sortState.direction : null

          const ariaSort = column.sortable
            ? sortDirection === 'asc'
              ? 'ascending'
              : sortDirection === 'desc'
                ? 'descending'
                : 'none'
            : undefined

          const isFixedLeft = column.fixed === 'left'
          const isFixedRight = column.fixed === 'right'
          const fixedStyle = isFixedLeft
            ? {
                position: 'sticky' as const,
                left: `${ctx.fixedColumnsInfo.leftOffsets[column.key] || 0}px`,
                zIndex: 15
              }
            : isFixedRight
              ? {
                  position: 'sticky' as const,
                  right: `${ctx.fixedColumnsInfo.rightOffsets[column.key] || 0}px`,
                  zIndex: 15
                }
              : undefined

          const widthStyle = column.width
            ? {
                width: typeof column.width === 'number' ? `${column.width}px` : column.width
              }
            : undefined

          const style = fixedStyle ? { ...widthStyle, ...fixedStyle } : widthStyle

          return (
            <th
              key={column.key}
              aria-sort={ariaSort}
              className={classNames(
                getTableHeaderCellClasses(
                  size,
                  column.align || 'left',
                  !!column.sortable,
                  column.headerClassName
                ),
                (isFixedLeft || isFixedRight) && 'bg-[var(--tiger-surface-muted,#f9fafb)]'
              )}
              style={style}
              draggable={columnDraggable ? true : undefined}
              onDragStart={columnDraggable ? () => ctx.handleDragStart(column.key) : undefined}
              onDragOver={columnDraggable ? (e) => e.preventDefault() : undefined}
              onDrop={columnDraggable ? () => ctx.handleDrop(column.key) : undefined}
              onClick={column.sortable ? () => ctx.handleSort(column.key) : undefined}>
              <div className="flex items-center gap-2">
                {column.renderHeader ? (column.renderHeader() as React.ReactNode) : column.title}

                {columnLockable && (
                  <button
                    type="button"
                    aria-label={
                      column.fixed === 'left' || column.fixed === 'right'
                        ? `Unlock column ${column.title}`
                        : `Lock column ${column.title}`
                    }
                    className={classNames(
                      'inline-flex items-center',
                      column.fixed === 'left' || column.fixed === 'right'
                        ? 'text-[var(--tiger-primary,#2563eb)]'
                        : 'text-gray-400 hover:text-gray-700'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      ctx.toggleColumnLock(column.key)
                    }}>
                    <LockIcon locked={column.fixed === 'left' || column.fixed === 'right'} />
                  </button>
                )}

                {column.sortable && <SortIcon direction={sortDirection} />}
              </div>

              {column.filter && (
                <div className="mt-2">
                  {column.filter.type === 'select' && column.filter.options ? (
                    <select
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      onChange={(e) => ctx.handleFilter(column.key, e.target.value)}
                      onClick={(e) => e.stopPropagation()}>
                      <option value="">All</option>
                      {column.filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder={column.filter.placeholder || 'Filter...'}
                      onInput={(e) =>
                        ctx.handleFilter(column.key, (e.target as HTMLInputElement).value)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              )}
            </th>
          )
        })}

        {!expandAtStart && expandHeaderTh}
      </tr>
    </thead>
  )
}
