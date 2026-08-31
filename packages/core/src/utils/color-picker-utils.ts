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
    'rounded-[var(--tiger-radius-md,0.5rem)] border',
    'tiger-motion-aware [transition:var(--tiger-transition-base,border-color_150ms_ease,box-shadow_150ms_ease)]',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]',
    triggerSizes[size],
    status === 'error'
      ? 'border-[var(--tiger-error,#dc2626)]'
      : 'border-[var(--tiger-border,#d1d5db)]',
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer hover:border-[var(--tiger-primary,#2563eb)]'
  )
}

export const colorPickerTriggerSwatchClasses =
  'block h-full w-full overflow-hidden rounded-[calc(var(--tiger-radius-md,0.5rem)-1px)]'

export const colorPickerPanelClasses = classNames(
  'flex flex-col gap-3 p-3',
  'rounded-[var(--tiger-radius-md,0.5rem)]',
  'shadow-[var(--tiger-shadow-md,0_4px_6px_-1px_rgb(0_0_0_/_0.1))]',
  'bg-[var(--tiger-surface,#ffffff)]',
  'border border-[var(--tiger-border,#d1d5db)]',
  'max-sm:h-full max-sm:max-h-none max-sm:rounded-none max-sm:shadow-none'
)

export const colorPickerInputClasses = classNames(
  'w-full rounded-[var(--tiger-radius-sm,0.375rem)] border px-2 py-1 text-xs font-mono',
  'bg-[var(--tiger-surface,#ffffff)]',
  'border-[var(--tiger-border,#d1d5db)]',
  'text-[var(--tiger-text,#111827)]',
  'tiger-motion-aware [transition:var(--tiger-transition-base,border-color_150ms_ease)]',
  'outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
)

export const colorPickerSliderTrackClasses = classNames(
  'w-full h-3 rounded-full cursor-pointer appearance-none',
  'border border-[var(--tiger-border,#d1d5db)]',
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3',
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--tiger-surface,#ffffff)]',
  '[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--tiger-border,#d1d5db)]',
  '[&::-webkit-slider-thumb]:shadow-[var(--tiger-shadow-sm,0_1px_2px_rgb(0_0_0_/_0.1))]',
  '[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[var(--tiger-border,#d1d5db)]',
  '[&::-moz-range-thumb]:bg-[var(--tiger-surface,#ffffff)]'
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
  'relative h-36 w-full cursor-crosshair rounded-[var(--tiger-radius-sm,0.375rem)]',
  'border border-[var(--tiger-border,#d1d5db)] outline-none',
  'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
)

export const colorPickerSvThumbClasses = classNames(
  'pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full',
  'border-2 border-white shadow-[var(--tiger-shadow-sm,0_1px_2px_rgb(0_0_0_/_0.35))]'
)

export const colorPickerPreviewClasses = classNames(
  'h-8 w-8 shrink-0 overflow-hidden rounded-[var(--tiger-radius-sm,0.375rem)]',
  'border border-[var(--tiger-border,#d1d5db)]'
)

export const colorPickerClearButtonClasses = classNames(
  'text-xs text-[var(--tiger-primary,#2563eb)] hover:underline',
  'rounded-sm outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
)

export const colorPickerChromeLabelClasses =
  'block text-xs text-[var(--tiger-text-muted,#6b7280)] mb-1'

export const DEFAULT_COLOR_PICKER_HSVA: HsvaColor = { h: 0, s: 100, v: 100, a: 1 }

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

export function isColorPickerEmpty(value: string | undefined | null): boolean {
  return value == null || value.trim() === ''
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

export function seedColorPickerHsva(value: string | undefined | null): HsvaColor {
  return parseColorToHsva(value) ?? { ...DEFAULT_COLOR_PICKER_HSVA }
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
