/**
 * Select component types and interfaces
 */

import type { ComponentSize } from './base'

export type SelectValue = string | number

export type SelectValues = SelectValue[]

export type SelectModelValue = SelectValue | SelectValues | undefined

/**
 * Single select option
 */
export interface SelectOption {
  /**
   * Option value
   */
  value: SelectValue

  /**
   * Option label (displayed text)
   */
  label: string

  /**
   * Whether the option is disabled
   * @default false
   */
  disabled?: boolean
}

/**
 * Option group
 */
export interface SelectOptionGroup {
  /**
   * Group label
   */
  label: string

  /**
   * Options in this group
   */
  options: SelectOption[]
}

export type SelectOptions = Array<SelectOption | SelectOptionGroup>

/**
 * Base select props interface
 */
export interface SelectProps {
  /**
   * Select size
   * @default 'md'
   */
  size?: ComponentSize

  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string

  /**
   * Whether to allow search/filter
   * @default false
   */
  searchable?: boolean

  /**
   * Controlled search input value.
   */
  searchValue?: string

  /**
   * Default search input value for uncontrolled search.
   */
  defaultSearchValue?: string

  /**
   * Whether to allow multiple selection
   * @default false
   */
  multiple?: boolean

  /**
   * Whether to clear the selection
   * @default true
   */
  clearable?: boolean

  /**
   * Options list (can be flat list or grouped)
   */
  options?: SelectOptions

  /**
   * Text to display when the options list is empty or no search result matches.
   * Defaults to ConfigProvider locale `common.emptyText`.
   */
  emptyText?: string

  /**
   * Maximum number of tags to display in multi-select mode.
   * Remaining selections are shown as "+N more".
   * @since 0.5.0
   */
  maxTagCount?: number

  /**
   * Whether to use virtual scrolling for large option lists.
   * When enabled, only visible options are rendered for better performance.
   * @default false
   * @since 0.5.0
   */
  virtual?: boolean

  /**
   * Whether search is handled remotely. When true, local option filtering is skipped.
   * @default false
   */
  remote?: boolean

  /**
   * Debounce delay for search callbacks in milliseconds.
   * @default 0
   */
  searchDebounce?: number

  /**
   * Whether users can create a new option from the current search query.
   * @default false
   */
  creatable?: boolean

  /**
   * Prefix text used for the creatable option row.
   * @default 'Create'
   */
  createOptionText?: string

  /**
   * Height of the dropdown panel in pixels (relevant when virtual is true)
   * @default 256
   * @since 0.5.0
   */
  listHeight?: number
}
