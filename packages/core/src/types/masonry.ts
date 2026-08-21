/**
 * Masonry component types and interfaces
 */

import type { ResponsiveBreakpoint } from '../utils/responsive'

/**
 * A number that may vary by responsive breakpoint.
 */
export type MasonryResponsiveValue = number | Partial<Record<ResponsiveBreakpoint, number>>

/**
 * Base Masonry props interface.
 */
export interface MasonryProps {
  /**
   * Column count. Pass a breakpoint map for responsive columns.
   * @default 3
   */
  columns?: MasonryResponsiveValue

  /**
   * Gap between columns and items in px. Pass a breakpoint map for a
   * responsive gap.
   * @default 16
   */
  gap?: MasonryResponsiveValue

  /**
   * Additional CSS class name for the root element
   */
  className?: string

  /**
   * Additional CSS class name for every column element
   */
  columnClassName?: string

  /**
   * Additional CSS class name for every item wrapper element
   */
  itemClassName?: string
}

/**
 * Payload emitted after the layout is (re)computed.
 */
export interface MasonryLayoutDetail {
  /** Number of rendered columns */
  columnCount: number
  /** Occupied height of every column in px, inner gaps included */
  columnHeights: number[]
}

/**
 * Imperative handle exposed through `ref`.
 */
export interface MasonryInstance {
  /** Force a re-measure of all items and redistribute them */
  relayout: () => void
  /** Column count under the current responsive width */
  getColumnCount: () => number
}
