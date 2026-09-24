import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
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
  getTableCellClasses,
  getTableColgroup,
  getTableHeaderCellClasses,
  getTableLabels,
  isVirtualTableCellControlTarget,
  nextEnabledRowIndex,
  resolveVirtualTableColumnVirtualization,
  resolveVirtualTableRowIdentities,
  resolveVirtualTableSelectedKeys,
  tableRowKeyId,
  resolveScrollportViewport,
  resolveVirtualTableWidth,
  scrollTopToRevealVirtualTableRow,
  tableBaseClasses,
  tableVirtualSpacerCellClasses,
  virtualTableHeaderClasses,
  virtualTableHeaderCellClasses,
  virtualTableCellClasses,
  virtualTableEmptyClasses,
  virtualTableLoadingClasses,
  virtualTableRowFocusClasses,
  observeSize,
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
  emits: ['row-click', 'selection-change'],
  setup(props, { emit, attrs, expose }) {
    const instance = getCurrentInstance()
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const containerRef = ref<HTMLElement | null>(null)
    const headerRef = ref<HTMLElement | null>(null)
    const measuredHeaderHeight = ref(0)
    const scrollport = ref({ height: 0, width: 0 })
    const measuredColumnWidths = ref<Record<string, number>>({})
    const rowEls = new Map<number, HTMLElement>()
    let pendingRowFocus = false
    let stopHeaderSize: (() => void) | undefined
    let stopScrollport: (() => void) | undefined

    function measureScrollport() {
      stopScrollport?.()
      stopScrollport = undefined
      const scroller = containerRef.value
      if (!scroller) return
      const read = () => {
        const height = scroller.clientHeight
        const width = scroller.clientWidth
        if (scrollport.value.height === height && scrollport.value.width === width) return
        scrollport.value = { height, width }
      }
      read()
      stopScrollport = observeSize(scroller, read)
    }

    function measureHeader() {
      stopHeaderSize?.()
      stopHeaderSize = undefined
      const header = headerRef.value
      if (!props.stickyHeader || !header) {
        measuredHeaderHeight.value = 0
        return
      }
      const read = () => {
        const next = header.getBoundingClientRect().height
        measuredHeaderHeight.value = Number.isFinite(next) && next > 0 ? next : 0
        const widths: Record<string, number> = {}
        header.querySelectorAll<HTMLElement>('th[data-tiger-table-column-key]').forEach((cell) => {
          const key = cell.dataset.tigerTableColumnKey
          const cellWidth = cell.getBoundingClientRect().width
          if (key && cellWidth > 0) widths[key] = cellWidth
        })
        measuredColumnWidths.value = widths
      }
      read()
      stopHeaderSize = observeSize(header, read)
    }

    onMounted(() => {
      measureHeader()
      measureScrollport()
    })
    onBeforeUnmount(() => {
      stopHeaderSize?.()
      stopScrollport?.()
    })
    const scrollTop = ref(0)
    const scrollLeft = ref(0)
    const activeIndex = ref(0)
    const resolvedWidth = computed(() => resolveVirtualTableWidth(props.width))
    const resolvedData = computed(() => props.dataSource ?? EMPTY_VIRTUAL_TABLE_ROWS)
    watch(
      [activeIndex, resolvedData, () => props.rowSelection],
      () => {
        const rows = resolvedData.value
        const selection = props.rowSelection
        if (!selection?.getCheckboxProps || rows.length === 0) return
        const next = nextEnabledRowIndex(rows.length, activeIndex.value, (index) =>
          Boolean(selection.getCheckboxProps?.(rows[index]!)?.disabled)
        )
        if (next !== activeIndex.value) activeIndex.value = next
      },
      { immediate: true }
    )
    const identities = computed(() =>
      resolveVirtualTableRowIdentities(
        resolvedData.value,
        props.rowKey as never,
        props.rowSelection?.getRowKey
      )
    )
    const resolvedColumns = computed(() => props.columns ?? EMPTY_VIRTUAL_TABLE_COLUMNS)
    watch(
      () => [props.stickyHeader, resolvedColumns.value.length, resolvedData.value.length],
      measureHeader
    )
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
        resolveScrollportViewport(scrollport.value.height, props.virtualHeight),
        resolvedData.value.length,
        props.virtualItemHeight,
        props.overscan,
        props.stickyHeader ? measuredHeaderHeight.value : 0
      )
    )

    const visibleData = computed(() => resolvedData.value.slice(range.value.start, range.value.end))

    function scrollToIndex(index: number) {
      const el = containerRef.value
      const next = scrollTopToRevealVirtualTableRow({
        scrollTop: el?.scrollTop ?? scrollTop.value,
        viewportHeight: resolveScrollportViewport(el?.clientHeight ?? scrollport.value.height, props.virtualHeight),
        headerHeight: props.stickyHeader ? measuredHeaderHeight.value : 0,
        index,
        itemHeight: props.virtualItemHeight
      })
      if (el && el.scrollTop !== next) el.scrollTop = next
      scrollTop.value = next
    }

    function focusActiveRow(index: number) {
      pendingRowFocus = true
      void nextTick(() => {
        if (!pendingRowFocus) return
        const row = rowEls.get(index)
        if (!row || row.tabIndex !== 0) return
        pendingRowFocus = false
        if (document.activeElement !== row) row.focus()
      })
    }

    expose({ scrollToIndex })

    function onScroll() {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop
        scrollLeft.value = containerRef.value.scrollLeft
      }
    }

    const columnWidths = computed(() =>
      getVirtualTableColumnWidths(resolvedColumns.value, measuredColumnWidths.value)
    )
    const resolveRowClassName = (row: unknown, index: number): string | undefined =>
      typeof props.rowClassName === 'function' ? props.rowClassName(row, index) : props.rowClassName

    const selectedSet = computed(
      () => new Set(selectedKeys.value.map((key) => tableRowKeyId(key)))
    )
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
        widths: columnWidths.value,
        viewportWidth: resolveScrollportViewport(
          scrollport.value.width,
          typeof resolvedWidth.value === 'number' ? resolvedWidth.value : 0
        )
      })
      const colRange = colVirtual.active
        ? calculateVirtualColumnRange(
            scrollLeft.value,
            colVirtual.viewportWidth,
            columnWidths.value,
            props.overscan,
            config.value.direction === 'rtl' ? 'rtl' : 'ltr'
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
        (colRange && colRange.inlineBefore > 0 ? 1 : 0) +
        (colRange && colRange.inlineAfter > 0 ? 1 : 0)
      const spacers = getVirtualTableSpacerHeights(range.value, props.virtualItemHeight)
      const interactive = hasSelection.value || hasRowClick()
      const focusIndex = visibleData.value.some(
        (_, localIdx) => range.value.start + localIdx === activeIndex.value
      )
        ? activeIndex.value
        : range.value.start

      const headerCells = visibleColumns.map((col, colIdx) => {
        const widthStyle = col.width
          ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
          : {}
        const stickyStyle = getVirtualTableFixedCellStyle(col.key, fi, 'header')
        return h(
          'th',
          {
            key: col.key as string,
            scope: 'col',
            'aria-colindex': (colRange ? colRange.start : 0) + colIdx + 1,
            'data-tiger-table-column-key': col.key,
            class: classNames(
              virtualTableHeaderCellClasses,
              getTableHeaderCellClasses('md', col.align || 'left', false),
              getVirtualTableFixedHeaderCellClasses(col, fi, props.stickyHeader)
            ),
            style: { ...widthStyle, ...stickyStyle }
          },
          [col.renderHeader ? (col.renderHeader() as VNodeChild) : (col.title ?? '')]
        )
      })

      const headerRow = h('tr', { 'aria-rowindex': 1 }, [
        colRange && colRange.inlineBefore > 0
          ? h('th', {
              key: '__left-pad',
              'aria-hidden': true,
              style: { width: `${colRange.inlineBefore}px`, padding: 0 }
            })
          : null,
        ...headerCells,
        colRange && colRange.inlineAfter > 0
          ? h('th', {
              key: '__right-pad',
              'aria-hidden': true,
              style: { width: `${colRange.inlineAfter}px`, padding: 0 }
            })
          : null
      ])
      const thead = h(
        'thead',
        {
          ref: headerRef,
          class: props.stickyHeader ? virtualTableHeaderClasses : undefined
        },
        [headerRow]
      )

      const rows = props.loading
        ? []
        : visibleData.value.map((row, localIdx) => {
        const globalIdx = range.value.start + localIdx
        const identity = identities.value[globalIdx] ?? { key: undefined, domKey: globalIdx }
        const isSelected =
          identity.key !== undefined && selectedSet.value.has(tableRowKeyId(identity.key))
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
                getTableCellClasses('md', col.align || 'left'),
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
                minHeight: `${props.virtualItemHeight}px`,
                ...getVirtualTableFixedCellStyle(col.key, fi, 'body')
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
            style: { minHeight: `${props.virtualItemHeight}px` },
            'aria-rowindex': globalIdx + 2,
            'aria-selected': hasSelection.value ? isSelected : undefined,
            'aria-disabled': isDisabled || undefined,
            tabindex: tabIndex,
            ref: (el: unknown) => {
              const node = (el as { $el?: HTMLElement } | null)?.$el ?? (el as HTMLElement | null)
              if (node) rowEls.set(globalIdx, node)
              else rowEls.delete(globalIdx)
            },
            onClick: interactive ? (event: MouseEvent) => activate(event) : undefined,
            onKeydown: interactive
              ? (e: KeyboardEvent) => {
                  if (e.target !== e.currentTarget) return
                  if (isVirtualTableCellControlTarget(e.target)) return
                  if (isActivationKey(e)) {
                    e.preventDefault()
                    activate(e)
                    return
                  }
                  const move = (next: number) => {
                    activeIndex.value = next
                    scrollToIndex(next)
                    focusActiveRow(next)
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    move(Math.max(0, Math.min(resolvedData.value.length - 1, globalIdx + 1)))
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    move(Math.max(0, Math.min(resolvedData.value.length - 1, globalIdx - 1)))
                  }
                }
              : undefined
          },
          [
            colRange && colRange.inlineBefore > 0
              ? h('td', {
                  key: '__left-pad',
                  'aria-hidden': true,
                  style: { width: `${colRange.inlineBefore}px`, padding: 0 }
                })
              : null,
            ...cells,
            colRange && colRange.inlineAfter > 0
              ? h('td', {
                  key: '__right-pad',
                  'aria-hidden': true,
                  style: { width: `${colRange.inlineAfter}px`, padding: 0 }
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
              colRange && colRange.inlineBefore > 0
                ? h('col', { key: '__left-pad', style: { width: `${colRange.inlineBefore}px` } })
                : null,
              ...colgroupEntries.map((entry) =>
                h('col', {
                  key: entry.key,
                  'data-tiger-table-col': entry.key,
                  style: entry.width ? { width: entry.width } : undefined
                })
              ),
              colRange && colRange.inlineAfter > 0
                ? h('col', { key: '__right-pad', style: { width: `${colRange.inlineAfter}px` } })
                : null
            ])
          : null

      const table = h(
        'table',
        {
          class: classNames(tableBaseClasses, 'table-fixed'),
          style: fi.minTableWidth > 0 ? { minWidth: `${fi.minTableWidth}px` } : undefined,
          'aria-label': getTableLabels(mergedLocale.value).tableAriaLabel,
          'aria-rowcount': resolvedData.value.length + 1,
          'aria-colcount': resolvedColumns.value.length
        },
        [colgroup, thead, tbody]
      )

      const emptyEl =
        resolvedData.value.length === 0 && !props.loading
          ? h(
              'div',
              { class: virtualTableEmptyClasses, role: 'status', 'aria-live': 'polite' },
              resolveLocaleText('No data', props.emptyText, mergedLocale.value?.common?.emptyText)
            )
          : null

      const loadingEl = props.loading
        ? h(
            'div',
            { class: virtualTableLoadingClasses, role: 'status', 'aria-live': 'polite' },
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
