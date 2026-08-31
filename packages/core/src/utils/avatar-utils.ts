/**
 * Avatar component utilities
 * Shared styles and helpers for Avatar components
 */

import type { AvatarShape, AvatarSize } from '../types/avatar'
import { mixStatusTowardTextClass } from './status-mix'

/**
 * Base classes for all avatar variants
 */
export const avatarBaseClasses =
  'inline-flex items-center justify-center overflow-hidden shrink-0 select-none'

/**
 * Size classes for avatar
 */
export const avatarSizeClasses: Record<AvatarSize, string> = {
  sm: 'w-[var(--tiger-component-avatar-size-sm,32px)] h-[var(--tiger-component-avatar-size-sm,32px)] text-[length:var(--tiger-component-avatar-font-size-sm,12px)]',
  md: 'w-[var(--tiger-component-avatar-size-md,40px)] h-[var(--tiger-component-avatar-size-md,40px)] text-[length:var(--tiger-component-avatar-font-size-md,14px)]',
  lg: 'w-[var(--tiger-component-avatar-size-lg,48px)] h-[var(--tiger-component-avatar-size-lg,48px)] text-[length:var(--tiger-component-avatar-font-size-lg,16px)]',
  xl: 'w-[var(--tiger-component-avatar-size-xl,64px)] h-[var(--tiger-component-avatar-size-xl,64px)] text-[length:var(--tiger-component-avatar-font-size-lg,16px)]'
}

/**
 * Shape classes for avatar
 *
 * - `circle` / `square` keep the original visual (token-driven so the modern
 *   theme can soften the square corners).
 * - `squircle` is a modern iOS-style intermediate shape (PR-19a).
 */
export const avatarShapeClasses: Record<AvatarShape, string> = {
  circle: 'rounded-[var(--tiger-component-avatar-border-radius,9999px)]',
  square: 'rounded-[var(--tiger-radius-md,0.5rem)]',
  squircle: 'rounded-[30%]'
}

/**
 * Default background color for avatar
 */
export const avatarDefaultBgColor = 'bg-[var(--tiger-surface-muted,#f9fafb)]'

/**
 * Default text color for avatar
 */
export const avatarDefaultTextColor = 'text-[var(--tiger-text-secondary,#6b7280)]'

/**
 * Image classes for avatar with image
 */
export const avatarImageClasses = 'w-full h-full object-cover'

const CJK_OR_KANA = /[\u3400-\u9FFF\uF900-\uFAFF\u3040-\u30FF]/

/**
 * Get initials from a name or short token.
 *
 * - Two or fewer characters: kept as-is (uppercased), so `TC` and `张三` stay.
 * - CJK / kana tokens without spaces: first two characters (`司马懿` → `司马`).
 * - Latin (including diacritics): first letter of the first word, or first
 *   letters of the first two words.
 */
export function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''

  const words = trimmed.split(/\s+/).filter(Boolean)

  if (words.length === 1) {
    const firstWord = words[0]
    if (firstWord.length <= 2) {
      return firstWord.toUpperCase()
    }
    if (CJK_OR_KANA.test(firstWord)) {
      return firstWord.slice(0, 2).toUpperCase()
    }
    return firstWord.charAt(0).toUpperCase()
  }

  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

const AVATAR_PALETTE = [
  ['--tiger-primary', '#2563eb'],
  ['--tiger-success', '#16a34a'],
  ['--tiger-warning', '#d97706'],
  ['--tiger-error', '#dc2626'],
  ['--tiger-info', '#3b82f6'],
  ['--tiger-chart-4', '#a855f7'],
  ['--tiger-chart-5', '#0ea5e9'],
  ['--tiger-secondary', '#4b5563']
] as const

export const avatarGeneratedTextColor = 'text-[var(--tiger-primary-foreground,#ffffff)]'

/**
 * Generate a background color from a string (same name → same color).
 * Uses canonical semantic fills mixed toward `--tiger-text` for AA.
 */
export function generateAvatarColor(str: string): string {
  if (!str) {
    return avatarDefaultBgColor
  }

  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }

  const [cssVar, fallback] = AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
  return mixStatusTowardTextClass('bg', cssVar, fallback)
}

export function isCssPaintValue(value: string): boolean {
  const trimmed = value.trim()
  return /^(#|rgb\(|rgba\(|hsl\(|hsla\(|var\()/i.test(trimmed)
}

export function resolveAvatarPaint(
  value: string | undefined,
  kind: 'bg' | 'text',
  fallbackClass: string
): { className?: string; style?: Record<string, string> } {
  if (!value) return { className: fallbackClass }
  if (isCssPaintValue(value)) {
    return {
      style: { [kind === 'bg' ? 'backgroundColor' : 'color']: value.trim() }
    }
  }
  return { className: value }
}

export function resolveAvatarName(input: {
  alt?: string
  text?: string
  ariaLabel?: unknown
  ariaLabelledby?: unknown
  ariaHidden?: unknown
}): { computedLabel?: string; isDecorative: boolean } {
  const ariaLabel =
    typeof input.ariaLabel === 'string' && input.ariaLabel.trim()
      ? input.ariaLabel.trim()
      : undefined
  const ariaLabelledby =
    typeof input.ariaLabelledby === 'string' && input.ariaLabelledby.trim()
      ? input.ariaLabelledby.trim()
      : undefined
  const alt = input.alt?.trim() ? input.alt.trim() : undefined
  const text = input.text?.trim() ? input.text.trim() : undefined
  const computedLabel = ariaLabel ?? alt ?? text
  const isDecorative =
    input.ariaHidden === true || input.ariaHidden === '' || (!computedLabel && !ariaLabelledby)
  return { computedLabel, isDecorative }
}

export const AVATAR_IMAGE_PROP_KEYS = [
  'srcSet',
  'srcset',
  'sizes',
  'crossOrigin',
  'crossorigin',
  'referrerPolicy',
  'referrerpolicy',
  'decoding',
  'fetchPriority',
  'fetchpriority',
  'onLoad',
  'onload',
  'onError',
  'onerror'
] as const

export type AvatarImageProps = {
  srcSet?: string
  sizes?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  referrerPolicy?: string
  decoding?: 'async' | 'auto' | 'sync'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export function pickAvatarImageAttrs(attrs: Record<string, unknown>): {
  image: Record<string, unknown>
  rest: Record<string, unknown>
} {
  const image: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if ((AVATAR_IMAGE_PROP_KEYS as readonly string[]).includes(key)) {
      if (key === 'srcset') image.srcSet = value
      else if (key === 'crossorigin') image.crossOrigin = value
      else if (key === 'referrerpolicy') image.referrerPolicy = value
      else if (key === 'fetchpriority') image.fetchPriority = value
      else if (key === 'onload') image.onLoad = value
      else if (key === 'onerror') image.onError = value
      else image[key] = value
    } else {
      rest[key] = value
    }
  }
  return { image, rest }
}

/**
 * AvatarGroup shared classes
 */
export const avatarGroupBaseClasses = 'inline-flex items-center'

export const avatarGroupItemClasses = '-ms-2 first:ms-0 ring-2 ring-[var(--tiger-surface,#ffffff)]'

export const avatarGroupOverflowBaseClasses =
  'ring-2 ring-[var(--tiger-surface,#ffffff)] inline-flex items-center justify-center shrink-0 font-medium bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text-secondary,#6b7280)]'
