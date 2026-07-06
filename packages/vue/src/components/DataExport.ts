import { computed, defineComponent, h, ref, PropType } from 'vue'
import {
  classNames,
  getDataExportLabels,
  mergeTigerLocale,
  tableExportButtonClasses,
  type DataExportFormat,
  type DataExportOptions,
  type TableColumn,
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

export interface VueDataExportProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[]
  dataSource: T[]
  formats?: DataExportFormat[]
  fileName?: string
  sheetName?: string
  cellFormatter?: DataExportOptions<T>['cellFormatter']
  disabled?: boolean
  className?: string
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleDataExport>
}

export const DataExport = defineComponent({
  name: 'TigerDataExport',
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
      default: () => ['xlsx', 'markdown'] as DataExportFormat[]
    },
    /** Download file name without extension */
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
    disabled: {
      type: Boolean,
      default: false
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
  setup(props, { emit }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const resolvedLabels = computed(() => getDataExportLabels(mergedLocale.value, props.labels))
    const exporting = ref(false)

    const handleExport = async (format: DataExportFormat) => {
      if (props.disabled || exporting.value) return

      exporting.value = true
      try {
        const mod = await loadDataExportModule()
        const content = mod.exportData(props.columns, props.dataSource, format, {
          sheetName: props.sheetName,
          cellFormatter: props.cellFormatter
        })
        mod.downloadDataExport(content, props.fileName, format)
        emit('export', format)
      } catch (error) {
        emit('error', error)
      } finally {
        exporting.value = false
      }
    }

    const formatLabel = (format: DataExportFormat) =>
      format === 'xlsx' ? resolvedLabels.value.xlsxText : resolvedLabels.value.markdownText

    const renderTrigger = (text: string, onClick?: (event: MouseEvent) => void) =>
      h(
        'button',
        {
          type: 'button',
          class: classNames(tableExportButtonClasses, onClick ? props.className : undefined),
          'aria-label': resolvedLabels.value.triggerAriaLabel,
          disabled: props.disabled || exporting.value,
          onClick
        },
        text
      )

    return () => {
      if (props.formats.length === 0) return null

      if (props.formats.length === 1) {
        const format = props.formats[0]
        return renderTrigger(
          exporting.value ? resolvedLabels.value.exportingText : formatLabel(format),
          () => void handleExport(format)
        )
      }

      return h(
        Dropdown,
        {
          trigger: 'click' as const,
          disabled: props.disabled || exporting.value,
          className: props.className
        },
        {
          default: () => [
            renderTrigger(
              exporting.value
                ? resolvedLabels.value.exportingText
                : resolvedLabels.value.triggerText
            ),
            h(DropdownMenu, null, {
              default: () =>
                props.formats.map((format) =>
                  h(
                    DropdownItem,
                    {
                      key: format,
                      onClick: () => void handleExport(format)
                    },
                    { default: () => formatLabel(format) }
                  )
                )
            })
          ]
        }
      )
    }
  }
})
