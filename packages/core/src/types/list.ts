/**
 * List component types and interfaces
 */

/**
 * List size types
 */
export type ListSize = 'sm' | 'md' | 'lg';

/**
 * List item layout types
 */
export type ListItemLayout = 'horizontal' | 'vertical';

/**
 * List border style types
 */
export type ListBorderStyle = 'none' | 'divided' | 'bordered';

/**
 * List data item interface
 */
export interface ListItem {
  /**
   * Unique key for the list item
   */
  key?: string | number;
  /**
   * Item title
   */
  title?: string;
  /**
   * Item description
   */
  description?: string;
  /**
   * Item avatar/icon
   */
  avatar?: unknown;
  /**
   * Extra content
   */
  extra?: unknown;
  /**
   * Custom data
   */
  [key: string]: unknown;
}

/**
 * Pagination configuration for list
 */
export interface ListPaginationConfig {
  /**
   * Current page number
   */
  current?: number;
  /**
   * Number of items per page
   */
  pageSize?: number;
  /**
   * Total number of items
   */
  total?: number;
  /**
   * Page size options
   */
  pageSizeOptions?: number[];
  /**
   * Show size changer
   */
  showSizeChanger?: boolean;
  /**
   * Show total items
   */
  showTotal?: boolean;
  /**
   * Custom total text
   */
  totalText?: (total: number, range: [number, number]) => string;
}

/**
 * Base list props interface
 */
export interface ListProps {
  /**
   * List size
   * @default 'md'
   */
  size?: ListSize;
  /**
   * List border style
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
  header?: unknown;
  /**
   * List footer content
   */
  footer?: unknown;
  /**
   * Pagination configuration, set to false to disable
   */
  pagination?: ListPaginationConfig | false;
  /**
   * Grid configuration for grid layout
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
   * Additional CSS classes
   */
  className?: string;
}
