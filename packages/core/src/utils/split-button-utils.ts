/**
 * SplitButton utility functions
 *
 * Class builders and label helpers shared by the Vue and React SplitButton
 * implementations. Helpers are string-only so they stay safe to evaluate
 * during server-side rendering.
 */

import {
  DEFAULT_SPLIT_BUTTON_SIZE,
  DEFAULT_SPLIT_BUTTON_TRIGGER_ARIA_LABEL,
  DEFAULT_SPLIT_BUTTON_VARIANT
} from '../types/split-button'
import type { ButtonSize, ButtonVariant } from '../types/button'
import { classNames } from './class-names'

/** Root group wrapping the primary action and the menu trigger */
export const splitButtonRootClasses = 'tiger-split-button inline-flex items-stretch'

/** Stretch the group to the parent width */
export const splitButtonRootBlockClasses = 'w-full'

/**
 * Join the primary button to the trigger. `!` wins over Button's token radius
 * so the seam stays square regardless of generated CSS order.
 */
export const splitButtonPrimaryClasses = '!rounded-e-none'

/** Let the primary action fill remaining width in block layout */
export const splitButtonPrimaryBlockClasses = 'min-w-0 flex-1'

/**
 * Join the chevron trigger to the primary button and keep it from shrinking
 * when the group is stretched.
 */
export const splitButtonTriggerClasses =
  'tiger-split-button-trigger shrink-0 h-full !rounded-s-none -ms-px'

/** Stretch the Dropdown root to the primary action height in the group */
export const splitButtonDropdownClasses = 'self-stretch'

/** Compact horizontal padding so the chevron trigger stays square-ish */
export const splitButtonTriggerSizeClasses: Record<ButtonSize, string> = {
  xs: '!px-1.5',
  sm: '!px-2',
  md: '!px-2.5',
  lg: '!px-3',
  xl: '!px-4'
}

const BUTTON_SIZES = new Set<ButtonSize>(['xs', 'sm', 'md', 'lg', 'xl'])
const BUTTON_VARIANTS = new Set<ButtonVariant>(['primary', 'secondary', 'outline', 'ghost', 'link'])

/**
 * Resolve size, falling back to {@link DEFAULT_SPLIT_BUTTON_SIZE}.
 */
export function resolveSplitButtonSize(size?: ButtonSize): ButtonSize {
  if (size && BUTTON_SIZES.has(size)) return size
  return DEFAULT_SPLIT_BUTTON_SIZE
}

/**
 * Resolve variant, falling back to {@link DEFAULT_SPLIT_BUTTON_VARIANT}.
 */
export function resolveSplitButtonVariant(variant?: ButtonVariant): ButtonVariant {
  if (variant && BUTTON_VARIANTS.has(variant)) return variant
  return DEFAULT_SPLIT_BUTTON_VARIANT
}

/**
 * Resolve the accessible name for the chevron trigger.
 * Empty or whitespace-only values fall back to `fallback` (locale) or the
 * English default.
 */
export function resolveSplitButtonTriggerAriaLabel(
  label?: string,
  fallback: string = DEFAULT_SPLIT_BUTTON_TRIGGER_ARIA_LABEL
): string {
  if (typeof label === 'string') {
    const trimmed = label.trim()
    if (trimmed) return trimmed
  }
  return fallback
}

/**
 * Classes for the root group element.
 */
export function getSplitButtonRootClasses(
  input: {
    block?: boolean
    className?: string
  } = {}
): string {
  return classNames(
    splitButtonRootClasses,
    input.block && splitButtonRootBlockClasses,
    input.className
  )
}

/**
 * Classes merged onto the primary action Button.
 */
export function getSplitButtonPrimaryClasses(
  input: {
    block?: boolean
    className?: string
  } = {}
): string {
  return classNames(
    splitButtonPrimaryClasses,
    input.block && splitButtonPrimaryBlockClasses,
    input.className
  )
}

/**
 * Classes merged onto the chevron trigger Button.
 */
export function getSplitButtonTriggerClasses(
  input: {
    size?: ButtonSize
    className?: string
  } = {}
): string {
  const size = resolveSplitButtonSize(input.size)
  return classNames(splitButtonTriggerClasses, splitButtonTriggerSizeClasses[size], input.className)
}
