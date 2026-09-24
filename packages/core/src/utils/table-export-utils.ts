/**
 * Table CSV export.
 *
 * Excel / xlsx is DataExport (`@expcat/tigercat-core/utils/data-export`), not
 * an HTML worksheet pretending to be `.xls`.
 */

import type { TableColumn } from '../types/table'
import { getTableColumnDataKey } from './table-utils'
import {
  assertDataExportCellCount,
  escapeCsvValue,
  resolveDataExportColumns,
  resolveDataExportFilename
} from './data-export-value'
import { downloadBrowserFile } from './file-utils'

export interface TableCsvExportOptions {
  hiddenColumnKeys?: Iterable<string>
}

export { escapeCsvValue }

const CSV_BOM = '\uFEFF'

function withCsvExtension(filename: string): string {
  return resolveDataExportFilename(filename, 'csv')
}

/**
 * Export table data to a CSV string (UTF-8 BOM + CRLF).
 *
 * Uses the same skip rules as DataExport: `hiddenColumnKeys` and render-only
 * columns without a record field are omitted. Cell values use `dataKey || key`.
 * `filename` is ignored — pass it to {@link downloadCsv}.
 */
export function exportTableToCsv<T>(
  columns: TableColumn<T>[],
  data: T[],
  options?: TableCsvExportOptions
): string {
  const exportColumns = resolveDataExportColumns(columns, data, options?.hiddenColumnKeys)
  assertDataExportCellCount(exportColumns.length, data.length)
  const headers = exportColumns.map((col) => escapeCsvValue(col.title))
  const rows = data.map((record) =>
    exportColumns
      .map((col) => {
        const value = (record as Record<string, unknown>)[getTableColumnDataKey(col)]
        return escapeCsvValue(value)
      })
      .join(',')
  )

  return `${CSV_BOM}${[headers.join(','), ...rows].join('\r\n')}`
}

export function exportTableData<T>(
  columns: TableColumn<T>[],
  data: T[],
  options?: TableCsvExportOptions
): string {
  return exportTableToCsv(columns, data, options)
}

/**
 * Trigger a CSV file download in the browser.
 * Existing `.csv` suffixes are not duplicated.
 */
export function downloadCsv(csvContent: string, filename: string = 'export'): void {
  downloadBrowserFile(csvContent, withCsvExtension(filename), 'text/csv;charset=utf-8;')
}

export function downloadTableExport(content: string, filename: string = 'export'): void {
  downloadCsv(content, filename)
}

/**
 * Get export button classes
 */
export const tableExportButtonClasses =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] text-[var(--tiger-text)] bg-[var(--tiger-surface)] hover:bg-[var(--tiger-surface-muted)] transition-colors'
