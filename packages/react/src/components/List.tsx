import React, { useMemo, useState } from 'react'
import { Button } from './Button'
import { Select } from './Select'
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
  getSpinnerSVG,
  getLoadingOverlaySpinnerClasses,
  type ListSize,
  type ListBorderStyle,
  type ListItemLayout,
  type ListItem,
  type ListPaginationConfig
} from '@tigercat/core'

const spinnerSvg = getSpinnerSVG('spinner')

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <svg
    className={getLoadingOverlaySpinnerClasses()}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={spinnerSvg.viewBox}>
    {spinnerSvg.elements.map((el, index) => {
      if (el.type === 'circle') return <circle key={index} {...el.attrs} />
      if (el.type === 'path') return <path key={index} {...el.attrs} />
      return null
    })}
  </svg>
)

export interface ListProps<
  T extends ListItem = ListItem
> extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * List data source
   */
  dataSource?: T[]
  /**
   * List size
   * @default 'md'
   */
  size?: ListSize
  /**
   * Border style
   * @default 'divided'
   */
  bordered?: ListBorderStyle
  /**
   * Loading state
   * @default false
   */
  loading?: boolean
  /**
   * Empty state text
   * @default 'No data'
   */
  emptyText?: string
  /**
   * Whether to show split line between items
   * @default true
   */
  split?: boolean
  /**
   * Item layout
   * @default 'horizontal'
   */
  itemLayout?: ListItemLayout
  /**
   * List header content
   */
  header?: React.ReactNode
  /**
   * List footer content
   */
  footer?: React.ReactNode
  /**
   * Pagination configuration, set to false to disable
   * @default false
   */
  pagination?: ListPaginationConfig | false
  /**
   * Grid configuration
   */
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
  /**
   * Function to get item key
   */
  rowKey?: string | ((item: T, index: number) => string | number)
  /**
   * Whether items are hoverable
   * @default false
   */
  hoverable?: boolean
  /**
   * Custom render function for list items
   */
  renderItem?: (item: T, index: number) => React.ReactNode
  /**
   * Item click handler
   */
  onItemClick?: (item: T, index: number) => void
  /**
   * Page change handler
   */
  onPageChange?: (page: { current: number; pageSize: number }) => void
  className?: string
}

