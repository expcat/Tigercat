import type {
  CascaderOption,
  CascaderValue,
  CascaderSize,
  CascaderFlattenedOption,
  CascaderShowSearch
} from '../types/cascader'
import { classNames } from './class-names'

// ============================================================================
// STYLE CLASSES
// ============================================================================

/**
 * Base cascader container classes
 */
export const cascaderBaseClasses = 'relative inline-block w-full'

/**
 * Cascader trigger base classes
 */
const CASCADER_TRIGGER_BASE_CLASSES = [
  'w-full',
  'flex',
  'items-center',
  'justify-between',
  'gap-2',
  'px-3',
  'bg-[var(--tiger-cascader-trigger-bg,var(--tiger-surface,#ffffff))]',
  'border',
  'border-[var(--tiger-cascader-trigger-border,var(--tiger-border,#d1d5db))]',
  'text-[var(--tiger-cascader-trigger-text,var(--tiger-text,#111827))]',
  'rounded-md',
  'shadow-sm',
  'cursor-pointer',
  'transition-all',
  'duration-150',
  'focus:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-cascader-ring,var(--tiger-primary,#2563eb))]',
  'focus-visible:border-[var(--tiger-cascader-trigger-border-focus,var(--tiger-primary,#2563eb))]',
  'active:scale-[0.99]'
] as const

const CASCADER_TRIGGER_DISABLED_CLASSES =
  'disabled:bg-[var(--tiger-cascader-trigger-bg-disabled,var(--tiger-surface-muted,#f3f4f6))] disabled:text-[var(--tiger-cascader-trigger-text-disabled,var(--tiger-text-muted,#6b7280))] disabled:cursor-not-allowed disabled:border-[var(--tiger-cascader-trigger-border-disabled,var(--tiger-border,#e5e7eb))]'

/**
 * Cascader dropdown panel classes
 */
export const cascaderDropdownClasses =
  'absolute z-50 mt-1 flex bg-[var(--tiger-cascader-dropdown-bg,var(--tiger-surface,#ffffff))] border border-[var(--tiger-cascader-dropdown-border,var(--tiger-border,#e5e7eb))] rounded-md shadow-lg'

/**
 * Cascader column (single level) classes
 */
export const cascaderColumnClasses =
  'min-w-[160px] max-h-64 overflow-auto border-r border-[var(--tiger-cascader-column-border,var(--tiger-border,#e5e7eb))] last:border-r-0'

/**
 * Cascader option base classes
 */
export const cascaderOptionBaseClasses =
  'w-full px-3 py-2 flex items-center justify-between text-left cursor-pointer transition-colors text-[var(--tiger-cascader-option-text,var(--tiger-text,#111827))] hover:bg-[var(--tiger-cascader-option-bg-hover,var(--tiger-outline-bg-hover,#eff6ff))]'

/**
 * Cascader option selected classes
 */
export const cascaderOptionSelectedClasses =
  'bg-[var(--tiger-cascader-option-bg-selected,var(--tiger-outline-bg-hover,#eff6ff))] text-[var(--tiger-cascader-option-text-selected,var(--tiger-primary,#2563eb))] font-medium'

/**
 * Cascader option disabled classes
 */
export const cascaderOptionDisabledClasses =
  'opacity-50 cursor-not-allowed hover:bg-[var(--tiger-cascader-dropdown-bg,var(--tiger-surface,#ffffff))]'

/**
 * Cascader search input classes
 */
export const cascaderSearchInputClasses =
  'w-full px-3 py-2 bg-[var(--tiger-cascader-dropdown-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-cascader-search-text,var(--tiger-text,#111827))] placeholder:text-[var(--tiger-cascader-search-placeholder,var(--tiger-text-muted,#9ca3af))] border-b border-[var(--tiger-cascader-dropdown-border,var(--tiger-border,#e5e7eb))] focus:outline-none focus:ring-0'

/**
 * Cascader empty state classes
 */
export const cascaderEmptyStateClasses =
  'px-3 py-8 text-center text-[var(--tiger-cascader-empty-text,var(--tiger-text-muted,#6b7280))] text-sm'

/**
 * Cascader search result item classes
 */
export const cascaderSearchResultClasses =
  'w-full px-3 py-2 text-left cursor-pointer transition-colors text-[var(--tiger-cascader-option-text,var(--tiger-text,#111827))] hover:bg-[var(--tiger-cascader-option-bg-hover,var(--tiger-outline-bg-hover,#eff6ff))]'

/**
 * Size classes map
 */
const CASCADER_SIZE_CLASSES: Record<CascaderSize, string> = {
  sm: 'text-sm py-1.5',
  md: 'text-base py-2',
  lg: 'text-lg py-2.5'
}

/**
 * Get cascader trigger classes
 */
export function getCascaderTriggerClasses(
  size: CascaderSize,
  disabled: boolean,
  isOpen: boolean
): string {
  return classNames(
    ...CASCADER_TRIGGER_BASE_CLASSES,
    CASCADER_SIZE_CLASSES[size],
    disabled && CASCADER_TRIGGER_DISABLED_CLASSES,
    isOpen &&
      'ring-2 ring-[var(--tiger-cascader-ring,var(--tiger-primary,#2563eb))] border-[var(--tiger-cascader-trigger-border-focus,var(--tiger-primary,#2563eb))]'
  )
}

