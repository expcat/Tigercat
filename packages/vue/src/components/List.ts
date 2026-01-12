import {
  defineComponent,
  computed,
  ref,
  getCurrentInstance,
  h,
  PropType,
  type VNode,
  type VNodeArrayChildren,
} from 'vue';
import {
  classNames,
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
  listPaginationContainerClasses,
  listItemMetaClasses,
  listItemAvatarClasses,
  listItemContentClasses,
  listItemTitleClasses,
  listItemDescriptionClasses,
  listItemExtraClasses,
  listGridContainerClasses,
  type ListSize,
  type ListBorderStyle,
  type ListItemLayout,
  type ListItem,
  type ListPaginationConfig,
} from '@tigercat/core';

type RawChildren =
  | string
  | number
  | boolean
  | VNode
  | VNodeArrayChildren
  | (() => unknown);

// Loading spinner component
const LoadingSpinner = () => {
  return h(
    'svg',
    {
      class: 'animate-spin h-8 w-8 text-[var(--tiger-primary,#2563eb)]',
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
    },
    [
      h('circle', {
        class: 'opacity-25',
        cx: '12',
        cy: '12',
        r: '10',
        stroke: 'currentColor',
        'stroke-width': '4',
      }),
      h('path', {
        class: 'opacity-75',
        fill: 'currentColor',
        d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
      }),
    ]
  );
};

