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
   * Use immediate scroll when set to 0; positive values use native smooth scrolling
   * @default 450
   */
  duration?: number
}
