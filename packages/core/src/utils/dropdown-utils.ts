import { classNames } from './class-names'

/**
 * Get base dropdown container classes
 */
export function getDropdownContainerClasses(): string {
  return classNames('tiger-dropdown', 'relative', 'inline-block')
}

/**
 * Get dropdown trigger classes
 */
export function getDropdownTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-dropdown-trigger',
    'inline-flex items-center gap-1.5',
    'select-none',
    disabled
      ? 'cursor-not-allowed opacity-50 pointer-events-none'
      : 'cursor-pointer'
  )
}

/**
 * Get dropdown chevron indicator classes
 */
export function getDropdownChevronClasses(visible: boolean): string {
  return classNames(
    'tiger-dropdown-chevron',
    'w-4 h-4 shrink-0',
    'text-[var(--tiger-text-muted,#9ca3af)]',
    'transition-transform duration-200 ease-out',
    visible && 'rotate-180'
  )
}

/**
 * SVG path for the dropdown chevron-down icon (viewBox 0 0 24 24)
 */
export const DROPDOWN_CHEVRON_PATH = 'M6 9l6 6 6-6'

/**
 * Get dropdown menu classes
 */
export function getDropdownMenuClasses(): string {
  return classNames(
    'tiger-dropdown-menu',
    'min-w-[160px]',
    'py-1.5 px-1',
    'rounded-lg',
    'bg-[var(--tiger-surface,#ffffff)]',
    'border border-[var(--tiger-border,#e5e7eb)]',
    'shadow-[0_6px_16px_-2px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08)]',
    'ring-1 ring-black/[0.04]'
  )
}

/**
 * Get dropdown item classes
 */
export function getDropdownItemClasses(disabled: boolean, divided: boolean): string {
  return classNames(
    'tiger-dropdown-item',
    'flex items-center gap-2',
    'w-full rounded-md',
    'px-3 py-1.5',
    'text-sm text-[var(--tiger-text,#374151)]',
    'transition-colors duration-150',
    'text-left',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-inset',
    divided && 'mt-1 border-t border-[var(--tiger-border,#e5e7eb)] pt-1',
    disabled
      ? 'cursor-not-allowed opacity-50'
      : classNames(
          'cursor-pointer',
          'hover:bg-[var(--tiger-surface-muted,#f3f4f6)]',
          'active:bg-[var(--tiger-surface-muted,#e5e7eb)]'
        )
  )
}

// ============================================================================
// Dropdown Animation
// ============================================================================

const DROPDOWN_ANIMATION_CSS = `
@keyframes tiger-dropdown-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.tiger-dropdown-enter {
  animation: tiger-dropdown-in 0.15s ease-out;
}
`

let isDropdownStyleInjected = false

/**
 * Inject dropdown animation styles into the document head.
 * Safe to call multiple times - will only inject once.
 */
export function injectDropdownStyles(): void {
  if (typeof document === 'undefined' || isDropdownStyleInjected) return

  const styleId = 'tiger-ui-dropdown-styles'
  if (document.getElementById(styleId)) {
    isDropdownStyleInjected = true
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = DROPDOWN_ANIMATION_CSS
  document.head.appendChild(style)
  isDropdownStyleInjected = true
}

/**
 * CSS class for dropdown menu entrance animation
 */
export const DROPDOWN_ENTER_CLASS = 'tiger-dropdown-enter'
