/**
 * Form validation utilities
 */

import type { FormRule, FormRules, FormValues, FormError, FormValidationResult } from '../types/form'

/**
 * Email validation pattern (RFC 5322 compliant)
 */
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * URL validation pattern (supports http and https)
 */
const URL_PATTERN = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

/**
 * Check if a value is considered empty for form validation
 * @param value - Value to check
 * @returns True if value is empty
 * 
 * Note: This function treats the following as empty:
 * - null
 * - undefined
 * - empty string ('')
 * - empty array ([])
 * Objects (even empty ones) are NOT considered empty by this function,
 * as they may contain properties that need to be validated separately.
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === '') {
    return true
  }
  if (Array.isArray(value) && value.length === 0) {
    return true
  }
  return false
}

/**
 * Validate value type
 * @param value - Value to validate
 * @param type - Expected type
 * @param customMessage - Custom error message
 * @returns Error message if validation fails, null otherwise
 */
function validateType(
  value: unknown,
  type: FormRule['type'],
  customMessage?: string
): string | null {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return customMessage || 'Value must be a string'
      }
      break
    case 'number':
      if (typeof value !== 'number' && isNaN(Number(value))) {
        return customMessage || 'Value must be a number'
      }
      break
    case 'boolean':
      if (typeof value !== 'boolean') {
        return customMessage || 'Value must be a boolean'
      }
      break
    case 'array':
      if (!Array.isArray(value)) {
        return customMessage || 'Value must be an array'
      }
      break
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return customMessage || 'Value must be an object'
      }
      break
    case 'email':
      if (typeof value === 'string' && !EMAIL_PATTERN.test(value)) {
        return customMessage || 'Please enter a valid email address'
      }
      break
    case 'url':
      if (typeof value === 'string' && !URL_PATTERN.test(value)) {
        return customMessage || 'Please enter a valid URL'
      }
      break
    case 'date':
      if (!(value instanceof Date) && isNaN(Date.parse(String(value)))) {
        return customMessage || 'Please enter a valid date'
      }
      break
  }
  return null
}

/**
 * Validate value range (min/max)
 * @param value - Value to validate
 * @param min - Minimum value/length
 * @param max - Maximum value/length
 * @param customMessage - Custom error message
 * @returns Error message if validation fails, null otherwise
 */
function validateRange(
  value: unknown,
  min: number | undefined,
  max: number | undefined,
  customMessage?: string
): string | null {
  // String length validation
  if (typeof value === 'string') {
    if (min !== undefined && value.length < min) {
      return customMessage || `Minimum length is ${min} characters`
    }
    if (max !== undefined && value.length > max) {
      return customMessage || `Maximum length is ${max} characters`
    }
  }
  
  // Number range validation
  if (typeof value === 'number') {
    if (min !== undefined && value < min) {
      return customMessage || `Minimum value is ${min}`
    }
    if (max !== undefined && value > max) {
      return customMessage || `Maximum value is ${max}`
    }
  }
  
  // Array length validation
  if (Array.isArray(value)) {
    if (min !== undefined && value.length < min) {
      return customMessage || `Minimum ${min} items required`
    }
    if (max !== undefined && value.length > max) {
      return customMessage || `Maximum ${max} items allowed`
    }
  }
  
  return null
}

/**
 * Validate a single value against a rule
 * @param value - Value to validate
 * @param rule - Validation rule to apply
 * @param allValues - All form values for cross-field validation
 * @returns Error message string if validation fails, null if passes
 */
export async function validateRule(
  value: unknown,
  rule: FormRule,
  allValues?: FormValues
): Promise<string | null> {
  // Skip validation if value is empty and not required
  if (!rule.required && isEmpty(value)) {
    return null
  }
  
  // Transform value if needed
  const transformedValue = rule.transform ? rule.transform(value) : value
  
  // Required validation
  if (rule.required && isEmpty(transformedValue)) {
    return rule.message || 'This field is required'
  }
  
  // Type validation
  if (rule.type && !isEmpty(transformedValue)) {
    const typeError = validateType(transformedValue, rule.type, rule.message)
    if (typeError) return typeError
  }
  
  // Min/Max validation based on value type
  if (!isEmpty(transformedValue)) {
    const rangeError = validateRange(transformedValue, rule.min, rule.max, rule.message)
    if (rangeError) return rangeError
  }
  
  // Pattern validation
  if (rule.pattern && typeof transformedValue === 'string') {
    if (!rule.pattern.test(transformedValue)) {
      return rule.message || 'Value does not match the required pattern'
    }
  }
  
  // Custom validator
  if (rule.validator) {
    try {
      const result = await rule.validator(transformedValue, allValues)
      if (result === false) {
        return rule.message || 'Validation failed'
      }
      if (typeof result === 'string') {
        return result
      }
    } catch {
      return rule.message || 'Validation error occurred'
    }
  }
  
  return null
}

/**
 * Validate a field against its rules
 */
export async function validateField(
  fieldName: string,
  value: unknown,
  rules: FormRule | FormRule[] | undefined,
  allValues?: FormValues
): Promise<string | null> {
  if (!rules) {
    return null
  }
  
  const ruleArray = Array.isArray(rules) ? rules : [rules]
  
  for (const rule of ruleArray) {
    const error = await validateRule(value, rule, allValues)
    if (error) {
      return error
    }
  }
  
  return null
}

/**
 * Validate entire form
 */
export async function validateForm(
  values: FormValues,
  rules: FormRules
): Promise<FormValidationResult> {
  const errors: FormError[] = []
  
  // Validate all fields with rules
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = values[fieldName]
    const error = await validateField(fieldName, value, fieldRules, values)
    
    if (error) {
      errors.push({
        field: fieldName,
        message: error,
      })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get error message for a specific field
 */
export function getFieldError(
  fieldName: string,
  errors: FormError[]
): string | undefined {
  const error = errors.find(e => e.field === fieldName)
  return error?.message
}

/**
 * Clear errors for specific fields
 */
export function clearFieldErrors(
  fieldNames: string | string[],
  errors: FormError[]
): FormError[] {
  const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
  return errors.filter(error => !fields.includes(error.field))
}

/**
 * Check if form has errors
 */
export function hasErrors(errors: FormError[]): boolean {
  return errors.length > 0
}

/**
 * Get all field names with errors
 */
export function getErrorFields(errors: FormError[]): string[] {
  return errors.map(error => error.field)
}
