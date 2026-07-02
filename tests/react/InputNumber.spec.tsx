import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { InputNumber } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('InputNumber (React)', () => {
  const getInput = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement

  describe('Rendering', () => {
    it('renders a decimal spinbutton by default', () => {
      const { container } = render(<InputNumber />)
      const input = getInput(container)
      expect(input.getAttribute('role')).toBe('spinbutton')
      expect(input.getAttribute('inputmode')).toBe('decimal')
    })

    it('reflects a controlled value and an uncontrolled defaultValue', () => {
      const { container: controlled } = render(<InputNumber value={42} />)
      expect(getInput(controlled).value).toBe('42')
      const { container: uncontrolled } = render(<InputNumber defaultValue={10} />)
      expect(getInput(uncontrolled).value).toBe('10')
    })

    it('renders the placeholder', () => {
      const { container } = render(<InputNumber placeholder="Enter number" />)
      expect(getInput(container).getAttribute('placeholder')).toBe('Enter number')
    })

    it('renders disabled and readonly states', () => {
      const { container: disabled } = render(<InputNumber disabled value={5} />)
      expect(getInput(disabled).disabled).toBe(true)
      const { container: readonly } = render(<InputNumber readonly value={5} />)
      expect(getInput(readonly).readOnly).toBe(true)
    })

    it('shows the step controls by default and hides them when controls=false', () => {
      const { rerender } = render(<InputNumber value={5} />)
      expect(screen.getByLabelText('Increase')).toBeInTheDocument()
      expect(screen.getByLabelText('Decrease')).toBeInTheDocument()
      rerender(<InputNumber value={5} controls={false} />)
      expect(screen.queryByLabelText('Increase')).toBeNull()
    })

    it('allows overriding step control aria labels', () => {
      render(<InputNumber value={5} incrementAriaLabel="增加数值" decrementAriaLabel="减少数值" />)
      expect(screen.getByLabelText('增加数值')).toBeInTheDocument()
      expect(screen.getByLabelText('减少数值')).toBeInTheDocument()
    })

    it('formats the display value with precision and via formatter', () => {
      const { container: withPrecision } = render(<InputNumber value={3.1} precision={2} />)
      expect(getInput(withPrecision).value).toBe('3.10')
      const formatter = (val: number | undefined) => (val !== undefined ? `$ ${val}` : '')
      const parser = (str: string) => Number(str.replace(/\$\s?/g, ''))
      const { container } = render(
        <InputNumber value={1000} formatter={formatter} parser={parser} />
      )
      expect(getInput(container).value).toBe('$ 1000')
    })
  })

  describe('Stepping', () => {
    it.each([
      ['Increase', 6],
      ['Decrease', 4]
    ])('%s changes the value by one', async (label, expected) => {
      const onChange = vi.fn()
      render(<InputNumber defaultValue={5} onChange={onChange} />)
      await userEvent.click(screen.getByLabelText(label))
      expect(onChange).toHaveBeenCalledWith(expected)
    })

    it('honors a custom step and precision', async () => {
      const onStep = vi.fn()
      render(<InputNumber defaultValue={0} step={5} onChange={onStep} />)
      await userEvent.click(screen.getByLabelText('Increase'))
      expect(onStep).toHaveBeenCalledWith(5)

      const onPrecision = vi.fn()
      render(<InputNumber defaultValue={1} step={0.1} precision={2} onChange={onPrecision} />)
      await userEvent.click(screen.getAllByLabelText('Increase')[1])
      expect(onPrecision).toHaveBeenCalledWith(1.1)
    })

    it.each([
      ['Decrease', 1, { min: 0 }, 0],
      ['Increase', 9, { max: 10 }, 10]
    ])(
      '%s clamps and disables the button at the boundary',
      async (label, start, bounds, expected) => {
        const onChange = vi.fn()
        render(<InputNumber defaultValue={start} {...bounds} onChange={onChange} />)
        await userEvent.click(screen.getByLabelText(label))
        expect(onChange).toHaveBeenCalledWith(expected)
        expect(screen.getByLabelText(label)).toBeDisabled()
      }
    )

    it('repeats increment while the Increase button is held', () => {
      vi.useFakeTimers()
      try {
        const onChange = vi.fn()
        render(<InputNumber defaultValue={0} onChange={onChange} />)
        const increase = screen.getByLabelText('Increase')
        fireEvent.pointerDown(increase)
        expect(onChange).toHaveBeenCalledWith(1)
        act(() => vi.advanceTimersByTime(450))
        expect(onChange.mock.calls.map(([value]) => value)).toEqual([1, 2, 3])
        fireEvent.pointerUp(increase)
        act(() => vi.advanceTimersByTime(200))
        expect(onChange.mock.calls.map(([value]) => value)).toEqual([1, 2, 3])
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('Keyboard', () => {
    it.each([
      ['ArrowUp', 6],
      ['ArrowDown', 4]
    ])('%s adjusts the value', (key, expected) => {
      const onChange = vi.fn()
      const { container } = render(<InputNumber defaultValue={5} onChange={onChange} />)
      fireEvent.keyDown(getInput(container), { key })
      expect(onChange).toHaveBeenCalledWith(expected)
    })

    it('ignores the keyboard when keyboard=false', () => {
      const onChange = vi.fn()
      const { container } = render(
        <InputNumber defaultValue={5} keyboard={false} onChange={onChange} />
      )
      fireEvent.keyDown(getInput(container), { key: 'ArrowUp' })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Committing on blur', () => {
    it('commits the typed value on blur', async () => {
      const onChange = vi.fn()
      const { container } = render(<InputNumber defaultValue={5} onChange={onChange} />)
      const input = getInput(container)
      await userEvent.clear(input)
      await userEvent.type(input, '42')
      fireEvent.blur(input)
      expect(onChange).toHaveBeenCalledWith(42)
    })

    it('clamps out-of-range input on blur', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <InputNumber defaultValue={5} min={0} max={10} onChange={onChange} />
      )
      const input = getInput(container)
      await userEvent.clear(input)
      await userEvent.type(input, '999')
      fireEvent.blur(input)
      expect(onChange).toHaveBeenCalledWith(10)
    })

    it('treats empty input as null on blur', async () => {
      const onChange = vi.fn()
      const { container } = render(<InputNumber defaultValue={5} onChange={onChange} />)
      const input = getInput(container)
      await userEvent.clear(input)
      fireEvent.blur(input)
      expect(onChange).toHaveBeenCalledWith(null)
    })
  })

  describe('Accessibility', () => {
    it('exposes aria value bounds only when finite', () => {
      const { container: bounded } = render(<InputNumber value={5} min={0} max={100} />)
      const boundedInput = getInput(bounded)
      expect(boundedInput.getAttribute('aria-valuemin')).toBe('0')
      expect(boundedInput.getAttribute('aria-valuemax')).toBe('100')
      expect(boundedInput.getAttribute('aria-valuenow')).toBe('5')

      const { container: infinite } = render(<InputNumber value={5} />)
      expect(getInput(infinite).hasAttribute('aria-valuemin')).toBe(false)
    })

    it('calls onFocus and onBlur', () => {
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const { container } = render(<InputNumber onFocus={onFocus} onBlur={onBlur} />)
      const input = getInput(container)
      fireEvent.focus(input)
      expect(onFocus).toHaveBeenCalled()
      fireEvent.blur(input)
      expect(onBlur).toHaveBeenCalled()
    })

    it('has no accessibility violations', async () => {
      const { container } = render(<InputNumber />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
