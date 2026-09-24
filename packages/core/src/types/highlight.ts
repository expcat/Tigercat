/**
 * Highlight component types and interfaces
 */

/**
 * Keyword string or strings to highlight. Matching is a linear scan.
 * Regular expressions are not part of the public API.
 */
export type HighlightKeywords = string | readonly string[]

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
   * Match case for string keywords.
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
   * Source text to search. When set, it wins over children/slot. When omitted,
   * children/slot stay in the tree and matching text nodes are wrapped in `mark`.
   */
  text?: string

  /**
   * Keyword string or strings to highlight. Matched literally.
   */
  keywords?: HighlightKeywords

  /**
   * Match case. @default false
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
