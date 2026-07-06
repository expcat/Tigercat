import React, { useCallback, useMemo, useState } from 'react'
import {
  classNames,
  getDataExportLabels,
  mergeTigerLocale,
  tableExportButtonClasses,
  type DataExportFormat,
  type DataExportProps as CoreDataExportProps,
  type TigerLocale,
  type TigerLocaleDataExport
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { Dropdown, DropdownMenu, DropdownItem } from './Dropdown'

type DataExportModule = typeof import('@expcat/tigercat-core/utils/data-export')

// The serializers (zip/xlsx/markdown writers) are only fetched when an export is
// actually triggered, mirroring the MessageRoot on-demand loading pattern.
let dataExportModulePromise: Promise<DataExportModule> | null = null

function loadDataExportModule(): Promise<DataExportModule> {
  dataExportModulePromise ??= import('@expcat/tigercat-core/utils/data-export')
  return dataExportModulePromise
}

const DEFAULT_FORMATS: DataExportFormat[] = ['xlsx', 'markdown']

export interface DataExportProps<T = Record<string, unknown>> extends CoreDataExportProps<T> {
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** UI labels for custom text. Takes precedence over locale and ConfigProvider text. */
  labels?: Partial<TigerLocaleDataExport>
  className?: string
  /** Called after the download for the given format has been triggered */
  onExport?: (format: DataExportFormat) => void
  /** Called when serialization or download fails */
  onError?: (error: unknown) => void
}

export const DataExport = <T extends Record<string, unknown>>({
  columns,
  dataSource,
  formats = DEFAULT_FORMATS,
  fileName = 'export',
  sheetName,
  cellFormatter,
  disabled = false,
  locale,
  labels,
  className,
  onExport,
  onError
}: DataExportProps<T>): React.ReactElement | null => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const resolvedLabels = useMemo(
    () => getDataExportLabels(mergedLocale, labels),
    [mergedLocale, labels]
  )
  const [exporting, setExporting] = useState(false)

  const handleExport = useCallback(
    async (format: DataExportFormat) => {
      if (disabled || exporting) return

      setExporting(true)
      try {
        const mod = await loadDataExportModule()
        const content = mod.exportData(columns, dataSource, format, { sheetName, cellFormatter })
        mod.downloadDataExport(content, fileName, format)
        onExport?.(format)
      } catch (error) {
        onError?.(error)
      } finally {
        setExporting(false)
      }
    },
    [columns, dataSource, sheetName, cellFormatter, fileName, disabled, exporting, onExport, onError]
  )

  const formatLabel = (format: DataExportFormat) =>
    format === 'xlsx' ? resolvedLabels.xlsxText : resolvedLabels.markdownText

  if (formats.length === 0) return null

  if (formats.length === 1) {
    return (
      <button
        type="button"
        className={classNames(tableExportButtonClasses, className)}
        aria-label={resolvedLabels.triggerAriaLabel}
        disabled={disabled || exporting}
        onClick={() => void handleExport(formats[0])}>
        {exporting ? resolvedLabels.exportingText : formatLabel(formats[0])}
      </button>
    )
  }

  return (
    <Dropdown trigger="click" disabled={disabled || exporting} className={className}>
      <button
        type="button"
        className={tableExportButtonClasses}
        aria-label={resolvedLabels.triggerAriaLabel}
        disabled={disabled || exporting}>
        {exporting ? resolvedLabels.exportingText : resolvedLabels.triggerText}
      </button>
      <DropdownMenu>
        {formats.map((format) => (
          <DropdownItem key={format} onClick={() => void handleExport(format)}>
            {formatLabel(format)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
