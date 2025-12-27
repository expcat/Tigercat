/**
 * Input component types and interfaces
 */

/**
 * Input size types
 */
export type InputSize = 'sm' | 'md' | 'lg'

/**
 * Input type attribute
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'

/**
 * Base input props interface
 */
export interface InputProps {
  /**
   * Input size
   * @default 'md'
   */
  size?: InputSize
  
  /**
   * Input type
   * @default 'text'
   */
  type?: InputType
  
  /**
   * Input value (for controlled mode)
   */
  value?: string | number
  
  /**
   * Default value (for uncontrolled mode)
   */
  defaultValue?: string | number
  
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
   * Whether the input is required
   * @default false
   */
  required?: boolean
  
  /**
   * Maximum length of input
   */
  maxLength?: number
  
  /**
   * Minimum length of input
   */
  minLength?: number
  
  /**
   * Input name attribute
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
