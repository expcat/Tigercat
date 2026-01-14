/**
 * Textarea component types and interfaces
 */

/**
 * Textarea size types
 */
export type TextareaSize = 'sm' | 'md' | 'lg'

/**
 * Base textarea props interface
 */
export interface TextareaProps {
  /**
   * Textarea size
   * @default 'md'
   */
  size?: TextareaSize

  /**
   * Textarea value (for controlled mode)
   */
  value?: string

  /**
   * Default value (for uncontrolled mode)
   */
  defaultValue?: string

  /**
   * Whether the textarea is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the textarea is readonly
   * @default false
   */
  readonly?: boolean

  /**
   * Whether the textarea is required
   * @default false
   */
  required?: boolean

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Number of visible text rows
   * @default 3
   */
  rows?: number

  /**
   * Enable auto-resize to fit content
   * @default false
   */
  autoResize?: boolean

  /**
   * Maximum number of rows when autoResize is enabled
   */
  maxRows?: number

  /**
   * Minimum number of rows when autoResize is enabled
   */
  minRows?: number

  /**
   * Maximum character length
   */
  maxLength?: number

  /**
   * Minimum character length
   */
  minLength?: number

  /**
   * Textarea name attribute
   */
  name?: string

  /**
   * Textarea id attribute
   */
  id?: string

  /**
   * Autocomplete attribute
   */
  autoComplete?: string

  /**
   * Whether to autofocus on mount
   * @default false
   */
  autoFocus?: boolean

  /**
   * Show character count
   * @default false
   */
  showCount?: boolean
}
