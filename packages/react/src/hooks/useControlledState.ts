import { useCallback, useRef, useState } from 'react'

/**
 * Setter returned by {@link useControlledState}.
 *
 * Accepts either the next value or an updater `(prev) => next`. When the
 * component is uncontrolled the internal state is updated; in both controlled
 * and uncontrolled modes the `onChange` callback (if provided) is always
 * invoked with the resolved value followed by any forwarded extra arguments.
 */
export type SetControlledState<T, Args extends unknown[] = []> = (
  next: T | ((prev: T) => T),
  ...args: Args
) => void

/**
 * Hook for the controlled/uncontrolled component state pattern, modeled after
 * Ant Design's `useMergedState` / Radix's `useControllableState`.
 *
 * Unlike a bare `useState`, the returned setter merges the `onChange`
 * callback: it writes internal state only when uncontrolled and always fires
 * `onChange`, removing the `const isControlled = value !== undefined` +
 * `if (!isControlled) setInternal(...)` + `onChange?.()` boilerplate that was
 * otherwise repeated across components.
 *
 * `Args` lets callers forward extra arguments (e.g. the originating DOM event)
 * to `onChange`: `setValue(nextChecked, event)` calls `onChange(nextChecked, event)`.
 *
 * @param controlledValue - The controlled value (from props). Pass `undefined` for uncontrolled.
 * @param defaultValue - The initial value for uncontrolled mode.
 * @param onChange - Optional change callback, always invoked by the returned setter.
 * @returns A tuple of `[currentValue, setValue]`.
 *
 * @remarks The setter treats a function argument as an updater (mirroring
 * `useState`), so it cannot store a function as the value `T` directly.
 */
export function useControlledState<T, Args extends unknown[] = []>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T, ...args: Args) => void
): [T, SetControlledState<T, Args>] {
  const [internalValue, setInternalValue] = useState<T>(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? (controlledValue as T) : internalValue

  // Mirror the latest value / controlled flag / onChange into refs so `setValue`
  // keeps a stable identity across renders while always reading fresh values.
  const valueRef = useRef(value)
  valueRef.current = value
  const isControlledRef = useRef(isControlled)
  isControlledRef.current = isControlled
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const setValue = useCallback<SetControlledState<T, Args>>((next, ...args) => {
    const resolved = typeof next === 'function' ? (next as (prev: T) => T)(valueRef.current) : next
    if (!isControlledRef.current) {
      setInternalValue(resolved)
    }
    onChangeRef.current?.(resolved, ...args)
  }, [])

  return [value, setValue]
}
