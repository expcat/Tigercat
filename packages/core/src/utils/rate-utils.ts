import { classNames } from './class-names'
import { sliderGetKeyboardValue } from './helpers/slider-utils'
import type { RateSize } from '../types/rate'

/** Upper bound so a huge `count` cannot render without limit. */
export const RATE_MAX_COUNT = 10

export function resolveRateCount(count?: number): number {
  if (typeof count !== 'number' || !Number.isFinite(count)) return 5
  const next = Math.floor(count)
  if (next < 1) return 1
  return Math.min(next, RATE_MAX_COUNT)
}

export function rateKeyboardValue(
  key: string,
  value: number,
  max: number,
  step: number,
  rtl: boolean
): number | null {
  return sliderGetKeyboardValue(key, value, 0, max, step, undefined, rtl)
}

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const rateBaseClasses = classNames(
  'inline-flex items-center gap-0.5 rounded-[var(--tiger-radius-sm)]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'focus-visible:ring-[var(--tiger-focus-ring)]/40'
)

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
    sizePx[size],
    isCharacter && sizeText[size],
    disabled ? 'cursor-default' : 'cursor-pointer'
  )
}

/** Fill the sized star host so a custom character is not a 0×0 inline glyph. */
export const rateCharacterGlyphClasses = 'inline-flex h-full w-full items-center justify-center'

/**
 * Active half of a star. Same box as the empty glyph underneath, clipped to the
 * inline-start half. A second width utility on the glyph (w-full vs w-[200%])
 * lets Tailwind drop one of them, so a character centers in the 50% clip and
 * ghosts over the empty star.
 */
export const rateHalfStarInnerClasses =
  'absolute inset-0 overflow-hidden [clip-path:inset(0_50%_0_0)] rtl:[clip-path:inset(0_0_0_50%)]'

export const rateActiveColor =
  'text-[color-mix(in_srgb,var(--tiger-warning)_75%,var(--tiger-text))]'
export const rateInactiveColor = 'text-[var(--tiger-text-disabled)]'
export const rateHoverColor = 'text-[color-mix(in_srgb,var(--tiger-warning)_55%,var(--tiger-text))]'

/** True when the pointer is on the inline-start half of the star. */
export function rateIsInlineStartHalf(
  clientX: number,
  rect: Pick<DOMRect, 'left' | 'width'>,
  rtl: boolean
): boolean {
  const mid = rect.left + rect.width / 2
  return rtl ? clientX >= mid : clientX < mid
}

/* ------------------------------------------------------------------ */
/*  SVG star path                                                      */
/* ------------------------------------------------------------------ */

export const starPathD =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

export const starViewBox = '0 0 20 20'
