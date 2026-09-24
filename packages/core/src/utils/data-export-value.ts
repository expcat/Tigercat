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
export const DEFAULT_DATA_EXPORT_FORMATS: readonly DataExportFormat[] = [
  'xlsx',
  'csv',
  'markdown'
]
/** Hard cap on header + body cells. Exports above this are rejected. */
export const DATA_EXPORT_MAX_CELLS = 100_000
export const DATA_EXPORT_MAX_CELL_CHARS = 32_767

const FORMULA_PREFIX = new Set(['=', '+', '-', '@', '＝', '＋', '－', '＠'])
const LEADING_EXPORT_NOISE = /^[\uFEFF \t\r\n\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/
const LEGAL_NUMBER = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/
const PHONE_TEXT = /^\+[0-9][0-9\s\-()]{6,19}$/
const FILENAME_CONTROLS = /[\u0000-\u001F\u007F\\/:*?"<>|]+/g
const FILENAME_BIDI = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g
const FILENAME_LINES = /[\r\n\u2028\u2029]+/g

export class DataExportLimitError extends Error {
  readonly name = 'DataExportLimitError'

  constructor(message: string) {
    super(message)
  }
}

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

export type DataExportCell =
  | { kind: 'number'; value: number }
  | { kind: 'text'; value: string }

function isLegalNegative(text: string): boolean {
  return LEGAL_NUMBER.test(text) && Number.isFinite(Number(text))
}

function isPhoneText(text: string): boolean {
  const digits = text.replace(/\D/g, '')
  return PHONE_TEXT.test(text) && digits.length >= 7
}

/**
 * Neutralize formula-like text. Finite numbers and phone numbers are not prefixed.
 * Cells over the character cap throw instead of being clipped.
 */
export function neutralizeDataExportText(value: string): string {
  if (value.length > DATA_EXPORT_MAX_CELL_CHARS) {
    throw new DataExportLimitError(
      `Cell exceeds ${DATA_EXPORT_MAX_CELL_CHARS} characters`
    )
  }
  const stripped = value.replace(LEADING_EXPORT_NOISE, '')
  const first = stripped[0]
  if (!first || !FORMULA_PREFIX.has(first)) return stripped
  if (isLegalNegative(stripped) || isPhoneText(stripped)) return stripped
  return `'${stripped}`
}

/** One cell rule for CSV, Markdown, and xlsx. */
export function toDataExportCell(value: unknown): DataExportCell {
  const formatted = formatDataExportCellValue(value)
  if (typeof formatted === 'number') {
    if (!Number.isFinite(formatted)) return { kind: 'text', value: '' }
    return { kind: 'number', value: formatted }
  }
  if (typeof formatted === 'boolean') {
    return { kind: 'text', value: formatted ? 'true' : 'false' }
  }
  const text = formatted == null ? '' : String(formatted)
  return { kind: 'text', value: neutralizeDataExportText(text) }
}

export function dataExportCellText(cell: DataExportCell): string {
  return cell.kind === 'number' ? String(cell.value) : cell.value
}

export function assertDataExportCellCount(columnCount: number, rowCount: number): void {
  const cells = columnCount * (rowCount + 1)
  if (cells > DATA_EXPORT_MAX_CELLS) {
    throw new DataExportLimitError(
      `Export has ${cells} cells, above the limit of ${DATA_EXPORT_MAX_CELLS}`
    )
  }
}

function needsCsvQuotes(value: string): boolean {
  return /[",\n\r]/.test(value)
}

/**
 * Escape a value for RFC 4180 CSV output (quotes, commas, newlines).
 * Shared by Table CSV and DataExport CSV.
 */
export function escapeCsvValue(value: unknown): string {
  const str = dataExportCellText(toDataExportCell(value))
  if (needsCsvQuotes(str)) {
    return `"${str.replace(/"/g, '""')}"`
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

/** Cell values a custom serializer receives. Text is already neutralized. */
export function sanitizeDataExportRows<T>(columns: TableColumn<T>[], data: T[]): T[] {
  return data.map((record) => {
    const next = { ...(record as Record<string, unknown>) }
    for (const column of columns) {
      const field = column.dataKey || column.key
      if (!field) continue
      const cell = toDataExportCell(next[field])
      next[field] = cell.value
    }
    return next as T
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
  const cleaned = (trimmed || 'export')
    .replace(FILENAME_LINES, '-')
    .replace(FILENAME_CONTROLS, '-')
    .replace(FILENAME_BIDI, '')
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
