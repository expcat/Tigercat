/**
 * QRCode status
 */
import type { TigerLocale } from './locale'

export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned'

export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H'

/**
 * Shared QRCode props (framework-agnostic).
 * Encodes `value` as a scannable QR (byte mode, ECC M).
 */
export interface QRCodeProps {
  /** Text / URL to encode into a scannable QR */
  value: string
  /**
   * Size in pixels, including the quiet zone
   * @default 128
   */
  size?: number
  /**
   * Foreground (module) color. Defaults to `--tiger-text`.
   * Hex pairs with `bgColor` that fall under 3:1 contrast warn in development.
   */
  color?: string
  /**
   * Background color. Defaults to `--tiger-surface`.
   */
  bgColor?: string
  /**
   * Overlay status. `expired` shows a refresh control when a handler is passed.
   * `scanned` names the code as already scanned.
   * @default 'active'
   */
  status?: QRCodeStatus

  /**
   * Reed–Solomon level passed to the existing encoder.
   * @default 'M'
   */
  errorLevel?: QRCodeErrorLevel

  /**
   * Center icon as SVG path data. A framework slot/node paints a component instead.
   * The matrix itself is not cleared.
   */
  icon?: string
  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>
  /** Custom class name */
  className?: string
}
