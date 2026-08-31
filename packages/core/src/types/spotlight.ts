import type { TigerLocale } from './locale'

export type SpotlightItemKey = string | number

export interface SpotlightItem {
  key: SpotlightItemKey
  label: string
  description?: string
  group?: string
  /** Extra search text. Fuzzy matching reads these in addition to label/description/group. */
  keywords?: string[]
  disabled?: boolean
  icon?: unknown
  /**
   * Accelerator shown as chrome and, while the panel is open, used to select
   * this item. Modifier chords such as `⌘ D` / `Ctrl+K` fire; bare letters
   * are not stolen from the search field.
   */
  shortcut?: string | string[]
  data?: unknown
}

/**
 * Extra predicate ANDed with the default fuzzy match. It does not replace
 * fuzzy scoring; put aliases in `keywords` instead of matching `data` here.
 */
export type SpotlightItemFilter = (query: string, item: SpotlightItem) => boolean

export interface SpotlightHandle {
  open: () => void
  close: () => void
  toggle: () => void
}

export interface SpotlightProps {
  open?: boolean
  defaultOpen?: boolean
  query?: string
  defaultQuery?: string
  items?: SpotlightItem[]
  title?: string
  placeholder?: string
  emptyText?: string
  inputAriaLabel?: string
  listboxLabel?: string
  closeOnSelect?: boolean
  mask?: boolean
  maskClosable?: boolean
  zIndex?: number
  className?: string
  defaultActiveFirstItem?: boolean
  filterItem?: SpotlightItemFilter
  limit?: number
  locale?: Partial<TigerLocale>
  /**
   * Global toggle chord. `true` (default) is `Meta/Ctrl+K`; `false` disables;
   * a string uses the same shortcut grammar as item `shortcut`.
   */
  hotkey?: boolean | string
}
