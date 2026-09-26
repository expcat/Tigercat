import { classNames } from './class-names'
import type { ComponentSize } from '../types/base'
import type { ColorFormat } from '../types/color-picker'
import type { InputStatus } from '../types/input'
import type { TigerLocaleColorPicker } from '../types/locale'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const colorPickerBaseClasses = 'relative inline-block'

const triggerSizes: Record<ComponentSize, string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10'
}

export function getColorPickerTriggerClasses(
  size: ComponentSize,
  disabled: boolean,
  status: InputStatus = 'default'
): string {
  return classNames(
    'inline-flex items-center justify-center p-0',
    'rounded-[var(--tiger-radius-md)] border',
    'tiger-motion-aware [transition:var(--tiger-transition-base)]',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--tiger-focus-ring)]',
    triggerSizes[size],
    status === 'error' ? 'border-[var(--tiger-error)]' : 'border-[var(--tiger-border)]',
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer hover:border-[var(--tiger-primary)]'
  )
}

export const colorPickerTriggerSwatchClasses =
  'block h-full w-full overflow-hidden rounded-[calc(var(--tiger-radius-md)-1px)]'

export const colorPickerPanelClasses = classNames(
  // Shrink-to-fit width tracked the preview string, so a pick resized the SV plane.
  // w-56 is a definite box; sliders and the plane are both w-full inside it.
  'flex w-56 min-w-0 flex-col gap-3 p-3',
  'rounded-[var(--tiger-radius-md)]',
  'shadow-[var(--tiger-shadow-md)]',
  'bg-[var(--tiger-surface)]',
  'border border-[var(--tiger-border)]',
  'max-sm:h-full max-sm:w-full max-sm:max-h-none max-sm:rounded-none max-sm:shadow-none'
)

export const colorPickerInputClasses = classNames(
  'w-full min-w-0 rounded-[var(--tiger-radius-sm)] border px-2 py-1 text-xs font-mono',
  'bg-[var(--tiger-surface)]',
  'border-[var(--tiger-border)]',
  'text-[var(--tiger-text)]',
  'tiger-motion-aware [transition:var(--tiger-transition-base)]',
  'outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring)]'
)

export const colorPickerSliderTrackClasses = classNames(
  'w-full min-w-0 h-3 rounded-full cursor-pointer appearance-none',
  'border border-[var(--tiger-border)]',
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3',
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--tiger-surface)]',
  '[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--tiger-border)]',
  '[&::-webkit-slider-thumb]:shadow-[var(--tiger-shadow-sm)]',
  '[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[var(--tiger-border)]',
  '[&::-moz-range-thumb]:bg-[var(--tiger-surface)]'
)

export const colorPickerHueTrackStyle = {
  backgroundImage:
    'linear-gradient(to right,#ff0000 0%,#ffff00 17%,#00ff00 33%,#00ffff 50%,#0000ff 67%,#ff00ff 83%,#ff0000 100%)'
} as const

export const colorPickerCheckerboardStyle = {
  backgroundImage:
    'linear-gradient(45deg,#d1d5db 25%,transparent 25%),linear-gradient(-45deg,#d1d5db 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d1d5db 75%),linear-gradient(-45deg,transparent 75%,#d1d5db 75%)',
  backgroundSize: '10px 10px',
  backgroundPosition: '0 0,0 5px,5px -5px,-5px 0px'
} as const

export const colorPickerSvPlaneClasses = classNames(
  // Clip the thumb. It is translated -50% and otherwise paints outside the plane.
  'relative h-36 w-full min-w-0 overflow-hidden cursor-crosshair rounded-[var(--tiger-radius-sm)]',
  'border border-[var(--tiger-border)] outline-none',
  'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]'
)

export const colorPickerSvThumbClasses = classNames(
  'pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full',
  'border-2 border-white shadow-[var(--tiger-shadow-sm)]'
)

export const colorPickerPreviewClasses = classNames(
  'h-8 w-8 shrink-0 overflow-hidden rounded-[var(--tiger-radius-sm)]',
  'border border-[var(--tiger-border)]'
)

/** Readout beside the preview swatch. Must not contribute max-content width. */
export const colorPickerValueClasses =
  'min-w-0 flex-1 truncate text-xs font-mono text-[var(--tiger-text)]'

export const colorPickerFieldClasses = 'min-w-0'

/** sm swatches (1.5rem) plus gap-2 fit the w-56 content box; extras wrap. */
export const COLOR_PICKER_PRESET_COLUMNS = 6

