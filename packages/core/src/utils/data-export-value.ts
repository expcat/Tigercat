/**
 * Shared DataExport cell/column/filename helpers.
 *
 * Lives in the main bundle so Table CSV and the lazy xlsx writer use one stack.
 * Zip/OOXML stay in `utils/data-export`.
 */

import type { DataExportFormat } from '../types/data-export'
import type { TableColumn } from '../types/table'
import { isBrowser } from './env'

function columnField<T>(column: TableColumn<T>): string {
  return column.dataKey || column.key
}

export const DATA_EXPORT_FORMATS: readonly DataExportFormat[] = ['xlsx', 'markdown', 'csv']
export const DEFAULT_DATA_EXPORT_FORMATS: readonly DataExportFormat[] = ['xlsx', 'markdown']
export const DATA_EXPORT_SOFT_CELL_LIMIT = 100_000
export const DATA_EXPORT_MAX_CELL_CHARS = 32_767
export const DATA_EXPORT_FORMULA_PREFIX = /^[=+\-@]/

export function isDataExportFormat(value: unknown): value is DataExportFormat {
  return value === 'xlsx' || value === 'markdown' || value === 'csv'
}

/**
 * Normalize a cell value for every export format.
 * Dates become ISO; plain objects become JSON; null/undefined become `''`.
 */
export function formatDataExportCellValue(value: unknown): unknown {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return ''
    }
  }
  return value
}

/**
 * Prefix spreadsheet formulas and clip Excel's per-cell character cap.
 */
export function sanitizeDataExportText(value: unknown): string {
  let str = value === null || value === undefined ? '' : String(value)
  if (DATA_EXPORT_FORMULA_PREFIX.test(str)) {
    str = `'${str}`
  }
  if (str.length > DATA_EXPORT_MAX_CELL_CHARS) {
    return str.slice(0, DATA_EXPORT_MAX_CELL_CHARS)
  }
  return str
}

/**
 * Action columns that only have `render` and no record field are not exported.
 */
export function isRenderOnlyExportColumn<T>(column: TableColumn<T>, data: T[]): boolean {
  if (!column.render) return false
  const field = columnField(column)
  if (!field) return true
  return data.every((record) => (record as Record<string, unknown>)[field] === undefined)
}

export function resolveDataExportColumns<T>(
  columns: TableColumn<T>[],
  data: T[],
  hiddenColumnKeys?: Iterable<string>
): TableColumn<T>[] {
  const hidden = hiddenColumnKeys ? new Set(hiddenColumnKeys) : null
  return columns.filter((column) => {
    if (hidden?.has(column.key)) return false
    return !isRenderOnlyExportColumn(column, data)
  })
}

export function getDataExportCellValue<T>(
  record: T,
  column: TableColumn<T>,
  cellFormatter?: (value: unknown, column: TableColumn<T>, record: T) => unknown
): unknown {
  const field = columnField(column)
  const raw = field ? (record as Record<string, unknown>)[field] : undefined
  const next = cellFormatter ? cellFormatter(raw, column, record) : raw
  return formatDataExportCellValue(next)
}

/**
 * Build a download name: empty → `export`; keep an existing matching suffix;
 * replace path punctuation.
 */
export function resolveDataExportFilename(fileName: string | undefined, extension: string): string {
  const trimmed = (fileName ?? '').trim()
  const cleaned = (trimmed || 'export').replace(/[\\/:*?"<>|]+/g, '-')
  const suffix = `.${extension}`
  if (cleaned.toLowerCase().endsWith(suffix.toLowerCase())) return cleaned
  return `${cleaned}${suffix}`
}

export function yieldDataExportFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (!isBrowser() || typeof requestAnimationFrame !== 'function') {
      setTimeout(resolve, 0)
      return
    }
    requestAnimationFrame(() => resolve())
  })
}
