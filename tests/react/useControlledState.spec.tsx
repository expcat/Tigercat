/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { act, render, renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch, useControlledState } from '@expcat/tigercat-react'

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

  it('controlled: display follows the prop and setter only notifies the parent', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControlledState<string>('x', 'a', onChange))

    expect(result.current[0]).toBe('x')

    act(() => result.current[1]('y'))

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

  it('accumulates two updater calls in one act', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControlledState<number>(undefined, 1, onChange))

    act(() => {
      result.current[1]((prev) => prev + 1)
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(3)
    expect(onChange).toHaveBeenNthCalledWith(1, 2)
    expect(onChange).toHaveBeenNthCalledWith(2, 3)
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('keeps the last controlled value after the parent omits value', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value?: string }) => useControlledState<string>(value, 'default'),
      { initialProps: { value: 'live' as string | undefined } }
    )

    expect(result.current[0]).toBe('live')
    rerender({ value: 'next' })
    expect(result.current[0]).toBe('next')
    rerender({ value: undefined })
    expect(result.current[0]).toBe('next')
  })

  it('does not setState or call onChange when the resolved value is unchanged', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControlledState<string>(undefined, 'a', onChange))

    act(() => result.current[1]('a'))

    expect(result.current[0]).toBe('a')
    expect(onChange).not.toHaveBeenCalled()
  })

  it.each([
    ['null', null as string | null, 'fallback'],
    ['0', 0, 1],
    ['false', false, true],
    ['empty string', '', 'x']
  ])('treats %s as a controlled empty value', (_label, controlled, fallback) => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControlledState<typeof controlled>(controlled, fallback, onChange)
    )

    expect(result.current[0]).toBe(controlled)
    act(() => result.current[1](fallback))
    expect(result.current[0]).toBe(controlled)
    expect(onChange).toHaveBeenCalledWith(fallback)
  })

  it('calls the latest onChange after the callback identity changes', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { result, rerender } = renderHook(
      ({ onChange }: { onChange: (value: string) => void }) =>
        useControlledState<string>(undefined, 'a', onChange),
      { initialProps: { onChange: first } }
    )

    rerender({ onChange: second })
    act(() => result.current[1]('b'))

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('b')
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

  it('Switch stays on the last checked state after the parent omits checked', async () => {
    const user = userEvent.setup()

    function Probe() {
      const [checked, setChecked] = useState<boolean | undefined>(false)
      return (
        <>
          <Switch checked={checked} onChange={setChecked} aria-label="probe" />
          <button type="button" onClick={() => setChecked(undefined)}>
            release
          </button>
        </>
      )
    }

    const { getByLabelText, getByRole } = render(<Probe />)
    const sw = getByLabelText('probe')
    expect(sw).toHaveAttribute('aria-checked', 'false')

    await user.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')

    await user.click(getByRole('button', { name: 'release' }))
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })
})
