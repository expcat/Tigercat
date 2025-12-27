/**
 * Form component types and interfaces
 */

/**
 * Form validation rule types
 */
export type FormRuleType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'date'

/**
 * Form validation trigger types
 */
export type FormRuleTrigger = 'blur' | 'change' | 'submit'

/**
 * Form validation rule interface
 */
export interface FormRule {
  /**
   * Rule type
   */
  type?: FormRuleType
  
  /**
   * Whether the field is required
   */
  required?: boolean
  
  /**
   * Minimum length for strings or minimum value for numbers
   */
  min?: number
  
  /**
   * Maximum length for strings or maximum value for numbers
   */
  max?: number
  
  /**
   * Pattern to match (RegExp)
   */
  pattern?: RegExp
  
  /**
   * Custom validator function
   */
  validator?: (value: unknown, values?: Record<string, unknown>) => boolean | string | Promise<boolean | string>
  
  /**
   * Error message when validation fails
   */
  message?: string
  
  /**
   * When to trigger validation
   * @default ['change', 'blur']
   */
  trigger?: FormRuleTrigger | FormRuleTrigger[]
  
  /**
   * Transform value before validation
   */
  transform?: (value: unknown) => unknown
}

/**
 * Form validation rules
 */
export type FormRules = Record<string, FormRule | FormRule[]>

/**
 * Form field error
 */
export interface FormError {
  field: string
  message: string
}

/**
 * Form values type
 */
export type FormValues = Record<string, unknown>

/**
 * Form validation result
 */
export interface FormValidationResult {
  valid: boolean
  errors: FormError[]
}

/**
 * Form item label alignment
 */
export type FormLabelAlign = 'left' | 'right' | 'top'

/**
 * Form item label position
 */
export type FormLabelPosition = 'left' | 'right' | 'top'

/**
 * Form size
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
