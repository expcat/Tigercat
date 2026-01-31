/**
 * BackTop component types and interfaces
 */

/**
 * Base BackTop props interface
 */
export interface BackTopProps {
  /**
   * Scroll height to show the BackTop button
   * @default 400
   */
  visibilityHeight?: number

  /**
   * Duration of scroll animation in milliseconds
   * @default 450
   */
  duration?: number
}
