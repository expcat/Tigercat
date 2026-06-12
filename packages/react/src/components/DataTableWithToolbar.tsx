import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getImmediateTigerLocale,
  getTableLabels,
  isLazyTigerLocale,
  mergeTigerLocale,
  resolveTigerLocale,
  type TableToolbarProps,
  type TableToolbarFilter,
  type TableToolbarFilterRenderContext,
  type TableToolbarFiltersExtraContext,
  type TableToolbarFilterValue,
  type TableToolbarAction,
  type TigerLocale
} from '@expcat/tigercat-core'
import { Table, type TableProps } from './Table'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { Popover } from './Popover'
import { Checkbox } from './Checkbox'
import { useTigerConfig } from './ConfigProvider'

export interface ReactTableToolbarFilterRenderContext
  extends Omit<TableToolbarFilterRenderContext, 'filter'> {
  filter: ReactTableToolbarFilter
}

export interface ReactTableToolbarFiltersExtraContext extends TableToolbarFiltersExtraContext {}

export interface ReactTableToolbarFilter extends Omit<TableToolbarFilter, 'render'> {
  render?: (context: ReactTableToolbarFilterRenderContext) => React.ReactNode
}

export interface ReactTableToolbarProps extends Omit<TableToolbarProps, 'filters' | 'filtersExtra'> {
  filters?: ReactTableToolbarFilter[]
  filtersExtra?:
    | React.ReactNode
    | ((context: ReactTableToolbarFiltersExtraContext) => React.ReactNode)
}

export interface DataTableWithToolbarProps<T = Record<string, unknown>>
  extends
    Omit<TableProps<T>, 'className' | 'onPageChange'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /**
   * Toolbar configuration
   */
  toolbar?: ReactTableToolbarProps
  /**
   * Search change handler
   */
  onSearchChange?: (value: string) => void
  /**
   * Search submit handler
   */
  onSearch?: (value: string) => void
  /**
   * Filters change handler
   */
  onFiltersChange?: (filters: Record<string, TableToolbarFilterValue>) => void
  /**
   * Bulk action handler
   */
  onBulkAction?: (action: TableToolbarAction, selectedKeys: (string | number)[]) => void
  /**
   * Page change handler
   */
  onPageChange?: (current: number, pageSize: number) => void
  /**
   * Page size change handler
   */
  onPageSizeChange?: (current: number, pageSize: number) => void
  /**
   * Wrapper class name
   */
  className?: string
  /**
   * Table class name
   */
  tableClassName?: string
}

