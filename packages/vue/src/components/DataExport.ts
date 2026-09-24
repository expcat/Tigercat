import { computed, defineComponent, h, ref, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  devWarn,
  getDataExportFormatLabel,
  getDataExportLabels,
  mergeStyleValues,
  mergeTigerLocale,
  resolveButtonClasses,
  type DataExportFormat,
  type DataExportOptions,
  type TableColumn,
  type TigerLocale,
  type TigerLocaleDataExport
} from '@expcat/tigercat-core'
import {
  DEFAULT_DATA_EXPORT_FORMATS,
  isDataExportFormat,
  sanitizeDataExportRows,
  yieldDataExportFrame
} from '@expcat/tigercat-core/utils/data-export'
import { useTigerConfig } from './tiger-config'
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

export interface VueDataExportProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[]
  dataSource: T[]
  formats?: DataExportFormat[]
  fileName?: string
  sheetName?: string
  cellFormatter?: DataExportOptions<T>['cellFormatter']
  hiddenColumnKeys?: string[]
  disabled?: boolean
  className?: string
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleDataExport>
}

export type DataExportProps = VueDataExportProps

export const DataExport = defineComponent({
  name: 'TigerDataExport',
  inheritAttrs: false,
  props: {
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true
    },
    dataSource: {
      type: Array as PropType<Record<string, unknown>[]>,
      required: true
    },
    /**
     * Formats offered to the user. A single format renders a plain button,
     * multiple formats render a dropdown menu.
     */
    formats: {
      type: Array as PropType<DataExportFormat[]>,
      default: () => [...DEFAULT_DATA_EXPORT_FORMATS]
    },
    /** Download file name. Matching suffixes are not duplicated. */
    fileName: {
      type: String,
      default: 'export'
    },
    /** Worksheet name used for xlsx output */
    sheetName: {
      type: String,
      default: undefined
    },
    /** Transform a cell value before serialization */
    cellFormatter: {
      type: Function as PropType<
        (value: unknown, column: TableColumn, record: Record<string, unknown>) => unknown
      >,
      default: undefined
    },
    hiddenColumnKeys: {
      type: Array as PropType<string[]>,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    customExport: {
      type: Function as PropType<
        (info: {
          format: DataExportFormat
          columns: TableColumn[]
          dataSource: Record<string, unknown>[]
          fileName: string
        }) => void | Promise<void>
      >,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    /** Locale overrides merged on top of ConfigProvider locale */
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    /** UI labels for custom text. Takes precedence over locale and ConfigProvider text. */
    labels: {
      type: Object as PropType<Partial<TigerLocaleDataExport>>,
      default: undefined
    }
  },
  emits: {
    export: (_format: DataExportFormat) => true,
    error: (_error: unknown) => true
  },
  setup(props, { emit, expose, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const resolvedLabels = computed(() => getDataExportLabels(mergedLocale.value, props.labels))
    const exporting = ref(false)
    const exportError = ref<string | null>(null)

    const formatsEmpty = computed(() => props.formats.length === 0)
    const offeredFormats = computed(() =>
      formatsEmpty.value ? [...DEFAULT_DATA_EXPORT_FORMATS] : props.formats
    )
    const triggerDisabled = computed(() => props.disabled || exporting.value || formatsEmpty.value)

    const handleExport = async (format: DataExportFormat) => {
      if (triggerDisabled.value || exporting.value) return
      if (!isDataExportFormat(format)) {
        devWarn('DataExport.format', `Unknown export format "${String(format)}"`)
        return
      }

      exporting.value = true
      exportError.value = null
      try {
        await yieldDataExportFrame()
        if (props.customExport) {
          await props.customExport({
            format,
            columns: props.columns,
            dataSource: sanitizeDataExportRows(props.columns, props.dataSource),
            fileName: props.fileName
          })
        } else {
          const mod = await loadDataExportModule()
          await mod.runDataExport({
            columns: props.columns,
            dataSource: props.dataSource,
            format,
            fileName: props.fileName,
            sheetName: props.sheetName,
            cellFormatter: props.cellFormatter,
            hiddenColumnKeys: props.hiddenColumnKeys
          })
        }
        emit('export', format)
      } catch (error) {
        exportError.value = resolvedLabels.value.errorText
        emit('error', error)
      } finally {
        exporting.value = false
      }
    }

    expose({ export: handleExport })

    return () => {
      if (formatsEmpty.value) {
        devWarn('DataExport.formats', 'formats is empty; the export trigger stays disabled')
      }

      const attrsRecord = attrs as Record<string, unknown>
      const {
        class: attrsClass,
        style: attrsStyle,
        onClick: callerClick,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
        onClick?: (event: MouseEvent) => void
      } & Record<string, unknown>

      const triggerText = exporting.value
        ? resolvedLabels.value.exportingText
        : offeredFormats.value.length === 1
          ? getDataExportFormatLabel(offeredFormats.value[0], resolvedLabels.value)
          : resolvedLabels.value.triggerText

      const triggerButton = h(
        'button',
        {
          ...restAttrs,
          type: 'button',
          class: classNames(
            resolveButtonClasses({
              variant: 'outline',
              size: 'sm',
              disabled: triggerDisabled.value
            }),
            props.className,
            coerceClassValue(attrsClass)
          ),
          style: mergeStyleValues(attrsStyle),
          disabled: triggerDisabled.value,
          'aria-busy': exporting.value || undefined,
          'aria-label':
            offeredFormats.value.length > 1 || formatsEmpty.value
              ? resolvedLabels.value.triggerAriaLabel
              : undefined,
          onClick:
            offeredFormats.value.length === 1 && !formatsEmpty.value
              ? (event: MouseEvent) => {
                  void handleExport(offeredFormats.value[0]).finally(() => callerClick?.(event))
                }
              : undefined
        },
        triggerText
      )

      const errorStatus = exportError.value
        ? h('span', { role: 'status', 'aria-live': 'polite' }, exportError.value)
        : null

      if (offeredFormats.value.length === 1 || formatsEmpty.value) {
        return [triggerButton, errorStatus]
      }

      return [
        h(
          Dropdown,
          {
            trigger: 'click' as const,
            disabled: triggerDisabled.value,
            asChild: true,
            showArrow: false,
            onOpenChange: (open: boolean) => {
              if (open) callerClick?.(new MouseEvent('click'))
            }
          },
          {
            default: () => [
              triggerButton,
              h(DropdownMenu, null, {
                default: () =>
                  offeredFormats.value.map((format) =>
                    h(
                      DropdownItem,
                      {
                        key: format,
                        onClick: () => void handleExport(format)
                      },
                      { default: () => getDataExportFormatLabel(format, resolvedLabels.value) }
                    )
                  )
              })
            ]
          }
        ),
        errorStatus
      ]
    }
  }
})