/**
 * Get cascader option classes
 */
export function getCascaderOptionClasses(
  isSelected: boolean,
  isDisabled: boolean,
  size: CascaderSize
): string {
  return classNames(
    cascaderOptionBaseClasses,
    CASCADER_SIZE_CLASSES[size],
    isSelected && cascaderOptionSelectedClasses,
    isDisabled && cascaderOptionDisabledClasses
  )
}

// ============================================================================
// LOGIC UTILITIES
// ============================================================================

/**
 * Find option by value in a flat list of options at a given level
 */
export function findCascaderOption(
  options: CascaderOption[],
  value: string | number
): CascaderOption | undefined {
  return options.find((opt) => opt.value === value)
}

/**
 * Get the full option path for a given value path
 */
export function getCascaderOptionPath(
  options: CascaderOption[],
  valuePath: CascaderValue
): CascaderOption[] {
  const result: CascaderOption[] = []
  let currentOptions = options

  for (const value of valuePath) {
    const option = findCascaderOption(currentOptions, value)
    if (!option) break
    result.push(option)
    currentOptions = option.children ?? []
  }

  return result
}

/**
 * Get the display label for a value path
 */
export function getCascaderDisplayLabel(
  options: CascaderOption[],
  valuePath: CascaderValue,
  separator: string = ' / '
): string {
  const path = getCascaderOptionPath(options, valuePath)
  return path.map((opt) => opt.label).join(separator)
}

/**
 * Get options at a specific level based on selected path
 */
export function getCascaderOptionsAtLevel(
  options: CascaderOption[],
  selectedPath: CascaderValue,
  level: number
): CascaderOption[] {
  if (level === 0) return options

  let currentOptions = options
  for (let i = 0; i < level; i++) {
    const value = selectedPath[i]
    if (value === undefined) return []
    const option = findCascaderOption(currentOptions, value)
    if (!option?.children) return []
    currentOptions = option.children
  }

  return currentOptions
}

/**
 * Check if an option has children (is expandable)
 */
export function isCascaderOptionExpandable(option: CascaderOption): boolean {
  if (option.isLeaf) return false
  return !!(option.children && option.children.length > 0)
}

/**
 * Flatten all option paths for search
 */
export function flattenCascaderOptions(
  options: CascaderOption[],
  parentPath: CascaderOption[] = [],
  parentValuePath: CascaderValue = []
): CascaderFlattenedOption[] {
  const result: CascaderFlattenedOption[] = []

  for (const option of options) {
    const currentPath = [...parentPath, option]
    const currentValuePath = [...parentValuePath, option.value]
    const isDisabled = currentPath.some((o) => o.disabled)

    // Add leaf options or all if changeOnSelect
    if (!option.children || option.children.length === 0 || option.isLeaf) {
      result.push({
        path: currentPath,
        valuePath: currentValuePath,
        label: currentPath.map((o) => o.label).join(' / '),
        disabled: isDisabled
      })
    }

    // Recurse into children
    if (option.children && option.children.length > 0) {
      result.push(...flattenCascaderOptions(option.children, currentPath, currentValuePath))
    }
  }

  return result
}

/**
 * Default search filter function
 */
export function defaultCascaderFilter(inputValue: string, path: CascaderOption[]): boolean {
  const searchLower = inputValue.toLowerCase()
  return path.some((option) => option.label.toLowerCase().includes(searchLower))
}

/**
 * Filter flattened options by search query
 */
export function filterCascaderOptions(
  flattenedOptions: CascaderFlattenedOption[],
  inputValue: string,
  showSearch?: boolean | CascaderShowSearch
): CascaderFlattenedOption[] {
  if (!inputValue) return flattenedOptions

  const filterFn =
    typeof showSearch === 'object' && showSearch.filter ? showSearch.filter : defaultCascaderFilter

  const limit = typeof showSearch === 'object' && showSearch.limit ? showSearch.limit : 50

  const filtered = flattenedOptions.filter((item) => filterFn(inputValue, item.path))

  return filtered.slice(0, limit)
}

/**
 * Get columns to display based on active path
 * Returns an array of { options, selectedValue } for each visible column
 */
export function getCascaderColumns(
  options: CascaderOption[],
  activePath: CascaderValue
): Array<{ options: CascaderOption[]; selectedValue?: string | number }> {
  const columns: Array<{ options: CascaderOption[]; selectedValue?: string | number }> = []

  // First column is always root options
  columns.push({ options, selectedValue: activePath[0] })

  // Add subsequent columns based on active path
  let currentOptions = options
  for (let i = 0; i < activePath.length; i++) {
    const value = activePath[i]
    const option = findCascaderOption(currentOptions, value)
    if (!option?.children || option.children.length === 0) break

    currentOptions = option.children
    columns.push({
      options: currentOptions,
      selectedValue: activePath[i + 1]
    })
  }

  return columns
}
