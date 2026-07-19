/**
 * MaskInput component types and interfaces
 * @since 2.1.0
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'

/**
 * A custom mask token definition
 */
export interface MaskToken {
  /**
   * Single-character test regex, e.g. `/[0-9]/`
   */
  pattern: RegExp

  /**
   * Transform applied to an accepted character (e.g. uppercasing). Must be
   * idempotent — it may be applied more than once to the same character.
   */
  transform?: (char: string) => string
}

/**
 * Extra detail passed alongside the raw value on change
 */
export interface MaskInputChangeDetail {
  /** The formatted (masked) value as displayed */
  maskedValue: string
  /** Whether every token slot of the mask is filled */
  completed: boolean
}

/**
 * Base MaskInput props interface
 */
export interface MaskInputProps {
  /**
   * Input size
   * @default 'md'
   */
  size?: ComponentSize

  /**
   * Validation status
   * @default 'default'
   */
  status?: InputStatus

  /**
   * Error message to display
   */
  errorMessage?: string

  /**
   * Mask template. Built-in tokens: `#` digit, `a` letter, `*` alphanumeric;
   * `!` escapes the next character to a literal. Any other character is a
   * fixed literal. Examples: `'##/##/####'`, `'(###) ###-####'`
   */
  mask: string

  /**
   * Custom tokens merged over the built-ins
   */
  tokens?: Record<string, MaskToken>

  /**
   * Raw (unmasked) value (for controlled mode)
   */
  value?: string

  /**
   * Default raw value (for uncontrolled mode)
   * @default ''
   */
  defaultValue?: string

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the input is readonly
   * @default false
   */
  readonly?: boolean

  /**
   * Whether to show a clear button when the input has value
   * @default false
   */
  clearable?: boolean

  /**
   * Input name attribute (the submitted value is the raw value)
   */
  name?: string

  /**
   * Input id attribute
   */
  id?: string

  /**
   * Input autocomplete attribute
   */
  autoComplete?: string

  /**
   * Whether to autofocus on mount
   * @default false
   */
  autoFocus?: boolean
}
