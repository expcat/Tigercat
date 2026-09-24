import { h, type VNodeChild } from 'vue'
import {
  buildSummaryCells,
  getTableCellClasses,
  getTableChromeSlots,
  hasTableSelectionColumn,
  resolveTableExpandSlot,
  tableSummaryRowClasses
} from '@expcat/tigercat-core'
import type { TableContext, TableInternalProps } from './types'

export function renderSummaryRow(ctx: TableContext, props: TableInternalProps): VNodeChild {
  if (!props.summaryRow?.show) return null
  const chrome = getTableChromeSlots({
    hasSelectionColumn: hasTableSelectionColumn(props.rowSelection),
    expand: resolveTableExpandSlot(props.expandable)
  })
  const emptyCell = (): VNodeChild => h('td', { class: getTableCellClasses(props.size, 'left') })
  const leading = chrome.leading.map(() => emptyCell())
  const trailing = chrome.trailing.map(() => emptyCell())
  const summaryCells = buildSummaryCells({
    records: ctx.processedData.value,
    columns: ctx.displayColumns.value,
    caller: props.summaryRow?.data,
    sum: props.summaryRow?.sum
  })
  const dataCells = ctx.displayColumns.value.map((col, index) => {
    return h(
      'td',
      {
        key: col.key,
        class: getTableCellClasses(props.size, col.align || 'left', col.className)
      },
      summaryCells[index] ?? ''
    )
  })
  return h('tfoot', { 'data-tiger-summary': '', style: { position: 'sticky', bottom: '0' } }, [
    h('tr', { class: tableSummaryRowClasses }, [...leading, ...dataCells, ...trailing])
  ])
}
