import {
  defineComponent,
  computed,
  getCurrentInstance,
  h,
  PropType,
  ref,
  watch,
  type VNodeArrayChildren
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  type TableColumn,
  type TableSize,
  type SortState,
  type RowSelectionConfig,
  type TableToolbarProps as CoreTableToolbarProps,
  type TableToolbarFilter,
  type TableToolbarFilterValue,
  type TableToolbarAction,
  type PaginationProps
} from '@expcat/tigercat-core'
import { Table } from './Table'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { Pagination } from './Pagination'

export interface VueTableToolbarProps extends Omit<
  CoreTableToolbarProps,
  'onSearchChange' | 'onSearch' | 'onFiltersChange' | 'onBulkAction'
> {}

export interface VueDataTableWithToolbarProps {
  columns: TableColumn[]
  columnLockable?: boolean
  dataSource?: Record<string, unknown>[]
  sort?: SortState
  defaultSort?: SortState
  filters?: Record<string, unknown>
  defaultFilters?: Record<string, unknown>
  size?: TableSize
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  loading?: boolean
  emptyText?: string
  rowSelection?: RowSelectionConfig
  rowKey?: string | ((record: Record<string, unknown>) => string | number)
  rowClassName?: string | ((record: Record<string, unknown>, index: number) => string)
  stickyHeader?: boolean
  maxHeight?: string | number
  toolbar?: VueTableToolbarProps
  pagination?: PaginationProps | false
  className?: string
  style?: Record<string, string | number>
}

