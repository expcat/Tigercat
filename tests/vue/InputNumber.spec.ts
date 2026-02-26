/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { InputNumber } from '@expcat/tigercat-vue'

describe('InputNumber (Vue)', () => {
  it('renders with default props', () => {
    const { container } = render(InputNumber)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.getAttribute('role')).toBe('spinbutton')
    expect(input.getAttribute('inputmode')).toBe('decimal')
  })

  it('renders with initial modelValue', () => {
    const { container } = render(InputNumber, {
      props: { modelValue: 42 }
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('42')
  })

  it('renders placeholder', () => {
    const { container } = render(InputNumber, {
      props: { placeholder: 'Enter number' }
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('placeholder')).toBe('Enter number')
  })

  it('renders disabled state', () => {
    const { container } = render(InputNumber, {
      props: { disabled: true, modelValue: 5 }
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('renders readonly state', () => {
    const { container } = render(InputNumber, {
      props: { readonly: true, modelValue: 5 }
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
  })

  it('shows increase/decrease buttons by default', () => {
    render(InputNumber, { props: { modelValue: 5 } })
    expect(screen.getByLabelText('Increase')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrease')).toBeInTheDocument()
  })

  it('hides controls when controls=false', () => {
    render(InputNumber, { props: { modelValue: 5, controls: false } })
    expect(screen.queryByLabelText('Increase')).toBeNull()
    expect(screen.queryByLabelText('Decrease')).toBeNull()
  })

  it('emits update:modelValue on Increase click', async () => {
    const { emitted } = render(InputNumber, {
      props: { modelValue: 5 }
    })

    await fireEvent.click(screen.getByLabelText('Increase'))
    expect(emitted()['update:modelValue']).toBeTruthy()
    expect(emitted()['update:modelValue'][0]).toEqual([6])
  })

  it('emits update:modelValue on Decrease click', async () => {
    const { emitted } = render(InputNumber, {
      props: { modelValue: 5 }
    })

    await fireEvent.click(screen.getByLabelText('Decrease'))
    expect(emitted()['update:modelValue']).toBeTruthy()
    expect(emitted()['update:modelValue'][0]).toEqual([4])
  })

  it('respects min boundary', async () => {
    const { emitted } = render(InputNumber, {
      props: { modelValue: 1, min: 0 }
    })

    await fireEvent.click(screen.getByLabelText('Decrease'))
    expect(emitted()['update:modelValue'][0]).toEqual([0])
  })

  it('respects max boundary', async () => {
    const { emitted } = render(InputNumber, {
      props: { modelValue: 9, max: 10 }
    })

    await fireEvent.click(screen.getByLabelText('Increase'))
    expect(emitted()['update:modelValue'][0]).toEqual([10])
  })

  it('respects step value', async () => {
    const { emitted } = render(InputNumber, {
      props: { modelValue: 0, step: 5 }
    })

    await fireEvent.click(screen.getByLabelText('Increase'))
    expect(emitted()['update:modelValue'][0]).toEqual([5])
  })

  it('respects precision', async () => {
    const { emitted } = render(InputNumber, {
      props: { modelValue: 1, step: 0.1, precision: 2 }
    })

    await fireEvent.click(screen.getByLabelText('Increase'))
    expect(emitted()['update:modelValue'][0]).toEqual([1.1])
  })

  it('formats display value with precision', () => {
    const { container } = render(InputNumber, {
      props: { modelValue: 3.1, precision: 2 }
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('3.10')
  })

  it('supports keyboard ArrowUp', async () => {
    const { container, emitted } = render(InputNumber, {
      props: { modelValue: 5 }
    })
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(emitted()['update:modelValue'][0]).toEqual([6])
  })

  it('supports keyboard ArrowDown', async () => {
    const { container, emitted } = render(InputNumber, {
      props: { modelValue: 5 }
    })
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(emitted()['update:modelValue'][0]).toEqual([4])
  })

  it('disables keyboard when keyboard=false', async () => {
    const { container, emitted } = render(InputNumber, {
      props: { modelValue: 5, keyboard: false }
    })
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(emitted()['update:modelValue']).toBeFalsy()
  })

  it('commits value on blur', async () => {
    const { container, emitted } = render(InputNumber, {
      props: { modelValue: 5 }
    })
    const input = container.querySelector('input') as HTMLInputElement

    // Simulate focus, type new value, then blur
    await fireEvent.focus(input)
    // Directly set the display value
    await fireEvent.update(input, '42')
    await fireEvent.blur(input)
    expect(emitted()['update:modelValue']).toBeTruthy()
    expect(emitted()['update:modelValue'][0]).toEqual([42])
  })

  it('clamps value on blur', async () => {
    const { container, emitted } = render(InputNumber, {
      props: { modelValue: 5, min: 0, max: 10 }
    })
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.focus(input)
    await fireEvent.update(input, '999')
    await fireEvent.blur(input)
    expect(emitted()['update:modelValue'][0]).toEqual([10])
  })

  it('handles empty input as null on blur', async () => {
    const { container, emitted } = render(InputNumber, {
      props: { modelValue: 5 }
    })
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.focus(input)
    await fireEvent.update(input, '')
    await fireEvent.blur(input)
    expect(emitted()['update:modelValue'][0]).toEqual([null])
  })

  it('supports formatter/parser', () => {
    const formatter = (val: number | undefined) => (val !== undefined ? `$ ${val}` : '')
    const parser = (str: string) => Number(str.replace(/\$\s?/g, ''))

    const { container } = render(InputNumber, {
      props: { modelValue: 1000, formatter, parser }
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('$ 1000')
  })

  it('renders controlsPosition=both', () => {
    render(InputNumber, { props: { modelValue: 5, controlsPosition: 'both' } })
    expect(screen.getByLabelText('Increase')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrease')).toBeInTheDocument()
  })

  it('disables Increase button at max', () => {
    render(InputNumber, { props: { modelValue: 10, max: 10 } })
    const btn = screen.getByLabelText('Increase')
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables Decrease button at min', () => {
    render(InputNumber, { props: { modelValue: 0, min: 0 } })
    const btn = screen.getByLabelText('Decrease')
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('sets aria-valuemin and aria-valuemax', () => {
    const { container } = render(InputNumber, {
      props: { modelValue: 5, min: 0, max: 100 }
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.getAttribute('aria-valuemin')).toBe('0')
    expect(input.getAttribute('aria-valuemax')).toBe('100')
    expect(input.getAttribute('aria-valuenow')).toBe('5')
  })

  it('does not set aria-valuemin/max for infinite bounds', () => {
    const { container } = render(InputNumber, {
      props: { modelValue: 5 }
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.hasAttribute('aria-valuemin')).toBe(false)
    expect(input.hasAttribute('aria-valuemax')).toBe(false)
  })

  it('emits focus and blur events', async () => {
    const { container, emitted } = render(InputNumber)
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.focus(input)
    expect(emitted()['focus']).toBeTruthy()

    await fireEvent.blur(input)
    expect(emitted()['blur']).toBeTruthy()
  })
})
