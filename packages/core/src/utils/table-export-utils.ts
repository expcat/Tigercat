/**
 * Table export utilities (CSV / Excel-compatible HTML worksheet)
 */

import type { TableColumn, TableExportFormat } from '../types/table'
import { isBrowser } from './env'

/**
 * Escape a value for CSV output
 */
function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Export table data to CSV string
 */
export function exportTableToCsv<T>(
  columns: TableColumn<T>[],
  data: T[],
  _filename?: string
): string {
  const headers = columns.map((col) => escapeCsvValue(col.title))
  const rows = data.map((record) =>
    columns
      .map((col) => {
        const key = col.dataKey || col.key
        const value = (record as Record<string, unknown>)[key]
        return escapeCsvValue(value)
      })
      .join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}

function escapeHtmlValue(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function exportTableToExcel<T>(columns: TableColumn<T>[], data: T[]): string {
  const headerCells = columns.map((column) => `<th>${escapeHtmlValue(column.title)}</th>`).join('')
  const bodyRows = data
    .map((record) => {
      const cells = columns
        .map((column) => {
          const key = column.dataKey || column.key
          const value = (record as Record<string, unknown>)[key]
          return `<td>${escapeHtmlValue(value)}</td>`
        })
        .join('')

      return `<tr>${cells}</tr>`
    })
    .join('')

  return `<!doctype html><html><head><meta charset="utf-8"></head><body><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`
}

/**
 * Trigger a CSV file download in the browser
 */
export function downloadCsv(csvContent: string, filename: string = 'export'): void {
  if (!isBrowser()) return

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadExcel(excelContent: string, filename: string = 'export'): void {
  if (!isBrowser()) return

  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.xls`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportTableData<T>(
  columns: TableColumn<T>[],
  data: T[],
  format: TableExportFormat = 'csv'
): string {
  return format === 'excel' ? exportTableToExcel(columns, data) : exportTableToCsv(columns, data)
}

export function downloadTableExport(
  content: string,
  filename: string = 'export',
  format: TableExportFormat = 'csv'
): void {
  if (format === 'excel') {
    downloadExcel(content, filename)
    return
  }

  downloadCsv(content, filename)
}

/**
 * Get export button classes
 */
export const tableExportButtonClasses =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)] bg-[var(--tiger-surface,#ffffff)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] transition-colors'
