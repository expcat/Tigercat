/**
 * Slider calculation utilities
 *
 * These utilities provide the core math functions for Slider components
 * to ensure consistent behavior across Vue and React implementations.
 */

/**
 * Normalize a value within min/max bounds and snap to step increments
 *
 * @param value - The raw value to normalize
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param step - Step increment (1 by default)
 * @returns Normalized value clamped to bounds and rounded to nearest step
 *
 * @example
 * sliderNormalizeValue(55, 0, 100, 10) // => 60
 * sliderNormalizeValue(-5, 0, 100, 1)  // => 0
 * sliderNormalizeValue(150, 0, 100, 1) // => 100
 */
export function sliderNormalizeValue(
  value: number,
  min: number,
  max: number,
  step: number = 1
): number {
  // Clamp value to [min, max]
  const clamped = Math.min(Math.max(value, min), max)
  // Round to nearest step
  const stepped = Math.round((clamped - min) / step) * step + min
  // Ensure final value doesn't exceed max due to floating point
  return Math.min(stepped, max)
}

/**
 * Convert a value to percentage based on min/max range
 *
 * @param value - Current value
 * @param min - Minimum value of range
 * @param max - Maximum value of range
 * @returns Percentage (0-100)
 *
 * @example
 * sliderGetPercentage(50, 0, 100) // => 50
 * sliderGetPercentage(25, 0, 200) // => 12.5
 */
export function sliderGetPercentage(value: number, min: number, max: number): number {
  if (max === min) return 0
  return ((value - min) / (max - min)) * 100
}

/**
 * Convert a position (pixel offset) to a value based on track dimensions
 *
 * @param position - Pixel position on the track
 * @param trackWidth - Total width of the track in pixels
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param step - Step increment
 * @returns Normalized value at that position
 *
 * @example
 * sliderGetValueFromPosition(100, 200, 0, 100, 1) // => 50
 */
export function sliderGetValueFromPosition(
  position: number,
  trackWidth: number,
  min: number,
  max: number,
  step: number = 1
): number {
  if (trackWidth === 0) return min
  const ratio = position / trackWidth
  const rawValue = ratio * (max - min) + min
  return sliderNormalizeValue(rawValue, min, max, step)
}

/**
 * Calculate the step change for keyboard navigation
 *
 * @param key - The key pressed ('ArrowLeft', 'ArrowRight', 'Home', 'End', etc.)
 * @param currentValue - Current slider value
 * @param min - Minimum value
 * @param max - Maximum value
 * @param step - Step increment
 * @param largeStep - Large step for PageUp/PageDown (defaults to 10x step)
 * @returns New value after applying the key action, or null if key not handled
 *
 * @example
 * sliderGetKeyboardValue('ArrowRight', 50, 0, 100, 1) // => 51
 * sliderGetKeyboardValue('Home', 50, 0, 100, 1)       // => 0
 * sliderGetKeyboardValue('End', 50, 0, 100, 1)        // => 100
 */
export function sliderGetKeyboardValue(
  key: string,
  currentValue: number,
  min: number,
  max: number,
  step: number = 1,
  largeStep?: number
): number | null {
  const bigStep = largeStep ?? step * 10

  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return sliderNormalizeValue(currentValue + step, min, max, step)
    case 'ArrowLeft':
    case 'ArrowDown':
      return sliderNormalizeValue(currentValue - step, min, max, step)
    case 'PageUp':
      return sliderNormalizeValue(currentValue + bigStep, min, max, step)
    case 'PageDown':
      return sliderNormalizeValue(currentValue - bigStep, min, max, step)
    case 'Home':
      return min
    case 'End':
      return max
    default:
      return null
  }
}
