import { h, type Slots, type VNodeChild } from 'vue'
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
  type TigerLocaleTable
} from '@expcat/tigercat-core'
import { ExpandIcon } from './icons'
import type { TableContext, TableInternalProps } from './types'

export function renderTableBody(
  ctx: TableContext,
  props: TableInternalProps & { interactiveRows?: boolean },
  slots: Slots,
  labels: Required<TigerLocaleTable>
): VNodeChild {
  if (props.loading) {
    return null
  }

  if (ctx.paginatedData.value.length === 0) {
    return h('tbody', [
      h('tr', [
        h(
          'td',
          {
            colspan: ctx.totalColumnCount.value,
            class: tableEmptyStateClasses
          },
          [
            h(
              'div',
              {
                role: 'status',
                'aria-live': 'polite'
              },
              props.emptyText
            )
          ]
        )
      ])
    ])
  }

  function getDelegatedRow(event: Event): {
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

    const record = ctx.paginatedData.value[index]
    const key = ctx.paginatedRowKeys.value[index]
    if (!record || key === undefined) return null

    return { key, record, index }
  }

  function handleBodyClick(event: MouseEvent) {
    const row = getDelegatedRow(event)
    if (!row) return
    ctx.handleRowClick(row.record, row.index, row.key)
  }

  function handleBodyDragStart(event: DragEvent) {
    if (!props.rowDraggable) return
    const row = getDelegatedRow(event)
    if (!row) return
    ctx.handleRowDragStart(row.key)
  }

  function handleBodyDragOver(event: DragEvent) {
    if (!props.rowDraggable) return
    event.preventDefault()
  }

  function handleBodyDrop(event: DragEvent) {
    if (!props.rowDraggable) return
    const row = getDelegatedRow(event)
    if (!row) return
    ctx.handleRowDrop(row.key)
  }

  const delegatedBodyHandlers = {
    onClick: handleBodyClick,
    onDragstart: props.rowDraggable ? handleBodyDragStart : undefined,
    onDragover: props.rowDraggable ? handleBodyDragOver : undefined,
    onDrop: props.rowDraggable ? handleBodyDrop : undefined
  }

  function renderDataRow(record: Record<string, unknown>, index: number): VNodeChild {
    const key = ctx.paginatedRowKeys.value[index]
    const isSelected = ctx.selectedRowKeySet.value.has(key)
    const isExpanded = ctx.expandedRowKeySet.value.has(key)
    const isRowExpandable = props.expandable
      ? props.expandable.rowExpandable
        ? props.expandable.rowExpandable(record)
        : true
      : false
    const rowClass =
      typeof props.rowClassName === 'function'
        ? props.rowClassName(record, index)
        : props.rowClassName

    const cells: VNodeChild[] = []
    const expandAtStart = props.expandable && props.expandable.expandIconPosition !== 'end'

    const expandToggleCell = props.expandable
      ? h(
          'td',
          {
            class: getExpandIconCellClasses(props.size)
          },
          isRowExpandable
            ? [
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'inline-flex items-center justify-center',
                    'aria-label': isExpanded
                      ? labels.collapseRowAriaLabel
                      : labels.expandRowAriaLabel,
                    'aria-expanded': isExpanded,
                    onClick: (e: Event) => {
                      e.stopPropagation()
                      ctx.handleToggleExpand(key, record)
                    }
                  },
                  [ExpandIcon(isExpanded)]
                )
              ]
            : []
        )
      : null

    if (expandAtStart && expandToggleCell) {
      cells.push(expandToggleCell)
    }

    if (props.rowSelection && props.rowSelection.showCheckbox !== false) {
      const checkboxProps = props.rowSelection?.getCheckboxProps?.(record) || {}

      cells.push(
        h(
          'td',
          {
            class: getCheckboxCellClasses(props.size)
          },
          [
            h('input', {
              type: props.rowSelection?.type === 'radio' ? 'radio' : 'checkbox',
              class:
                props.rowSelection?.type === 'radio'
                  ? 'border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]'
                  : 'rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]',
              checked: isSelected,
              disabled: checkboxProps.disabled,
              onClick: (e: Event) => e.stopPropagation(),
              onChange: (e: Event) =>
                ctx.handleSelectRow(key, (e.target as HTMLInputElement).checked)
            })
          ]
        )
      )
    }

    ctx.displayColumns.value.forEach((column) => {
      const dataKey = column.dataKey || column.key
      const cellValue = record[dataKey]

      const fixedStyle = getFixedColumnStyle(column, ctx.fixedColumnsInfo.value, 10)

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
        striped: props.striped,
        stripedActive: props.striped && index % 2 === 0,
        selected: isSelected,
        hoverable: props.hoverable,
        fixedInfo: ctx.fixedColumnsInfo.value
      })

      const isEditing =
        ctx.editingCell.value?.rowIndex === index && ctx.editingCell.value?.columnKey === column.key
      const isEditableCell = ctx.isCellEditable(column.key, index)

      const cellContent = isEditing
        ? h('input', {
            type: 'text',
            class: editableCellInputClasses,
            value: ctx.editingValue.value,
            autofocus: true,
            onInput: (e: Event) => {
              ctx.editingValue.value = (e.target as HTMLInputElement).value
            },
            onBlur: () => ctx.commitEdit(),
            onKeydown: (e: KeyboardEvent) => {
              if (e.key === 'Enter') ctx.commitEdit()
              if (e.key === 'Escape') ctx.cancelEdit()
            }
          })
        : (slots[`cell-${column.key}`]?.({ record, index }) ??
          (column.render ? (column.render(record, index) as string) : (cellValue as string)))

      cells.push(
        h(
          'td',
          {
            key: column.key,
            class: classNames(
              getTableCellClasses(props.size, column.align || 'left', column.className),
              stickyCellClass,
              isEditableCell && !isEditing && getEditableCellClasses(false)
            ),
            style,
            onDblclick:
              isEditableCell && !isEditing
                ? () => ctx.startEditing(index, column.key, cellValue)
                : undefined
          },
          [cellContent]
        )
      )
    })

    if (!expandAtStart && expandToggleCell) {
      cells.push(expandToggleCell)
    }

    const rowNode = h(
      'tr',
      {
        key,
        'data-tiger-table-row-index': index,
        class: classNames(
          getTableRowClasses(props.hoverable, props.striped, index % 2 === 0, rowClass),
          ctx.fixedColumnsInfo.value.hasFixedColumns && 'group'
        ),
        'aria-selected': props.rowSelection ? isSelected : undefined,
        tabindex: props.interactiveRows ? 0 : undefined,
        // Delegated mouse click stays on tbody; add per-row keyboard activation.
        onKeydown: props.interactiveRows
          ? (e: KeyboardEvent) => {
              if (e.target !== e.currentTarget) return
              if (isActivationKey(e)) {
                e.preventDefault()
                ctx.handleRowClick(record, index, key)
              }
            }
          : undefined,
        draggable: props.rowDraggable ? 'true' : undefined
      },
      cells
    )

    if (props.expandable && isExpanded && isRowExpandable) {
      const expandedContent =
        slots['expanded-row']?.({ record, index }) ||
        (props.expandable.expandedRowRender
          ? props.expandable.expandedRowRender(record, index)
          : null)

      const expandedRow = h(
        'tr',
        {
          key: `${key}-expanded`,
          class: getExpandedRowClasses()
        },
        [
          h(
            'td',
            {
              colspan: ctx.totalColumnCount.value,
              class: getExpandedRowContentClasses(props.size)
            },
            [expandedContent as VNodeChild]
          )
        ]
      )

      return [rowNode, expandedRow]
    }

    return rowNode
  }

  if (ctx.groupedData.value) {
    const groupRows: VNodeChild[] = []
    for (const [groupKey, groupItems] of ctx.groupedData.value) {
      groupRows.push(
        h('tr', { key: `group-${groupKey}`, class: tableGroupHeaderClasses }, [
          h(
            'td',
            {
              colspan: ctx.totalColumnCount.value,
              class: getGroupHeaderCellClasses(props.size)
            },
            `${props.groupBy}: ${groupKey} (${groupItems.length})`
          )
        ])
      )
      groupItems.forEach((record, i) => {
        const globalIndex = ctx.paginatedData.value.indexOf(record)
        const result = renderDataRow(record, globalIndex >= 0 ? globalIndex : i)
        if (Array.isArray(result)) {
          groupRows.push(...result)
        } else {
          groupRows.push(result)
        }
      })
    }
    return h('tbody', delegatedBodyHandlers, groupRows)
  }

  const rows = ctx.paginatedData.value.flatMap((record, index) => renderDataRow(record, index))

  return h('tbody', delegatedBodyHandlers, rows)
}
