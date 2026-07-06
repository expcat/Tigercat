/**
 * List component types and interfaces
 */
import type { ComponentSize } from './base'

/**
 * List item layout types
 */
export type ListItemLayout = 'horizontal' | 'vertical'

/**
 * List border style types
 */
export type ListBorderStyle = 'none' | 'divided' | 'bordered'

/**
 * List data item interface
 */
export interface ListItem {
  /**
   * Unique key for the list item
   */
  key?: string | number
  /**
   * Item title
   */
  title?: string
  /**
   * Item description
   */
  description?: string
  /**
   * Item avatar/icon
   */
  avatar?: unknown
  /**
   * Extra content
   */
  extra?: unknown
  /**
   * Custom data
   */
  [key: string]: unknown
}

/**
 * Pagination configuration for list
 */
export interface ListPaginationConfig {
  /**
   * Current page number
   */
  current?: number
  /**
   * Number of items per page
   */
  pageSize?: number
  /**
   * Total number of items
   */
  total?: number
  /**
   * Remote (server-side) pagination mode. When true, `dataSource` is treated
   * as the current page and the list skips internal slicing; page count and
   * range text are derived from `total`, and `current`/`pageSize` act as
   * controlled props.
   * @default false
   */
  remote?: boolean
  /**
   * Page size options
   */
  pageSizeOptions?: number[]
  /**
   * Show size changer
   */
  showSizeChanger?: boolean
  /**
   * Force simple mode (prev/next with a page indicator, no page-number
   * buttons). By default simple mode is used when there are 3 pages or
   * fewer, and full page-number buttons appear above that.
   */
  simple?: boolean
  /**
   * Whether to show the quick jumper (input to jump to a page).
   * By default it appears automatically when there are more than 3 pages.
   */
  showQuickJumper?: boolean
  /**
   * Show total items
   */
  showTotal?: boolean
  /**
   * Custom total text
   */
  totalText?: (total: number, range: [number, number]) => string
}

/**
 * Base list props interface
 */
export interface ListProps {
  /**
   * List size
   * @default 'md'
   */
  size?: ComponentSize
  /**
   * List border style
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
  header?: unknown
  /**
   * List footer content
   */
  footer?: unknown
  /**
   * Pagination configuration, set to false to disable
   */
  pagination?: ListPaginationConfig | false
  /**
   * Enable fixed-height virtual rendering via VirtualList.
   * Recommended for large non-grid lists.
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
   * Grid configuration for grid layout
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
   * Additional CSS classes
   */
  className?: string
  /**
   * Whether list items are draggable for reorder
   * @default false
   */
  draggable?: boolean
}
