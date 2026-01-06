import React, { useState, useMemo, useCallback } from 'react';
import {
  classNames,
  getTableWrapperClasses,
  getTableHeaderClasses,
  getTableHeaderCellClasses,
  getTableRowClasses,
  getTableCellClasses,
  getSortIconClasses,
  getCheckboxCellClasses,
  tableBaseClasses,
  tableEmptyStateClasses,
  tableLoadingOverlayClasses,
  tablePaginationContainerClasses,
  sortData,
  filterData,
  paginateData,
  calculatePagination,
  getRowKey,
  type TableProps as CoreTableProps,
  type SortState,
  type PaginationConfig,
} from '@tigercat/core';

export interface TableProps<T = Record<string, unknown>>
  extends CoreTableProps<T> {
  /**
   * Change event handler (for sort, filter, pagination changes)
   */
  onChange?: (params: {
    sort: SortState;
    filters: Record<string, unknown>;
    pagination: { current: number; pageSize: number } | null;
  }) => void;

  /**
   * Row click handler
   */
  onRowClick?: (record: T, index: number) => void;

  /**
   * Selection change handler
   */
  onSelectionChange?: (selectedKeys: (string | number)[]) => void;

  /**
   * Sort change handler
   */
  onSortChange?: (sort: SortState) => void;

  /**
   * Filter change handler
   */
  onFilterChange?: (filters: Record<string, unknown>) => void;

  /**
   * Page change handler
   */
  onPageChange?: (page: { current: number; pageSize: number }) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// Sort icons
const SortIcon: React.FC<{ direction: 'asc' | 'desc' | null }> = ({
  direction,
}) => {
  if (direction === 'asc') {
    return (
      <svg
        className={getSortIconClasses(true)}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor">
        <path d="M8 3l4 4H4l4-4z" />
      </svg>
    );
  }

  if (direction === 'desc') {
    return (
      <svg
        className={getSortIconClasses(true)}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor">
        <path d="M8 13l-4-4h8l-4 4z" />
      </svg>
    );
  }

  return (
    <svg
      className={getSortIconClasses(false)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor">
      <path d="M8 3l4 4H4l4-4zM8 13l-4-4h8l-4 4z" />
    </svg>
  );
};

// Loading spinner
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

export function Table<
  T extends Record<string, unknown> = Record<string, unknown>
>({
  columns,
  dataSource = [],
  size = 'md',
  bordered = false,
  striped = false,
  hoverable = true,
  loading = false,
  emptyText = 'No data',
  pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: [10, 20, 50, 100],
    showSizeChanger: true,
    showTotal: true,
  },
  rowSelection,
  rowKey = 'id',
  rowClassName,
  stickyHeader = false,
  maxHeight,
  onChange,
  onRowClick,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  onPageChange,
  className,
  ...props
}: TableProps<T>) {
  const [sortState, setSortState] = useState<SortState>({
    key: null,
    direction: null,
  });

  const [filterState, setFilterState] = useState<Record<string, unknown>>({});

  const [currentPage, setCurrentPage] = useState(
    pagination && typeof pagination === 'object' ? pagination.current || 1 : 1
  );

  const [currentPageSize, setCurrentPageSize] = useState(
    pagination && typeof pagination === 'object'
      ? pagination.pageSize || 10
      : 10
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    rowSelection?.selectedRowKeys || []
  );

  // Process data with sorting, filtering, and pagination
  const processedData = useMemo(() => {
    let data = [...dataSource];

    // Apply filters
    data = filterData(data, filterState);

    // Apply sorting
    if (sortState.key && sortState.direction) {
      const column = columns.find((col) => col.key === sortState.key);
      data = sortData(data, sortState.key, sortState.direction, column?.sortFn);
    }

    return data;
  }, [dataSource, filterState, sortState, columns]);

  const paginatedData = useMemo(() => {
    if (pagination === false) {
      return processedData;
    }

    return paginateData(processedData, currentPage, currentPageSize);
  }, [processedData, currentPage, currentPageSize, pagination]);

  const paginationInfo = useMemo(() => {
    if (pagination === false) {
      return null;
    }

    const total = processedData.length;
    return calculatePagination(total, currentPage, currentPageSize);
  }, [processedData.length, currentPage, currentPageSize, pagination]);

  const handleSort = useCallback(
    (columnKey: string) => {
      const column = columns.find((col) => col.key === columnKey);
      if (!column || !column.sortable) {
        return;
      }

      let newDirection: 'asc' | 'desc' | null = 'asc';

      if (sortState.key === columnKey) {
        if (sortState.direction === 'asc') {
          newDirection = 'desc';
        } else if (sortState.direction === 'desc') {
          newDirection = null;
        }
      }

      const newSortState: SortState = {
        key: newDirection ? columnKey : null,
        direction: newDirection,
      };

      setSortState(newSortState);
      onSortChange?.(newSortState);
      onChange?.({
        sort: newSortState,
        filters: filterState,
        pagination:
          pagination !== false
            ? {
                current: currentPage,
                pageSize: currentPageSize,
              }
            : null,
      });
    },
    [
      columns,
      sortState,
      filterState,
      currentPage,
      currentPageSize,
      pagination,
      onSortChange,
      onChange,
    ]
  );

  const handleFilter = useCallback(
    (columnKey: string, value: unknown) => {
      const newFilterState = {
        ...filterState,
        [columnKey]: value,
      };

      setFilterState(newFilterState);
      setCurrentPage(1); // Reset to first page when filtering

      onFilterChange?.(newFilterState);
      onChange?.({
        sort: sortState,
        filters: newFilterState,
        pagination:
          pagination !== false
            ? {
                current: 1,
                pageSize: currentPageSize,
              }
            : null,
      });
    },
    [
      filterState,
      sortState,
      currentPageSize,
      pagination,
      onFilterChange,
      onChange,
    ]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);

      onPageChange?.({ current: page, pageSize: currentPageSize });
      onChange?.({
        sort: sortState,
        filters: filterState,
        pagination: {
          current: page,
          pageSize: currentPageSize,
        },
      });
    },
    [currentPageSize, sortState, filterState, onPageChange, onChange]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      setCurrentPageSize(pageSize);
      setCurrentPage(1);

      onPageChange?.({ current: 1, pageSize });
      onChange?.({
        sort: sortState,
        filters: filterState,
        pagination: {
          current: 1,
          pageSize,
        },
      });
    },
    [sortState, filterState, onPageChange, onChange]
  );

  const handleRowClick = useCallback(
    (record: T, index: number) => {
      onRowClick?.(record, index);
    },
    [onRowClick]
  );

  const handleSelectRow = useCallback(
    (key: string | number, checked: boolean) => {
      let newKeys: (string | number)[];

      if (rowSelection?.type === 'radio') {
        newKeys = checked ? [key] : [];
      } else {
        if (checked) {
          newKeys = [...selectedRowKeys, key];
        } else {
          newKeys = selectedRowKeys.filter((k) => k !== key);
        }
      }

      setSelectedRowKeys(newKeys);
      onSelectionChange?.(newKeys);
    },
    [rowSelection, selectedRowKeys, onSelectionChange]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const newKeys = paginatedData.map((record, index) =>
          getRowKey(record, rowKey, index)
        );
        setSelectedRowKeys(newKeys);
        onSelectionChange?.(newKeys);
      } else {
        setSelectedRowKeys([]);
        onSelectionChange?.([]);
      }
    },
    [paginatedData, rowKey, onSelectionChange]
  );

  const allSelected = useMemo(() => {
    if (paginatedData.length === 0) {
      return false;
    }

    return paginatedData.every((record, index) => {
      const key = getRowKey(record, rowKey, index);
      return selectedRowKeys.includes(key);
    });
  }, [paginatedData, rowKey, selectedRowKeys]);

  const someSelected = useMemo(() => {
    return selectedRowKeys.length > 0 && !allSelected;
  }, [selectedRowKeys.length, allSelected]);

  const renderTableHeader = useCallback(() => {
    return (
      <thead className={getTableHeaderClasses(stickyHeader)}>
        <tr>
          {/* Selection checkbox column */}
          {rowSelection &&
            rowSelection.showCheckbox !== false &&
            rowSelection.type !== 'radio' && (
              <th className={getCheckboxCellClasses(size)}>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
            )}

          {/* Column headers */}
          {columns.map((column) => {
            const isSorted = sortState.key === column.key;
            const sortDirection = isSorted ? sortState.direction : null;

            return (
              <th
                key={column.key}
                className={getTableHeaderCellClasses(
                  size,
                  column.align || 'left',
                  !!column.sortable,
                  column.headerClassName
                )}
                style={
                  column.width
                    ? {
                        width:
                          typeof column.width === 'number'
                            ? `${column.width}px`
                            : column.width,
                      }
                    : undefined
                }
                onClick={
                  column.sortable ? () => handleSort(column.key) : undefined
                }>
                <div className="flex items-center gap-2">
                  {column.renderHeader
                    ? (column.renderHeader() as React.ReactNode)
                    : column.title}
                  {column.sortable && <SortIcon direction={sortDirection} />}
                </div>

                {/* Filter input */}
                {column.filter && (
                  <div className="mt-2">
                    {column.filter.type === 'select' &&
                    column.filter.options ? (
                      <select
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        onChange={(e) =>
                          handleFilter(column.key, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}>
                        <option value="">All</option>
                        {column.filter.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder={column.filter.placeholder || 'Filter...'}
                        onInput={(e) =>
                          handleFilter(
                            column.key,
                            (e.target as HTMLInputElement).value
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }, [
    columns,
    size,
    stickyHeader,
    sortState,
    rowSelection,
    allSelected,
    someSelected,
    handleSort,
    handleFilter,
    handleSelectAll,
  ]);

  const renderTableBody = useCallback(() => {
    if (loading) {
      return null;
    }

    if (paginatedData.length === 0) {
      return (
        <tbody>
          <tr>
            <td
              colSpan={columns.length + (rowSelection ? 1 : 0)}
              className={tableEmptyStateClasses}>
              {emptyText}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {paginatedData.map((record, index) => {
          const key = getRowKey(record, rowKey, index);
          const isSelected = selectedRowKeys.includes(key);
          const rowClass =
            typeof rowClassName === 'function'
              ? rowClassName(record, index)
              : rowClassName;

          return (
            <tr
              key={key}
              className={getTableRowClasses(
                hoverable,
                striped,
                index % 2 === 0,
                rowClass
              )}
              onClick={() => handleRowClick(record, index)}>
              {/* Selection checkbox cell */}
              {rowSelection && rowSelection.showCheckbox !== false && (
                <td className={getCheckboxCellClasses(size)}>
                  <input
                    type={rowSelection?.type === 'radio' ? 'radio' : 'checkbox'}
                    className={
                      rowSelection?.type === 'radio'
                        ? 'border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]'
                        : 'rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]'
                    }
                    checked={isSelected}
                    disabled={
                      rowSelection?.getCheckboxProps?.(record)?.disabled
                    }
                    onChange={(e) => handleSelectRow(key, e.target.checked)}
                  />
                </td>
              )}

              {/* Data cells */}
              {columns.map((column) => {
                const dataKey = column.dataKey || column.key;
                const cellValue = record[dataKey];

                return (
                  <td
                    key={column.key}
                    className={getTableCellClasses(
                      size,
                      column.align || 'left',
                      column.className
                    )}>
                    {column.render
                      ? (column.render(record, index) as React.ReactNode)
                      : (cellValue as React.ReactNode)}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    );
  }, [
    loading,
    paginatedData,
    columns,
    rowSelection,
    emptyText,
    rowKey,
    selectedRowKeys,
    rowClassName,
    hoverable,
    striped,
    size,
    handleRowClick,
    handleSelectRow,
  ]);

  const renderPagination = useCallback(() => {
    if (pagination === false || !paginationInfo) {
      return null;
    }

    const { totalPages, startIndex, endIndex, hasNext, hasPrev } =
      paginationInfo;
    const total = processedData.length;
    const paginationConfig = pagination as PaginationConfig;

    return (
      <div className={tablePaginationContainerClasses}>
        {/* Total info */}
        {paginationConfig.showTotal !== false && (
          <div className="text-sm text-gray-700">
            {paginationConfig.totalText
              ? paginationConfig.totalText(total, [startIndex, endIndex])
              : `Showing ${startIndex} to ${endIndex} of ${total} results`}
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
  }, [
    pagination,
    paginationInfo,
    processedData.length,
    currentPage,
    currentPageSize,
    handlePageChange,
    handlePageSizeChange,
  ]);

  const wrapperStyle = useMemo(
    () =>
      maxHeight
        ? {
            maxHeight:
              typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          }
        : undefined,
    [maxHeight]
  );

  return (
    <div className={classNames('relative', className)} {...props}>
      <div
        className={getTableWrapperClasses(bordered, maxHeight)}
        style={wrapperStyle}>
        <table className={tableBaseClasses}>
          {renderTableHeader()}
          {renderTableBody()}
        </table>

        {/* Loading overlay */}
        {loading && (
          <div className={tableLoadingOverlayClasses}>
            <LoadingSpinner />
          </div>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
