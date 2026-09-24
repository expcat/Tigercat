/**
 * WCAG 2.x contrast helpers used when a brand seed becomes interaction colors.
 * Text pairs must clear 4.5:1. Control boundaries must clear 3:1.
 */

export const TEXT_CONTRAST_MIN = 4.5
export const BOUNDARY_CONTRAST_MIN = 3

export interface Rgb {
  r: number
  g: number
  b: number
}

export class ContrastError extends Error {
  readonly ratio: number
  readonly minimum: number

  constructor(ratio: number, minimum: number) {
    super(`Contrast ${ratio.toFixed(2)}:1 is below ${minimum}:1`)
    this.name = 'ContrastError'
    this.ratio = ratio
    this.minimum = minimum
  }
}

function channelByte(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(255, Math.round(value)))
}

export function parseHexColor(input: string): Rgb {
  const hex = input.trim().replace(/^#/, '')
  const expanded =
    hex.length === 3 || hex.length === 4
      ? hex
          .slice(0, 3)
          .split('')
          .map((part) => part + part)
          .join('')
      : hex.slice(0, 6)
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error(`Invalid color: ${input}`)
  }
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16)
  }
}

export function rgbToHex(rgb: Rgb): string {
  const part = (value: number) => channelByte(value).toString(16).padStart(2, '0')
  return `#${part(rgb.r)}${part(rgb.g)}${part(rgb.b)}`
}

function linearChannel(byte: number): number {
  const value = byte / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(color: string): number {
  const { r, g, b } = parseHexColor(color)
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b)
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}

export function assertContrast(foreground: string, background: string, minimum: number): number {
  const ratio = contrastRatio(foreground, background)
  if (ratio < minimum) throw new ContrastError(ratio, minimum)
  return ratio
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return {
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount
  }
}

function mixHex(from: string, to: string, amount: number): string {
  return rgbToHex(mix(parseHexColor(from), parseHexColor(to), amount))
}

/** Push `color` toward black or white until it clears `minimum` against `surface`. */
function untilContrast(color: string, surface: string, minimum: number): string {
  let current = color
  const toward = relativeLuminance(surface) > 0.5 ? '#000000' : '#ffffff'
  for (let step = 0; step <= 20; step += 1) {
    if (contrastRatio(current, surface) >= minimum) return current
    current = mixHex(current, toward, 0.12)
  }
  return current
}

export interface InteractionStates {
  solid: string
  hover: string
  active: string
  disabled: string
  foreground: string
}

/**
 * Hover, active, disabled, and a foreground that clears text contrast on the solid.
 * Throws when the solid cannot clear the control-boundary ratio against `surface`.
 */
export function deriveInteractionStates(seed: string, surface = '#ffffff'): InteractionStates {
  const solid = untilContrast(seed, surface, BOUNDARY_CONTRAST_MIN)
  assertContrast(solid, surface, BOUNDARY_CONTRAST_MIN)
  const hover = mixHex(solid, '#000000', 0.12)
  const active = mixHex(solid, '#000000', 0.22)
  const disabled = mixHex(solid, surface, 0.55)
  const black = contrastRatio('#000000', solid)
  const white = contrastRatio('#ffffff', solid)
  const foreground = black >= white ? '#000000' : '#ffffff'
  assertContrast(foreground, solid, TEXT_CONTRAST_MIN)
  return { solid, hover, active, disabled, foreground }
}
