import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  classNames,
  createTableResizeObserverController,
  getTableWrapperClasses,
  getTableVirtualRecommendation,
  tableBaseClasses,
  tableLoadingOverlayClasses
} from '@expcat/tigercat-core'
import { tableExportButtonClasses } from '@expcat/tigercat-core/utils/table-export'

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
        dataLength: resolvedProps.dataSource.length,
        threshold: resolvedProps.virtualThreshold
      })
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
            resolvedProps.tableLayout === 'fixed' ? 'table-fixed' : 'table-auto'
          ),
          style:
            ctx.fixedColumnsInfo.value.hasFixedColumns && ctx.fixedColumnsInfo.value.minTableWidth
              ? { minWidth: `${ctx.fixedColumnsInfo.value.minTableWidth}px` }
              : undefined
        },
        tableChildren
      )

      const tableContent = resolvedProps.virtual
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

      return h(
        'div',
        {
          ref: wrapperRef,
          class: getTableWrapperClasses(resolvedProps.bordered, resolvedProps.maxHeight),
          style: wrapperStyle,
          'data-tiger-virtual': virtualRecommendation.enabled ? 'enabled' : undefined,
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
                  'aria-label': 'Export to CSV'
                },
                'Export CSV'
              )
            ]),

          tableContent,

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
