import type { InputStatus } from './input'
import type { TigerLocale, TigerLocaleSignature } from './locale'

export type SignatureExportType = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/svg+xml'

export interface SignaturePoint {
  x: number
  y: number
}

export interface SignatureStroke {
  points: SignaturePoint[]
  color: string
  lineWidth: number
}

/**
 * Change payload. `value` is the form/controlled string: an SVG data URL, or
 * `''` when empty. Raster bytes are produced by `toDataURL()`, not stored here.
 */
export interface SignatureChangePayload {
  value: string
  empty: boolean
  strokes: SignatureStroke[]
  exportType: SignatureExportType
}

/**
 * Shared Signature props. React adds `value`/`onChange`; Vue binds
 * `modelValue` / `update:modelValue`.
 *
 * The controlled value is an **SVG data URL or `''`**. Raster data URLs cannot
 * round-trip strokes — use `toDataURL()` for PNG/JPEG/WebP.
 */
export interface SignatureProps {
  /**
   * Controlled value. SVG data URL or `''`. `undefined` is uncontrolled.
   */
  value?: string
  /**
   * Initial SVG data URL for uncontrolled mode.
   */
  defaultValue?: string
  /**
   * Logical canvas width in CSS pixels. Omit to follow the container (100%).
   */
  width?: number
  /**
   * Logical canvas height in CSS pixels.
   * @default 180
   */
  height?: number
  /**
   * Stroke color. Defaults to `--tiger-text` (resolved from computed styles).
   */
  penColor?: string
  backgroundColor?: string
  /**
   * @default 2
   */
  lineWidth?: number
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Focusable, not drawable. Distinct from `disabled`.
   * @default false
   */
  readonly?: boolean
  /**
   * @default true
   */
  clearable?: boolean
  /**
   * Format for `toDataURL()`. The controlled `value` is always SVG.
   * @default 'image/png'
   */
  exportType?: SignatureExportType
  /**
   * @default 0.92
   */
  quality?: number
  ariaLabel?: string
  clearText?: string
  undoText?: string
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleSignature>
  name?: string
  id?: string
  status?: InputStatus
  className?: string
  onChange?: (value: string, payload: SignatureChangePayload) => void
}
