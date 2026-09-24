/**
 * Transfer item data
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'
import type { TigerLocale, TigerLocaleTransfer } from './locale'

export interface TransferItem {
  /** Unique key. `1` and `'1'` are the same key. */
  key: string | number
  /** Display label */
  label: string
  /** Whether the item is disabled */
  disabled?: boolean
  /** Secondary text. Rendered by default and included in the default filter. */
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

export interface TransferSelectedKeys {
  source: (string | number)[]
  target: (string | number)[]
}

/**
 * Shared Transfer props (framework-agnostic)
 */
export interface TransferProps {
  /** All available data items */
  dataSource?: TransferItem[]
  /**
   * Controlled target keys. `undefined` is uncontrolled; `[]` is a real empty
   * target list. `null` and `''` from a named field are an empty list.
   */
  value?: (string | number)[]
  /** Uncontrolled initial target keys. */
  defaultValue?: (string | number)[]
  /**
   * Focusable and submittable, but selection and moves do not change the value.
   */
  readOnly?: boolean
  /**
   * Controlled checkbox selection in each panel. Search-hidden keys stay
   * selected until cleared or moved; the header count includes them.
   */
  selectedKeys?: TransferSelectedKeys
  /** Uncontrolled initial checkbox selection. */
  defaultSelectedKeys?: TransferSelectedKeys
  /** Native form field name. Each target key is one hidden input. */
  name?: string
  /** Visual validation status. Do not spread as a DOM attribute. */
  status?: InputStatus
  /** Component size */
  size?: ComponentSize
  /** Whether the component is disabled */
  disabled?: boolean
  /**
   * Whether to show search input in each panel
   * @default false
   */
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
  /** Locale overlay merged on ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Text/aria label overrides */
  labels?: Partial<TigerLocaleTransfer>
}
