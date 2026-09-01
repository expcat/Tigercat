import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  applyToolbarLocalView,
  canSubmitToolbarSearch,
  classNames,
  getDataTableToolbarBarClasses,
  getDataTableToolbarWrapperClasses,
  getImmediateTigerLocale,
  getTableLabels,
  isLazyTigerLocale,
  isToolbarSearchRemote,
  mergeTigerLocale,
  resolveTigerLocale,
  resolveToolbarFilterMap,
  resolveToolbarPageChange,
  resolveToolbarSelectedKeys,
  seedToolbarFilterState,
  splitCompositeHostAttrs,
  toggleHiddenColumnKey,
  toolbarHasSearch,
  type TableToolbarAction,
  type TableToolbarFilterValue,
  type TableToolbarFiltersExtraContext,
  type TableToolbarProps,
  type TableToolbarRenderContext,
  type TigerLocale
} from '@expcat/tigercat-core'
import { Table, type TableProps } from './Table'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { Popover } from './Popover'
import { Checkbox } from './Checkbox'
import { Icon } from './Icon'
import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'

export interface ReactTableToolbarFilterRenderContext {
  filter: ReactTableToolbarFilter
  value: TableToolbarFilterValue
  filters: Record<string, TableToolbarFilterValue>
  setValue: (value: TableToolbarFilterValue) => void
  setFilter: (key: string, value: TableToolbarFilterValue) => void
}

export interface ReactTableToolbarFiltersExtraContext extends TableToolbarFiltersExtraContext {}

export interface ReactTableToolbarFilter extends Omit<
  NonNullable<TableToolbarProps['filters']>[number],
  'render'
> {
  render?: (context: ReactTableToolbarFilterRenderContext) => React.ReactNode
}

export interface ReactTableToolbarRenderContext extends TableToolbarRenderContext {}

export interface ReactTableToolbarProps extends Omit<
  TableToolbarProps,
  'filters' | 'filtersExtra' | 'render'
> {
  filters?: ReactTableToolbarFilter[]
  filtersExtra?:
    React.ReactNode | ((context: ReactTableToolbarFiltersExtraContext) => React.ReactNode)
  /**
   * Full toolbar replacement. When provided, the built-in toolbar region
   * (including its container and `role="toolbar"`) is not rendered.
   */
  render?: React.ReactNode | ((context: ReactTableToolbarRenderContext) => React.ReactNode)
}

export interface DataTableWithToolbarProps<T = Record<string, unknown>> extends Omit<
  TableProps<T>,
  'className' | 'onPageChange' | 'style'
> {
  /**
   * Toolbar configuration. Business callbacks (search/filters/bulk actions)
   * are configured here via `toolbar.onSearchChange`, `toolbar.onSearch`,
   * `toolbar.onFiltersChange` and `toolbar.onBulkAction`.
   */
  toolbar?: ReactTableToolbarProps
  onPageChange?: (page: { current: number; pageSize: number }) => void
  onPageSizeChange?: (page: { current: number; pageSize: number }) => void
  className?: string
  tableClassName?: string
  id?: string
  style?: React.CSSProperties
}

