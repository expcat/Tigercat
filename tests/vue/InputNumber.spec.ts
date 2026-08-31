/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { InputNumber } from '@expcat/tigercat-vue/InputNumber'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('InputNumber (Vue)', () => {
  const getInput = (container: HTMLElement) => container.querySelector('input') as HTMLInputElement
  const stepButton = (name: string) =>
    document.querySelector(`button[aria-label="${name}"]`) as HTMLButtonElement

  describe('Rendering', () => {
    it('renders a decimal spinbutton by default', () => {
      const { container } = render(InputNumber)
      const input = getInput(container)
      expect(input.getAttribute('role')).toBe('spinbutton')
      expect(input.getAttribute('inputmode')).toBe('decimal')
    })

    it('reflects the initial modelValue', () => {
      const { container } = render(InputNumber, { props: { modelValue: 42 } })
      expect(getInput(container).value).toBe('42')
    })

    it('renders the placeholder', () => {
      const { container } = render(InputNumber, { props: { placeholder: 'Enter number' } })
      expect(getInput(container).getAttribute('placeholder')).toBe('Enter number')
    })

    it('renders disabled and readonly states', () => {
      const { container: disabled } = render(InputNumber, {
        props: { disabled: true, modelValue: 5 }
      })
      expect(getInput(disabled).disabled).toBe(true)
      const { container: readonly } = render(InputNumber, {
        props: { readonly: true, modelValue: 5 }
      })
      expect(getInput(readonly).readOnly).toBe(true)
    })

    it('shows the step controls by default and hides them when controls=false', async () => {
      const { rerender } = render(InputNumber, { props: { modelValue: 5 } })
      expect(stepButton('Increase')).toBeInTheDocument()
      expect(stepButton('Decrease')).toBeInTheDocument()
      await rerender({ modelValue: 5, controls: false })
      expect(screen.queryByLabelText('Increase')).toBeNull()
    })

    it('allows overriding step control aria labels', () => {
      render(InputNumber, {
        props: {
          modelValue: 5,
          incrementAriaLabel: '增加数值',
          decrementAriaLabel: '减少数值'
        }
      })
      expect(stepButton('增加数值')).toBeInTheDocument()
      expect(stepButton('减少数值')).toBeInTheDocument()
    })

    it('formats the display value with precision and via formatter', () => {
      const { container: withPrecision } = render(InputNumber, {
        props: { modelValue: 3.1, precision: 2 }
      })
      expect(getInput(withPrecision).value).toBe('3.10')
      const formatter = (val: number | undefined) => (val !== undefined ? `$ ${val}` : '')
      const parser = (str: string) => Number(str.replace(/\$\s?/g, ''))
      const { container } = render(InputNumber, {
        props: { modelValue: 1000, formatter, parser }
      })
      expect(getInput(container).value).toBe('$ 1000')
    })
  })

  describe('Stepping', () => {
    it.each([
      ['Increase', 6],
      ['Decrease', 4]
    ])('%s emits the value changed by one', async (label, expected) => {
      const { emitted } = render(InputNumber, { props: { modelValue: 5 } })
      await fireEvent.click(stepButton(label))
      expect(emitted()['update:modelValue'][0]).toEqual([expected])
    })
    it.each([
      ['Decrease', { modelValue: 0, min: 0 }],
      ['Increase', { modelValue: 10, max: 10 }]
    ])('disables the %s button at the boundary', (label, props) => {
      render(InputNumber, { props })
      expect((stepButton(label) as HTMLButtonElement).disabled).toBe(true)
    })

    it('repeats increment while the Increase button is held', async () => {
      vi.useFakeTimers()
      try {
        const { emitted } = render(InputNumber, { props: { modelValue: 0 } })
        const increase = stepButton('Increase')
        await fireEvent.pointerDown(increase)
        expect(emitted()['update:modelValue'][0]).toEqual([1])
        vi.advanceTimersByTime(450)
        expect(emitted()['update:modelValue'].map(([value]) => value)).toEqual([1, 2, 3])
        await fireEvent.pointerUp(increase)
        vi.advanceTimersByTime(200)
        expect(emitted()['update:modelValue'].map(([value]) => value)).toEqual([1, 2, 3])
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('Keyboard', () => {
    it.each([
      ['ArrowUp', 6],
      ['ArrowDown', 4]
    ])('%s adjusts the value', async (key, expected) => {
      const { container, emitted } = render(InputNumber, { props: { modelValue: 5 } })
      await fireEvent.keyDown(getInput(container), { key })
      expect(emitted()['update:modelValue'][0]).toEqual([expected])
    })

    it('ignores the keyboard when keyboard=false', async () => {
      const { container, emitted } = render(InputNumber, {
        props: { modelValue: 5, keyboard: false }
      })
      await fireEvent.keyDown(getInput(container), { key: 'ArrowUp' })
      expect(emitted()['update:modelValue']).toBeFalsy()
    })
  })

  describe('Committing on blur', () => {
    it('commits the typed value on blur', async () => {
      const { container, emitted } = render(InputNumber, { props: { modelValue: 5 } })
      const input = getInput(container)
      await fireEvent.focus(input)
      await fireEvent.update(input, '42')
      await fireEvent.blur(input)
      expect(emitted()['update:modelValue'][0]).toEqual([42])
    })
  })

  describe('Accessibility', () => {
    it('exposes aria value bounds only when finite', () => {
      const { container: bounded } = render(InputNumber, {
        props: { modelValue: 5, min: 0, max: 100 }
      })
      const boundedInput = getInput(bounded)
      expect(boundedInput.getAttribute('aria-valuemin')).toBe('0')
      expect(boundedInput.getAttribute('aria-valuemax')).toBe('100')
      expect(boundedInput.getAttribute('aria-valuenow')).toBe('5')

      const { container: infinite } = render(InputNumber, { props: { modelValue: 5 } })
      expect(getInput(infinite).hasAttribute('aria-valuemin')).toBe(false)
    })

    it('emits focus and blur events', async () => {
      const { container, emitted } = render(InputNumber)
      const input = getInput(container)
      await fireEvent.focus(input)
      expect(emitted()['focus']).toBeTruthy()
      await fireEvent.blur(input)
      expect(emitted()['blur']).toBeTruthy()
    })

    it('has no accessibility violations', async () => {
      const { container } = render(InputNumber)
      await expectNoA11yViolationsIsolated(container)
    })

    it('forwards leftover attrs onto the spinbutton, not the wrapper', async () => {
      const { container } = render(InputNumber, {
        attrs: {
          'aria-label': 'Quantity',
          'data-testid': 'qty',
          'data-foo': 'bar',
          class: 'extra-wrap'
        }
      })

      const spinbutton = screen.getByRole('spinbutton', { name: 'Quantity' })
      expect(spinbutton).toHaveAttribute('data-testid', 'qty')
      expect(spinbutton).toHaveAttribute('data-foo', 'bar')
      expect(spinbutton).not.toHaveClass('extra-wrap')

      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper).not.toHaveAttribute('aria-label')
      expect(wrapper).not.toHaveAttribute('data-testid')
      expect(wrapper).not.toHaveAttribute('data-foo')
      expect(wrapper).toHaveClass('extra-wrap')

      expect(stepButton('Increase')).toBeInTheDocument()
      expect(stepButton('Decrease')).toBeInTheDocument()

      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('precision and keyboard', () => {
    it('steps 0.1 without writing a binary residue', async () => {
      const { emitted } = render(InputNumber, { props: { modelValue: 0.1, step: 0.1 } })
      await fireEvent.click(stepButton('Increase'))
      expect(emitted()['update:modelValue'][0]).toEqual([0.2])
    })

    it('keeps the editing buffer unformatted while focused after a step', async () => {
      const formatter = (val: number | undefined) => (val !== undefined ? `$ ${val}` : '')
      const parser = (s: string) => {
        const n = Number(s.replace(/[^0-9.-]/g, ''))
        return Number.isNaN(n) ? null : n
      }
      const { container, emitted } = render(InputNumber, {
        props: { defaultValue: 1000, step: 1, formatter, parser }
      })
      const input = getInput(container)
      expect(input.value).toBe('$ 1000')
      await fireEvent.focus(input)
      expect(input.value).toBe('1000')
      await fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(emitted()['update:modelValue'][0]).toEqual([1001])
      expect(input.value).toBe('1001')
      await fireEvent.blur(input)
      expect(input.value).toBe('$ 1001')
    })
  })
})
