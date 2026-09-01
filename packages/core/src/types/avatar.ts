/**
 * Avatar component types and interfaces
 */

import type { ReferrerPolicyAttr } from './base'

/**
 * Avatar size types
 */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Avatar shape types
 */
export type AvatarShape = 'circle' | 'square' | 'squircle'

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
   * Alternative text for the image. When omitted, `text` or `aria-label` is
   * used as the accessible name. With no name the avatar is decorative.
   */
  alt?: string

  /**
   * Text content to display (e.g., initials) when src is missing or fails.
   * Also used as the accessible name when `alt` / `aria-label` are omitted.
   */
  text?: string

  /**
   * Background for text/icon avatars. Tailwind class, or a CSS color
   * (`#rgb` / `rgb()` / `var()`) applied as `background-color`.
   * When omitted and `text` is set, `generateAvatarColor` picks a stable
   * color for that name.
   * @example 'bg-blue-500' | '#3b82f6'
   */
  bgColor?: string

  /**
   * Text color for text/icon avatars. Tailwind class, or a CSS color applied
   * as `color`.
   * @example 'text-white' | '#ffffff'
   */
  textColor?: string

  srcSet?: string
  sizes?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  referrerPolicy?: ReferrerPolicyAttr
  decoding?: 'async' | 'auto' | 'sync'
  fetchPriority?: 'high' | 'low' | 'auto'

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * AvatarGroup props interface
 */
export interface AvatarGroupProps {
  /**
   * Maximum number of **avatars** to show. Overflow is an extra slot, so
   * `max={3}` with 5 children renders 3 avatars plus `+2`. `max={0}` shows
   * only the overflow count.
   */
  max?: number

  /**
   * Size applied to avatars that did not set their own size
   * @default 'md'
   */
  size?: AvatarSize

  /**
   * Shape applied to avatars that did not set their own shape, and to overflow
   * @default 'circle'
   */
  shape?: AvatarShape

  /**
   * Additional CSS classes
   */
  className?: string
}
