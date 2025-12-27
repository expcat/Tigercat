/**
 * Select component types and interfaces
 */

/**
 * Single select option
 */
export interface SelectOption {
  /**
   * Option value
   */
  value: string | number
  
  /**
   * Option label (displayed text)
   */
  label: string
  
  /**
   * Whether the option is disabled
   * @default false
   */
  disabled?: boolean
}

/**
 * Option group
 */
export interface SelectOptionGroup {
  /**
   * Group label
   */
  label: string
  
  /**
   * Options in this group
   */
  options: SelectOption[]
}

/**
 * Select size types
 */
export type SelectSize = 'sm' | 'md' | 'lg'

/**
 * Base select props interface
 */
export interface SelectProps {
  /**
   * Select size
   * @default 'md'
   */
  size?: SelectSize
  
  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean
  
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string
  
  /**
   * Whether to allow search/filter
   * @default false
   */
  searchable?: boolean
  
  /**
   * Whether to allow multiple selection
   * @default false
   */
  multiple?: boolean
  
  /**
   * Whether to clear the selection
   * @default true
   */
  clearable?: boolean
  
  /**
   * Options list (can be flat list or grouped)
   */
  options?: SelectOption[] | SelectOptionGroup[]
  
  /**
   * Text to display when no options match search
   * @default 'No options found'
   */
  noOptionsText?: string
  
  /**
   * Text to display when options list is empty
   * @default 'No options available'
   */
  noDataText?: string
}
