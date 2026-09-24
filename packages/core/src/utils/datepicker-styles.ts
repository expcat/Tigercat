/**
 * DatePicker panel / footer styles. Trigger chrome reuses Input helpers.
 */

import { classNames } from './class-names'

export const datePickerBaseClasses = 'relative inline-block w-full'

export const datePickerPanelClasses = classNames(
  'bg-[var(--tiger-surface)]',
  'border border-[var(--tiger-border)]',
  'rounded-[var(--tiger-radius-md)]',
  'shadow-[var(--tiger-shadow-md)]',
  'p-4',
  'w-80 max-w-[min(20rem,var(--tiger-overlay-available-width))]',
  'overflow-auto',
  'max-h-[var(--tiger-overlay-available-height)]'
)

export const datePickerSheetScrimClasses = classNames(
  'sm:hidden',
  'fixed inset-0',
  'bg-[color-mix(in_srgb,var(--tiger-text)_40%,transparent)]'
)

export const datePickerFooterClasses = classNames(
  'mt-3 pt-3',
  'border-t border-[var(--tiger-border)]',
  'flex items-center justify-between gap-2'
)

export const datePickerShortcutListClasses = classNames('mt-3 flex flex-wrap gap-1', 'text-xs')

export const datePickerFooterButtonClasses = classNames(
  'px-3 py-1 text-xs font-medium',
  'rounded-[var(--tiger-radius-md)]',
  'border border-[var(--tiger-border)]',
  'bg-[var(--tiger-surface)]',
  'text-[var(--tiger-text)]',
  'hover:bg-[var(--tiger-surface-muted)]',
  'focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40',
  'tiger-motion-aware [transition:var(--tiger-transition-base)]'
)

export const datePickerShortcutButtonClasses = classNames(
  'px-2 py-1 text-xs',
  'rounded-[var(--tiger-radius-md)]',
  'text-[var(--tiger-primary)]',
  'hover:bg-[var(--tiger-ghost-bg-hover)]',
  'focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40'
)
