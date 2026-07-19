/**
 * TagsInput component types and interfaces
 * @since 2.1.0
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'

/**
 * Base TagsInput props interface
 */
export interface TagsInputProps {
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
   * Tags (for controlled mode)
   */
  value?: string[]

  /**
   * Default tags (for uncontrolled mode)
   * @default []
   */
  defaultValue?: string[]

  /**
   * Placeholder for the inner text input
   */
  placeholder?: string

  /**
   * Whether the same tag may be added more than once (case-sensitive
   * comparison). When duplicates are rejected the pending input text is kept
   * so the user can see the value was not added.
   * @default false
   */
  allowDuplicates?: boolean

  /**
   * Maximum number of tags; further adds are rejected while the input stays
   * focusable for removal
   */
  max?: number

  /**
   * Characters that commit the pending input while typing and split pasted
   * text into multiple tags (newlines always split)
   * @default [',']
   */
  delimiters?: string[]

  /**
   * Commit the pending input as a tag on blur
   * @default false
   */
  addOnBlur?: boolean

  /**
   * Validate/transform a candidate tag before it is added: return `false` to
   * reject it, a string to replace it, or `true` to accept it as-is
   */
  beforeAdd?: (tag: string) => boolean | string

  /**
   * Whether to show a clear-all button when there are tags
   * @default false
   */
  clearable?: boolean

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
   * Name for the hidden input carrying the joined value (form submission)
   */
  name?: string

  /**
   * Id attribute applied to the inner text input
   */
  id?: string

  /**
   * Aria-label template for tag remove buttons; supports `{tag}`. Overrides
   * the locale `tagsInput.removeTagLabel`
   */
  removeTagAriaLabel?: string
}
