import { classNames } from './class-names'

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
    'inline-flex items-center gap-1.5 h-full',
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
    tone === 'current' ? 'text-current' : 'text-[var(--tiger-text-secondary)]',
    'tiger-motion-aware [transition:var(--tiger-transition-base)]',
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
    'min-w-[var(--tiger-component-dropdown-min-width)]',
    'py-1.5 px-1',
    'rounded-[var(--tiger-component-dropdown-border-radius)]',
    'bg-[var(--tiger-surface)]',
    'border border-[var(--tiger-border)]',
    'shadow-[var(--tiger-component-dropdown-shadow)]',
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
    'w-full rounded-[var(--tiger-radius-md)]',
    'px-3 py-1.5',
    'text-sm text-[var(--tiger-text)]',
    'transition-colors duration-150',
    'text-start',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary)]/40 focus-visible:ring-inset',
    divided && 'mt-1 border-t border-[var(--tiger-border)] pt-1',
    disabled
      ? 'cursor-not-allowed opacity-50'
      : classNames(
          'cursor-pointer',
          'hover:bg-[var(--tiger-surface-muted)]',
          'active:bg-[var(--tiger-surface-muted)]'
        )
  )
}

// ============================================================================
// Dropdown Animation — stylesheet object, not a runtime <style> tag.
// Spread `dropdownBaseStyles` into the Tailwind plugin. Reduced motion is 0.
// ============================================================================

export const dropdownBaseStyles = {
  '@keyframes tiger-dropdown-in': {
    from: {
      opacity: '0',
      transform: 'scale(0.96) translateY(-2px)'
    },
    to: {
      opacity: '1',
      transform: 'scale(1) translateY(0)'
    }
  },
  '.tiger-dropdown-enter': {
    animation:
      'tiger-dropdown-in var(--tiger-motion-duration-base) var(--tiger-motion-ease-standard)'
  },
  '@media (prefers-reduced-motion: reduce)': {
    '.tiger-dropdown-enter': {
      animationDuration: '0ms'
    }
  }
} as const

/**
 * CSS class for dropdown menu entrance animation
 */
export const DROPDOWN_ENTER_CLASS = 'tiger-dropdown-enter'
