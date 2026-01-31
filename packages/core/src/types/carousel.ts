/**
 * Carousel component types and interfaces
 */

/**
 * Carousel dot position - determines where the navigation dots are positioned
 */
export type CarouselDotPosition = 'top' | 'bottom' | 'left' | 'right'

/**
 * Carousel effect - determines the transition effect
 */
export type CarouselEffect = 'scroll' | 'fade'

/**
 * Base carousel props interface
 */
export interface CarouselProps {
  /**
   * Whether to enable automatic slide switching
   * @default false
   */
  autoplay?: boolean
  /**
   * Time interval for auto-play in milliseconds
   * @default 3000
   */
  autoplaySpeed?: number
  /**
   * Whether to show navigation dots
   * @default true
   */
  dots?: boolean
  /**
   * Position of navigation dots
   * @default 'bottom'
   */
  dotPosition?: CarouselDotPosition
  /**
   * Transition effect type
   * @default 'scroll'
   */
  effect?: CarouselEffect
  /**
   * Whether to show prev/next arrows
   * @default false
   */
  arrows?: boolean
  /**
   * Whether to enable infinite loop
   * @default true
   */
  infinite?: boolean
  /**
   * Transition animation duration in milliseconds
   * @default 500
   */
  speed?: number
  /**
   * Initial slide index (0-based)
   * @default 0
   */
  initialSlide?: number
  /**
   * Whether to pause autoplay on hover
   * @default true
   */
  pauseOnHover?: boolean
  /**
   * Whether to pause autoplay on focus
   * @default true
   */
  pauseOnFocus?: boolean
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
 * Carousel change event info
 */
export interface CarouselChangeInfo {
  /**
   * Current slide index
   */
  current: number
  /**
   * Previous slide index
   */
  prev: number
}

/**
 * Carousel before change event info
 */
export interface CarouselBeforeChangeInfo {
  /**
   * Current slide index
   */
  current: number
  /**
   * Next slide index (the one about to become active)
   */
  next: number
}

/**
 * Carousel methods interface (for imperative API)
 */
export interface CarouselMethods {
  /**
   * Go to the next slide
   */
  next: () => void
  /**
   * Go to the previous slide
   */
  prev: () => void
  /**
   * Go to a specific slide
   * @param index - The index of the slide to go to (0-based)
   */
  goTo: (index: number) => void
}
