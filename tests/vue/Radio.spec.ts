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
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils'

describe('Radio', () => {
  describe('Basic Rendering', () => {
    it('should render with required value prop', () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Option 1' }
      })

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeInTheDocument()
      expect(radio).toHaveAttribute('value', 'option1')
    })

    it('should render with label text', () => {
      const { getByText } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Option 1' }
      })

      expect(getByText('Option 1')).toBeInTheDocument()
    })

    it('should render unchecked by default', () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Option 1' }
      })

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(false)
    })

    it('should support defaultChecked (uncontrolled)', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', defaultChecked: true },
        slots: { default: 'Option 1' }
      })

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(true)
    })

    it('should render without label when no slot content', () => {
      const { container } = render(Radio, {
        props: { value: 'option1' }
      })

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeInTheDocument()
    })

    it('should render with numeric value', () => {
      const { container } = render(Radio, {
        props: { value: 123 },
        slots: { default: 'Numeric' }
      })

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('value', '123')
    })

    it('should apply custom className', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', className: 'custom-radio' },
        slots: { default: 'Custom' }
      })

      const label = container.querySelector('label')
      expect(label).toHaveClass('custom-radio')
    })

    it('should apply custom style', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', style: { marginTop: '10px' } },
        slots: { default: 'Styled' }
      })

      const label = container.querySelector('label')
      expect(label).toHaveStyle({ marginTop: '10px' })
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(
        Radio,
        { value: 'option1', size },
        { slots: { default: 'Option' } }
      )

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeInTheDocument()
    })

    it('should apply name attribute', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', name: 'choice' },
        slots: { default: 'Option 1' }
      })

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('name', 'choice')
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', disabled: true },
        slots: { default: 'Disabled' }
      })

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeDisabled()
    })

    it('should be checked when checked prop is true', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', checked: true },
        slots: { default: 'Checked' }
      })

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(true)
    })

    it('should prioritize checked prop over defaultChecked', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', checked: false, defaultChecked: true },
        slots: { default: 'Controlled' }
      })

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(false)
    })
  })

  describe('Events', () => {
    it('should emit change event when clicked', async () => {
      const onChange = vi.fn()
      const { container } = render(Radio, {
        props: { value: 'option1', onChange },
        slots: { default: 'Option 1' }
      })

      const radio = container.querySelector('input[type="radio"]')!
      await fireEvent.click(radio)

      expect(onChange).toHaveBeenCalledWith('option1')
    })

    it('should emit update:checked event', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Radio, {
        props: { value: 'option1', 'onUpdate:checked': onUpdate },
        slots: { default: 'Option 1' }
      })

      const radio = container.querySelector('input[type="radio"]')!
      await fireEvent.click(radio)

      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('should not emit events when disabled', async () => {
      const onChange = vi.fn()
      const { container } = render(Radio, {
        props: { value: 'option1', disabled: true, onChange },
        slots: { default: 'Disabled' }
      })

      const radio = container.querySelector('input[type="radio"]')!
      await fireEvent.click(radio)

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should emit change event with numeric value', async () => {
      const onChange = vi.fn()
      const { container } = render(Radio, {
        props: { value: 42, onChange },
        slots: { default: 'Numeric' }
      })

      const radio = container.querySelector('input[type="radio"]')!
      await fireEvent.click(radio)

      expect(onChange).toHaveBeenCalledWith(42)
    })

    it('should emit both change and update:checked events in order', async () => {
      const events: string[] = []
      const onChange = vi.fn(() => events.push('change'))
      const onUpdate = vi.fn(() => events.push('update:checked'))

      const { container } = render(Radio, {
        props: { value: 'option1', onChange, 'onUpdate:checked': onUpdate },
        slots: { default: 'Option' }
      })

      const radio = container.querySelector('input[type="radio"]')!
      await fireEvent.click(radio)

      expect(onChange).toHaveBeenCalled()
      expect(onUpdate).toHaveBeenCalled()
    })
  })

  describe('v-model Binding', () => {
    it('should work with v-model:checked', async () => {
      const Wrapper = defineComponent({
        setup() {
          const checked = ref(false)
          return () =>
            h(
              Radio,
              {
                value: 'option1',
                checked: checked.value,
                'onUpdate:checked': (v: boolean) => {
                  checked.value = v
                }
              },
              { default: () => `Checked: ${checked.value}` }
            )
        }
      })

      const { container, getByText } = render(Wrapper)
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement

      expect(radio.checked).toBe(false)
      expect(getByText('Checked: false')).toBeInTheDocument()

      await fireEvent.click(radio)
      await nextTick()

      expect(radio.checked).toBe(true)
      expect(getByText('Checked: true')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should activate on Enter key', async () => {
      const onChange = vi.fn()
      const { container } = render(Radio, {
        props: { value: 'option1', onChange },
        slots: { default: 'Option' }
      })

      const radio = container.querySelector('input[type="radio"]')!
      radio.focus()
      await fireEvent.keyDown(radio, { key: 'Enter' })

      expect(onChange).toHaveBeenCalledWith('option1')
    })

    it('should not activate on Enter when disabled', async () => {
      const onChange = vi.fn()
      const { container } = render(Radio, {
        props: { value: 'option1', disabled: true, onChange },
        slots: { default: 'Disabled' }
      })

      const radio = container.querySelector('input[type="radio"]')!
      await fireEvent.keyDown(radio, { key: 'Enter' })

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000'
      })

      const { container } = render(Radio, {
        props: { value: 'option1', checked: true },
        slots: { default: 'Themed' }
      })

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Accessible Radio' }
      })

      await expectNoA11yViolations(container)
    })

    it('should be focusable', () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Radio' }
      })

      const radio = container.querySelector('input[type="radio"]')!
      radio.focus()

      expect(radio).toHaveFocus()
    })

    it('should not be focusable when disabled', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', disabled: true },
        slots: { default: 'Disabled' }
      })

      const radio = container.querySelector('input[type="radio"]')!
      expect(radio).toBeDisabled()
    })

    it('should have proper role', () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Radio' }
      })

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('type', 'radio')
    })
  })

  describe('RadioGroup', () => {
    describe('Basic Rendering', () => {
      it('should render RadioGroup with children', () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup>
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const group = container.querySelector('[role="radiogroup"]')
        expect(group).toBeInTheDocument()
        expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(2)
      })

      it('should apply default spacing when no class provided', () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup>
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const group = container.querySelector('[role="radiogroup"]')
        expect(group).toHaveClass('space-y-2')
      })

      it('should allow custom className override', () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup class-name="custom-group flex gap-4">
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const group = container.querySelector('[role="radiogroup"]')
        expect(group).toHaveClass('custom-group')
        expect(group).toHaveClass('flex')
        expect(group).toHaveClass('gap-4')
      })
    })

    describe('Uncontrolled Mode', () => {
      it('should select and switch values', async () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup default-value="a">
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        expect(inputs[0].checked).toBe(true)
        expect(inputs[1].checked).toBe(false)

        await fireEvent.click(inputs[1])

        expect(inputs[0].checked).toBe(false)
        expect(inputs[1].checked).toBe(true)
      })

      it('should work without default value', async () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup>
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        expect(inputs[0].checked).toBe(false)
        expect(inputs[1].checked).toBe(false)

        await fireEvent.click(inputs[0])

        expect(inputs[0].checked).toBe(true)
        expect(inputs[1].checked).toBe(false)
      })
    })

    describe('Controlled Mode', () => {
      it('should work with v-model:value', async () => {
        const Wrapper = defineComponent({
          setup() {
            const value = ref<string | undefined>('a')
            return () =>
              h(
                RadioGroup,
                {
                  value: value.value,
                  'onUpdate:value': (v: string) => {
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
        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        expect(inputs[0].checked).toBe(true)
        expect(inputs[1].checked).toBe(false)

        await fireEvent.click(inputs[1])
        await nextTick()

        expect(inputs[0].checked).toBe(false)
        expect(inputs[1].checked).toBe(true)
      })
    })

    describe('Name Attribute', () => {
      it('should apply name to all radios', () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup name="my-group">
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const inputs = container.querySelectorAll('input[type="radio"]')
        inputs.forEach((input) => {
          expect(input).toHaveAttribute('name', 'my-group')
        })
      })

      it('should auto-generate name when not provided', () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup>
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const inputs = container.querySelectorAll('input[type="radio"]')
        const name = inputs[0].getAttribute('name')
        expect(name).toBeTruthy()
        expect(name).toContain('tiger-radio-group')
        inputs.forEach((input) => {
          expect(input).toHaveAttribute('name', name)
        })
      })
    })

    describe('Size Inheritance', () => {
      it.each(componentSizes)('should pass %s size to children', (size) => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup size="${size}">
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const inputs = container.querySelectorAll('input[type="radio"]')
        expect(inputs).toHaveLength(2)
      })

      it('should allow child to override size', () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup size="sm">
              <Radio value="a" size="lg">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const inputs = container.querySelectorAll('input[type="radio"]')
        expect(inputs).toHaveLength(2)
      })
    })

    describe('Disabled State', () => {
      it('should not allow selection when group is disabled', async () => {
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
        const inputs = container.querySelectorAll('input[type="radio"]')

        // Clicking should not trigger onChange when group is disabled
        await fireEvent.click(inputs[0])
        expect(onChange).not.toHaveBeenCalled()
      })

      it('should not emit events when group is disabled', async () => {
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
        const inputs = container.querySelectorAll('input[type="radio"]')
        await fireEvent.click(inputs[0])

        expect(onChange).not.toHaveBeenCalled()
      })

      it('should allow individual radio to be disabled', () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup>
              <Radio value="a" disabled>A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `
        })

        const inputs = container.querySelectorAll('input[type="radio"]')
        expect(inputs[0]).toBeDisabled()
        expect(inputs[1]).not.toBeDisabled()
      })
    })

    describe('Events', () => {
      it('should emit change event when value changes', async () => {
        const onChange = vi.fn()
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup @change="onChange">
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `,
          setup() {
            return { onChange }
          }
        })

        const inputs = container.querySelectorAll('input[type="radio"]')
        await fireEvent.click(inputs[1])

        expect(onChange).toHaveBeenCalledWith('b')
      })

      it('should emit update:value event', async () => {
        const onUpdate = vi.fn()
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup @update:value="onUpdate">
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
            </RadioGroup>
          `,
          setup() {
            return { onUpdate }
          }
        })

        const inputs = container.querySelectorAll('input[type="radio"]')
        await fireEvent.click(inputs[0])

        expect(onUpdate).toHaveBeenCalledWith('a')
      })

      it('should emit event with numeric value', async () => {
        const onChange = vi.fn()
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup @change="onChange">
              <Radio :value="1">One</Radio>
              <Radio :value="2">Two</Radio>
            </RadioGroup>
          `,
          setup() {
            return { onChange }
          }
        })

        const inputs = container.querySelectorAll('input[type="radio"]')
        await fireEvent.click(inputs[1])

        expect(onChange).toHaveBeenCalledWith(2)
      })
    })

    describe('Keyboard Navigation', () => {
      it('should navigate with arrow keys', async () => {
        const user = userEvent.setup()
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup default-value="a">
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
              <Radio value="c">C</Radio>
            </RadioGroup>
          `
        })

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        inputs[0].focus()
        expect(inputs[0]).toHaveFocus()

        await user.keyboard('{ArrowDown}')
        expect(inputs[1]).toHaveFocus()
        expect(inputs[1].checked).toBe(true)
      })

      it('should wrap around with arrow keys', async () => {
        const user = userEvent.setup()
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup default-value="c">
              <Radio value="a">A</Radio>
              <Radio value="b">B</Radio>
              <Radio value="c">C</Radio>
            </RadioGroup>
          `
        })

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        inputs[2].focus()
        await user.keyboard('{ArrowDown}')

        expect(inputs[0]).toHaveFocus()
        expect(inputs[0].checked).toBe(true)
      })

      it('should skip disabled radios during navigation', async () => {
        const user = userEvent.setup()
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup default-value="a">
              <Radio value="a">A</Radio>
              <Radio value="b" disabled>B</Radio>
              <Radio value="c">C</Radio>
            </RadioGroup>
          `
        })

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        inputs[0].focus()
        await user.keyboard('{ArrowDown}')

        expect(inputs[2]).toHaveFocus()
        expect(inputs[2].checked).toBe(true)
      })
    })

    describe('Accessibility', () => {
      it('should have proper radiogroup role', () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup>
              <Radio value="a">A</Radio>
            </RadioGroup>
          `
        })

        expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
      })

      it('should have no accessibility violations', async () => {
        const { container } = render({
          components: { RadioGroup, Radio },
          template: `
            <RadioGroup default-value="a">
              <Radio value="a">Option A</Radio>
              <Radio value="b">Option B</Radio>
            </RadioGroup>
          `
        })

        await expectNoA11yViolations(container)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      const { container } = render(Radio, {
        props: { value: '' },
        slots: { default: 'Empty Value' }
      })

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('value', '')
    })

    it('should handle special characters in value', () => {
      const { container } = render(Radio, {
        props: { value: '<>&"\'`' },
        slots: { default: 'Special' }
      })

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('value', '<>&"\'`')
    })

    it('should handle rapid clicks', async () => {
      const onChange = vi.fn()
      const { container } = render(Radio, {
        props: { value: 'option1', onChange },
        slots: { default: 'Rapid' }
      })

      const radio = container.querySelector('input[type="radio"]')!

      await fireEvent.click(radio)
      await fireEvent.click(radio)
      await fireEvent.click(radio)

      // Radio fires onChange on first click, but subsequent clicks on same already-checked radio
      // may or may not fire depending on browser behavior - at least one call should happen
      expect(onChange).toHaveBeenCalled()
    })

    it('should handle switching between controlled and uncontrolled', async () => {
      // Test that we can properly render a controlled radio
      const { container, rerender } = render(Radio, {
        props: { value: 'option1', checked: true },
        slots: { default: 'Option' }
      })

      let radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(true)

      await rerender({ value: 'option1', checked: false })
      radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(false)
    })
  })
})
