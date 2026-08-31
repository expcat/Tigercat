import {
  defineComponent,
  h,
  ref,
  computed,
  getCurrentInstance,
  PropType,
  type VNodeChild
} from 'vue'
import {
  classNames,
  coerceClassValue,
  isActivationKey,
  mergeStyleValues,
  calculateVirtualColumnRange,
  EMPTY_VIRTUAL_TABLE_COLUMNS,
  EMPTY_VIRTUAL_TABLE_ROWS,
  getVirtualTableContainerClasses,
  getVirtualTableRowClasses,
  getVirtualTableRowWindow,
  getVirtualTableSpacerHeights,
  getVirtualTableColumnWidths,
  getNextVirtualTableSelection,
  getVirtualTableFixedInfo,
  getVirtualTableFixedCellStyle,
  getVirtualTableFixedCellClasses,
  getVirtualTableFixedHeaderCellClasses,
  getTableColgroup,
  isVirtualTableCellControlTarget,
  resolveVirtualTableColumnVirtualization,
  resolveVirtualTableRowIdentity,
  resolveVirtualTableSelectedKeys,
  resolveVirtualTableWidth,
  tableBaseClasses,
  tableVirtualSpacerCellClasses,
  virtualTableHeaderClasses,
  virtualTableHeaderCellClasses,
  virtualTableCellClasses,
  virtualTableEmptyClasses,
  virtualTableLoadingClasses,
  virtualTableRowFocusClasses,
  VIRTUAL_TABLE_HEADER_ROW_HEIGHT,
  resolveLocaleText,
  mergeTigerLocale,
  type TableColumn,
  type RowSelectionConfig,
  type TigerLocale,
  type VirtualTableHandle
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueVirtualTableProps {
  dataSource?: Record<string, unknown>[]
  columns?: TableColumn[]
  virtualItemHeight?: number
  virtualHeight?: number
  width?: number | 'auto'
  overscan?: number
  stickyHeader?: boolean
  virtualizeColumns?: boolean
  rowKey?: string | ((row: unknown, index: number) => string | number)
  rowClassName?: string | ((row: unknown, index: number) => string)
  loading?: boolean
  emptyText?: string
  rowSelection?: RowSelectionConfig
  striped?: boolean
  bordered?: boolean
  className?: string
  locale?: Partial<TigerLocale>
}

export type VirtualTableProps = VueVirtualTableProps
export type { VirtualTableHandle }

function alignClass(align?: TableColumn['align']): string | undefined {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-end'
  return 'text-start'
}

export const VirtualTable = defineComponent({
  name: 'TigerVirtualTable',
  inheritAttrs: false,
  props: {
    dataSource: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => EMPTY_VIRTUAL_TABLE_ROWS
    },
    columns: {
      type: Array as PropType<TableColumn[]>,
      default: () => EMPTY_VIRTUAL_TABLE_COLUMNS
    },
    virtualItemHeight: { type: Number, default: 48 },
    virtualHeight: { type: Number, default: 400 },
    width: { type: [Number, String] as PropType<number | 'auto'>, default: 'auto' },
    overscan: { type: Number, default: 5 },
    stickyHeader: { type: Boolean, default: true },
    virtualizeColumns: { type: Boolean, default: false },
    rowKey: {
      type: [String, Function] as PropType<
        string | ((row: unknown, index: number) => string | number)
      >,
      default: 'id'
    },
    rowClassName: {
      type: [String, Function] as PropType<string | ((row: unknown, index: number) => string)>,
      default: undefined
    },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: undefined },
    rowSelection: {
      type: Object as PropType<RowSelectionConfig>,
      default: undefined
    },
    striped: { type: Boolean, default: false },
    bordered: { type: Boolean, default: false },
    className: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    onRowClick: {
      type: Function as PropType<(row: Record<string, unknown>, index: number) => void>,
      default: undefined
    }
  },
  emits: ['row-click', 'selection-change', 'update:rowSelection'],
  setup(props, { emit, attrs, expose }) {
    const instance = getCurrentInstance()
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const containerRef = ref<HTMLElement | null>(null)
    const scrollTop = ref(0)
    const scrollLeft = ref(0)
    const activeIndex = ref(0)
    const resolvedWidth = computed(() => resolveVirtualTableWidth(props.width))
    const resolvedData = computed(() => props.dataSource ?? EMPTY_VIRTUAL_TABLE_ROWS)
    const resolvedColumns = computed(() => props.columns ?? EMPTY_VIRTUAL_TABLE_COLUMNS)
    const uncontrolledSelectedKeys = ref<(string | number)[]>(
      resolveVirtualTableSelectedKeys(props.rowSelection?.defaultSelectedRowKeys)
    )
    const isSelectionControlled = computed(() => props.rowSelection?.selectedRowKeys !== undefined)
    const selectedKeys = computed(() =>
      isSelectionControlled.value
        ? resolveVirtualTableSelectedKeys(props.rowSelection?.selectedRowKeys)
        : uncontrolledSelectedKeys.value
    )
    const hasSelection = computed(() => !!props.rowSelection)
    const hasRowClick = () =>
      typeof props.onRowClick === 'function' ||
      typeof (instance?.vnode.props as { onRowClick?: unknown } | undefined)?.onRowClick ===
        'function'

    function commitSelection(nextKeys: (string | number)[]) {
      if (!isSelectionControlled.value) {
        uncontrolledSelectedKeys.value = nextKeys
      }
      emit('selection-change', nextKeys)
      emit('update:rowSelection', { ...props.rowSelection, selectedRowKeys: nextKeys })
    }

    function toggleRowSelection(key: string | number, row: Record<string, unknown>) {
      if (!props.rowSelection || props.rowSelection.getCheckboxProps?.(row)?.disabled) return
      commitSelection(
        getNextVirtualTableSelection({
          type: props.rowSelection.type,
          selectedKeys: selectedKeys.value,
          key
        })
      )
    }

    const range = computed(() =>
      getVirtualTableRowWindow(
        scrollTop.value,
        props.virtualHeight,
        resolvedData.value.length,
        props.virtualItemHeight,
        props.overscan,
        props.stickyHeader ? VIRTUAL_TABLE_HEADER_ROW_HEIGHT : 0
      )
    )

    const visibleData = computed(() => resolvedData.value.slice(range.value.start, range.value.end))

    function scrollToIndex(index: number) {
      const next = Math.max(0, index) * props.virtualItemHeight
      const el = containerRef.value
      if (el) el.scrollTop = next
      scrollTop.value = next
    }

    expose({ scrollToIndex })

    function onScroll() {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop
        scrollLeft.value = containerRef.value.scrollLeft
      }
    }

    const columnWidths = computed(() => getVirtualTableColumnWidths(resolvedColumns.value))
    const resolveRowClassName = (row: unknown, index: number): string | undefined =>
      typeof props.rowClassName === 'function' ? props.rowClassName(row, index) : props.rowClassName

    const selectedSet = computed(() => new Set(selectedKeys.value))
    const fixedInfo = computed(() => getVirtualTableFixedInfo(resolvedColumns.value))

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const {
        class: attrsClass,
        style: attrsStyle,
        ...restAttrs
      } = attrsRecord as {
        class?: unknown
        style?: unknown
      } & Record<string, unknown>

      const containerClasses = classNames(
        getVirtualTableContainerClasses(props.bordered, props.className),
        coerceClassValue(attrsClass)
      )
      const fi = fixedInfo.value
      const colVirtual = resolveVirtualTableColumnVirtualization({
        virtualizeColumns: props.virtualizeColumns,
        hasFixedColumns: fi.hasFixedColumns,
        width: resolvedWidth.value
      })
      const colRange = colVirtual.active
        ? calculateVirtualColumnRange(
            scrollLeft.value,
            colVirtual.viewportWidth,
            columnWidths.value
          )
        : undefined
      const visibleColumns = colRange
        ? resolvedColumns.value.slice(colRange.start, colRange.end)
        : resolvedColumns.value
      const colIndexOffset = colRange ? colRange.start : 0
      const colgroupEntries = getTableColgroup({
        columns: visibleColumns,
        size: 'md',
        hasSelectionColumn: false,
        expand: false
      })
      const colSpan =
        visibleColumns.length +
        (colRange && colRange.leftPad > 0 ? 1 : 0) +
        (colRange && colRange.rightPad > 0 ? 1 : 0)
      const spacers = getVirtualTableSpacerHeights(range.value, props.virtualItemHeight)
      const interactive = hasSelection.value || hasRowClick()
      const focusIndex = visibleData.value.some(
        (_, localIdx) => range.value.start + localIdx === activeIndex.value
      )
        ? activeIndex.value
        : range.value.start

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
              alignClass(col.align),
              getVirtualTableFixedHeaderCellClasses(col, fi, props.stickyHeader)
            ),
            style: { ...widthStyle, ...stickyStyle }
          },
          [col.renderHeader ? (col.renderHeader() as VNodeChild) : (col.title ?? '')]
        )
      })

      const headerRow = h('tr', { 'aria-rowindex': 1 }, [
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
      ])
      const thead = h(
        'thead',
        { class: props.stickyHeader ? virtualTableHeaderClasses : undefined },
        [headerRow]
      )

      const rows = visibleData.value.map((row, localIdx) => {
        const globalIdx = range.value.start + localIdx
        const identity = props.rowSelection?.getRowKey
          ? {
              key: props.rowSelection.getRowKey(row),
              domKey: props.rowSelection.getRowKey(row)
            }
          : resolveVirtualTableRowIdentity(
              row,
              globalIdx,
              props.rowKey as keyof typeof row | ((r: typeof row, i: number) => string | number)
            )
        const isSelected = identity.key !== undefined && selectedSet.value.has(identity.key)
        const isDisabled = !!props.rowSelection?.getCheckboxProps?.(row)?.disabled
        const tabIndex =
          props.loading || !interactive || isDisabled
            ? undefined
            : globalIdx === focusIndex
              ? 0
              : -1
        const activate = (event?: Event) => {
          if (event && isVirtualTableCellControlTarget(event.target)) return
          emit('row-click', row, globalIdx)
          if (hasSelection.value && identity.key !== undefined && !isDisabled) {
            toggleRowSelection(identity.key, row)
          }
        }

        const cells = visibleColumns.map((col, colIdx) => {
          const dataKey = col.dataKey || col.key
          const value = row[dataKey]
          return h(
            'td',
            {
              key: col.key as string,
              'aria-colindex': colIndexOffset + colIdx + 1,
              class: classNames(
                virtualTableCellClasses,
                alignClass(col.align),
                getVirtualTableFixedCellClasses({
                  column: col,
                  record: row,
                  rowIndex: globalIdx,
                  striped: props.striped,
                  selected: isSelected,
                  hoverable: true,
                  fixedInfo: fi
                })
              ),
              style: {
                height: `${props.virtualItemHeight}px`,
                overflow: 'hidden',
                ...getVirtualTableFixedCellStyle(col.key, fi)
              }
            },
            [col.render ? (col.render(row, globalIdx) as VNodeChild) : (value as VNodeChild)]
          )
        })

        return h(
          'tr',
          {
            key: identity.domKey,
            class: classNames(
              getVirtualTableRowClasses(globalIdx, props.striped, isSelected),
              interactive && virtualTableRowFocusClasses,
              resolveRowClassName(row, globalIdx)
            ),
            style: { height: `${props.virtualItemHeight}px`, overflow: 'hidden' },
            'aria-rowindex': globalIdx + 2,
            'aria-selected': hasSelection.value ? isSelected : undefined,
            'aria-disabled': isDisabled || undefined,
            tabindex: tabIndex,
            onClick: interactive ? (event: MouseEvent) => activate(event) : undefined,
            onKeydown: interactive
              ? (e: KeyboardEvent) => {
                  if (isActivationKey(e)) {
                    e.preventDefault()
                    activate(e)
                    return
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    const next = Math.max(0, Math.min(resolvedData.value.length - 1, globalIdx + 1))
                    activeIndex.value = next
                    if (next < range.value.start || next >= range.value.end) scrollToIndex(next)
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    const next = Math.max(0, Math.min(resolvedData.value.length - 1, globalIdx - 1))
                    activeIndex.value = next
                    if (next < range.value.start || next >= range.value.end) scrollToIndex(next)
                  }
                }
              : undefined
          },
          [
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
        )
      })

      const topSpacer =
        spacers.top > 0
          ? h(
              'tr',
              {
                key: '__top-spacer',
                'aria-hidden': true,
                'data-tiger-table-virtual-spacer': ''
              },
              [
                h('td', {
                  colSpan: Math.max(1, colSpan),
                  class: tableVirtualSpacerCellClasses,
                  style: { height: `${spacers.top}px` }
                })
              ]
            )
          : null
      const bottomSpacer =
        spacers.bottom > 0
          ? h(
              'tr',
              {
                key: '__bottom-spacer',
                'aria-hidden': true,
                'data-tiger-table-virtual-spacer': ''
              },
              [
                h('td', {
                  colSpan: Math.max(1, colSpan),
                  class: tableVirtualSpacerCellClasses,
                  style: { height: `${spacers.bottom}px` }
                })
              ]
            )
          : null

      const tbody = h('tbody', {}, [topSpacer, ...rows, bottomSpacer])
      const colgroup =
        colgroupEntries.length > 0
          ? h('colgroup', {}, [
              colRange && colRange.leftPad > 0
                ? h('col', { key: '__left-pad', style: { width: `${colRange.leftPad}px` } })
                : null,
              ...colgroupEntries.map((entry) =>
                h('col', {
                  key: entry.key,
                  'data-tiger-table-col': entry.key,
                  style: entry.width ? { width: entry.width } : undefined
                })
              ),
              colRange && colRange.rightPad > 0
                ? h('col', { key: '__right-pad', style: { width: `${colRange.rightPad}px` } })
                : null
            ])
          : null

      const table = h(
        'table',
        {
          class: classNames(tableBaseClasses, 'table-fixed'),
          style: fi.minTableWidth > 0 ? { minWidth: `${fi.minTableWidth}px` } : undefined,
          'aria-rowcount': resolvedData.value.length + 1,
          'aria-colcount': resolvedColumns.value.length
        },
        [colgroup, thead, tbody]
      )

      const emptyEl =
        resolvedData.value.length === 0 && !props.loading
          ? h(
              'div',
              { class: virtualTableEmptyClasses },
              resolveLocaleText('No data', props.emptyText, mergedLocale.value?.common?.emptyText)
            )
          : null

      const loadingEl = props.loading
        ? h(
            'div',
            { class: virtualTableLoadingClasses, 'aria-live': 'polite' },
            resolveLocaleText('Loading...', mergedLocale.value?.common?.loadingText)
          )
        : null

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses,
          style: mergeStyleValues(attrsStyle, {
            height: `${props.virtualHeight}px`,
            ...(resolvedWidth.value !== 'auto' ? { width: `${resolvedWidth.value}px` } : {})
          }),
          onScroll,
          'aria-busy': props.loading || undefined
        },
        [table, emptyEl, loadingEl]
      )
    }
  }
})

export default VirtualTable
