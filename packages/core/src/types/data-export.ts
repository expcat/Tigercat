/**
 * DataExport component types and interfaces
 */

import type { TableColumn } from './table'

/**
 * Supported DataExport output formats.
 * Aligns with Table's CSV path; xlsx is a real OOXML workbook.
 */
export type DataExportFormat = 'xlsx' | 'markdown' | 'csv'

/**
 * Options shared by the DataExport serializers and component
 */
export interface DataExportOptions<T = Record<string, unknown>> {
  /**
   * Worksheet name used for xlsx output
   * @default 'Sheet1'
   */
  sheetName?: string

  /**
   * Transform a cell value before serialization.
   * Receives the raw `record[column.dataKey || column.key]` value.
   * Dates become ISO; objects are JSON. `column.render` is never run.
   */
  cellFormatter?: (value: unknown, column: TableColumn<T>, record: T) => unknown

  /**
   * Column keys to omit. Hidden Table columns should be passed through here
   * (or filtered by the caller) so they are not written.
   */
  hiddenColumnKeys?: string[]
}

/**
 * Base DataExport props interface.
 *
 * `locale`, `labels`, `onExport`, and `onError` are framework-layer only.
 */
export interface DataExportProps<T = Record<string, unknown>> extends DataExportOptions<T> {
  /**
   * Columns describing header titles and record keys.
   * Reuses TableColumn so Table/DataTableWithToolbar columns can be passed through.
   * Columns with only `render` and no `dataKey`/`key` field on the records are skipped.
   */
  columns: TableColumn<T>[]

  /**
   * Records to export
   */
  dataSource: T[]

  /**
   * Formats offered to the user. A single format renders a plain button,
   * multiple formats render a dropdown menu.
   * @default ['xlsx', 'markdown']
   */
  formats?: DataExportFormat[]

  /**
   * Download file name. An existing matching suffix is kept; path characters
   * are stripped. Empty names fall back to `export`.
   * @default 'export'
   */
  fileName?: string

  /**
   * Whether the export trigger is disabled
   * @default false
   */
  disabled?: boolean
}
