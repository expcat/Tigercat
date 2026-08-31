/**
 * Anchor component types and interfaces
 */

import type { ScrollRootInput } from './scroll-root'

/**
 * Anchor direction - determines the orientation of the anchor navigation
 */
export type AnchorDirection = 'vertical' | 'horizontal'

/**
 * Base anchor props interface
 */
export interface AnchorProps {
  /**
   * Whether to pin the anchor with Affix (placeholder + live geometry).
   * @default true
   */
  affix?: boolean
  /**
   * Anchor detection boundary in pixels
   * @default 5
   */
  bounds?: number
  /**
   * Offset from top of the scroll root when Affix is on, and fallback
   * scroll offset when `targetOffset` is omitted.
   * @default 0
   */
  offsetTop?: number
  /**
   * Whether to show the ink indicator when Affix is on.
   * @default true
   */
  showInkInFixed?: boolean
  /**
   * Offset when scrolling to a target section
   */
  targetOffset?: number
  /**
   * Transform the detected active href. This is not a controlled value.
   */
  getCurrentAnchor?: (activeLink: string) => string
  /**
   * Scroll container for spy / scrollTo. Selector, Element, Window, or getter.
   * @default window
   */
  getContainer?: ScrollRootInput
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
  /**
   * Clicked href after the internal handler runs
   */
  onClick?: (event: Event, href: string) => void
  /**
   * Active href from click or scroll. Click and scroll share this path.
   */
  onChange?: (activeLink: string) => void
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
   * Link title/text. Nested `AnchorLink` children go below the title.
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
