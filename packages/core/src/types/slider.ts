/**
 * Slider component types and interfaces
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'

/**
 * Base slider props interface
 */
export interface SliderProps {
  /**
   * Current value of the slider
   * For single slider, this is a number
   * For range slider, this is a tuple [min, max]
   */
  value?: number | [number, number]

  /**
   * Default value
   */
  defaultValue?: number | [number, number]

  /**
   * Minimum value
   * @default 0
   */
  min?: number

  /**
   * Maximum value
   * @default 100
   */
  max?: number

  /**
   * Step value for slider movement
   * @default 1
   */
  step?: number

  /**
   * Whether the slider is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Focusable, submitted, and visible, but drag and arrow keys do not change the value.
   * @default false
   */
  readOnly?: boolean

  /**
   * Vertical track. The bottom edge is `min`.
   * @default false
   */
  vertical?: boolean

  /**
   * When range thumbs meet, push the other thumb one step away.
   * @default false
   */
  pushApart?: boolean

  /**
   * Paint the selected portion of the track.
   * @default true
   */
  showRange?: boolean

  /**
   * Show the current value in an InputNumber beside the track.
   * @default false
   */
  showInput?: boolean

  /**
   * Tooltip and `aria-valuetext` text.
   */
  formatTooltip?: (value: number) => string

  /**
   * Whether to show marks on the slider
   * @default false
   */
  marks?: boolean | Record<number, string>

  /**
   * Whether to show tooltip
   * @default true
   */
  tooltip?: boolean

  /**
   * Slider size
   * @default 'md'
   */
  size?: ComponentSize

  /**
   * Whether to enable range selection
   * @default false
   */
  range?: boolean

  /**
   * Validation status
   * @default 'default'
   */
  status?: InputStatus
}
