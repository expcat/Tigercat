/**
 * Table export utilities (CSV)
 */

import type { TableColumn } from '../types/table'

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

/**
 * Trigger a CSV file download in the browser
 */
export function downloadCsv(csvContent: string, filename: string = 'export'): void {
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

/**
 * Get export button classes
 */
export const tableExportButtonClasses =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)] bg-[var(--tiger-surface,#ffffff)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] transition-colors'
