/**
 * composeComponentClasses
 *
 * Framework-agnostic class composer that combines:
 * - any number of internal class fragments (string / number / falsy / Vue-style array/object)
 * - the consumer-facing `className` prop
 * - the framework-passed `class` attribute (Vue `attrs.class`)
 *
 * It accepts the same shapes as `classNames()` plus Vue's class object/array shapes
 * (which it normalizes via `coerceClassValue`). Falsy and zero values are filtered out.
 *
 * Designed to remove the repeated `classNames(..., props.className, coerceClassValue(attrs.class))`
 * boilerplate present in every Vue/React component.
 *
 * @example
 * // Vue
 * const classes = composeComponentClasses(
 *   buttonBaseClasses,
 *   variantClasses,
 *   props.disabled && buttonDisabledClasses,
 *   props.className,
 *   attrs.class
 * )
 *
 * @example
 * // React
 * const classes = composeComponentClasses(
 *   inputBaseClasses,
 *   sizeClasses[size],
 *   className
 * )
 */

import { classNames, type ClassValue } from './class-names'
import { coerceClassValue } from './coerce-class-value'

export type ComposableClassInput = ClassValue | unknown[] | Record<string, unknown> | unknown

export function composeComponentClasses(...inputs: ComposableClassInput[]): string {
  const out: ClassValue[] = []
  for (const item of inputs) {
    if (item == null || item === false || item === 0 || item === '') continue
    if (typeof item === 'string' || typeof item === 'number') {
      out.push(item)
      continue
    }
    const coerced = coerceClassValue(item)
    if (coerced) out.push(coerced)
  }
  return classNames(...out)
}
