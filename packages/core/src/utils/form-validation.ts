/**
 * Form validation utilities
 */

import type { FormRule, FormRules, FormValues, FormError, FormValidationResult } from '../types/form'

/**
 * Email validation pattern
 */
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * URL validation pattern
 */
const URL_PATTERN = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

/**
 * Validate a single value against a rule
 */
export async function validateRule(
  value: unknown,
  rule: FormRule,
  allValues?: FormValues
): Promise<string | null> {
  // Skip validation if value is empty and not required
  if (!rule.required && (value === '' || value === null || value === undefined)) {
    return null
  }
  
  // Transform value if needed
  const transformedValue = rule.transform ? rule.transform(value) : value
  
  // Required validation
  if (rule.required) {
    if (transformedValue === '' || transformedValue === null || transformedValue === undefined) {
      return rule.message || 'This field is required'
    }
    if (Array.isArray(transformedValue) && transformedValue.length === 0) {
      return rule.message || 'This field is required'
    }
  }
  
  // Type validation
  if (rule.type && transformedValue !== null && transformedValue !== undefined && transformedValue !== '') {
    switch (rule.type) {
      case 'string':
        if (typeof transformedValue !== 'string') {
          return rule.message || 'Value must be a string'
        }
        break
      case 'number':
        if (typeof transformedValue !== 'number' && isNaN(Number(transformedValue))) {
          return rule.message || 'Value must be a number'
        }
        break
      case 'boolean':
        if (typeof transformedValue !== 'boolean') {
          return rule.message || 'Value must be a boolean'
        }
        break
      case 'array':
        if (!Array.isArray(transformedValue)) {
          return rule.message || 'Value must be an array'
        }
        break
      case 'object':
        if (typeof transformedValue !== 'object' || Array.isArray(transformedValue)) {
          return rule.message || 'Value must be an object'
        }
        break
      case 'email':
        if (typeof transformedValue === 'string' && !EMAIL_PATTERN.test(transformedValue)) {
          return rule.message || 'Please enter a valid email address'
        }
        break
      case 'url':
        if (typeof transformedValue === 'string' && !URL_PATTERN.test(transformedValue)) {
          return rule.message || 'Please enter a valid URL'
        }
        break
      case 'date':
        if (!(transformedValue instanceof Date) && isNaN(Date.parse(String(transformedValue)))) {
          return rule.message || 'Please enter a valid date'
        }
        break
    }
  }
  
  // Min/Max validation for strings
  if (typeof transformedValue === 'string') {
    if (rule.min !== undefined && transformedValue.length < rule.min) {
      return rule.message || `Minimum length is ${rule.min} characters`
    }
    if (rule.max !== undefined && transformedValue.length > rule.max) {
      return rule.message || `Maximum length is ${rule.max} characters`
    }
  }
  
  // Min/Max validation for numbers
  if (typeof transformedValue === 'number') {
    if (rule.min !== undefined && transformedValue < rule.min) {
      return rule.message || `Minimum value is ${rule.min}`
    }
    if (rule.max !== undefined && transformedValue > rule.max) {
      return rule.message || `Maximum value is ${rule.max}`
    }
  }
  
  // Min/Max validation for arrays
  if (Array.isArray(transformedValue)) {
    if (rule.min !== undefined && transformedValue.length < rule.min) {
      return rule.message || `Minimum ${rule.min} items required`
    }
    if (rule.max !== undefined && transformedValue.length > rule.max) {
      return rule.message || `Maximum ${rule.max} items allowed`
    }
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
