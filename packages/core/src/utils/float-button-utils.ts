/**
 * FloatButton component utilities
 * Shared styles and helpers for FloatButton components
 */

import type { FloatButtonShape, FloatButtonSize } from '../types/float-button'

// ---------------------------------------------------------------------------
// Base classes
// ---------------------------------------------------------------------------

export const floatButtonBaseClasses =
  'inline-flex items-center justify-center shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--tiger-focus-ring,#3b82f6)]'

export const floatButtonShapeClasses: Record<FloatButtonShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-lg'
}

export const floatButtonSizeClasses: Record<FloatButtonSize, string> = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-14 w-14 text-lg'
}

export const floatButtonTypeClasses = {
  primary:
    'bg-[var(--tiger-primary,#2563eb)] text-white hover:bg-[var(--tiger-primary-hover,#1d4ed8)] active:bg-[var(--tiger-primary-active,#1e40af)]',
  default:
    'bg-[var(--tiger-surface-raised,#ffffff)] text-[var(--tiger-text,#111827)] border border-[var(--tiger-border,#e5e7eb)] hover:border-[var(--tiger-border-strong,#d1d5db)] hover:shadow-xl'
}

export const floatButtonDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

// ---------------------------------------------------------------------------
// Group classes
// ---------------------------------------------------------------------------

export const floatButtonGroupClasses =
  'fixed right-6 bottom-6 z-50 flex flex-col-reverse items-center gap-3'

export const floatButtonGroupExpandClasses = 'transition-all duration-200 ease-in-out'

// ---------------------------------------------------------------------------
// Icon size
// ---------------------------------------------------------------------------

export const floatButtonIconSizeClasses: Record<FloatButtonSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}
