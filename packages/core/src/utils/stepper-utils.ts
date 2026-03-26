import { classNames } from './class-names'
import type { StepperSize } from '../types/stepper'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const stepperBaseClasses = 'inline-flex items-center'

const sizePad: Record<StepperSize, string> = {
  sm: 'h-7 text-xs',
  md: 'h-9 text-sm',
  lg: 'h-11 text-base'
}

const btnSize: Record<StepperSize, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11'
}

export function getStepperInputClasses(size: StepperSize): string {
  return classNames(
    'text-center border-y outline-none font-mono',
    sizePad[size],
    'w-14',
    'bg-[var(--tiger-stepper-bg,var(--tiger-surface,#ffffff))]',
    'text-[var(--tiger-stepper-text,var(--tiger-text,#111827))]',
    'border-[var(--tiger-stepper-border,var(--tiger-border,#d1d5db))]'
  )
}

export function getStepperButtonClasses(
  size: StepperSize,
  disabled: boolean,
  position: 'left' | 'right'
): string {
  return classNames(
    'inline-flex items-center justify-center border transition-colors',
    btnSize[size],
    position === 'left' ? 'rounded-l-md' : 'rounded-r-md',
    disabled
      ? 'opacity-50 cursor-not-allowed bg-[var(--tiger-stepper-btn-bg-disabled,var(--tiger-fill,#f3f4f6))]'
      : 'cursor-pointer bg-[var(--tiger-stepper-btn-bg,var(--tiger-fill,#f3f4f6))] hover:bg-[var(--tiger-stepper-btn-bg-hover,var(--tiger-fill-hover,#e5e7eb))]',
    'text-[var(--tiger-stepper-btn-text,var(--tiger-text,#111827))]',
    'border-[var(--tiger-stepper-border,var(--tiger-border,#d1d5db))]'
  )
}

/* ------------------------------------------------------------------ */
/*  Icon paths (minus / plus)                                          */
/* ------------------------------------------------------------------ */

export const minusPathD = 'M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z'
export const plusPathD =
  'M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
export const stepperIconViewBox = '0 0 20 20'

/* ------------------------------------------------------------------ */
/*  Value helpers                                                      */
/* ------------------------------------------------------------------ */

export function clampStepperValue(
  value: number,
  min: number,
  max: number,
  precision?: number
): number {
  let v = Math.max(min, Math.min(max, value))
  if (precision !== undefined) {
    v = Number(v.toFixed(precision))
  }
  return v
}