export const colorPickerClearButtonClasses = classNames(
  'text-xs text-[var(--tiger-primary)] hover:underline',
  'rounded-sm outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring)]'
)

export const colorPickerChromeLabelClasses = 'block text-xs text-[var(--tiger-text-secondary)] mb-1'

export const DEFAULT_COLOR_PICKER_HSVA: HsvaColor = { h: 0, s: 100, v: 100, a: 1 }

/** Shown beside an unparseable draft. Not a painted or submitted color. */
export const COLOR_PICKER_INVALID_VALUE_TEXT = 'Enter a valid color.'

/* ------------------------------------------------------------------ */
/*  Color conversion utilities                                         */
/* ------------------------------------------------------------------ */

export interface HsvColor {
  h: number
  s: number
  v: number
}

export interface HsvaColor extends HsvColor {
  a: number
}

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface ParsedColorParts extends RgbColor {
  a: number
}

/**
 * Empty for painting and for the submitted value.
 * Null, blank, and unparseable strings are empty. A parsed color is not.
 */
export function isColorPickerEmpty(value: string | undefined | null): boolean {
  if (value == null || value.trim() === '') return true
  return parseColorParts(value) == null
}

/** Native submit value: a parsed color, or '' when empty or unparseable. */
export function submittedColorPickerValue(value: string | null | undefined): string {
  if (isColorPickerEmpty(value) || value == null) return ''
  return value
}

export function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3 || clean.length === 4
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const rgbPart = full.length >= 6 ? full.slice(0, 6) : full.padEnd(6, '0')
  const num = parseInt(rgbPart, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

function hexAlpha(hex: string): number {
  const clean = hex.replace('#', '')
  if (clean.length === 4) {
    const nibble = parseInt(clean[3] + clean[3], 16)
    return Number.isFinite(nibble) ? nibble / 255 : 1
  }
  if (clean.length === 8) {
    const byte = parseInt(clean.slice(6, 8), 16)
    return Number.isFinite(byte) ? byte / 255 : 1
  }
  return 1
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  )
}

export function rgbToHex8(r: number, g: number, b: number, a: number): string {
  const alpha = Math.max(0, Math.min(255, Math.round(clampUnit(a) * 255)))
    .toString(16)
    .padStart(2, '0')
  return `${rgbToHex(r, g, b)}${alpha}`
}

export function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const hsv = rgbToHsva(r, g, b, 1)
  return { h: Math.round(hsv.h), s: Math.round(hsv.s), v: Math.round(hsv.v) }
}

export function rgbToHsva(r: number, g: number, b: number, a = 1): HsvaColor {
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) * 60
    else if (max === gg) h = ((bb - rr) / d + 2) * 60
    else h = ((rr - gg) / d + 4) * 60
  }

  const s = max === 0 ? 0 : (d / max) * 100
  const v = max * 100

  return { h, s, v, a: clampUnit(a) }
}

