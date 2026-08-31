/**
 * AspectRatio utility functions
 *
 * Pure ratio parsing/validation and Tailwind class builders shared by the
 * Vue and React AspectRatio implementations. All helpers are string/number
 * only, so they stay safe to evaluate during server-side rendering.
 *
 * Overflow clipping and replaced-element fill live in the injected
 * stylesheet so rounded corners and media do not depend on the caller
 * adding `overflow-hidden`.
 */

import type { AspectRatioStyle, AspectRatioValue } from '../types/aspect-ratio'
import { classNames } from './class-names'
import { isBrowser } from './env'

/** Ratio applied when ratio is omitted or invalid */
export const ASPECT_RATIO_DEFAULT = '16/9'

/** Numeric form of ASPECT_RATIO_DEFAULT */
const ASPECT_RATIO_DEFAULT_NUMERIC = 16 / 9

/** Style for the default ratio (fraction form keeps full precision) */
const ASPECT_RATIO_DEFAULT_STYLE: AspectRatioStyle = { aspectRatio: '16 / 9' }

/** Fraction string such as 16/9 or 1.5 / 2 */
const ASPECT_RATIO_FRACTION_PATTERN = /^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/

export const ASPECT_RATIO_STYLE_ID = 'tiger-ui-aspect-ratio-styles'

export const ASPECT_RATIO_CSS = `
.tiger-aspect-ratio {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.tiger-aspect-ratio-content {
  position: absolute;
  inset: 0;
}
.tiger-aspect-ratio-content > img,
.tiger-aspect-ratio-content > video,
.tiger-aspect-ratio-content > iframe {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 0;
}
`

export function injectAspectRatioStyles(): void {
  if (!isBrowser()) return
  if (document.getElementById(ASPECT_RATIO_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = ASPECT_RATIO_STYLE_ID
  style.textContent = ASPECT_RATIO_CSS
  document.head.appendChild(style)
}

// ─── Tailwind class constants ─────────────────────────────────────

export const aspectRatioRootClasses = 'tiger-aspect-ratio relative w-full overflow-hidden'

export const aspectRatioContentClasses = 'tiger-aspect-ratio-content absolute inset-0'

/**
 * Validate a parsed ratio candidate.
 */
function isValidAspectRatio(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

/**
 * Extract a valid fraction's raw pieces from a ratio string.
 */
function matchValidFraction(ratio: string): { numerator: string; denominator: string } | null {
  const fraction = ASPECT_RATIO_FRACTION_PATTERN.exec(ratio)
  if (!fraction) return null

  const numerator = Number(fraction[1])
  const denominator = Number(fraction[2])
  if (
    denominator <= 0 ||
    !isValidAspectRatio(numerator) ||
    !isValidAspectRatio(numerator / denominator)
  ) {
    return null
  }
  return { numerator: fraction[1], denominator: fraction[2] }
}

/**
 * Resolve any supported ratio input to a positive finite number.
 *
 * Numbers are validated directly. Strings may be fractions ('16/9') or
 * plain numeric values ('1.5'). Anything else — including zero, negative,
 * NaN, Infinity, or a zero denominator — resolves to fallback.
 */
export function parseAspectRatio(
  ratio: AspectRatioValue | undefined,
  fallback: number = ASPECT_RATIO_DEFAULT_NUMERIC
): number {
  if (typeof ratio === 'number') {
    return isValidAspectRatio(ratio) ? ratio : fallback
  }

  if (typeof ratio === 'string') {
    const fraction = matchValidFraction(ratio)
    if (fraction) {
      return Number(fraction.numerator) / Number(fraction.denominator)
    }

    const numeric = Number(ratio.trim())
    return isValidAspectRatio(numeric) ? numeric : fallback
  }

  return fallback
}

/**
 * Build the inline aspect-ratio style for the root element.
 *
 * Fraction inputs are preserved as CSS fraction values (precision-safe),
 * numeric inputs are emitted as plain numbers.
 */
export function getAspectRatioStyle(ratio?: AspectRatioValue): AspectRatioStyle {
  if (typeof ratio === 'string') {
    const fraction = matchValidFraction(ratio)
    if (fraction) {
      return { aspectRatio: fraction.numerator + ' / ' + fraction.denominator }
    }

    const numeric = Number(ratio.trim())
    if (isValidAspectRatio(numeric)) {
      return { aspectRatio: String(numeric) }
    }

    return ASPECT_RATIO_DEFAULT_STYLE
  }

  if (typeof ratio === 'number' && isValidAspectRatio(ratio)) {
    return { aspectRatio: String(ratio) }
  }

  return ASPECT_RATIO_DEFAULT_STYLE
}

/**
 * Classes for the root ratio box.
 */
export function getAspectRatioRootClasses(className?: string): string {
  injectAspectRatioStyles()
  return classNames(aspectRatioRootClasses, className)
}

/**
 * Classes for the content wrapper that fills the ratio box.
 */
export function getAspectRatioContentClasses(className?: string): string {
  injectAspectRatioStyles()
  return classNames(aspectRatioContentClasses, className)
}
