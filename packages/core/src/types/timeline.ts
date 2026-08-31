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
  content?: unknown
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
   * Timeline items
   */
  items?: TimelineItem[]
  /**
   * Timeline mode/direction
   * @default 'left'
   */
  mode?: TimelineMode
  /**
   * Append a pending item after the (optionally reversed) list.
   * Pending stays at the DOM end even when `reverse` is set.
   * @default false
   */
  pending?: boolean
  /**
   * Pending item dot content. Wins over `renderDot` for the pending item.
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
