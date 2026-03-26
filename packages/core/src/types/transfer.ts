/**
 * Transfer item data
 */
export interface TransferItem {
  /** Unique key */
  key: string | number
  /** Display label */
  label: string
  /** Whether the item is disabled */
  disabled?: boolean
  /** Optional description */
  description?: string
}

/**
 * Transfer size variants
 */
export type TransferSize = 'sm' | 'md' | 'lg'

/**
 * Transfer direction
 */
export type TransferDirection = 'left' | 'right'

/**
 * Shared Transfer props (framework-agnostic)
 */
export interface TransferProps {
  /** All available data items */
  dataSource?: TransferItem[]
  /** Keys of items in the right (target) list */
  targetKeys?: (string | number)[]
  /** Component size */
  size?: TransferSize
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether to show search input in each panel */
  showSearch?: boolean
  /** Title for left panel */
  sourceTitle?: string
  /** Title for right panel */
  targetTitle?: string
  /** Text shown when a panel has no items */
  notFoundText?: string
  /** Custom class name */
  className?: string
  /** Custom filter function */
  filterOption?: (inputValue: string, item: TransferItem) => boolean
}
