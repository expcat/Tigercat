/**
 * AutoComplete option
 */
export interface AutoCompleteOption {
  /** Display text */
  label: string
  /** Option value */
  value: string | number
  /** Whether the option is disabled */
  disabled?: boolean
}

/**
 * AutoComplete size variants
 */
export type AutoCompleteSize = 'sm' | 'md' | 'lg'

/**
 * Shared AutoComplete props (framework-agnostic)
 */
export interface AutoCompleteProps {
  /** Options list */
  options?: AutoCompleteOption[]
  /** Placeholder text */
  placeholder?: string
  /** Component size */
  size?: AutoCompleteSize
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether to show clear button */
  clearable?: boolean
  /** Text shown when no options match */
  notFoundText?: string
  /** Whether to filter options locally based on input value (default: true) */
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  /** Custom class name */
  className?: string
  /** Whether to select the first match automatically when losing focus */
  defaultActiveFirstOption?: boolean
  /** Whether to allow free-form text input (not limited to options) */
  allowFreeInput?: boolean
}
