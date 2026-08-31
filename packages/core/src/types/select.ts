/**
 * Select component types and interfaces
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'
import type { TigerLocale, TigerLocaleSelect } from './locale'
import type { FloatingPlacement } from '../utils/floating'

export type SelectValue = string | number

export type SelectValues = SelectValue[]

export type SelectModelValue = SelectValue | SelectValues | undefined

/**
 * Predicate used to decide whether an option matches the current search query.
 */
export type SelectFilterOption = (query: string, option: SelectOption) => boolean

/**
 * Single select option
 */
export interface SelectOption {
  /**
   * Option value. `''` is a legal value (not “unselected”).
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

  /**
   * Stable identity used for list keys. Falls back to index + value.
   */
  id?: string
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
   * Selected value(s). `undefined` is empty / uncontrolled; `''` is a legal option value.
   */
  value?: SelectModelValue

  /**
   * Initial value when `value` is omitted.
   */
  defaultValue?: SelectModelValue

  /**
   * Controlled open state. `undefined` is uncontrolled.
   */
  open?: boolean

  /**
   * Initial open state when `open` is omitted.
   */
  defaultOpen?: boolean

  /**
   * Text to display when the options list is empty or no search result matches.
   * Defaults to ConfigProvider locale `select.emptyText`.
   */
  emptyText?: string

  /**
   * Maximum number of tags to display in multi-select mode.
   * Remaining selections are shown with `select.moreCountText`.
   * @since 0.5.0
   */
  maxTagCount?: number

  /**
   * Whether to use virtual scrolling for large option lists.
   * Groups are flattened into the same window (group headers are rows).
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
   * Debounce delay for the search callback in milliseconds.
   * The search input itself updates immediately.
   * @default 0
   */
  searchDebounce?: number

  /**
   * Whether users can create a new option from the current search query.
   * @default false
   */
  creatable?: boolean

  /**
   * Override for the creatable option sentence. `{label}` is replaced with the query.
   * A value without `{label}` is treated as a prefix (`Create "query"`).
   */
  createOptionText?: string

  /**
   * Height of the dropdown panel content area in pixels.
   * @default 256
   * @since 0.5.0
   */
  listHeight?: number

  /**
   * Clear the search query after selecting in multiple mode.
   * @default true
   */
  autoClearSearchValue?: boolean

  /**
   * Remote-loading flag. Empty lists show `select.loadingText` instead of empty.
   * @default false
   */
  loading?: boolean

  /**
   * Validation status. Also read from FormItem when omitted.
   * @default 'default'
   */
  status?: InputStatus

  /**
   * Native form field name. Serialized through hidden inputs.
   */
  name?: string

  /**
   * Custom option filter. Default matches label and value (case-insensitive).
   * A matching group label keeps the whole group.
   */
  filterOption?: SelectFilterOption

  /**
   * Overlay placement.
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement

  /**
   * Overlay offset in pixels.
   * @default 4
   */
  offset?: number

  /**
   * Extra class names for the dropdown panel.
   */
  dropdownClassName?: string

  /**
   * Portal container. Defaults to the overlay-host → ConfigProvider → body chain.
   */
  getPopupContainer?: () => HTMLElement | null

  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>

  /**
   * UI labels for custom text. Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<TigerLocaleSelect>
}
