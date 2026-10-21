import React from 'react'
import {
  buildSummaryCells,
  getTableCellClasses,
  getTableChromeSlots,
  getTableColumnRenderEntries,
  getTableColumnSpacerStyle,
  hasTableSelectionColumn,
  resolveTableExpandSlot,
  tableSummaryRowClasses,
  type TableColumnRenderEntry,
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
  columnEntries?: TableColumnRenderEntry[]
}

export function renderSummaryRow(ctx: TableContext, view: RenderSummaryViewProps): React.ReactNode {
  const { size, rowSelection, expandable, summaryRow, columnEntries } = view
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
  const summaryEntries = columnEntries ?? getTableColumnRenderEntries(ctx.displayColumns)
  const indexByKey = new Map(ctx.displayColumns.map((column, index) => [column.key, index]))
  return (
    <tfoot data-tiger-summary="" style={{ position: 'sticky', bottom: 0 }}>
      <tr className={tableSummaryRowClasses}>
        {chrome.leading.map((slot) => emptyCell(slot))}
        {summaryEntries.map((entry) => {
          if (entry.kind === 'spacer') {
            return (
              <td
                key={entry.key}
                aria-hidden="true"
                style={getTableColumnSpacerStyle(entry.width) as React.CSSProperties}
              />
            )
          }
          const column = entry.column
          const index = indexByKey.get(column.key) ?? -1
          return (
            <td
              key={column.key}
              className={getTableCellClasses(size, column.align || 'left', column.className)}>
              {index >= 0 ? (summaryCells[index] ?? '') : ''}
            </td>
          )
        })}
        {chrome.trailing.map((slot) => emptyCell(`end-${slot}`))}
      </tr>
    </tfoot>
  )
}
