/**
 * Form component types and interfaces
 */

/**
 * Supported form validation rule types
 */
export type FormRuleType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'date'

/**
 * When to trigger form validation
 */
export type FormRuleTrigger = 'blur' | 'change' | 'submit'

/**
 * Form validation rule interface
 * Defines how a field should be validated
 */
export interface FormRule {
  /**
   * Rule type - determines the validation logic to apply
   */
  type?: FormRuleType
  
  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean
  
  /**
   * Minimum length for strings, minimum value for numbers, or minimum items for arrays
   */
  min?: number
  
  /**
   * Maximum length for strings, maximum value for numbers, or maximum items for arrays
   */
  max?: number
  
  /**
   * Regular expression pattern to match against string values
   */
  pattern?: RegExp
  
  /**
   * Custom validator function
   * Should return:
   * - true if validation passes
   * - false if validation fails (uses the default/custom message)
   * - string with custom error message if validation fails
   * Can be async for server-side validation
   */
  validator?: (value: unknown, values?: Record<string, unknown>) => boolean | string | Promise<boolean | string>
  
  /**
   * Error message to display when validation fails
   * If not provided, a default message will be used
   */
  message?: string
  
  /**
   * When to trigger validation
   * @default ['change', 'blur']
   */
  trigger?: FormRuleTrigger | FormRuleTrigger[]
  
  /**
   * Transform value before validation
   * Useful for trimming strings, converting types, etc.
   */
  transform?: (value: unknown) => unknown
}

/**
 * Form validation rules mapped by field name
 * Each field can have a single rule or an array of rules
 */
export type FormRules = Record<string, FormRule | FormRule[]>

/**
 * Form field error with field name and message
 */
export interface FormError {
  /**
   * Field name that failed validation
   */
  field: string
  
  /**
   * Error message describing the validation failure
   */
  message: string
}

/**
 * Form values - key-value pairs representing form data
 * Values can be of any type (string, number, boolean, arrays, objects, etc.)
 */
export type FormValues = Record<string, unknown>

/**
 * Form validation result containing validity status and any errors
 */
export interface FormValidationResult {
  /**
   * Whether the entire form is valid (no errors)
   */
  valid: boolean
  
  /**
   * Array of validation errors (empty if form is valid)
   */
  errors: FormError[]
}

/**
 * Form item label alignment (horizontal positioning)
 */
export type FormLabelAlign = 'left' | 'right' | 'top'

/**
 * Form item label position relative to the input
 */
export type FormLabelPosition = 'left' | 'right' | 'top'

/**
 * Form size - affects all form items within the form
 */
export type FormSize = 'sm' | 'md' | 'lg'

/**
 * Base form props interface
 */
export interface FormProps {
  /**
   * Form values
   */
  model?: FormValues
  
  /**
   * Form validation rules
   */
  rules?: FormRules
  
  /**
   * Label width (applies when labelPosition is 'left' or 'right')
   */
  labelWidth?: string | number
  
  /**
   * Label position
   * @default 'right'
   */
  labelPosition?: FormLabelPosition
  
  /**
   * Label alignment
   * @default 'right'
   */
  labelAlign?: FormLabelAlign
  
  /**
   * Form size
   * @default 'md'
   */
  size?: FormSize
  
  /**
   * Whether to show validation messages inline
   * @default true
   */
  inlineMessage?: boolean
  
  /**
   * Whether to show asterisk for required fields
   * @default true
   */
  showRequiredAsterisk?: boolean
  
  /**
   * Whether to disable the entire form
   * @default false
   */
  disabled?: boolean
}

/**
 * Base form item props interface
 */
export interface FormItemProps {
  /**
   * Field name (must match key in form model)
   */
  name?: string
  
  /**
   * Label text
   */
  label?: string
  
  /**
   * Label width (overrides form's labelWidth)
   */
  labelWidth?: string | number
  
  /**
   * Whether the field is required
   */
  required?: boolean
  
  /**
   * Validation rules for this field
   */
  rules?: FormRule | FormRule[]
  
  /**
   * Error message (controlled mode)
   */
  error?: string
  
  /**
   * Whether to show validation message
   * @default true
   */
  showMessage?: boolean
  
  /**
   * Size (overrides form's size)
   */
  size?: FormSize
}
