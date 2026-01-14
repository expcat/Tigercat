/**
 * Slider component types and interfaces
 */

/**
 * Slider size types
 */
export type SliderSize = 'sm' | 'md' | 'lg'

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
  size?: SliderSize

  /**
   * Whether to enable range selection
   * @default false
   */
  range?: boolean
}
