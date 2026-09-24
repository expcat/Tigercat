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
import { enUS } from './i18n/locales/en-US'


export type FormValidationPreset = Extract<FormRuleType, 'email' | 'phone' | 'url' | 'id-card'>

/**
 * Fully-resolved set of built-in validation messages. Obtain one via
 * `getFormValidationLabels(locale)` and pass it to the validate* functions to
 * localize the default messages. Defaults to English when omitted.
 */
export type FormValidationMessages = Required<TigerLocaleFormValidation>

const ENGLISH_VALIDATION_MESSAGES = enUS.formValidation as FormValidationMessages

export interface FormValidationDebouncerOptions {
  delay?: number
  setTimer?: (callback: () => void, delay: number) => number
  clearTimer?: (handle: number) => void
}

export interface FormValidationDebouncer {
  /** Wait until `validate` settles; its return value is discarded. */
  schedule: (fieldName: string, validate: () => unknown) => Promise<void>
  flush: (fieldName?: string) => Promise<void>
  cancel: (fieldName?: string) => void
  isPending: (fieldName?: string) => boolean
}

interface PendingValidation {
  timerHandle: number
  validate: () => unknown
  resolveCallbacks: Array<() => void>
  rejectCallbacks: Array<(error: unknown) => void>
}

const BLOCKED_PATH_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype'])

function readPathSegments(path: string): string[] | null {
  const segments = path.split('.').filter(Boolean)
  if (segments.length === 0) return null
  if (segments.some((segment) => BLOCKED_PATH_SEGMENTS.has(segment))) return null
  return segments
}

export function getValueByPath(values: FormValues | undefined, path: string): unknown {
  if (!values || !path) {
    return undefined
  }

  const segments = readPathSegments(path)
  if (!segments) return undefined

  let current: unknown = values
  for (const segment of segments) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined
    }

    const record = current as Record<string, unknown>
    if (!Object.prototype.hasOwnProperty.call(record, segment)) {
      return undefined
    }
    current = record[segment]
  }

  return current
}

/**
 * Immutable nested write paired with `getValueByPath`.
 * Missing intermediate objects are created as plain records.
 */
export function setValueByPath(values: FormValues, path: string, value: unknown): FormValues {
  if (!path) {
    return values
  }

  const segments = readPathSegments(path)
  if (!segments) {
    return values
  }

  if (segments.length === 1) {
    return { ...values, [segments[0]]: value }
  }

  const clone: FormValues = { ...values }
  let cursor: Record<string, unknown> = clone

  for (let i = 0; i < segments.length; i++) {
    const key = segments[i]
    const isLast = i === segments.length - 1

    if (isLast) {
      cursor[key] = value
      break
    }

    const existing = cursor[key]
    const next =
      existing && typeof existing === 'object' && !Array.isArray(existing)
        ? { ...(existing as Record<string, unknown>) }
        : {}

    cursor[key] = next
    cursor = next
  }

  return clone
}

/**
 * Deep clone form values for history snapshots. Nested objects are not shared
 * with the live model, so in-place edits cannot mutate the past.
 */
function cloneUnknown(value: unknown): unknown {
  if (value instanceof Date) {
    return new Date(value.getTime())
  }
  if (Array.isArray(value)) {
    return value.map(cloneUnknown)
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      result[key] = cloneUnknown(nested)
    }
    return result
  }
  return value
}

export function cloneFormValues(values: FormValues): FormValues {
  try {
    return structuredClone(values)
  } catch {
    return cloneUnknown(values) as FormValues
  }
}

/** Structural equality for form models. Same contents do not enter undo history. */
export function formValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (left === null || right === null || left === undefined || right === undefined) return false
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    return left.every((item, index) => formValuesEqual(item, right[index]))
  }
  if (typeof left === 'object' && typeof right === 'object') {
    const leftRecord = left as Record<string, unknown>
    const rightRecord = right as Record<string, unknown>
    const leftKeys = Object.keys(leftRecord)
    const rightKeys = Object.keys(rightRecord)
    if (leftKeys.length !== rightKeys.length) return false
    return leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(rightRecord, key) &&
        formValuesEqual(leftRecord[key], rightRecord[key])
    )
  }
  return false
}

/**
 * Copy `next` onto a live (often reactive) target: drop keys that disappeared,
 * then assign. Used by Vue Form to keep a writable model in sync.
 */
export function assignFormValues(target: FormValues, next: FormValues): void {
  for (const key of Object.keys(target)) {
    if (!Object.prototype.hasOwnProperty.call(next, key)) {
      delete target[key]
    }
  }
  Object.assign(target, next)
}

