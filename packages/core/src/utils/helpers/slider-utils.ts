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
  const safeMin = Number.isFinite(min) ? min : 0
  const safeMax = Number.isFinite(max) ? max : safeMin
  const lower = Math.min(safeMin, safeMax)
  const upper = Math.max(safeMin, safeMax)
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1
  const safeValue = Number.isFinite(value) ? value : lower
  // Clamp value to [min, max]
  const clamped = Math.min(Math.max(safeValue, lower), upper)
  // Round to nearest step
  const stepped = Math.round((clamped - lower) / safeStep) * safeStep + lower
  // Ensure final value doesn't exceed max due to floating point
  return Math.min(Math.max(stepped, lower), upper)
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
  const safeMin = Number.isFinite(min) ? min : 0
  const safeMax = Number.isFinite(max) ? max : safeMin
  const lower = Math.min(safeMin, safeMax)
  const upper = Math.max(safeMin, safeMax)
  if (upper === lower) return 0
  const safeValue = Number.isFinite(value) ? value : lower
  return ((Math.min(Math.max(safeValue, lower), upper) - lower) / (upper - lower)) * 100
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
  const safeMin = Number.isFinite(min) ? min : 0
  const safeMax = Number.isFinite(max) ? max : safeMin
  const lower = Math.min(safeMin, safeMax)
  const upper = Math.max(safeMin, safeMax)
  if (!Number.isFinite(trackWidth) || trackWidth <= 0) return lower
  const safePosition = Number.isFinite(position) ? Math.min(Math.max(position, 0), trackWidth) : 0
  const ratio = safePosition / trackWidth
  const rawValue = ratio * (upper - lower) + lower
  return sliderNormalizeValue(rawValue, lower, upper, step)
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
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1
  const bigStep = Number.isFinite(largeStep) && largeStep! > 0 ? largeStep! : safeStep * 10
  const safeCurrent = sliderNormalizeValue(currentValue, min, max, safeStep)

  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return sliderNormalizeValue(safeCurrent + safeStep, min, max, safeStep)
    case 'ArrowLeft':
    case 'ArrowDown':
      return sliderNormalizeValue(safeCurrent - safeStep, min, max, safeStep)
    case 'PageUp':
      return sliderNormalizeValue(safeCurrent + bigStep, min, max, safeStep)
    case 'PageDown':
      return sliderNormalizeValue(safeCurrent - bigStep, min, max, safeStep)
    case 'Home':
      return sliderNormalizeValue(min, min, max, safeStep)
    case 'End':
      return sliderNormalizeValue(max, min, max, safeStep)
    default:
      return null
  }
}
