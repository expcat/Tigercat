/**
 * Form validation utilities
 */

import type {
  FormRule,
  FormRules,
  FormValues,
  FormError,
  FormValidationResult,
  FormRuleTrigger,
  FormRuleType
} from '../types/form'
import type { TigerLocaleFormValidation } from '../types/locale'
import { DEFAULT_FORM_VALIDATION_LABELS } from './locale-utils'

export type FormValidationPreset = Extract<FormRuleType, 'email' | 'phone' | 'url' | 'id-card'>

/**
 * Fully-resolved set of built-in validation messages. Obtain one via
 * `getFormValidationLabels(locale)` and pass it to the validate* functions to
 * localize the default messages. Defaults to English when omitted.
 */
export type FormValidationMessages = Required<TigerLocaleFormValidation>

export interface FormValidationDebouncerOptions {
  delay?: number
  setTimer?: (callback: () => void, delay: number) => number
  clearTimer?: (handle: number) => void
}

export interface FormValidationDebouncer {
  schedule: (fieldName: string, validate: () => Promise<void> | void) => Promise<void>
  flush: (fieldName?: string) => Promise<void>
  cancel: (fieldName?: string) => void
  isPending: (fieldName?: string) => boolean
}

interface PendingValidation {
  timerHandle: number
  validate: () => Promise<void> | void
  resolveCallbacks: Array<() => void>
  rejectCallbacks: Array<(error: unknown) => void>
}

export function getValueByPath(values: FormValues | undefined, path: string): unknown {
  if (!values || !path) {
    return undefined
  }

  if (!path.includes('.')) {
    return values[path]
  }

  const segments = path.split('.').filter(Boolean)
  let current: unknown = values

  for (const segment of segments) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined
    }

    const record = current as Record<string, unknown>
    current = record[segment]
  }

  return current
}

/**
 * Email validation pattern (RFC 5322 compliant)
 */
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const PHONE_PATTERN = /^\+?[0-9][0-9\s\-()]{6,19}$/

/**
 * URL validation pattern (supports http and https)
 */
const URL_PATTERN =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/

const ID_CARD_PATTERN = /^(\d{15}|\d{17}[0-9Xx])$/

export const FORM_VALIDATION_PRESETS: Record<FormValidationPreset, FormRule> = {
  email: { type: 'email' },
  phone: { type: 'phone' },
  url: { type: 'url' },
  'id-card': { type: 'id-card' }
}

export function createFormValidationRule(
  preset: FormValidationPreset,
  overrides: FormRule = {}
): FormRule {
  return {
    ...FORM_VALIDATION_PRESETS[preset],
    ...overrides
  }
}

