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

export interface UseControlledStateOptions<T, Args extends unknown[] = []> {
  /** Controlled value. `undefined` is uncontrolled; `null` is a legal empty value. */
  value?: T
  /** Initial value for uncontrolled mode. Stored as-is (not called as a lazy initializer). */
  defaultValue: T
  /** Invoked only when the resolved value changes. Extra setter args are forwarded. */
  onChange?: (value: T, ...args: Args) => void
  /** Normalize/clamp both the displayed value and values passed to `onChange`. */
  postState?: (value: T) => T
}

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
 * Pass the component `onChange` in when its shape is `(value, ...args)`. Wrap
 * native events or `(file, fileList)` in `onChange` instead of firing again
 * after `setValue`.
 */
export function useControlledState<T, Args extends unknown[] = []>(
  options: UseControlledStateOptions<T, Args>
): [T, SetControlledState<T, Args>] {
  const { value: controlledValue, defaultValue, onChange, postState } = options
  const postStateRef = useRef(postState)
  postStateRef.current = postState

  const applyPostState = (next: T): T => {
    const fn = postStateRef.current
    return fn ? fn(next) : next
  }

  const [internalValue, setInternalValue] = useState(() => applyPostState(defaultValue))
  const isControlled = controlledValue !== undefined
  const raw = isControlled ? (controlledValue as T) : internalValue
  const value = applyPostState(raw)

  // Keep internal as the last displayed value so dropping `value` does not
  // snap back to defaultValue. React allows this render-phase sync.
  if (isControlled && !Object.is(internalValue, value)) {
    setInternalValue(value)
  }

  const valueRef = useRef(value)
  valueRef.current = value
  const isControlledRef = useRef(isControlled)
  isControlledRef.current = isControlled
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const setValue = useCallback<SetControlledState<T, Args>>((next, ...args) => {
    const prev = valueRef.current
    const resolvedRaw = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next
    const post = postStateRef.current
    const resolved = post ? post(resolvedRaw) : resolvedRaw
    if (Object.is(resolved, prev)) return
    valueRef.current = resolved
    if (!isControlledRef.current) {
      setInternalValue(resolved)
    }
    onChangeRef.current?.(resolved, ...args)
  }, [])

  return [value, setValue]
}
