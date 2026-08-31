import React from 'react'
import {
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
  summaryRow?: { show: boolean; data: Record<string, unknown> }
}

export function renderSummaryRow(ctx: TableContext, view: RenderSummaryViewProps): React.ReactNode {
  const { size, rowSelection, expandable, summaryRow } = view
  if (!summaryRow?.show) return null
  const chrome = getTableChromeSlots({
    hasSelectionColumn: hasTableSelectionColumn(rowSelection),
    expand: resolveTableExpandSlot(expandable)
  })
  const emptyCell = (key: string) => <td key={key} className={getTableCellClasses(size, 'left')} />
  return (
    <tfoot>
      <tr className={tableSummaryRowClasses}>
        {chrome.leading.map((slot) => emptyCell(slot))}
        {ctx.displayColumns.map((column) => (
          <td
            key={column.key}
            className={getTableCellClasses(size, column.align || 'left', column.className)}>
            {(summaryRow.data[column.dataKey || column.key] as React.ReactNode) ?? ''}
          </td>
        ))}
        {chrome.trailing.map((slot) => emptyCell(`end-${slot}`))}
      </tr>
    </tfoot>
  )
}