/**
 * Dot-atom mailbox. Local part has no leading, trailing, or repeated dots.
 * Domain has at least one dot. This is not a full RFC 5322 parser.
 */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9_%+-]+(?:\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/

const PHONE_PATTERN = /^\+?[0-9][0-9\s\-()]{6,19}$/

const ID_CARD_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
const ID_CARD_CHECK = '10X98765432'
const DATE_TEXT = /^(\d{4})-(\d{2})-(\d{2})$/

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

/**
 * Thrown when a pending debounced validation is cancelled. Callers that
 * `await schedule()` should treat this as "did not run", not as valid.
 */
export class FormValidationCancelledError extends Error {
  readonly name = 'FormValidationCancelledError'

  constructor() {
    super('Form validation cancelled')
  }
}

export function isFormValidationCancelled(error: unknown): boolean {
  return error instanceof FormValidationCancelledError
}

/**
 * Thrown when a newer `validate()` starts before this one finishes.
 * Callers can tell a cancelled run from a passing one: pass resolves `true`.
 */
export class FormValidationSupersededError extends Error {
  readonly name = 'FormValidationSupersededError'

  constructor() {
    super('Form validation superseded')
  }
}

export function isFormValidationSuperseded(error: unknown): boolean {
  return error instanceof FormValidationSupersededError
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
      const error = new FormValidationCancelledError()
      entry.rejectCallbacks.forEach((reject) => reject(error))
    }
  }

  const flush = async (fieldName?: string): Promise<void> => {
    const fieldNames = fieldName ? [fieldName] : Array.from(pending.keys())

    for (const name of fieldNames) {
      await runPending(name)
    }
  }

  const schedule = (fieldName: string, validate: () => unknown): Promise<void> => {
    if (delay <= 0) {
      try {
        return Promise.resolve(validate()).then(() => undefined)
      } catch (error) {
        return Promise.reject(error)
      }
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
 * - empty string and whitespace-only strings
 * - empty array ([])
 * Objects (even empty ones) are NOT considered empty by this function,
 * as they may contain properties that need to be validated separately.
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

/**
 * Finite number, or a non-empty numeric string (`'123'`). Booleans and arrays
 * fail even though `Number(true)` / `Number([])` are numeric.
 */
/**
 * Finite number, or a numeric string. Empty, blank, booleans, and `null`
 * are not numbers — `Number('')` is 0 and must not count.
 */
export function readFiniteFormNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function isNumericFormValue(value: unknown): boolean {
  return readFiniteFormNumber(value) !== null
}

function isValidPhoneValue(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return PHONE_PATTERN.test(value) && digits.length >= 7
}

function isRealCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

/**
 * A `Date`, or one `YYYY-MM-DD` calendar day. Other text is rejected.
 */
function isValidDateValue(value: unknown): boolean {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime())
  }
  if (typeof value !== 'string') return false
  const match = DATE_TEXT.exec(value)
  if (!match) return false
  return isRealCalendarDate(Number(match[1]), Number(match[2]), Number(match[3]))
}

/**
 * http(s) URL. Host may be localhost, a dotted name, or IPv4.
 */
function isValidHttpUrlValue(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  const host = url.hostname
  if (!host) return false
  if (host === 'localhost') return true
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return host.split('.').every((part) => {
      const octet = Number(part)
      return octet >= 0 && octet <= 255
    })
  }
  return host.includes('.')
}

