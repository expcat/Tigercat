/**
 * Schema-driven form types. Extends Form / FormItem / FormWizard patterns:
 * field defs, layout groups, validation rules, and value mapping.
 */

import type {
  FormConditions,
  FormFieldCondition,
  FormProps,
  FormRule,
  FormRules,
  FormSubmitEvent,
  FormValues
} from './form'
import type { TigerLocaleSchemaForm } from './locale'

/**
 * Built-in widgets SchemaForm can render. Unknown types need a field slot /
 * `renderField`. This is not a form designer.
 */
export type SchemaFormWidgetType =
  'input' | 'textarea' | 'number' | 'password' | 'select' | 'checkbox' | 'switch' | 'radio'

/**
 * Select / radio option.
 */
export interface SchemaFormOption {
  label: string
  value: string | number
  disabled?: boolean
}

/**
 * One schema field. `name` is the form-model path (dotted paths nest).
 */
export interface SchemaFormField {
  /**
   * Form model path. Dotted paths write nested objects (`address.city`).
   */
  name: string
  /**
   * Field label passed to FormItem.
   */
  label?: string
  /**
   * Widget to render. @default 'input'
   */
  type?: SchemaFormWidgetType
  /**
   * Placeholder for text / number / select widgets.
   */
  placeholder?: string
  /**
   * Extra hint under the control.
   */
  extra?: string
  /**
   * Marks the field required and adds a required rule when none exists.
   */
  required?: boolean
  /**
   * Disables the widget. Form-level `disabled` still wins.
   */
  disabled?: boolean
  /**
   * Skip this field in layout, rules, and mapping.
   */
  hidden?: boolean
  /**
   * Seed value when the model has no key.
   */
  defaultValue?: unknown
  /**
   * Validation rules merged into Form `rules[name]`.
   */
  rules?: FormRule | FormRule[]
  /**
   * Conditional show / disable / required. Same DSL as FormItem `condition`.
   */
  condition?: FormFieldCondition
  /**
   * Options for `select` and `radio`.
   */
  options?: SchemaFormOption[]
  /**
   * Column span inside the group's grid (1–3). Clamped to the group columns.
   * @default 1
   */
  span?: 1 | 2 | 3
  /**
   * Minimum for `number` widgets.
   */
  min?: number
  /**
   * Maximum for `number` widgets.
   */
  max?: number
  /**
   * Source / output path for value mapping. Defaults to `name`.
   */
  valuePath?: string
  /**
   * Map a source value onto the form model.
   */
  mapIn?: (raw: unknown) => unknown
  /**
   * Map a form-model value onto the output object.
   */
  mapOut?: (value: unknown) => unknown
}

/**
 * Layout group. Nested `groups` render as subsections.
 */
export interface SchemaFormGroup {
  /**
   * Stable key. Generated from title / index when omitted.
   */
  key?: string
  /**
   * Visible group heading.
   */
  title?: string
  /**
   * Visible group description.
   */
  description?: string
  /**
   * Grid columns for this group's fields.
   * @default 1
   */
  columns?: 1 | 2 | 3
  /**
   * Fields in this group.
   */
  fields?: SchemaFormField[]
  /**
   * Nested groups rendered under this group.
   */
  groups?: SchemaFormGroup[]
}

/**
 * Schema Form configuration. Ungrouped `fields` render as the first group.
 */
export interface SchemaFormSchema {
  /**
   * Ungrouped fields. Rendered before `groups`.
   */
  fields?: SchemaFormField[]
  /**
   * Layout groups (may nest).
   */
  groups?: SchemaFormGroup[]
  /**
   * Default columns for ungrouped fields.
   * @default 1
   */
  columns?: 1 | 2 | 3
}

/**
 * Flattened group used by Vue/React to render layout.
 */
export interface SchemaFormLayoutGroup {
  key: string
  title?: string
  description?: string
  columns: 1 | 2 | 3
  fields: SchemaFormField[]
  groups: SchemaFormLayoutGroup[]
}

/**
 * Submit payload. `values` is the form model; `mapped` is `mapOut` applied.
 */
export interface SchemaFormSubmitEvent extends FormSubmitEvent {
  mapped: FormValues
}

/**
 * Shared SchemaForm props. Vue binds `model` / `update:model` like Form.
 */
export interface SchemaFormProps extends Pick<
  FormProps,
  | 'labelWidth'
  | 'labelPosition'
  | 'labelAlign'
  | 'size'
  | 'inlineMessage'
  | 'showRequiredAsterisk'
  | 'disabled'
  | 'loading'
  | 'validateDebounce'
  | 'locale'
> {
  /**
   * Field / group schema.
   */
  schema: SchemaFormSchema
  /**
   * Form values. Controlled when passed (including `{}`).
   */
  model?: FormValues
  /**
   * Uncontrolled initial values, merged over schema defaults.
   */
  defaultModel?: FormValues
  /**
   * Extra rules merged over schema-derived rules (caller wins on conflict).
   */
  rules?: FormRules
  /**
   * Extra conditions merged over schema-derived conditions.
   */
  conditions?: FormConditions
  /**
   * Show submit / reset actions.
   * @default true
   */
  showActions?: boolean
  /**
   * Submit button text. Falls back to locale.
   */
  submitText?: string
  /**
   * Reset button text. Falls back to locale.
   */
  resetText?: string
  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  labels?: Partial<TigerLocaleSchemaForm>
  /**
   * Accessible name for the form region.
   */
  ariaLabel?: string
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, unknown>
  /**
   * Emits the form model after an edit.
   */
  onChange?: (values: FormValues) => void
  /**
   * Emits after validate-on-submit. `mapped` applies value mapping.
   */
  onSubmit?: (event: SchemaFormSubmitEvent) => void
  /**
   * Emits after reset.
   */
  onReset?: () => void
}
