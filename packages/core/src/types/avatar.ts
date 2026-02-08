/**
 * Avatar component types and interfaces
 */

/**
 * Avatar size types
 */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Avatar shape types
 */
export type AvatarShape = 'circle' | 'square'

/**
 * Base avatar props interface
 */
export interface AvatarProps {
  /**
   * Avatar size
   * @default 'md'
   */
  size?: AvatarSize

  /**
   * Avatar shape
   * @default 'circle'
   */
  shape?: AvatarShape

  /**
   * Image source URL
   */
  src?: string

  /**
   * Alternative text for image
   */
  alt?: string

  /**
   * Text content to display (e.g., initials)
   * Used when src is not provided or fails to load
   */
  text?: string

  /**
   * Background color for text/icon avatars
   * Uses Tailwind color classes or CSS color value
   * @example 'bg-blue-500' | '#3b82f6'
   */
  bgColor?: string

  /**
   * Text color for text/icon avatars
   * Uses Tailwind color classes or CSS color value
   * @example 'text-white' | '#ffffff'
   */
  textColor?: string

  /**
   * Additional CSS classes
   */
  className?: string
}
