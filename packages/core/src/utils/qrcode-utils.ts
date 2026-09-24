import { parseColorParts } from './color-picker-utils'
import { classNames } from './class-names'
import { isBrowser } from './env'
import { encodeQRMatrix, QR_QUIET_ZONE } from './qrcode-encoder'
import { defaultTheme } from '../themes/default/theme'
import { resolvePresetThemeConfig, themeConfigToCssVars } from '../themes/manager'

export {
  encodeQRMatrix,
  decodeQRMatrixBytes,
  QR_QUIET_ZONE,
  qrChooseVersion
} from './qrcode-encoder'
export type { QREccLevel } from './qrcode-encoder'

export const qrcodeContainerClasses = classNames(
  'relative inline-flex items-center justify-center overflow-hidden',
  'rounded-[var(--tiger-radius-md)]'
)

export const qrcodeOverlayClasses = classNames(
  'absolute inset-0 flex flex-col items-center justify-center gap-1',
  'bg-[color-mix(in_srgb,var(--tiger-surface)_80%,transparent)]'
)

export const qrcodeStatusTextClasses = 'text-sm text-[var(--tiger-text-secondary)]'

export const qrcodeRefreshClasses = classNames(
  'text-sm underline-offset-2 hover:underline',
  'text-[var(--tiger-primary)]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'focus-visible:ring-[var(--tiger-focus-ring)]/40',
  'rounded-[var(--tiger-radius-sm)]'
)

export const QRCODE_DEFAULT_COLOR = 'var(--tiger-text)'
export const QRCODE_DEFAULT_BG = 'var(--tiger-surface)'

/**
 * Encode `value` as a scannable QR module matrix (no quiet zone).
 * Dark modules are `true`. Size depends on the payload (version 1 is 21).
 * Empty and over-capacity payloads throw; components use {@link resolveQRMatrix}.
 */
export function generateQRMatrix(value: string): boolean[][] {
  return encodeQRMatrix(value ?? '')
}

export type QRMatrixFailure = 'empty' | 'capacity'

export type QRMatrixResult =
  | { ok: true; matrix: boolean[][] }
  | { ok: false; reason: QRMatrixFailure }

/**
 * Component-facing encode. Empty and over-capacity values are a failure
 * state. This never throws.
 */
export function resolveQRMatrix(value: string | null | undefined): QRMatrixResult {
  if (value == null || value.length === 0) return { ok: false, reason: 'empty' }
  try {
    const matrix = encodeQRMatrix(value)
    if (!matrix.length) return { ok: false, reason: 'capacity' }
    return { ok: true, matrix }
  } catch {
    return { ok: false, reason: 'capacity' }
  }
}

/** One SVG path for every dark module, including the quiet zone. */
export function qrDarkModulesPath(matrix: boolean[][], quietZone = QR_QUIET_ZONE): string {
  let path = ''
  for (let row = 0; row < matrix.length; row++) {
    const cells = matrix[row]
    for (let col = 0; col < cells.length; col++) {
      if (!cells[col]) continue
      const x = col + quietZone
      const y = row + quietZone
      path += `M${x} ${y}h1v1H${x}z`
    }
  }
  return path
}

const VAR_COLOR = /^var\(\s*(--[A-Za-z0-9-]+)\s*(?:,\s*([^)]+))?\)$/

const themePaintCache = new Map<'light' | 'dark', Record<string, string>>()

function themePaint(scheme: 'light' | 'dark'): Record<string, string> {
  const cached = themePaintCache.get(scheme)
  if (cached) return cached
  const vars = themeConfigToCssVars(resolvePresetThemeConfig(defaultTheme, scheme))
  themePaintCache.set(scheme, vars)
  return vars
}

function readComputedToken(name: string): string {
  if (!isBrowser()) return ''
  const view = document.defaultView
  if (!view || typeof view.getComputedStyle !== 'function') return ''
  return view.getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function paintChannels(
  color: string,
  scheme: 'light' | 'dark',
  depth = 0
): [number, number, number] | null {
  const value = color.trim()
  if (!value || depth > 4) return null
  const parsed = parseColorParts(value)
  if (parsed) return [parsed.r, parsed.g, parsed.b]
  const variable = VAR_COLOR.exec(value)
  if (!variable) return null
  const token = variable[1]
  const fromTheme = themePaint(scheme)[token]
  if (fromTheme) return paintChannels(fromTheme, scheme, depth + 1)
  const computed = readComputedToken(token)
  if (computed) return paintChannels(computed, scheme, depth + 1)
  const fallback = variable[2]?.trim()
  if (fallback) return paintChannels(fallback, scheme, depth + 1)
  return null
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

/**
 * WCAG contrast for the colors that will actually be painted.
 * CSS variables resolve through the theme (and computed style when present).
 * `null` only when a color still cannot be resolved.
 */
export function qrColorContrast(
  foreground: string,
  background: string,
  scheme: 'light' | 'dark' = 'light'
): number | null {
  const a = paintChannels(foreground, scheme)
  const b = paintChannels(background, scheme)
  if (!a || !b) return null
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * True when contrast is under 3:1, or when a color (including a CSS variable)
 * cannot be resolved. Unresolved variables do not skip the check.
 */
export function qrNeedsContrastWarning(
  foreground: string,
  background: string,
  scheme: 'light' | 'dark' = 'light'
): boolean {
  const ratio = qrColorContrast(foreground, background, scheme)
  return ratio === null || ratio < 3
}

export function qrViewBoxSize(moduleCount: number): number {
  return moduleCount + QR_QUIET_ZONE * 2
}
