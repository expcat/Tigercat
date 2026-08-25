/**
 * QRCode status
 */
export type QRCodeStatus = 'active' | 'expired' | 'loading'

/**
 * Shared QRCode props (framework-agnostic).
 * Renders a decorative hash matrix, not a scannable QR.
 */
export interface QRCodeProps {
  /** Text / URL to encode */
  value: string
  /** Size in pixels */
  size?: number
  /** Foreground color */
  color?: string
  /** Background color */
  bgColor?: string
  /** Status */
  status?: QRCodeStatus
  /** Custom class name */
  className?: string
}
