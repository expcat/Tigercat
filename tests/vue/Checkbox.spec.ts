/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { nextTick, defineComponent, h, ref } from 'vue'
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils'

const getBox = (container: HTMLElement) =>
  container.querySelector('input[type="checkbox"]') as HTMLInputElement
const getBoxes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[]

const renderGroup = (template: string, setup?: () => Record<string, unknown>) =>
  render({ components: { CheckboxGroup, Checkbox }, template, setup })

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders the input and label, unchecked by default with the value', () => {
      const { container, getByText } = render(Checkbox, {
        props: { value: 'option1' },
        slots: { default: 'Check me' }
      })
      const box = getBox(container)
      expect(box).toBeInTheDocument()
      expect(box).toHaveAttribute('value', 'option1')
      expect(box.checked).toBe(false)
      expect(getByText('Check me')).toBeInTheDocument()
    })

    it('applies custom className to the label', () => {
      const { container } = render(Checkbox, {
        props: { className: 'custom-checkbox' },
        slots: { default: 'Custom' }
      })
      expect(container.querySelector('label')).toHaveClass('custom-checkbox')
    })

    it.each(componentSizes)('renders %s size', (size) => {
      const { container } = renderWithProps(Checkbox, { size }, { slots: { default: 'Checkbox' } })
      expect(getBox(container)).toBeInTheDocument()
    })
  })

  describe('Disabled state', () => {
    it('is disabled and does not emit when clicked', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { disabled: true, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Disabled' }
      })
      const box = getBox(container)
      expect(box).toBeDisabled()
      await fireEvent.click(box)
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Controlled and uncontrolled', () => {
    it('reflects modelValue and reacts to changes', async () => {
      const { container, rerender } = render(Checkbox, {
        props: { modelValue: false },
        slots: { default: 'Checkbox' }
      })
      expect(getBox(container).checked).toBe(false)
      await rerender({ modelValue: true })
      expect(getBox(container).checked).toBe(true)
    })

    it('emits update:modelValue when clicked', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { modelValue: false, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Checkbox' }
      })
      await fireEvent.click(getBox(container))
      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('works with a v-model pattern', async () => {
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
      const box = getBox(container)
      expect(box.checked).toBe(false)
      await fireEvent.click(box)
      await nextTick()
      expect(box.checked).toBe(true)
      expect(getByText('Checked: true')).toBeInTheDocument()
    })

    it('toggles in uncontrolled mode from defaultValue', async () => {
      const { container } = render(Checkbox, {
        props: { defaultValue: false },
        slots: { default: 'Uncontrolled' }
      })
      const box = getBox(container)
      expect(box.checked).toBe(false)
      await fireEvent.click(box)
      expect(box.checked).toBe(true)
      await fireEvent.click(box)
      expect(box.checked).toBe(false)
    })
  })

  describe('Indeterminate state', () => {
    it('reflects and toggles the indeterminate prop', async () => {
      const { container, rerender } = render(Checkbox, {
        props: { indeterminate: true },
        slots: { default: 'Indeterminate' }
      })
      await nextTick()
      expect(getBox(container).indeterminate).toBe(true)
      await rerender({ indeterminate: false })
      await nextTick()
      expect(getBox(container).indeterminate).toBe(false)
    })
  })

  describe('Events', () => {
    it('emits change (value, event) and update:modelValue on click', async () => {
      const onChange = vi.fn()
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { onChange, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Checkbox' }
      })
      await fireEvent.click(getBox(container))
      expect(onChange.mock.calls[0][0]).toBe(true)
      expect(onChange.mock.calls[0][1]).toBeInstanceOf(Event)
      expect(onUpdate).toHaveBeenCalledWith(true)
    })
  })

  describe('CheckboxGroup', () => {
    it('renders children checkboxes', () => {
      const { container } = renderGroup(`
        <CheckboxGroup>
          <Checkbox value="a">A</Checkbox>
          <Checkbox value="b">B</Checkbox>
        </CheckboxGroup>
      `)
      expect(getBoxes(container)).toHaveLength(2)
    })

    it('selects and deselects items (uncontrolled)', async () => {
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
      const inputs = getBoxes(container)
      expect(inputs[0].checked).toBe(true)
      expect(inputs[1].checked).toBe(false)

      await fireEvent.click(inputs[1])
      expect(onUpdate).toHaveBeenCalledWith(['apple', 'banana'])

      await fireEvent.click(inputs[0])
      expect(onUpdate).toHaveBeenLastCalledWith(['banana'])
    })
    it('works as a controlled group with v-model', async () => {
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
      const inputs = getBoxes(container)
      expect(inputs[0].checked).toBe(true)
      await fireEvent.click(inputs[1])
      await nextTick()
      expect(inputs[1].checked).toBe(true)
    })
    it('does not emit when the group is disabled', async () => {
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
      const inputs = getBoxes(container)
      inputs.forEach((input) => expect(input).toBeDisabled())
      await fireEvent.click(inputs[0])
      expect(onChange).not.toHaveBeenCalled()
    })
    it('emits change and update:modelValue with the selected values', async () => {
      const onChange = vi.fn()
      const onUpdate = vi.fn()
      const { container } = renderGroup(
        `
        <CheckboxGroup @change="onChange" @update:modelValue="onUpdate">
          <Checkbox value="a">A</Checkbox>
          <Checkbox value="b">B</Checkbox>
        </CheckboxGroup>
      `,
        () => ({ onChange, onUpdate })
      )
      await fireEvent.click(getBoxes(container)[0])
      expect(onChange).toHaveBeenCalledWith(['a'])
      expect(onUpdate).toHaveBeenCalledWith(['a'])
    })

    it('supports a select-all / indeterminate pattern', async () => {
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
      const inputs = getBoxes(container)
      const selectAll = inputs[0]
      const options = inputs.slice(1)

      expect(selectAll.checked).toBe(false)
      expect(selectAll.indeterminate).toBe(false)

      await fireEvent.click(selectAll)
      await nextTick()
      expect(selectAll.checked).toBe(true)
      options.forEach((cb) => expect(cb.checked).toBe(true))

      await fireEvent.click(options[0])
      await nextTick()
      expect(selectAll.indeterminate).toBe(true)

      await fireEvent.click(selectAll)
      await nextTick()
      expect(selectAll.checked).toBe(true)
      expect(selectAll.indeterminate).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('is focusable', () => {
      const { container } = render(Checkbox, { slots: { default: 'Checkbox' } })
      const box = getBox(container)
      box.focus()
      expect(box).toHaveFocus()
    })

    it('has no violations for a standalone checkbox', async () => {
      const { container } = render(Checkbox, { slots: { default: 'Accessible Checkbox' } })
      await expectNoA11yViolationsIsolated(container)
    })

    it('has no violations for a checkbox group', async () => {
      const { container } = renderGroup(`
        <CheckboxGroup>
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      `)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
