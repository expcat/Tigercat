import type { AutoCompleteOption, AutoCompleteSize } from '../types/auto-complete'
import { classNames } from './class-names'

// ============================================================================
// STYLE CLASSES
// ============================================================================

/**
 * Base autocomplete container classes
 */
export const autoCompleteBaseClasses = 'relative inline-block w-full'

/**
 * AutoComplete dropdown panel classes
 */
export const autoCompleteDropdownClasses =
  'absolute z-50 w-full mt-1 bg-[var(--tiger-autocomplete-dropdown-bg,var(--tiger-surface,#ffffff))] border border-[var(--tiger-autocomplete-dropdown-border,var(--tiger-border,#d1d5db))] rounded-lg shadow-lg max-h-60 overflow-auto'

/**
 * AutoComplete option base classes
 */
export const autoCompleteOptionBaseClasses =
  'w-full px-3 py-2 text-left cursor-pointer transition-colors'

/**
 * AutoComplete empty state classes
 */
export const autoCompleteEmptyStateClasses =
  'px-3 py-4 text-center text-[var(--tiger-autocomplete-empty-text,var(--tiger-text-muted,#9ca3af))]'

// ============================================================================
// SIZE HELPERS
// ============================================================================

const sizeClasses: Record<AutoCompleteSize, string> = {
  sm: 'text-sm py-1.5',
  md: 'text-base py-2',
  lg: 'text-lg py-2.5'
}

const inputPaddingClasses: Record<AutoCompleteSize, string> = {
  sm: 'pl-2 pr-8',
  md: 'pl-3 pr-10',
  lg: 'pl-4 pr-12'
}

// ============================================================================
// STYLE FUNCTIONS
// ============================================================================

/**
 * Get input classes for the autocomplete text input
 */
export function getAutoCompleteInputClasses(
  size: AutoCompleteSize = 'md',
  disabled: boolean = false,
  isOpen: boolean = false
): string {
  const base = 'w-full rounded-lg border outline-none transition-all duration-150'

  const sizeClass = classNames(sizeClasses[size], inputPaddingClasses[size])

  const stateClass = disabled
    ? 'bg-[var(--tiger-autocomplete-bg-disabled,var(--tiger-outline-bg-disabled,#f3f4f6))] text-[var(--tiger-autocomplete-text-disabled,var(--tiger-text-muted,#9ca3af))] border-[var(--tiger-autocomplete-border-disabled,var(--tiger-border,#d1d5db))] cursor-not-allowed'
    : isOpen
      ? 'bg-[var(--tiger-autocomplete-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-autocomplete-text,var(--tiger-text,#111827))] border-[var(--tiger-autocomplete-border-focus,var(--tiger-primary,#2563eb))] ring-2 ring-[var(--tiger-autocomplete-ring,var(--tiger-primary,#2563eb))]/20'
      : 'bg-[var(--tiger-autocomplete-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-autocomplete-text,var(--tiger-text,#111827))] border-[var(--tiger-autocomplete-border,var(--tiger-border,#d1d5db))] hover:border-[var(--tiger-autocomplete-border-hover,var(--tiger-primary,#2563eb))]'

  return classNames(base, sizeClass, stateClass)
}

/**
 * Get option classes for an autocomplete option
 */
export function getAutoCompleteOptionClasses(
  isSelected: boolean = false,
  isDisabled: boolean = false,
  size: AutoCompleteSize = 'md'
): string {
  const stateClass = isDisabled
    ? 'text-[var(--tiger-autocomplete-option-text-disabled,var(--tiger-text-muted,#9ca3af))] cursor-not-allowed'
    : isSelected
      ? 'bg-[var(--tiger-autocomplete-option-bg-selected,var(--tiger-outline-bg-active,#dbeafe))] text-[var(--tiger-autocomplete-option-text-selected,var(--tiger-primary,#2563eb))]'
      : 'text-[var(--tiger-autocomplete-option-text,var(--tiger-text,#111827))] hover:bg-[var(--tiger-autocomplete-option-bg-hover,var(--tiger-outline-bg-hover,#eff6ff))]'

  return classNames(autoCompleteOptionBaseClasses, sizeClasses[size], stateClass)
}

// ============================================================================
// LOGIC FUNCTIONS
// ============================================================================

/**
 * Default filter function - case-insensitive label matching
 */
export function defaultAutoCompleteFilter(inputValue: string, option: AutoCompleteOption): boolean {
  return option.label.toLowerCase().includes(inputValue.toLowerCase())
}

/**
 * Filter options based on input value
 */
export function filterAutoCompleteOptions(
  options: AutoCompleteOption[],
  inputValue: string,
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
): AutoCompleteOption[] {
  if (filterOption === false) return options
  if (!inputValue) return options

  const filterFn = typeof filterOption === 'function' ? filterOption : defaultAutoCompleteFilter

  return options.filter((opt) => filterFn(inputValue, opt))
}
