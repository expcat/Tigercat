/**
 * QRCode status
 */
import type { TigerLocale } from './locale'

export type QRCodeStatus = 'active' | 'expired' | 'loading'

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
   * @default 'active'
   */
  status?: QRCodeStatus
  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>
  /** Custom class name */
  className?: string
}
