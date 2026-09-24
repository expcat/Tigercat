/**
 * Tour component types and interfaces
 */

import type { TigerLocale } from './locale'

/**
 * Placement for the tour step popover. Same set as anchored overlays so
 * flip can move to `-start` / `-end` sides.
 */
export type TourPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

export type TourStepSkipPredicate = () => boolean

export type TourStepLoader = () => TourStep[] | Promise<TourStep[]>

/** CSS selector or a live element. Framework layers may also accept a Ref. */
export type TourTarget = string | HTMLElement

/**
 * A single step in the tour
 */
export interface TourStep {
  /**
   * CSS selector or element to highlight. Illegal selectors do not throw —
   * the step is centered. If omitted, the step is shown centered on screen.
   */
  target?: TourTarget

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
   * is evaluated each time the visible step list is resolved (not only when
   * `loadSteps` identity changes).
   */
  skipWhen?: boolean | TourStepSkipPredicate

  /**
   * Let the user click the highlighted target. The hole then passes pointer
   * events and that target is excluded from inert. Otherwise the hole is
   * visual and clicks land on the mask.
   * @default false
   */
  interact?: boolean

  /**
   * `advanceOnTarget` excludes the target from inert and moves next only when
   * that target is clicked.
   */
  type?: 'default' | 'advanceOnTarget'

  /** Cover image URL. Alt stays caller-provided. */
  cover?: string

  /** Empty string marks the cover as decorative. */
  coverAlt?: string

  /**
   * Draw an arrow toward the target.
   * @default true
   */
  arrow?: boolean
}

/** Slot / render-prop context for the current visible step. */
export interface TourStepContext {
  step: TourStep
  /** Original index in `steps` / `loadSteps` (not the active-only index). */
  index: number
  /** 0-based position among non-skipped steps. */
  position: number
  /** Count of non-skipped steps. */
  total: number
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
   * Current step index (controlled). This is the **original** index in
   * `steps`, not the index among non-skipped steps. Closing emits the first
   * non-skipped index. The tour keeps the controlled value if the parent ignores it.
   */
  current?: number

  /**
   * Text for the "Next" button
   * @default locale `tour.nextText`
   */
  nextText?: string

  /**
   * Text for the "Previous" button
   * @default locale `tour.prevText`
   */
  prevText?: string

  /**
   * Text for the "Finish" button (last step)
   * @default locale `tour.finishText`
   */
  finishText?: string

  /**
   * Whether to show the close button. `false` only hides the X — Escape and
   * mask click still close unless `keyboard` / `maskClosable` are also false.
   * @default true
   */
  closable?: boolean

  /**
   * Whether clicking the mask closes the tour.
   * @default true
   */
  maskClosable?: boolean

  /**
   * Whether Escape closes the tour.
   * @default true
   */
  keyboard?: boolean

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

  /**
   * CSS selector for the node to focus when the tour opens.
   * Defaults to the step bubble.
   */
  initialFocus?: string
}
