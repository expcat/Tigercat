/**
 * Generic component type interfaces
 *
 * Provides type-safe generic variants of core data components.
 * These extend the base props with generic type parameter <T>
 * for type-safe column definitions, data access, and rendering.
 *
 * @module generics
 */

import type { FormRuleTrigger, FormRuleType } from './form'
import type { SelectOption, SelectOptionGroup, SelectProps } from './select'

// ---------------------------------------------------------------------------
// Select<T> generics
// ---------------------------------------------------------------------------

/**
 * A Select option whose value is constrained to T.
 */
export type GenericSelectOption<T extends string | number = string | number> = Omit<
  SelectOption,
  'value'
> & {
  value: T
}

/**
 * A Select option group.
 */
export type GenericSelectOptionGroup<T extends string | number = string | number> = Omit<
  SelectOptionGroup,
  'options'
> & {
  options: GenericSelectOption<T>[]
}

/**
 * Generic Select props with type-safe value/options. Same contract as {@link SelectProps}.
 *
 * @example
 * ```ts
 * const props: GenericSelectProps<number> = {
 *   options: [
 *     { value: 1, label: 'One' },
 *     { value: 2, label: 'Two' }
 *   ]
 * }
 * ```
 */
export interface GenericSelectProps<T extends string | number = string | number> extends Omit<
  SelectProps,
  'options' | 'value' | 'defaultValue'
> {
  options?: Array<GenericSelectOption<T> | GenericSelectOptionGroup<T>>
  value?: T | T[]
  defaultValue?: T | T[]
}

// ---------------------------------------------------------------------------
// FormField<T> generics
// ---------------------------------------------------------------------------

/**
 * Generic form validation rule.
 *
 * The generic parameter constrains the `validator` callback to the
 * expected field value type.
 */
export interface GenericFormRule<T = unknown> {
  /** Rule type */
  type?: FormRuleType
  /** Whether required @default false */
  required?: boolean
  /** Min length/value/items */
  min?: number
  /** Max length/value/items */
  max?: number
  /** Regex pattern */
  pattern?: RegExp
  /** Typed validator */
  validator?: (
    value: T,
    values?: Record<string, unknown>
  ) => boolean | string | Promise<boolean | string>
  /** Error message */
  message?: string
  /** Trigger @default ['change','blur'] */
  trigger?: FormRuleTrigger | FormRuleTrigger[]
  /** Transform before validation */
  transform?: (value: T) => T
}

/**
 * Generic form field props.
 *
 * @example
 * ```ts
 * const emailField: GenericFormFieldProps<string> = {
 *   name: 'email',
 *   label: 'Email',
 *   rules: [{ type: 'email', required: true, message: 'Enter a valid email' }]
 * }
 * ```
 */
export interface GenericFormFieldProps<T = unknown> {
  /** Field name (key in form model) */
  name?: string
  /** Label text */
  label?: string
  /** Label width */
  labelWidth?: string | number
  /** Whether required */
  required?: boolean
  /** Validation rules */
  rules?: GenericFormRule<T> | GenericFormRule<T>[]
  /** Controlled error message */
  error?: string
  /** Show validation message @default true */
  showMessage?: boolean
  /** Field size */
  size?: 'sm' | 'md' | 'lg'
}
