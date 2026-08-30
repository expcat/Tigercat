/**
 * Form component types and interfaces
 */

import type { ComponentSize } from './base'
import type { TigerLocale } from './locale'

/**
 * Supported form validation rule types
 */
export type FormRuleType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'id-card'

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
   * Rule type - determines the validation logic to apply.
   *
   * - `number` accepts finite numbers and numeric strings such as `'123'`
   *   (typical of form inputs). Booleans and arrays fail.
   * - `email` / `phone` / `url` / `id-card` require a string.
   * - `phone` is an international-ish pattern: optional leading `+`, at least
   *   7 digits.
   * - `id-card` is a mainland China 15- or 18-digit ID number.
   * - `date` rejects `Invalid Date` and non-date values.
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
   * Regular expression pattern to match against string values.
   * `/g` flags are copied before test so `lastIndex` cannot skip matches.
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
  validator?: (
    value: unknown,
    values?: Record<string, unknown>
  ) => boolean | string | Promise<boolean | string>

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
   * Transform the value for validation only. The stored model is not rewritten.
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
 * Operators supported by the Form conditional DSL.
 */
export type FormConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'truthy'
  | 'falsy'
  | 'empty'
  | 'notEmpty'
  | 'includes'
  | 'notIncludes'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'

/**
 * A single condition evaluated against the form model.
 */
export interface FormCondition {
  /** Field path to read from the form model. Supports dotted paths. */
  field: string
  /** Comparison operator. Defaults to `equals` when value is provided, otherwise `truthy`. */
  operator?: FormConditionOperator
  /** Comparison value for operators that need one. */
  value?: unknown
}

/**
 * One or more conditions. Arrays are evaluated with the field condition's `logic`.
 */
export type FormConditionInput = FormCondition | FormCondition[]

/**
 * How multiple conditions should be combined.
 */
export type FormConditionLogic = 'all' | 'any'

/**
 * Conditional behavior for a field.
 */
export interface FormFieldCondition {
  /** Show the field only when these conditions pass. */
  showWhen?: FormConditionInput
  /** Hide the field when these conditions pass. */
  hiddenWhen?: FormConditionInput
  /** Disable the field when these conditions pass. */
  disabledWhen?: FormConditionInput
  /** Enable the field only when these conditions pass. */
  enabledWhen?: FormConditionInput
  /** Treat the field as required when these conditions pass. */
  requiredWhen?: FormConditionInput
  /** Logic for array conditions. @default 'all' */
  logic?: FormConditionLogic
}

/**
 * Conditional behavior mapped by field name.
 */
export type FormConditions = Record<string, FormFieldCondition>

/**
 * Resolved conditional state for a field.
 */
export interface FormConditionState {
  shown: boolean
  disabled: boolean
  required: boolean
}

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
 * Text alignment of the field label.
 * `'top'` is not an alignment — use `labelPosition="top"` for stacked labels.
 */
export type FormLabelAlign = 'left' | 'right'

/**
 * Side of the control the label sits on.
 * `'left'` places the label before the control (default);
 * `'right'` places it after; `'top'` stacks it above.
 */
export type FormLabelPosition = 'left' | 'right' | 'top'

/**
 * Field dependency map. Plain objects are accepted (JSON / templates);
 * they are normalized to `Map` internally.
 */
export type FormFieldDependencies = Map<string, string[]> | Record<string, string[]>

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
   * Label position relative to the control
   * @default 'left'
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
  size?: ComponentSize

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

  /**
   * Whether the form is in a loading state (prevents submit)
   * @default false
   */
  loading?: boolean

  /**
   * Headless controller from `useFormController` / `createFormEngine`.
   * When set, the controller owns values, errors, validation, and history;
   * `model` / `onChange` are not used as the store.
   */
  controller?: FormController

  /**
   * Field dependency map: key is the dependent field, value is array of fields it depends on.
   * When a dependency changes, the dependent field is re-validated.
   * Accepts a `Map` or a plain object.
   */
  fieldDependencies?: FormFieldDependencies

  /**
   * Conditional field behavior DSL for visibility, disabled state, and dynamic required rules.
   */
  conditions?: FormConditions

  /**
   * Debounce delay for change-triggered field validation in milliseconds.
   * Blur, submit, and imperative validation still run immediately.
   * @default 0
   */
  validateDebounce?: number

  /**
   * Enable undo/redo for form values
   * @default false
   */
  undoable?: boolean

  /**
   * Maximum undo history size
   * @default 50
   */
  maxHistorySize?: number

  /**
   * Locale override for built-in validation messages. Merged on top of the
   * ConfigProvider locale; a per-rule `message` still takes precedence.
   */
  locale?: Partial<TigerLocale>
}

