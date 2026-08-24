/**
 * Kbd utility functions
 *
 * Combo formatting and class builders shared by the Vue and React Kbd
 * implementations. Helpers are string-only so they stay safe to evaluate
 * during server-side rendering.
 */

import { getTagVariantClasses } from '../theme-runtime/colors'
import {
  DEFAULT_KBD_SEPARATOR,
  DEFAULT_KBD_SIZE,
  DEFAULT_KBD_VARIANT,
  type KbdKeys,
  type KbdSize,
  type KbdVariant
} from '../types/kbd'
import { classNames } from './class-names'
import { tagSizeClasses } from './tag-utils'

/** Segment of a rendered key combo */
export type KbdPart = { type: 'key'; value: string } | { type: 'separator'; value: string }

/**
 * Root kbd chrome. Mirrors Tag's inline badge layout (radius token, border,
 * medium weight) with Code-like monospace and no flex gap — separators
 * carry the spacing so combo text stays readable.
 */
export const kbdBaseClasses =
  'tiger-kbd inline-flex items-center rounded-[var(--tiger-radius-sm,0.375rem)] border font-medium font-mono align-middle whitespace-nowrap transition-colors'

/** Nested key reset so inner `kbd` elements do not pick up UA chrome */
export const kbdKeyClasses = 'tiger-kbd-key border-0 bg-transparent p-0 shadow-none rounded-none'

/** Visible combo separator */
export const kbdSeparatorClasses = 'tiger-kbd-separator'

/** Quieter chrome for the subtle variant */
export const kbdSubtleVariantClasses =
  'border-transparent bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text-muted,#6b7280)]'

/**
 * Normalize `keys` into trimmed, non-empty key labels.
 *
 * A string is treated as a single key. Non-string array entries are ignored.
 */
export function normalizeKbdKeys(keys?: KbdKeys | null): string[] {
  if (keys == null) return []

  if (typeof keys === 'string') {
    const trimmed = keys.trim()
    return trimmed ? [trimmed] : []
  }

  if (!Array.isArray(keys)) return []

  const result: string[] = []
  for (const key of keys) {
    if (typeof key !== 'string') continue
    const trimmed = key.trim()
    if (trimmed) result.push(trimmed)
  }
  return result
}

/**
 * Resolve the combo separator. Empty or whitespace-only values fall back
 * to {@link DEFAULT_KBD_SEPARATOR}.
 */
export function resolveKbdSeparator(separator?: string): string {
  if (typeof separator === 'string') {
    const trimmed = separator.trim()
    if (trimmed) return trimmed
  }
  return DEFAULT_KBD_SEPARATOR
}

/**
 * Resolve size, falling back to {@link DEFAULT_KBD_SIZE}.
 */
export function resolveKbdSize(size?: KbdSize): KbdSize {
  if (size === 'sm' || size === 'md' || size === 'lg') return size
  return DEFAULT_KBD_SIZE
}

/**
 * Resolve variant, falling back to {@link DEFAULT_KBD_VARIANT}.
 */
export function resolveKbdVariant(variant?: KbdVariant): KbdVariant {
  if (variant === 'default' || variant === 'subtle') return variant
  return DEFAULT_KBD_VARIANT
}

/**
 * Build alternating key / separator parts for a combo.
 */
export function getKbdParts(keys?: KbdKeys | null, separator?: string): KbdPart[] {
  const normalized = normalizeKbdKeys(keys)
  const resolvedSeparator = resolveKbdSeparator(separator)
  const parts: KbdPart[] = []

  for (let index = 0; index < normalized.length; index++) {
    if (index > 0) {
      parts.push({ type: 'separator', value: resolvedSeparator })
    }
    parts.push({ type: 'key', value: normalized[index] })
  }

  return parts
}

/**
 * Join keys into a readable combo string such as `Ctrl + K`.
 */
export function formatKbdCombo(keys?: KbdKeys | null, separator?: string): string {
  const normalized = normalizeKbdKeys(keys)
  if (normalized.length === 0) return ''
  return normalized.join(` ${resolveKbdSeparator(separator)} `)
}

/**
 * Variant classes. `default` reuses Tag default chrome.
 */
export function getKbdVariantClasses(variant?: KbdVariant): string {
  if (resolveKbdVariant(variant) === 'subtle') return kbdSubtleVariantClasses
  return getTagVariantClasses('default')
}

/**
 * Classes for the root semantic `kbd` element.
 */
export function getKbdRootClasses(
  input: {
    size?: KbdSize
    variant?: KbdVariant
    className?: string
  } = {}
): string {
  const size = resolveKbdSize(input.size)
  return classNames(
    kbdBaseClasses,
    tagSizeClasses[size],
    getKbdVariantClasses(input.variant),
    input.className
  )
}

/**
 * Visible text for a combo separator, including surrounding spaces.
 */
export function formatKbdSeparatorText(separator?: string): string {
  return ` ${resolveKbdSeparator(separator)} `
}
