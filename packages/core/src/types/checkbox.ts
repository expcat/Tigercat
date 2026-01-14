/**
 * Checkbox component types and interfaces
 */

export type CheckboxValue = string | number | boolean

export type CheckboxGroupValue = CheckboxValue[]

/**
 * Checkbox size types
 */
export type CheckboxSize = 'sm' | 'md' | 'lg'

/**
 * Base checkbox props interface
 */
export interface CheckboxProps {
  /**
   * Checkbox size
   * @default 'md'
   */
  size?: CheckboxSize

  /**
   * Whether the checkbox is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Checkbox value (for use in checkbox groups)
   */
  value?: CheckboxValue

  /**
   * Whether the checkbox is in indeterminate state
   * @default false
   */
  indeterminate?: boolean
}

/**
 * Checkbox group props interface
 */
export interface CheckboxGroupProps {
  /**
   * Whether the checkbox group is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Checkbox size for all checkboxes in the group
   * @default 'md'
   */
  size?: CheckboxSize
}
