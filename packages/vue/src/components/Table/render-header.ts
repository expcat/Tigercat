import { h, type Slots, type VNodeChild } from 'vue'
import {
  classNames,
  getTableHeaderClasses,
  getTableHeaderCellClasses,
  getCheckboxCellClasses,
  getExpandIconCellClasses
} from '@expcat/tigercat-core'
import { LockIcon, SortIcon } from './icons'
import type { TableContext, TableInternalProps } from './types'

export function renderTableHeader(
  ctx: TableContext,
  props: TableInternalProps,
  slots: Slots
): VNodeChild {
  const headerCells: VNodeChild[] = []
  const expandAtStart = props.expandable && props.expandable.expandIconPosition !== 'end'
  const expandAtEnd = props.expandable && props.expandable.expandIconPosition === 'end'
  const expandHeaderTh = props.expandable
    ? h('th', {
        class: getExpandIconCellClasses(props.size),
        'aria-label': 'Expand'
      })
    : null

  if (expandAtStart && expandHeaderTh) {
    headerCells.push(expandHeaderTh)
  }

  if (
    props.rowSelection &&
    props.rowSelection.showCheckbox !== false &&
    props.rowSelection.type !== 'radio'
  ) {
    headerCells.push(
      h(
        'th',
        {
          class: getCheckboxCellClasses(props.size)
        },
        [
          h('input', {
            type: 'checkbox',
            class:
              'rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]',
            checked: ctx.allSelected.value,
            indeterminate: ctx.someSelected.value,
            onChange: (e: Event) => ctx.handleSelectAll((e.target as HTMLInputElement).checked)
          })
        ]
      )
    )
  }

  ctx.displayColumns.value.forEach((column) => {
    const isSorted = ctx.sortState.value.key === column.key
    const sortDirection = isSorted ? ctx.sortState.value.direction : null

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
          position: 'sticky',
          left: `${ctx.fixedColumnsInfo.value.leftOffsets[column.key] || 0}px`,
          zIndex: 15
        }
      : isFixedRight
        ? {
            position: 'sticky',
            right: `${ctx.fixedColumnsInfo.value.rightOffsets[column.key] || 0}px`,
            zIndex: 15
          }
        : undefined

    const widthStyle = column.width
      ? {
          width: typeof column.width === 'number' ? `${column.width}px` : column.width
        }
      : undefined

    const style = fixedStyle ? { ...widthStyle, ...fixedStyle } : widthStyle

    const headerContent: VNodeChild[] = []

    const slotContent = slots[`header-${column.key}`]?.()
    if (slotContent && slotContent.length > 0) {
      headerContent.push(...slotContent)
    } else if (column.renderHeader) {
      headerContent.push(column.renderHeader() as VNodeChild)
    } else {
      headerContent.push(column.title)
    }

    if (props.columnLockable) {
      headerContent.push(
        h(
          'button',
          {
            type: 'button',
            class: classNames(
              'inline-flex items-center',
              column.fixed === 'left' || column.fixed === 'right'
                ? 'text-[var(--tiger-primary,#2563eb)]'
                : 'text-gray-400 hover:text-gray-700'
            ),
            'aria-label':
              column.fixed === 'left' || column.fixed === 'right'
                ? `Unlock column ${column.title}`
                : `Lock column ${column.title}`,
            onClick: (e: Event) => {
              e.stopPropagation()
              ctx.toggleColumnLock(column.key)
            }
          },
          [LockIcon(column.fixed === 'left' || column.fixed === 'right')]
        )
      )
    }

    if (column.sortable) {
      headerContent.push(SortIcon(sortDirection))
    }

    headerCells.push(
      h(
        'th',
        {
          key: column.key,
          'aria-sort': ariaSort,
          class: classNames(
            getTableHeaderCellClasses(
              props.size,
              column.align || 'left',
              !!column.sortable,
              column.headerClassName
            ),
            (isFixedLeft || isFixedRight) && 'bg-[var(--tiger-surface-muted,#f9fafb)]'
          ),
          style,
          draggable: props.columnDraggable ? 'true' : undefined,
          onDragstart: props.columnDraggable ? () => ctx.handleDragStart(column.key) : undefined,
          onDragover: props.columnDraggable ? (e: DragEvent) => e.preventDefault() : undefined,
          onDrop: props.columnDraggable ? () => ctx.handleDrop(column.key) : undefined,
          onClick: column.sortable ? () => ctx.handleSort(column.key) : undefined
        },
        [
          h('div', { class: 'flex items-center gap-2' }, headerContent),
          ...(column.filter
            ? [
                h('div', { class: 'mt-2' }, [
                  column.filter.type === 'select' && column.filter.options
                    ? h(
                        'select',
                        {
                          class: 'w-full px-2 py-1 text-sm border border-gray-300 rounded',
                          onChange: (e: Event) =>
                            ctx.handleFilter(column.key, (e.target as HTMLSelectElement).value),
                          onClick: (e: Event) => e.stopPropagation()
                        },
                        [
                          h('option', { value: '' }, 'All'),
                          ...column.filter.options.map((opt) =>
                            h('option', { value: opt.value }, opt.label)
                          )
                        ]
                      )
                    : h('input', {
                        type: 'text',
                        class: 'w-full px-2 py-1 text-sm border border-gray-300 rounded',
                        placeholder: column.filter.placeholder || 'Filter...',
                        onInput: (e: Event) =>
                          ctx.handleFilter(column.key, (e.target as HTMLInputElement).value),
                        onClick: (e: Event) => e.stopPropagation()
                      })
                ])
              ]
            : [])
        ]
      )
    )
  })

  if (expandAtEnd && expandHeaderTh) {
    headerCells.push(expandHeaderTh)
  }

  return h('thead', { class: getTableHeaderClasses(props.stickyHeader) }, [h('tr', headerCells)])
}
