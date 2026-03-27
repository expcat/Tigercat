/**
 * PrintLayout component types and interfaces
 * @since 0.9.0
 */

/**
 * Print page size presets
 */
export type PrintPageSize = 'A4' | 'A3' | 'Letter' | 'Legal' | 'custom'

/**
 * Print orientation
 */
export type PrintOrientation = 'portrait' | 'landscape'

/**
 * Base PrintLayout props interface
 */
export interface PrintLayoutProps {
  /**
   * Page size preset
   * @default 'A4'
   */
  pageSize?: PrintPageSize

  /**
   * Page orientation
   * @default 'portrait'
   */
  orientation?: PrintOrientation

  /**
   * Whether to show print-only header
   * @default false
   */
  showHeader?: boolean

  /**
   * Whether to show print-only footer
   * @default false
   */
  showFooter?: boolean

  /**
   * Header text content (appears only in print)
   */
  headerText?: string

  /**
   * Footer text content (appears only in print)
   */
  footerText?: string

  /**
   * Whether to show page break indicators in screen view
   * @default true
   */
  showPageBreaks?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}
