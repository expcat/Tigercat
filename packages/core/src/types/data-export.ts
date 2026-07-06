/**
 * DataExport component types and interfaces
 */

import type { TableColumn } from './table'

/**
 * Supported DataExport output formats
 */
export type DataExportFormat = 'xlsx' | 'markdown'

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
   */
  cellFormatter?: (value: unknown, column: TableColumn<T>, record: T) => unknown
}

/**
 * Base DataExport props interface
 */
export interface DataExportProps<T = Record<string, unknown>> extends DataExportOptions<T> {
  /**
   * Columns describing header titles and record keys.
   * Reuses TableColumn so Table/DataTableWithToolbar columns can be passed through directly.
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
   * Download file name without extension
   * @default 'export'
   */
  fileName?: string

  /**
   * Whether the export trigger is disabled
   * @default false
   */
  disabled?: boolean
}