/** 18-digit resident identity number: calendar birth date and MOD 11-2 check digit. */
function isValidIdCardValue(value: string): boolean {
  if (!/^\d{17}[\dXx]$/.test(value)) return false
  const year = Number(value.slice(6, 10))
  const month = Number(value.slice(10, 12))
  const day = Number(value.slice(12, 14))
  if (!isRealCalendarDate(year, month, day)) return false
  let sum = 0
  for (let i = 0; i < 17; i++) sum += Number(value[i]) * ID_CARD_WEIGHTS[i]
  return value[17].toUpperCase() === ID_CARD_CHECK[sum % 11]
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
  messages: FormValidationMessages = ENGLISH_VALIDATION_MESSAGES
): string | null {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return customMessage || messages.typeString
      }
      break
    case 'number':
      if (!isNumericFormValue(value)) {
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
      if (typeof value !== 'string' || !EMAIL_PATTERN.test(value)) {
        return customMessage || messages.email
      }
      break
    case 'phone':
      if (typeof value !== 'string' || !isValidPhoneValue(value)) {
        return customMessage || messages.phone
      }
      break
    case 'url':
      if (typeof value !== 'string' || !isValidHttpUrlValue(value)) {
        return customMessage || messages.url
      }
      break
    case 'date':
      if (!isValidDateValue(value)) {
        return customMessage || messages.date
      }
      break
    case 'id-card':
      if (typeof value !== 'string' || !isValidIdCardValue(value)) {
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
function numericRuleValue(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const numeric = Number(value.trim())
    return Number.isFinite(numeric) ? numeric : null
  }
  return null
}

function validateRange(
  value: unknown,
  min: number | undefined,
  max: number | undefined,
  customMessage?: string,
  messages: FormValidationMessages = ENGLISH_VALIDATION_MESSAGES,
  ruleType?: FormRule['type']
): string | null {
  if (ruleType === 'number') {
    const numeric = numericRuleValue(value)
    if (numeric === null) return null
    if (min !== undefined && numeric < min) {
      return customMessage || messages.minValue.replace('{min}', String(min))
    }
    if (max !== undefined && numeric > max) {
      return customMessage || messages.maxValue.replace('{max}', String(max))
    }
    return null
  }

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
  messages: FormValidationMessages = ENGLISH_VALIDATION_MESSAGES
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
    const rangeError = validateRange(
      transformedValue,
      rule.min,
      rule.max,
      rule.message,
      messages,
      rule.type
    )
    if (rangeError) return rangeError
  }

  // Pattern validation (`/g` lastIndex must not leak across calls)
  if (rule.pattern && typeof transformedValue === 'string') {
    const tester = new RegExp(rule.pattern.source, rule.pattern.flags)
    if (!tester.test(transformedValue)) {
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

function ruleList(rules: FormRule | FormRule[] | undefined): FormRule[] {
  if (!rules) return []
  return Array.isArray(rules) ? rules : [rules]
}

function ruleMatchesTrigger(rule: FormRule, trigger?: FormRuleTrigger): boolean {
  if (!trigger) return true
  const defaultTriggers: FormRuleTrigger[] = ['change', 'blur']
  const ruleTriggers = rule.trigger
    ? Array.isArray(rule.trigger)
      ? rule.trigger
      : [rule.trigger]
    : defaultTriggers
  return ruleTriggers.includes(trigger)
}

/**
 * Per-rule result for one pass.
 * `undefined` means the rule did not run (trigger skipped it).
 * `null` means it ran and passed. A string is the error it produced.
 */
export interface FieldRuleEvaluation {
  outcomes: Array<string | null | undefined>
}

export async function evaluateFieldRules(
  fieldName: string,
  value: unknown,
  rules: FormRule | FormRule[] | undefined,
  allValues?: FormValues,
  trigger?: FormRuleTrigger,
  messages: FormValidationMessages = ENGLISH_VALIDATION_MESSAGES
): Promise<FieldRuleEvaluation> {
  void fieldName
  const outcomes: Array<string | null | undefined> = []
  for (const rule of ruleList(rules)) {
    if (!ruleMatchesTrigger(rule, trigger)) {
      outcomes.push(undefined)
      continue
    }
    outcomes.push(await validateRule(value, rule, allValues, messages))
  }
  return { outcomes }
}

/** First error among rules that ran, or `null` when every ran rule passed. */
export function firstFieldRuleError(
  outcomes: ReadonlyArray<string | null | undefined>
): string | null {
  for (const outcome of outcomes) {
    if (typeof outcome === 'string') return outcome
  }
  return null
}

/**
 * Validate a field against its rules.
 * Skipped trigger rules are omitted from the returned message; the engine
 * keeps their previous errors separately.
 */
export async function validateField(
  fieldName: string,
  value: unknown,
  rules: FormRule | FormRule[] | undefined,
  allValues?: FormValues,
  trigger?: FormRuleTrigger,
  messages: FormValidationMessages = ENGLISH_VALIDATION_MESSAGES
): Promise<string | null> {
  const { outcomes } = await evaluateFieldRules(
    fieldName,
    value,
    rules,
    allValues,
    trigger,
    messages
  )
  return firstFieldRuleError(outcomes)
}

/**
 * Validate entire form
 */
export async function validateForm(
  values: FormValues,
  rules: FormRules,
  messages: FormValidationMessages = ENGLISH_VALIDATION_MESSAGES
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
  messages: FormValidationMessages = ENGLISH_VALIDATION_MESSAGES
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
