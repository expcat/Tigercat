import { useCallback, useRef, useState } from 'react'

/**
 * Setter returned by {@link useControlledState}.
 *
 * Accepts either the next value or an updater `(prev) => next`. Extra arguments
 * are forwarded to `onChange` after the resolved value.
 *
 * A function argument is always an updater, so `T` itself cannot be a function.
 */
export type SetControlledState<T, Args extends unknown[] = []> = (
  next: T | ((prev: T) => T),
  ...args: Args
) => void

/**
 * Hook for the controlled/uncontrolled component state pattern.
 *
 * Sentinel: `undefined` is uncontrolled; `null` / `0` / `false` / `''` are
 * legal controlled values. Same-tick updaters accumulate like `useState`.
 * Setting the current value is a no-op (no `setState`, no `onChange`).
 *
 * Switching from controlled to omitted `value` keeps the last displayed value
 * (the last controlled prop), not the original `defaultValue`.
 *
 * @param controlledValue - The controlled value (from props). Pass `undefined` for uncontrolled.
 * @param defaultValue - The initial value for uncontrolled mode. Stored as-is (not called).
 * @param onChange - Optional change callback. Invoked only when the resolved value changes.
 * @returns A tuple of `[currentValue, setValue]`.
 */
export function useControlledState<T, Args extends unknown[] = []>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T, ...args: Args) => void
): [T, SetControlledState<T, Args>] {
  const [internalValue, setInternalValue] = useState(() => defaultValue)
  const isControlled = controlledValue !== undefined

  // Keep internal as the last displayed value so dropping `value` does not
  // snap back to defaultValue. React allows this render-phase sync.
  if (isControlled && !Object.is(internalValue, controlledValue)) {
    setInternalValue(controlledValue as T)
  }

  const value = isControlled ? (controlledValue as T) : internalValue

  const valueRef = useRef(value)
  valueRef.current = value
  const isControlledRef = useRef(isControlled)
  isControlledRef.current = isControlled
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const setValue = useCallback<SetControlledState<T, Args>>((next, ...args) => {
    const prev = valueRef.current
    const resolved = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
    if (Object.is(resolved, prev)) return
    valueRef.current = resolved
    if (!isControlledRef.current) {
      setInternalValue(resolved)
    }
    onChangeRef.current?.(resolved, ...args)
  }, [])

  return [value, setValue]
}
