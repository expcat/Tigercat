import { classNames } from './class-names'
import { encodeQRMatrix, QR_QUIET_ZONE } from './qrcode-encoder'

export {
  encodeQRMatrix,
  decodeQRMatrixBytes,
  QR_QUIET_ZONE,
  qrChooseVersion
} from './qrcode-encoder'
export type { QREccLevel } from './qrcode-encoder'

export const qrcodeContainerClasses = classNames(
  'relative inline-flex items-center justify-center overflow-hidden',
  'rounded-[var(--tiger-radius-md,0.5rem)]'
)

export const qrcodeOverlayClasses = classNames(
  'absolute inset-0 flex flex-col items-center justify-center gap-1',
  'bg-[color-mix(in_srgb,var(--tiger-surface,#ffffff)_80%,transparent)]'
)

export const qrcodeStatusTextClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'

export const qrcodeRefreshClasses = classNames(
  'text-sm underline-offset-2 hover:underline',
  'text-[var(--tiger-primary,#2563eb)]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40',
  'rounded-[var(--tiger-radius-sm,0.25rem)]'
)

export const QRCODE_DEFAULT_COLOR = 'var(--tiger-text,#111827)'
export const QRCODE_DEFAULT_BG = 'var(--tiger-surface,#ffffff)'

/**
 * Encode `value` as a scannable QR module matrix (no quiet zone).
 * Dark modules are `true`. Size depends on the payload (version 1 is 21).
 */
export function generateQRMatrix(value: string): boolean[][] {
  return encodeQRMatrix(value ?? '')
}

const HEX = /^#([\da-f]{3}|[\da-f]{6})$/i

function hexToRgb(color: string): [number, number, number] | null {
  const match = HEX.exec(color.trim())
  if (!match) return null
  let hex = match[1]
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((ch) => ch + ch)
      .join('')
  const n = parseInt(hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

/** WCAG contrast for two hex colors. `null` when a color is not parseable hex. */
export function qrColorContrast(foreground: string, background: string): number | null {
  const a = hexToRgb(foreground)
  const b = hexToRgb(background)
  if (!a || !b) return null
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

export function qrNeedsContrastWarning(foreground: string, background: string): boolean {
  const ratio = qrColorContrast(foreground, background)
  return ratio !== null && ratio < 3
}

export function qrViewBoxSize(moduleCount: number): number {
  return moduleCount + QR_QUIET_ZONE * 2
}
