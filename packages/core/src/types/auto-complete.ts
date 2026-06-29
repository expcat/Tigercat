/**
 * AutoComplete option
 */

import type { ComponentSize } from './base'
import type { TigerLocale } from './locale'
export interface AutoCompleteOption {
  /** Display text */
  label: string
  /** Option value */
  value: string | number
  /** Whether the option is disabled */
  disabled?: boolean
}

/**
 * Shared AutoComplete props (framework-agnostic)
 */
export interface AutoCompleteProps {
  /** Locale override merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>

  /** Options list */
  options?: AutoCompleteOption[]
  /** Placeholder text */
  placeholder?: string
  /** Controlled search input value */
  searchValue?: string
  /** Default search input value */
  defaultSearchValue?: string
  /** Component size */
  size?: ComponentSize
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether to show clear button */
  clearable?: boolean
  /** Text shown when no options match */
  emptyText?: string
  /** Whether to filter options locally based on input value (default: true) */
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  /** Custom class name */
  className?: string
  /** Whether to highlight the first matching option when the dropdown opens */
  defaultActiveFirstOption?: boolean
  /**
   * Whether to allow free-form text input not limited to the options.
   * When `false`, the committed value is constrained to an existing option on
   * blur/Enter — input that doesn't match any option is reverted (default: true).
   */
  allowFreeInput?: boolean
}
