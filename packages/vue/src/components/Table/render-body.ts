import { h, type Slots, type VNodeChild } from 'vue'
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
  getRowKey
} from '@expcat/tigercat-core'
import { ExpandIcon } from './icons'
import type { TableContext, TableInternalProps } from './types'

export function renderTableBody(
  ctx: TableContext,
  props: TableInternalProps,
  slots: Slots
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

  function renderDataRow(record: Record<string, unknown>, index: number): VNodeChild {
    const key = getRowKey(record, props.rowKey, index)
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
                    'aria-label': isExpanded ? 'Collapse row' : 'Expand row',
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

      const isFixedLeft = column.fixed === 'left'
      const isFixedRight = column.fixed === 'right'
      const fixedStyle = isFixedLeft
        ? {
            position: 'sticky',
            left: `${ctx.fixedColumnsInfo.value.leftOffsets[column.key] || 0}px`,
            zIndex: 10
          }
        : isFixedRight
          ? {
              position: 'sticky',
              right: `${ctx.fixedColumnsInfo.value.rightOffsets[column.key] || 0}px`,
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
        props.striped && index % 2 === 0
          ? 'bg-[var(--tiger-surface-muted,#f9fafb)]/50'
          : 'bg-[var(--tiger-surface,#ffffff)]'
      const stickyCellClass =
        isFixedLeft || isFixedRight
          ? classNames(
              stickyBgClass,
              props.hoverable && 'group-hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
            )
          : undefined

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
        class: classNames(
          getTableRowClasses(props.hoverable, props.striped, index % 2 === 0, rowClass),
          ctx.fixedColumnsInfo.value.hasFixedColumns && 'group'
        ),
        onClick: () => ctx.handleRowClick(record, index)
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
    return h('tbody', groupRows)
  }

  const rows = ctx.paginatedData.value.flatMap((record, index) => renderDataRow(record, index))

  return h('tbody', rows)
}
