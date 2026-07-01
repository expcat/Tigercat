/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { ref, nextTick, defineComponent, h } from 'vue'
import { Radio, RadioGroup } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils'

const getRadio = (container: HTMLElement) =>
  container.querySelector('input[type="radio"]') as HTMLInputElement
const getRadios = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input[type="radio"]')) as HTMLInputElement[]

const renderGroup = (template: string, setup?: () => Record<string, unknown>) =>
  render({ components: { RadioGroup, Radio }, template, setup })

describe('Radio', () => {
  describe('Rendering', () => {
    it('should render the input, value and label unchecked by default', () => {
      const { container, getByText } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Option 1' }
      })
      const radio = getRadio(container)
      expect(radio).toBeInTheDocument()
      expect(radio).toHaveAttribute('value', 'option1')
      expect(radio.checked).toBe(false)
      expect(getByText('Option 1')).toBeInTheDocument()
    })

    it('should render with a numeric value', () => {
      const { container } = render(Radio, {
        props: { value: 123 },
        slots: { default: 'Numeric' }
      })
      expect(getRadio(container)).toHaveAttribute('value', '123')
    })

    it('should apply custom className to the label', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', className: 'custom-radio' },
        slots: { default: 'Custom' }
      })
      expect(container.querySelector('label')).toHaveClass('custom-radio')
    })

    it.each(componentSizes)('should render %s size', (size) => {
      const { container } = renderWithProps(
        Radio,
        { value: 'option1', size },
        { slots: { default: 'Option' } }
      )
      expect(getRadio(container)).toBeInTheDocument()
    })

    it('should apply the name attribute', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', name: 'choice' },
        slots: { default: 'Option 1' }
      })
      expect(getRadio(container)).toHaveAttribute('name', 'choice')
    })

    it('should be disabled when disabled', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', disabled: true },
        slots: { default: 'Disabled' }
      })
      expect(getRadio(container)).toBeDisabled()
    })

    it('should prioritize modelValue over defaultValue', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', modelValue: false, defaultValue: true },
        slots: { default: 'Controlled' }
      })
      expect(getRadio(container).checked).toBe(false)
    })
  })

  describe('Events', () => {
    it('should emit change (with value) and update:modelValue (true) on click', async () => {
      const onChange = vi.fn()
      const onUpdate = vi.fn()
      const { container } = render(Radio, {
        props: { value: 'option1', onChange, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Option 1' }
      })
      await fireEvent.click(getRadio(container))
      expect(onChange).toHaveBeenCalledWith('option1')
      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('should not emit events when disabled', async () => {
      const onChange = vi.fn()
      const { container } = render(Radio, {
        props: { value: 'option1', disabled: true, onChange },
        slots: { default: 'Disabled' }
      })
      await fireEvent.click(getRadio(container))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should activate on the Enter key', async () => {
      const onChange = vi.fn()
      const { container } = render(Radio, {
        props: { value: 'option1', onChange },
        slots: { default: 'Option' }
      })
      const radio = getRadio(container)
      radio.focus()
      await fireEvent.keyDown(radio, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith('option1')
    })
  })

  describe('v-model binding', () => {
    it('should work with v-model', async () => {
      const Wrapper = defineComponent({
        setup() {
          const checked = ref(false)
          return () =>
            h(
              Radio,
              {
                value: 'option1',
                modelValue: checked.value,
                'onUpdate:modelValue': (v: boolean) => {
                  checked.value = v
                }
              },
              { default: () => `Checked: ${checked.value}` }
            )
        }
      })

      const { container, getByText } = render(Wrapper)
      const radio = getRadio(container)
      expect(radio.checked).toBe(false)
      await fireEvent.click(radio)
      await nextTick()
      expect(radio.checked).toBe(true)
      expect(getByText('Checked: true')).toBeInTheDocument()
    })
  })

  describe('RadioGroup', () => {
    it('should render children inside a radiogroup', () => {
      const { container } = renderGroup(`
        <RadioGroup>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      `)
      expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
      expect(getRadios(container)).toHaveLength(2)
    })

    it('should select and switch values (uncontrolled)', async () => {
      const { container } = renderGroup(`
        <RadioGroup default-value="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      `)
      const inputs = getRadios(container)
      expect(inputs[0].checked).toBe(true)
      await fireEvent.click(inputs[1])
      expect(inputs[0].checked).toBe(false)
      expect(inputs[1].checked).toBe(true)
    })

    it('should work without a default value', async () => {
      const { container } = renderGroup(`
        <RadioGroup>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      `)
      const inputs = getRadios(container)
      expect(inputs[0].checked).toBe(false)
      await fireEvent.click(inputs[0])
      expect(inputs[0].checked).toBe(true)
    })

    it('should work as a controlled group with v-model', async () => {
      const Wrapper = defineComponent({
        setup() {
          const value = ref<string | undefined>('a')
          return () =>
            h(
              RadioGroup,
              {
                modelValue: value.value,
                'onUpdate:modelValue': (v: string) => {
                  value.value = v
                }
              },
              {
                default: () => [
                  h(Radio, { value: 'a' }, () => 'A'),
                  h(Radio, { value: 'b' }, () => 'B')
                ]
              }
            )
        }
      })

      const { container } = render(Wrapper)
      const inputs = getRadios(container)
      expect(inputs[0].checked).toBe(true)
      await fireEvent.click(inputs[1])
      await nextTick()
      expect(inputs[0].checked).toBe(false)
      expect(inputs[1].checked).toBe(true)
    })

    it('should apply an explicit name to all radios', () => {
      const { container } = renderGroup(`
        <RadioGroup name="my-group">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      `)
      getRadios(container).forEach((input) => {
        expect(input).toHaveAttribute('name', 'my-group')
      })
    })

    it('should auto-generate a shared name when not provided', () => {
      const { container } = renderGroup(`
        <RadioGroup>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      `)
      const inputs = getRadios(container)
      const name = inputs[0].getAttribute('name')
      expect(name).toContain('tiger-radio-group')
      inputs.forEach((input) => expect(input).toHaveAttribute('name', name))
    })

    it('should let a child override the inherited size', () => {
      const { container } = renderGroup(`
        <RadioGroup size="sm">
          <Radio value="a" size="lg">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      `)
      expect(getRadios(container)).toHaveLength(2)
    })

    it('should not allow selection when the group is disabled', async () => {
      const onChange = vi.fn()
      const Wrapper = defineComponent({
        setup() {
          return () =>
            h(
              RadioGroup,
              { disabled: true, onChange },
              {
                default: () => [
                  h(Radio, { value: 'a' }, () => 'A'),
                  h(Radio, { value: 'b' }, () => 'B')
                ]
              }
            )
        }
      })
      const { container } = render(Wrapper)
      await fireEvent.click(getRadios(container)[0])
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should allow an individual radio to be disabled', () => {
      const { container } = renderGroup(`
        <RadioGroup>
          <Radio value="a" disabled>A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      `)
      const inputs = getRadios(container)
      expect(inputs[0]).toBeDisabled()
      expect(inputs[1]).not.toBeDisabled()
    })

    it('should emit change and update:modelValue with the selected value', async () => {
      const onChange = vi.fn()
      const onUpdate = vi.fn()
      const { container } = renderGroup(
        `
        <RadioGroup @change="onChange" @update:modelValue="onUpdate">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      `,
        () => ({ onChange, onUpdate })
      )
      await fireEvent.click(getRadios(container)[1])
      expect(onChange).toHaveBeenCalledWith('b')
      expect(onUpdate).toHaveBeenCalledWith('b')
    })

    it('should move and select with arrow keys, skipping disabled radios', async () => {
      const user = userEvent.setup()
      const { container } = renderGroup(`
        <RadioGroup default-value="a">
          <Radio value="a">A</Radio>
          <Radio value="b" disabled>B</Radio>
          <Radio value="c">C</Radio>
        </RadioGroup>
      `)
      const inputs = getRadios(container)
      inputs[0].focus()
      await user.keyboard('{ArrowDown}')
      expect(inputs[2]).toHaveFocus()
      expect(inputs[2].checked).toBe(true)
    })

    it('should navigate both directions with ArrowLeft/ArrowRight', async () => {
      const user = userEvent.setup()
      const { container } = renderGroup(`
        <RadioGroup default-value="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      `)
      const inputs = getRadios(container)
      inputs[0].focus()
      await user.keyboard('{ArrowRight}')
      expect(inputs[1]).toHaveFocus()
      await user.keyboard('{ArrowLeft}')
      expect(inputs[0]).toHaveFocus()
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({ '--tiger-primary': '#ff0000' })
      const { container } = render(Radio, {
        props: { value: 'option1', modelValue: true },
        slots: { default: 'Themed' }
      })
      expect(getRadio(container)).toBeInTheDocument()
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should be focusable', () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Radio' }
      })
      const radio = getRadio(container)
      radio.focus()
      expect(radio).toHaveFocus()
    })

    it('should have no violations for a standalone radio', async () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Accessible Radio' }
      })
      await expectNoA11yViolationsIsolated(container)
    })

    it('should have no violations for a radio group', async () => {
      const { container } = renderGroup(`
        <RadioGroup default-value="a">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      `)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle special characters in the value', () => {
      const { container } = render(Radio, {
        props: { value: '<>&"\'`' },
        slots: { default: 'Special' }
      })
      expect(getRadio(container)).toHaveAttribute('value', '<>&"\'`')
    })

    it('should update the controlled checked state on rerender', async () => {
      const { container, rerender } = render(Radio, {
        props: { value: 'option1', modelValue: true },
        slots: { default: 'Option' }
      })
      expect(getRadio(container).checked).toBe(true)
      await rerender({ value: 'option1', modelValue: false })
      expect(getRadio(container).checked).toBe(false)
    })
  })
})
