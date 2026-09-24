import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  classNames,
  devWarn,
  getDataExportFormatLabel,
  getDataExportLabels,
  mergeTigerLocale,
  resolveButtonClasses,
  type DataExportFormat,
  type DataExportProps as CoreDataExportProps,
  type TigerLocale,
  type TigerLocaleDataExport
} from '@expcat/tigercat-core'
import {
  DEFAULT_DATA_EXPORT_FORMATS,
  isDataExportFormat,
  sanitizeDataExportRows,
  yieldDataExportFrame
} from '@expcat/tigercat-core/utils/data-export'
import { useTigerConfig } from './ConfigProvider'
import { Dropdown, DropdownMenu, DropdownItem } from './Dropdown'

type DataExportModule = typeof import('@expcat/tigercat-core/utils/data-export')

let dataExportModulePromise: Promise<DataExportModule> | null = null

function loadDataExportModule(): Promise<DataExportModule> {
  if (!dataExportModulePromise) {
    dataExportModulePromise = import('@expcat/tigercat-core/utils/data-export').catch((error) => {
      dataExportModulePromise = null
      throw error
    })
  }
  return dataExportModulePromise
}

export interface DataExportProps<T = Record<string, unknown>>
  extends
    CoreDataExportProps<T>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onError' | 'disabled' | 'type'> {
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** UI labels for custom text. Takes precedence over locale and ConfigProvider text. */
  labels?: Partial<TigerLocaleDataExport>
  /** Called after the download for the given format has been triggered */
  onExport?: (format: DataExportFormat) => void
  /** Called when serialization or download fails */
  onError?: (error: unknown) => void
}

export interface DataExportHandle {
  export: (format: DataExportFormat) => Promise<void>
}

function DataExportInner<T extends Record<string, unknown>>(
  {
    columns,
    dataSource,
    formats = DEFAULT_DATA_EXPORT_FORMATS as DataExportFormat[],
    fileName = 'export',
    sheetName,
    cellFormatter,
    hiddenColumnKeys,
    disabled = false,
    locale,
    labels,
    className,
    id,
    style,
    onExport,
    onError,
    customExport,
    onClick: callerClick,
    ...rest
  }: DataExportProps<T>,
  ref: React.ForwardedRef<DataExportHandle>
): React.ReactElement {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const resolvedLabels = useMemo(
    () => getDataExportLabels(mergedLocale, labels),
    [mergedLocale, labels]
  )
  const exportingLockRef = useRef(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const formatsEmpty = formats.length === 0
  const offeredFormats = formatsEmpty
    ? (DEFAULT_DATA_EXPORT_FORMATS as DataExportFormat[])
    : formats
  const triggerDisabled = disabled || exporting || formatsEmpty

  const handleExport = useCallback(
    async (format: DataExportFormat) => {
      if (triggerDisabled || exportingLockRef.current) return
      if (!isDataExportFormat(format)) {
        devWarn('DataExport.format', `Unknown export format "${String(format)}"`)
        return
      }

      exportingLockRef.current = true
      setExporting(true)
      setExportError(null)
      try {
        await yieldDataExportFrame()
        if (customExport) {
          await customExport({
            format,
            columns,
            dataSource: sanitizeDataExportRows(columns, dataSource),
            fileName
          })
        } else {
          const mod = await loadDataExportModule()
          await mod.runDataExport({
            columns,
            dataSource,
            format,
            fileName,
            sheetName,
            cellFormatter,
            hiddenColumnKeys
          })
        }
        onExport?.(format)
      } catch (error) {
        setExportError(resolvedLabels.errorText)
        onError?.(error)
      } finally {
        exportingLockRef.current = false
        setExporting(false)
      }
    },
    [
      triggerDisabled,
      columns,
      dataSource,
      fileName,
      sheetName,
      cellFormatter,
      hiddenColumnKeys,
      onExport,
      onError,
      customExport,
      resolvedLabels.errorText
    ]
  )

  useImperativeHandle(ref, () => ({ export: handleExport }), [handleExport])

  if (formatsEmpty) {
    devWarn('DataExport.formats', 'formats is empty; the export trigger stays disabled')
  }

  const triggerText = exporting
    ? resolvedLabels.exportingText
    : offeredFormats.length === 1
      ? getDataExportFormatLabel(offeredFormats[0], resolvedLabels)
      : resolvedLabels.triggerText

  const triggerButton = (
    <button
      type="button"
      id={id}
      style={style}
      className={classNames(
        resolveButtonClasses({
          variant: 'outline',
          size: 'sm',
          disabled: triggerDisabled
        }),
        className
      )}
      {...rest}
      disabled={triggerDisabled}
      aria-label={
        offeredFormats.length > 1 || formatsEmpty ? resolvedLabels.triggerAriaLabel : undefined
      }
      aria-busy={exporting || undefined}
      onClick={
        offeredFormats.length === 1 && !formatsEmpty
          ? (event) => {
              void handleExport(offeredFormats[0]).finally(() => callerClick?.(event))
            }
          : (event) => {
              queueMicrotask(() => callerClick?.(event))
            }
      }>
      {triggerText}
    </button>
  )

  const errorStatus = exportError ? (
    <span role="status" aria-live="polite">
      {exportError}
    </span>
  ) : null

  if (offeredFormats.length === 1 || formatsEmpty) {
    return (
      <>
        {triggerButton}
        {errorStatus}
      </>
    )
  }

  return (
    <>
      <Dropdown trigger="click" disabled={triggerDisabled} asChild showArrow={false}>
        {triggerButton}
        <DropdownMenu>
          {offeredFormats.map((format) => (
            <DropdownItem key={format} onClick={() => void handleExport(format)}>
              {getDataExportFormatLabel(format, resolvedLabels)}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      {errorStatus}
    </>
  )
}

export const DataExport = forwardRef(DataExportInner) as <
  T extends Record<string, unknown> = Record<string, unknown>
>(
  props: DataExportProps<T> & { ref?: React.Ref<DataExportHandle> }
) => React.ReactElement
