/**
 * Checkbox component types and interfaces
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'

export type CheckboxValue = string | number | boolean

export type CheckboxGroupValue = CheckboxValue[]

export type ChoiceGroupDirection = 'vertical' | 'horizontal'

/**
 * Base checkbox props interface
 */
export interface CheckboxProps {
  /**
   * Checked state (controlled mode)
   */
  checked?: boolean

  /**
   * Default checked state (uncontrolled mode)
   * @default false
   */
  defaultChecked?: boolean

  /**
   * Checkbox size
   * @default 'md'
   */
  size?: ComponentSize

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

  /**
   * Validation status
   * @default 'default'
   */
  status?: InputStatus
}

/**
 * Checkbox group props interface
 */
export interface CheckboxGroupProps {
  /**
   * Selected values (controlled mode)
   */
  value?: CheckboxGroupValue

  /**
   * Default selected values (uncontrolled mode)
   * @default []
   */
  defaultValue?: CheckboxGroupValue

  /**
   * Whether the checkbox group is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Checkbox size for all checkboxes in the group
   * @default 'md'
   */
  size?: ComponentSize

  /**
   * Layout direction
   * @default 'vertical'
   */
  direction?: ChoiceGroupDirection

  /**
   * Validation status
   * @default 'default'
   */
  status?: InputStatus
}
