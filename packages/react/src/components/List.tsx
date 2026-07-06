import React, { useMemo, useState } from 'react'
import {
  classNames,
  resolveLocaleText,
  mergeTigerLocale,
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
  listItemMetaClasses,
  listItemAvatarClasses,
  listItemContentClasses,
  listItemTitleClasses,
  listItemDescriptionClasses,
  listItemExtraClasses,
  listGridContainerClasses,
  getSpinnerSVG,
  getLoadingOverlaySpinnerClasses,
  getBuiltInPaginationContainerClasses,
  resolvePaginationDisplayMode,
  getPaginationLabels,
  formatPaginationTotal,
  formatPaginationPageIndicator,
  type ComponentSize,
  type ListBorderStyle,
  type ListItemLayout,
  type ListItem,
  type ListPaginationConfig,
  type TigerLocale
} from '@expcat/tigercat-core'
import { VirtualList } from './VirtualList'
import { Pagination } from './Pagination'
import { useTigerConfig } from './ConfigProvider'

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
  size?: ComponentSize
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
   * Locale override; falls back to ConfigProvider locale
   */
  locale?: Partial<TigerLocale>
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
   * Enable fixed-height virtual rendering via VirtualList.
   * Virtual mode applies to the current paginated data window and is ignored for grid lists.
   * @default false
   */
  virtual?: boolean
  /**
   * Virtual viewport height in pixels.
   * @default 400
   */
  virtualHeight?: number
  /**
   * Fixed virtual item height in pixels.
   * @default 40
   */
  virtualItemHeight?: number
  /**
   * Number of extra virtual items to render above/below the viewport.
   * @default 5
   */
  virtualOverscan?: number
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
  /**
   * Whether list items are draggable for reorder
   */
  draggable?: boolean
  /**
   * Called when items are reordered via drag
   */
  onReorder?: (items: T[], from: number, to: number) => void
}

export const List = <T extends ListItem = ListItem>({
  dataSource = [],
  size = 'md',
  bordered = 'divided',
  loading = false,
  emptyText,
  locale,
  split = true,
  itemLayout = 'horizontal',
  header,
  footer,
  pagination = false,
  grid,
  virtual = false,
  virtualHeight = 400,
  virtualItemHeight = 40,
  virtualOverscan = 5,
  rowKey = 'key',
  hoverable = false,
  renderItem,
  onItemClick,
  onPageChange,
  className,
  draggable: isDraggable = false,
  onReorder,
  ...divProps
}: ListProps<T>) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const paginationCfg = pagination !== false && typeof pagination === 'object' ? pagination : null
  const isRemotePagination = paginationCfg?.remote === true

  const [internalCurrentPage, setInternalCurrentPage] = useState(paginationCfg?.current || 1)

  const dragIndexRef = React.useRef<number | null>(null)

  const [internalCurrentPageSize, setInternalCurrentPageSize] = useState(
    paginationCfg?.pageSize || 10
  )

  // Remote mode treats current/pageSize as controlled props.
  const currentPage = isRemotePagination
    ? (paginationCfg?.current ?? internalCurrentPage)
    : internalCurrentPage
  const currentPageSize = isRemotePagination
    ? (paginationCfg?.pageSize ?? internalCurrentPageSize)
    : internalCurrentPageSize

  // Paginated data
  const paginatedData = useMemo(() => {
    if (pagination === false) {
      return dataSource
    }

    // Remote mode: dataSource already holds only the current page — no slicing.
    if (isRemotePagination) {
      return dataSource
    }

    return paginateData(dataSource, currentPage, currentPageSize)
  }, [dataSource, currentPage, currentPageSize, pagination, isRemotePagination])

  const paginationTotal = isRemotePagination
    ? (paginationCfg?.total ?? dataSource.length)
    : dataSource.length

  // Pagination info
  const paginationInfo = useMemo(() => {
    if (pagination === false) {
      return null
    }

    return calculatePagination(paginationTotal, currentPage, currentPageSize)
  }, [paginationTotal, currentPage, currentPageSize, pagination])

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
    setInternalCurrentPage(page)
    onPageChange?.({ current: page, pageSize: currentPageSize })
  }

  const handlePageSizeChange = (pageSize: number) => {
    setInternalCurrentPageSize(pageSize)
    setInternalCurrentPage(1)
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
        className={classNames(
          itemClasses,
          clickable && 'cursor-pointer',
          isDraggable && 'cursor-grab'
        )}
        role="listitem"
        tabIndex={clickable ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        draggable={isDraggable || undefined}
        onDragStart={
          isDraggable
            ? () => {
                dragIndexRef.current = index
              }
            : undefined
        }
        onDragOver={isDraggable ? (e) => e.preventDefault() : undefined}
        onDrop={
          isDraggable
            ? () => {
                const from = dragIndexRef.current
                if (from === null || from === index) {
                  dragIndexRef.current = null
                  return
                }
                dragIndexRef.current = null
                const items = [...dataSource] as T[]
                const [moved] = items.splice(from, 1)
                items.splice(index, 0, moved)
                onReorder?.(items, from, index)
              }
            : undefined
        }
        onDragEnd={
          isDraggable
            ? () => {
                dragIndexRef.current = null
              }
            : undefined
        }>
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
          {resolveLocaleText('No data', emptyText, mergedLocale?.common?.emptyText)}
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

    if (virtual) {
      return (
        <VirtualList
          itemCount={paginatedData.length}
          itemHeight={virtualItemHeight}
          height={virtualHeight}
          overscan={virtualOverscan}
          renderItem={({ index }) => renderListItem(paginatedData[index], index)}
        />
      )
    }

    return items
  }

  const renderPagination = () => {
    if (pagination === false || !paginationInfo) {
      return null
    }

    const { totalPages } = paginationInfo
    const total = paginationTotal
    const paginationConfig = pagination as ListPaginationConfig
    const paginationLabels = getPaginationLabels(mergedLocale)
    const localeCode = mergedLocale?.locale

    // More than 3 pages: full page-number buttons plus quick jumper;
    // otherwise the simple prev/next indicator (config values override).
    const { simple, showQuickJumper } = resolvePaginationDisplayMode(totalPages, paginationConfig)

    const totalText =
      paginationConfig.totalText ??
      ((value: number, range: [number, number]) =>
        formatPaginationTotal(paginationLabels.totalText, value, range, localeCode))

    const pageIndicatorText = (current: number, pages: number) =>
      formatPaginationPageIndicator(paginationLabels.pageIndicatorText, current, pages, localeCode)

    return (
      <div className={getBuiltInPaginationContainerClasses()}>
        <Pagination
          size="small"
          align="right"
          current={currentPage}
          pageSize={currentPageSize}
          total={total}
          simple={simple}
          showQuickJumper={showQuickJumper}
          showSizeChanger={paginationConfig.showSizeChanger !== false}
          showTotal={paginationConfig.showTotal !== false}
          totalText={totalText}
          pageIndicatorText={pageIndicatorText}
          pageSizeOptions={paginationConfig.pageSizeOptions || [10, 20, 50, 100]}
          locale={mergedLocale}
          onChange={(page, pageSize) => {
            // Page-size changes are routed through onPageSizeChange below; the
            // companion onChange they trigger carries the new size and is skipped.
            if (pageSize === currentPageSize) {
              handlePageChange(page)
            }
          }}
          onPageSizeChange={(_page, pageSize) => handlePageSizeChange(pageSize)}
        />
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
