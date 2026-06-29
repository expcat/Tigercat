import {
  defineComponent,
  computed,
  getCurrentInstance,
  h,
  PropType,
  ref,
  watch,
  type VNodeArrayChildren,
  type VNodeChild,
  type Component
} from 'vue'
import {
  classNames,
  coerceClassValue,
  getImmediateTigerLocale,
  getTableLabels,
  isLazyTigerLocale,
  mergeStyleValues,
  mergeTigerLocale,
  resolveTigerLocale,
  type TableColumn,
  type TableSize,
  type TableResponsiveMode,
  type TableCardBreakpoint,
  type SortState,
  type PaginationConfig,
  type RowSelectionConfig,
  type TableCardLayoutItem,
  type TableCardRenderContext,
  type TableCardSelectionPosition,
  type ExpandableConfig,
  type FilterRule,
  type TableExportFormat,
  type TigerLocale,
  type TigerLocaleInput,
  type TigerLocaleTable,
  type TableToolbarProps as CoreTableToolbarProps,
  type TableToolbarFilter,
  type TableToolbarFilterRenderContext,
  type TableToolbarFiltersExtraContext,
  type TableToolbarFilterValue,
  type TableToolbarRenderContext,
  type TableToolbarAction
} from '@expcat/tigercat-core'
import { Table } from './Table'
import { useTigerConfig } from './ConfigProvider'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { Popover } from './Popover'
import { Checkbox } from './Checkbox'

export interface VueTableToolbarProps extends Omit<
  CoreTableToolbarProps,
  | 'filters'
  | 'filtersExtra'
  | 'render'
  | 'onSearchChange'
  | 'onSearch'
  | 'onFiltersChange'
  | 'onBulkAction'
> {
  filters?: VueTableToolbarFilter[]
}

export interface VueTableToolbarFilterRenderContext extends Omit<
  TableToolbarFilterRenderContext,
  'filter'
> {
  filter: VueTableToolbarFilter
}

export interface VueTableToolbarFiltersExtraContext extends TableToolbarFiltersExtraContext {}

export interface VueTableToolbarRenderContext extends TableToolbarRenderContext {}

export interface VueTableToolbarFilter extends Omit<TableToolbarFilter, 'render'> {
  render?: (context: VueTableToolbarFilterRenderContext) => VNodeChild
}

