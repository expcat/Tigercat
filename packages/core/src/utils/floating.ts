/**
 * Floating UI wrapper utilities for positioning popups, tooltips, and dropdowns.
 * Provides edge-aware positioning with automatic collision detection and flipping.
 */

import {
  computePosition,
  flip,
  shift,
  offset,
  arrow,
  autoUpdate,
  type Placement,
  type Middleware,
  type ComputePositionReturn,
  type MiddlewareData
} from '@floating-ui/dom'

/**
 * Placement options supported by the floating system.
 * These map directly to Floating UI placements.
 */
export type FloatingPlacement =
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

/**
 * Options for computing floating element position.
 */
export interface FloatingOptions {
  /**
   * Preferred placement of the floating element relative to the reference.
   * @default 'bottom'
   */
  placement?: FloatingPlacement
  /**
   * Distance (in pixels) between reference and floating element.
   * @default 8
   */
  offset?: number
  /**
   * Whether to flip placement when there's not enough space.
   * @default true
   */
  flip?: boolean
  /**
   * Whether to shift the floating element to stay within viewport.
   * @default true
   */
  shift?: boolean
  /**
   * Padding from viewport edges when shifting.
   * @default 8
   */
  shiftPadding?: number
  /**
   * Arrow element for positioning the arrow indicator.
   */
  arrowElement?: HTMLElement | null
  /**
   * Arrow padding from edges.
   * @default 8
   */
  arrowPadding?: number
}

/**
 * Result of computing floating position.
 */
export interface FloatingResult {
  /**
   * X coordinate to position the floating element.
   */
  x: number
  /**
   * Y coordinate to position the floating element.
   */
  y: number
  /**
   * Final placement after auto-positioning (may differ from requested).
   */
  placement: FloatingPlacement
  /**
   * Arrow position data (if arrow element was provided).
   */
  arrow?: {
    x?: number
    y?: number
  }
  /**
   * Middleware data from Floating UI.
   */
  middlewareData: MiddlewareData
}

/**
 * Compute the position of a floating element relative to a reference element.
 * Uses Floating UI for edge-aware positioning with automatic collision detection.
 *
 * @param reference - The reference element (trigger)
 * @param floating - The floating element (popup/tooltip)
 * @param options - Positioning options
 * @returns Promise resolving to position data
 *
 * @example
 * ```ts
 * const { x, y, placement } = await computeFloatingPosition(
 *   triggerEl,
 *   tooltipEl,
 *   { placement: 'top', offset: 8 }
 * )
 * tooltipEl.style.left = `${x}px`
 * tooltipEl.style.top = `${y}px`
 * ```
 */
export async function computeFloatingPosition(
  reference: HTMLElement,
  floating: HTMLElement,
  options: FloatingOptions = {}
): Promise<FloatingResult> {
  const {
    placement = 'bottom',
    offset: offsetDistance = 8,
    flip: enableFlip = true,
    shift: enableShift = true,
    shiftPadding = 8,
    arrowElement = null,
    arrowPadding = 8
  } = options

  const middleware: Middleware[] = [offset(offsetDistance)]

  if (enableFlip) {
    middleware.push(flip({ padding: shiftPadding }))
  }

  if (enableShift) {
    middleware.push(shift({ padding: shiftPadding }))
  }

  if (arrowElement) {
    middleware.push(arrow({ element: arrowElement, padding: arrowPadding }))
  }

  const result: ComputePositionReturn = await computePosition(reference, floating, {
    placement: placement as Placement,
    middleware
  })

  return {
    x: result.x,
    y: result.y,
    placement: result.placement as FloatingPlacement,
    arrow: result.middlewareData.arrow,
    middlewareData: result.middlewareData
  }
}

/**
 * Cleanup function type returned by autoUpdateFloating.
 */
export type FloatingCleanup = () => void

/**
 * Set up automatic position updates for a floating element.
 * Updates position when reference/floating elements resize, scroll, or when
 * the reference moves in the viewport.
 *
 * @param reference - The reference element (trigger)
 * @param floating - The floating element (popup/tooltip)
 * @param update - Callback to run when position should be updated
 * @returns Cleanup function to stop auto-updates
 *
 * @example
 * ```ts
 * const cleanup = autoUpdateFloating(triggerEl, tooltipEl, async () => {
 *   const { x, y } = await computeFloatingPosition(triggerEl, tooltipEl)
 *   tooltipEl.style.left = `${x}px`
 *   tooltipEl.style.top = `${y}px`
 * })
 *
 * // Later, when unmounting:
 * cleanup()
 * ```
 */
export function autoUpdateFloating(
  reference: HTMLElement,
  floating: HTMLElement,
  update: () => void
): FloatingCleanup {
  return autoUpdate(reference, floating, update, {
    ancestorScroll: true,
    ancestorResize: true,
    elementResize: true,
    layoutShift: true
  })
}

/**
 * Get CSS transform origin based on placement.
 * Useful for scaling/fading animations that should originate from the reference.
 *
 * @param placement - Current placement of the floating element
 * @returns CSS transform-origin value
 *
 * @example
 * ```ts
 * tooltipEl.style.transformOrigin = getTransformOrigin('top')
 * // Returns 'bottom center'
 * ```
 */
export function getTransformOrigin(placement: FloatingPlacement): string {
  const origins: Record<FloatingPlacement, string> = {
    top: 'bottom center',
    'top-start': 'bottom left',
    'top-end': 'bottom right',
    bottom: 'top center',
    'bottom-start': 'top left',
    'bottom-end': 'top right',
    left: 'right center',
    'left-start': 'right top',
    'left-end': 'right bottom',
    right: 'left center',
    'right-start': 'left top',
    'right-end': 'left bottom'
  }
  return origins[placement] || 'center center'
}

/**
 * Get the side of the reference element where the floating element is placed.
 *
 * @param placement - Current placement
 * @returns The side: 'top', 'bottom', 'left', or 'right'
 */
export function getPlacementSide(
  placement: FloatingPlacement
): 'top' | 'bottom' | 'left' | 'right' {
  return placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Get arrow positioning styles based on placement and arrow data.
 *
 * @param placement - Current placement of the floating element
 * @param arrowData - Arrow position data from computeFloatingPosition
 * @returns CSS styles object for the arrow element
 *
 * @example
 * ```ts
 * const arrowStyles = getArrowStyles('top', result.arrow)
 * Object.assign(arrowEl.style, arrowStyles)
 * ```
 */
export function getArrowStyles(
  placement: FloatingPlacement,
  arrowData?: { x?: number; y?: number }
): Record<string, string> {
  const side = getPlacementSide(placement)
  const staticSide: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left'
  }

  const styles: Record<string, string> = {
    position: 'absolute',
    [staticSide[side]]: '-4px'
  }

  if (arrowData?.x != null) {
    styles.left = `${arrowData.x}px`
  }

  if (arrowData?.y != null) {
    styles.top = `${arrowData.y}px`
  }

  return styles
}

/**
 * Apply floating position to an element's style.
 * Convenience function that sets left/top CSS properties.
 *
 * @param element - The floating element to position
 * @param result - Position result from computeFloatingPosition
 *
 * @example
 * ```ts
 * const result = await computeFloatingPosition(trigger, tooltip)
 * applyFloatingStyles(tooltip, result)
 * ```
 */
export function applyFloatingStyles(element: HTMLElement, result: FloatingResult): void {
  element.style.left = `${result.x}px`
  element.style.top = `${result.y}px`
}
