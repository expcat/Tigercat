/**
 * Marquee component types and interfaces
 */

/**
 * Scroll direction. Horizontal `left` is the default looping ticker.
 * `right` / `down` reverse the same CSS animation.
 */
export type MarqueeDirection = 'left' | 'right' | 'up' | 'down'

/**
 * Gap between items and between duplicated copies.
 * A number is treated as pixels; a string is used as a raw CSS length.
 */
export type MarqueeGap = number | string

/**
 * Default loop direction
 */
export const DEFAULT_MARQUEE_DIRECTION: MarqueeDirection = 'left'

/**
 * Default time for one full loop, in milliseconds
 */
export const DEFAULT_MARQUEE_DURATION_MS = 20000

/**
 * Default gap in pixels
 */
export const DEFAULT_MARQUEE_GAP_PX = 16

/**
 * Default number of duplicated copies used for a seamless loop
 */
export const DEFAULT_MARQUEE_REPEAT = 2

/**
 * Maximum copies to render. Guards against accidental huge DOM.
 */
export const MAX_MARQUEE_REPEAT = 16

/**
 * Whether hover (and focus-within) pauses the animation by default
 */
export const DEFAULT_MARQUEE_PAUSE_ON_HOVER = true

/**
 * Default accessible name for the scrolling region
 */
export const DEFAULT_MARQUEE_ARIA_LABEL = 'Scrolling content'

/**
 * Base Marquee props interface (framework-agnostic)
 */
export interface MarqueeProps {
  /**
   * Scroll direction
   * @default 'left'
   */
  direction?: MarqueeDirection

  /**
   * Time for one full loop, in milliseconds
   * @default 20000
   */
  duration?: number

  /**
   * Pause looping while hovered or while focus is inside the region
   * @default true
   */
  pauseOnHover?: boolean

  /**
   * Gap between items and between duplicated copies.
   * A number is pixels; a string is a CSS length.
   * @default 16
   */
  gap?: MarqueeGap

  /**
   * How many copies of the content to render for a seamless loop.
   * Values below 2 skip looping and show a single static copy.
   * @default 2
   */
  repeat?: number

  /**
   * Accessible name for the region
   * @default 'Scrolling content'
   */
  ariaLabel?: string

  /**
   * Additional CSS classes on the root
   */
  className?: string

  /**
   * Inline styles on the root
   */
  style?: Record<string, unknown>
}
