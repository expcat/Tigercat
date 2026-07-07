import {
  defineComponent,
  computed,
  ref,
  getCurrentInstance,
  h,
  PropType,
  type VNode,
  type VNodeArrayChildren
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  resolveLocaleText,
  mergeTigerLocale,
  getListClasses,
  getListItemClasses,
  getListHeaderFooterClasses,
  getGridColumnClasses,
  paginateData,
  calculatePagination,
  listWrapperClasses,
  listSizeClasses,
  listEmptyStateClasses,
  listLoadingOverlayClasses,
  listItemMetaClasses,
  listItemAvatarClasses,
  listItemContentClasses,
  listItemTitleClasses,
  listItemDescriptionClasses,
  listItemExtraClasses,
  listGridContainerClasses,
  getSpinnerSVG,
  normalizeSvgAttrs,
  getLoadingOverlaySpinnerClasses,
  getBuiltInPaginationContainerClasses,
  resolvePaginationDisplayMode,
  getPaginationLabels,
  formatPaginationTotal,
  formatPaginationPageIndicator,
  type ComponentSize,
  type ListBorderStyle,
  type ListItemLayout,
  type ListItem,
  type ListPaginationConfig,
  type TigerLocale
} from '@expcat/tigercat-core'
import { VirtualList } from './VirtualList'
import { Pagination } from './Pagination'
import { useTigerConfig } from './ConfigProvider'

const spinnerSvg = getSpinnerSVG('spinner')

type RawChildren = string | number | boolean | VNode | VNodeArrayChildren

// Loading spinner component
const LoadingSpinner = () => {
  return h(
    'svg',
    {
      class: getLoadingOverlaySpinnerClasses(),
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: spinnerSvg.viewBox
    },
    spinnerSvg.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
  )
}

