import { defineComponent, h, ref, computed, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  calculateVirtualRange,
  getVirtualTableContainerClasses,
  getVirtualTableRowClasses,
  getVirtualRowKey,
  virtualTableHeaderClasses,
  virtualTableHeaderCellClasses,
  virtualTableCellClasses,
  virtualTableEmptyClasses,
  virtualTableLoadingClasses,
  type TableColumn,
  type VirtualTableRange
} from '@expcat/tigercat-core'

export interface VueVirtualTableProps {
  data?: unknown[]
  columns?: TableColumn[]
  rowHeight?: number
  height?: number
  overscan?: number
  stickyHeader?: boolean
  rowKey?: string | ((row: unknown, index: number) => string | number)
  loading?: boolean
  emptyText?: string
  selectable?: boolean
  selectedKeys?: (string | number)[]
  striped?: boolean
  bordered?: boolean
  className?: string
}

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
    overscan: { type: Number, default: 5 },
    stickyHeader: { type: Boolean, default: true },
    rowKey: {
      type: [String, Function] as PropType<
        string | ((row: unknown, index: number) => string | number)
      >,
      default: undefined
    },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: 'No data' },
    selectable: { type: Boolean, default: false },
    selectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    striped: { type: Boolean, default: false },
    bordered: { type: Boolean, default: false },
    className: { type: String, default: undefined }
  },
  emits: ['row-click', 'select'],
  setup(props, { emit, attrs }) {
    const containerRef = ref<HTMLElement | null>(null)
    const scrollTop = ref(0)

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
      }
    }

    const containerClasses = computed(() =>
      classNames(
        getVirtualTableContainerClasses(props.bordered, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const selectedSet = computed(() => new Set(props.selectedKeys))

    return () => {
      const headerCells = props.columns.map((col) =>
        h(
          'th',
          {
            key: col.key as string,
            class: virtualTableHeaderCellClasses,
            style: col.width
              ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
              : undefined
          },
          col.title ?? ''
        )
      )

      const headerRow = h('tr', {}, headerCells)
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

        const cells = props.columns.map((col) =>
          h(
            'td',
            {
              key: col.key as string,
              class: virtualTableCellClasses
            },
            String((row as Record<string, unknown>)[col.key as string] ?? '')
          )
        )

        return h(
          'tr',
          {
            key,
            class: getVirtualTableRowClasses(globalIdx, props.striped, isSelected),
            onClick: () => {
              emit('row-click', row, globalIdx)
              if (props.selectable) emit('select', key, row, globalIdx)
            }
          },
          cells
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

      const table = h('table', { class: 'w-full table-fixed' }, [thead, tbody])

      // Empty state
      const emptyEl =
        props.data.length === 0 && !props.loading
          ? h('div', { class: virtualTableEmptyClasses }, props.emptyText)
          : null

      // Loading overlay
      const loadingEl = props.loading
        ? h('div', { class: virtualTableLoadingClasses }, 'Loading...')
        : null

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClasses.value,
          style: { height: `${props.height}px` },
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