export function hsvToRgb(h: number, s: number, v: number): RgbColor {
  const hue = ((h % 360) + 360) % 360
  const ss = Math.max(0, Math.min(100, s)) / 100
  const vv = Math.max(0, Math.min(100, v)) / 100
  const c = vv * ss
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = vv - c

  let r = 0
  let g = 0
  let b = 0
  if (hue < 60) {
    r = c
    g = x
    b = 0
  } else if (hue < 120) {
    r = x
    g = c
    b = 0
  } else if (hue < 180) {
    r = 0
    g = c
    b = x
  } else if (hue < 240) {
    r = 0
    g = x
    b = c
  } else if (hue < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

export function hsvaToRgb(hsva: HsvaColor): ParsedColorParts {
  const rgb = hsvToRgb(hsva.h, hsva.s, hsva.v)
  return { ...rgb, a: clampUnit(hsva.a) }
}

export function formatColorString(
  r: number,
  g: number,
  b: number,
  format: ColorFormat,
  alpha?: number
): string {
  const aa = alpha === undefined ? undefined : clampUnit(alpha)
  if (format === 'hex') {
    if (aa !== undefined && aa < 1) return rgbToHex8(r, g, b, aa)
    return rgbToHex(r, g, b)
  }
  if (format === 'rgb') {
    return aa !== undefined && aa < 1
      ? `rgba(${r}, ${g}, ${b}, ${formatAlpha(aa)})`
      : `rgb(${r}, ${g}, ${b})`
  }
  const hsv = rgbToHsv(r, g, b)
  const { h, s, v: vv } = hsv
  const l = (vv * (200 - s)) / 200
  const sl = l === 0 || l === 100 ? 0 : ((vv - l) / Math.min(l, 100 - l)) * 100
  const slRound = Math.round(sl)
  const lRound = Math.round(l)
  return aa !== undefined && aa < 1
    ? `hsla(${h}, ${slRound}%, ${lRound}%, ${formatAlpha(aa)})`
    : `hsl(${h}, ${slRound}%, ${lRound}%)`
}

export function formatHsva(hsva: HsvaColor, format: ColorFormat, showAlpha: boolean): string {
  const rgb = hsvToRgb(hsva.h, hsva.s, hsva.v)
  return formatColorString(rgb.r, rgb.g, rgb.b, format, showAlpha ? hsva.a : undefined)
}

export function cssColorFromHsva(hsva: HsvaColor, showAlpha: boolean): string {
  const rgb = hsvToRgb(hsva.h, hsva.s, hsva.v)
  if (showAlpha && hsva.a < 1) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${formatAlpha(hsva.a)})`
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

export function isValidHex(value: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value.trim())
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function clampUnit(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, n))
}

function formatAlpha(a: number): string {
  const rounded = Math.round(a * 1000) / 1000
  return String(rounded)
}

function parseOptionalAlpha(raw: string | undefined): number {
  if (raw === undefined || raw === '') return 1
  const trimmed = raw.trim()
  if (trimmed.endsWith('%')) {
    const n = Number(trimmed.slice(0, -1))
    if (!Number.isFinite(n)) return 1
    return clampUnit(n / 100)
  }
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return 1
  return n > 1 ? clampUnit(n / 255) : clampUnit(n)
}

function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hue = ((h % 360) + 360) % 360
  const ss = Math.max(0, Math.min(100, s)) / 100
  const ll = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * ll - 1)) * ss
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = ll - c / 2

  let r = 0
  let g = 0
  let b = 0
  if (hue < 60) {
    r = c
    g = x
    b = 0
  } else if (hue < 120) {
    r = x
    g = c
    b = 0
  } else if (hue < 180) {
    r = 0
    g = c
    b = x
  } else if (hue < 240) {
    r = 0
    g = x
    b = c
  } else if (hue < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

const COMMA_RGB = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+%?))?\s*\)\s*$/i
const SPACE_RGB = /^rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)(?:\s*\/\s*([\d.]+%?))?\s*\)\s*$/i
const COMMA_HSL =
  /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+%?))?\s*\)\s*$/i
const SPACE_HSL = /^hsla?\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%(?:\s*\/\s*([\d.]+%?))?\s*\)\s*$/i

/**
 * Parse a CSS color string into RGB channels plus alpha in 0..1.
 * Accepts hex (3/4/6/8), comma or space-separated rgb/hsl (with `/` alpha).
 */
export function parseColorParts(raw: string): ParsedColorParts | null {
  const value = raw.trim()
  if (!value) return null

  if (isValidHex(value)) {
    const rgb = hexToRgb(value)
    return { r: rgb.r, g: rgb.g, b: rgb.b, a: hexAlpha(value) }
  }

  const rgbMatch = value.match(COMMA_RGB) ?? value.match(SPACE_RGB)
  if (rgbMatch) {
    return {
      r: clampByte(Number(rgbMatch[1])),
      g: clampByte(Number(rgbMatch[2])),
      b: clampByte(Number(rgbMatch[3])),
      a: parseOptionalAlpha(rgbMatch[4])
    }
  }

  const hslMatch = value.match(COMMA_HSL) ?? value.match(SPACE_HSL)
  if (hslMatch) {
    const rgb = hslToRgb(Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3]))
    return {
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      a: parseOptionalAlpha(hslMatch[4])
    }
  }

  return null
}

export function parseColorToHsva(raw: string | undefined | null): HsvaColor | null {
  if (raw == null) return null
  const parts = parseColorParts(raw)
  if (!parts) return null
  return rgbToHsva(parts.r, parts.g, parts.b, parts.a)
}

/**
 * Parsed HSVA for a committed color. Empty and unparseable text stay null —
 * never a stand-in red.
 */
export function seedColorPickerHsva(value: string | undefined | null): HsvaColor | null {
  return parseColorToHsva(value)
}

export interface ColorPickerValueDescription {
  text: string
  invalid: boolean
  hsva: HsvaColor | null
}

/** How an external value should appear before the user edits the draft. */
export function describeColorPickerValue(
  value: string | null | undefined,
  format: ColorFormat,
  showAlpha: boolean
): ColorPickerValueDescription {
  if (value == null || value.trim() === '') return { text: '', invalid: false, hsva: null }
  const hsva = parseColorToHsva(value)
  if (!hsva) return { text: value, invalid: true, hsva: null }
  return { text: formatHsva(hsva, format, showAlpha), invalid: false, hsva }
}

export type ColorPickerDragPhase = 'preview' | 'commit'

/**
 * Drag / slider phases. Preview keeps the next HSVA and writes nothing.
 * Commit formats once for the form value.
 */
export function resolveColorPickerDrag(
  phase: ColorPickerDragPhase,
  next: HsvaColor,
  format: ColorFormat,
  showAlpha: boolean
): { hsva: HsvaColor; value: string | null } {
  if (phase === 'preview') return { hsva: next, value: null }
  return { hsva: next, value: formatHsva(next, format, showAlpha) }
}

/**
 * Parse typed input and re-emit in the requested format.
 * 3-digit hex expands to 6 digits. Invalid input returns null.
 */
export function parseColorInput(
  raw: string,
  format: ColorFormat = 'hex',
  showAlpha = false
): string | null {
  const hsva = parseColorToHsva(raw)
  if (!hsva) return null
  return formatHsva(hsva, format, showAlpha)
}

export function commitPresetColor(
  preset: string,
  current: HsvaColor,
  format: ColorFormat,
  showAlpha: boolean
): string | null {
  const parsed = parseColorToHsva(preset)
  if (!parsed) return null
  const next: HsvaColor = {
    ...parsed,
    a: showAlpha ? current.a : 1
  }
  if (!showAlpha) next.a = 1
  else if (parsed.a < 1) next.a = parsed.a
  return formatHsva(next, format, showAlpha)
}

export function hsvaFromSvPointer(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  hue: number,
  alpha: number
): HsvaColor {
  const width = rect.width || 1
  const height = rect.height || 1
  const s = clampPercent(((clientX - rect.left) / width) * 100)
  const v = clampPercent((1 - (clientY - rect.top) / height) * 100)
  return { h: hue, s, v, a: clampUnit(alpha) }
}

export function applyColorPickerHue(hsva: HsvaColor, hue: number): HsvaColor {
  return { ...hsva, h: Math.max(0, Math.min(360, hue)) }
}

export function applyColorPickerAlpha(hsva: HsvaColor, alpha: number): HsvaColor {
  return { ...hsva, a: clampUnit(alpha) }
}

export function nudgeColorPickerSv(hsva: HsvaColor, ds: number, dv: number): HsvaColor {
  return {
    ...hsva,
    s: clampPercent(hsva.s + ds),
    v: clampPercent(hsva.v + dv)
  }
}

export function getColorPickerSvPlaneStyle(hue: number): Record<string, string> {
  const rgb = hsvToRgb(hue, 100, 100)
  return {
    backgroundImage: `linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,rgb(${rgb.r},${rgb.g},${rgb.b}))`
  }
}

export function getColorPickerAlphaTrackStyle(hsva: HsvaColor): Record<string, string> {
  const rgb = hsvToRgb(hsva.h, hsva.s, hsva.v)
  return {
    backgroundImage: `linear-gradient(to right,rgba(${rgb.r},${rgb.g},${rgb.b},0),rgb(${rgb.r},${rgb.g},${rgb.b})),${colorPickerCheckerboardStyle.backgroundImage}`,
    backgroundSize: `100% 100%, ${colorPickerCheckerboardStyle.backgroundSize}`,
    backgroundPosition: `0 0, ${colorPickerCheckerboardStyle.backgroundPosition}`
  }
}

export function getColorPickerFormatLabel(
  format: ColorFormat,
  labels: Required<Pick<TigerLocaleColorPicker, 'formatHex' | 'formatRgb' | 'formatHsl'>>
): string {
  if (format === 'hex') return labels.formatHex
  if (format === 'rgb') return labels.formatRgb
  return labels.formatHsl
}

export function mergeHsvaHue(previous: HsvaColor | null, next: HsvaColor): HsvaColor {
  if (!previous) return next
  if (next.s === 0) return { ...next, h: previous.h }
  return next
}
