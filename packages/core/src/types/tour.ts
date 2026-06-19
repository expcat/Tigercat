/**
 * Tour component types and interfaces
 */

import type { TigerLocale } from './locale'

/**
 * Placement for the tour step popover
 */
export type TourPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'right'

export type TourStepSkipPredicate = () => boolean

export type TourStepLoader = () => TourStep[] | Promise<TourStep[]>

/**
 * A single step in the tour
 */
export interface TourStep {
  /**
   * CSS selector or element reference for the target element to highlight.
   * If omitted, the step is shown centered on screen.
   */
  target?: string

  /** Step title */
  title?: string

  /** Step description */
  description?: string

  /** Popover placement relative to target */
  placement?: TourPlacement

  /**
   * Whether to show a spotlight mask around the target
   * @default true
   */
  mask?: boolean

  /**
   * Whether to skip this step when navigating the tour.
   * @default false
   */
  skip?: boolean

  /**
   * Conditionally skip this step. A boolean is evaluated directly; a function
   * is evaluated each time the visible step list is resolved.
   */
  skipWhen?: boolean | TourStepSkipPredicate
}

/**
 * Base Tour props (framework-agnostic)
 */
export interface TourProps {
  /**
   * Array of tour steps
   */
  steps: TourStep[]

  /**
   * Load tour steps asynchronously when the tour opens.
   */
  loadSteps?: TourStepLoader

  /**
   * Whether the tour is open
   * @default false
   */
  open?: boolean

  /**
   * Current step index (controlled)
   */
  current?: number

  /**
   * Text for the "Next" button
   * @default 'Next'
   */
  nextText?: string

  /**
   * Text for the "Previous" button
   * @default 'Previous'
   */
  prevText?: string

  /**
   * Text for the "Finish" button (last step)
   * @default 'Finish'
   */
  finishText?: string

  /**
   * Whether to show the close button
   * @default true
   */
  closable?: boolean

  /**
   * Whether to show step indicators (e.g. 1/3)
   * @default true
   */
  showIndicators?: boolean

  /**
   * Locale override; falls back to ConfigProvider locale
   */
  locale?: Partial<TigerLocale>

  /**
   * Additional CSS class name
   */
  className?: string
}
