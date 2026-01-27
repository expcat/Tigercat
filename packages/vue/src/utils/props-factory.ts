import type { PropType } from 'vue'

/**
 * Factory functions for creating common Vue component props.
 * These reduce boilerplate while maintaining full type safety.
 */

/**
 * Creates a string prop with union type constraint
 */
export function stringProp<T extends string>(defaultValue: T) {
  return {
    type: String as PropType<T>,
    default: defaultValue
  }
}

/**
 * Creates an optional string prop
 */
export function optionalStringProp() {
  return {
    type: String,
    default: undefined
  }
}

/**
 * Creates a boolean prop with default false
 */
export function booleanProp(defaultValue = false) {
  return {
    type: Boolean,
    default: defaultValue
  }
}

/**
 * Creates a number prop with optional default
 */
export function numberProp(defaultValue?: number) {
  return {
    type: Number,
    default: defaultValue
  }
}

/**
 * Creates an optional object prop
 */
export function objectProp<T>() {
  return {
    type: Object as PropType<T>,
    default: undefined
  }
}

/**
 * Creates a required object prop
 */
export function requiredObjectProp<T>() {
  return {
    type: Object as PropType<T>,
    required: true as const
  }
}

/**
 * Creates an array prop with default empty array
 */
export function arrayProp<T>() {
  return {
    type: Array as PropType<T[]>,
    default: () => []
  }
}

/**
 * Creates a function prop
 */
export function functionProp<T extends (...args: unknown[]) => unknown>() {
  return {
    type: Function as PropType<T>,
    default: undefined
  }
}

/**
 * Common size prop (sm/md/lg)
 */
export function sizeProp<T extends string = 'sm' | 'md' | 'lg'>(defaultValue: T = 'md' as T) {
  return stringProp<T>(defaultValue)
}

/**
 * Common variant prop
 */
export function variantProp<T extends string>(defaultValue: T) {
  return stringProp<T>(defaultValue)
}

/**
 * Common disabled prop
 */
export const disabledProp = booleanProp(false)

/**
 * Common className prop
 */
export const classNameProp = optionalStringProp()

/**
 * Common style prop
 */
export function styleProp() {
  return objectProp<Record<string, unknown>>()
}

/**
 * Common nullable date prop
 */
export function nullableDateProp() {
  return {
    type: [Date, String, null] as PropType<Date | string | null>,
    default: null
  }
}

/**
 * Common nullable string prop
 */
export function nullableStringProp() {
  return {
    type: [String, null] as PropType<string | null>,
    default: null
  }
}
