import React, { useMemo, useState } from 'react';
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
  type ListSize,
  type ListBorderStyle,
  type ListItemLayout,
  type ListItem,
  type ListPaginationConfig,
} from '@tigercat/core';

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin h-8 w-8 text-[var(--tiger-primary,#2563eb)]"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export interface ListProps {
  /**
   * List data source
   */
  dataSource?: ListItem[];
  /**
   * List size
   * @default 'md'
   */
  size?: ListSize;
  /**
   * Border style
   * @default 'divided'
   */
  bordered?: ListBorderStyle;
  /**
   * Loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Empty state text
   * @default 'No data'
   */
  emptyText?: string;
  /**
   * Whether to show split line between items
   * @default true
   */
  split?: boolean;
  /**
   * Item layout
   * @default 'horizontal'
   */
  itemLayout?: ListItemLayout;
  /**
   * List header content
   */
  header?: React.ReactNode;
  /**
   * List footer content
   */
  footer?: React.ReactNode;
  /**
   * Pagination configuration, set to false to disable
   * @default false
   */
  pagination?: ListPaginationConfig | false;
  /**
   * Grid configuration
   */
  grid?: {
    gutter?: number;
    column?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  /**
   * Function to get item key
   */
  rowKey?: string | ((item: ListItem, index: number) => string | number);
  /**
   * Whether items are hoverable
   * @default false
   */
  hoverable?: boolean;
  /**
   * Custom render function for list items
   */
  renderItem?: (item: ListItem, index: number) => React.ReactNode;
  /**
   * Item click handler
   */
  onItemClick?: (item: ListItem, index: number) => void;
  /**
   * Page change handler
   */
  onPageChange?: (page: { current: number; pageSize: number }) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const List: React.FC<ListProps> = ({
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
}) => {
  const [currentPage, setCurrentPage] = useState(
    pagination && typeof pagination === 'object' ? pagination.current || 1 : 1
  );

  const [currentPageSize, setCurrentPageSize] = useState(
    pagination && typeof pagination === 'object'
      ? pagination.pageSize || 10
      : 10
  );

  // Paginated data
  const paginatedData = useMemo(() => {
    if (pagination === false) {
      return dataSource;
    }

    return paginateData(dataSource, currentPage, currentPageSize);
  }, [dataSource, currentPage, currentPageSize, pagination]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    if (pagination === false) {
      return null;
    }

    const total = dataSource.length;
    return calculatePagination(total, currentPage, currentPageSize);
  }, [dataSource.length, currentPage, currentPageSize, pagination]);

  // List classes
  const listClasses = useMemo(() => {
    return classNames(
      getListClasses(bordered),
      listSizeClasses[size],
      className
    );
  }, [bordered, size, className]);

  // Grid classes
  const gridClasses = useMemo(() => {
    if (!grid) return '';

    return classNames(
      listGridContainerClasses,
      getGridColumnClasses(
        grid.column,
        grid.xs,
        grid.sm,
        grid.md,
        grid.lg,
        grid.xl,
        grid.xxl
      )
    );
  }, [grid]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.({ current: page, pageSize: currentPageSize });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setCurrentPageSize(pageSize);
    setCurrentPage(1);
    onPageChange?.({ current: 1, pageSize });
  };

  const handleItemClick = (item: ListItem, index: number) => {
    onItemClick?.(item, index);
  };

  const getItemKey = (item: ListItem, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(item, index);
    }
    return (item[rowKey] as string | number) || index;
  };

  const renderListHeader = () => {
    if (!header) return null;

    return (
      <div className={getListHeaderFooterClasses(size, false)}>{header}</div>
    );
  };

  const renderListFooter = () => {
    if (!footer) return null;

    return (
      <div className={getListHeaderFooterClasses(size, true)}>{footer}</div>
    );
  };

  const renderDefaultListItem = (item: ListItem, _index: number) => {
    const itemContent: React.ReactNode[] = [];

    // Meta section (avatar + content)
    const metaContent: React.ReactNode[] = [];

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
            item.avatar
          )}
        </div>
      );
    }

    const contentChildren: React.ReactNode[] = [];
    if (item.title) {
      contentChildren.push(
        <div key="title" className={listItemTitleClasses}>
          {item.title}
        </div>
      );
    }
    if (item.description) {
      contentChildren.push(
        <div key="description" className={listItemDescriptionClasses}>
          {item.description}
        </div>
      );
    }

    if (contentChildren.length > 0) {
      metaContent.push(
        <div key="content" className={listItemContentClasses}>
          {contentChildren}
        </div>
      );
    }

    if (metaContent.length > 0) {
      itemContent.push(
        <div key="meta" className={listItemMetaClasses}>
          {metaContent}
        </div>
      );
    }

    // Extra content
    if (item.extra) {
      itemContent.push(
        <div key="extra" className={listItemExtraClasses}>
          {item.extra as React.ReactNode}
        </div>
      );
    }

    return itemContent;
  };

  const renderListItem = (item: ListItem, index: number) => {
    const key = getItemKey(item, index);
    const itemClasses = getListItemClasses(
      size,
      itemLayout,
      split && bordered === 'divided' && !grid,
      hoverable
    );

    return (
      <div
        key={key}
        className={itemClasses}
        onClick={() => handleItemClick(item, index)}>
        {renderItem
          ? renderItem(item, index)
          : renderDefaultListItem(item, index)}
      </div>
    );
  };

  const renderListItems = () => {
    if (loading) {
      return null;
    }

    if (paginatedData.length === 0) {
      return <div className={listEmptyStateClasses}>{emptyText}</div>;
    }

    const items = paginatedData.map((item, index) =>
      renderListItem(item, index)
    );

    if (grid) {
      return <div className={gridClasses}>{items}</div>;
    }

    return items;
  };

  const renderPagination = () => {
    if (pagination === false || !paginationInfo) {
      return null;
    }

    const { totalPages, startIndex, endIndex, hasNext, hasPrev } =
      paginationInfo;
    const total = dataSource.length;
    const paginationConfig = pagination as ListPaginationConfig;

    return (
      <div className={listPaginationContainerClasses}>
        {/* Total info */}
        {paginationConfig.showTotal !== false && (
          <div className="text-sm text-gray-700">
            {paginationConfig.totalText
              ? paginationConfig.totalText(total, [startIndex, endIndex])
              : `Showing ${startIndex} to ${endIndex} of ${total} items`}
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Page size selector */}
          {paginationConfig.showSizeChanger !== false && (
            <select
              className="px-3 py-1 border border-gray-300 rounded text-sm"
              value={currentPageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}>
              {(paginationConfig.pageSizeOptions || [10, 20, 50, 100]).map(
                (size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                )
              )}
            </select>
          )}

          {/* Page buttons */}
          <div className="flex gap-1">
            {/* Previous button */}
            <button
              className={classNames(
                'px-3 py-1 border border-gray-300 rounded text-sm',
                hasPrev
                  ? 'hover:bg-gray-50 text-gray-700'
                  : 'text-gray-400 cursor-not-allowed'
              )}
              disabled={!hasPrev}
              onClick={() => handlePageChange(currentPage - 1)}>
              Previous
            </button>

            {/* Current page indicator */}
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            {/* Next button */}
            <button
              className={classNames(
                'px-3 py-1 border border-gray-300 rounded text-sm',
                hasNext
                  ? 'hover:bg-gray-50 text-gray-700'
                  : 'text-gray-400 cursor-not-allowed'
              )}
              disabled={!hasNext}
              onClick={() => handlePageChange(currentPage + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={listWrapperClasses}>
      <div className="relative">
        <div className={listClasses}>
          {renderListHeader()}
          {renderListItems()}
          {renderListFooter()}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className={listLoadingOverlayClasses}>
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};
