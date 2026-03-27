/**
 * Splitter component types and interfaces
 */

/**
 * Split direction
 */
export type SplitDirection = 'horizontal' | 'vertical'

/**
 * Splitter pane configuration
 */
export interface SplitterPaneConfig {
  /**
   * Unique key for the pane
   */
  key?: string
  /**
   * Default size in pixels or percentage string (e.g. '50%', '200px')
   */
  defaultSize?: number | string
  /**
   * Minimum size in pixels
   * @default 0
   */
  min?: number
  /**
   * Maximum size in pixels (undefined = no limit)
   */
  max?: number
  /**
   * Whether the pane is collapsible
   * @default false
   */
  collapsible?: boolean
  /**
   * Whether the pane is currently collapsed
   */
  collapsed?: boolean
}

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
   * Initial sizes of each pane in pixels.
   * If not provided, panes split equally.
   */
  sizes?: number[]
  /**
   * Minimum size of any pane in pixels
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
