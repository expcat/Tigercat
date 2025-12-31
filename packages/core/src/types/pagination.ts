/**
 * Pagination component types and interfaces
 */

/**
 * Pagination size type
 */
export type PaginationSize = 'small' | 'medium' | 'large'

/**
 * Pagination alignment type
 */
export type PaginationAlign = 'left' | 'center' | 'right'

/**
 * Base pagination props interface
 */
export interface PaginationProps {
  /**
   * Current page number (1-indexed)
   * @default 1
   */
  current?: number

  /**
   * Default current page (for uncontrolled mode)
   * @default 1
   */
  defaultCurrent?: number

  /**
   * Total number of items
   * @default 0
   */
  total?: number

  /**
   * Number of items per page
   * @default 10
   */
  pageSize?: number

  /**
   * Default page size (for uncontrolled mode)
   * @default 10
   */
  defaultPageSize?: number

  /**
   * Available page size options
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[]

  /**
   * Whether to show quick jumper (input for page number)
   * @default false
   */
  showQuickJumper?: boolean

  /**
   * Whether to show page size selector
   * @default false
   */
  showSizeChanger?: boolean

  /**
   * Whether to show total count
   * @default true
   */
  showTotal?: boolean

  /**
   * Custom total text renderer
   * @param total - Total number of items
   * @param range - Current page range [start, end]
   * @returns Custom text to display
   */
  totalText?: (total: number, range: [number, number]) => string

  /**
   * Simple mode - only show prev/next buttons
   * @default false
   */
  simple?: boolean

  /**
   * Size of pagination
   * @default 'medium'
   */
  size?: PaginationSize

  /**
   * Alignment of pagination
   * @default 'center'
   */
  align?: PaginationAlign

  /**
   * Whether pagination is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether to hide pagination on single page
   * @default false
   */
  hideOnSinglePage?: boolean

  /**
   * Number of page buttons to show on each side of current page
   * @default 2
   */
  showLessItems?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}

/**
 * Page change event info
 */
export interface PageChangeInfo {
  /**
   * New current page
   */
  current: number

  /**
   * Current page size
   */
  pageSize: number
}

/**
 * Page size change event info
 */
export interface PageSizeChangeInfo {
  /**
   * Current page (might be adjusted)
   */
  current: number

  /**
   * New page size
   */
  pageSize: number
}
