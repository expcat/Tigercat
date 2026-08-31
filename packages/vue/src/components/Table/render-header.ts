import { h, type Slots, type VNodeChild } from 'vue'
import {
  classNames,
  formatTableFilterColumnAriaLabel,
  formatTableSortByText,
  getCheckboxCellClasses,
  getExpandIconCellClasses,
  getFixedColumnStyle,
  getInputClasses,
  getTableChromeSlots,
  getTableFixedHeaderCellClasses,
  getTableHeaderCellClasses,
  getTableHeaderClasses,
  hasTableSelectionColumn,
  resolveTableExpandSlot,
  tableSortButtonClasses,
  type TigerLocaleTable
} from '@expcat/tigercat-core'
import { Checkbox } from '../Checkbox'
import { Input } from '../Input'
import { LockIcon, SortIcon } from './icons'
import type { TableContext, TableInternalProps } from './types'

function isHeaderSortClickTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('[data-tiger-table-filter], button:not([data-tiger-table-sort])'))
}

export function renderTableHeader(
  ctx: TableContext,
  props: TableInternalProps,
  slots: Slots,
  labels: Required<TigerLocaleTable>
): VNodeChild {
  const chrome = getTableChromeSlots({
    hasSelectionColumn: hasTableSelectionColumn(props.rowSelection),
    expand: resolveTableExpandSlot(props.expandable)
  })

  const expandHeaderTh = h('th', {
    class: getExpandIconCellClasses(props.size),
    'aria-hidden': 'true'
  })
  const selectionHeaderTh =
    props.rowSelection?.type === 'radio'
      ? h('th', { class: getCheckboxCellClasses(props.size), 'aria-hidden': 'true' })
      : h('th', { class: getCheckboxCellClasses(props.size) }, [
          h(Checkbox, {
            size: 'sm',
            modelValue: ctx.allSelected.value,
            indeterminate: ctx.someSelected.value,
            'aria-label': labels.selectAllText,
            onChange: (checked: boolean) => ctx.handleSelectAll(checked)
          })
        ])

  function chromeTh(slot: 'expand' | 'selection'): VNodeChild {
    return slot === 'expand' ? expandHeaderTh : selectionHeaderTh
  }

  const headerCells: VNodeChild[] = chrome.leading.map((slot) => chromeTh(slot))

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

    const fixedStyle = getFixedColumnStyle(column, ctx.fixedColumnsInfo.value, 15)

    const widthStyle = column.width
      ? {
          width: typeof column.width === 'number' ? `${column.width}px` : column.width
        }
      : undefined

    const style = fixedStyle ? { ...widthStyle, ...fixedStyle } : widthStyle

    const titleContent: VNodeChild[] = []

    const slotContent = slots[`header-${column.key}`]?.()
    if (slotContent && slotContent.length > 0) {
      titleContent.push(...slotContent)
    } else if (column.renderHeader) {
      titleContent.push(column.renderHeader() as VNodeChild)
    } else {
      titleContent.push(column.title)
    }

    const headerContent: VNodeChild[] = []

    if (column.sortable) {
      headerContent.push(
        h(
          'button',
          {
            type: 'button',
            'data-tiger-table-sort': '',
            class: tableSortButtonClasses,
            'aria-label': formatTableSortByText(labels.sortByText, String(column.title)),
            onClick: (event: Event) => {
              event.stopPropagation()
              ctx.handleSort(column.key)
            }
          },
          [...titleContent, SortIcon(sortDirection)]
        )
      )
    } else {
      headerContent.push(...titleContent)
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
                : 'text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-text,#111827)]'
            ),
            'aria-label': formatTableSortByText(
              column.fixed === 'left' || column.fixed === 'right'
                ? labels.unlockColumnAriaLabel
                : labels.lockColumnAriaLabel,
              String(column.title)
            ),
            onClick: (e: Event) => {
              e.stopPropagation()
              ctx.toggleColumnLock(column.key)
            }
          },
          [LockIcon(column.fixed === 'left' || column.fixed === 'right')]
        )
      )
    }

    const filterValue = ctx.filterState.value[column.key]
    const filterText = filterValue == null ? '' : String(filterValue)

    headerCells.push(
      h(
        'th',
        {
          key: column.key,
          scope: 'col',
          'data-tiger-table-column-key': column.key,
          'aria-sort': ariaSort,
          class: classNames(
            getTableHeaderCellClasses(
              props.size,
              column.align || 'left',
              !!column.sortable,
              column.headerClassName
            ),
            getTableFixedHeaderCellClasses({
              view: 'table',
              column,
              stickyHeader: props.stickyHeader,
              fixedInfo: ctx.fixedColumnsInfo.value
            })
          ),
          style,
          draggable: props.columnDraggable ? 'true' : undefined,
          onClick: column.sortable
            ? (event: MouseEvent) => {
                if (isHeaderSortClickTarget(event.target)) return
                ctx.handleSort(column.key)
              }
            : undefined,
          onDragstart: props.columnDraggable ? () => ctx.handleDragStart(column.key) : undefined,
          onDragover: props.columnDraggable ? (e: DragEvent) => e.preventDefault() : undefined,
          onDrop: props.columnDraggable ? () => ctx.handleDrop(column.key) : undefined
        },
        [
          h('div', { class: 'flex items-center gap-2' }, headerContent),
          ...(column.filter
            ? [
                h(
                  'div',
                  {
                    class: 'mt-2',
                    'data-tiger-table-filter': '',
                    draggable: false,
                    onClick: (e: Event) => e.stopPropagation(),
                    onDragstart: (e: DragEvent) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }
                  },
                  [
                    column.filter.type === 'select' && column.filter.options
                      ? h(
                          'select',
                          {
                            class: getInputClasses({ size: 'sm' }),
                            'aria-label': formatTableFilterColumnAriaLabel(
                              labels.filterColumnAriaLabel,
                              String(column.title)
                            ),
                            value: filterText,
                            draggable: false,
                            onChange: (e: Event) =>
                              ctx.handleFilter(column.key, (e.target as HTMLSelectElement).value)
                          },
                          [
                            h('option', { value: '' }, labels.allText),
                            ...column.filter.options.map((opt) =>
                              h('option', { value: opt.value }, opt.label)
                            )
                          ]
                        )
                      : h(Input, {
                          size: 'sm',
                          modelValue: filterText,
                          'aria-label': formatTableFilterColumnAriaLabel(
                            labels.filterColumnAriaLabel,
                            String(column.title)
                          ),
                          placeholder: column.filter.placeholder || labels.filterPlaceholder,
                          draggable: false,
                          'onUpdate:modelValue': (value: string | number | undefined) =>
                            ctx.handleFilter(column.key, value ?? '')
                        })
                  ]
                )
              ]
            : [])
        ]
      )
    )
  })

  headerCells.push(...chrome.trailing.map((slot) => chromeTh(slot)))

  return h('thead', { class: getTableHeaderClasses(props.stickyHeader) }, [h('tr', headerCells)])
}
