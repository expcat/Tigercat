/**
 * ScrollArea component types and interfaces
 */

/**
 * Scrollable axes the ScrollArea manages.
 */
export type ScrollAreaDirection = 'vertical' | 'horizontal' | 'both'

/**
 * Custom scrollbar visibility strategy.
 *
 * - `auto`: rendered only while the axis actually overflows
 * - `hover`: same as `auto` but faded in on pointer hover / keyboard focus
 * - `always`: rendered even when the content fits
 * - `hidden`: no custom scrollbar (content still scrolls)
 */
export type ScrollAreaScrollbarVisibility = 'auto' | 'hover' | 'always' | 'hidden'

/**
 * Custom scrollbar thickness.
 */
export type ScrollAreaScrollbarSize = 'sm' | 'md' | 'lg'

/**
 * Scroll axis identifier. `x` is horizontal, `y` is vertical.
 */
export type ScrollAreaAxis = 'x' | 'y'

/**
 * Edge that renders a scroll shadow when content overflows past it.
 */
export type ScrollAreaShadowSide = 'top' | 'bottom' | 'left' | 'right'

/**
 * Raw viewport measurements used to derive scrollbar geometry.
 */
export interface ScrollAreaViewportMetrics {
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scrollWidth: number
  clientHeight: number
  clientWidth: number
}

/**
 * Derived scroll state for a single axis.
 */
export interface ScrollAreaAxisState {
  /** Whether the content overflows along this axis */
  scrollable: boolean
  /** Thumb length in px along the axis */
  thumbSize: number
  /** Thumb offset from the track start in px */
  thumbOffset: number
  /** Scroll progress in the `0`–`1` range (`0` when not scrollable) */
  progress: number
  /** Whether the viewport sits at the start edge */
  atStart: boolean
  /** Whether the viewport sits at the end edge */
  atEnd: boolean
}

/**
 * Derived scroll state for both axes.
 */
export interface ScrollAreaState {
  x: ScrollAreaAxisState
  y: ScrollAreaAxisState
}

/**
 * Payload emitted on every viewport scroll.
 */
export interface ScrollAreaScrollDetail {
  scrollTop: number
  scrollLeft: number
  state: ScrollAreaState
}

/**
 * Options accepted by the imperative `scrollTo` method.
 */
export interface ScrollAreaScrollToOptions {
  /** Target vertical scroll offset in px */
  top?: number
  /** Target horizontal scroll offset in px */
  left?: number
  /**
   * Native scroll behavior.
   * @default 'auto'
   */
  behavior?: 'auto' | 'smooth'
}

/**
 * Inline style patch for a scrollbar thumb.
 */
export interface ScrollAreaThumbStyle {
  height?: string
  width?: string
  top?: string
  left?: string
}

/**
 * Inline style patch for the ScrollArea root box.
 */
export interface ScrollAreaBoxStyle {
  height?: string
  maxHeight?: string
  width?: string
  maxWidth?: string
}

/**
 * Base ScrollArea props interface
 */
export interface ScrollAreaProps {
  /**
   * Axes that may scroll
   * @default 'vertical'
   */
  direction?: ScrollAreaDirection

  /**
   * Custom scrollbar visibility strategy
   * @default 'auto'
   */
  scrollbar?: ScrollAreaScrollbarVisibility

  /**
   * Custom scrollbar thickness
   * @default 'md'
   */
  scrollbarSize?: ScrollAreaScrollbarSize

  /**
   * Render a gradient shadow on every edge that has content scrolled past it
   * @default false
   */
  shadow?: boolean

  /**
   * Minimum thumb length in px, so long content keeps a grabbable thumb
   * @default 20
   */
  minThumbSize?: number

  /**
   * Fixed viewport height. Numbers are treated as px.
   */
  height?: number | string

  /**
   * Maximum viewport height. Numbers are treated as px.
   */
  maxHeight?: number | string

  /**
   * Fixed viewport width. Numbers are treated as px.
   */
  width?: number | string

  /**
   * Maximum viewport width. Numbers are treated as px.
   */
  maxWidth?: number | string

  /**
   * Accessible name for the scrollable region. When set, the viewport is
   * exposed as `role="region"` with this label.
   */
  ariaLabel?: string

  /**
   * Additional CSS class name for the root element
   */
  className?: string

  /**
   * Additional CSS class name for the scrolling viewport
   */
  viewportClassName?: string
}

/**
 * Imperative handle exposed through `ref`.
 */
export interface ScrollAreaInstance {
  /** Scroll the viewport to an absolute offset */
  scrollTo: (options: ScrollAreaScrollToOptions) => void
  /** Scroll the viewport to the top edge */
  scrollToTop: (behavior?: ScrollAreaScrollToOptions['behavior']) => void
  /** Scroll the viewport to the bottom edge */
  scrollToBottom: (behavior?: ScrollAreaScrollToOptions['behavior']) => void
  /** The scrolling viewport element, or `null` before mount */
  getViewport: () => HTMLElement | null
  /** Latest derived scroll state */
  getState: () => ScrollAreaState
}
