import { classNames } from './class-names'
import type { RateSize } from '../types/rate'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const rateBaseClasses = 'inline-flex items-center gap-0.5'

const sizePx: Record<RateSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7'
}

const sizeText: Record<RateSize, string> = {
  sm: 'text-sm leading-4',
  md: 'text-lg leading-5',
  lg: 'text-2xl leading-7'
}

export function getRateStarClasses(
  size: RateSize,
  isCharacter: boolean,
  disabled: boolean
): string {
  return classNames(
    'relative inline-flex items-center justify-center transition-colors select-none',
    isCharacter ? sizeText[size] : sizePx[size],
    disabled ? 'cursor-default' : 'cursor-pointer'
  )
}

export const rateActiveColor = 'text-[var(--tiger-rate-active,var(--tiger-warning,#f59e0b))]'
export const rateInactiveColor = 'text-[var(--tiger-rate-inactive,var(--tiger-border,#d1d5db))]'
export const rateHoverColor = 'text-[var(--tiger-rate-hover,var(--tiger-warning,#fbbf24))]'

/* ------------------------------------------------------------------ */
/*  SVG star path                                                      */
/* ------------------------------------------------------------------ */

export const starPathD =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

export const starViewBox = '0 0 20 20'
