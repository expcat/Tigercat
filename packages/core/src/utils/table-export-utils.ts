/**
 * Table CSV export.
 *
 * Excel / xlsx is DataExport (`@expcat/tigercat-core/utils/data-export`), not
 * an HTML worksheet pretending to be `.xls`.
 */

import type { TableColumn } from '../types/table'
import { isBrowser } from './env'
import { getTableColumnDataKey } from './table-utils'

const CSV_BOM = '\uFEFF'
const FORMULA_PREFIX = /^[=+\-@]/

function needsCsvQuotes(value: string): boolean {
  return /[",\n\r]/.test(value)
}

/**
 * Escape a value for RFC 4180 CSV output.
 */
export function escapeCsvValue(value: unknown): string {
  let str = value === null || value === undefined ? '' : String(value)
  if (FORMULA_PREFIX.test(str)) {
    str = `'${str}`
  }
  if (needsCsvQuotes(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function withCsvExtension(filename: string): string {
  return filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`
}

/**
 * Export table data to a CSV string (UTF-8 BOM + CRLF).
 *
 * Cell values use `dataKey || key`. `filename` is ignored — pass it to
 * {@link downloadCsv}.
 */
export function exportTableToCsv<T>(columns: TableColumn<T>[], data: T[]): string {
  const headers = columns.map((col) => escapeCsvValue(col.title))
  const rows = data.map((record) =>
    columns
      .map((col) => {
        const value = (record as Record<string, unknown>)[getTableColumnDataKey(col)]
        return escapeCsvValue(value)
      })
      .join(',')
  )

  return `${CSV_BOM}${[headers.join(','), ...rows].join('\r\n')}`
}

export function exportTableData<T>(columns: TableColumn<T>[], data: T[]): string {
  return exportTableToCsv(columns, data)
}

function downloadBlob(content: string, filename: string, mime: string): void {
  if (!isBrowser()) return

  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Trigger a CSV file download in the browser.
 * Existing `.csv` suffixes are not duplicated.
 */
export function downloadCsv(csvContent: string, filename: string = 'export'): void {
  downloadBlob(csvContent, withCsvExtension(filename), 'text/csv;charset=utf-8;')
}

export function downloadTableExport(content: string, filename: string = 'export'): void {
  downloadCsv(content, filename)
}

/**
 * Get export button classes
 */
export const tableExportButtonClasses =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)] bg-[var(--tiger-surface,#ffffff)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] transition-colors'
