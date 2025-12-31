/**
 * Timeline component types and interfaces
 */

/**
 * Timeline mode/direction types
 */
export type TimelineMode = 'left' | 'right' | 'alternate'

/**
 * Timeline item position for alternate mode
 */
export type TimelineItemPosition = 'left' | 'right'

/**
 * Timeline item interface
 */
export interface TimelineItem {
  /**
   * Unique key for the timeline item
   */
  key?: string | number
  /**
   * Item label/timestamp
   */
  label?: string
  /**
   * Item content/description
   */
  content?: string
  /**
   * Item color (supports CSS color values)
   */
  color?: string
  /**
   * Custom dot content (icon, element, etc.)
   */
  dot?: unknown
  /**
   * Position for alternate mode
   */
  position?: TimelineItemPosition
  /**
   * Custom data
   */
  [key: string]: unknown
}

/**
 * Base timeline props interface
 */
export interface TimelineProps {
  /**
   * Timeline mode/direction
   * @default 'left'
   */
  mode?: TimelineMode
  /**
   * Whether to show the connector line in pending state
   * @default false
   */
  pending?: boolean
  /**
   * Pending item dot content
   */
  pendingDot?: unknown
  /**
   * Whether to reverse the timeline order
   * @default false
   */
  reverse?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}
