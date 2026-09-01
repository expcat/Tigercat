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
  applyToolbarLocalView,
  canSubmitToolbarSearch,
  classNames,
  coerceClassValue,
  getDataTableToolbarBarClasses,
  getDataTableToolbarWrapperClasses,
  getImmediateTigerLocale,
  getTableLabels,
  isLazyTigerLocale,
  isToolbarSearchRemote,
  mergeStyleValues,
  mergeTigerLocale,
  resolveTigerLocale,
  resolveToolbarFilterMap,
  resolveToolbarPageChange,
  resolveToolbarSelectedKeys,
  seedToolbarFilterState,
  splitCompositeHostAttrs,
  toggleHiddenColumnKey,
  toolbarHasSearch,
  type TableColumn,
  type TableToolbarAction,
  type TableToolbarFilter,
  type TableToolbarFilterRenderContext,
  type TableToolbarFilterValue,
  type TableToolbarFiltersExtraContext,
  type TableToolbarProps as CoreTableToolbarProps,
  type TableToolbarRenderContext,
  type TigerLocale
} from '@expcat/tigercat-core'
import { Table } from './Table'
import { tableProps, type VueTableProps } from './Table/props'
import { useTigerConfig } from './ConfigProvider'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { Popover } from './Popover'
import { Checkbox } from './Checkbox'
import { Icon } from './Icon'

export interface VueTableToolbarProps extends Omit<
  CoreTableToolbarProps,
  'filters' | 'filtersExtra' | 'render'
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

export interface VueDataTableWithToolbarProps extends Omit<VueTableProps, 'pagination'> {
  toolbar?: VueTableToolbarProps
  pagination?: VueTableProps['pagination']
  tableClassName?: string
  className?: string
  style?: Record<string, string | number>
}

