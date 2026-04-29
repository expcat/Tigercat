import React from 'react'
import {
  getTableCellClasses,
  tableSummaryRowClasses,
  type RowSelectionConfig,
  type ExpandableConfig,
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
  return (
    <tfoot>
      <tr className={tableSummaryRowClasses}>
        {rowSelection && rowSelection.showCheckbox !== false && (
          <td className={getTableCellClasses(size, 'left')} />
        )}
        {expandable && <td className={getTableCellClasses(size, 'left')} />}
        {ctx.displayColumns.map((column) => (
          <td key={column.key} className={getTableCellClasses(size, column.align || 'left')}>
            {(summaryRow.data[column.dataKey || column.key] as React.ReactNode) ?? ''}
          </td>
        ))}
      </tr>
    </tfoot>
  )
}
