import {
  defineComponent,
  computed,
  ref,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  onMounted,
  watch,
  PropType,
  type VNode,
  type VNodeArrayChildren
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  mergeTigerLocale,
  getListClasses,
  getListItemClasses,
  getListItemExtraClasses,
  getListHeaderFooterClasses,
  getListGridColumnClass,
  getListGridGapStyle,
  getListSourceIndex,
  resolveListGridColumnCount,
  resolveListVirtualItemHeight,
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
  listGridContainerClasses,
  listDragHandleClasses,
  getBuiltInPaginationContainerClasses,
  resolvePaginationDisplayMode,
  getPaginationLabels,
  getListLabels,
  formatPaginationTotal,
  formatPaginationPageIndicator,
  observeElementSize,
  reorderSequence,
  devWarn,
  type ComponentSize,
  type ListItemLayout,
  type ListItem,
  type ListPaginationConfig,
  type ListGrid,
  type ListProps as CoreListProps,
  type TigerLocale
} from '@expcat/tigercat-core'
import { VirtualList } from './VirtualList'
import { Pagination } from './Pagination'
import { Empty } from './Empty'
import { Loading } from './Loading'
import { useDrag } from '../composables/useDrag'
import { useTigerConfig } from './ConfigProvider'

type RawChildren = string | number | boolean | VNode | VNodeArrayChildren

export interface VueListProps extends Omit<CoreListProps, 'header' | 'footer'> {
  dataSource?: ListItem[]
  className?: string
  style?: Record<string, string | number>
}

export type ListProps = VueListProps

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('button, a, input, textarea, select, [data-list-drag-handle]'))
}

