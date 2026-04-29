import { h, type VNodeChild } from 'vue'
import { getTableCellClasses, tableSummaryRowClasses } from '@expcat/tigercat-core'
import type { TableContext, TableInternalProps } from './types'

export function renderSummaryRow(ctx: TableContext, props: TableInternalProps): VNodeChild {
  if (!props.summaryRow?.show) return null
  const emptyCells: VNodeChild[] = []
  if (props.rowSelection) {
    emptyCells.push(h('td', { class: getTableCellClasses(props.size, 'left') }))
  }
  if (props.expandable) {
    emptyCells.push(h('td', { class: getTableCellClasses(props.size, 'left') }))
  }
  const dataCells = ctx.displayColumns.value.map((col) => {
    const dataKey = col.dataKey || col.key
    const val = props.summaryRow!.data[dataKey]
    return h(
      'td',
      {
        key: col.key,
        class: getTableCellClasses(props.size, col.align || 'left', col.className)
      },
      val != null ? String(val) : ''
    )
  })
  return h('tfoot', [h('tr', { class: tableSummaryRowClasses }, [...emptyCells, ...dataCells])])
}
