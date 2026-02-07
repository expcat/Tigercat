/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { nextTick, defineComponent, h, ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils'

describe('Checkbox', () => {
  describe('Basic Rendering', () => {
    it('renders checkbox input and label', () => {
      const { container, getByText } = render(Checkbox, {
        slots: { default: 'Check me' }
      })

      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
      expect(getByText('Check me')).toBeInTheDocument()
    })

    it('renders checkbox without label', () => {
      const { container } = render(Checkbox)

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeInTheDocument()
    })

    it('renders unchecked by default', () => {
      const { container } = render(Checkbox, {
        slots: { default: 'Checkbox' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('renders with value prop', () => {
      const { container } = render(Checkbox, {
        props: { value: 'option1' },
        slots: { default: 'Option 1' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', 'option1')
    })

    it('renders with numeric value', () => {
      const { container } = render(Checkbox, {
        props: { value: 42 },
        slots: { default: 'Numeric' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', '42')
    })

    it('applies custom className', () => {
      const { container } = render(Checkbox, {
        props: { className: 'custom-checkbox' },
        slots: { default: 'Custom' }
      })

      const label = container.querySelector('label')
      expect(label).toHaveClass('custom-checkbox')
    })

    it('applies custom className to standalone checkbox', () => {
      const { container } = render(Checkbox, {
        props: { className: 'custom-checkbox' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveClass('custom-checkbox')
    })

    it('applies custom style', () => {
      const { container } = render(Checkbox, {
        props: { style: { marginTop: '10px' } },
        slots: { default: 'Styled' }
      })

      const label = container.querySelector('label')
      expect(label).toHaveStyle({ marginTop: '10px' })
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('renders %s size', (size) => {
      const { container } = renderWithProps(Checkbox, { size }, { slots: { default: 'Checkbox' } })
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('supports disabled', () => {
      const { container } = render(Checkbox, {
        props: { disabled: true },
        slots: { default: 'Disabled' }
      })

      expect(container.querySelector('input[type="checkbox"]')).toBeDisabled()
    })

    it('does not emit events when disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { disabled: true, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Disabled' }
      })

      await fireEvent.click(container.querySelector('input[type="checkbox"]')!)
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('cannot be toggled when disabled', async () => {
      const user = userEvent.setup()
      const { container } = render(Checkbox, {
        props: { disabled: true, defaultChecked: true },
        slots: { default: 'Disabled' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      await user.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Controlled Mode (modelValue)', () => {
    it('supports controlled modelValue', () => {
      const { container } = render(Checkbox, {
        props: { modelValue: true },
        slots: { default: 'Checked' }
      })

      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(
        true
      )
    })

    it('responds to modelValue changes', async () => {
      const { container, rerender } = render(Checkbox, {
        props: { modelValue: false },
        slots: { default: 'Checkbox' }
      })

      let checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await rerender({ modelValue: true })
      checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('emits update:modelValue when clicked', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { modelValue: false, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Checkbox' }
      })

      await fireEvent.click(container.querySelector('input[type="checkbox"]')!)
      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('works with v-model pattern', async () => {
      const Wrapper = defineComponent({
        setup() {
          const checked = ref(false)
          return () =>
            h(
              Checkbox,
              {
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
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement

      expect(checkbox.checked).toBe(false)
      expect(getByText('Checked: false')).toBeInTheDocument()

      await fireEvent.click(checkbox)
      await nextTick()

      expect(checkbox.checked).toBe(true)
      expect(getByText('Checked: true')).toBeInTheDocument()
    })
  })

  describe('Uncontrolled Mode (defaultChecked)', () => {
    it('supports uncontrolled defaultChecked', () => {
      const { container } = render(Checkbox, {
        props: { defaultChecked: true },
        slots: { default: 'Default checked' }
      })

      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(
        true
      )
    })

    it('can be toggled in uncontrolled mode', async () => {
      const { container } = render(Checkbox, {
        props: { defaultChecked: false },
        slots: { default: 'Uncontrolled' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)

      await fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })

    it('emits update:modelValue in uncontrolled mode', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Checkbox' }
      })

      await fireEvent.click(container.querySelector('input[type="checkbox"]')!)
      expect(onUpdate).toHaveBeenCalledWith(true)
    })
  })

  describe('Indeterminate State', () => {
    it('supports indeterminate', async () => {
      const { container } = render(Checkbox, {
        props: { indeterminate: true },
        slots: { default: 'Indeterminate' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      await nextTick()
      expect(checkbox.indeterminate).toBe(true)
    })

    it('indeterminate can be toggled', async () => {
      const { container, rerender } = render(Checkbox, {
        props: { indeterminate: true },
        slots: { default: 'Indeterminate' }
      })

      let checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      await nextTick()
      expect(checkbox.indeterminate).toBe(true)

      await rerender({ indeterminate: false })
      checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      await nextTick()
      expect(checkbox.indeterminate).toBe(false)
    })

    it('clicking indeterminate checkbox emits change', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { indeterminate: true, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Indeterminate' }
      })

      await fireEvent.click(container.querySelector('input[type="checkbox"]')!)
      expect(onUpdate).toHaveBeenCalledWith(true)
    })
  })

  describe('Events', () => {
    it('emits change event with value and event', async () => {
      const onChange = vi.fn()
      const { container } = render(Checkbox, {
        props: { onChange },
        slots: { default: 'Checkbox' }
      })

      await fireEvent.click(container.querySelector('input[type="checkbox"]')!)
      expect(onChange).toHaveBeenCalled()
      expect(onChange.mock.calls[0][0]).toBe(true)
      expect(onChange.mock.calls[0][1]).toBeInstanceOf(Event)
    })

    it('emits both update:modelValue and change events', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()

      const { container } = render(Checkbox, {
        props: { 'onUpdate:modelValue': onUpdate, onChange },
        slots: { default: 'Checkbox' }
      })

      await fireEvent.click(container.querySelector('input[type="checkbox"]')!)

      expect(onUpdate).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('CheckboxGroup', () => {
    describe('Basic Rendering', () => {
      it('renders CheckboxGroup with children', () => {
        const { container } = render({
          components: { CheckboxGroup, Checkbox },
          template: `
            <CheckboxGroup>
              <Checkbox value="a">A</Checkbox>
              <Checkbox value="b">B</Checkbox>
            </CheckboxGroup>
          `
        })

        expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
      })

      it('applies className to group', () => {
        const { container } = render({
          components: { CheckboxGroup, Checkbox },
          template: `
            <CheckboxGroup class-name="custom-group">
              <Checkbox value="a">A</Checkbox>
            </CheckboxGroup>
          `
        })

        const group = container.querySelector('div.custom-group')
        expect(group).toBeInTheDocument()
      })
    })

    describe('Uncontrolled Mode', () => {
      it('supports group selection via CheckboxGroup', async () => {
        const onUpdate = vi.fn()
        const Wrapper = defineComponent({
          setup() {
            return () =>
              h(
                CheckboxGroup,
                { defaultValue: ['apple'], 'onUpdate:modelValue': onUpdate },
                {
                  default: () => [
                    h(Checkbox, { value: 'apple' }, () => 'Apple'),
                    h(Checkbox, { value: 'banana' }, () => 'Banana')
                  ]
                }
              )
          }
        })

        const { container } = render(Wrapper)
        const inputs = container.querySelectorAll('input[type="checkbox"]')

        expect((inputs[0] as HTMLInputElement).checked).toBe(true)
        expect((inputs[1] as HTMLInputElement).checked).toBe(false)

        await fireEvent.click(inputs[1])
        expect(onUpdate).toHaveBeenCalledWith(['apple', 'banana'])
      })

      it('can uncheck item in group', async () => {
        const onUpdate = vi.fn()
        const Wrapper = defineComponent({
          setup() {
            return () =>
              h(
                CheckboxGroup,
                { defaultValue: ['apple', 'banana'], 'onUpdate:modelValue': onUpdate },
                {
                  default: () => [
                    h(Checkbox, { value: 'apple' }, () => 'Apple'),
                    h(Checkbox, { value: 'banana' }, () => 'Banana')
                  ]
                }
              )
          }
        })

        const { container } = render(Wrapper)
        const inputs = container.querySelectorAll('input[type="checkbox"]')

        await fireEvent.click(inputs[0])
        expect(onUpdate).toHaveBeenCalledWith(['banana'])
      })

      it('works without default value', async () => {
        const onUpdate = vi.fn()
        const Wrapper = defineComponent({
          setup() {
            return () =>
              h(
                CheckboxGroup,
                { 'onUpdate:modelValue': onUpdate },
                {
                  default: () => [
                    h(Checkbox, { value: 'apple' }, () => 'Apple'),
                    h(Checkbox, { value: 'banana' }, () => 'Banana')
                  ]
                }
              )
          }
        })

        const { container } = render(Wrapper)
        const inputs = container.querySelectorAll('input[type="checkbox"]')

        expect((inputs[0] as HTMLInputElement).checked).toBe(false)
        expect((inputs[1] as HTMLInputElement).checked).toBe(false)

        await fireEvent.click(inputs[0])
        expect(onUpdate).toHaveBeenCalledWith(['apple'])
      })
    })

    describe('Controlled Mode', () => {
      it('works with v-model', async () => {
        const Wrapper = defineComponent({
          setup() {
            const value = ref<(string | number | boolean)[]>(['apple'])
            return () =>
              h(
                CheckboxGroup,
                {
                  modelValue: value.value,
                  'onUpdate:modelValue': (v: (string | number | boolean)[]) => {
                    value.value = v
                  }
                },
                {
                  default: () => [
                    h(Checkbox, { value: 'apple' }, () => 'Apple'),
                    h(Checkbox, { value: 'banana' }, () => 'Banana')
                  ]
                }
              )
          }
        })

        const { container } = render(Wrapper)
        const inputs = container.querySelectorAll('input[type="checkbox"]')

        expect((inputs[0] as HTMLInputElement).checked).toBe(true)
        expect((inputs[1] as HTMLInputElement).checked).toBe(false)

        await fireEvent.click(inputs[1])
        await nextTick()

        expect((inputs[0] as HTMLInputElement).checked).toBe(true)
        expect((inputs[1] as HTMLInputElement).checked).toBe(true)
      })
    })

    describe('Size Inheritance', () => {
      it.each(componentSizes)('passes %s size to children', (size) => {
        const { container } = render({
          components: { CheckboxGroup, Checkbox },
          template: `
            <CheckboxGroup size="${size}">
              <Checkbox value="a">A</Checkbox>
              <Checkbox value="b">B</Checkbox>
            </CheckboxGroup>
          `
        })

        expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
      })

      it('allows child to override size', () => {
        const { container } = render({
          components: { CheckboxGroup, Checkbox },
          template: `
            <CheckboxGroup size="sm">
              <Checkbox value="a" size="lg">A</Checkbox>
              <Checkbox value="b">B</Checkbox>
            </CheckboxGroup>
          `
        })

        expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
      })
    })

    describe('Disabled State', () => {
      it('should not allow selection when group is disabled', async () => {
        const onChange = vi.fn()
        const Wrapper = defineComponent({
          setup() {
            return () =>
              h(
                CheckboxGroup,
                { disabled: true, onChange },
                {
                  default: () => [
                    h(Checkbox, { value: 'a' }, () => 'A'),
                    h(Checkbox, { value: 'b' }, () => 'B')
                  ]
                }
              )
          }
        })

        const { container } = render(Wrapper)
        const inputs = container.querySelectorAll('input[type="checkbox"]')

        // Clicking should not trigger onChange when group is disabled
        await fireEvent.click(inputs[0])
        expect(onChange).not.toHaveBeenCalled()
      })

      it('does not emit events when group is disabled', async () => {
        const onChange = vi.fn()
        const Wrapper = defineComponent({
          setup() {
            return () =>
              h(
                CheckboxGroup,
                { disabled: true, onChange },
                {
                  default: () => [h(Checkbox, { value: 'a' }, () => 'A')]
                }
              )
          }
        })

        const { container } = render(Wrapper)
        await fireEvent.click(container.querySelector('input[type="checkbox"]')!)
        expect(onChange).not.toHaveBeenCalled()
      })

      it('allows individual checkbox to be disabled', () => {
        const { container } = render({
          components: { CheckboxGroup, Checkbox },
          template: `
            <CheckboxGroup>
              <Checkbox value="a" disabled>A</Checkbox>
              <Checkbox value="b">B</Checkbox>
            </CheckboxGroup>
          `
        })

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        expect(inputs[0]).toBeDisabled()
        expect(inputs[1]).not.toBeDisabled()
      })
    })

    describe('Events', () => {
      it('emits change event with selected values', async () => {
        const onChange = vi.fn()
        const { container } = render({
          components: { CheckboxGroup, Checkbox },
          template: `
            <CheckboxGroup @change="onChange">
              <Checkbox value="a">A</Checkbox>
              <Checkbox value="b">B</Checkbox>
            </CheckboxGroup>
          `,
          setup() {
            return { onChange }
          }
        })

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        await fireEvent.click(inputs[0])

        expect(onChange).toHaveBeenCalledWith(['a'])
      })

      it('emits update:modelValue event', async () => {
        const onUpdate = vi.fn()
        const { container } = render({
          components: { CheckboxGroup, Checkbox },
          template: `
            <CheckboxGroup @update:modelValue="onUpdate">
              <Checkbox value="a">A</Checkbox>
              <Checkbox value="b">B</Checkbox>
            </CheckboxGroup>
          `,
          setup() {
            return { onUpdate }
          }
        })

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        await fireEvent.click(inputs[1])

        expect(onUpdate).toHaveBeenCalledWith(['b'])
      })

      it('emits with numeric values', async () => {
        const onChange = vi.fn()
        const { container } = render({
          components: { CheckboxGroup, Checkbox },
          template: `
            <CheckboxGroup @change="onChange">
              <Checkbox :value="1">One</Checkbox>
              <Checkbox :value="2">Two</Checkbox>
            </CheckboxGroup>
          `,
          setup() {
            return { onChange }
          }
        })

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        await fireEvent.click(inputs[0])
        await fireEvent.click(inputs[1])

        expect(onChange).toHaveBeenLastCalledWith([1, 2])
      })
    })

    describe('Select All Pattern', () => {
      it('supports select all / deselect all pattern', async () => {
        const Wrapper = defineComponent({
          setup() {
            const values = ref<string[]>([])
            const allOptions = ['a', 'b', 'c']

            const isAllChecked = () => values.value.length === allOptions.length
            const isIndeterminate = () =>
              values.value.length > 0 && values.value.length < allOptions.length

            const toggleAll = (checked: boolean) => {
              values.value = checked ? [...allOptions] : []
            }

            return () =>
              h('div', [
                h(
                  Checkbox,
                  {
                    modelValue: isAllChecked(),
                    indeterminate: isIndeterminate(),
                    'onUpdate:modelValue': toggleAll
                  },
                  () => 'Select All'
                ),
                h(
                  CheckboxGroup,
                  {
                    modelValue: values.value,
                    'onUpdate:modelValue': (v: string[]) => {
                      values.value = v
                    }
                  },
                  {
                    default: () =>
                      allOptions.map((opt) => h(Checkbox, { value: opt, key: opt }, () => opt))
                  }
                )
              ])
          }
        })

        const { container } = render(Wrapper)
        const inputs = container.querySelectorAll(
          'input[type="checkbox"]'
        ) as NodeListOf<HTMLInputElement>
        const selectAllCheckbox = inputs[0]
        const optionCheckboxes = Array.from(inputs).slice(1) as HTMLInputElement[]

        // Initially nothing is selected
        expect(selectAllCheckbox.checked).toBe(false)
        expect(selectAllCheckbox.indeterminate).toBe(false)
        optionCheckboxes.forEach((cb) => expect(cb.checked).toBe(false))

        // Click select all
        await fireEvent.click(selectAllCheckbox)
        await nextTick()

        expect(selectAllCheckbox.checked).toBe(true)
        optionCheckboxes.forEach((cb) => expect(cb.checked).toBe(true))

        // Uncheck one option -> indeterminate
        await fireEvent.click(optionCheckboxes[0])
        await nextTick()

        expect(selectAllCheckbox.indeterminate).toBe(true)

        // Click select all again to select all
        await fireEvent.click(selectAllCheckbox)
        await nextTick()

        expect(selectAllCheckbox.checked).toBe(true)
        expect(selectAllCheckbox.indeterminate).toBe(false)
      })
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('supports theme variables', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000'
      })

      render(Checkbox, {
        props: { modelValue: true },
        slots: { default: 'Themed' }
      })

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(Checkbox, {
        slots: { default: 'Accessible Checkbox' }
      })

      await expectNoA11yViolations(container)
    })

    it('is focusable', () => {
      const { container } = render(Checkbox, {
        slots: { default: 'Checkbox' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')!
      checkbox.focus()
      expect(checkbox).toHaveFocus()
    })

    it('has proper type attribute', () => {
      const { container } = render(Checkbox, {
        slots: { default: 'Checkbox' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })

    it('CheckboxGroup passes accessibility checks', async () => {
      const { container } = render({
        components: { CheckboxGroup, Checkbox },
        template: `
          <CheckboxGroup>
            <Checkbox value="a">Option A</Checkbox>
            <Checkbox value="b">Option B</Checkbox>
          </CheckboxGroup>
        `
      })

      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string value', () => {
      const { container } = render(Checkbox, {
        props: { value: '' },
        slots: { default: 'Empty Value' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', '')
    })

    it('handles boolean value', () => {
      const { container } = render(Checkbox, {
        props: { value: true },
        slots: { default: 'Boolean' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', 'true')
    })

    it('handles special characters in value', () => {
      const { container } = render(Checkbox, {
        props: { value: '<>&"\'`' },
        slots: { default: 'Special' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', '<>&"\'`')
    })

    it('handles rapid clicks', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Rapid' }
      })

      const checkbox = container.querySelector('input[type="checkbox"]')!

      await fireEvent.click(checkbox)
      await fireEvent.click(checkbox)
      await fireEvent.click(checkbox)

      expect(onUpdate).toHaveBeenCalledTimes(3)
      expect(onUpdate.mock.calls[0][0]).toBe(true)
      expect(onUpdate.mock.calls[1][0]).toBe(false)
      expect(onUpdate.mock.calls[2][0]).toBe(true)
    })

    it('handles switching between controlled and uncontrolled', async () => {
      const { container, rerender } = render(Checkbox, {
        props: { defaultChecked: true },
        slots: { default: 'Checkbox' }
      })

      let checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      await rerender({ modelValue: false })
      checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('handles many checkboxes in group', async () => {
      const options = Array.from({ length: 20 }, (_, i) => `option${i}`)
      const Wrapper = defineComponent({
        setup() {
          const values = ref<string[]>([])
          return () =>
            h(
              CheckboxGroup,
              {
                modelValue: values.value,
                'onUpdate:modelValue': (v: string[]) => {
                  values.value = v
                }
              },
              {
                default: () =>
                  options.map((opt) => h(Checkbox, { value: opt, key: opt }, () => opt))
              }
            )
        }
      })

      const { container } = render(Wrapper)
      const inputs = container.querySelectorAll('input[type="checkbox"]')

      expect(inputs).toHaveLength(20)

      // Click first and last
      await fireEvent.click(inputs[0])
      await fireEvent.click(inputs[19])
      await nextTick()

      expect((inputs[0] as HTMLInputElement).checked).toBe(true)
      expect((inputs[19] as HTMLInputElement).checked).toBe(true)
      expect((inputs[10] as HTMLInputElement).checked).toBe(false)
    })
  })
})
