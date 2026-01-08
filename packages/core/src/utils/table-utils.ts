/**
 * Table component utilities and styling functions
 */

import { classNames } from './class-names';
import type {
  TableSize,
  ColumnAlign,
  SortDirection,
  TableColumn,
} from '../types/table';

/**
 * Base table container classes
 */
export const tableContainerClasses = 'relative w-full overflow-auto';

/**
 * Base table classes
 */
export const tableBaseClasses = 'w-full border-collapse';

/**
 * Parse a column width into a pixel number.
 *
 * Notes:
 * - Returns 0 when width is undefined or not a pixel value.
 * - For sticky/fixed columns, a numeric (or px string) width is recommended.
 */
export function parseWidthToPx(width?: string | number): number {
  if (typeof width === 'number' && Number.isFinite(width)) {
    return width;
  }

  if (typeof width === 'string') {
    const trimmed = width.trim();
    const match = trimmed.match(/^(\d+(?:\.\d+)?)(px)?$/);
    if (match) {
      return Number(match[1]);
    }
  }

  return 0;
}

/**
 * Calculate sticky offsets for fixed columns.
 */
export function getFixedColumnOffsets<T = Record<string, unknown>>(
  columns: TableColumn<T>[]
): {
  leftOffsets: Record<string, number>;
  rightOffsets: Record<string, number>;
  minTableWidth: number;
  hasFixedColumns: boolean;
} {
  const leftOffsets: Record<string, number> = {};
  const rightOffsets: Record<string, number> = {};

  let left = 0;
  for (const column of columns) {
    if (column.fixed === 'left') {
      leftOffsets[column.key] = left;
    }
    left += parseWidthToPx(column.width);
  }

  let right = 0;
  for (let i = columns.length - 1; i >= 0; i--) {
    const column = columns[i];
    if (column.fixed === 'right') {
      rightOffsets[column.key] = right;
    }
    right += parseWidthToPx(column.width);
  }

  const minTableWidth = columns.reduce(
    (sum, col) => sum + parseWidthToPx(col.width),
    0
  );
  const hasFixedColumns =
    Object.keys(leftOffsets).length > 0 || Object.keys(rightOffsets).length > 0;

  return { leftOffsets, rightOffsets, minTableWidth, hasFixedColumns };
}

/**
 * Get table wrapper classes
 */
export function getTableWrapperClasses(
  bordered: boolean,
  maxHeight?: string | number
): string {
  return classNames(
    tableContainerClasses,
    bordered && 'border border-gray-200 rounded-lg',
    maxHeight && 'overflow-y-auto'
  );
}

/**
 * Get table header classes
 */
export function getTableHeaderClasses(stickyHeader: boolean): string {
  return classNames(
    'bg-gray-50 border-b border-gray-200',
    stickyHeader && 'sticky top-0 z-10'
  );
}

/**
 * Get table header cell classes
 */
export function getTableHeaderCellClasses(
  size: TableSize,
  align: ColumnAlign,
  sortable: boolean,
  customClassName?: string
): string {
  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return classNames(
    'font-medium text-gray-700 text-sm',
    paddingClasses[size],
    alignClasses[align],
    sortable &&
      'cursor-pointer select-none hover:bg-gray-100 transition-colors',
    customClassName
  );
}

/**
 * Get table body row classes
 */
export function getTableRowClasses(
  hoverable: boolean,
  striped: boolean,
  isEven: boolean,
  customClassName?: string
): string {
  return classNames(
    'border-b border-gray-200 last:border-b-0',
    hoverable && 'hover:bg-gray-50 transition-colors',
    striped && isEven && 'bg-gray-50/50',
    customClassName
  );
}

/**
 * Get table cell classes
 */
export function getTableCellClasses(
  size: TableSize,
  align: ColumnAlign,
  customClassName?: string
): string {
  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return classNames(
    'text-sm text-gray-900',
    paddingClasses[size],
    alignClasses[align],
    customClassName
  );
}

/**
 * Get sort icon classes
 */
export function getSortIconClasses(active: boolean): string {
  return classNames(
    'inline-block ml-1 transition-colors',
    active ? 'text-[var(--tiger-primary,#2563eb)]' : 'text-gray-400'
  );
}

/**
 * Get empty state classes
 */
export const tableEmptyStateClasses = 'text-center py-12 text-gray-500';

/**
 * Get loading overlay classes
 */
export const tableLoadingOverlayClasses = classNames(
  'absolute inset-0 bg-white/80 flex items-center justify-center z-20'
);

/**
 * Get pagination container classes
 */
export const tablePaginationContainerClasses = classNames(
  'flex items-center justify-between px-4 py-3 border-t border-gray-200'
);

/**
 * Get checkbox cell classes
 */
export function getCheckboxCellClasses(size: TableSize): string {
  const widthClasses = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12',
  };

  return classNames('text-center', widthClasses[size]);
}

/**
 * Default sort function for comparable values
 */
export function defaultSortFn(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

/**
 * Sort data array by column
 */
export function sortData<T>(
  data: T[],
  key: string,
  direction: SortDirection,
  sortFn?: (a: unknown, b: unknown) => number
): T[] {
  if (!direction || !key) {
    return data;
  }

  const sortedData = [...data].sort((a, b) => {
    const aValue = (a as Record<string, unknown>)[key];
    const bValue = (b as Record<string, unknown>)[key];

    const compareResult = sortFn
      ? sortFn(aValue, bValue)
      : defaultSortFn(aValue, bValue);

    return direction === 'asc' ? compareResult : -compareResult;
  });

  return sortedData;
}

/**
 * Filter data array by filter values
 */
export function filterData<T>(
  data: T[],
  filters: Record<string, unknown>
): T[] {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }

  return data.filter((record) => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (
        filterValue === '' ||
        filterValue === null ||
        filterValue === undefined
      ) {
        return true;
      }

      const cellValue = (record as Record<string, unknown>)[key];

      if (typeof filterValue === 'string') {
        return String(cellValue)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }

      return cellValue === filterValue;
    });
  });
}

/**
 * Paginate data array
 */
export function paginateData<T>(
  data: T[],
  current: number,
  pageSize: number
): T[] {
  const startIndex = (current - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

/**
 * Calculate pagination info
 */
export function calculatePagination(
  total: number,
  current: number,
  pageSize: number
): {
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (current - 1) * pageSize + 1;
  const endIndex = Math.min(current * pageSize, total);

  return {
    totalPages,
    startIndex,
    endIndex,
    hasNext: current < totalPages,
    hasPrev: current > 1,
  };
}

/**
 * Get row key from record
 */
export function getRowKey<T>(
  record: T,
  rowKey: string | ((record: T) => string | number),
  index: number
): string | number {
  if (typeof rowKey === 'function') {
    return rowKey(record);
  }

  const key = (record as Record<string, unknown>)[rowKey];

  if (key !== undefined && key !== null) {
    return key as string | number;
  }

  return index;
}
