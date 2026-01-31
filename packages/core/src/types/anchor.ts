/**
 * Anchor component types and interfaces
 */

/**
 * Anchor direction - determines the orientation of the anchor navigation
 */
export type AnchorDirection = 'vertical' | 'horizontal'

/**
 * Base anchor props interface
 */
export interface AnchorProps {
  /**
   * Whether to fix the anchor to the viewport
   * @default true
   */
  affix?: boolean
  /**
   * Anchor detection boundary in pixels
   * @default 5
   */
  bounds?: number
  /**
   * Offset from top of viewport when fixed
   * @default 0
   */
  offsetTop?: number
  /**
   * Whether to show ink indicator when in fixed mode
   * @default false
   */
  showInkInFixed?: boolean
  /**
   * Offset when scrolling to target anchor
   */
  targetOffset?: number
  /**
   * Custom function to determine current active anchor
   */
  getCurrentAnchor?: (activeLink: string) => string
  /**
   * Get the scroll container
   * @default () => window
   */
  getContainer?: () => HTMLElement | Window
  /**
   * Direction of the anchor navigation
   * @default 'vertical'
   */
  direction?: AnchorDirection
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}

/**
 * Anchor link props interface
 */
export interface AnchorLinkProps {
  /**
   * Target anchor ID (with #)
   */
  href: string
  /**
   * Link title/text
   */
  title?: string
  /**
   * Link target attribute
   */
  target?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Anchor click event info
 */
export interface AnchorClickInfo {
  /**
   * The click event
   */
  event: Event
  /**
   * The href of the clicked link
   */
  href: string
}

/**
 * Anchor change event info
 */
export interface AnchorChangeInfo {
  /**
   * The current active anchor href
   */
  currentActiveLink: string
}
