/**
 * One accent seed, one neutral seed, one radius base, and a density knob.
 * Named presets are examples of these knobs. They are not a second color table.
 */

import { deriveInteractionStates, parseHexColor, rgbToHex, type Rgb } from './contrast'

export const ACCENT_STEP_COUNT = 12
export const NEUTRAL_STEP_COUNT = 12
export const SHADOW_STEP_COUNT = 6

export interface AccentScaleOptions {
  neutral?: string
  /** Single `--tiger-radius` base. Steps are multiples of this length. */
  radius?: string
  /** 1 is the default. Lower is tighter, higher is roomier. */
  density?: number
}

export interface RadiusScale {
  base: string
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface AccentScale {
  accent: readonly string[]
  neutral: readonly string[]
  shadow: readonly string[]
  radius: RadiusScale
  density: number
  states: ReturnType<typeof deriveInteractionStates>
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount
  }
}

/** Light backgrounds through solid, then accessible text. Twelve steps. */
function stepsFromSeed(seed: string): string[] {
  const rgb = parseHexColor(seed)
  const white = { r: 255, g: 255, b: 255 }
  const black = { r: 0, g: 0, b: 0 }
  const towardWhite = [0.96, 0.92, 0.86, 0.78, 0.66, 0.5, 0.32, 0.16]
  const background = towardWhite.map((amount) => rgbToHex(mix(rgb, white, amount)))
  const solid = rgbToHex(rgb)
  const text = [0.28, 0.48, 0.7].map((amount) => rgbToHex(mix(rgb, black, amount)))
  return [...background, solid, ...text]
}

function parsePx(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 6
}

function radiusScale(base: string, density: number): RadiusScale {
  const px = parsePx(base) * density
  const length = (factor: number) => `${Math.round(px * factor * 100) / 100}px`
  return {
    base: `${Math.round(px * 100) / 100}px`,
    none: '0',
    sm: length(0.67),
    md: length(1),
    lg: length(1.5),
    xl: length(2),
    full: '9999px'
  }
}

function shadowSteps(density: number): string[] {
  const alphas = [0.04, 0.08, 0.12, 0.16, 0.22, 0.3].map((alpha) =>
    Math.min(0.55, alpha * (2 - Math.min(density, 1.5)))
  )
  const blurs = [2, 4, 8, 16, 24, 40]
  return alphas.map((alpha, index) => {
    const blur = blurs[index] ?? 8
    const y = Math.max(1, Math.round(blur / 4))
    return `0 ${y}px ${blur}px 0 rgba(0,0,0,${alpha.toFixed(3)})`
  })
}

export function deriveAccentScale(seed: string, options: AccentScaleOptions = {}): AccentScale {
  const density = options.density ?? 1
  const neutralSeed = options.neutral ?? '#737373'
  const accent = stepsFromSeed(seed)
  const neutral = stepsFromSeed(neutralSeed)
  if (accent.length !== ACCENT_STEP_COUNT || neutral.length !== NEUTRAL_STEP_COUNT) {
    throw new Error('Accent scale must produce 12 steps')
  }
  return {
    accent,
    neutral,
    shadow: shadowSteps(density),
    radius: radiusScale(options.radius ?? '6px', density),
    density,
    states: deriveInteractionStates(seed)
  }
}

export function accentScaleCssVars(scale: AccentScale): Record<string, string> {
  const vars: Record<string, string> = {
    '--tiger-radius': scale.radius.base
  }
  scale.accent.forEach((value, index) => {
    vars[`--tiger-accent-${index + 1}`] = value
  })
  scale.neutral.forEach((value, index) => {
    vars[`--tiger-neutral-${index + 1}`] = value
  })
  scale.shadow.forEach((value, index) => {
    vars[`--tiger-shadow-${index + 1}`] = value
  })
  return vars
}

export function mixToward(from: string, to: string, amount: number): string {
  return rgbToHex(mix(parseHexColor(from), parseHexColor(to), amount))
}
