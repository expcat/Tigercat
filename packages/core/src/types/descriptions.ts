/**
 * Descriptions component types and interfaces
 */

/**
 * Descriptions size types
 */
export type DescriptionsSize = 'sm' | 'md' | 'lg'

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
   * Whether to show border
   * @default false
   */
  bordered?: boolean
  
  /**
   * Number of columns per row
   * @default 3
   */
  column?: number
  
  /**
   * Descriptions size
   * @default 'md'
   */
  size?: DescriptionsSize
  
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
   * Additional CSS classes
   */
  className?: string
}