/**
 * Error display mode for form items
 */
export type FormErrorDisplayMode = 'inline' | 'popup' | 'block'

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
  size?: ComponentSize

  /**
   * Error display mode
   * - 'inline': shows error below the field (default)
   * - 'popup': shows error in an anchored popup on hover or focus
   * - 'block': shows error in a block-level alert
   * @default 'inline'
   */
  errorDisplayMode?: FormErrorDisplayMode

  /**
   * Conditional behavior for this field. Merged over form-level `conditions[name]`.
   */
  condition?: FormFieldCondition
}

// ---------------------------------------------------------------------------
// FormController — headless imperative form API (v1.2.0)
// ---------------------------------------------------------------------------

/**
 * Options for creating a form controller.
 */
export interface FormControllerOptions {
  /** Initial form values */
  initialValues?: FormValues
  /** Validation rules */
  rules?: FormRules
  /** Conditional field behavior */
  conditions?: FormConditions
  /** Field dependency map for cross-field validation. `Map` or plain object. */
  fieldDependencies?: FormFieldDependencies
  /** Debounce delay for change-triggered validation in milliseconds */
  validateDebounce?: number
  /** Locale override for built-in validation messages */
  locale?: Partial<TigerLocale>
  /** Enable undo/redo history */
  undoable?: boolean
  /** Maximum undo history size @default 50 */
  maxHistorySize?: number
}

/**
 * Imperative form handle exposed on `<Form>` refs.
 */
export interface FormHandle {
  validate: () => Promise<boolean>
  validateFields: (fieldNames: string[]) => Promise<boolean>
  validateField: (
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    trigger?: FormRuleTrigger
  ) => Promise<void>
  clearValidate: (fieldNames?: string | string[]) => void
  resetFields: () => void
  addField: (fieldName: string, defaultValue?: unknown) => void
  removeField: (fieldName: string) => void
  undo: () => void
  redo: () => void
  snapshotHistory: () => void
  readonly canUndo: boolean
  readonly canRedo: boolean
}

/**
 * Payload emitted when a form is submitted.
 */
export interface FormSubmitEvent {
  valid: boolean
  values: FormValues
  errors: FormError[]
}

/**
 * Headless form controller returned by `useFormController` / `createFormEngine`.
 *
 * Pass it to `<Form controller={ctrl}>` so the rendered form and the hook
 * share one values/errors store. `resetFields` on Form is `reset` on the hook.
 */
export interface FormController {
  /** Current form values (reactive in Vue, state snapshot in React) */
  readonly values: FormValues
  /** Current validation errors */
  readonly errors: FormError[]
  /** Error lookup by field name */
  readonly errorsByField: Record<string, string | undefined>
  /** Whether the form has any errors */
  readonly hasErrors: boolean
  /** Set a single field value (dotted paths write nested objects) */
  setFieldValue: (fieldName: string, value: unknown) => void
  /** Set multiple field values at once */
  setValues: (values: Partial<FormValues>) => void
  /** Get a single field value (supports dotted path) */
  getFieldValue: (fieldName: string) => unknown
  /** Validate the entire form */
  validate: () => Promise<boolean>
  /** Validate specific fields */
  validateFields: (fieldNames: string[]) => Promise<boolean>
  /** Validate a single field */
  validateField: (
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    trigger?: FormRuleTrigger
  ) => Promise<string | null>
  /** Clear validation errors */
  clearValidate: (fieldNames?: string | string[]) => void
  /** Reset all values to initial and clear errors */
  reset: () => void
  /** Alias of `reset` for Form handles */
  resetFields: () => void
  /** Add a top-level field */
  addField: (fieldName: string, defaultValue?: unknown) => void
  /** Remove a top-level field */
  removeField: (fieldName: string) => void
  /** Undo last change (if undoable) */
  undo: () => void
  /** Redo last undone change (if undoable) */
  redo: () => void
  /** Push the current values onto the undo stack (undoable forms also snapshot on every commit) */
  snapshotHistory: () => void
  /** Whether undo is available */
  readonly canUndo: boolean
  /** Whether redo is available */
  readonly canRedo: boolean
  /** Subscribe to values/errors/history updates */
  subscribe: (listener: () => void) => () => void
  /** Register per-item rules (FormItem). Pass `undefined` to unregister. */
  registerFieldRules: (fieldName: string, rules?: FormRule | FormRule[]) => void
  /** Register per-item condition (FormItem). Pass `undefined` to unregister. */
  registerFieldCondition: (fieldName: string, condition?: FormFieldCondition) => void
  /** Resolved visibility / disabled / required for a field */
  getFieldConditionState: (
    fieldName: string,
    conditionOverride?: FormFieldCondition
  ) => FormConditionState
}
