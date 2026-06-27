import { defineComponent, h, ref, computed, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  isActivationKey,
  calculateVirtualRange,
  calculateVirtualColumnRange,
  getVirtualTableContainerClasses,
  getVirtualTableRowClasses,
  getVirtualRowKey,
  getVirtualTableFixedInfo,
  getVirtualTableFixedCellStyle,
  getTableFixedCellClasses,
  getTableFixedHeaderCellClasses,
  getTableColgroup,
  tableBaseClasses,
  virtualTableHeaderClasses,
  virtualTableHeaderCellClasses,
  virtualTableCellClasses,
  virtualTableEmptyClasses,
  virtualTableLoadingClasses,
  virtualTableFixedCellSelectedClasses,
  resolveLocaleText,
  mergeTigerLocale,
  type TableColumn,
  type VirtualTableRange,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueVirtualTableProps {
  data?: unknown[]
  columns?: TableColumn[]
  rowHeight?: number
  height?: number
  width?: number | 'auto'
  overscan?: number
  stickyHeader?: boolean
  virtualizeColumns?: boolean
  rowKey?: string | ((row: unknown, index: number) => string | number)
  rowClassName?: string | ((row: unknown, index: number) => string)
  loading?: boolean
  emptyText?: string
  selectable?: boolean
  selectedKeys?: (string | number)[]
  striped?: boolean
  bordered?: boolean
  className?: string
}

/** Fallback column width (px) when a column has no numeric `width`. */
const DEFAULT_VIRTUAL_COLUMN_WIDTH = 150

export const VirtualTable = defineComponent({
  name: 'TigerVirtualTable',
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => []
    },
    columns: {
      type: Array as PropType<TableColumn[]>,
      default: () => []
    },
    rowHeight: { type: Number, default: 48 },
    height: { type: Number, default: 400 },
    width: { type: [Number, String] as PropType<number | 'auto'>, default: 'auto' },
    overscan: { type: Number, default: 5 },
    stickyHeader: { type: Boolean, default: true },
    virtualizeColumns: { type: Boolean, default: false },
    rowKey: {
      type: [String, Function] as PropType<
        string | ((row: unknown, index: number) => string | number)
      >,
      default: undefined
    },
    rowClassName: {
      type: [String, Function] as PropType<string | ((row: unknown, index: number) => string)>,
      default: undefined
    },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: undefined },
    selectable: { type: Boolean, default: false },
    selectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    striped: { type: Boolean, default: false },
    bordered: { type: Boolean, default: false },
    className: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
  },
  emits: ['row-click', 'select'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const containerRef = ref<HTMLElement | null>(null)
    const scrollTop = ref(0)
    const scrollLeft = ref(0)

    const range = computed<VirtualTableRange>(() =>
      calculateVirtualRange(
        scrollTop.value,
        props.height,
        props.data.length,
        props.rowHeight,
        props.overscan
      )
    )

    const visibleData = computed(() => props.data.slice(range.value.start, range.value.end))

    function onScroll() {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop
        scrollLeft.value = containerRef.value.scrollLeft
      }
    }

    const columnWidths = computed(() =>
      props.columns.map((c) =>
        typeof c.width === 'number' ? c.width : DEFAULT_VIRTUAL_COLUMN_WIDTH
      )
    )
    const resolveRowClassName = (row: unknown, index: number): string | undefined =>
      typeof props.rowClassName === 'function' ? props.rowClassName(row, index) : props.rowClassName

    const containerClasses = computed(() =>
      classNames(
        getVirtualTableContainerClasses(props.bordered, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const selectedSet = computed(() => new Set(props.selectedKeys))

    const fixedInfo = computed(() => getVirtualTableFixedInfo(props.columns))

    return () => {
      const fi = fixedInfo.value
      // Column virtualization only when enabled, no fixed columns, fixed width.
      const colVirtualActive =
        props.virtualizeColumns && !fi.hasFixedColumns && props.width !== 'auto'
      const colRange = colVirtualActive
        ? calculateVirtualColumnRange(scrollLeft.value, props.width as number, columnWidths.value)
        : undefined
      const visibleColumns = colRange
        ? props.columns.slice(colRange.start, colRange.end)
        : props.columns
      const colIndexOffset = colRange ? colRange.start : 0
      const colgroupEntries = fi.hasFixedColumns
        ? getTableColgroup({
            columns: visibleColumns,
            size: 'md',
            hasSelectionColumn: false,
            expand: false
          })
        : []

      const headerCells = visibleColumns.map((col) => {
        const widthStyle = col.width
          ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
          : {}
        const stickyStyle = getVirtualTableFixedCellStyle(col.key, fi)
        return h(
          'th',
          {
            key: col.key as string,
            class: classNames(
              virtualTableHeaderCellClasses,
              getTableFixedHeaderCellClasses({
                view: 'virtual-table',
                column: col,
                stickyHeader: props.stickyHeader,
                fixedInfo: fi
              })
            ),
            style: { ...widthStyle, ...stickyStyle }
          },
          col.title ?? ''
        )
      })

      const headerRowChildren = [
        colRange && colRange.leftPad > 0
          ? h('th', {
              key: '__left-pad',
              'aria-hidden': true,
              style: { width: `${colRange.leftPad}px`, padding: 0 }
            })
          : null,
        ...headerCells,
        colRange && colRange.rightPad > 0
          ? h('th', {
              key: '__right-pad',
              'aria-hidden': true,
              style: { width: `${colRange.rightPad}px`, padding: 0 }
            })
          : null
      ]
      const headerRow = h('tr', {}, headerRowChildren)
      const thead = h(
        'thead',
        { class: props.stickyHeader ? virtualTableHeaderClasses : undefined },
        [headerRow]
      )

      // Visible rows
      const rows = visibleData.value.map((row, localIdx) => {
        const globalIdx = range.value.start + localIdx
        const key = getVirtualRowKey(
          row,
          globalIdx,
          props.rowKey as keyof typeof row | ((r: typeof row, i: number) => string | number)
        )
        const isSelected = selectedSet.value.has(key)
        const isInteractive = props.selectable || typeof attrs.onRowClick === 'function'
        const activate = () => {
          emit('row-click', row, globalIdx)
          if (props.selectable) emit('select', key, row, globalIdx)
        }

        const cells = visibleColumns.map((col, colIdx) =>
          h(
            'td',
            {
              key: col.key as string,
              'aria-colindex': colIndexOffset + colIdx + 1,
              class: classNames(
                virtualTableCellClasses,
                getTableFixedCellClasses({
                  view: 'virtual-table',
                  column: col,
                  record: row,
                  rowIndex: globalIdx,
                  striped: props.striped,
                  stripedActive: props.striped && globalIdx % 2 === 1,
                  selected: isSelected,
                  hoverable: true,
                  fixedInfo: fi,
                  selectedClassName: virtualTableFixedCellSelectedClasses
                })
              ),
              style: getVirtualTableFixedCellStyle(col.key, fi)
            },
            String((row as Record<string, unknown>)[col.key as string] ?? '')
          )
        )

        const rowChildren = [
          colRange && colRange.leftPad > 0
            ? h('td', {
                key: '__left-pad',
                'aria-hidden': true,
                style: { width: `${colRange.leftPad}px`, padding: 0 }
              })
            : null,
          ...cells,
          colRange && colRange.rightPad > 0
            ? h('td', {
                key: '__right-pad',
                'aria-hidden': true,
                style: { width: `${colRange.rightPad}px`, padding: 0 }
              })
            : null
        ]

        return h(
          'tr',
          {
            key,
            class: classNames(
              getVirtualTableRowClasses(globalIdx, props.striped, isSelected),
              resolveRowClassName(row, globalIdx)
            ),
            // header occupies aria-rowindex 1
            'aria-rowindex': globalIdx + 2,
            'aria-selected': props.selectable ? isSelected : undefined,
            tabindex: isInteractive ? 0 : undefined,
            // onClick stays attached so `row-click` always fires for consumers
            // that listen for it; keyboard activation is added when interactive.
            onClick: activate,
            onKeydown: isInteractive
              ? (e: KeyboardEvent) => {
                  if (isActivationKey(e)) {
                    e.preventDefault()
                    activate()
                  }
                }
              : undefined
          },
          rowChildren
        )
      })

      // Spacer for virtual scroll
      const topSpacer = h('tr', {
        key: '__top-spacer',
        style: { height: `${range.value.offsetTop}px` },
        'aria-hidden': true
      })

      const bottomHeight = range.value.totalHeight - range.value.end * props.rowHeight
      const bottomSpacer =
        bottomHeight > 0
          ? h('tr', {
              key: '__bottom-spacer',
              style: { height: `${bottomHeight}px` },
              'aria-hidden': true
            })
          : null

      const tbody = h('tbody', {}, [topSpacer, ...rows, bottomSpacer])

      const colgroup =
        colgroupEntries.length > 0
          ? h(
              'colgroup',
              {},
              colgroupEntries.map((entry) =>
                h('col', {
                  key: entry.key,
                  'data-tiger-table-col': entry.key,
                  style: entry.width ? { width: entry.width } : undefined
                })
              )
            )
          : null

      const table = h('table', { class: classNames(tableBaseClasses, 'table-fixed') }, [
        colgroup,
        thead,
        tbody
      ])

      // Empty state
      const emptyEl =
        props.data.length === 0 && !props.loading
          ? h(
              'div',
              { class: virtualTableEmptyClasses },
              resolveLocaleText('No data', props.emptyText, mergedLocale.value?.common?.emptyText)
            )
          : null

      // Loading overlay
      const loadingEl = props.loading
        ? h(
            'div',
            { class: virtualTableLoadingClasses },
            resolveLocaleText('Loading...', mergedLocale.value?.common?.loadingText)
          )
        : null

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClasses.value,
          style: {
            height: `${props.height}px`,
            ...(props.width !== 'auto' ? { width: `${props.width}px` } : {})
          },
          onScroll,
          role: 'grid',
          'aria-rowcount': props.data.length
        },
        [table, emptyEl, loadingEl]
      )
    }
  }
})

export default VirtualTable