export const DataTableWithToolbar = defineComponent({
  name: 'TigerDataTableWithToolbar',
  inheritAttrs: false,
  props: {
    ...tableProps,
    toolbar: {
      type: Object as PropType<VueTableToolbarProps>,
      default: undefined
    },
    tableClassName: {
      type: String,
      default: undefined
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
    'page-change': (_page: { current: number; pageSize: number }) => true,
    'page-size-change': (_page: { current: number; pageSize: number }) => true,
    'update:hiddenColumnKeys': (_hiddenKeys: string[]) => true,
    'hidden-column-keys-change': (_hiddenKeys: string[]) => true
  },
  setup(props, { attrs, emit, slots }) {
    const config = useTigerConfig()
    const internalSearch = ref<string>(props.toolbar?.defaultSearchValue ?? '')
    const internalHiddenKeys = ref<string[]>(props.defaultHiddenColumnKeys ?? [])
    const internalFilters = ref<Record<string, TableToolbarFilterValue>>(
      seedToolbarFilterState({}, props.toolbar?.filters)
    )
    const extraFilterKeys = ref<string[]>([])
    const internalSelectedKeys = ref<(string | number)[]>(
      props.rowSelection?.defaultSelectedRowKeys ?? []
    )
    const previousPageSize = ref(
      props.pagination && typeof props.pagination === 'object'
        ? (props.pagination.pageSize ?? props.pagination.defaultPageSize ?? 10)
        : undefined
    )
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
            if (resolveId === tableLocaleResolveId) resolvedTableLocale.value = nextLocale
          })
          .catch(() => {
            if (resolveId === tableLocaleResolveId) resolvedTableLocale.value = immediateLocale
          })
      },
      { immediate: true }
    )

    const tableLocale = computed(() =>
      mergeTigerLocale(config.value.locale, resolvedTableLocale.value)
    )
    const tableLabels = computed(() => getTableLabels(tableLocale.value, props.labels))

    watch(
      () => props.pagination,
      (nextValue) => {
        if (nextValue && typeof nextValue === 'object') {
          previousPageSize.value = nextValue.pageSize ?? nextValue.defaultPageSize ?? 10
        }
      }
    )

    watch(
      () => props.toolbar?.filters,
      (filters) => {
        const next = seedToolbarFilterState(internalFilters.value, filters)
        if (next !== internalFilters.value) internalFilters.value = next
      },
      { immediate: true, deep: true }
    )

    const searchValue = computed(() =>
      props.toolbar?.searchValue !== undefined ? props.toolbar.searchValue : internalSearch.value
    )
    const resolvedHiddenKeys = computed(() =>
      props.hiddenColumnKeys !== undefined ? props.hiddenColumnKeys : internalHiddenKeys.value
    )
    const resolvedFilters = computed(() =>
      resolveToolbarFilterMap(props.toolbar?.filters, internalFilters.value, extraFilterKeys.value)
    )
    const resolveHasSearch = (): boolean => {
      if (props.toolbar?.search === false) return false
      if (toolbarHasSearch(props.toolbar)) return true
      const vnodeProps = (getCurrentInstance()?.vnode.props ?? {}) as Record<string, unknown>
      return Boolean(vnodeProps.onSearch || vnodeProps.onSearchChange)
    }
    const hasFilters = computed(() => Boolean(props.toolbar?.filters?.length))
    const hasFiltersExtra = computed(() => Boolean(slots['filters-extra']))
    const hasBulkActions = computed(() => Boolean(props.toolbar?.bulkActions?.length))
    const hasColumnSettings = computed(() => Boolean(props.toolbar?.showColumnSettings))
    const viewRows = computed(() => {
      const rows = (props.dataSource ?? []) as Record<string, unknown>[]
      if (isToolbarSearchRemote(props.toolbar)) return rows
      return applyToolbarLocalView(
        rows,
        props.columns as TableColumn[],
        searchValue.value ?? '',
        resolvedFilters.value
      )
    })
    const selectedKeys = computed(() =>
      resolveToolbarSelectedKeys(
        props.toolbar?.selectedKeys,
        props.rowSelection?.selectedRowKeys,
        internalSelectedKeys.value
      )
    )
    const selectedCount = computed(() =>
      props.toolbar?.selectedCount !== undefined
        ? props.toolbar.selectedCount
        : selectedKeys.value.length
    )
    const bulkLabel = computed(
      () => props.toolbar?.bulkActionsLabel ?? tableLabels.value.selectedText
    )

    const handleHiddenColumnsChange = (nextHiddenKeys: string[]) => {
      if (props.hiddenColumnKeys === undefined) internalHiddenKeys.value = nextHiddenKeys
      emit('update:hiddenColumnKeys', nextHiddenKeys)
      emit('hidden-column-keys-change', nextHiddenKeys)
    }

    const handleSearchChange = (value: string) => {
      if (props.toolbar?.searchValue === undefined) internalSearch.value = value
      props.toolbar?.onSearchChange?.(value)
      emit('search-change', value)
    }

    const handleSearchSubmit = () => {
      const value = searchValue.value ?? ''
      props.toolbar?.onSearch?.(value)
      emit('search', value)
    }

    const setFilterValue = (
      key: string,
      value: TableToolbarFilterValue,
      filter?: VueTableToolbarFilter
    ) => {
      const inDefs = props.toolbar?.filters?.some((item) => item.key === key)
      if (!inDefs && !extraFilterKeys.value.includes(key)) {
        extraFilterKeys.value = [...extraFilterKeys.value, key]
      }
      if (!filter || filter.value === undefined) {
        internalFilters.value = { ...internalFilters.value, [key]: value }
      }
      const next = resolveToolbarFilterMap(
        props.toolbar?.filters,
        { ...internalFilters.value, [key]: value },
        extraFilterKeys.value
      )
      props.toolbar?.onFiltersChange?.(next)
      emit('filters-change', next)
    }

    const handleSelectionChange = (keys: (string | number)[]) => {
      if (
        props.toolbar?.selectedKeys === undefined &&
        props.rowSelection?.selectedRowKeys === undefined
      ) {
        internalSelectedKeys.value = keys
      }
      emit('selection-change', keys)
    }

    const handleBulkAction = (action: TableToolbarAction) => {
      const keys = selectedKeys.value
      action.onClick?.(keys)
      props.toolbar?.onBulkAction?.(action, keys)
      emit('bulk-action', action, keys)
    }

    const handleTablePageChange = (page: { current: number; pageSize: number }) => {
      const result = resolveToolbarPageChange(page, previousPageSize.value)
      previousPageSize.value = page.pageSize
      if (result.kind === 'size') emit('page-size-change', page)
      else emit('page-change', page)
    }

    const toolbarRenderContext = (): VueTableToolbarRenderContext => ({
      searchValue: searchValue.value ?? '',
      setSearch: handleSearchChange,
      submitSearch: handleSearchSubmit,
      filters: resolvedFilters.value,
      setFilter: (key: string, value: TableToolbarFilterValue) => setFilterValue(key, value),
      selectedKeys: selectedKeys.value,
      selectedCount: selectedCount.value,
      dataSource: viewRows.value,
      hiddenColumnKeys: resolvedHiddenKeys.value,
      setHiddenColumnKeys: handleHiddenColumnsChange
    })

    const renderColumnSettings = () => {
      const lockedKeys = new Set(props.toolbar?.columnSettings?.lockedColumnKeys ?? [])
      const panelTitle =
        props.toolbar?.columnSettings?.title ?? tableLabels.value.columnSettingsText

      return h(
        Popover,
        { trigger: 'click', placement: 'bottom-end' },
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
              { default: () => h(Icon, { name: 'settings', class: 'w-3.5 h-3.5' }) }
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
                      handleHiddenColumnsChange(
                        toggleHiddenColumnKey(resolvedHiddenKeys.value, column.key, checked)
                      )
                  },
                  { default: () => column.title }
                )
              })
            )
        }
      )
    }

    const renderToolbar = () => {
      if (slots.toolbar) return slots.toolbar(toolbarRenderContext())

      const hasSearch = resolveHasSearch()
      if (
        !hasSearch &&
        !hasFilters.value &&
        !hasFiltersExtra.value &&
        !hasBulkActions.value &&
        !hasColumnSettings.value
      ) {
        return null
      }

      const leftNodes: VNodeArrayChildren = []

      if (hasSearch) {
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
                  'aria-label':
                    props.toolbar?.searchPlaceholder ?? tableLabels.value.searchPlaceholder,
                  'onUpdate:modelValue': (value: string | number) =>
                    handleSearchChange(String(value ?? '')),
                  onKeydown: (event: KeyboardEvent) => {
                    if (event.key === 'Enter') handleSearchSubmit()
                  }
                },
                {
                  prefix: () =>
                    h(Icon, {
                      name: 'search',
                      class: 'w-3.5 h-3.5 text-[var(--tiger-text-secondary,#6b7280)]'
                    })
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
                      disabled: !canSubmitToolbarSearch(props.toolbar)
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
                  'aria-label': filter.label,
                  clearable,
                  'onUpdate:modelValue': (value: string | number | undefined) => {
                    setFilterValue(filter.key, value ?? null, filter)
                  }
                })
              ]
            )
          )
        })
      }

      const filtersExtra = slots['filters-extra']?.({
        filters: resolvedFilters.value,
        setFilter: (key: string, value: TableToolbarFilterValue) => setFilterValue(key, value),
        dataSource: viewRows.value,
        selectedKeys: selectedKeys.value,
        hiddenColumnKeys: resolvedHiddenKeys.value
      } satisfies VueTableToolbarFiltersExtraContext)
      if (filtersExtra?.length) leftNodes.push(...filtersExtra)

      const bulkChildren: VNodeArrayChildren = []
      if (hasBulkActions.value) {
        if (selectedCount.value > 0) {
          bulkChildren.push(
            h(
              'div',
              {
                class:
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--tiger-primary,#2563eb)]/10 text-[var(--tiger-primary,#2563eb)] text-xs font-medium border border-[var(--tiger-primary,#2563eb)]/15 shrink-0',
                'aria-live': 'polite'
              },
              [
                h('span', {
                  class:
                    'w-1.5 h-1.5 rounded-full bg-[var(--tiger-primary,#2563eb)] animate-pulse motion-reduce:animate-none'
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
          class: getDataTableToolbarBarClasses({
            bordered: props.bordered,
            className: props.toolbar?.className
          }),
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
      const { host, rest } = splitCompositeHostAttrs(attrs as Record<string, unknown>)
      const wrapperClass = getDataTableToolbarWrapperClasses({
        bordered: props.bordered,
        className: classNames(props.className, coerceClassValue(host.class))
      })
      const { toolbar: _toolbarSlot, 'filters-extra': _filtersExtraSlot, ...tableSlots } = slots
      const tablePass: Record<string, unknown> = {}
      for (const key of Object.keys(tableProps)) {
        tablePass[key] = (props as Record<string, unknown>)[key]
      }

      return h(
        'div',
        {
          ...host,
          class: wrapperClass,
          style: mergeStyleValues(host.style, props.style),
          'data-tiger-data-table-with-toolbar': ''
        },
        [
          renderToolbar(),
          h(
            Table as unknown as Component,
            {
              ...rest,
              ...tablePass,
              dataSource: viewRows.value,
              hiddenColumnKeys: resolvedHiddenKeys.value,
              locale: resolvedTableLocale.value,
              rowSelection: props.rowSelection
                ? { ...props.rowSelection, selectedRowKeys: selectedKeys.value }
                : undefined,
              class: classNames(
                props.tableClassName,
                props.bordered && 'border-none rounded-none shadow-none'
              ),
              onSelectionChange: handleSelectionChange,
              onPageChange: handleTablePageChange
            },
            tableSlots
          )
        ]
      )
    }
  }
})

export default DataTableWithToolbar
