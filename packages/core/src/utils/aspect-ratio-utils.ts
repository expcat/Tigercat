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

import type { AspectRatioFit, AspectRatioStyle, AspectRatioValue } from '../types/aspect-ratio'
import { classNames } from './class-names'
import { devWarn } from './dev-warn'

/** Ratio applied when ratio is omitted or invalid */
export const ASPECT_RATIO_DEFAULT = '16/9'

/** Numeric form of ASPECT_RATIO_DEFAULT */
const ASPECT_RATIO_DEFAULT_NUMERIC = 16 / 9

/** Style for the default ratio (fraction form keeps full precision) */
const ASPECT_RATIO_DEFAULT_STYLE: AspectRatioStyle = { aspectRatio: '16 / 9' }

/** Fraction string such as 16/9, 16:9, or 1.5 / 2 */
const ASPECT_RATIO_FRACTION_PATTERN = new RegExp(
  '^\\s*(\\d+(?:\\.\\d+)?)\\s*[/:]\\s*(\\d+(?:\\.\\d+)?)\\s*$'
)

/** Ratio box. No runtime `<style>`. Default does not crop media. */
export const aspectRatioBaseStyles = {
  '.tiger-aspect-ratio': {
    position: 'relative',
    width: '100%',
    overflow: 'visible'
  },
  '.tiger-aspect-ratio-content': {
    width: '100%',
    height: '100%',
    minWidth: '0',
    minHeight: '0'
  },
  '.tiger-aspect-ratio-fit-contain > img, .tiger-aspect-ratio-fit-contain > video, .tiger-aspect-ratio-fit-contain > iframe':
    {
      objectFit: 'contain',
      width: '100%',
      height: '100%'
    },
  '.tiger-aspect-ratio-fit-cover > img, .tiger-aspect-ratio-fit-cover > video, .tiger-aspect-ratio-fit-cover > iframe':
    {
      objectFit: 'cover',
      width: '100%',
      height: '100%'
    },
  '.tiger-aspect-ratio-fit-fill > img, .tiger-aspect-ratio-fit-fill > video, .tiger-aspect-ratio-fit-fill > iframe':
    {
      objectFit: 'fill',
      width: '100%',
      height: '100%'
    }
} as const

// ─── Tailwind class constants ─────────────────────────────────────

export const aspectRatioRootClasses = 'tiger-aspect-ratio relative w-full overflow-visible'

export const aspectRatioContentClasses = 'tiger-aspect-ratio-content h-full w-full min-h-0 min-w-0'

const ASPECT_FIT_CLASSES: Record<Exclude<AspectRatioFit, 'none'>, string> = {
  contain: 'tiger-aspect-ratio-fit-contain',
  cover: 'tiger-aspect-ratio-fit-cover',
  fill: 'tiger-aspect-ratio-fit-fill'
}

export function getAspectRatioFitClasses(fit?: AspectRatioFit | null): string | undefined {
  if (!fit || fit === 'none') return undefined
  return ASPECT_FIT_CLASSES[fit]
}

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
    if (isValidAspectRatio(ratio)) return ratio
    devWarn('AspectRatio.ratio', `Invalid aspect ratio "${ratio}". Falling back to 16/9.`)
    return fallback
  }

  if (typeof ratio === 'string') {
    const fraction = matchValidFraction(ratio)
    if (fraction) {
      return Number(fraction.numerator) / Number(fraction.denominator)
    }

    const numeric = Number(ratio.trim())
    if (isValidAspectRatio(numeric)) return numeric
    devWarn('AspectRatio.ratio', `Invalid aspect ratio "${ratio}". Falling back to 16/9.`)
    return fallback
  }

  if (ratio != null) {
    devWarn('AspectRatio.ratio', `Invalid aspect ratio "${String(ratio)}". Falling back to 16/9.`)
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

    devWarn('AspectRatio.ratio', `Invalid aspect ratio "${ratio}". Falling back to 16/9.`)
    return ASPECT_RATIO_DEFAULT_STYLE
  }

  if (typeof ratio === 'number' && isValidAspectRatio(ratio)) {
    return { aspectRatio: String(ratio) }
  }

  if (ratio != null) {
    devWarn('AspectRatio.ratio', `Invalid aspect ratio "${String(ratio)}". Falling back to 16/9.`)
  }
  return ASPECT_RATIO_DEFAULT_STYLE
}

/**
 * Classes for the root ratio box.
 */
export function getAspectRatioRootClasses(className?: string, fit?: AspectRatioFit | null): string {
  return classNames(aspectRatioRootClasses, getAspectRatioFitClasses(fit), className)
}

/**
 * Classes for the content wrapper that fills the ratio box.
 */
export function getAspectRatioContentClasses(className?: string): string {
  return classNames(aspectRatioContentClasses, className)
}
