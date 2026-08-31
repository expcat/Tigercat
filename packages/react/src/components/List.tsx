import React, { forwardRef, useMemo, useRef, useState, useLayoutEffect } from 'react'
import {
  classNames,
  reorderSequence,
  mergeTigerLocale,
  getListClasses,
  getListItemClasses,
  getListItemExtraClasses,
  getListHeaderFooterClasses,
  getListGridColumnClass,
  getListGridGapStyle,
  getListSourceIndex,
  resolveListGridColumnCount,
  resolveListVirtualItemHeight,
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
  listGridContainerClasses,
  listDragHandleClasses,
  getBuiltInPaginationContainerClasses,
  resolvePaginationDisplayMode,
  getPaginationLabels,
  getListLabels,
  formatPaginationTotal,
  formatPaginationPageIndicator,
  observeElementSize,
  devWarn,
  type ComponentSize,
  type ListItemLayout,
  type ListItem,
  type ListPaginationConfig,
  type ListProps as CoreListProps,
  type ListGrid,
  type TigerLocale
} from '@expcat/tigercat-core'
import { VirtualList } from './VirtualList'
import { Pagination } from './Pagination'
import { Empty } from './Empty'
import { Loading } from './Loading'
import { useTigerConfig } from './ConfigProvider'
import { useDrag } from '../hooks/useDrag'

export interface ListProps<T extends ListItem = ListItem>
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    Omit<CoreListProps<T>, 'header' | 'footer'> {
  dataSource?: T[]
  header?: React.ReactNode
  footer?: React.ReactNode
  grid?: ListGrid
  rowKey?: string | ((item: T, index: number) => string | number)
  renderItem?: (item: T, index: number) => React.ReactNode
  onItemClick?: (item: T, index: number) => void
  onPageChange?: (page: { current: number; pageSize: number }) => void
  onReorder?: (items: T[], from: number, to: number) => void
  locale?: Partial<TigerLocale>
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('button, a, input, textarea, select, [data-list-drag-handle]'))
}

