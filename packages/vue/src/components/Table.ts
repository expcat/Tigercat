import { defineComponent, h, onBeforeUnmount, onMounted, ref, type VNodeChild } from 'vue'
import {
  classNames,
  createTableResizeObserverController,
  getTableWrapperClasses,
  getTableResponsiveTableClasses,
  getTableVirtualRecommendation,
  tableBaseClasses,
  tableResponsiveCardClasses,
  tableResponsiveCardLabelClasses,
  tableResponsiveCardListClasses,
  tableResponsiveCardRowClasses,
  tableResponsiveCardValueClasses,
  tableLoadingOverlayClasses
} from '@expcat/tigercat-core'
import { tableExportButtonClasses } from '@expcat/tigercat-core'

import { tableEmits, tableProps, type VueTableProps } from './Table/props'
import { useTableState } from './Table/state'
import { LoadingSpinner } from './Table/icons'
import { renderTableHeader } from './Table/render-header'
import { renderTableBody } from './Table/render-body'
import { renderSummaryRow } from './Table/render-summary'
import { renderPagination } from './Table/render-pagination'
import type { TableInternalProps } from './Table/types'

export type { VueTableProps }

export const Table = defineComponent({
  name: 'TigerTable',
  props: tableProps,
  emits: tableEmits as unknown as string[],
  setup(props, { emit, slots }) {
    const wrapperRef = ref<HTMLElement | null>(null)
    const tableRef = ref<HTMLTableElement | null>(null)
    const measuredColumnWidths = ref<Record<string, number>>({})
    const measuredRowHeights = ref<number[]>([])
    const ctx = useTableState(props as TableInternalProps, emit, measuredColumnWidths)

    const resizeController = createTableResizeObserverController({
      onResize: (snapshot) => {
        if (!areNumberRecordsEqual(measuredColumnWidths.value, snapshot.columnWidths)) {
          measuredColumnWidths.value = snapshot.columnWidths
        }
        if (!areNumberArraysEqual(measuredRowHeights.value, snapshot.rowHeights)) {
          measuredRowHeights.value = snapshot.rowHeights
        }
      }
    })

    onMounted(() => {
      if (wrapperRef.value) {
        resizeController.observe(wrapperRef.value, tableRef.value)
      }
    })

    onBeforeUnmount(() => resizeController.disconnect())

    return () => {
      const resolvedProps = props as TableInternalProps
      const virtualRecommendation = getTableVirtualRecommendation({
        virtual: resolvedProps.virtual,
        autoVirtual: resolvedProps.autoVirtual,
        dataLength: resolvedProps.dataSource.length,
        threshold: resolvedProps.virtualThreshold,
        autoThreshold: resolvedProps.autoVirtualThreshold
      })
      const effectiveVirtual = virtualRecommendation.enabled
      const wrapperStyle = resolvedProps.maxHeight
        ? {
            maxHeight:
              typeof resolvedProps.maxHeight === 'number'
                ? `${resolvedProps.maxHeight}px`
                : resolvedProps.maxHeight
          }
        : undefined

      const tableChildren = [
        renderTableHeader(ctx, resolvedProps, slots),
        renderTableBody(ctx, resolvedProps, slots),
        renderSummaryRow(ctx, resolvedProps)
      ]

      const tableInner = h(
        'table',
        {
          ref: tableRef,
          class: classNames(
            tableBaseClasses,
            getTableResponsiveTableClasses(resolvedProps.responsiveMode),
            resolvedProps.tableLayout === 'fixed' ? 'table-fixed' : 'table-auto'
          ),
          style:
            ctx.fixedColumnsInfo.value.hasFixedColumns && ctx.fixedColumnsInfo.value.minTableWidth
              ? { minWidth: `${ctx.fixedColumnsInfo.value.minTableWidth}px` }
              : undefined
        },
        tableChildren
      )

      const tableContent = effectiveVirtual
        ? h(
            'div',
            {
              style: { height: `${resolvedProps.virtualHeight}px`, overflow: 'auto' },
              onScroll: (e: Event) => {
                ctx.virtualScrollTop.value = (e.target as HTMLElement).scrollTop
              }
            },
            [tableInner]
          )
        : tableInner

      const cardContent =
        resolvedProps.responsiveMode === 'card'
          ? h(
              'div',
              { class: tableResponsiveCardListClasses, 'data-tiger-table-mobile': 'card' },
              ctx.paginatedData.value.length === 0
                ? [h('div', { class: tableResponsiveCardClasses }, resolvedProps.emptyText)]
                : ctx.paginatedData.value.map((record, index) => {
                    const key = ctx.paginatedRowKeys.value[index]
                    const isExpanded = ctx.expandedRowKeySet.value.has(key)
                    const isRowExpandable = resolvedProps.expandable
                      ? resolvedProps.expandable.rowExpandable
                        ? resolvedProps.expandable.rowExpandable(record)
                        : true
                      : false

                    const rows = ctx.displayColumns.value.map((column) => {
                      const dataKey = column.dataKey || column.key
                      const cellValue = record[dataKey]
                      const cellContent =
                        slots[`cell-${column.key}`]?.({ record, index }) ??
                        (column.render
                          ? (column.render(record, index) as string)
                          : (cellValue as string))

                      return h('div', { key: column.key, class: tableResponsiveCardRowClasses }, [
                        h('div', { class: tableResponsiveCardLabelClasses }, column.title),
                        h('div', { class: tableResponsiveCardValueClasses }, [cellContent])
                      ])
                    })

                    const controls = []
                    if (
                      resolvedProps.rowSelection &&
                      resolvedProps.rowSelection.showCheckbox !== false
                    ) {
                      const checkboxProps =
                        resolvedProps.rowSelection.getCheckboxProps?.(record) || {}
                      controls.push(
                        h('input', {
                          type: resolvedProps.rowSelection.type === 'radio' ? 'radio' : 'checkbox',
                          checked: ctx.selectedRowKeySet.value.has(key),
                          disabled: checkboxProps.disabled,
                          onClick: (event: Event) => event.stopPropagation(),
                          onChange: (event: Event) =>
                            ctx.handleSelectRow(key, (event.target as HTMLInputElement).checked)
                        })
                      )
                    }
                    if (resolvedProps.expandable && isRowExpandable) {
                      controls.push(
                        h(
                          'button',
                          {
                            type: 'button',
                            class: 'text-sm text-[var(--tiger-primary,#2563eb)]',
                            'aria-expanded': isExpanded,
                            onClick: (event: Event) => {
                              event.stopPropagation()
                              ctx.handleToggleExpand(key, record)
                            }
                          },
                          isExpanded ? 'Collapse' : 'Expand'
                        )
                      )
                    }

                    const expandedContent =
                      resolvedProps.expandable && isExpanded && isRowExpandable
                        ? (slots['expanded-row']?.({ record, index }) ??
                          resolvedProps.expandable.expandedRowRender?.(record, index))
                        : null

                    return h(
                      'div',
                      {
                        key,
                        class: tableResponsiveCardClasses,
                        onClick: () => ctx.handleRowClick(record, index, key)
                      },
                      [
                        controls.length
                          ? h('div', { class: 'mb-2 flex items-center gap-3' }, controls)
                          : null,
                        ...rows,
                        expandedContent
                          ? h(
                              'div',
                              { class: 'mt-3 border-t border-[var(--tiger-border,#e5e7eb)] pt-3' },
                              [expandedContent as VNodeChild]
                            )
                          : null
                      ]
                    )
                  })
            )
          : null

      return h(
        'div',
        {
          ref: wrapperRef,
          class: getTableWrapperClasses(resolvedProps.bordered, resolvedProps.maxHeight),
          style: wrapperStyle,
          'data-tiger-virtual': virtualRecommendation.enabled ? 'enabled' : undefined,
          'data-tiger-virtual-auto': virtualRecommendation.autoEnabled ? 'true' : undefined,
          'data-tiger-virtual-recommended': virtualRecommendation.recommended ? 'true' : undefined,
          'data-tiger-virtual-threshold': virtualRecommendation.recommended
            ? virtualRecommendation.threshold
            : undefined,
          'data-tiger-measured-row-height': measuredRowHeights.value[0] || undefined,
          'aria-busy': resolvedProps.loading
        },
        [
          resolvedProps.exportable &&
            h('div', { class: 'flex justify-end p-2' }, [
              h(
                'button',
                {
                  type: 'button',
                  class: tableExportButtonClasses,
                  onClick: ctx.handleExport,
                  'aria-label':
                    resolvedProps.exportFormat === 'excel' ? 'Export to Excel' : 'Export to CSV'
                },
                resolvedProps.exportFormat === 'excel' ? 'Export Excel' : 'Export CSV'
              )
            ]),

          tableContent,
          cardContent,

          resolvedProps.loading &&
            h(
              'div',
              {
                class: tableLoadingOverlayClasses,
                role: 'status',
                'aria-live': 'polite',
                'aria-label': 'Loading'
              },
              [LoadingSpinner(), h('span', { class: 'sr-only' }, 'Loading')]
            ),

          renderPagination(ctx, resolvedProps)
        ]
      )
    }
  }
})

export default Table

function areNumberRecordsEqual(
  current: Record<string, number>,
  next: Record<string, number>
): boolean {
  const currentKeys = Object.keys(current)
  const nextKeys = Object.keys(next)
  return (
    currentKeys.length === nextKeys.length && nextKeys.every((key) => current[key] === next[key])
  )
}

function areNumberArraysEqual(current: number[], next: number[]): boolean {
  return current.length === next.length && next.every((value, index) => current[index] === value)
}
