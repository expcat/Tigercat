/**
 * Slider calculation utilities
 *
 * Geometry, stepping, and marks are framework-agnostic so Vue/React stay thin.
 */

import { countDecimalPlaces } from '../input-number-utils'

function sliderBounds(min: number, max: number): { lower: number; upper: number } {
  const safeMin = Number.isFinite(min) ? min : 0
  const safeMax = Number.isFinite(max) ? max : safeMin
  return {
    lower: Math.min(safeMin, safeMax),
    upper: Math.max(safeMin, safeMax)
  }
}

function sliderStep(step: number): number {
  return Number.isFinite(step) && step > 0 ? step : 1
}

/**
 * Snap a value to step using integer arithmetic so 0.1+0.2 stays 0.3.
 */
export function sliderNormalizeValue(
  value: number,
  min: number,
  max: number,
  step: number = 1
): number {
  const { lower, upper } = sliderBounds(min, max)
  const safeStep = sliderStep(step)
  const safeValue = Number.isFinite(value) ? value : lower
  const clamped = Math.min(Math.max(safeValue, lower), upper)
  const places = Math.max(
    countDecimalPlaces(lower),
    countDecimalPlaces(safeStep),
    countDecimalPlaces(clamped)
  )
  const factor = 10 ** places
  const stepInt = Math.round(safeStep * factor)
  if (stepInt === 0) return Math.min(Math.max(clamped, lower), upper)
  const offsetInt = Math.round((clamped - lower) * factor)
  const steps = Math.round(offsetInt / stepInt)
  const stepped = (Math.round(lower * factor) + steps * stepInt) / factor
  return Math.min(Math.max(stepped, lower), upper)
}

function nextStepIndex(current: number, min: number, step: number, direction: 1 | -1): number {
  const safeStep = sliderStep(step)
  const places = Math.max(
    countDecimalPlaces(min),
    countDecimalPlaces(safeStep),
    countDecimalPlaces(current)
  )
  const factor = 10 ** places
  const stepInt = Math.round(safeStep * factor)
  const offsetInt = Math.round((current - min) * factor)
  if (stepInt === 0) return 0
  const ratio = offsetInt / stepInt
  const rounded = Math.round(ratio)
  const onStep = Math.abs(ratio - rounded) < 1e-8
  if (direction > 0) {
    return onStep ? rounded + 1 : Math.ceil(ratio)
  }
  return onStep ? rounded - 1 : Math.floor(ratio)
}

/**
 * Resolve the `marks` prop into a concrete `{ value: label }` map.
 *
 * - An object is returned as-is.
 * - `true` derives marks from min to max by `step` (end aligned to max).
 * - `false`/undefined yields an empty map.
 */
export function sliderResolveMarks(
  marks: boolean | Record<number, string> | undefined,
  min: number,
  max: number,
  step: number = 1
): Record<number, string> {
  if (!marks) return {}
  if (typeof marks === 'object') return marks
  const { lower, upper } = sliderBounds(min, max)
  const safeStep = sliderStep(step)
  if (lower === upper) return { [lower]: String(lower) }
  const result: Record<number, string> = {}
  let current = lower
  let guard = 0
  while (current <= upper && guard < 10000) {
    const snapped = sliderNormalizeValue(current, lower, upper, safeStep)
    result[snapped] = String(snapped)
    if (snapped >= upper) break
    const next = sliderNormalizeValue(snapped + safeStep, lower, upper, safeStep)
    if (next <= snapped) {
      result[upper] = String(upper)
      break
    }
    current = next
    guard += 1
  }
  if (result[upper] === undefined) result[upper] = String(upper)
  return result
}

export function sliderGetPercentage(value: number, min: number, max: number): number {
  const { lower, upper } = sliderBounds(min, max)
  if (upper === lower) return 0
  const safeValue = Number.isFinite(value) ? value : lower
  return ((Math.min(Math.max(safeValue, lower), upper) - lower) / (upper - lower)) * 100
}

export function sliderGetValueFromPosition(
  position: number,
  trackWidth: number,
  min: number,
  max: number,
  step: number = 1,
  rtl = false
): number {
  const { lower, upper } = sliderBounds(min, max)
  if (!Number.isFinite(trackWidth) || trackWidth <= 0) return lower
  const rawPosition = Number.isFinite(position) ? position : 0
  const logical = rtl ? trackWidth - rawPosition : rawPosition
  const safePosition = Math.min(Math.max(logical, 0), trackWidth)
  const rawValue = (safePosition / trackWidth) * (upper - lower) + lower
  return sliderNormalizeValue(rawValue, lower, upper, step)
}

