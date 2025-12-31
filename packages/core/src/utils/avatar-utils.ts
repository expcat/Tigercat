/**
 * Avatar component utilities
 * Shared styles and helpers for Avatar components
 */

import type { AvatarSize, AvatarShape } from '../types/avatar'

/**
 * Base classes for all avatar variants
 */
export const avatarBaseClasses = 'inline-flex items-center justify-center overflow-hidden shrink-0 select-none'

/**
 * Size classes for avatar
 */
export const avatarSizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
} as const

/**
 * Shape classes for avatar
 */
export const avatarShapeClasses: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-md',
} as const

/**
 * Default background color for avatar
 */
export const avatarDefaultBgColor = 'bg-gray-200'

/**
 * Default text color for avatar
 */
export const avatarDefaultTextColor = 'text-gray-600'

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
  if (!name || typeof name !== 'string') {
    return ''
  }
  
  const trimmed = name.trim()
  if (!trimmed) {
    return ''
  }
  
  // Split by spaces
  const words = trimmed.split(/\s+/).filter(word => word.length > 0)
  
  if (words.length === 0) {
    return ''
  }
  
  if (words.length === 1) {
    // Single word: take first character or first 2 characters for non-ASCII
    const firstWord = words[0]
    // Check if it contains non-ASCII characters (e.g., Chinese characters)
    // eslint-disable-next-line no-control-regex
    const hasNonASCII = /[^\u0000-\u007F]/.test(firstWord)
    if (hasNonASCII) {
      // For non-ASCII, take first 2 characters
      return firstWord.substring(0, 2).toUpperCase()
    }
    // For ASCII, take first character
    return firstWord.charAt(0).toUpperCase()
  }
  
  // Multiple words: take first character of first two words
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
  
  // Define a set of pleasant colors for avatars
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
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
