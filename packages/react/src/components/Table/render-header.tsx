import React, { useEffect, useRef, useState } from 'react'
import {
  classNames,
  createTableTextFilterCoalescer,
  formatTableFilterColumnAriaLabel,
  formatTableSortButtonName,
  formatTableSortByText,
  getCheckboxCellClasses,
  getExpandIconCellClasses,
  getFixedColumnStyle,
  TABLE_FIXED_HEADER_Z_INDEX,
  getInputClasses,
  getTableChromeSlots,
  getTableFixedHeaderCellClasses,
  getTableHeaderCellClasses,
  getTableHeaderClasses,
  hasTableSelectionColumn,
  resolveTableExpandSlot,
  tableSortButtonClasses,
  type ExpandableConfig,
  type RowSelectionConfig,
  type TableSize,
  type TigerLocaleTable
} from '@expcat/tigercat-core'
import { Checkbox } from '../Checkbox'
import { Input } from '../Input'
import { LockIcon, SortIcon } from './icons'
import type { TableContext } from './types'

export interface RenderHeaderViewProps {
  size: TableSize
  stickyHeader: boolean
  rowSelection?: RowSelectionConfig
  expandable?: ExpandableConfig
  columnLockable: boolean
  columnDraggable: boolean
  lockColumnAriaLabel: string
  unlockColumnAriaLabel: string
  labels: Required<TigerLocaleTable>
  selectionName?: string
  filterMode?: 'basic' | 'advanced'
}

function isHeaderSortClickTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('[data-tiger-table-filter], button:not([data-tiger-table-sort])'))
}