export const List = defineComponent({
  name: 'TigerList',
  inheritAttrs: false,
  props: {
    /**
     * List data source
     */
    dataSource: {
      type: Array as PropType<ListItem[]>,
      default: () => [],
    },
    /**
     * List size
     */
    size: {
      type: String as PropType<ListSize>,
      default: 'md' as ListSize,
    },
    /**
     * Border style
     */
    bordered: {
      type: String as PropType<ListBorderStyle>,
      default: 'divided' as ListBorderStyle,
    },
    /**
     * Loading state
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Empty state text
     */
    emptyText: {
      type: String,
      default: 'No data',
    },
    /**
     * Whether to show split line between items
     */
    split: {
      type: Boolean,
      default: true,
    },
    /**
     * Item layout
     */
    itemLayout: {
      type: String as PropType<ListItemLayout>,
      default: 'horizontal' as ListItemLayout,
    },
    /**
     * Pagination configuration
     */
    pagination: {
      type: [Object, Boolean] as PropType<ListPaginationConfig | false>,
      default: false,
    },
    /**
     * Grid configuration
     */
    grid: {
      type: Object as PropType<{
        gutter?: number;
        column?: number;
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        xxl?: number;
      }>,
    },
    /**
     * Function to get item key
     */
    rowKey: {
      type: [String, Function] as PropType<
        string | ((item: ListItem, index: number) => string | number)
      >,
      default: 'key',
    },
    /**
     * Whether items are hoverable
     */
    hoverable: {
      type: Boolean,
      default: false,
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },
  },
  emits: ['item-click', 'page-change'],
  setup(props, { emit, slots, attrs }) {
    const instance = getCurrentInstance();
    const hasItemClickListener = computed(() => {
      const vnodeProps = (instance?.vnode.props || {}) as Record<
        string,
        unknown
      >;
      const handler = vnodeProps.onItemClick;
      return typeof handler === 'function' || Array.isArray(handler);
    });

    const currentPage = ref(
      props.pagination && typeof props.pagination === 'object'
        ? props.pagination.current || 1
        : 1
    );

    const currentPageSize = ref(
      props.pagination && typeof props.pagination === 'object'
        ? props.pagination.pageSize || 10
        : 10
    );

    // Paginated data
    const paginatedData = computed(() => {
      if (props.pagination === false) {
        return props.dataSource;
      }

      return paginateData(
        props.dataSource,
        currentPage.value,
        currentPageSize.value
      );
    });

    // Pagination info
    const paginationInfo = computed(() => {
      if (props.pagination === false) {
        return null;
      }

      const total = props.dataSource.length;
      return calculatePagination(
        total,
        currentPage.value,
        currentPageSize.value
      );
    });

    // List classes
    const listClasses = computed(() => {
      return classNames(
        getListClasses(props.bordered),
        listSizeClasses[props.size],
        props.className
      );
    });

    // Grid classes
    const gridClasses = computed(() => {
      if (!props.grid) return '';

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
      );
    });

    function handlePageChange(page: number) {
      currentPage.value = page;
      emit('page-change', { current: page, pageSize: currentPageSize.value });
    }

    function handlePageSizeChange(pageSize: number) {
      currentPageSize.value = pageSize;
      currentPage.value = 1;
      emit('page-change', { current: 1, pageSize });
    }

    function handleItemClick(item: ListItem, index: number) {
      emit('item-click', item, index);
    }

    function getItemKey(item: ListItem, index: number): string | number {
      if (typeof props.rowKey === 'function') {
        return props.rowKey(item, index);
      }
      return (item[props.rowKey] as string | number) || index;
    }

    function renderListHeader() {
      if (!slots.header) return null;

      return h(
        'div',
        {
          class: getListHeaderFooterClasses(props.size, false),
        },
        slots.header()
      );
    }

    function renderListFooter() {
      if (!slots.footer) return null;

      return h(
        'div',
        {
          class: getListHeaderFooterClasses(props.size, true),
        },
        slots.footer()
      );
    }

    function renderListItem(item: ListItem, index: number) {
      const key = getItemKey(item, index);
      const itemClasses = getListItemClasses(
        props.size,
        props.itemLayout,
        props.split && props.bordered === 'divided' && !props.grid,
        props.hoverable
      );

      const clickable = hasItemClickListener.value;

      // Custom render from slot
      if (slots.renderItem) {
        return h(
          'div',
          {
            key,
            class: classNames(itemClasses, clickable && 'cursor-pointer'),
            role: 'listitem',
            tabindex: clickable ? 0 : undefined,
            onClick: () => handleItemClick(item, index),
            onKeydown: clickable
              ? (e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(item, index);
                  }
                }
              : undefined,
          },
          slots.renderItem({ item, index })
        );
      }

      // Default item render
      const itemContent = [];

      // Meta section (avatar + content)
      const metaContent = [];

      if (item.avatar) {
        metaContent.push(
          h('div', { class: listItemAvatarClasses }, [
            typeof item.avatar === 'string'
              ? h('img', {
                  src: item.avatar,
                  alt: item.title || 'Avatar',
                  class: 'w-10 h-10 rounded-full object-cover',
                })
              : item.avatar,
          ])
        );
      }

      const contentChildren = [];
      if (item.title) {
        contentChildren.push(
          h('div', { class: listItemTitleClasses }, item.title)
        );
      }
      if (item.description) {
        contentChildren.push(
          h('div', { class: listItemDescriptionClasses }, item.description)
        );
      }

      if (contentChildren.length > 0) {
        metaContent.push(
          h('div', { class: listItemContentClasses }, contentChildren)
        );
      }

      if (metaContent.length > 0) {
        itemContent.push(h('div', { class: listItemMetaClasses }, metaContent));
      }

      // Extra content
      if (item.extra) {
        itemContent.push(
          h(
            'div',
            { class: listItemExtraClasses },
            item.extra as unknown as RawChildren
          )
        );
      }

      return h(
        'div',
        {
          key,
          class: classNames(itemClasses, clickable && 'cursor-pointer'),
          role: 'listitem',
          tabindex: clickable ? 0 : undefined,
          onClick: () => handleItemClick(item, index),
          onKeydown: clickable
            ? (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleItemClick(item, index);
                }
              }
            : undefined,
        },
        itemContent
      );
    }

    function renderListItems() {
      if (props.loading) {
        return null;
      }

      if (paginatedData.value.length === 0) {
        return h(
          'div',
          {
            class: listEmptyStateClasses,
            role: 'status',
            'aria-live': 'polite',
          },
          props.emptyText
        );
      }

      const items = paginatedData.value.map((item, index) =>
        renderListItem(item, index)
      );

      if (props.grid) {
        const gutter = props.grid.gutter;
        return h(
          'div',
          {
            class: gridClasses.value,
            style: gutter ? { gap: `${gutter}px` } : undefined,
          },
          items
        );
      }

      return items;
    }

    function renderPagination() {
      if (props.pagination === false || !paginationInfo.value) {
        return null;
      }

      const { totalPages, startIndex, endIndex, hasNext, hasPrev } =
        paginationInfo.value;
      const total = props.dataSource.length;
      const paginationConfig = props.pagination as ListPaginationConfig;

      return h('div', { class: listPaginationContainerClasses }, [
        // Total info
        paginationConfig.showTotal !== false &&
          h(
            'div',
            { class: 'text-sm text-[var(--tiger-text,#111827)]' },
            paginationConfig.totalText
              ? paginationConfig.totalText(total, [startIndex, endIndex])
              : `Showing ${startIndex} to ${endIndex} of ${total} items`
          ),

        // Pagination controls
        h('div', { class: 'flex items-center gap-2' }, [
          // Page size selector
          paginationConfig.showSizeChanger !== false &&
            h(
              'select',
              {
                class:
                  'px-3 py-1 border border-[var(--tiger-border,#e5e7eb)] rounded text-sm bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text,#111827)]',
                value: currentPageSize.value,
                onChange: (e: Event) =>
                  handlePageSizeChange(
                    Number((e.target as HTMLSelectElement).value)
                  ),
              },
              (paginationConfig.pageSizeOptions || [10, 20, 50, 100]).map(
                (size) => h('option', { value: size }, `${size} / page`)
              )
            ),

          // Page buttons
          h('div', { class: 'flex gap-1' }, [
            // Previous button
            h(
              'button',
              {
                class: classNames(
                  'px-3 py-1 border border-[var(--tiger-border,#e5e7eb)] rounded text-sm bg-[var(--tiger-surface,#ffffff)]',
                  hasPrev
                    ? 'hover:bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text,#111827)]'
                    : 'text-[var(--tiger-text-muted,#6b7280)] cursor-not-allowed'
                ),
                disabled: !hasPrev,
                onClick: () => handlePageChange(currentPage.value - 1),
              },
              'Previous'
            ),

            // Current page indicator
            h(
              'span',
              { class: 'px-3 py-1 text-sm text-[var(--tiger-text,#111827)]' },
              `Page ${currentPage.value} of ${totalPages}`
            ),

            // Next button
            h(
              'button',
              {
                class: classNames(
                  'px-3 py-1 border border-[var(--tiger-border,#e5e7eb)] rounded text-sm bg-[var(--tiger-surface,#ffffff)]',
                  hasNext
                    ? 'hover:bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text,#111827)]'
                    : 'text-[var(--tiger-text-muted,#6b7280)] cursor-not-allowed'
                ),
                disabled: !hasNext,
                onClick: () => handlePageChange(currentPage.value + 1),
              },
              'Next'
            ),
          ]),
        ]),
      ]);
    }

    return () => {
      const attrsRecord = attrs as Record<string, unknown>;
      const attrsClass = attrsRecord.class;
      const attrsStyle = attrsRecord.style;

      return h('div', { class: listWrapperClasses }, [
        h('div', { class: 'relative' }, [
          h(
            'div',
            {
              ...attrs,
              class: classNames(listClasses.value, attrsClass as any),
              style: [attrsStyle as any, props.style as any],
              role: 'list',
              'aria-busy': props.loading || undefined,
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
                'aria-live': 'polite',
              },
              [LoadingSpinner()]
            ),
        ]),

        // Pagination
        renderPagination(),
      ]);
    };
  },
});

export interface VueListProps {
  dataSource?: ListItem[];
  size?: ListSize;
  bordered?: ListBorderStyle;
  loading?: boolean;
  emptyText?: string;
  split?: boolean;
  itemLayout?: ListItemLayout;
  pagination?: ListPaginationConfig | false;
  grid?: {
    gutter?: number;
    column?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  rowKey?: string | ((item: ListItem, index: number) => string | number);
  hoverable?: boolean;
  className?: string;
  style?: Record<string, string | number>;
}

export default List;