export const DataTableWithToolbar = <T extends Record<string, unknown> = Record<string, unknown>>({
  toolbar,
  locale,
  labels,
  onSearchChange,
  onSearch,
  onFiltersChange,
  onBulkAction,
  hiddenColumnKeys,
  defaultHiddenColumnKeys,
  onHiddenColumnsChange,
  pagination = false,
  onPageChange,
  onPageSizeChange,
  className,
  tableClassName,
  ...tableProps
}: DataTableWithToolbarProps<T>) => {
  const config = useTigerConfig()
  const previousPageSizeRef = useRef(
    pagination && typeof pagination === 'object'
      ? (pagination.pageSize ?? pagination.defaultPageSize ?? 10)
      : undefined
  )
  const [internalSearch, setInternalSearch] = useState<string>(toolbar?.defaultSearchValue ?? '')
  const [internalHiddenKeys, setInternalHiddenKeys] = useState<string[]>(
    defaultHiddenColumnKeys ?? hiddenColumnKeys ?? []
  )
  const [internalFilters, setInternalFilters] = useState<Record<string, TableToolbarFilterValue>>(
    () => {
      const initial: Record<string, TableToolbarFilterValue> = {}
      toolbar?.filters?.forEach((filter) => {
        if (filter.value === undefined) {
          initial[filter.key] = filter.defaultValue ?? null
        }
      })
      return initial
    }
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
    if (toolbar?.searchValue !== undefined) {
      setInternalSearch(toolbar.searchValue ?? '')
    }
  }, [toolbar?.searchValue])

  useEffect(() => {
    if (hiddenColumnKeys !== undefined) {
      setInternalHiddenKeys(hiddenColumnKeys)
    }
  }, [hiddenColumnKeys])

  useEffect(() => {
    if (pagination && typeof pagination === 'object') {
      previousPageSizeRef.current = pagination.pageSize ?? pagination.defaultPageSize ?? 10
    }
  }, [pagination])

  useEffect(() => {
    const filters = toolbar?.filters
    if (!filters) return
    setInternalFilters((prev) => {
      const next = { ...prev }
      filters.forEach((filter) => {
        if (filter.value === undefined && !(filter.key in next)) {
          next[filter.key] = filter.defaultValue ?? null
        }
      })
      return next
    })
  }, [toolbar?.filters])

  const searchValue = toolbar?.searchValue !== undefined ? toolbar.searchValue : internalSearch

  const resolvedFilters = useMemo<Record<string, TableToolbarFilterValue>>(() => {
    const next: Record<string, TableToolbarFilterValue> = { ...internalFilters }
    toolbar?.filters?.forEach((filter) => {
      next[filter.key] =
        filter.value !== undefined
          ? filter.value
          : (internalFilters[filter.key] ?? filter.defaultValue ?? null)
    })
    return next
  }, [toolbar?.filters, internalFilters])

  const hasSearch = Boolean(
    toolbar &&
    (toolbar.searchPlaceholder ||
      toolbar.searchValue !== undefined ||
      toolbar.defaultSearchValue !== undefined ||
      toolbar.showSearchButton ||
      toolbar.onSearchChange ||
      toolbar.onSearch ||
      onSearchChange ||
      onSearch)
  )
  const hasFilters = Boolean(toolbar?.filters && toolbar.filters.length > 0)
  const hasFiltersExtra = Boolean(toolbar?.filtersExtra)
  const hasBulkActions = Boolean(toolbar?.bulkActions && toolbar.bulkActions.length > 0)
  const hasColumnSettings = Boolean(toolbar?.showColumnSettings)

  const resolvedHiddenKeys = hiddenColumnKeys ?? internalHiddenKeys

  const handleHiddenColumnsChange = (nextHiddenKeys: string[]) => {
    if (hiddenColumnKeys === undefined) {
      setInternalHiddenKeys(nextHiddenKeys)
    }
    onHiddenColumnsChange?.(nextHiddenKeys)
  }

  const handleToggleColumnVisibility = (columnKey: string, visible: boolean) => {
    const nextHiddenKeys = visible
      ? resolvedHiddenKeys.filter((key) => key !== columnKey)
      : [...resolvedHiddenKeys, columnKey]
    handleHiddenColumnsChange(nextHiddenKeys)
  }

  const { bordered = false, ...remainingTableProps } = tableProps

  const selectedKeys = toolbar?.selectedKeys ?? tableProps.rowSelection?.selectedRowKeys ?? []
  const selectedCount = toolbar?.selectedCount ?? selectedKeys.length
  const bulkLabel = toolbar?.bulkActionsLabel ?? tableLabels.selectedText

  const wrapperClasses = useMemo(
    () =>
      classNames(
        'tiger-data-table-with-toolbar flex flex-col',
        bordered
          ? 'border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] overflow-hidden bg-[var(--tiger-surface,#ffffff)] shadow-sm'
          : 'gap-3.5',
        className
      ),
    [className, bordered]
  )

  const handleSearchChange = (value: string) => {
    if (toolbar?.searchValue === undefined) {
      setInternalSearch(value)
    }
    onSearchChange?.(value)
    toolbar?.onSearchChange?.(value)
  }

  const handleSearchSubmit = () => {
    onSearch?.(searchValue ?? '')
    toolbar?.onSearch?.(searchValue ?? '')
  }

  const setFilterValue = (
    key: string,
    value: TableToolbarFilterValue,
    filter?: ReactTableToolbarFilter
  ) => {
    const nextFilters = {
      ...resolvedFilters,
      [key]: value
    }

    if (!filter || filter.value === undefined) {
      setInternalFilters((prev) => ({
        ...prev,
        [key]: value
      }))
    }

    onFiltersChange?.(nextFilters)
    toolbar?.onFiltersChange?.(nextFilters)
  }

  const handleFilterSelect = (
    filter: ReactTableToolbarFilter,
    value: TableToolbarFilterValue
  ) => {
    setFilterValue(filter.key, value, filter)
  }

  const handleBulkAction = (action: TableToolbarAction) => {
    const keys = selectedKeys ?? []
    action.onClick?.(keys)
    onBulkAction?.(action, keys)
    toolbar?.onBulkAction?.(action, keys)
  }

  const handleTablePageChange = ({ current, pageSize }: { current: number; pageSize: number }) => {
    onPageChange?.(current, pageSize)
    if (previousPageSizeRef.current !== undefined && previousPageSizeRef.current !== pageSize) {
      onPageSizeChange?.(current, pageSize)
    }
    previousPageSizeRef.current = pageSize
  }

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
            {tableProps.columns.map((column) => {
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
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Button>
      </Popover>
    )
  }

  const renderToolbar = () => {
    if (!hasSearch && !hasFilters && !hasFiltersExtra && !hasBulkActions && !hasColumnSettings) {
      return null
    }

    const filtersExtraContext: ReactTableToolbarFiltersExtraContext = {
      filters: resolvedFilters,
      setFilter: (key: string, value: TableToolbarFilterValue) => setFilterValue(key, value)
    }
    const filtersExtra =
      typeof toolbar?.filtersExtra === 'function'
        ? toolbar.filtersExtra(filtersExtraContext)
        : toolbar?.filtersExtra

    return (
      <div
        className={classNames(
          'tiger-data-table-toolbar flex flex-wrap items-center gap-3',
          bordered
            ? 'bg-[var(--tiger-surface-muted,#f9fafb)] dark:bg-gray-800/10 px-4 py-3.5 border-b border-[var(--tiger-border,#e5e7eb)]'
            : 'bg-[var(--tiger-surface-muted,#f9fafb)]/80 dark:bg-gray-800/30 px-4 py-3.5 border border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-md,0.5rem)] shadow-sm'
        )}
        role="toolbar"
        aria-label={tableLabels.toolbarAriaLabel}>
        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
          {hasSearch ? (
            <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[220px] sm:max-w-[320px]">
              <Input
                type="search"
                size="sm"
                value={searchValue}
                placeholder={toolbar?.searchPlaceholder ?? tableLabels.searchPlaceholder}
                prefix={
                  <svg
                    className="w-3.5 h-3.5 text-[var(--tiger-text-secondary,#6b7280)] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
                onChange={(event) => handleSearchChange(String(event.currentTarget.value))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearchSubmit()
                  }
                }}
              />
              {(toolbar?.showSearchButton ?? true) ? (
                <Button
                  size="sm"
                  variant="primary"
                  className="whitespace-nowrap shrink-0 rounded-[var(--tiger-radius-md,0.5rem)] px-3"
                  onClick={handleSearchSubmit}
                  disabled={!onSearch && !toolbar?.onSearch}>
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
                    <div key={filter.key} className="w-full sm:w-auto">
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
                    className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[180px]">
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
                      clearable={clearable}
                      onChange={(value) => {
                        handleFilterSelect(filter, value ?? null)
                      }}
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--tiger-primary,#2563eb)]/10 text-[var(--tiger-primary,#2563eb)] text-xs font-medium border border-[var(--tiger-primary,#2563eb)]/15 shrink-0 transition-all duration-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--tiger-primary,#2563eb)] animate-pulse" />
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
    <div className={wrapperClasses} data-tiger-data-table-with-toolbar>
      {renderToolbar()}
      <Table
        {...remainingTableProps}
        locale={locale}
        labels={labels}
        bordered={bordered}
        hiddenColumnKeys={resolvedHiddenKeys}
        pagination={pagination}
        className={classNames(tableClassName, bordered && 'border-none rounded-none shadow-none')}
        onPageChange={handleTablePageChange}
      />
    </div>
  )
}

export default DataTableWithToolbar
