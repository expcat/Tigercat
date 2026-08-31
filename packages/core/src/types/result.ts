/**
 * Result component types and interfaces
 */

/**
 * Result status type — determines the icon and color scheme
 */
export type ResultStatus = 'success' | 'error' | 'warning' | 'info' | '404' | '403' | '500'

export type ResultHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Base result props interface (framework-agnostic)
 */
export interface ResultProps {
  /**
   * Result status — determines the icon and color scheme
   * @default 'info'
   */
  status?: ResultStatus

  /**
   * Title. Rendered as a heading (`headingLevel`, default `h2`).
   * Not the native HTML tooltip.
   */
  title?: string

  /**
   * Subtitle / description text
   */
  subTitle?: string

  /**
   * Heading level used when `title` is set.
   * @default 2
   */
  headingLevel?: ResultHeadingLevel

  /**
   * Additional CSS class name
   */
  className?: string
}
