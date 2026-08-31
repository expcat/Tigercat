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
   * Direction of the split
   * @default 'horizontal'
   */
  direction?: SplitDirection
  /**
   * Pane sizes in pixels or percentage / px strings (`'30%'`, `'200px'`).
   * Numbers are pixels. `'30%'` is a percent of available space (container minus gutters).
   * `'200px'` and bare numeric strings (`'250'`) are pixels.
   * Passed `sizes` is controlled by value (not array identity): the same numbers
   * or percents must not reset a drag. Omit to stay uncontrolled; dropping
   * `sizes` keeps the last ratios instead of equal-splitting.
   */
  sizes?: (number | string)[]
  /**
   * Minimum size of any pane in pixels.
   * When `min * paneCount + gutters` exceeds the container, panes scale
   * proportionally to fit instead of each clamping independently.
   * @default 0
   */
  min?: number
  /**
   * Maximum size of any pane in pixels
   */
  max?: number
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
