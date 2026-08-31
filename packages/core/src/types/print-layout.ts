/**
 * PrintLayout component types and interfaces
 * @since 0.9.0
 */

import type { TigerLocale } from './locale'

/**
 * Print page size presets
 */
export type PrintPageSize = 'A4' | 'A3' | 'Letter' | 'Legal'

/**
 * Custom page size in CSS lengths. Used when `pageSize` is omitted and both
 * `pageWidth` / `pageHeight` are set.
 */
export interface PrintPageBox {
  width: string
  height: string
  /** Value for `@page { size: … }` */
  pageSize: string
}

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
   * Whether to show a repeating header on every printed page
   * @default false
   */
  showHeader?: boolean

  /**
   * Whether to show a repeating footer on every printed page
   * @default false
   */
  showFooter?: boolean

  /**
   * Header text content (visible in the screen preview and on every printed page)
   */
  headerText?: string

  /**
   * Footer text content (visible in the screen preview and on every printed page)
   */
  footerText?: string

  /**
   * Whether to show page break indicators in screen view
   * @default true
   */
  showPageBreaks?: boolean

  /**
   * Custom page width (CSS length, or a number in mm). Used with `pageHeight`
   * when no named `pageSize` preset should apply.
   */
  pageWidth?: number | string

  /**
   * Custom page height (CSS length, or a number in mm).
   */
  pageHeight?: number | string

  /**
   * Locale overlay
   */
  locale?: Partial<TigerLocale>

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Imperative handle on PrintLayout.
 */
export interface PrintLayoutInstance {
  /** Restrict `window.print()` to this root, then restore. */
  print: () => void
  getRoot: () => HTMLElement | null
}
