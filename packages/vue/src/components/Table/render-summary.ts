import { h, type VNodeChild } from 'vue'
import {
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
  const dataCells = ctx.displayColumns.value.map((col) => {
    const dataKey = col.dataKey || col.key
    const val = props.summaryRow!.data[dataKey]
    return h(
      'td',
      {
        key: col.key,
        class: getTableCellClasses(props.size, col.align || 'left', col.className)
      },
      (val as VNodeChild) ?? undefined
    )
  })
  return h('tfoot', [
    h('tr', { class: tableSummaryRowClasses }, [...leading, ...dataCells, ...trailing])
  ])
}
