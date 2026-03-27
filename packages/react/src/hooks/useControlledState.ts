import { useState } from 'react'

/**
 * Hook for managing controlled/uncontrolled component state pattern.
 * Reduces boilerplate across form components that support both modes.
 *
 * @param controlledValue - The controlled value (from props). Pass `undefined` for uncontrolled.
 * @param defaultValue - The initial value for uncontrolled mode.
 * @returns A tuple of [currentValue, setValue, isControlled]
 */
export function useControlledState<T>(
  controlledValue: T | undefined,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [internalValue, setInternalValue] = useState<T>(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  return [value, setInternalValue, isControlled]
}
