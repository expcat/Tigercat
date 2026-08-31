/**
 * DatePicker panel / footer styles. Trigger chrome reuses Input helpers.
 */

import { classNames } from './class-names'

export const datePickerBaseClasses = 'relative inline-block w-full'

export const datePickerPanelClasses = classNames(
  'bg-[var(--tiger-surface,#ffffff)]',
  'border border-[var(--tiger-border,#d1d5db)]',
  'rounded-[var(--tiger-radius-md,0.5rem)]',
  'shadow-[var(--tiger-shadow-md,0_4px_6px_-1px_rgb(0_0_0_/_0.1))]',
  'p-4',
  'w-80 max-w-[min(20rem,var(--tiger-overlay-available-width))]',
  'overflow-auto',
  'max-h-[var(--tiger-overlay-available-height)]'
)

export const datePickerSheetScrimClasses = classNames(
  'sm:hidden',
  'fixed inset-0',
  'bg-[color-mix(in_srgb,var(--tiger-text,#111827)_40%,transparent)]'
)

export const datePickerFooterClasses = classNames(
  'mt-3 pt-3',
  'border-t border-[var(--tiger-border,#e5e7eb)]',
  'flex items-center justify-between gap-2'
)

export const datePickerShortcutListClasses = classNames('mt-3 flex flex-wrap gap-1', 'text-xs')

export const datePickerFooterButtonClasses = classNames(
  'px-3 py-1 text-xs font-medium',
  'rounded-[var(--tiger-radius-md,0.5rem)]',
  'border border-[var(--tiger-border,#d1d5db)]',
  'bg-[var(--tiger-surface,#ffffff)]',
  'text-[var(--tiger-text,#374151)]',
  'hover:bg-[var(--tiger-surface-muted,#f9fafb)]',
  'focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40',
  'tiger-motion-aware [transition:var(--tiger-transition-base,color_150ms_ease)]'
)

export const datePickerShortcutButtonClasses = classNames(
  'px-2 py-1 text-xs',
  'rounded-[var(--tiger-radius-md,0.5rem)]',
  'text-[var(--tiger-primary,#2563eb)]',
  'hover:bg-[var(--tiger-fill-hover,#e5e7eb)]',
  'focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'
)
