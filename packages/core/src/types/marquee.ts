/**
 * Marquee component types and interfaces
 */

/**
 * Scroll direction. Horizontal `left` / `right` follow the inline axis
 * (`left` toward inline-start, `right` toward inline-end). `up` / `down`
 * follow the block axis. A vertical viewport is the first copy unless the
 * caller sets a root height.
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
 * Base Marquee props interface (framework-agnostic)
 */
export interface MarqueeProps {
  /**
   * Scroll direction. `left`/`right` are logical (inline-start/end).
   * Vertical height is the first copy unless the root height is set.
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
   * Omitted or non-finite → 2. Values below 2 (including 0) show one
   * static copy. Extra copies are inert visual clones and do not grow a
   * vertical viewport. Short content may leave a gap; raise `repeat` to fill.
   * @default 2
   */
  repeat?: number

  /**
   * Accessible name for the region. Omitted or blank: not a landmark.
   * Pass `aria-label` / `aria-labelledby` the same way.
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