export const DataTableWithToolbar = defineComponent({
  name: 'TigerDataTableWithToolbar',
  inheritAttrs: false,
  props: {
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true
    },
    columnLockable: {
      type: Boolean,
      default: false
    },
    dataSource: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => []
    },
    sort: {
      type: Object as PropType<SortState>,
      default: undefined
    },
    defaultSort: {
      type: Object as PropType<SortState>,
      default: undefined
    },
    filters: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    },
    defaultFilters: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    },
    size: {
      type: String as PropType<TableSize>,
      default: 'md'
    },
    bordered: {
      type: Boolean,
      default: false
    },
    striped: {
      type: Boolean,
      default: false
    },
    hoverable: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: 'No data'
    },
    rowSelection: {
      type: Object as PropType<RowSelectionConfig>,
      default: undefined
    },
    rowKey: {
      type: [String, Function] as PropType<
        string | ((record: Record<string, unknown>) => string | number)
      >,
      default: 'id'
    },
    rowClassName: {
      type: [String, Function] as PropType<
        string | ((record: Record<string, unknown>, index: number) => string)
      >,
      default: undefined
    },
    stickyHeader: {
      type: Boolean,
      default: false
    },
    maxHeight: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    toolbar: {
      type: Object as PropType<VueTableToolbarProps>,
      default: undefined
    },
    pagination: {
      type: [Object, Boolean] as PropType<PaginationProps | false>,
      default: false
    },
    tableLayout: {
      type: String as PropType<'auto' | 'fixed'>,
      default: 'auto'
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: {
    'search-change': (value: string) => true,
    search: (value: string) => true,
    'filters-change': (filters: Record<string, TableToolbarFilterValue>) => true,
    'bulk-action': (action: TableToolbarAction, keys: (string | number)[]) => true,
    'selection-change': (keys: (string | number)[]) => true,
    'page-change': (current: number, pageSize: number) => true,
    'page-size-change': (current: number, pageSize: number) => true
  },
  setup(props, { attrs, emit }) {
    const internalSearch = ref<string>(props.toolbar?.defaultSearchValue ?? '')
    const internalFilters = ref<Record<string, TableToolbarFilterValue>>({})
    const vnodeProps = (getCurrentInstance()?.vnode.props ?? {}) as Record<string, unknown>
    const hasSearchListener = Boolean(vnodeProps.onSearch || vnodeProps.onSearchChange)

    watch(
      () => props.toolbar?.searchValue,
      (nextValue) => {
        if (nextValue !== undefined) {
          internalSearch.value = nextValue ?? ''
        }
      }
    )

    watch(
      () => props.toolbar?.filters,
      (filters) => {
        if (!filters) return
        const next: Record<string, TableToolbarFilterValue> = { ...internalFilters.value }
        filters.forEach((filter) => {
          if (filter.value === undefined && !(filter.key in next)) {
            next[filter.key] = filter.defaultValue ?? null
          }
        })
        internalFilters.value = next
      },
      { immediate: true, deep: true }
    )

    const searchValue = computed(() =>
      props.toolbar?.searchValue !== undefined ? props.toolbar.searchValue : internalSearch.value
    )

    const resolvedFilters = computed<Record<string, TableToolbarFilterValue>>(() => {
      const next: Record<string, TableToolbarFilterValue> = {}
      props.toolbar?.filters?.forEach((filter) => {
        next[filter.key] =
          filter.value !== undefined
            ? filter.value
            : (internalFilters.value[filter.key] ?? filter.defaultValue ?? null)
      })
      return next
    })

    const hasSearch = computed(() => {
      if (!props.toolbar) return hasSearchListener
      return Boolean(
        props.toolbar.searchPlaceholder ||
        props.toolbar.searchValue !== undefined ||
        props.toolbar.defaultSearchValue !== undefined ||
        props.toolbar.showSearchButton ||
        hasSearchListener
      )
    })

    const hasFilters = computed(() => Boolean(props.toolbar?.filters?.length))
    const hasBulkActions = computed(() => Boolean(props.toolbar?.bulkActions?.length))
    const canSearch = computed(() => Boolean(vnodeProps.onSearch))

    const selectedKeys = computed(
      () => props.toolbar?.selectedKeys ?? props.rowSelection?.selectedRowKeys ?? []
    )
    const selectedCount = computed(() =>
      props.toolbar?.selectedCount !== undefined
        ? props.toolbar.selectedCount
        : selectedKeys.value.length
    )
    const bulkLabel = computed(() => props.toolbar?.bulkActionsLabel ?? '已选择')

    const wrapperClasses = computed(() =>
      classNames(
        'tiger-data-table-with-toolbar flex flex-col gap-3',
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const wrapperStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const handleSearchChange = (value: string) => {
      if (props.toolbar?.searchValue === undefined) {
        internalSearch.value = value
      }
      emit('search-change', value)
    }

    const handleSearchSubmit = () => {
      emit('search', searchValue.value ?? '')
    }

    const handleFilterSelect = (filter: TableToolbarFilter, value: TableToolbarFilterValue) => {
      const nextFilters = {
        ...resolvedFilters.value,
        [filter.key]: value
      }

      if (filter.value === undefined) {
        internalFilters.value = {
          ...internalFilters.value,
          [filter.key]: value
        }
      }

      emit('filters-change', nextFilters)
    }

    const handleBulkAction = (action: TableToolbarAction) => {
      const keys = selectedKeys.value ?? []
      action.onClick?.(keys)
      emit('bulk-action', action, keys)
    }

    const renderToolbar = () => {
      if (!hasSearch.value && !hasFilters.value && !hasBulkActions.value) return null

      const leftNodes: VNodeArrayChildren = []

      if (hasSearch.value) {
        const showButton = props.toolbar?.showSearchButton ?? true
        leftNodes.push(
          h(
            'div',
            { class: 'flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] sm:max-w-[320px]' },
            [
              h(Input, {
                type: 'search',
                size: 'sm',
                modelValue: searchValue.value,
                placeholder: props.toolbar?.searchPlaceholder ?? '搜索',
                'onUpdate:modelValue': (value: string | number) =>
                  handleSearchChange(String(value ?? '')),
                onKeydown: (event: KeyboardEvent) => {
                  if (event.key === 'Enter') {
                    handleSearchSubmit()
                  }
                }
              }),
              showButton
                ? h(
                    Button,
                    {
                      size: 'sm',
                      variant: 'primary',
                      class: 'whitespace-nowrap shrink-0',
                      onClick: handleSearchSubmit,
                      disabled: !canSearch.value
                    },
                    { default: () => props.toolbar?.searchButtonText ?? '搜索' }
                  )
                : null
            ]
          )
        )
      }

      if (hasFilters.value) {
        props.toolbar?.filters?.forEach((filter) => {
          const currentValue = resolvedFilters.value[filter.key]
          const clearable = filter.clearable !== false

          leftNodes.push(
            h('div', { class: 'w-full sm:w-auto sm:min-w-[120px] sm:max-w-[180px]' }, [
              h(Select, {
                size: 'sm',
                options: filter.options.map((opt) => ({
                  label: opt.label,
                  value: opt.value
                })),
                modelValue: currentValue ?? undefined,
                placeholder: filter.placeholder ?? filter.label,
                clearable,
                'onUpdate:modelValue': (value: string | number | undefined) => {
                  handleFilterSelect(filter, value ?? null)
                }
              })
            ])
          )
        })
      }

      const bulkChildren: VNodeArrayChildren = []
      if (hasBulkActions.value) {
        if (selectedCount.value > 0) {
          bulkChildren.push(
            h(
              'span',
              { class: 'text-sm text-[var(--tiger-text-muted,#6b7280)]' },
              `${bulkLabel.value} ${selectedCount.value} 项`
            )
          )
        }
        ;(props.toolbar?.bulkActions ?? []).forEach((action) => {
          bulkChildren.push(
            h(
              Button,
              {
                key: action.key,
                size: 'sm',
                variant: action.variant ?? 'outline',
                disabled: action.disabled || selectedCount.value === 0,
                onClick: () => handleBulkAction(action)
              },
              { default: () => action.label }
            )
          )
        })
      }

      return h(
        'div',
        { class: 'tiger-data-table-toolbar flex flex-wrap items-center gap-2 pb-3' },
        [
          h('div', { class: 'flex items-center gap-2 flex-wrap flex-1 min-w-0' }, leftNodes),
          hasBulkActions.value
            ? h(
                'div',
                { class: 'flex items-center gap-2 flex-wrap ml-auto shrink-0' },
                bulkChildren
              )
            : null
        ]
      )
    }

    return () => {
      const { class: _class, style: _style, ...restAttrs } = attrs
      const showPagination = props.pagination && typeof props.pagination === 'object'
      const tableProps = {
        ...(restAttrs as Record<string, unknown>),
        columns: props.columns,
        columnLockable: props.columnLockable,
        dataSource: props.dataSource,
        ...(props.sort !== undefined ? { sort: props.sort } : {}),
        ...(props.defaultSort !== undefined ? { defaultSort: props.defaultSort } : {}),
        ...(props.filters !== undefined ? { filters: props.filters } : {}),
        ...(props.defaultFilters !== undefined ? { defaultFilters: props.defaultFilters } : {}),
        size: props.size,
        bordered: props.bordered,
        striped: props.striped,
        hoverable: props.hoverable,
        loading: props.loading,
        emptyText: props.emptyText,
        pagination: false,
        rowSelection: props.rowSelection,
        rowKey: props.rowKey,
        rowClassName: props.rowClassName,
        stickyHeader: props.stickyHeader,
        maxHeight: props.maxHeight,
        tableLayout: props.tableLayout,
        onSelectionChange: (keys: (string | number)[]) => emit('selection-change', keys)
      }

      return h(
        'div',
        {
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          'data-tiger-data-table-with-toolbar': ''
        },
        [
          renderToolbar(),
          h(Table as unknown as any, tableProps),
          showPagination
            ? h(Pagination, {
                ...(props.pagination as PaginationProps),
                onChange: (current: number, pageSize: number) =>
                  emit('page-change', current, pageSize),
                onPageSizeChange: (current: number, pageSize: number) =>
                  emit('page-size-change', current, pageSize)
              })
            : null
        ]
      )
    }
  }
})

export default DataTableWithToolbar