function ListInner<T extends ListItem>(
  {
    dataSource = [],
    size = 'md' as ComponentSize,
    bordered = false,
    loading = false,
    emptyText,
    locale,
    split = true,
    itemLayout = 'horizontal' as ListItemLayout,
    header,
    footer,
    pagination = false,
    grid,
    virtual = false,
    virtualHeight = 400,
    virtualItemHeight,
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
  }: ListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = getListLabels(mergedLocale)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useLayoutEffect(() => {
    if (!grid) return undefined
    return observeElementSize(rootRef.current, ({ width }) => setContainerWidth(width))
  }, [grid])

  const paginationCfg = pagination !== false && typeof pagination === 'object' ? pagination : null
  const isRemotePagination = paginationCfg?.remote === true
  const [internalCurrentPage, setInternalCurrentPage] = useState(paginationCfg?.current || 1)
  const [internalCurrentPageSize, setInternalCurrentPageSize] = useState(
    paginationCfg?.pageSize || 10
  )
  const currentPage =
    paginationCfg?.current !== undefined ? paginationCfg.current : internalCurrentPage
  const currentPageSize =
    paginationCfg?.pageSize !== undefined ? paginationCfg.pageSize : internalCurrentPageSize

  const drag = useDrag({
    containerId: 'list',
    config: { handleSelector: '[data-list-drag-handle]' },
    onDrop: (event) => {
      if (event.fromIndex === event.toIndex) return
      onReorder?.(
        reorderSequence(dataSource, event.fromIndex, event.toIndex),
        event.fromIndex,
        event.toIndex
      )
    }
  })

  if (virtual && grid) {
    devWarn('List.virtualGrid', 'List: `virtual` is ignored when `grid` is set.')
  }
  const useVirtual = virtual && !grid
  const itemHeight = resolveListVirtualItemHeight(size, virtualItemHeight)

  const paginatedData = useMemo(() => {
    if (pagination === false) return dataSource
    if (isRemotePagination) return dataSource
    return paginateData(dataSource, currentPage, currentPageSize)
  }, [dataSource, currentPage, currentPageSize, pagination, isRemotePagination])

  const paginationTotal = isRemotePagination
    ? (paginationCfg?.total ?? dataSource.length)
    : dataSource.length
  const paginationInfo =
    pagination === false ? null : calculatePagination(paginationTotal, currentPage, currentPageSize)

  const gridColumnCount = grid ? resolveListGridColumnCount(grid, containerWidth) : 1

  const handlePageChange = (page: number) => {
    if (paginationCfg?.current === undefined) setInternalCurrentPage(page)
    onPageChange?.({ current: page, pageSize: currentPageSize })
  }
  const handlePageSizeChange = (pageSize: number) => {
    if (paginationCfg?.pageSize === undefined) setInternalCurrentPageSize(pageSize)
    if (paginationCfg?.current === undefined) setInternalCurrentPage(1)
    onPageChange?.({ current: 1, pageSize })
  }

  const getItemKey = (item: T, index: number): string | number => {
    if (typeof rowKey === 'function') return rowKey(item, index)
    return (item[rowKey] as string | number) || index
  }

  const renderDefaultListItem = (item: T) => {
    const metaContent: React.ReactNode[] = []
    if (item.avatar) {
      metaContent.push(
        <div key="avatar" className={listItemAvatarClasses}>
          {typeof item.avatar === 'string' ? (
            <img
              src={item.avatar}
              alt={item.title ? '' : labels.avatarAlt}
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
    return (
      <>
        {metaContent.length > 0 ? <div className={listItemMetaClasses}>{metaContent}</div> : null}
        {item.extra ? (
          <div
            className={getListItemExtraClasses(itemLayout)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}>
            {item.extra as React.ReactNode}
          </div>
        ) : null}
      </>
    )
  }

  const renderListItem = (item: T, pageIndex: number) => {
    const sourceIndex = getListSourceIndex(
      pageIndex,
      currentPage,
      currentPageSize,
      isRemotePagination
    )
    const key = getItemKey(item, sourceIndex)
    const divided = split && !grid
    const itemClasses = getListItemClasses(size, itemLayout, divided, hoverable)
    const clickable = typeof onItemClick === 'function'
    const bindings = isDraggable
      ? drag.getDragItemProps({ id: String(key), index: sourceIndex, containerId: 'list' })
      : {}
    const {
      className: dragClassName,
      onPointerDown,
      draggable: _d,
      ...dragRest
    } = bindings as Record<string, unknown>

    const body = renderItem ? renderItem(item, sourceIndex) : renderDefaultListItem(item)
    const handleReorderKey = (event: React.KeyboardEvent) => {
      if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return
      event.preventDefault()
      event.stopPropagation()
      const to = event.key === 'ArrowUp' ? sourceIndex - 1 : sourceIndex + 1
      if (to < 0 || to >= dataSource.length) return
      onReorder?.(reorderSequence(dataSource, sourceIndex, to), sourceIndex, to)
    }

    return (
      <li
        key={key}
        className={classNames(itemClasses, dragClassName as string | undefined)}
        onClick={
          clickable
            ? (event) => {
                if (isInteractiveTarget(event.target)) return
                onItemClick?.(item, sourceIndex)
              }
            : undefined
        }
        {...(dragRest as React.HTMLAttributes<HTMLLIElement>)}>
        {isDraggable ? (
          <button
            type="button"
            data-list-drag-handle=""
            className={listDragHandleClasses}
            aria-label={labels.dragHandleAriaLabel}
            onPointerDown={(event) => {
              event.stopPropagation()
              ;(onPointerDown as ((e: React.PointerEvent) => void) | undefined)?.(event)
            }}
            onKeyDown={handleReorderKey}
            onClick={(event) => event.stopPropagation()}>
            ⋮⋮
          </button>
        ) : null}
        {clickable && !renderItem ? (
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center text-start"
            onClick={() => onItemClick?.(item, sourceIndex)}>
            {body}
          </button>
        ) : (
          body
        )}
      </li>
    )
  }

  const renderItems = () => {
    if (paginatedData.length === 0) {
      return (
        <div className={listEmptyStateClasses}>
          <Empty description={emptyText} showImage={false} locale={mergedLocale} />
        </div>
      )
    }

    const items = paginatedData.map((item, index) => renderListItem(item, index))

    if (grid) {
      return (
        <ul
          className={classNames(
            listGridContainerClasses,
            getListGridColumnClass(gridColumnCount),
            grid.gutter === undefined && 'gap-4'
          )}
          style={getListGridGapStyle(grid.gutter)}
          {...(isDraggable ? drag.getDropZoneProps() : {})}>
          {items}
        </ul>
      )
    }

    if (useVirtual) {
      return (
        <VirtualList
          role="none"
          itemCount={paginatedData.length}
          itemHeight={itemHeight}
          height={virtualHeight}
          overscan={virtualOverscan}
          renderItem={({ index }) => renderListItem(paginatedData[index], index)}
        />
      )
    }

    return <ul {...(isDraggable ? drag.getDropZoneProps() : {})}>{items}</ul>
  }

  const renderPaginationBar = () => {
    if (pagination === false || !paginationInfo) return null
    const { totalPages } = paginationInfo
    const paginationConfig = pagination as ListPaginationConfig
    const paginationLabels = getPaginationLabels(mergedLocale)
    const localeCode = mergedLocale?.locale
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
          size={size === 'lg' ? 'large' : size === 'sm' ? 'small' : 'medium'}
          align="right"
          current={currentPage}
          pageSize={currentPageSize}
          total={paginationTotal}
          simple={simple}
          showQuickJumper={showQuickJumper}
          showSizeChanger={paginationConfig.showSizeChanger !== false}
          showTotal={paginationConfig.showTotal !== false}
          totalText={totalText}
          pageIndicatorText={pageIndicatorText}
          pageSizeOptions={paginationConfig.pageSizeOptions || [10, 20, 50, 100]}
          locale={mergedLocale}
          onChange={(page) => handlePageChange(page)}
          onPageSizeChange={(_page, pageSize) => handlePageSizeChange(pageSize)}
        />
      </div>
    )
  }

  const setRef = (node: HTMLDivElement | null) => {
    rootRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  return (
    <div
      {...divProps}
      ref={setRef}
      className={classNames(
        listWrapperClasses,
        getListClasses(bordered),
        listSizeClasses[size],
        className
      )}>
      {header ? <div className={getListHeaderFooterClasses(size, false)}>{header}</div> : null}
      <div className="relative" aria-busy={loading || undefined}>
        {renderItems()}
        {loading ? (
          <div className={listLoadingOverlayClasses}>
            <Loading variant="spinner" aria-hidden role="presentation" />
          </div>
        ) : null}
      </div>
      {footer ? <div className={getListHeaderFooterClasses(size, true)}>{footer}</div> : null}
      {renderPaginationBar()}
    </div>
  )
}

export const List = forwardRef(ListInner) as <T extends ListItem = ListItem>(
  props: ListProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null

export default List
