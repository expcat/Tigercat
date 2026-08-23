/**
 * Highlight component types and interfaces
 */

/**
 * Keyword string(s) and/or regular expression(s) to highlight.
 * String keywords are escaped before matching. Regular expressions keep
 * their own flags except `global`, which follows the component option.
 */
export type HighlightKeywords = string | RegExp | readonly (string | RegExp)[]

/**
 * Inclusive-exclusive match range inside the source text.
 */
export interface HighlightRange {
  start: number
  end: number
}

/**
 * One consecutive slice of source text after matching.
 */
export interface HighlightSegment {
  text: string
  highlighted: boolean
  start: number
  end: number
}

/**
 * Matching options shared by the core helper and component props.
 */
export interface HighlightMatchOptions {
  /**
   * Match case for string keywords. Regular expressions keep their own `i` flag.
   * @default false
   */
  caseSensitive?: boolean

  /**
   * Highlight every occurrence. When false, only the first match of each keyword.
   * @default true
   */
  global?: boolean
}

/**
 * Default case matching
 */
export const DEFAULT_HIGHLIGHT_CASE_SENSITIVE = false

/**
 * Default global matching
 */
export const DEFAULT_HIGHLIGHT_GLOBAL = true

/**
 * Base Highlight props interface (framework-agnostic)
 */
export interface HighlightProps {
  /**
   * Source text to search. When omitted, Vue default slot / React children
   * are flattened to a string.
   */
  text?: string

  /**
   * Keyword string(s) and/or regular expression(s) to highlight.
   */
  keywords?: HighlightKeywords

  /**
   * Match case for string keywords. Regular expressions keep their own `i` flag.
   * @default false
   */
  caseSensitive?: boolean

  /**
   * Highlight every occurrence. When false, only the first match of each keyword.
   * @default true
   */
  global?: boolean

  /**
   * Additional CSS classes on highlighted `mark` elements
   */
  highlightClassName?: string

  /**
   * Inline styles on highlighted `mark` elements
   */
  highlightStyle?: Record<string, unknown>

  /**
   * Additional CSS classes on the root
   */
  className?: string

  /**
   * Inline styles on the root
   */
  style?: Record<string, unknown>
}