export function sliderGetValueFromClientX(
  clientX: number,
  track: { left: number; width: number },
  min: number,
  max: number,
  step: number = 1,
  rtl = false
): number {
  return sliderGetValueFromPosition(clientX - track.left, track.width, min, max, step, rtl)
}

export function sliderGetKeyboardValue(
  key: string,
  currentValue: number,
  min: number,
  max: number,
  step: number = 1,
  largeStep?: number,
  rtl = false
): number | null {
  const safeStep = sliderStep(step)
  const bigStep = Number.isFinite(largeStep) && largeStep! > 0 ? largeStep! : safeStep * 10
  const { lower, upper } = sliderBounds(min, max)
  const inlineIncrease = rtl ? 'ArrowLeft' : 'ArrowRight'
  const inlineDecrease = rtl ? 'ArrowRight' : 'ArrowLeft'
  const current = Number.isFinite(currentValue) ? currentValue : lower

  const stepToward = (direction: 1 | -1, amount: number): number => {
    if (amount === safeStep) {
      const index = nextStepIndex(current, lower, safeStep, direction)
      return sliderNormalizeValue(lower + index * safeStep, lower, upper, safeStep)
    }
    return sliderNormalizeValue(current + direction * amount, lower, upper, safeStep)
  }

  switch (key) {
    case inlineIncrease:
    case 'ArrowUp':
      return stepToward(1, safeStep)
    case inlineDecrease:
    case 'ArrowDown':
      return stepToward(-1, safeStep)
    case 'PageUp':
      return stepToward(1, bigStep)
    case 'PageDown':
      return stepToward(-1, bigStep)
    case 'Home':
      return sliderNormalizeValue(min, min, max, safeStep)
    case 'End':
      return sliderNormalizeValue(max, min, max, safeStep)
    default:
      return null
  }
}

export function sliderSortRange(value: [number, number]): [number, number] {
  return value[0] <= value[1] ? [value[0], value[1]] : [value[1], value[0]]
}

export function sliderNormalizeRange(
  value: [number, number],
  min: number,
  max: number,
  step: number
): [number, number] {
  const a = sliderNormalizeValue(value[0], min, max, step)
  const b = sliderNormalizeValue(value[1], min, max, step)
  return sliderSortRange([a, b])
}

export function sliderValuesEqual(
  a: number | [number, number],
  b: number | [number, number]
): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a[0] === b[0] && a[1] === b[1]
  return a === b
}

export function sliderPickRangeThumb(value: [number, number], next: number): 'min' | 'max' {
  const [lo, hi] = sliderSortRange(value)
  return Math.abs(next - lo) <= Math.abs(next - hi) ? 'min' : 'max'
}

export function sliderApplyThumbValue(
  current: number | [number, number],
  next: number,
  thumb: 'min' | 'max' | null,
  range: boolean
): number | [number, number] {
  if (!range || !Array.isArray(current)) return next
  const [lo, hi] = sliderSortRange(current)
  const which = thumb ?? sliderPickRangeThumb([lo, hi], next)
  if (which === 'min') return [Math.min(next, hi), hi]
  return [lo, Math.max(next, lo)]
}

export function sliderThumbInsetStyle(pct: number, rtl: boolean): { left: string } {
  const visual = rtl ? 100 - pct : pct
  return { left: `${visual}%` }
}

export function sliderRangeFillStyle(
  startPct: number,
  endPct: number,
  rtl: boolean
): { left: string; width: string } {
  const a = rtl ? 100 - endPct : startPct
  const b = rtl ? 100 - startPct : endPct
  return { left: `${Math.min(a, b)}%`, width: `${Math.abs(b - a)}%` }
}

export function resolveSliderThumbName(options: {
  thumb: 'min' | 'max' | null
  range: boolean
  ariaLabel?: string
  ariaLabelledby?: string
  labels: { ariaLabel: string; minAriaLabel: string; maxAriaLabel: string }
}): { ariaLabel?: string; ariaLabelledby?: string } {
  const { thumb, range, ariaLabel, ariaLabelledby, labels } = options
  const named = typeof ariaLabel === 'string' && ariaLabel.trim() ? ariaLabel.trim() : undefined
  const labelledby =
    typeof ariaLabelledby === 'string' && ariaLabelledby.trim() ? ariaLabelledby.trim() : undefined

  if (!range || !thumb) {
    if (labelledby) return { ariaLabel: named, ariaLabelledby: labelledby }
    return { ariaLabel: named ?? labels.ariaLabel }
  }

  if (labelledby && !named) {
    return { ariaLabelledby: labelledby }
  }

  const base = named ?? labels.ariaLabel
  const suffix = thumb === 'min' ? labels.minAriaLabel : labels.maxAriaLabel
  return { ariaLabel: `${base} (${suffix})` }
}