export interface VueDataTableWithToolbarProps {
  columns: TableColumn[]
  columnLockable?: boolean
  dataSource?: Record<string, unknown>[]
  hiddenColumnKeys?: string[]
  defaultHiddenColumnKeys?: string[]
  sort?: SortState
  defaultSort?: SortState
  filters?: Record<string, unknown>
  defaultFilters?: Record<string, unknown>
  size?: TableSize
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  loading?: boolean
  locale?: TigerLocaleInput
  labels?: Partial<TigerLocaleTable>
  emptyText?: string
  rowSelection?: RowSelectionConfig
  rowKey?: string | ((record: Record<string, unknown>) => string | number)
  rowClassName?: string | ((record: Record<string, unknown>, index: number) => string)
  stickyHeader?: boolean
  maxHeight?: string | number
  responsiveMode?: TableResponsiveMode
  cardBreakpoint?: TableCardBreakpoint
  cardLayout?: TableCardLayoutItem[]
  cardClassName?: string | ((record: Record<string, unknown>, index: number) => string | undefined)
  renderCard?: (context: TableCardRenderContext<Record<string, unknown>>) => unknown
  cardSelectionPosition?: TableCardSelectionPosition
  cardPadding?: string | false
  cardFieldGap?: string
  expandable?: ExpandableConfig
  virtual?: boolean
  autoVirtual?: boolean
  virtualHeight?: number
  virtualItemHeight?: number
  virtualThreshold?: number
  editable?: boolean
  editableCells?: Map<string, Set<number>>
  filterMode?: 'basic' | 'advanced'
  advancedFilterRules?: FilterRule[]
  columnDraggable?: boolean
  rowDraggable?: boolean
  summaryRow?: { show: boolean; data: Record<string, unknown> }
  groupBy?: string
  exportable?: boolean
  exportFormat?: TableExportFormat
  exportFilename?: string
  toolbar?: VueTableToolbarProps
  pagination?: PaginationConfig | false
  tableLayout?: 'auto' | 'fixed'
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
    hiddenColumnKeys: {
      type: Array as PropType<string[]>,
      default: undefined
    },
    defaultHiddenColumnKeys: {
      type: Array as PropType<string[]>,
      default: undefined
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
    locale: {
      type: [Object, Function] as PropType<TigerLocaleInput>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleTable>>,
      default: undefined
    },
    emptyText: {
      type: String,
      default: undefined
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
    responsiveMode: {
      type: String as PropType<TableResponsiveMode>,
      default: 'scroll' as TableResponsiveMode
    },
    cardBreakpoint: {
      type: String as PropType<TableCardBreakpoint>,
      default: 'sm' as TableCardBreakpoint
    },
    cardLayout: {
      type: Array as PropType<TableCardLayoutItem[]>,
      default: undefined
    },
    cardClassName: {
      type: [String, Function] as PropType<
        string | ((record: Record<string, unknown>, index: number) => string | undefined)
      >,
      default: undefined
    },
    renderCard: {
      type: Function as PropType<
        (context: TableCardRenderContext<Record<string, unknown>>) => unknown
      >,
      default: undefined
    },
    cardSelectionPosition: {
      type: String as PropType<TableCardSelectionPosition>,
      default: undefined
    },
    cardPadding: {
      type: [String, Boolean] as PropType<string | false>,
      default: undefined
    },
    cardFieldGap: {
      type: String,
      default: undefined
    },
    expandable: {
      type: Object as PropType<ExpandableConfig>,
      default: undefined
    },
    virtual: {
      type: Boolean,
      default: undefined
    },
    autoVirtual: {
      type: Boolean,
      default: undefined
    },
    virtualHeight: {
      type: Number,
      default: undefined
    },
    virtualItemHeight: {
      type: Number,
      default: undefined
    },
    virtualThreshold: {
      type: Number,
      default: undefined
    },
    editable: {
      type: Boolean,
      default: undefined
    },
    editableCells: {
      type: Object as PropType<Map<string, Set<number>>>,
      default: undefined
    },
    filterMode: {
      type: String as PropType<'basic' | 'advanced'>,
      default: undefined
    },
    advancedFilterRules: {
      type: Array as PropType<FilterRule[]>,
      default: undefined
    },
    columnDraggable: {
      type: Boolean,
      default: undefined
    },
    rowDraggable: {
      type: Boolean,
      default: undefined
    },
    summaryRow: {
      type: Object as PropType<{ show: boolean; data: Record<string, unknown> }>,
      default: undefined
    },
    groupBy: {
      type: String,
      default: undefined
    },
    exportable: {
      type: Boolean,
      default: undefined
    },
    exportFormat: {
      type: String as PropType<TableExportFormat>,
      default: undefined
    },
    exportFilename: {
      type: String,
      default: undefined
    },
    toolbar: {
      type: Object as PropType<VueTableToolbarProps>,
      default: undefined
    },
    pagination: {
      type: [Object, Boolean] as PropType<PaginationConfig | false>,
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
    'search-change': (_value: string) => true,
    search: (_value: string) => true,
    'filters-change': (_filters: Record<string, TableToolbarFilterValue>) => true,
    'bulk-action': (_action: TableToolbarAction, _keys: (string | number)[]) => true,
    'selection-change': (_keys: (string | number)[]) => true,
    'page-change': (_current: number, _pageSize: number) => true,
    'page-size-change': (_current: number, _pageSize: number) => true,
    'update:hiddenColumnKeys': (_hiddenKeys: string[]) => true,
    'hidden-column-keys-change': (_hiddenKeys: string[]) => true
  },
  setup(props, { attrs, emit, slots }) {
    const config = useTigerConfig()
    const internalSearch = ref<string>(props.toolbar?.defaultSearchValue ?? '')
    const internalHiddenKeys = ref<string[]>(
      props.defaultHiddenColumnKeys ?? props.hiddenColumnKeys ?? []
    )
    const internalFilters = ref<Record<string, TableToolbarFilterValue>>({})
    const previousPageSize = ref(
      props.pagination && typeof props.pagination === 'object'
        ? (props.pagination.pageSize ?? props.pagination.defaultPageSize ?? 10)
        : undefined
    )
    const vnodeProps = (getCurrentInstance()?.vnode.props ?? {}) as Record<string, unknown>
    const hasSearchListener = Boolean(vnodeProps.onSearch || vnodeProps.onSearchChange)
    const resolvedTableLocale = ref<Partial<TigerLocale> | undefined>()
    let tableLocaleResolveId = 0

    watch(
      () => props.locale,
      (locale) => {
        const resolveId = ++tableLocaleResolveId

        if (!locale) {
          resolvedTableLocale.value = undefined
          return
        }

        const immediateLocale = getImmediateTigerLocale(locale)
        resolvedTableLocale.value = immediateLocale

        if (!isLazyTigerLocale(locale)) return

        resolveTigerLocale(locale)
          .then((nextLocale) => {
            if (resolveId === tableLocaleResolveId) {
              resolvedTableLocale.value = nextLocale
            }
          })
          .catch(() => {
            if (resolveId === tableLocaleResolveId) {
              resolvedTableLocale.value = immediateLocale
            }
          })
      },
      { immediate: true }
    )

    const tableLocale = computed(() =>
      mergeTigerLocale(config.value.locale, resolvedTableLocale.value)
    )

    const tableLabels = computed(() => getTableLabels(tableLocale.value, props.labels))

    watch(
      () => props.toolbar?.searchValue,
      (nextValue) => {
        if (nextValue !== undefined) {
          internalSearch.value = nextValue ?? ''
        }
      }
    )

    watch(
      () => props.pagination,
      (nextValue) => {
        if (nextValue && typeof nextValue === 'object') {
          previousPageSize.value = nextValue.pageSize ?? nextValue.defaultPageSize ?? 10
        }
      }
    )

    watch(
      () => props.hiddenColumnKeys,
      (nextValue) => {
        if (nextValue !== undefined) {
          internalHiddenKeys.value = nextValue
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
      const next: Record<string, TableToolbarFilterValue> = { ...internalFilters.value }
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
    const hasFiltersExtra = computed(() => Boolean(slots['filters-extra']))
    const hasBulkActions = computed(() => Boolean(props.toolbar?.bulkActions?.length))
    const hasColumnSettings = computed(() => Boolean(props.toolbar?.showColumnSettings))

    const resolvedHiddenKeys = computed(() => props.hiddenColumnKeys ?? internalHiddenKeys.value)

    const handleHiddenColumnsChange = (nextHiddenKeys: string[]) => {
      if (props.hiddenColumnKeys === undefined) {
        internalHiddenKeys.value = nextHiddenKeys
      }
      emit('update:hiddenColumnKeys', nextHiddenKeys)
      emit('hidden-column-keys-change', nextHiddenKeys)
    }

    const handleToggleColumnVisibility = (columnKey: string, visible: boolean) => {
      const nextHiddenKeys = visible
        ? resolvedHiddenKeys.value.filter((key) => key !== columnKey)
        : [...resolvedHiddenKeys.value, columnKey]
      handleHiddenColumnsChange(nextHiddenKeys)
    }
    const canSearch = computed(() => Boolean(vnodeProps.onSearch))

    const selectedKeys = computed(
      () => props.toolbar?.selectedKeys ?? props.rowSelection?.selectedRowKeys ?? []
    )
    const selectedCount = computed(() =>
      props.toolbar?.selectedCount !== undefined
        ? props.toolbar.selectedCount
        : selectedKeys.value.length
    )
    const bulkLabel = computed(
      () => props.toolbar?.bulkActionsLabel ?? tableLabels.value.selectedText
    )

    const wrapperClasses = computed(() =>
      classNames(
        'tiger-data-table-with-toolbar flex flex-col',
        props.bordered
          ? 'border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] overflow-hidden bg-[var(--tiger-surface,#ffffff)] shadow-sm'
          : 'gap-3.5',
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

    const setFilterValue = (
      key: string,
      value: TableToolbarFilterValue,
      filter?: VueTableToolbarFilter
    ) => {
      const nextFilters = {
        ...resolvedFilters.value,
        [key]: value
      }

      if (!filter || filter.value === undefined) {
        internalFilters.value = {
          ...internalFilters.value,
          [key]: value
        }
      }

      emit('filters-change', nextFilters)
    }

    const handleFilterSelect = (filter: VueTableToolbarFilter, value: TableToolbarFilterValue) => {
      setFilterValue(filter.key, value, filter)
    }

    const handleBulkAction = (action: TableToolbarAction) => {
      const keys = selectedKeys.value ?? []
      action.onClick?.(keys)
      emit('bulk-action', action, keys)
    }

    const handleTablePageChange = ({
      current,
      pageSize
    }: {
      current: number
      pageSize: number
    }) => {
      emit('page-change', current, pageSize)
      if (previousPageSize.value !== undefined && previousPageSize.value !== pageSize) {
        emit('page-size-change', current, pageSize)
      }
      previousPageSize.value = pageSize
    }

    const renderColumnSettings = () => {
      const lockedKeys = new Set(props.toolbar?.columnSettings?.lockedColumnKeys ?? [])
      const panelTitle =
        props.toolbar?.columnSettings?.title ?? tableLabels.value.columnSettingsText

      return h(
        Popover,
        {
          trigger: 'click',
          placement: 'bottom-end'
        },
        {
          default: () =>
            h(
              Button,
              {
                size: 'sm',
                variant: 'outline',
                class: 'shrink-0 px-2',
                'aria-label': tableLabels.value.columnSettingsAriaLabel
              },
              {
                default: () =>
                  h(
                    'svg',
                    {
                      class: 'w-3.5 h-3.5',
                      fill: 'none',
                      stroke: 'currentColor',
                      'stroke-width': '2',
                      viewBox: '0 0 24 24',
                      'aria-hidden': 'true'
                    },
                    [
                      h('path', {
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                      }),
                      h('path', {
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      })
                    ]
                  )
              }
            ),
          title: () => panelTitle,
          content: () =>
            h(
              'div',
              { class: 'flex flex-col gap-2 min-w-[160px]' },
              props.columns.map((column) => {
                const locked = lockedKeys.has(column.key) || column.hideable === false
                return h(
                  Checkbox,
                  {
                    key: column.key,
                    size: 'sm',
                    modelValue: !resolvedHiddenKeys.value.includes(column.key),
                    disabled: locked,
                    'onUpdate:modelValue': (checked: boolean) =>
                      handleToggleColumnVisibility(column.key, checked)
                  },
                  { default: () => column.title }
                )
              })
            )
        }
      )
    }

    const toolbarRenderContext = (): VueTableToolbarRenderContext => ({
      searchValue: searchValue.value ?? '',
      setSearch: handleSearchChange,
      submitSearch: handleSearchSubmit,
      filters: resolvedFilters.value,
      setFilter: (key: string, value: TableToolbarFilterValue) => setFilterValue(key, value),
      selectedKeys: selectedKeys.value,
      selectedCount: selectedCount.value,
      hiddenColumnKeys: resolvedHiddenKeys.value,
      setHiddenColumnKeys: handleHiddenColumnsChange
    })

    const renderToolbar = () => {
      if (slots.toolbar) {
        return slots.toolbar(toolbarRenderContext())
      }

      if (
        !hasSearch.value &&
        !hasFilters.value &&
        !hasFiltersExtra.value &&
        !hasBulkActions.value &&
        !hasColumnSettings.value
      )
        return null

      const leftNodes: VNodeArrayChildren = []

      if (hasSearch.value) {
        const showButton = props.toolbar?.showSearchButton ?? true
        leftNodes.push(
          h(
            'div',
            {
              class: classNames(
                'flex items-center gap-2',
                props.toolbar?.searchClassName ??
                  'w-full sm:w-auto sm:min-w-[220px] sm:max-w-[320px]'
              )
            },
            [
              h(
                Input,
                {
                  type: 'search',
                  size: 'sm',
                  modelValue: searchValue.value,
                  placeholder:
                    props.toolbar?.searchPlaceholder ?? tableLabels.value.searchPlaceholder,
                  'onUpdate:modelValue': (value: string | number) =>
                    handleSearchChange(String(value ?? '')),
                  onKeydown: (event: KeyboardEvent) => {
                    if (event.key === 'Enter') {
                      handleSearchSubmit()
                    }
                  }
                },
                {
                  prefix: () =>
                    h(
                      'svg',
                      {
                        class: 'w-3.5 h-3.5 text-[var(--tiger-text-secondary,#6b7280)] shrink-0',
                        fill: 'none',
                        stroke: 'currentColor',
                        'stroke-width': '2',
                        viewBox: '0 0 24 24',
                        'aria-hidden': 'true'
                      },
                      [
                        h('path', {
                          'stroke-linecap': 'round',
                          'stroke-linejoin': 'round',
                          d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                        })
                      ]
                    )
                }
              ),
              showButton
                ? h(
                    Button,
                    {
                      size: 'sm',
                      variant: 'primary',
                      class:
                        'whitespace-nowrap shrink-0 rounded-[var(--tiger-radius-md,0.5rem)] px-3',
                      onClick: handleSearchSubmit,
                      disabled: !canSearch.value
                    },
                    {
                      default: () =>
                        props.toolbar?.searchButtonText ?? tableLabels.value.searchButtonText
                    }
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

          if (filter.render) {
            const filterNode = filter.render({
              filter,
              value: currentValue,
              filters: resolvedFilters.value,
              setValue: (value: TableToolbarFilterValue) =>
                setFilterValue(filter.key, value, filter),
              setFilter: (key: string, value: TableToolbarFilterValue) => setFilterValue(key, value)
            })
            leftNodes.push(
              h(
                'div',
                {
                  key: filter.key,
                  class: filter.itemClass ?? 'w-full sm:w-auto',
                  style: filter.itemStyle
                },
                filterNode == null ? [] : [filterNode]
              )
            )
            return
          }

          leftNodes.push(
            h(
              'div',
              {
                key: filter.key,
                class: filter.itemClass ?? 'w-full sm:w-auto sm:min-w-[120px] sm:max-w-[180px]',
                style: filter.itemStyle
              },
              [
                h(Select, {
                  size: 'sm',
                  options: (filter.options ?? []).map((opt) => ({
                    label: opt.label,
                    value: opt.value
                  })),
                  modelValue:
                    typeof currentValue === 'string' || typeof currentValue === 'number'
                      ? currentValue
                      : undefined,
                  placeholder: filter.placeholder ?? filter.label,
                  clearable,
                  'onUpdate:modelValue': (value: string | number | undefined) => {
                    handleFilterSelect(filter, value ?? null)
                  }
                })
              ]
            )
          )
        })
      }

      const filtersExtra = slots['filters-extra']?.({
        filters: resolvedFilters.value,
        setFilter: (key: string, value: TableToolbarFilterValue) => setFilterValue(key, value)
      } satisfies VueTableToolbarFiltersExtraContext)
      if (filtersExtra?.length) {
        leftNodes.push(...filtersExtra)
      }

      const bulkChildren: VNodeArrayChildren = []
      if (hasBulkActions.value) {
        if (selectedCount.value > 0) {
          bulkChildren.push(
            h(
              'div',
              {
                class:
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--tiger-primary,#2563eb)]/10 text-[var(--tiger-primary,#2563eb)] text-xs font-medium border border-[var(--tiger-primary,#2563eb)]/15 shrink-0 transition-all duration-300'
              },
              [
                h('span', {
                  class: 'w-1.5 h-1.5 rounded-full bg-[var(--tiger-primary,#2563eb)] animate-pulse'
                }),
                h(
                  'span',
                  null,
                  `${bulkLabel.value} ${selectedCount.value} ${tableLabels.value.selectedItemsText}`
                )
              ]
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
        {
          class: classNames(
            'tiger-data-table-toolbar flex flex-wrap items-center gap-3',
            props.bordered
              ? 'bg-[var(--tiger-surface-muted,#f9fafb)] dark:bg-gray-800/10 px-4 py-3.5 border-b border-[var(--tiger-border,#e5e7eb)]'
              : 'bg-[var(--tiger-surface-muted,#f9fafb)]/80 dark:bg-gray-800/30 px-4 py-3.5 border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] shadow-sm',
            props.toolbar?.className
          ),
          style: props.toolbar?.style,
          role: 'toolbar',
          'aria-label': tableLabels.value.toolbarAriaLabel
        },
        [
          h('div', { class: 'flex items-center gap-3 flex-wrap flex-1 min-w-0' }, leftNodes),
          hasBulkActions.value
            ? h(
                'div',
                { class: 'flex items-center gap-2.5 flex-wrap ml-auto shrink-0' },
                bulkChildren
              )
            : null,
          hasColumnSettings.value
            ? h('div', { class: classNames('shrink-0', !hasBulkActions.value && 'ml-auto') }, [
                renderColumnSettings()
              ])
            : null
        ]
      )
    }

    return () => {
      const { class: _class, style: _style, ...restAttrs } = attrs
      const tableProps = {
        ...(restAttrs as Record<string, unknown>),
        columns: props.columns,
        columnLockable: props.columnLockable,
        dataSource: props.dataSource,
        hiddenColumnKeys: resolvedHiddenKeys.value,
        ...(props.sort !== undefined ? { sort: props.sort } : {}),
        ...(props.defaultSort !== undefined ? { defaultSort: props.defaultSort } : {}),
        ...(props.filters !== undefined ? { filters: props.filters } : {}),
        ...(props.defaultFilters !== undefined ? { defaultFilters: props.defaultFilters } : {}),
        size: props.size,
        bordered: props.bordered,
        striped: props.striped,
        hoverable: props.hoverable,
        loading: props.loading,
        locale: props.locale,
        labels: props.labels,
        emptyText: props.emptyText,
        pagination: props.pagination,
        rowSelection: props.rowSelection,
        rowKey: props.rowKey,
        rowClassName: props.rowClassName,
        stickyHeader: props.stickyHeader,
        maxHeight: props.maxHeight,
        tableLayout: props.tableLayout,
        responsiveMode: props.responsiveMode,
        cardBreakpoint: props.cardBreakpoint,
        cardLayout: props.cardLayout,
        cardClassName: props.cardClassName,
        renderCard: props.renderCard,
        // Forward advanced Table capabilities only when explicitly provided so
        // Table's own defaults are preserved.
        ...(props.cardSelectionPosition !== undefined
          ? { cardSelectionPosition: props.cardSelectionPosition }
          : {}),
        ...(props.cardPadding !== undefined ? { cardPadding: props.cardPadding } : {}),
        ...(props.cardFieldGap !== undefined ? { cardFieldGap: props.cardFieldGap } : {}),
        ...(props.expandable !== undefined ? { expandable: props.expandable } : {}),
        ...(props.virtual !== undefined ? { virtual: props.virtual } : {}),
        ...(props.autoVirtual !== undefined ? { autoVirtual: props.autoVirtual } : {}),
        ...(props.virtualHeight !== undefined ? { virtualHeight: props.virtualHeight } : {}),
        ...(props.virtualItemHeight !== undefined
          ? { virtualItemHeight: props.virtualItemHeight }
          : {}),
        ...(props.virtualThreshold !== undefined
          ? { virtualThreshold: props.virtualThreshold }
          : {}),
        ...(props.editable !== undefined ? { editable: props.editable } : {}),
        ...(props.editableCells !== undefined ? { editableCells: props.editableCells } : {}),
        ...(props.filterMode !== undefined ? { filterMode: props.filterMode } : {}),
        ...(props.advancedFilterRules !== undefined
          ? { advancedFilterRules: props.advancedFilterRules }
          : {}),
        ...(props.columnDraggable !== undefined ? { columnDraggable: props.columnDraggable } : {}),
        ...(props.rowDraggable !== undefined ? { rowDraggable: props.rowDraggable } : {}),
        ...(props.summaryRow !== undefined ? { summaryRow: props.summaryRow } : {}),
        ...(props.groupBy !== undefined ? { groupBy: props.groupBy } : {}),
        ...(props.exportable !== undefined ? { exportable: props.exportable } : {}),
        ...(props.exportFormat !== undefined ? { exportFormat: props.exportFormat } : {}),
        ...(props.exportFilename !== undefined ? { exportFilename: props.exportFilename } : {}),
        class: props.bordered ? 'border-none rounded-none shadow-none' : undefined,
        onSelectionChange: (keys: (string | number)[]) => emit('selection-change', keys),
        onPageChange: handleTablePageChange
      }

      const { toolbar: _toolbarSlot, 'filters-extra': _filtersExtraSlot, ...tableSlots } = slots

      return h(
        'div',
        {
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          'data-tiger-data-table-with-toolbar': ''
        },
        [renderToolbar(), h(Table as unknown as Component, tableProps, tableSlots)]
      )
    }
  }
})

export default DataTableWithToolbar
