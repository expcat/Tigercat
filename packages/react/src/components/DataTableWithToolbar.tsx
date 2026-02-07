import React, { useEffect, useMemo, useState } from 'react'
import {
  classNames,
  type TableToolbarProps,
  type TableToolbarFilter,
  type TableToolbarFilterValue,
  type TableToolbarAction
} from '@expcat/tigercat-core'
import { Table, type TableProps } from './Table'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { Pagination, type PaginationProps } from './Pagination'

export interface DataTableWithToolbarProps<T = Record<string, unknown>>
  extends
    Omit<TableProps<T>, 'pagination' | 'className' | 'onPageChange'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /**
   * Toolbar configuration
   */
  toolbar?: TableToolbarProps
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
   * Pagination configuration
   */
  pagination?: PaginationProps | false
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
  onSearchChange,
  onSearch,
  onFiltersChange,
  onBulkAction,
  pagination = false,
  onPageChange,
  onPageSizeChange,
  className,
  tableClassName,
  ...tableProps
}: DataTableWithToolbarProps<T>) => {
  const [internalSearch, setInternalSearch] = useState<string>(toolbar?.defaultSearchValue ?? '')
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

  useEffect(() => {
    if (toolbar?.searchValue !== undefined) {
      setInternalSearch(toolbar.searchValue ?? '')
    }
  }, [toolbar?.searchValue])

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
    const next: Record<string, TableToolbarFilterValue> = {}
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
  const hasBulkActions = Boolean(toolbar?.bulkActions && toolbar.bulkActions.length > 0)

  const selectedKeys = toolbar?.selectedKeys ?? tableProps.rowSelection?.selectedRowKeys ?? []
  const selectedCount = toolbar?.selectedCount ?? selectedKeys.length
  const bulkLabel = toolbar?.bulkActionsLabel ?? '已选择'

  const wrapperClasses = useMemo(
    () => classNames('tiger-data-table-with-toolbar flex flex-col gap-3', className),
    [className]
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

  const handleFilterSelect = (filter: TableToolbarFilter, value: TableToolbarFilterValue) => {
    const nextFilters = {
      ...resolvedFilters,
      [filter.key]: value
    }

    if (filter.value === undefined) {
      setInternalFilters((prev) => ({
        ...prev,
        [filter.key]: value
      }))
    }

    onFiltersChange?.(nextFilters)
    toolbar?.onFiltersChange?.(nextFilters)
  }

  const handleBulkAction = (action: TableToolbarAction) => {
    const keys = selectedKeys ?? []
    action.onClick?.(keys)
    onBulkAction?.(action, keys)
    toolbar?.onBulkAction?.(action, keys)
  }

  const renderToolbar = () => {
    if (!hasSearch && !hasFilters && !hasBulkActions) return null

    return (
      <div className="tiger-data-table-toolbar flex flex-wrap items-center gap-2 pb-3">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          {hasSearch ? (
            <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px] sm:max-w-[320px]">
              <Input
                type="search"
                size="sm"
                value={searchValue}
                placeholder={toolbar?.searchPlaceholder ?? '搜索'}
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
                  className="whitespace-nowrap shrink-0"
                  onClick={handleSearchSubmit}
                  disabled={!onSearch && !toolbar?.onSearch}>
                  {toolbar?.searchButtonText ?? '搜索'}
                </Button>
              ) : null}
            </div>
          ) : null}

          {hasFilters
            ? toolbar?.filters?.map((filter) => {
                const currentValue = resolvedFilters[filter.key]
                const clearable = filter.clearable !== false

                return (
                  <div
                    key={filter.key}
                    className="w-full sm:w-auto sm:min-w-[120px] sm:max-w-[180px]">
                    <Select
                      size="sm"
                      options={filter.options.map((opt) => ({
                        label: opt.label,
                        value: opt.value
                      }))}
                      value={currentValue ?? undefined}
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
        </div>

        {hasBulkActions ? (
          <div className="flex items-center gap-2 flex-wrap ml-auto shrink-0">
            {selectedCount > 0 ? (
              <span className="text-sm text-[var(--tiger-text-muted,#6b7280)]">
                {bulkLabel} {selectedCount} 项
              </span>
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
      </div>
    )
  }

  const showPagination = pagination && typeof pagination === 'object'

  return (
    <div className={wrapperClasses} data-tiger-data-table-with-toolbar>
      {renderToolbar()}
      <Table {...tableProps} pagination={false} className={tableClassName} />
      {showPagination ? (
        <Pagination {...pagination} onChange={onPageChange} onPageSizeChange={onPageSizeChange} />
      ) : null}
    </div>
  )
}

export default DataTableWithToolbar
