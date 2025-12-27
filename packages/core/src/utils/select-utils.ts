/**
 * Utility functions for Select component styling
 */

import type { SelectSize, SelectOption, SelectOptionGroup } from '../types/select'

/**
 * Base select container classes
 */
export const selectBaseClasses = 'relative inline-block w-full'

/**
 * Select trigger button base classes
 */
export const selectTriggerBaseClasses =
  'w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:border-[var(--tiger-primary,#2563eb)]'

/**
 * Select trigger disabled classes
 */
export const selectTriggerDisabledClasses =
  'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200'

/**
 * Select dropdown base classes
 */
export const selectDropdownBaseClasses =
  'absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto'

/**
 * Select option base classes
 */
export const selectOptionBaseClasses =
  'w-full px-3 py-2 text-left cursor-pointer transition-colors hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]'

/**
 * Select option selected classes
 */
export const selectOptionSelectedClasses =
  'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)] font-medium'

/**
 * Select option disabled classes
 */
export const selectOptionDisabledClasses =
  'opacity-50 cursor-not-allowed hover:bg-white'

/**
 * Select group label classes
 */
export const selectGroupLabelClasses =
  'px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50'

/**
 * Select search input classes
 */
export const selectSearchInputClasses =
  'w-full px-3 py-2 border-b border-gray-200 focus:outline-none focus:ring-0'

/**
 * Select empty state classes
 */
export const selectEmptyStateClasses =
  'px-3 py-8 text-center text-gray-500 text-sm'

/**
 * Get select size classes
 */
export function getSelectSizeClasses(size: SelectSize): string {
  const sizeClasses = {
    sm: 'text-sm py-1.5',
    md: 'text-base py-2',
    lg: 'text-lg py-2.5',
  }

  return sizeClasses[size] || sizeClasses.md
}

/**
 * Get select trigger classes
 */
export function getSelectTriggerClasses(
  size: SelectSize,
  disabled: boolean,
  isOpen: boolean
): string {
  const classes = [
    selectTriggerBaseClasses,
    getSelectSizeClasses(size),
    disabled && selectTriggerDisabledClasses,
    isOpen && 'ring-2 ring-[var(--tiger-primary,#2563eb)] border-[var(--tiger-primary,#2563eb)]',
  ].filter(Boolean)

  return classes.join(' ')
}

/**
 * Get select option classes
 */
export function getSelectOptionClasses(
  isSelected: boolean,
  isDisabled: boolean,
  size: SelectSize
): string {
  const classes = [
    selectOptionBaseClasses,
    getSelectSizeClasses(size),
    isSelected && selectOptionSelectedClasses,
    isDisabled && selectOptionDisabledClasses,
  ].filter(Boolean)

  return classes.join(' ')
}

/**
 * Check if options are grouped
 */
export function isOptionGroup(option: SelectOption | SelectOptionGroup | null | undefined): option is SelectOptionGroup {
  return !!option && typeof option === 'object' && 'options' in option && Array.isArray(option.options)
}

/**
 * Filter options based on search query
 */
export function filterOptions(
  options: (SelectOption | SelectOptionGroup)[],
  query: string
): (SelectOption | SelectOptionGroup)[] {
  if (!query) {
    return options
  }

  const searchLower = query.toLowerCase()

  return options.reduce((filtered: (SelectOption | SelectOptionGroup)[], option: SelectOption | SelectOptionGroup) => {
    if (isOptionGroup(option)) {
      const filteredGroupOptions = option.options.filter((opt: SelectOption) =>
        opt.label.toLowerCase().includes(searchLower)
      )
      if (filteredGroupOptions.length > 0) {
        filtered.push({
          ...option,
          options: filteredGroupOptions,
        })
      }
    } else {
      if (option.label.toLowerCase().includes(searchLower)) {
        filtered.push(option)
      }
    }
    return filtered
  }, [])
}