export function createFormValidationDebouncer(
  options: FormValidationDebouncerOptions = {}
): FormValidationDebouncer {
  const delay = Number.isFinite(options.delay) && (options.delay ?? 0) > 0 ? options.delay! : 0
  const setTimer =
    options.setTimer ?? ((callback, timeout) => globalThis.setTimeout(callback, timeout))
  const clearTimer = options.clearTimer ?? ((handle) => globalThis.clearTimeout(handle))
  const pending = new Map<string, PendingValidation>()

  const runPending = async (fieldName: string): Promise<void> => {
    const entry = pending.get(fieldName)
    if (!entry) return

    pending.delete(fieldName)
    clearTimer(entry.timerHandle)

    try {
      await entry.validate()
      entry.resolveCallbacks.forEach((resolve) => resolve())
    } catch (error) {
      entry.rejectCallbacks.forEach((reject) => reject(error))
    }
  }

  const cancel = (fieldName?: string): void => {
    const fieldNames = fieldName ? [fieldName] : Array.from(pending.keys())

    for (const name of fieldNames) {
      const entry = pending.get(name)
      if (!entry) continue

      pending.delete(name)
      clearTimer(entry.timerHandle)
      entry.resolveCallbacks.forEach((resolve) => resolve())
    }
  }

  const flush = async (fieldName?: string): Promise<void> => {
    const fieldNames = fieldName ? [fieldName] : Array.from(pending.keys())

    for (const name of fieldNames) {
      await runPending(name)
    }
  }

  const schedule = (fieldName: string, validate: () => Promise<void> | void): Promise<void> => {
    if (delay <= 0) {
      return Promise.resolve(validate())
    }

    return new Promise((resolve, reject) => {
      const existing = pending.get(fieldName)

      if (existing) {
        clearTimer(existing.timerHandle)
        existing.validate = validate
        existing.resolveCallbacks.push(resolve)
        existing.rejectCallbacks.push(reject)
        existing.timerHandle = setTimer(() => {
          void runPending(fieldName)
        }, delay)
        return
      }

      pending.set(fieldName, {
        timerHandle: setTimer(() => {
          void runPending(fieldName)
        }, delay),
        validate,
        resolveCallbacks: [resolve],
        rejectCallbacks: [reject]
      })
    })
  }

  return {
    schedule,
    flush,
    cancel,
    isPending: (fieldName?: string) => {
      return fieldName ? pending.has(fieldName) : pending.size > 0
    }
  }
}

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
  customMessage?: string,
  messages: FormValidationMessages = DEFAULT_FORM_VALIDATION_LABELS
): string | null {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return customMessage || messages.typeString
      }
      break
    case 'number':
      if (typeof value !== 'number' && isNaN(Number(value))) {
        return customMessage || messages.typeNumber
      }
      break
    case 'boolean':
      if (typeof value !== 'boolean') {
        return customMessage || messages.typeBoolean
      }
      break
    case 'array':
      if (!Array.isArray(value)) {
        return customMessage || messages.typeArray
      }
      break
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return customMessage || messages.typeObject
      }
      break
    case 'email':
      if (typeof value === 'string' && !EMAIL_PATTERN.test(value)) {
        return customMessage || messages.email
      }
      break
    case 'phone':
      if (typeof value === 'string') {
        const digits = value.replace(/\D/g, '')
        if (!PHONE_PATTERN.test(value) || digits.length < 7) {
          return customMessage || messages.phone
        }
      }
      break
    case 'url':
      if (typeof value === 'string' && !URL_PATTERN.test(value)) {
        return customMessage || messages.url
      }
      break
    case 'date':
      if (!(value instanceof Date) && isNaN(Date.parse(String(value)))) {
        return customMessage || messages.date
      }
      break
    case 'id-card':
      if (typeof value === 'string' && !ID_CARD_PATTERN.test(value)) {
        return customMessage || messages.idCard
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
  customMessage?: string,
  messages: FormValidationMessages = DEFAULT_FORM_VALIDATION_LABELS
): string | null {
  // String length validation
  if (typeof value === 'string') {
    if (min !== undefined && value.length < min) {
      return customMessage || messages.minLength.replace('{min}', String(min))
    }
    if (max !== undefined && value.length > max) {
      return customMessage || messages.maxLength.replace('{max}', String(max))
    }
  }

  // Number range validation
  if (typeof value === 'number') {
    if (min !== undefined && value < min) {
      return customMessage || messages.minValue.replace('{min}', String(min))
    }
    if (max !== undefined && value > max) {
      return customMessage || messages.maxValue.replace('{max}', String(max))
    }
  }

  // Array length validation
  if (Array.isArray(value)) {
    if (min !== undefined && value.length < min) {
      return customMessage || messages.minItems.replace('{min}', String(min))
    }
    if (max !== undefined && value.length > max) {
      return customMessage || messages.maxItems.replace('{max}', String(max))
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
  allValues?: FormValues,
  messages: FormValidationMessages = DEFAULT_FORM_VALIDATION_LABELS
): Promise<string | null> {
  // Skip validation if value is empty and not required
  if (!rule.required && isEmpty(value)) {
    return null
  }

  // Transform value if needed
  const transformedValue = rule.transform ? rule.transform(value) : value

  // Required validation
  if (rule.required && isEmpty(transformedValue)) {
    return rule.message || messages.required
  }

  // Type validation
  if (rule.type && !isEmpty(transformedValue)) {
    const typeError = validateType(transformedValue, rule.type, rule.message, messages)
    if (typeError) return typeError
  }

  // Min/Max validation based on value type
  if (!isEmpty(transformedValue)) {
    const rangeError = validateRange(transformedValue, rule.min, rule.max, rule.message, messages)
    if (rangeError) return rangeError
  }

  // Pattern validation
  if (rule.pattern && typeof transformedValue === 'string') {
    if (!rule.pattern.test(transformedValue)) {
      return rule.message || messages.patternMismatch
    }
  }

  // Custom validator
  if (rule.validator) {
    try {
      const result = await rule.validator(transformedValue, allValues)
      if (result === false) {
        return rule.message || messages.validatorFailed
      }
      if (typeof result === 'string') {
        return result
      }
    } catch {
      return rule.message || messages.validatorError
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
  allValues?: FormValues,
  trigger?: FormRuleTrigger,
  messages: FormValidationMessages = DEFAULT_FORM_VALIDATION_LABELS
): Promise<string | null> {
  if (!rules) {
    return null
  }

  const ruleArray = Array.isArray(rules) ? rules : [rules]
  const defaultTriggers: FormRuleTrigger[] = ['change', 'blur']

  for (const rule of ruleArray) {
    if (trigger) {
      const ruleTriggers = rule.trigger
        ? Array.isArray(rule.trigger)
          ? rule.trigger
          : [rule.trigger]
        : defaultTriggers

      if (!ruleTriggers.includes(trigger)) {
        continue
      }
    }

    const error = await validateRule(value, rule, allValues, messages)
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
  rules: FormRules,
  messages: FormValidationMessages = DEFAULT_FORM_VALIDATION_LABELS
): Promise<FormValidationResult> {
  const errors: FormError[] = []

  // Validate all fields with rules
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = getValueByPath(values, fieldName)
    const error = await validateField(fieldName, value, fieldRules, values, undefined, messages)

    if (error) {
      errors.push({
        field: fieldName,
        message: error
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export async function validateFormFields(
  values: FormValues,
  rules: FormRules,
  fieldNames: string[],
  trigger?: FormRuleTrigger,
  messages: FormValidationMessages = DEFAULT_FORM_VALIDATION_LABELS
): Promise<FormValidationResult> {
  const errors: FormError[] = []
  const uniqueFieldNames = Array.from(new Set(fieldNames))

  for (const fieldName of uniqueFieldNames) {
    const fieldRules = rules[fieldName]
    if (!fieldRules) continue

    const value = getValueByPath(values, fieldName)
    const error = await validateField(fieldName, value, fieldRules, values, trigger, messages)

    if (error) {
      errors.push({ field: fieldName, message: error })
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get error message for a specific field
 */
export function getFieldError(fieldName: string, errors: FormError[]): string | undefined {
  const error = errors.find((e) => e.field === fieldName)
  return error?.message
}

/**
 * Build an O(1) lookup table for field errors.
 */
export function createFormErrorMap(errors: readonly FormError[]): Record<string, string> {
  const errorMap: Record<string, string> = {}

  for (const error of errors) {
    errorMap[error.field] = error.message
  }

  return errorMap
}

/**
 * Clear errors for specific fields
 */
export function clearFieldErrors(fieldNames: string | string[], errors: FormError[]): FormError[] {
  const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
  return errors.filter((error) => !fields.includes(error.field))
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
  return errors.map((error) => error.field)
}
