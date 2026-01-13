import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  classNames,
  getTableWrapperClasses,
  getTableHeaderClasses,
  getTableHeaderCellClasses,
  getTableRowClasses,
  getTableCellClasses,
  getFixedColumnOffsets,
  getSortIconClasses,
  getCheckboxCellClasses,
  tableBaseClasses,
  tableEmptyStateClasses,
  tableLoadingOverlayClasses,
  tablePaginationContainerClasses,
  getSpinnerSVG,
  sortData,
  filterData,
  paginateData,
  calculatePagination,
  getRowKey,
  type TableProps as CoreTableProps,
  type SortState,
  type PaginationConfig,
} from '@tigercat/core';

const spinnerSvg = getSpinnerSVG('spinner');

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

const LockIcon: React.FC<{ locked: boolean }> = ({ locked }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      {locked ? (
        <path d="M17 8h-1V6a4 4 0 10-8 0v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zm-7-2a2 2 0 114 0v2h-4V6z" />
      ) : (
        <path d="M17 8h-1V6a4 4 0 00-7.75-1.41 1 1 0 101.9.62A2 2 0 0114 6v2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V10a2 2 0 00-2-2zm0 12H7V10h10v10z" />
      )}
    </svg>
  );
};

// Loading spinner
const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin h-8 w-8 text-[var(--tiger-primary,#2563eb)]"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={spinnerSvg.viewBox}>
    {spinnerSvg.elements.map((el, index) => {
      if (el.type === 'circle') return <circle key={index} {...el.attrs} />;
      if (el.type === 'path') return <path key={index} {...el.attrs} />;
      return null;
    })}
  </svg>
);

export function Table<
  T extends Record<string, unknown> = Record<string, unknown>
>({
  columns,
  columnLockable = false,
  dataSource = [],
  sort,
  defaultSort,
  filters,
  defaultFilters,
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
  const isSortControlled = sort !== undefined;
  const isFiltersControlled = filters !== undefined;

  const paginationConfig: PaginationConfig | null =
    pagination !== false && typeof pagination === 'object' ? pagination : null;
  const isCurrentPageControlled = paginationConfig?.current !== undefined;
  const isPageSizeControlled = paginationConfig?.pageSize !== undefined;

  const isSelectionControlled =
    rowSelection?.selectedRowKeys !== undefined &&
    Array.isArray(rowSelection.selectedRowKeys);

  const [uncontrolledSortState, setUncontrolledSortState] = useState<SortState>(
    defaultSort ?? { key: null, direction: null }
  );

  const [uncontrolledFilterState, setUncontrolledFilterState] = useState<
    Record<string, unknown>
  >(defaultFilters ?? {});

  const [uncontrolledCurrentPage, setUncontrolledCurrentPage] = useState(
    () => paginationConfig?.defaultCurrent ?? paginationConfig?.current ?? 1
  );

  const [uncontrolledCurrentPageSize, setUncontrolledCurrentPageSize] =
    useState(
      () =>
        paginationConfig?.defaultPageSize ?? paginationConfig?.pageSize ?? 10
    );

  const [uncontrolledSelectedRowKeys, setUncontrolledSelectedRowKeys] =
    useState<(string | number)[]>(
      rowSelection?.defaultSelectedRowKeys ??
        rowSelection?.selectedRowKeys ??
        []
    );

  const sortState = isSortControlled
    ? (sort as SortState)
    : uncontrolledSortState;
  const filterState = isFiltersControlled
    ? (filters as Record<string, unknown>)
    : uncontrolledFilterState;
  const currentPage = isCurrentPageControlled
    ? (paginationConfig!.current as number)
    : uncontrolledCurrentPage;
  const currentPageSize = isPageSizeControlled
    ? (paginationConfig!.pageSize as number)
    : uncontrolledCurrentPageSize;
  const selectedRowKeys = isSelectionControlled
    ? (rowSelection!.selectedRowKeys as (string | number)[])
    : uncontrolledSelectedRowKeys;

  useEffect(() => {
    if (isSortControlled && sort) {
      setUncontrolledSortState(sort);
    }
  }, [isSortControlled, sort?.key, sort?.direction]);

  useEffect(() => {
    if (isFiltersControlled && filters) {
      setUncontrolledFilterState(filters);
    }
  }, [isFiltersControlled, filters]);

  useEffect(() => {
    if (isCurrentPageControlled) {
      setUncontrolledCurrentPage(paginationConfig!.current as number);
    }
  }, [isCurrentPageControlled, paginationConfig?.current]);

  useEffect(() => {
    if (isPageSizeControlled) {
      setUncontrolledCurrentPageSize(paginationConfig!.pageSize as number);
    }
  }, [isPageSizeControlled, paginationConfig?.pageSize]);

  useEffect(() => {
    if (isSelectionControlled) {
      setUncontrolledSelectedRowKeys(
        (rowSelection?.selectedRowKeys as (string | number)[]) ?? []
      );
    }
  }, [isSelectionControlled, rowSelection?.selectedRowKeys]);

  const [fixedOverrides, setFixedOverrides] = useState<
    Record<string, 'left' | 'right' | false>
  >({});

  const displayColumns = useMemo(() => {
    return columns.map((column) => {
      const hasOverride = Object.prototype.hasOwnProperty.call(
        fixedOverrides,
        column.key
      );

      return {
        ...column,
        fixed: hasOverride ? fixedOverrides[column.key] : column.fixed,
      };
    });
  }, [columns, fixedOverrides]);

  const columnByKey = useMemo(() => {
    const map: Record<string, (typeof displayColumns)[number]> = {};
    for (const column of displayColumns) {
      map[column.key] = column;
    }
    return map;
  }, [displayColumns]);

  const fixedColumnsInfo = useMemo(() => {
    return getFixedColumnOffsets(displayColumns);
  }, [displayColumns]);

  const toggleColumnLock = useCallback(
    (columnKey: string) => {
      setFixedOverrides((prev) => {
        const original = columns.find((c) => c.key === columnKey)?.fixed;
        const current = Object.prototype.hasOwnProperty.call(prev, columnKey)
          ? prev[columnKey]
          : original;

        const isLocked = current === 'left' || current === 'right';

        return {
          ...prev,
          [columnKey]: isLocked ? false : 'left',
        };
      });
    },
    [columns]
  );

  // Process data with sorting, filtering, and pagination
  const processedData = useMemo(() => {
    let data = dataSource;

    // Apply filters
    data = filterData(data, filterState);

    // Apply sorting
    if (sortState.key && sortState.direction) {
      const column = columnByKey[sortState.key];
      data = sortData(data, sortState.key, sortState.direction, column?.sortFn);
    }

    return data;
  }, [dataSource, filterState, sortState, columnByKey]);

  const paginatedData = useMemo(() => {
    if (pagination === false) {
      return processedData;
    }

    return paginateData(processedData, currentPage, currentPageSize);
  }, [processedData, currentPage, currentPageSize, pagination]);

  const pageRowKeys = useMemo(
    () =>
      paginatedData.map((record, index) => getRowKey(record, rowKey, index)),
    [paginatedData, rowKey]
  );

  const selectedRowKeySet = useMemo(
    () => new Set<string | number>(selectedRowKeys),
    [selectedRowKeys]
  );

  const paginationInfo = useMemo(() => {
    if (pagination === false) {
      return null;
    }

    const total = processedData.length;
    return calculatePagination(total, currentPage, currentPageSize);
  }, [processedData.length, currentPage, currentPageSize, pagination]);

  const handleSort = useCallback(
    (columnKey: string) => {
      const column = columnByKey[columnKey];
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

      if (!isSortControlled) {
        setUncontrolledSortState(newSortState);
      }
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
      columnByKey,
      sortState,
      filterState,
      currentPage,
      currentPageSize,
      pagination,
      isSortControlled,
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

      if (!isFiltersControlled) {
        setUncontrolledFilterState(newFilterState);
      }
      setUncontrolledCurrentPage(1); // Keep internal state aligned

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
      isFiltersControlled,
      onFilterChange,
      onChange,
    ]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (!isCurrentPageControlled) {
        setUncontrolledCurrentPage(page);
      } else {
        setUncontrolledCurrentPage(page);
      }

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
    [
      currentPageSize,
      sortState,
      filterState,
      isCurrentPageControlled,
      onPageChange,
      onChange,
    ]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      if (!isPageSizeControlled) {
        setUncontrolledCurrentPageSize(pageSize);
      } else {
        setUncontrolledCurrentPageSize(pageSize);
      }
      if (!isCurrentPageControlled) {
        setUncontrolledCurrentPage(1);
      } else {
        setUncontrolledCurrentPage(1);
      }

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
    [
      sortState,
      filterState,
      isPageSizeControlled,
      isCurrentPageControlled,
      onPageChange,
      onChange,
    ]
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

      if (!isSelectionControlled) {
        setUncontrolledSelectedRowKeys(newKeys);
      }
      onSelectionChange?.(newKeys);
    },
    [rowSelection, selectedRowKeys, isSelectionControlled, onSelectionChange]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const newKeys = pageRowKeys;
        if (!isSelectionControlled) {
          setUncontrolledSelectedRowKeys(newKeys);
        }
        onSelectionChange?.(newKeys);
      } else {
        if (!isSelectionControlled) {
          setUncontrolledSelectedRowKeys([]);
        }
        onSelectionChange?.([]);
      }
    },
    [pageRowKeys, isSelectionControlled, onSelectionChange]
  );

  const allSelected = useMemo(() => {
    if (pageRowKeys.length === 0) {
      return false;
    }

    return pageRowKeys.every((key) => selectedRowKeySet.has(key));
  }, [pageRowKeys, selectedRowKeySet]);

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
          {displayColumns.map((column) => {
            const isSorted = sortState.key === column.key;
            const sortDirection = isSorted ? sortState.direction : null;

            const ariaSort = column.sortable
              ? sortDirection === 'asc'
                ? 'ascending'
                : sortDirection === 'desc'
                ? 'descending'
                : 'none'
              : undefined;

            const isFixedLeft = column.fixed === 'left';
            const isFixedRight = column.fixed === 'right';
            const fixedStyle = isFixedLeft
              ? {
                  position: 'sticky' as const,
                  left: `${fixedColumnsInfo.leftOffsets[column.key] || 0}px`,
                  zIndex: 15,
                }
              : isFixedRight
              ? {
                  position: 'sticky' as const,
                  right: `${fixedColumnsInfo.rightOffsets[column.key] || 0}px`,
                  zIndex: 15,
                }
              : undefined;

            const widthStyle = column.width
              ? {
                  width:
                    typeof column.width === 'number'
                      ? `${column.width}px`
                      : column.width,
                }
              : undefined;

            const style = fixedStyle
              ? { ...widthStyle, ...fixedStyle }
              : widthStyle;

            return (
              <th
                key={column.key}
                aria-sort={ariaSort}
                className={classNames(
                  getTableHeaderCellClasses(
                    size,
                    column.align || 'left',
                    !!column.sortable,
                    column.headerClassName
                  ),
                  (isFixedLeft || isFixedRight) && 'bg-gray-50'
                )}
                style={style}
                onClick={
                  column.sortable ? () => handleSort(column.key) : undefined
                }>
                <div className="flex items-center gap-2">
                  {column.renderHeader
                    ? (column.renderHeader() as React.ReactNode)
                    : column.title}

                  {columnLockable && (
                    <button
                      type="button"
                      aria-label={
                        column.fixed === 'left' || column.fixed === 'right'
                          ? `Unlock column ${column.title}`
                          : `Lock column ${column.title}`
                      }
                      className={classNames(
                        'inline-flex items-center',
                        column.fixed === 'left' || column.fixed === 'right'
                          ? 'text-[var(--tiger-primary,#2563eb)]'
                          : 'text-gray-400 hover:text-gray-700'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColumnLock(column.key);
                      }}>
                      <LockIcon
                        locked={
                          column.fixed === 'left' || column.fixed === 'right'
                        }
                      />
                    </button>
                  )}

                  {column.sortable && <SortIcon direction={sortDirection} />}
                </div>

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
    displayColumns,
    size,
    stickyHeader,
    sortState,
    rowSelection,
    allSelected,
    someSelected,
    handleSort,
    handleFilter,
    handleSelectAll,
    columnLockable,
    toggleColumnLock,
    fixedColumnsInfo,
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
              colSpan={displayColumns.length + (rowSelection ? 1 : 0)}
              className={tableEmptyStateClasses}>
              <div role="status" aria-live="polite">
                {emptyText}
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {paginatedData.map((record, index) => {
          const key = pageRowKeys[index];
          const isSelected = selectedRowKeySet.has(key);
          const rowClass =
            typeof rowClassName === 'function'
              ? rowClassName(record, index)
              : rowClassName;

          return (
            <tr
              key={key}
              className={classNames(
                getTableRowClasses(
                  hoverable,
                  striped,
                  index % 2 === 0,
                  rowClass
                ),
                fixedColumnsInfo.hasFixedColumns && 'group'
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
              {displayColumns.map((column) => {
                const dataKey = column.dataKey || column.key;
                const cellValue = record[dataKey];

                const isFixedLeft = column.fixed === 'left';
                const isFixedRight = column.fixed === 'right';
                const fixedStyle = isFixedLeft
                  ? {
                      position: 'sticky' as const,
                      left: `${
                        fixedColumnsInfo.leftOffsets[column.key] || 0
                      }px`,
                      zIndex: 10,
                    }
                  : isFixedRight
                  ? {
                      position: 'sticky' as const,
                      right: `${
                        fixedColumnsInfo.rightOffsets[column.key] || 0
                      }px`,
                      zIndex: 10,
                    }
                  : undefined;

                const widthStyle = column.width
                  ? {
                      width:
                        typeof column.width === 'number'
                          ? `${column.width}px`
                          : column.width,
                    }
                  : undefined;

                const style = fixedStyle
                  ? { ...widthStyle, ...fixedStyle }
                  : widthStyle;

                const stickyBgClass =
                  striped && index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white';

                const stickyCellClass =
                  isFixedLeft || isFixedRight
                    ? classNames(
                        stickyBgClass,
                        hoverable && 'group-hover:bg-gray-50'
                      )
                    : undefined;

                return (
                  <td
                    key={column.key}
                    className={classNames(
                      getTableCellClasses(
                        size,
                        column.align || 'left',
                        column.className
                      ),
                      stickyCellClass
                    )}
                    style={style}>
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
    displayColumns,
    rowSelection,
    emptyText,
    pageRowKeys,
    selectedRowKeySet,
    rowClassName,
    hoverable,
    striped,
    size,
    handleRowClick,
    handleSelectRow,
    fixedColumnsInfo,
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
    <div className={classNames('relative', className)}>
      <div
        className={getTableWrapperClasses(bordered, maxHeight)}
        style={wrapperStyle}
        aria-busy={loading}>
        <table
          className={tableBaseClasses}
          {...props}
          style={
            fixedColumnsInfo.hasFixedColumns && fixedColumnsInfo.minTableWidth
              ? {
                  ...(props as React.HTMLAttributes<HTMLTableElement>).style,
                  minWidth: `${fixedColumnsInfo.minTableWidth}px`,
                }
              : (props as React.HTMLAttributes<HTMLTableElement>).style
          }>
          {renderTableHeader()}
          {renderTableBody()}
        </table>

        {/* Loading overlay */}
        {loading && (
          <div
            className={tableLoadingOverlayClasses}
            role="status"
            aria-live="polite"
            aria-label="Loading">
            <LoadingSpinner />
            <span className="sr-only">Loading</span>
          </div>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