export const DataTableWithToolbar = <T extends Record<string, unknown> = Record<string, unknown>>({
  toolbar,
  locale,
  labels,
  hiddenColumnKeys,
  defaultHiddenColumnKeys,
  onHiddenColumnKeysChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  className,
  tableClassName,
  rowSelection,
  dataSource,
  columns,
  onSelectionChange,
  bordered = false,
  id,
  style,
  ...rest
}: DataTableWithToolbarProps<T>) => {
  const config = useTigerConfig()
  const { host: hostAttrs, rest: tableRest } = splitCompositeHostAttrs({
    id,
    style,
    ...(rest as Record<string, unknown>)
  })
  const previousPageSizeRef = useRef(
    pagination && typeof pagination === 'object'
      ? (pagination.pageSize ?? pagination.defaultPageSize ?? 10)
      : undefined
  )
  const [searchValue, setSearchValue] = useControlledState({
    value: toolbar?.searchValue,
    defaultValue: toolbar?.defaultSearchValue ?? '',
    onChange: (value) => toolbar?.onSearchChange?.(value)
  })
  const [resolvedHiddenKeys, setResolvedHiddenKeys] = useControlledState({
    value: hiddenColumnKeys,
    defaultValue: defaultHiddenColumnKeys ?? [],
    onChange: onHiddenColumnKeysChange
  })
  const [internalFilters, setInternalFilters] = useState<Record<string, TableToolbarFilterValue>>(
    () => seedToolbarFilterState({}, toolbar?.filters)
  )
  const [extraFilterKeys, setExtraFilterKeys] = useState<string[]>([])
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<(string | number)[]>(
    () => rowSelection?.defaultSelectedRowKeys ?? []
  )
  const immediateTableLocale = useMemo(
    () => (locale ? getImmediateTigerLocale(locale) : undefined),
    [locale]
  )
  const [resolvedTableLocale, setResolvedTableLocale] = useState<Partial<TigerLocale> | undefined>(
    immediateTableLocale
  )

  useEffect(() => {
    let active = true
    setResolvedTableLocale(immediateTableLocale)

    if (locale && isLazyTigerLocale(locale)) {
      resolveTigerLocale(locale)
        .then((nextLocale) => {
          if (active) setResolvedTableLocale(nextLocale)
        })
        .catch(() => {
          if (active) setResolvedTableLocale(immediateTableLocale)
        })
    }

    return () => {
      active = false
    }
  }, [locale, immediateTableLocale])

  const tableLocale = useMemo(
    () => mergeTigerLocale(config.locale, resolvedTableLocale),
    [config.locale, resolvedTableLocale]
  )
  const tableLabels = useMemo(() => getTableLabels(tableLocale, labels), [labels, tableLocale])

  useEffect(() => {
    if (pagination && typeof pagination === 'object') {
      previousPageSizeRef.current = pagination.pageSize ?? pagination.defaultPageSize ?? 10
    }
  }, [pagination])

  useEffect(() => {
    setInternalFilters((prev) => seedToolbarFilterState(prev, toolbar?.filters))
  }, [toolbar?.filters])

  const resolvedFilters = useMemo(
    () => resolveToolbarFilterMap(toolbar?.filters, internalFilters, extraFilterKeys),
    [toolbar?.filters, internalFilters, extraFilterKeys]
  )

  const hasSearch = toolbarHasSearch(toolbar)
  const hasFilters = Boolean(toolbar?.filters && toolbar.filters.length > 0)
  const hasFiltersExtra = Boolean(toolbar?.filtersExtra)
  const hasBulkActions = Boolean(toolbar?.bulkActions && toolbar.bulkActions.length > 0)
  const hasColumnSettings = Boolean(toolbar?.showColumnSettings)
  const sourceRows = (dataSource ?? []) as T[]
  const viewRows = useMemo(
    () =>
      isToolbarSearchRemote(toolbar)
        ? sourceRows
        : applyToolbarLocalView(sourceRows, columns, searchValue ?? '', resolvedFilters),
    [columns, resolvedFilters, searchValue, sourceRows, toolbar]
  )

  const selectedKeys = resolveToolbarSelectedKeys(
    toolbar?.selectedKeys,
    rowSelection?.selectedRowKeys,
    internalSelectedKeys
  )
  const selectedCount = toolbar?.selectedCount ?? selectedKeys.length
  const bulkLabel = toolbar?.bulkActionsLabel ?? tableLabels.selectedText

  const handleHiddenColumnsChange = (nextHiddenKeys: string[]) => {
    setResolvedHiddenKeys(nextHiddenKeys)
  }

  const handleToggleColumnVisibility = (columnKey: string, visible: boolean) => {
    handleHiddenColumnsChange(toggleHiddenColumnKey(resolvedHiddenKeys, columnKey, visible))
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  const handleSearchSubmit = () => {
    toolbar?.onSearch?.(searchValue ?? '')
  }

  const setFilterValue = (
    key: string,
    value: TableToolbarFilterValue,
    filter?: ReactTableToolbarFilter
  ) => {
    const inDefs = toolbar?.filters?.some((item) => item.key === key)
    if (!inDefs) {
      setExtraFilterKeys((prev) => (prev.includes(key) ? prev : [...prev, key]))
    }
    if (!filter || filter.value === undefined) {
      setInternalFilters((prev) => ({
        ...prev,
        [key]: value
      }))
    }
    toolbar?.onFiltersChange?.(
      resolveToolbarFilterMap(
        toolbar?.filters,
        { ...internalFilters, [key]: value },
        inDefs
          ? extraFilterKeys
          : extraFilterKeys.includes(key)
            ? extraFilterKeys
            : [...extraFilterKeys, key]
      )
    )
  }

  const handleSelectionChange = (keys: (string | number)[]) => {
    if (toolbar?.selectedKeys === undefined && rowSelection?.selectedRowKeys === undefined) {
      setInternalSelectedKeys(keys)
    }
    onSelectionChange?.(keys)
  }

  const handleBulkAction = (action: TableToolbarAction) => {
    action.onClick?.(selectedKeys)
    toolbar?.onBulkAction?.(action, selectedKeys)
  }

  const handleTablePageChange = (page: { current: number; pageSize: number }) => {
    const result = resolveToolbarPageChange(page, previousPageSizeRef.current)
    previousPageSizeRef.current = page.pageSize
    if (result.kind === 'size') onPageSizeChange?.(page)
    else onPageChange?.(page)
  }

  const toolbarContext = (): ReactTableToolbarRenderContext => ({
    searchValue: searchValue ?? '',
    setSearch: handleSearchChange,
    submitSearch: handleSearchSubmit,
    filters: resolvedFilters,
    setFilter: (key: string, value: TableToolbarFilterValue) => setFilterValue(key, value),
    selectedKeys,
    selectedCount,
    dataSource: viewRows,
    hiddenColumnKeys: resolvedHiddenKeys,
    setHiddenColumnKeys: handleHiddenColumnsChange
  })

  const renderColumnSettings = () => {
    const lockedKeys = new Set(toolbar?.columnSettings?.lockedColumnKeys ?? [])
    const panelTitle = toolbar?.columnSettings?.title ?? tableLabels.columnSettingsText

    return (
      <Popover
        trigger="click"
        placement="bottom-end"
        titleContent={panelTitle}
        contentContent={
          <div className="flex flex-col gap-2 min-w-[160px]">
            {columns.map((column) => {
              const locked = lockedKeys.has(column.key) || column.hideable === false
              return (
                <Checkbox
                  key={column.key}
                  size="sm"
                  checked={!resolvedHiddenKeys.includes(column.key)}
                  disabled={locked}
                  onChange={(checked) => handleToggleColumnVisibility(column.key, checked)}>
                  {column.title}
                </Checkbox>
              )
            })}
          </div>
        }>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 px-2"
          aria-label={tableLabels.columnSettingsAriaLabel}>
          <Icon name="settings" className="w-3.5 h-3.5" />
        </Button>
      </Popover>
    )
  }

  const renderToolbar = () => {
    if (toolbar?.render !== undefined) {
      return (
        <>
          {typeof toolbar.render === 'function' ? toolbar.render(toolbarContext()) : toolbar.render}
        </>
      )
    }

    if (!hasSearch && !hasFilters && !hasFiltersExtra && !hasBulkActions && !hasColumnSettings) {
      return null
    }

    const filtersExtraContext: ReactTableToolbarFiltersExtraContext = {
      filters: resolvedFilters,
      setFilter: (key: string, value: TableToolbarFilterValue) => setFilterValue(key, value),
      dataSource: viewRows,
      selectedKeys,
      hiddenColumnKeys: resolvedHiddenKeys
    }
    const filtersExtra =
      typeof toolbar?.filtersExtra === 'function'
        ? toolbar.filtersExtra(filtersExtraContext)
        : toolbar?.filtersExtra

    return (
      <div
        className={getDataTableToolbarBarClasses({
          bordered,
          className: toolbar?.className
        })}
        style={toolbar?.style as React.CSSProperties | undefined}
        role="toolbar"
        aria-label={tableLabels.toolbarAriaLabel}>
        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
          {hasSearch ? (
            <div
              className={classNames(
                'flex items-center gap-2',
                toolbar?.searchClassName ?? 'w-full sm:w-auto sm:min-w-[220px] sm:max-w-[320px]'
              )}>
              <Input
                type="search"
                size="sm"
                value={searchValue}
                placeholder={toolbar?.searchPlaceholder ?? tableLabels.searchPlaceholder}
                aria-label={toolbar?.searchPlaceholder ?? tableLabels.searchPlaceholder}
                prefix={
                  <Icon
                    name="search"
                    className="w-3.5 h-3.5 text-[var(--tiger-text-secondary,#6b7280)]"
                  />
                }
                onChange={(event) => handleSearchChange(String(event.currentTarget.value))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearchSubmit()
                }}
              />
              {(toolbar?.showSearchButton ?? true) ? (
                <Button
                  size="sm"
                  variant="primary"
                  className="whitespace-nowrap shrink-0 rounded-[var(--tiger-radius-md,0.5rem)] px-3"
                  onClick={handleSearchSubmit}
                  disabled={!canSubmitToolbarSearch(toolbar)}>
                  {toolbar?.searchButtonText ?? tableLabels.searchButtonText}
                </Button>
              ) : null}
            </div>
          ) : null}

          {hasFilters
            ? toolbar?.filters?.map((filter) => {
                const currentValue = resolvedFilters[filter.key]
                const clearable = filter.clearable !== false

                if (filter.render) {
                  return (
                    <div
                      key={filter.key}
                      className={filter.itemClass ?? 'w-full sm:w-auto'}
                      style={filter.itemStyle as React.CSSProperties | undefined}>
                      {filter.render({
                        filter,
                        value: currentValue,
                        filters: resolvedFilters,
                        setValue: (value: TableToolbarFilterValue) =>
                          setFilterValue(filter.key, value, filter),
                        setFilter: (key: string, value: TableToolbarFilterValue) =>
                          setFilterValue(key, value)
                      })}
                    </div>
                  )
                }

                return (
                  <div
                    key={filter.key}
                    className={
                      filter.itemClass ?? 'w-full sm:w-auto sm:min-w-[120px] sm:max-w-[180px]'
                    }
                    style={filter.itemStyle as React.CSSProperties | undefined}>
                    <Select
                      size="sm"
                      options={(filter.options ?? []).map((opt) => ({
                        label: opt.label,
                        value: opt.value
                      }))}
                      value={
                        typeof currentValue === 'string' || typeof currentValue === 'number'
                          ? currentValue
                          : undefined
                      }
                      placeholder={filter.placeholder ?? filter.label}
                      aria-label={filter.label}
                      clearable={clearable}
                      onChange={(value) => setFilterValue(filter.key, value ?? null, filter)}
                    />
                  </div>
                )
              })
            : null}
          {filtersExtra}
        </div>

        {hasBulkActions ? (
          <div className="flex items-center gap-2.5 flex-wrap ml-auto shrink-0">
            {selectedCount > 0 ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--tiger-primary,#2563eb)]/10 text-[var(--tiger-primary,#2563eb)] text-xs font-medium border border-[var(--tiger-primary,#2563eb)]/15 shrink-0"
                aria-live="polite">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--tiger-primary,#2563eb)] animate-pulse motion-reduce:animate-none" />
                <span>
                  {bulkLabel} {selectedCount} {tableLabels.selectedItemsText}
                </span>
              </div>
            ) : null}
            {toolbar?.bulkActions?.map((action) => (
              <Button
                key={action.key}
                size="sm"
                variant={action.variant ?? 'outline'}
                disabled={action.disabled || selectedCount === 0}
                onClick={() => handleBulkAction(action)}>
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}

        {hasColumnSettings ? (
          <div className={classNames('shrink-0', !hasBulkActions && 'ml-auto')}>
            {renderColumnSettings()}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={getDataTableToolbarWrapperClasses({ bordered, className })}
      data-tiger-data-table-with-toolbar
      {...hostAttrs}>
      {renderToolbar()}
      <Table
        {...(tableRest as Omit<TableProps<T>, 'columns' | 'dataSource'>)}
        columns={columns}
        dataSource={viewRows}
        locale={resolvedTableLocale}
        labels={labels}
        bordered={bordered}
        rowSelection={rowSelection ? { ...rowSelection, selectedRowKeys: selectedKeys } : undefined}
        hiddenColumnKeys={resolvedHiddenKeys}
        pagination={pagination}
        className={classNames(tableClassName, bordered && 'border-none rounded-none shadow-none')}
        onSelectionChange={handleSelectionChange}
        onPageChange={handleTablePageChange}
      />
    </div>
  )
}

export default DataTableWithToolbar