export function renderTableHeader(ctx: TableContext, view: RenderHeaderViewProps): React.ReactNode {
  const {
    size,
    stickyHeader,
    rowSelection,
    expandable,
    columnLockable,
    columnDraggable,
    lockColumnAriaLabel,
    unlockColumnAriaLabel,
    labels,
    filterMode = 'basic'
  } = view
  const chrome = getTableChromeSlots({
    hasSelectionColumn: hasTableSelectionColumn(rowSelection),
    expand: resolveTableExpandSlot(expandable)
  })

  const expandHeaderTh = <th className={getExpandIconCellClasses(size)} aria-hidden="true" />
  const selectionHeaderTh =
    rowSelection?.type === 'radio' ? (
      <th className={getCheckboxCellClasses(size)} aria-hidden="true" />
    ) : (
      <th className={getCheckboxCellClasses(size)}>
        <Checkbox
          size="sm"
          checked={ctx.allSelected}
          indeterminate={ctx.someSelected}
          aria-label={labels.selectAllText}
          onChange={(checked) => ctx.handleSelectAll(checked)}
        />
      </th>
    )

  function renderChromeTh(slot: 'expand' | 'selection'): React.ReactNode {
    return slot === 'expand' ? expandHeaderTh : selectionHeaderTh
  }

  return (
    <thead className={getTableHeaderClasses(stickyHeader)}>
      <tr>
        {chrome.leading.map((slot) => (
          <React.Fragment key={slot}>{renderChromeTh(slot)}</React.Fragment>
        ))}

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

          const fixedStyle = getFixedColumnStyle(column, ctx.fixedColumnsInfo, TABLE_FIXED_HEADER_Z_INDEX)

          const widthStyle = column.width
            ? {
                width: typeof column.width === 'number' ? `${column.width}px` : column.width
              }
            : undefined

          const style = fixedStyle ? { ...widthStyle, ...fixedStyle } : widthStyle

          const titleNode = column.renderHeader
            ? (column.renderHeader() as React.ReactNode)
            : column.title

          const filterValue = ctx.filterState[column.key]
          const filterText = filterValue == null ? '' : String(filterValue)

          return (
            <th
              key={column.key}
              scope="col"
              data-tiger-table-column-key={column.key}
              aria-sort={ariaSort}
              className={classNames(
                getTableHeaderCellClasses(
                  size,
                  column.align || 'left',
                  !!column.sortable,
                  column.headerClassName
                ),
                getTableFixedHeaderCellClasses({
                  view: 'table',
                  column,
                  stickyHeader,
                  fixedInfo: ctx.fixedColumnsInfo
                })
              )}
              style={style}
              draggable={columnDraggable ? true : undefined}
              onClick={
                column.sortable
                  ? (event) => {
                      if (isHeaderSortClickTarget(event.target)) return
                      ctx.handleSort(column.key)
                    }
                  : undefined
              }
              onDragStart={columnDraggable ? () => ctx.handleDragStart(column.key) : undefined}
              onDragOver={columnDraggable ? (e) => e.preventDefault() : undefined}
              onDrop={columnDraggable ? () => ctx.handleDrop(column.key) : undefined}>
              <div className="flex items-center gap-2">
                {column.sortable ? (
                  <button
                    type="button"
                    data-tiger-table-sort=""
                    className={tableSortButtonClasses}
                    aria-label={formatTableSortButtonName(
                      labels.sortByText,
                      String(column.title),
                      sortDirection === 'asc'
                        ? labels.sortAscendingText
                        : sortDirection === 'desc'
                          ? labels.sortDescendingText
                          : labels.sortNoneText
                    )}
                    onClick={(event) => {
                      event.stopPropagation()
                      ctx.handleSort(column.key)
                    }}>
                    {titleNode}
                    <SortIcon direction={sortDirection} />
                  </button>
                ) : (
                  titleNode
                )}

                {columnLockable && (
                  <button
                    type="button"
                    aria-label={formatTableSortByText(
                      column.fixed === 'start' || column.fixed === 'end'
                        ? unlockColumnAriaLabel
                        : lockColumnAriaLabel,
                      String(column.title)
                    )}
                    className={classNames(
                      'inline-flex items-center',
                      column.fixed === 'start' || column.fixed === 'end'
                        ? 'text-[var(--tiger-primary)]'
                        : 'text-[var(--tiger-text-secondary)] hover:text-[var(--tiger-text)]'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      ctx.toggleColumnLock(column.key)
                    }}>
                    <LockIcon locked={column.fixed === 'start' || column.fixed === 'end'} />
                  </button>
                )}
              </div>

              {filterMode !== 'advanced' &&
              column.filter &&
              (column.filter.type !== 'custom' || column.filter.render) ? (
                <div
                  className="mt-2"
                  data-tiger-table-filter=""
                  draggable={false}
                  onClick={(e) => e.stopPropagation()}
                  onDragStart={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}>
                  {column.filter.type === 'custom' && column.filter.render ? (
                    column.filter.render() as React.ReactNode
                  ) : column.filter.type === 'select' && column.filter.options ? (
                    <select
                      className={getInputClasses({ size: 'sm' })}
                      aria-label={formatTableFilterColumnAriaLabel(
                        labels.filterColumnAriaLabel,
                        String(column.title)
                      )}
                      value={filterText}
                      draggable={false}
                      onChange={(e) => ctx.handleFilter(column.key, e.target.value)}>
                      <option value="">{labels.allText}</option>
                      {column.filter.options.map((opt) => (
                        <option key={String(opt.value)} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <TableTextFilter
                      value={filterText}
                      label={formatTableFilterColumnAriaLabel(
                        labels.filterColumnAriaLabel,
                        String(column.title)
                      )}
                      placeholder={column.filter.placeholder || labels.filterPlaceholder}
                      onCommit={(value) => ctx.handleFilter(column.key, value)}
                    />
                  )}
                </div>
              ) : null}
            </th>
          )
        })}

        {chrome.trailing.map((slot) => (
          <React.Fragment key={slot}>{renderChromeTh(slot)}</React.Fragment>
        ))}
      </tr>
    </thead>
  )
}

function TableTextFilter({
  value,
  label,
  placeholder,
  onCommit
}: {
  value: string
  label: string
  placeholder: string
  onCommit: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const commitRef = useRef(onCommit)
  commitRef.current = onCommit
  const coalescer = useRef<ReturnType<typeof createTableTextFilterCoalescer> | null>(null)
  if (!coalescer.current) {
    coalescer.current = createTableTextFilterCoalescer((next) => commitRef.current(next))
  }
  useEffect(() => setDraft(value), [value])
  useEffect(() => () => coalescer.current?.cancel(), [])
  return (
    <Input
      size="sm"
      value={draft}
      aria-label={label}
      placeholder={placeholder}
      draggable={false}
      onChange={(next) => {
        const text = String(next)
        setDraft(text)
        coalescer.current?.push(text)
      }}
    />
  )
}
