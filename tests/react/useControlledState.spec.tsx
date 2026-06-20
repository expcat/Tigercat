/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useControlledState } from '@expcat/tigercat-react'

describe('useControlledState', () => {
  it('uncontrolled: starts from defaultValue, updates internal state and fires onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControlledState<string>(undefined, 'a', onChange))

    expect(result.current[0]).toBe('a')

    act(() => result.current[1]('b'))

    expect(result.current[0]).toBe('b')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('controlled: keeps the controlled value, never writes internal state, still fires onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControlledState<string>('x', 'a', onChange))

    expect(result.current[0]).toBe('x')

    act(() => result.current[1]('y'))

    // Parent owns the value, so the returned value does not change locally.
    expect(result.current[0]).toBe('x')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('y')
  })

  it('reflects controlled value changes from props', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useControlledState<number>(value, 0),
      { initialProps: { value: 1 } }
    )

    expect(result.current[0]).toBe(1)
    rerender({ value: 2 })
    expect(result.current[0]).toBe(2)
  })

  it('supports updater-function form against the latest value', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControlledState<number>(undefined, 1, onChange))

    act(() => result.current[1]((prev) => prev + 1))
    act(() => result.current[1]((prev) => prev + 1))

    expect(result.current[0]).toBe(3)
    expect(onChange).toHaveBeenLastCalledWith(3)
  })

  it('forwards extra arguments to onChange', () => {
    const onChange = vi.fn<(value: boolean, event: string) => void>()
    const { result } = renderHook(() =>
      useControlledState<boolean, [string]>(undefined, false, onChange)
    )

    act(() => result.current[1](true, 'click'))

    expect(onChange).toHaveBeenCalledWith(true, 'click')
  })

  it('keeps a stable setter identity across renders', () => {
    const { result, rerender } = renderHook(() => useControlledState<string>(undefined, 'a'))
    const firstSetter = result.current[1]

    act(() => result.current[1]('b'))
    rerender()

    expect(result.current[1]).toBe(firstSetter)
  })

  it('is a no-op callback safe when onChange is omitted', () => {
    const { result } = renderHook(() => useControlledState<string>(undefined, 'a'))
    expect(() => act(() => result.current[1]('b'))).not.toThrow()
    expect(result.current[0]).toBe('b')
  })
})
