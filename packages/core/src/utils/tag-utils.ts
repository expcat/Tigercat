/**
 * Tag component utilities
 * Shared styles and helpers for Tag components
 */

import { closeIconPathD } from './common-icons'

/**
 * Base classes for all tag variants
 *
 * Radius is token-driven (PR-19a). Defaults to `0.375rem` so the visual
 * matches the previous `rounded-lg`-via-`--tiger-radius-md` look at small
 * sizes; users on the modern theme inherit the rounder modern radii.
 */
export const tagBaseClasses =
  'inline-flex items-center gap-1 rounded-[var(--tiger-radius-sm,0.375rem)] border font-medium transition-colors'

/**
 * Pill-shape modifier (opt-in). Apply when callers want a fully rounded
 * tag (e.g. status chips). Composes with {@link tagBaseClasses}.
 * @since 1.1.0
 */
export const tagPillClasses = 'rounded-[var(--tiger-radius-pill,9999px)]'

/**
 * Size classes for tag variants
 */
export const tagSizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
} as const

/**
 * Close button base classes
 */
export const tagCloseButtonBaseClasses =
  'inline-flex items-center justify-center rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[var(--tiger-primary,#2563eb)]/40'

/**
 * Close icon SVG path data
 */
export const tagCloseIconPath = closeIconPathD
