import { h, type Slots, type VNodeChild } from 'vue'
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
  type TableVirtualWindow,
  type TigerLocaleTable
} from '@expcat/tigercat-core'
import { Checkbox } from '../Checkbox'
import { Empty } from '../Empty'
import { Radio } from '../Radio'
import { ExpandIcon } from './icons'
import type { TableContext, TableInternalProps } from './types'
import { Input } from '../Input'
import { InputNumber } from '../InputNumber'
import { Select } from '../Select'

export function renderTableBody(
  ctx: TableContext,
  props: TableInternalProps & {
    interactiveRows?: boolean
    virtualWindow?: TableVirtualWindow
    selectionName?: string
    activeRowIndex?: number
    onActiveRowIndex?: (index: number) => void
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
    return h('tbody', { 'aria-hidden': 'true' }, [
      h('tr', { tabindex: -1 }, [
        h(
          'td',
          {
            colspan: ctx.totalColumnCount.value,
            class: 'animate-pulse'
          },
          '\u00a0'
        )
      ])
    ])
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
            h(Empty, {
              description: props.emptyText,
              showImage: false
            })
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
    if (isVirtualTableCellControlTarget(event.target)) return
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
    const isSelected = ctx.selectedRowKeySet.value.has(tableRowKeyId(key))
    const isExpanded = ctx.expandedRowKeySet.value.has(tableRowKeyId(key))
    const rowLabel =
      props.rowSelection?.getRowLabel?.(record, index + 1) ??
      formatTableSelectRowAriaLabel(labels.selectRowAriaLabel, index + 1)
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
              'aria-label': rowLabel,
              onChange: (checked: boolean) => {
                if (checked) ctx.handleSelectRow(key, true)
              }
            })
          : h(Checkbox, {
              size: 'sm',
              modelValue: isSelected,
              disabled: checkboxProps.disabled,
              'aria-label': rowLabel,
              onChange: (checked: boolean) => ctx.handleSelectRow(key, checked)
            })
      ]
    )

    function chromeTd(slot: 'expand' | 'selection'): VNodeChild {
      return slot === 'expand' ? expandToggleCell : selectionCell
    }

    cells.push(...chrome.leading.map((slot) => chromeTd(slot)))

    const bodyColumns =
      (props as TableInternalProps & { renderedColumns?: TableInternalProps['columns'] })
        .renderedColumns ?? ctx.displayColumns.value
    bodyColumns.forEach((column) => {
      const dataKey = column.dataKey || column.key
      const cellValue = record[dataKey]

      const fixedStyle = getFixedColumnStyle(column, ctx.fixedColumnsInfo.value, TABLE_FIXED_CELL_Z_INDEX)

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

      const editorEvents = {
        onBlur: () => ctx.commitEdit(),
        onKeydown: (e: KeyboardEvent) => {
          if (e.key === 'Enter') ctx.commitEdit()
          if (isEscapeKey(e)) {
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
            ctx.cancelEdit()
          }
        }
      }
      const cellContent = isEditing
        ? column.edit === 'number'
          ? h(InputNumber, {
              modelValue: Number(ctx.editingValue.value),
              'onUpdate:modelValue': (value: number | null) => {
                ctx.editingValue.value = value == null ? '' : String(value)
              },
              ...editorEvents
            })
          : column.edit === 'select'
            ? h(Select, {
                modelValue: ctx.editingValue.value,
                options: column.editOptions ?? [],
                'onUpdate:modelValue': (value: string | number | undefined) => {
                  ctx.editingValue.value = value == null ? '' : String(value)
                },
                ...editorEvents
              })
            : column.edit === 'text'
              ? h(Input, {
                  modelValue: ctx.editingValue.value,
                  'onUpdate:modelValue': (value: string) => {
                    ctx.editingValue.value = value
                  },
                  ...editorEvents
                })
              : h('input', {
                  type: 'text',
                  class: editableCellInputClasses,
                  value: ctx.editingValue.value,
                  autofocus: true,
                  onInput: (e: Event) => {
                    ctx.editingValue.value = (e.target as HTMLInputElement).value
                  },
                  ...editorEvents
                })
        : (slots[`cell-${column.key}`]?.({ record, index: sourceIndex }) ??
          (column.render ? (column.render(record, sourceIndex) as string) : (cellValue as string)))

      cells.push(
        h(
          'td',
          {
            key: column.key,
            rowspan:
              resolveCellSpan(column.rowSpan, record, sourceIndex) !== 1
                ? resolveCellSpan(column.rowSpan, record, sourceIndex)
                : undefined,
            colspan:
              resolveCellSpan(column.colSpan, record, sourceIndex) !== 1
                ? resolveCellSpan(column.colSpan, record, sourceIndex)
                : undefined,
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

    if (props.rowDraggable) {
      cells.unshift(
        h('td', { class: getCheckboxCellClasses(props.size) }, [
          h(
            'button',
            {
              type: 'button',
              class: tableRowDragHandleClasses,
              draggable: 'true',
              'aria-label': formatTableSelectRowAriaLabel(labels.dragRowAriaLabel, index + 1),
              'data-tiger-row-drag-handle': '',
              onDragstart: (event: DragEvent) => {
                event.stopPropagation()
                ctx.handleRowDragStart(key)
              }
            },
            '::'
          )
        ])
      )
    }

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
        'data-tiger-table-page-index': index,
        style: props.virtualWindow
          ? { minHeight: `${props.virtualItemHeight}px`, height: `${props.virtualItemHeight}px` }
          : undefined,
        tabindex: props.grid
          ? -1
          : hasRowControls
            ? undefined
            : index === (props.activeRowIndex ?? 0)
              ? 0
              : -1,
        onKeydown: hasRowControls
          ? undefined
          : (e: KeyboardEvent) => {
              if (e.target !== e.currentTarget) return
              if (isActivationKey(e) && props.interactiveRows) {
                e.preventDefault()
                ctx.handleRowClick(record, sourceIndex, key)
                return
              }
              if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
              e.preventDefault()
              const next = e.key === 'ArrowDown' ? index + 1 : index - 1
              if (next < 0 || next >= ctx.paginatedData.value.length) return
              props.onActiveRowIndex?.(next)
              const row = (e.currentTarget as HTMLElement).parentElement?.querySelector(
                `tr[data-tiger-table-page-index="${next}"]`
              ) as HTMLElement | null
              row?.focus()
            }
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

  if (ctx.groupBlocks.value) {
    const groupRows: VNodeChild[] = []
    let rowCursor = 0
    for (const block of ctx.groupBlocks.value) {
      const collapsed =
        ctx.groupCollapseEnabled.value && ctx.collapsedGroups.value.includes(String(block.key))
      if (!block.continued) {
        const headerText = formatTableGroupHeaderText(labels.groupHeaderText, block.key, block.count)
        groupRows.push(
          h('tr', { key: `group-${block.key}`, class: tableGroupHeaderClasses }, [
            h(
              'td',
              {
                colspan: ctx.totalColumnCount.value,
                class: getGroupHeaderCellClasses(props.size)
              },
              ctx.groupCollapseEnabled.value
                ? h(
                    'button',
                    {
                      type: 'button',
                      'data-tiger-group': String(block.key),
                      'aria-expanded': collapsed ? 'false' : 'true',
                      onClick: () => ctx.toggleGroup(String(block.key))
                    },
                    headerText
                  )
                : headerText
            )
          ])
        )
      }
      if (collapsed) continue
      for (const record of block.records) {
        const pageIndex = ctx.paginatedData.value.indexOf(record, rowCursor)
        const index = pageIndex >= 0 ? pageIndex : rowCursor
        rowCursor = index + 1
        const result = renderDataRow(record, index)
        if (Array.isArray(result)) groupRows.push(...result)
        else groupRows.push(result)
      }
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
