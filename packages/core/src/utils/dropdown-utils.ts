import { classNames } from './class-names'
import { isBrowser } from './env'

/**
 * Get base dropdown container classes
 */
export function getDropdownContainerClasses(): string {
  return classNames('tiger-dropdown', 'relative', 'inline-block')
}

/**
 * Get dropdown trigger classes (self-rendered `<button type="button">`).
 */
export function getDropdownTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-dropdown-trigger',
    'inline-flex items-center gap-1.5',
    'select-none bg-transparent p-0 border-0 font-inherit text-inherit',
    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
  )
}

export type DropdownChevronTone = 'muted' | 'current'
export type DropdownChevronSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const DROPDOWN_CHEVRON_SIZE_CLASSES: Record<DropdownChevronSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-5 w-5'
}

/**
 * Get dropdown chevron indicator classes.
 * `tone: 'current'` follows the host button foreground (SplitButton).
 */
export function getDropdownChevronClasses(
  visible: boolean,
  options: { tone?: DropdownChevronTone; size?: DropdownChevronSize } = {}
): string {
  const size = options.size ?? 'md'
  const tone = options.tone ?? 'muted'
  return classNames(
    'tiger-dropdown-chevron',
    'shrink-0',
    DROPDOWN_CHEVRON_SIZE_CLASSES[size],
    tone === 'current' ? 'text-current' : 'text-[var(--tiger-text-muted,#9ca3af)]',
    'tiger-motion-aware [transition:var(--tiger-transition-base,transform_200ms_ease)]',
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
    'min-w-[var(--tiger-component-dropdown-min-width,160px)]',
    'py-1.5 px-1',
    'rounded-[var(--tiger-component-dropdown-border-radius,var(--tiger-radius-md,0.5rem))]',
    'bg-[var(--tiger-surface,#ffffff)]',
    'border border-[var(--tiger-border,#e5e7eb)]',
    'shadow-[var(--tiger-component-dropdown-shadow,0_6px_16px_-2px_rgba(0,0,0,0.12),0_2px_6px_-1px_rgba(0,0,0,0.08))]',
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
    'w-full rounded-[var(--tiger-radius-md,0.5rem)]',
    'px-3 py-1.5',
    'text-sm text-[var(--tiger-text,#374151)]',
    'transition-colors duration-150',
    'text-start',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)]/40 focus-visible:ring-inset',
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
    transform: scale(0.96) translateY(-2px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.tiger-dropdown-enter {
  animation: tiger-dropdown-in var(--tiger-motion-duration-base,0.2s) var(--tiger-motion-ease-standard,cubic-bezier(0.25, 0.1, 0.25, 1));
}

@media (prefers-reduced-motion: reduce) {
  .tiger-dropdown-enter {
    animation-duration: 0ms;
  }
}
`

let isDropdownStyleInjected = false

/**
 * Inject dropdown animation styles into the document head.
 * Safe to call multiple times - will only inject once.
 */
export function injectDropdownStyles(): void {
  if (!isBrowser() || isDropdownStyleInjected) return

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
