/**
 * Shared viewport-floating placement types.
 */

/**
 * Corner placement relative to the viewport.
 */
export type ViewportPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/**
 * Offset from viewport edges. A scalar applies to both axes.
 */
export type ViewportOffset =
  | number
  | string
  | {
      x?: number | string
      y?: number | string
    }
