import { defineComponent, h } from 'vue'
import {
  classNames,
  getTableWrapperClasses,
  tableBaseClasses,
  tableLoadingOverlayClasses,
  tableExportButtonClasses
} from '@expcat/tigercat-core'

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
    const ctx = useTableState(props as TableInternalProps, emit)

    return () => {
      const resolvedProps = props as TableInternalProps
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
          class: classNames(
            tableBaseClasses,
            resolvedProps.tableLayout === 'fixed' ? 'table-fixed' : 'table-auto'
          ),
          style:
            ctx.fixedColumnsInfo.value.hasFixedColumns &&
            ctx.fixedColumnsInfo.value.minTableWidth
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
          class: getTableWrapperClasses(resolvedProps.bordered, resolvedProps.maxHeight),
          style: wrapperStyle,
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
