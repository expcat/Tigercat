/**
 * Splitter component types and interfaces
 */

/**
 * Split direction
 */
export type SplitDirection = 'horizontal' | 'vertical'

/**
 * Base Splitter props interface
 */
export interface SplitterProps {
  /**
   * Orientation of the split (horizontal = left/right panes)
   * @default 'horizontal'
   */
  orientation?: SplitDirection
  /**
   * Pane sizes in pixels or percentage / px strings (`'30%'`, `'200px'`).
   * Numbers are pixels. `'30%'` is a percent of available space (container minus gutters).
   * `'200px'` and bare numeric strings (`'250'`) are pixels.
   * Passed `sizes` is controlled by value (not array identity): the same numbers
   * or percents must not reset a drag. A drag writes sizes back in the same unit:
   * a percentage stays a percentage of the content box (container minus gutters),
   * and a pixel size stays pixels, so the ratio still follows the container.
   * Omit to stay uncontrolled; dropping `sizes` keeps the last ratios instead of
   * equal-splitting.
   */
  sizes?: (number | string)[]
  /**
   * Minimum pane size in pixels. A number applies to every pane.
   * An array is per pane (missing entries are 0).
   * When the mins cannot fit, panes scale proportionally.
   * @default 0
   */
  min?: number | number[]
  /**
   * Maximum pane size in pixels. A number applies to every pane.
   * An array is per pane.
   */
  max?: number | number[]
  /**
   * Width of the gutter/divider in pixels
   * @default 4
   */
  gutterSize?: number
  /**
   * Whether the splitter is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}
