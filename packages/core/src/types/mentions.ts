/**
 * Mentions component types and interfaces
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'
import type { TigerLocale } from './locale'
import type { FloatingPlacement } from '../utils/floating'

/**
 * A single mention option
 */
export interface MentionOption {
  /**
   * Token written on insert: `prefix + value + ' '`.
   */
  value: string
  /** Display label shown in the list */
  label: string
  /** Whether this option is disabled */
  disabled?: boolean
  /**
   * Stable identity used for list keys. Falls back to index + value.
   */
  id?: string
}

/**
 * Filter for mention suggestions. `true` matches `label` and `value`
 * (case-insensitive substring). `false` keeps the full list.
 */
export type MentionsFilterOption = boolean | ((query: string, option: MentionOption) => boolean)

/**
 * Shared Mentions props (framework-agnostic)
 *
 * Inserted tokens are always `prefix + option.value + space`. Parse them
 * back with `parseMentions`. `undefined` value is uncontrolled; `''` is a
 * legal empty body.
 */
export interface MentionsProps {
  /**
   * Trigger character(s). A single character or several (`['@', '#']`).
   * @default '@'
   */
  prefix?: string | string[]
  /** Available mention options */
  options?: MentionOption[]
  /**
   * Textarea value. `undefined` is uncontrolled; `''` is a legal empty body.
   */
  value?: string
  /**
   * Initial textarea value when `value` is omitted.
   * @default ''
   */
  defaultValue?: string
  /**
   * Controlled open state. `undefined` is uncontrolled.
   */
  open?: boolean
  /**
   * Initial open state when `open` is omitted.
   * @default false
   */
  defaultOpen?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: ComponentSize
  /** Number of visible rows */
  rows?: number
  /** Validation status */
  status?: InputStatus
  /** Error message rendered under the textarea */
  errorMessage?: string
  /** Native name attribute on the textarea */
  name?: string
  /** Native id attribute on the textarea */
  id?: string
  /** Show a loading state instead of treating an empty list as no match */
  loading?: boolean
  /**
   * Local filter. Default matches both `label` and `value`.
   * @default true
   */
  filterOption?: MentionsFilterOption
  /** Overlay placement relative to the textarea */
  placement?: FloatingPlacement
  /** Overlay offset in pixels */
  offset?: number
  /** Extra class on the dropdown panel */
  dropdownClassName?: string
  /** Override portal target (otherwise overlay-host → ConfigProvider → body) */
  getPopupContainer?: () => HTMLElement | null
  /**
   * Dropdown list max height in pixels.
   * @default 256
   */
  listHeight?: number
  /** Locale override merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Custom class name */
  className?: string
}
