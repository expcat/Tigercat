/**
 * Transfer item data
 */

import type { ComponentSize } from './base'

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
 * Transfer direction
 */
export type TransferDirection = 'left' | 'right'

export interface TransferSearchValue {
  source?: string
  target?: string
}

/**
 * Shared Transfer props (framework-agnostic)
 */
export interface TransferProps {
  /** All available data items */
  dataSource?: TransferItem[]
  /** Keys of items in the right (target) list */
  targetKeys?: (string | number)[]
  /** Component size */
  size?: ComponentSize
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether to show search input in each panel */
  searchable?: boolean
  /** Controlled search input values for source and target panels */
  searchValue?: TransferSearchValue
  /** Default search input values for source and target panels */
  defaultSearchValue?: TransferSearchValue
  /** Title for left panel */
  sourceTitle?: string
  /** Title for right panel */
  targetTitle?: string
  /** Text shown when a panel has no items */
  emptyText?: string
  /** Custom class name */
  className?: string
  /** Custom filter function */
  filterOption?: (inputValue: string, item: TransferItem) => boolean
}