export const List = defineComponent({
  name: 'TigerList',
  inheritAttrs: false,
  props: {
    dataSource: { type: Array as PropType<ListItem[]>, default: () => [] },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    bordered: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    emptyText: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    split: { type: Boolean, default: true },
    itemLayout: {
      type: String as PropType<ListItemLayout>,
      default: 'horizontal' as ListItemLayout
    },
    pagination: {
      type: [Object, Boolean] as PropType<ListPaginationConfig | false>,
      default: false
    },
    grid: { type: Object as PropType<ListGrid>, default: undefined },
    virtual: { type: Boolean, default: false },
    virtualHeight: { type: Number, default: 400 },
    virtualItemHeight: { type: Number, default: undefined },
    virtualOverscan: { type: Number, default: 5 },
    rowKey: {
      type: [String, Function] as PropType<
        string | ((item: ListItem, index: number) => string | number)
      >,
      default: 'key'
    },
    hoverable: { type: Boolean, default: false },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined },
    draggable: { type: Boolean, default: false }
  },
  emits: ['item-click', 'page-change', 'reorder'],
  setup(props, { emit, slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getListLabels(mergedLocale.value))
    const instance = getCurrentInstance()
    const hasItemClickListener = computed(() => {
      const vnodeProps = (instance?.vnode.props || {}) as Record<string, unknown>
      const handler = vnodeProps.onItemClick
      return typeof handler === 'function' || Array.isArray(handler)
    })
    const rootRef = ref<HTMLElement | null>(null)
    const containerWidth = ref(0)
    let stopSize: (() => void) | undefined

    onMounted(() => {
      if (!props.grid) return
      stopSize = observeElementSize(rootRef.value, ({ width }) => {
        containerWidth.value = width
      })
    })
    onBeforeUnmount(() => stopSize?.())
    watch(
      () => props.grid,
      (grid) => {
        stopSize?.()
        stopSize = undefined
        if (!grid) return
        stopSize = observeElementSize(rootRef.value, ({ width }) => {
          containerWidth.value = width
        })
      }
    )

    const paginationCfg = computed(() =>
      props.pagination !== false && typeof props.pagination === 'object' ? props.pagination : null
    )
    const isRemotePagination = computed(() => paginationCfg.value?.remote === true)
    const internalCurrentPage = ref(paginationCfg.value?.current || 1)
    const internalCurrentPageSize = ref(paginationCfg.value?.pageSize || 10)

    watch(
      () => paginationCfg.value?.current,
      (current) => {
        if (current !== undefined) internalCurrentPage.value = current
      }
    )
    watch(
      () => paginationCfg.value?.pageSize,
      (pageSize) => {
        if (pageSize !== undefined) internalCurrentPageSize.value = pageSize
      }
    )

    const currentPage = computed(() =>
      paginationCfg.value?.current !== undefined
        ? paginationCfg.value.current
        : internalCurrentPage.value
    )
    const currentPageSize = computed(() =>
      paginationCfg.value?.pageSize !== undefined
        ? paginationCfg.value.pageSize
        : internalCurrentPageSize.value
    )

    const drag = useDrag({
      containerId: 'list',
      config: { handleSelector: '[data-list-drag-handle]' },
      onDrop: (event) => {
        if (event.fromIndex === event.toIndex) return
        emit(
          'reorder',
          reorderSequence(props.dataSource, event.fromIndex, event.toIndex),
          event.fromIndex,
          event.toIndex
        )
      }
    })

    const paginatedData = computed(() => {
      if (props.pagination === false) return props.dataSource
      if (isRemotePagination.value) return props.dataSource
      return paginateData(props.dataSource, currentPage.value, currentPageSize.value)
    })
    const paginationTotal = computed(() =>
      isRemotePagination.value
        ? (paginationCfg.value?.total ?? props.dataSource.length)
        : props.dataSource.length
    )
    const paginationInfo = computed(() =>
      props.pagination === false
        ? null
        : calculatePagination(paginationTotal.value, currentPage.value, currentPageSize.value)
    )
    const gridColumnCount = computed(() =>
      props.grid ? resolveListGridColumnCount(props.grid, containerWidth.value) : 1
    )
    const itemHeight = computed(() =>
      resolveListVirtualItemHeight(props.size, props.virtualItemHeight)
    )

    function handlePageChange(page: number) {
      if (paginationCfg.value?.current === undefined) internalCurrentPage.value = page
      emit('page-change', { current: page, pageSize: currentPageSize.value })
    }
    function handlePageSizeChange(pageSize: number) {
      if (paginationCfg.value?.pageSize === undefined) internalCurrentPageSize.value = pageSize
      if (paginationCfg.value?.current === undefined) internalCurrentPage.value = 1
      emit('page-change', { current: 1, pageSize })
    }
    function getItemKey(item: ListItem, index: number): string | number {
      if (typeof props.rowKey === 'function') return props.rowKey(item, index)
      return (item[props.rowKey] as string | number) || index
    }

    function renderDefault(item: ListItem) {
      const meta: RawChildren[] = []
      if (item.avatar) {
        meta.push(
          h('div', { class: listItemAvatarClasses }, [
            typeof item.avatar === 'string'
              ? h('img', {
                  src: item.avatar,
                  alt: item.title ? '' : labels.value.avatarAlt,
                  class: 'w-10 h-10 rounded-full object-cover'
                })
              : (item.avatar as unknown as RawChildren)
          ])
        )
      }
      const content: RawChildren[] = []
      if (item.title) content.push(h('div', { class: listItemTitleClasses }, item.title))
      if (item.description) {
        content.push(h('div', { class: listItemDescriptionClasses }, item.description))
      }
      if (content.length > 0) meta.push(h('div', { class: listItemContentClasses }, content))
      return [
        meta.length > 0 ? h('div', { class: listItemMetaClasses }, meta) : null,
        item.extra
          ? h(
              'div',
              {
                class: getListItemExtraClasses(props.itemLayout),
                onClick: (event: Event) => event.stopPropagation()
              },
              item.extra as unknown as RawChildren
            )
          : null
      ]
    }

    function renderListItem(item: ListItem, pageIndex: number) {
      const sourceIndex = getListSourceIndex(
        pageIndex,
        currentPage.value,
        currentPageSize.value,
        isRemotePagination.value
      )
      const key = getItemKey(item, sourceIndex)
      const itemClasses = getListItemClasses(
        props.size,
        props.itemLayout,
        props.split && !props.grid,
        props.hoverable
      )
      const clickable = hasItemClickListener.value
      const bindings = props.draggable
        ? drag.getDragItemAttrs({ id: String(key), index: sourceIndex, containerId: 'list' })
        : {}
      const {
        class: dragClass,
        onPointerdown,
        draggable: _d,
        ...dragRest
      } = bindings as Record<string, unknown>
      const body = slots.renderItem
        ? slots.renderItem({ item, index: sourceIndex })
        : renderDefault(item)

      return h(
        'li',
        {
          key,
          class: classNames(itemClasses, dragClass as string | undefined),
          onClick: clickable
            ? (event: MouseEvent) => {
                if (isInteractiveTarget(event.target)) return
                emit('item-click', item, sourceIndex)
              }
            : undefined,
          ...dragRest
        },
        [
          props.draggable
            ? h(
                'button',
                {
                  type: 'button',
                  'data-list-drag-handle': '',
                  class: listDragHandleClasses,
                  'aria-label': labels.value.dragHandleAriaLabel,
                  onPointerdown: (event: PointerEvent) => {
                    event.stopPropagation()
                    ;(onPointerdown as ((e: PointerEvent) => void) | undefined)?.(event)
                  },
                  onClick: (event: Event) => event.stopPropagation(),
                  onKeydown: (event: KeyboardEvent) => {
                    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
                      return
                    }
                    event.preventDefault()
                    const to = event.key === 'ArrowUp' ? sourceIndex - 1 : sourceIndex + 1
                    if (to < 0 || to >= props.dataSource.length) return
                    emit(
                      'reorder',
                      reorderSequence(props.dataSource, sourceIndex, to),
                      sourceIndex,
                      to
                    )
                  }
                },
                '⋮⋮'
              )
            : null,
          clickable && !slots.renderItem
            ? h(
                'button',
                {
                  type: 'button',
                  class: 'flex min-w-0 flex-1 items-center text-start',
                  onClick: () => emit('item-click', item, sourceIndex)
                },
                body
              )
            : body
        ]
      )
    }

    function renderItems() {
      if (props.virtual && props.grid) {
        devWarn('List.virtualGrid', 'List: `virtual` is ignored when `grid` is set.')
      }
      if (paginatedData.value.length === 0) {
        return h('div', { class: listEmptyStateClasses }, [
          h(Empty, { description: props.emptyText, showImage: false, locale: mergedLocale.value })
        ])
      }
      const items = paginatedData.value.map((item, index) => renderListItem(item, index))
      if (props.grid) {
        return h(
          'ul',
          {
            class: classNames(
              listGridContainerClasses,
              getListGridColumnClass(gridColumnCount.value),
              props.grid.gutter === undefined && 'gap-4'
            ),
            style: getListGridGapStyle(props.grid.gutter),
            ...(props.draggable ? drag.getDropZoneAttrs() : {})
          },
          items
        )
      }
      if (props.virtual) {
        return h(
          VirtualList,
          {
            itemCount: paginatedData.value.length,
            itemHeight: itemHeight.value,
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
      return h('ul', props.draggable ? drag.getDropZoneAttrs() : {}, items)
    }

    function renderPaginationBar() {
      if (props.pagination === false || !paginationInfo.value) return null
      const { totalPages } = paginationInfo.value
      const paginationConfig = props.pagination as ListPaginationConfig
      const paginationLabels = getPaginationLabels(mergedLocale.value)
      const localeCode = mergedLocale.value?.locale
      const { simple, showQuickJumper } = resolvePaginationDisplayMode(totalPages, paginationConfig)
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
          size: props.size === 'lg' ? 'large' : props.size === 'sm' ? 'small' : 'medium',
          align: 'right',
          current: currentPage.value,
          pageSize: currentPageSize.value,
          total: paginationTotal.value,
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

    return () =>
      h(
        'div',
        {
          ...attrs,
          ref: rootRef,
          class: classNames(
            listWrapperClasses,
            getListClasses(props.bordered),
            listSizeClasses[props.size],
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: mergeStyleValues(attrs.style, props.style)
        },
        [
          slots.header
            ? h('div', { class: getListHeaderFooterClasses(props.size, false) }, slots.header())
            : null,
          h('div', { class: 'relative', 'aria-busy': props.loading || undefined }, [
            renderItems(),
            props.loading
              ? h('div', { class: listLoadingOverlayClasses }, [
                  h(Loading, { variant: 'spinner', 'aria-hidden': true, role: 'presentation' })
                ])
              : null
          ]),
          slots.footer
            ? h('div', { class: getListHeaderFooterClasses(props.size, true) }, slots.footer())
            : null,
          renderPaginationBar()
        ]
      )
  }
})

export default List
