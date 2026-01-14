/**
 * Avatar component utilities
 * Shared styles and helpers for Avatar components
 */

import type { AvatarSize, AvatarShape } from '../types/avatar'

/**
 * Base classes for all avatar variants
 */
export const avatarBaseClasses =
  'inline-flex items-center justify-center overflow-hidden shrink-0 select-none'

/**
 * Size classes for avatar
 */
export const avatarSizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg'
} as const

/**
 * Shape classes for avatar
 */
export const avatarShapeClasses: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-md'
} as const

/**
 * Default background color for avatar
 */
export const avatarDefaultBgColor = 'bg-[var(--tiger-avatar-bg,#e5e7eb)]'

/**
 * Default text color for avatar
 */
export const avatarDefaultTextColor =
  'text-[var(--tiger-avatar-text,var(--tiger-text-muted,#6b7280))]'

/**
 * Image classes for avatar with image
 */
export const avatarImageClasses = 'w-full h-full object-cover'

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 * @example
 * getInitials('John Doe') // 'JD'
 * getInitials('Alice') // 'A'
 * getInitials('张三') // '张三'
 */
export function getInitials(name: string): string {
  const trimmed = typeof name === 'string' ? name.trim() : ''
  if (!trimmed) return ''

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''

  if (words.length === 1) {
    const firstWord = words[0]
    const hasNonASCII = /[^\u0000-\u007F]/.test(firstWord)
    return hasNonASCII ? firstWord.slice(0, 2).toUpperCase() : firstWord.charAt(0).toUpperCase()
  }

  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

/**
 * Generate a background color from a string (for consistent colors)
 * @param str - Input string (e.g., name)
 * @returns Tailwind CSS background color class
 */
export function generateAvatarColor(str: string): string {
  if (!str) {
    return avatarDefaultBgColor
  }

  // Define a set of pleasant colors for avatars (theme-overridable)
  const colors = [
    'bg-[var(--tiger-avatar-color-1,#3b82f6)]',
    'bg-[var(--tiger-avatar-color-2,#22c55e)]',
    'bg-[var(--tiger-avatar-color-3,#eab308)]',
    'bg-[var(--tiger-avatar-color-4,#ef4444)]',
    'bg-[var(--tiger-avatar-color-5,#a855f7)]',
    'bg-[var(--tiger-avatar-color-6,#ec4899)]',
    'bg-[var(--tiger-avatar-color-7,#6366f1)]',
    'bg-[var(--tiger-avatar-color-8,#14b8a6)]',
    'bg-[var(--tiger-avatar-color-9,#f97316)]',
    'bg-[var(--tiger-avatar-color-10,#06b6d4)]'
  ]

  // Simple hash function to get consistent color for same string
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
