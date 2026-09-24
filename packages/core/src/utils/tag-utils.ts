/**
 * Tag component utilities
 * Shared styles and helpers for Tag components
 */

import { closeIconPathD } from './icons/common'

/**
 * Base classes for all tag variants
 *
 * Radius is token-driven (PR-19a). Defaults to `0.375rem` so the visual
 * matches the previous `rounded-lg`-via-`--tiger-radius-md` look at small
 * sizes; users on the modern theme inherit the rounder modern radii.
 */
export const tagBaseClasses =
  'inline-flex items-center gap-1 rounded-[var(--tiger-component-tag-border-radius)] border font-medium transition-colors'

/**
 * Pill-shape modifier (opt-in). Apply when callers want a fully rounded
 * tag (e.g. status chips). Composes with {@link tagBaseClasses}.
 * @since 1.1.0
 */
export const tagPillClasses = 'rounded-[var(--tiger-radius-full)]'

/**
 * Size classes for tag variants
 */
export const tagSizeClasses = {
  sm: 'h-[var(--tiger-component-tag-height-sm,22px)] px-[var(--tiger-component-tag-padding-x-sm,6px)] text-[length:var(--tiger-component-tag-font-size-sm,12px)]',
  md: 'h-[var(--tiger-component-tag-height-md,26px)] px-[var(--tiger-component-tag-padding-x-md,8px)] text-[length:var(--tiger-component-tag-font-size-md,14px)]',
  lg: 'h-[var(--tiger-component-tag-height-lg,32px)] px-[var(--tiger-component-tag-padding-x-lg,10px)] text-[length:var(--tiger-component-tag-font-size-lg,16px)]'
} as const

/** Close name includes the tag text. `{label}` is replaced; otherwise the text is appended. */
export function formatTagCloseName(template: string, label: string): string {
  const text = label.trim()
  if (template.includes('{label}')) {
    return text ? template.replaceAll('{label}', text) : template.replaceAll('{label}', '').replace(/\s+/g, ' ').trim()
  }
  return text ? `${template} ${text}` : template
}

/**
 * Close button base classes
 */
export const tagCloseButtonBaseClasses =
  'inline-flex items-center justify-center rounded-full p-0.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--tiger-primary)]'

/**
 * Close icon SVG path data
 */
export const tagCloseIconPath = closeIconPathD
