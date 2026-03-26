/**
 * QRCode error correction level
 */
export type QRCodeLevel = 'L' | 'M' | 'Q' | 'H'

/**
 * QRCode status
 */
export type QRCodeStatus = 'active' | 'expired' | 'loading'

/**
 * Shared QRCode props (framework-agnostic)
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
  /** Error correction level */
  level?: QRCodeLevel
  /** Status */
  status?: QRCodeStatus
  /** Custom class name */
  className?: string
}
