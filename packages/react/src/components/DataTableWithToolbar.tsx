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
import { Dropdown } from './Dropdown'
import { DropdownMenu } from './DropdownMenu'
import { DropdownItem } from './DropdownItem'
import { Button } from './Button'
import { Space } from './Space'
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

const resolveFilterLabel = (filter: TableToolbarFilter, value: TableToolbarFilterValue): string => {
  const option = filter.options.find((item) => item.value === value)
  if (option) return `${filter.label}: ${option.label}`
  if (value !== null && value !== undefined && value !== '') {
    return `${filter.label}: ${String(value)}`
  }
  return filter.placeholder ?? filter.label
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
    () => classNames('tiger-data-table-with-toolbar', 'flex', 'flex-col', 'gap-3', className),
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
      <div
        className={classNames(
          'tiger-data-table-toolbar',
          'flex',
          'flex-wrap',
          'items-center',
          'justify-between',
          'gap-3',
          'pb-2'
        )}>
        <Space size="sm" align="center" wrap>
          {hasSearch ? (
            <div className="flex items-center gap-2">
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
                  className="whitespace-nowrap"
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
                const triggerLabel = resolveFilterLabel(filter, currentValue)
                const clearable = filter.clearable !== false
                const clearLabel = filter.clearLabel ?? '全部'
                const isActive =
                  currentValue !== null && currentValue !== undefined && currentValue !== ''

                return (
                  <Dropdown key={filter.key} trigger="click">
                    <Button
                      size="sm"
                      variant={isActive ? 'secondary' : 'outline'}
                      className="whitespace-nowrap">
                      {triggerLabel}
                    </Button>
                    <DropdownMenu>
                      {clearable ? (
                        <DropdownItem onClick={() => handleFilterSelect(filter, null)}>
                          {clearLabel}
                        </DropdownItem>
                      ) : null}
                      {filter.options.map((option) => (
                        <DropdownItem
                          key={String(option.value)}
                          onClick={() => handleFilterSelect(filter, option.value)}>
                          {option.label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                )
              })
            : null}
        </Space>

        {hasBulkActions ? (
          <Space size="sm" align="center" wrap>
            <span className="text-sm text-[var(--tiger-text-muted,#6b7280)]">
              {bulkLabel} {selectedCount} 项
            </span>
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
          </Space>
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
        <div className="pt-2">
          <Pagination {...pagination} onChange={onPageChange} onPageSizeChange={onPageSizeChange} />
        </div>
      ) : null}
    </div>
  )
}

export default DataTableWithToolbar
