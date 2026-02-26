import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { InputNumber } from '@expcat/tigercat-react'

describe('InputNumber (React)', () => {
  it('renders with default props', () => {
    const { container } = render(<InputNumber />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.getAttribute('role')).toBe('spinbutton')
    expect(input.getAttribute('inputmode')).toBe('decimal')
  })

  it('renders with initial value', () => {
    const { container } = render(<InputNumber value={42} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('42')
  })

  it('renders with defaultValue (uncontrolled)', () => {
    const { container } = render(<InputNumber defaultValue={10} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('10')
  })

  it('renders placeholder', () => {
    const { container } = render(<InputNumber placeholder="Enter number" />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('placeholder')).toBe('Enter number')
  })

  it('renders disabled state', () => {
    const { container } = render(<InputNumber disabled value={5} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('renders readonly state', () => {
    const { container } = render(<InputNumber readonly value={5} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
  })

  it('shows increase/decrease buttons by default (right position)', () => {
    render(<InputNumber value={5} />)
    expect(screen.getByLabelText('Increase')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrease')).toBeInTheDocument()
  })

  it('hides controls when controls=false', () => {
    render(<InputNumber value={5} controls={false} />)
    expect(screen.queryByLabelText('Increase')).toBeNull()
    expect(screen.queryByLabelText('Decrease')).toBeNull()
  })

  it('increments value on Increase button click', async () => {
    const onChange = vi.fn()
    render(<InputNumber defaultValue={5} onChange={onChange} />)

    await userEvent.click(screen.getByLabelText('Increase'))
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('decrements value on Decrease button click', async () => {
    const onChange = vi.fn()
    render(<InputNumber defaultValue={5} onChange={onChange} />)

    await userEvent.click(screen.getByLabelText('Decrease'))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('respects min boundary', async () => {
    const onChange = vi.fn()
    render(<InputNumber defaultValue={1} min={0} onChange={onChange} />)

    await userEvent.click(screen.getByLabelText('Decrease'))
    expect(onChange).toHaveBeenCalledWith(0)

    // Click again — should still be 0
    await userEvent.click(screen.getByLabelText('Decrease'))
    // The button should be disabled at min
  })

  it('respects max boundary', async () => {
    const onChange = vi.fn()
    render(<InputNumber defaultValue={9} max={10} onChange={onChange} />)

    await userEvent.click(screen.getByLabelText('Increase'))
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('respects step value', async () => {
    const onChange = vi.fn()
    render(<InputNumber defaultValue={0} step={5} onChange={onChange} />)

    await userEvent.click(screen.getByLabelText('Increase'))
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('respects precision', async () => {
    const onChange = vi.fn()
    render(<InputNumber defaultValue={1} step={0.1} precision={2} onChange={onChange} />)

    await userEvent.click(screen.getByLabelText('Increase'))
    expect(onChange).toHaveBeenCalledWith(1.1)
  })

  it('formats display value with precision', () => {
    const { container } = render(<InputNumber value={3.1} precision={2} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('3.10')
  })

  it('supports keyboard ArrowUp', async () => {
    const onChange = vi.fn()
    const { container } = render(<InputNumber defaultValue={5} onChange={onChange} />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('supports keyboard ArrowDown', async () => {
    const onChange = vi.fn()
    const { container } = render(<InputNumber defaultValue={5} onChange={onChange} />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('disables keyboard when keyboard=false', () => {
    const onChange = vi.fn()
    const { container } = render(
      <InputNumber defaultValue={5} keyboard={false} onChange={onChange} />
    )
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('commits value on blur', async () => {
    const onChange = vi.fn()
    const { container } = render(<InputNumber defaultValue={5} onChange={onChange} />)
    const input = container.querySelector('input') as HTMLInputElement

    await userEvent.clear(input)
    await userEvent.type(input, '42')
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(42)
  })

  it('clamps value on blur', async () => {
    const onChange = vi.fn()
    const { container } = render(
      <InputNumber defaultValue={5} min={0} max={10} onChange={onChange} />
    )
    const input = container.querySelector('input') as HTMLInputElement

    await userEvent.clear(input)
    await userEvent.type(input, '999')
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('handles empty input as null on blur', async () => {
    const onChange = vi.fn()
    const { container } = render(<InputNumber defaultValue={5} onChange={onChange} />)
    const input = container.querySelector('input') as HTMLInputElement

    await userEvent.clear(input)
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('supports formatter/parser', () => {
    const formatter = (val: number | undefined) => (val !== undefined ? `$ ${val}` : '')
    const parser = (str: string) => Number(str.replace(/\$\s?/g, ''))

    const { container } = render(<InputNumber value={1000} formatter={formatter} parser={parser} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('$ 1000')
  })

  it('renders controlsPosition=both', () => {
    render(<InputNumber value={5} controlsPosition="both" />)
    expect(screen.getByLabelText('Increase')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrease')).toBeInTheDocument()
  })

  it('disables Increase button at max', () => {
    render(<InputNumber value={10} max={10} />)
    const btn = screen.getByLabelText('Increase')
    expect(btn).toBeDisabled()
  })

  it('disables Decrease button at min', () => {
    render(<InputNumber value={0} min={0} />)
    const btn = screen.getByLabelText('Decrease')
    expect(btn).toBeDisabled()
  })

  it('sets aria-valuemin and aria-valuemax', () => {
    const { container } = render(<InputNumber value={5} min={0} max={100} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('aria-valuemin')).toBe('0')
    expect(input.getAttribute('aria-valuemax')).toBe('100')
    expect(input.getAttribute('aria-valuenow')).toBe('5')
  })

  it('does not set aria-valuemin/max for infinite bounds', () => {
    const { container } = render(<InputNumber value={5} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.hasAttribute('aria-valuemin')).toBe(false)
    expect(input.hasAttribute('aria-valuemax')).toBe(false)
  })

  it('calls onFocus and onBlur', async () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    const { container } = render(<InputNumber onFocus={onFocus} onBlur={onBlur} />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.focus(input)
    expect(onFocus).toHaveBeenCalled()

    fireEvent.blur(input)
    expect(onBlur).toHaveBeenCalled()
  })
})