export const List = <T extends ListItem = ListItem>({
  dataSource = [],
  size = 'md',
  bordered = 'divided',
  loading = false,
  emptyText = 'No data',
  split = true,
  itemLayout = 'horizontal',
  header,
  footer,
  pagination = false,
  grid,
  rowKey = 'key',
  hoverable = false,
  renderItem,
  onItemClick,
  onPageChange,
  className,
  ...divProps
}: ListProps<T>) => {
  const [currentPage, setCurrentPage] = useState(
    pagination && typeof pagination === 'object' ? pagination.current || 1 : 1
  )

  const [currentPageSize, setCurrentPageSize] = useState(
    pagination && typeof pagination === 'object' ? pagination.pageSize || 10 : 10
  )

  // Paginated data
  const paginatedData = useMemo(() => {
    if (pagination === false) {
      return dataSource
    }

    return paginateData(dataSource, currentPage, currentPageSize)
  }, [dataSource, currentPage, currentPageSize, pagination])

  // Pagination info
  const paginationInfo = useMemo(() => {
    if (pagination === false) {
      return null
    }

    const total = dataSource.length
    return calculatePagination(total, currentPage, currentPageSize)
  }, [dataSource.length, currentPage, currentPageSize, pagination])

  // List classes
  const listClasses = useMemo(() => {
    return classNames(getListClasses(bordered), listSizeClasses[size], className)
  }, [bordered, size, className])

  // Grid classes
  const gridClasses = useMemo(() => {
    if (!grid) return ''

    return classNames(
      listGridContainerClasses,
      getGridColumnClasses(grid.column, grid.xs, grid.sm, grid.md, grid.lg, grid.xl, grid.xxl)
    )
  }, [grid])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    onPageChange?.({ current: page, pageSize: currentPageSize })
  }

  const handlePageSizeChange = (pageSize: number) => {
    setCurrentPageSize(pageSize)
    setCurrentPage(1)
    onPageChange?.({ current: 1, pageSize })
  }

  const handleItemClick = (item: T, index: number) => {
    onItemClick?.(item, index)
  }

  const getItemKey = (item: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(item, index)
    }
    return (item[rowKey] as string | number) || index
  }

  const renderListHeader = () => {
    if (!header) return null

    return <div className={getListHeaderFooterClasses(size, false)}>{header}</div>
  }

  const renderListFooter = () => {
    if (!footer) return null

    return <div className={getListHeaderFooterClasses(size, true)}>{footer}</div>
  }

  const renderDefaultListItem = (item: T, _index: number) => {
    const itemContent: React.ReactNode[] = []

    // Meta section (avatar + content)
    const metaContent: React.ReactNode[] = []

    if (item.avatar) {
      metaContent.push(
        <div key="avatar" className={listItemAvatarClasses}>
          {typeof item.avatar === 'string' ? (
            <img
              src={item.avatar}
              alt={item.title || 'Avatar'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            (item.avatar as React.ReactNode)
          )}
        </div>
      )
    }

    const contentChildren: React.ReactNode[] = []
    if (item.title) {
      contentChildren.push(
        <div key="title" className={listItemTitleClasses}>
          {item.title}
        </div>
      )
    }
    if (item.description) {
      contentChildren.push(
        <div key="description" className={listItemDescriptionClasses}>
          {item.description}
        </div>
      )
    }

    if (contentChildren.length > 0) {
      metaContent.push(
        <div key="content" className={listItemContentClasses}>
          {contentChildren}
        </div>
      )
    }

    if (metaContent.length > 0) {
      itemContent.push(
        <div key="meta" className={listItemMetaClasses}>
          {metaContent}
        </div>
      )
    }

    // Extra content
    if (item.extra) {
      itemContent.push(
        <div key="extra" className={listItemExtraClasses}>
          {item.extra as React.ReactNode}
        </div>
      )
    }

    return itemContent
  }

  const renderListItem = (item: T, index: number) => {
    const key = getItemKey(item, index)
    const itemClasses = getListItemClasses(
      size,
      itemLayout,
      split && bordered === 'divided' && !grid,
      hoverable
    )

    const clickable = typeof onItemClick === 'function'
    const handleClick = clickable ? () => handleItemClick(item, index) : undefined
    const handleKeyDown = clickable
      ? (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleItemClick(item, index)
          }
        }
      : undefined

    return (
      <div
        key={key}
        className={classNames(itemClasses, clickable && 'cursor-pointer')}
        role="listitem"
        tabIndex={clickable ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}>
        {renderItem ? renderItem(item, index) : renderDefaultListItem(item, index)}
      </div>
    )
  }

  const renderListItems = () => {
    if (loading) {
      return null
    }

    if (paginatedData.length === 0) {
      return (
        <div className={listEmptyStateClasses} role="status" aria-live="polite">
          {emptyText}
        </div>
      )
    }

    const items = paginatedData.map((item, index) => renderListItem(item, index))

    if (grid) {
      const gutter = grid.gutter
      return (
        <div
          className={gridClasses}
          style={gutter ? ({ gap: `${gutter}px` } as React.CSSProperties) : undefined}>
          {items}
        </div>
      )
    }

    return items
  }

  const renderPagination = () => {
    if (pagination === false || !paginationInfo) {
      return null
    }

    const { totalPages, startIndex, endIndex, hasNext, hasPrev } = paginationInfo
    const total = dataSource.length
    const paginationConfig = pagination as ListPaginationConfig

    return (
      <div className={listPaginationContainerClasses}>
        {/* Total info */}
        {paginationConfig.showTotal !== false && (
          <div className="text-sm text-[var(--tiger-text,#111827)]">
            {paginationConfig.totalText
              ? paginationConfig.totalText(total, [startIndex, endIndex])
              : `Showing ${startIndex} to ${endIndex} of ${total} items`}
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Page size selector */}
          {paginationConfig.showSizeChanger !== false && (
            <Select
              size="sm"
              value={currentPageSize}
              onChange={(value) => {
                if (value == null) return
                const nextSize = typeof value === 'number' ? value : Number(value)
                if (!Number.isFinite(nextSize)) return
                handlePageSizeChange(nextSize)
              }}
              options={(paginationConfig.pageSizeOptions || [10, 20, 50, 100]).map((size) => ({
                label: `${size} / page`,
                value: size
              }))}
            />
          )}

          {/* Page buttons */}
          <div className="flex gap-1">
            {/* Previous button */}
            <Button
              size="sm"
              variant="outline"
              disabled={!hasPrev}
              onClick={() => handlePageChange(currentPage - 1)}
              className={classNames(
                !hasPrev && 'cursor-not-allowed',
                hasPrev && 'hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
              )}>
              Previous
            </Button>

            {/* Current page indicator */}
            <span className="px-3 py-1 text-sm text-[var(--tiger-text,#111827)]">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next button */}
            <Button
              size="sm"
              variant="outline"
              disabled={!hasNext}
              onClick={() => handlePageChange(currentPage + 1)}
              className={classNames(
                !hasNext && 'cursor-not-allowed',
                hasNext && 'hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
              )}>
              Next
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={listWrapperClasses}>
      <div className="relative">
        <div {...divProps} className={listClasses} role="list" aria-busy={loading || undefined}>
          {renderListHeader()}
          {renderListItems()}
          {renderListFooter()}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className={listLoadingOverlayClasses} role="status" aria-live="polite">
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  )
}
