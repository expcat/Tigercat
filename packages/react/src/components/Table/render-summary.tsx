import React from 'react'
import {
  buildSummaryCells,
  getTableCellClasses,
  getTableChromeSlots,
  hasTableSelectionColumn,
  resolveTableExpandSlot,
  tableSummaryRowClasses,
  type ExpandableConfig,
  type RowSelectionConfig,
  type TableSize
} from '@expcat/tigercat-core'
import type { TableContext } from './types'

export interface RenderSummaryViewProps {
  size: TableSize
  rowSelection?: RowSelectionConfig
  expandable?: ExpandableConfig
  summaryRow?: {
    show: boolean
    data?: Record<string, unknown>
    sum?: boolean | string[]
  }
}

export function renderSummaryRow(ctx: TableContext, view: RenderSummaryViewProps): React.ReactNode {
  const { size, rowSelection, expandable, summaryRow } = view
  if (!summaryRow?.show) return null
  const chrome = getTableChromeSlots({
    hasSelectionColumn: hasTableSelectionColumn(rowSelection),
    expand: resolveTableExpandSlot(expandable)
  })
  const emptyCell = (key: string) => <td key={key} className={getTableCellClasses(size, 'left')} />
  const summaryCells = buildSummaryCells({
    records: ctx.processedData,
    columns: ctx.displayColumns,
    caller: summaryRow.data,
    sum: summaryRow.sum
  })
  return (
    <tfoot data-tiger-summary="" style={{ position: 'sticky', bottom: 0 }}>
      <tr className={tableSummaryRowClasses}>
        {chrome.leading.map((slot) => emptyCell(slot))}
        {ctx.displayColumns.map((column, index) => (
          <td
            key={column.key}
            className={getTableCellClasses(size, column.align || 'left', column.className)}>
            {summaryCells[index] ?? ''}
          </td>
        ))}
        {chrome.trailing.map((slot) => emptyCell(`end-${slot}`))}
      </tr>
    </tfoot>
  )
}
