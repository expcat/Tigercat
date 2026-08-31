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
  getTableChromeSlots,
  hasTableSelectionColumn,
  resolveTableExpandSlot,
  formatTableSelectRowAriaLabel,
  formatTableGroupHeaderText,
  tableVirtualSpacerCellClasses,
  type TableVirtualWindow,
  type TigerLocaleTable
} from '@expcat/tigercat-core'
import { Checkbox } from '../Checkbox'
import { Radio } from '../Radio'
import { ExpandIcon } from './icons'
import type { TableContext, TableInternalProps } from './types'

export function renderTableBody(
  ctx: TableContext,
  props: TableInternalProps & {
    interactiveRows?: boolean
    virtualWindow?: TableVirtualWindow
    selectionName?: string
  },
  slots: Slots,
  labels: Required<TigerLocaleTable>
): VNodeChild {
  const hasRowControls = hasTableSelectionColumn(props.rowSelection) || Boolean(props.expandable)
  const chrome = getTableChromeSlots({
    hasSelectionColumn: hasTableSelectionColumn(props.rowSelection),
    expand: resolveTableExpandSlot(props.expandable)
  })
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

    const sourceIndex = Number(row.dataset.tigerTableRowIndex)
    if (!Number.isInteger(sourceIndex)) return null

    const pageIndex = ctx.pageSourceIndices.value.indexOf(sourceIndex)
    if (pageIndex < 0) return null
    const record = ctx.paginatedData.value[pageIndex]
    const key = ctx.paginatedRowKeys.value[pageIndex]
    if (!record || key === undefined) return null

    return { key, record, index: sourceIndex }
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
    const sourceIndex = ctx.pageSourceIndices.value[index] ?? index
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
        ? props.rowClassName(record, sourceIndex)
        : props.rowClassName

    const cells: VNodeChild[] = []
    const checkboxProps = props.rowSelection?.getCheckboxProps?.(record) || {}

    const expandToggleCell = h(
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
                'aria-label': isExpanded ? labels.collapseRowAriaLabel : labels.expandRowAriaLabel,
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

    const selectionCell = h(
      'td',
      {
        class: getCheckboxCellClasses(props.size),
        onClick: (e: Event) => e.stopPropagation()
      },
      [
        props.rowSelection?.type === 'radio'
          ? h(Radio, {
              size: 'sm',
              name: props.selectionName,
              value: key,
              modelValue: isSelected,
              disabled: checkboxProps.disabled,
              'aria-label': formatTableSelectRowAriaLabel(
                labels.selectRowAriaLabel,
                sourceIndex + 1
              ),
              onChange: (checked: boolean) => {
                if (checked) ctx.handleSelectRow(key, true)
              }
            })
          : h(Checkbox, {
              size: 'sm',
              modelValue: isSelected,
              disabled: checkboxProps.disabled,
              'aria-label': formatTableSelectRowAriaLabel(
                labels.selectRowAriaLabel,
                sourceIndex + 1
              ),
              onChange: (checked: boolean) => ctx.handleSelectRow(key, checked)
            })
      ]
    )

    function chromeTd(slot: 'expand' | 'selection'): VNodeChild {
      return slot === 'expand' ? expandToggleCell : selectionCell
    }

    cells.push(...chrome.leading.map((slot) => chromeTd(slot)))

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
        rowIndex: sourceIndex,
        striped: props.striped,
        stripedActive: props.striped && index % 2 === 0,
        selected: isSelected,
        hoverable: props.hoverable,
        fixedInfo: ctx.fixedColumnsInfo.value
      })

      const isEditing =
        ctx.editingCell.value?.rowIndex === sourceIndex &&
        ctx.editingCell.value?.columnKey === column.key
      const isEditableCell = ctx.isCellEditable(column.key, sourceIndex)

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
        : (slots[`cell-${column.key}`]?.({ record, index: sourceIndex }) ??
          (column.render ? (column.render(record, sourceIndex) as string) : (cellValue as string)))

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
                ? () => ctx.startEditing(sourceIndex, column.key, cellValue)
                : undefined
          },
          [cellContent]
        )
      )
    })

    cells.push(...chrome.trailing.map((slot) => chromeTd(slot)))

    const rowNode = h(
      'tr',
      {
        key,
        'data-tiger-table-row-index': sourceIndex,
        class: classNames(
          getTableRowClasses(props.hoverable, props.striped, index % 2 === 0, rowClass),
          ctx.fixedColumnsInfo.value.hasFixedColumns && 'group'
        ),
        'aria-selected': props.rowSelection ? isSelected : undefined,
        tabindex: props.interactiveRows && !hasRowControls ? 0 : undefined,
        onKeydown:
          props.interactiveRows && !hasRowControls
            ? (e: KeyboardEvent) => {
                if (e.target !== e.currentTarget) return
                if (isActivationKey(e)) {
                  e.preventDefault()
                  ctx.handleRowClick(record, sourceIndex, key)
                }
              }
            : undefined,
        draggable: props.rowDraggable ? 'true' : undefined
      },
      cells
    )

    if (props.expandable && isExpanded && isRowExpandable) {
      const expandedContent =
        slots['expanded-row']?.({ record, index: sourceIndex }) ||
        (props.expandable.expandedRowRender
          ? props.expandable.expandedRowRender(record, sourceIndex)
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
            formatTableGroupHeaderText(labels.groupHeaderText, groupKey, groupItems.length)
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

  // Virtual row windowing: render only the visible slice with spacer rows.
  const vw = props.virtualWindow
  if (vw) {
    const windowed: VNodeChild[] = []
    if (vw.topPad > 0) {
      windowed.push(
        h(
          'tr',
          { key: 'virtual-top', 'aria-hidden': 'true', 'data-tiger-table-virtual-spacer': '' },
          [
            h('td', {
              colspan: ctx.totalColumnCount.value,
              class: tableVirtualSpacerCellClasses,
              style: { height: `${vw.topPad}px` }
            })
          ]
        )
      )
    }
    for (let index = vw.startIndex; index <= vw.endIndex; index++) {
      const record = ctx.paginatedData.value[index]
      if (record === undefined) continue
      const result = renderDataRow(record, index)
      if (Array.isArray(result)) windowed.push(...result)
      else windowed.push(result)
    }
    if (vw.bottomPad > 0) {
      windowed.push(
        h(
          'tr',
          {
            key: 'virtual-bottom',
            'aria-hidden': 'true',
            'data-tiger-table-virtual-spacer': ''
          },
          [
            h('td', {
              colspan: ctx.totalColumnCount.value,
              class: tableVirtualSpacerCellClasses,
              style: { height: `${vw.bottomPad}px` }
            })
          ]
        )
      )
    }
    return h('tbody', delegatedBodyHandlers, windowed)
  }

  const rows = ctx.paginatedData.value.flatMap((record, index) => renderDataRow(record, index))

  return h('tbody', delegatedBodyHandlers, rows)
}
