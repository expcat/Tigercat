/**
 * AutoComplete option
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'
import type { TigerLocale } from './locale'
import type { FloatingPlacement } from '../utils/floating'

export type AutoCompleteValue = string | number

export type AutoCompleteFilterOption =
  boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)

export interface AutoCompleteOption {
  /** Display text */
  label: string
  /**
   * Option value. `''` is a legal value (not “unselected”).
   */
  value: AutoCompleteValue
  /** Whether the option is disabled */
  disabled?: boolean
  /**
   * Stable identity used for list keys. Falls back to index + value.
   */
  id?: string
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
  /**
   * Committed value. `undefined` is unselected; `''` is a legal value.
   * Typing updates the query only — commit happens on option select,
   * Enter, or blur (see `allowFreeInput`).
   */
  value?: AutoCompleteValue
  /**
   * Initial committed value when `value` is omitted.
   */
  defaultValue?: AutoCompleteValue
  /** Controlled search input value */
  searchValue?: string
  /**
   * Initial query when unselected. Ignored once a value is committed.
   */
  defaultSearchValue?: string
  /**
   * Controlled open state. `undefined` is uncontrolled.
   */
  open?: boolean
  /**
   * Initial open state when `open` is omitted.
   */
  defaultOpen?: boolean
  /** Component size */
  size?: ComponentSize
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether to show clear button */
  clearable?: boolean
  /**
   * Text shown when no options match.
   * Defaults to ConfigProvider locale `empty.noResults`.
   */
  emptyText?: string
  /** Whether to filter options locally based on input value (default: true) */
  filterOption?: AutoCompleteFilterOption
  /** Custom class name */
  className?: string
  /**
   * Highlight the first enabled option when the list opens or the query changes.
   * When true (default), Enter on a non-empty list selects that highlight, not
   * free text. Set false to submit the query with Enter while matches exist.
   */
  defaultActiveFirstOption?: boolean
  /**
   * Allow committing text that is not an option (default: true).
   * Typing always updates the query only and never writes `value`.
   * When true, blur (and Enter with no highlight) commits the query,
   * matching label/value case-insensitively when possible.
   * When false, commit only via option click, Enter on a highlight, or a
   * successful blur match; unmatched blur reverts the query.
   * Blur never auto-selects the highlighted option.
   */
  allowFreeInput?: boolean
  /**
   * Validation status. Also read from FormItem when omitted.
   */
  status?: InputStatus
  /**
   * Native form field name.
   */
  name?: string
  /**
   * Remote-loading flag. Empty lists show `common.loadingText` instead of empty.
   */
  loading?: boolean
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
   * Height of the dropdown panel content area in pixels.
   * @default 256
   */
  listHeight?: number
  /**
   * Combobox input id. Also read from FormItem when omitted.
   */
  id?: string
}
