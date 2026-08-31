/**
 * Descriptions component types and interfaces
 */
import type { ComponentSize } from './base'
import type { ResponsiveBreakpoint } from '../utils/responsive'
import type { TigerLocale } from './locale'

/**
 * Descriptions layout types
 */
export type DescriptionsLayout = 'horizontal' | 'vertical'

/**
 * Descriptions item interface
 */
export interface DescriptionsItem {
  /**
   * Label text for the item
   */
  label: string

  /**
   * Content/value for the item
   */
  content?: unknown

  /**
   * Number of columns to span
   * @default 1
   */
  span?: number

  /**
   * Custom label class
   */
  labelClassName?: string

  /**
   * Custom content class
   */
  contentClassName?: string
}

/**
 * Base descriptions props interface
 */
export interface DescriptionsProps {
  /**
   * Descriptions title
   */
  title?: string

  /**
   * Extra content (actions, links, etc.)
   */
  extra?: unknown

  /**
   * Description items. This is the data source — default slot/children are not items.
   */
  items?: DescriptionsItem[]

  /**
   * Whether to show border
   * @default false
   */
  bordered?: boolean

  /**
   * Number of columns per row.
   * A breakpoint map is resolved against the **container** width, using
   * `--tiger-breakpoint-*` (`xs` … `2xl`).
   * @default 3
   */
  column?: number | Partial<Record<ResponsiveBreakpoint, number>>

  /**
   * Descriptions size
   * @default 'md'
   */
  size?: ComponentSize

  /**
   * Descriptions layout
   * @default 'horizontal'
   */
  layout?: DescriptionsLayout

  /**
   * Whether to show colon after label
   * @default true
   */
  colon?: boolean

  /**
   * Label style (CSS properties object)
   */
  labelStyle?: Record<string, string>

  /**
   * Content style (CSS properties object)
   */
  contentStyle?: Record<string, string>

  /**
   * Locale overlay
   */
  locale?: Partial<TigerLocale>

  /**
   * Additional CSS classes
   */
  className?: string
}