export const List = defineComponent({
  name: 'TigerList',
  inheritAttrs: false,
  props: {
    /**
     * List data source
     */
    dataSource: {
      type: Array as PropType<ListItem[]>,
      default: () => []
    },
    /**
     * List size
     */
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md'
    },
    /**
     * Border style
     */
    bordered: {
      type: String as PropType<ListBorderStyle>,
      default: 'divided' as ListBorderStyle
    },
    /**
     * Loading state
     */
    loading: {
      type: Boolean,
      default: false
    },
    /**
     * Empty state text
     */
    emptyText: {
      type: String,
      default: undefined
    },
    /**
     * Locale override; falls back to ConfigProvider locale
     */
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    /**
     * Whether to show split line between items
     */
    split: {
      type: Boolean,
      default: true
    },
    /**
     * Item layout
     */
    itemLayout: {
      type: String as PropType<ListItemLayout>,
      default: 'horizontal' as ListItemLayout
    },
    /**
     * Pagination configuration
     */
    pagination: {
      type: [Object, Boolean] as PropType<ListPaginationConfig | false>,
      default: false
    },
    /**
     * Grid configuration
     */
    grid: {
      type: Object as PropType<{
        gutter?: number
        column?: number
        xs?: number
        sm?: number
        md?: number
        lg?: number
        xl?: number
        xxl?: number
      }>
    },
    /**
     * Enable fixed-height virtual rendering via VirtualList.
     * Virtual mode applies to the current paginated data window and is ignored for grid lists.
     */
    virtual: {
      type: Boolean,
      default: false
    },
    /**
     * Virtual viewport height in pixels.
     */
    virtualHeight: {
      type: Number,
      default: 400
    },
    /**
     * Fixed virtual item height in pixels.
     */
    virtualItemHeight: {
      type: Number,
      default: 40
    },
    /**
     * Number of extra virtual items to render above/below the viewport.
     */
    virtualOverscan: {
      type: Number,
      default: 5
    },
    /**
     * Function to get item key
     */
    rowKey: {
      type: [String, Function] as PropType<
        string | ((item: ListItem, index: number) => string | number)
      >,
      default: 'key'
    },
    /**
     * Whether items are hoverable
     */
    hoverable: {
      type: Boolean,
      default: false
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    /**
     * Whether list items are draggable for reorder
     */
    draggable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['item-click', 'page-change', 'reorder'],
  setup(props, { emit, slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const instance = getCurrentInstance()
    const hasItemClickListener = computed(() => {
      const vnodeProps = (instance?.vnode.props || {}) as Record<string, unknown>
      const handler = vnodeProps.onItemClick
      return typeof handler === 'function' || Array.isArray(handler)
    })

    const paginationCfg = computed(() =>
      props.pagination !== false && typeof props.pagination === 'object' ? props.pagination : null
    )

    const isRemotePagination = computed(() => paginationCfg.value?.remote === true)

    const internalCurrentPage = ref(paginationCfg.value?.current || 1)

    const internalCurrentPageSize = ref(paginationCfg.value?.pageSize || 10)

    // Remote mode treats current/pageSize as controlled props.
    const currentPage = computed(() =>
      isRemotePagination.value
        ? (paginationCfg.value?.current ?? internalCurrentPage.value)
        : internalCurrentPage.value
    )

    const currentPageSize = computed(() =>
      isRemotePagination.value
        ? (paginationCfg.value?.pageSize ?? internalCurrentPageSize.value)
        : internalCurrentPageSize.value
    )

    // Drag state
    const dragIndex = ref<number | null>(null)

    function handleDragStart(index: number) {
      dragIndex.value = index
    }

    function handleDragOver(e: DragEvent) {
      e.preventDefault()
    }

    function handleDrop(index: number) {
      if (dragIndex.value === null || dragIndex.value === index) {
        dragIndex.value = null
        return
      }
      const from = dragIndex.value
      dragIndex.value = null
      const items = [...props.dataSource]
      const [moved] = items.splice(from, 1)
      items.splice(index, 0, moved)
      emit('reorder', items, from, index)
    }

    function handleDragEnd() {
      dragIndex.value = null
    }

    // Paginated data
    const paginatedData = computed(() => {
      if (props.pagination === false) {
        return props.dataSource
      }

      // Remote mode: dataSource already holds only the current page — no slicing.
      if (isRemotePagination.value) {
        return props.dataSource
      }

      return paginateData(props.dataSource, currentPage.value, currentPageSize.value)
    })

    const paginationTotal = computed(() =>
      isRemotePagination.value
        ? (paginationCfg.value?.total ?? props.dataSource.length)
        : props.dataSource.length
    )

    // Pagination info
    const paginationInfo = computed(() => {
      if (props.pagination === false) {
        return null
      }

      return calculatePagination(paginationTotal.value, currentPage.value, currentPageSize.value)
    })

    // List classes
    const listClasses = computed(() => {
      return classNames(
        getListClasses(props.bordered),
        listSizeClasses[props.size],
        props.className
      )
    })

    // Grid classes
    const gridClasses = computed(() => {
      if (!props.grid) return ''

      return classNames(
        listGridContainerClasses,
        getGridColumnClasses(
          props.grid.column,
          props.grid.xs,
          props.grid.sm,
          props.grid.md,
          props.grid.lg,
          props.grid.xl,
          props.grid.xxl
        )
      )
    })

    function handlePageChange(page: number) {
      internalCurrentPage.value = page
      emit('page-change', { current: page, pageSize: currentPageSize.value })
    }

    function handlePageSizeChange(pageSize: number) {
      internalCurrentPageSize.value = pageSize
      internalCurrentPage.value = 1
      emit('page-change', { current: 1, pageSize })
    }

    function handleItemClick(item: ListItem, index: number) {
      emit('item-click', item, index)
    }

    function getItemKey(item: ListItem, index: number): string | number {
      if (typeof props.rowKey === 'function') {
        return props.rowKey(item, index)
      }
      return (item[props.rowKey] as string | number) || index
    }

    function renderListHeader() {
      if (!slots.header) return null

      return h(
        'div',
        {
          class: getListHeaderFooterClasses(props.size, false)
        },
        slots.header()
      )
    }

    function renderListFooter() {
      if (!slots.footer) return null

      return h(
        'div',
        {
          class: getListHeaderFooterClasses(props.size, true)
        },
        slots.footer()
      )
    }

    function getItemAttrs(item: ListItem, index: number, itemClasses: string) {
      const key = getItemKey(item, index)
      const clickable = hasItemClickListener.value
      const draggableAttrs = props.draggable
        ? {
            draggable: true,
            onDragstart: () => handleDragStart(index),
            onDragover: handleDragOver,
            onDrop: () => handleDrop(index),
            onDragend: handleDragEnd
          }
        : {}
      return {
        key,
        class: classNames(
          itemClasses,
          clickable && 'cursor-pointer',
          props.draggable && 'cursor-grab'
        ),
        role: 'listitem' as const,
        tabindex: clickable ? 0 : undefined,
        onClick: () => handleItemClick(item, index),
        onKeydown: clickable
          ? (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleItemClick(item, index)
              }
            }
          : undefined,
        ...draggableAttrs
      }
    }

    function renderListItem(item: ListItem, index: number) {
      const itemClasses = getListItemClasses(
        props.size,
        props.itemLayout,
        props.split && props.bordered === 'divided' && !props.grid,
        props.hoverable
      )
      const attrs = getItemAttrs(item, index, itemClasses)

      // Custom render from slot
      if (slots.renderItem) {
        return h('div', attrs, slots.renderItem({ item, index }))
      }

      // Default item render
      const itemContent: RawChildren[] = []

      // Meta section (avatar + content)
      const metaContent: RawChildren[] = []

      if (item.avatar) {
        metaContent.push(
          h('div', { class: listItemAvatarClasses }, [
            typeof item.avatar === 'string'
              ? h('img', {
                  src: item.avatar,
                  alt: item.title || 'Avatar',
                  class: 'w-10 h-10 rounded-full object-cover'
                })
              : (item.avatar as unknown as RawChildren)
          ])
        )
      }

      const contentChildren: RawChildren[] = []
      if (item.title) {
        contentChildren.push(h('div', { class: listItemTitleClasses }, item.title))
      }
      if (item.description) {
        contentChildren.push(h('div', { class: listItemDescriptionClasses }, item.description))
      }

      if (contentChildren.length > 0) {
        metaContent.push(h('div', { class: listItemContentClasses }, contentChildren))
      }

      if (metaContent.length > 0) {
        itemContent.push(h('div', { class: listItemMetaClasses }, metaContent))
      }

      // Extra content
      if (item.extra) {
        itemContent.push(
          h('div', { class: listItemExtraClasses }, item.extra as unknown as RawChildren)
        )
      }

      return h('div', attrs, itemContent)
    }

    function renderListItems() {
      if (props.loading) {
        return null
      }

      if (paginatedData.value.length === 0) {
        return h(
          'div',
          {
            class: listEmptyStateClasses,
            role: 'status',
            'aria-live': 'polite'
          },
          resolveLocaleText('No data', props.emptyText, mergedLocale.value?.common?.emptyText)
        )
      }

      const items = paginatedData.value.map((item, index) => renderListItem(item, index))

      if (props.grid) {
        const gutter = props.grid.gutter
        return h(
          'div',
          {
            class: gridClasses.value,
            style: gutter ? { gap: `${gutter}px` } : undefined
          },
          items
        )
      }

      if (props.virtual) {
        return h(
          VirtualList,
          {
            itemCount: paginatedData.value.length,
            itemHeight: props.virtualItemHeight,
            height: props.virtualHeight,
            overscan: props.virtualOverscan
          },
          {
            default: ({ index }: { index: number }) => {
              const item = paginatedData.value[index]
              return item ? renderListItem(item, index) : null
            }
          }
        )
      }

      return items
    }

    function renderPagination() {
      if (props.pagination === false || !paginationInfo.value) {
        return null
      }

      const { totalPages } = paginationInfo.value
      const total = paginationTotal.value
      const paginationConfig = props.pagination as ListPaginationConfig
      const paginationLabels = getPaginationLabels(mergedLocale.value)
      const localeCode = mergedLocale.value?.locale

      // More than 3 pages: full page-number buttons plus quick jumper;
      // otherwise the simple prev/next indicator (config values override).
      const { simple, showQuickJumper } = resolvePaginationDisplayMode(
        totalPages,
        paginationConfig
      )

      const totalText =
        paginationConfig.totalText ??
        ((value: number, range: [number, number]) =>
          formatPaginationTotal(paginationLabels.totalText, value, range, localeCode))

      const pageIndicatorText = (current: number, pages: number) =>
        formatPaginationPageIndicator(
          paginationLabels.pageIndicatorText,
          current,
          pages,
          localeCode
        )

      return h('div', { class: getBuiltInPaginationContainerClasses() }, [
        h(Pagination, {
          size: 'small',
          align: 'right',
          current: currentPage.value,
          pageSize: currentPageSize.value,
          total,
          simple,
          showQuickJumper,
          showSizeChanger: paginationConfig.showSizeChanger !== false,
          showTotal: paginationConfig.showTotal !== false,
          totalText,
          pageIndicatorText,
          pageSizeOptions: paginationConfig.pageSizeOptions || [10, 20, 50, 100],
          locale: mergedLocale.value,
          onChange: (page: number) => handlePageChange(page),
          onPageSizeChange: (_page: number, pageSize: number) => handlePageSizeChange(pageSize)
        })
      ])
    }

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class
      const attrsStyle = attrsRecord.style

      return h('div', { class: listWrapperClasses }, [
        h('div', { class: 'relative' }, [
          h(
            'div',
            {
              ...attrs,
              class: classNames(listClasses.value, coerceClassValue(attrsClass)),
              style: mergeStyleValues(attrsStyle, props.style),
              role: 'list',
              'aria-busy': props.loading || undefined
            },
            [renderListHeader(), renderListItems(), renderListFooter()]
          ),

          // Loading overlay
          props.loading &&
            h(
              'div',
              {
                class: listLoadingOverlayClasses,
                role: 'status',
                'aria-live': 'polite'
              },
              [LoadingSpinner()]
            )
        ]),

        // Pagination
        renderPagination()
      ])
    }
  }
})

export interface VueListProps {
  dataSource?: ListItem[]
  size?: ComponentSize
  bordered?: ListBorderStyle
  loading?: boolean
  emptyText?: string
  split?: boolean
  itemLayout?: ListItemLayout
  pagination?: ListPaginationConfig | false
  grid?: {
    gutter?: number
    column?: number
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xxl?: number
  }
  rowKey?: string | ((item: ListItem, index: number) => string | number)
  hoverable?: boolean
  className?: string
  style?: Record<string, string | number>
}

export default List
