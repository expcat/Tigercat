/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { nextTick, defineComponent, h, ref } from 'vue'
import { focusFirstInvalidField } from '@expcat/tigercat-core'
import { Checkbox } from '@expcat/tigercat-vue/Checkbox'
import { CheckboxGroup } from '@expcat/tigercat-vue/CheckboxGroup'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { expectNoA11yViolationsIsolated, setThemeVariables, clearThemeVariables } from '../utils'

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
    it('distinguishes a missing value from an explicit false value', () => {
      const { container } = renderGroup(`
        <CheckboxGroup :default-value="[false]">
          <Checkbox>Missing value</Checkbox>
          <Checkbox :value="false">False value</Checkbox>
        </CheckboxGroup>
      `)
      const [missing, explicitFalse] = getBoxes(container)

      expect.soft(missing).not.toBeChecked()
      expect(explicitFalse).toBeChecked()
    })

    it('inherits group errors without a FormItem and keeps a single invalid owner', () => {
      const { container } = renderGroup(`
        <div>
          <Checkbox status="error">Error reference</Checkbox>
          <CheckboxGroup status="error">
            <Checkbox value="a">A</Checkbox>
            <Checkbox value="b">B</Checkbox>
            <Checkbox value="c" status="default">Default</Checkbox>
          </CheckboxGroup>
        </div>
      `)
      const [reference, first, second, explicitDefault] = getBoxes(container)
      const errorVisual = reference.nextElementSibling?.className

      expect.soft(first).toHaveAttribute('aria-invalid', 'true')
      expect(second).not.toHaveAttribute('aria-invalid')
      expect(explicitDefault).not.toHaveAttribute('aria-invalid')
      expect.soft(first.nextElementSibling?.className).toBe(errorVisual)
      expect.soft(second.nextElementSibling?.className).toBe(errorVisual)
      expect(explicitDefault.nextElementSibling?.className).not.toBe(errorVisual)
    })

    it('renders children checkboxes', () => {
      const { container } = renderGroup(`
        <CheckboxGroup>
          <Checkbox value="a">A</Checkbox>
          <Checkbox value="b">B</Checkbox>
        </CheckboxGroup>
      `)
      expect(getBoxes(container)).toHaveLength(2)
    })

    it('renders options when the default slot is empty', () => {
      const { container, getByText } = render(CheckboxGroup, {
        props: {
          options: [
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms', disabled: true }
          ],
          defaultValue: ['email']
        }
      })
      const inputs = getBoxes(container)
      expect(inputs).toHaveLength(2)
      expect(getByText('Email')).toBeInTheDocument()
      expect(inputs[0].checked).toBe(true)
      expect(inputs[1]).toBeDisabled()
    })

    it('ignores options when children are present', () => {
      const { container, getByText, queryByText } = renderGroup(`
        <CheckboxGroup :options="[{ label: 'From options', value: 'opt' }]">
          <Checkbox value="slot">From slot</Checkbox>
        </CheckboxGroup>
      `)
      expect(getBoxes(container)).toHaveLength(1)
      expect(getByText('From slot')).toBeInTheDocument()
      expect(queryByText('From options')).not.toBeInTheDocument()
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
    it('preserves each grouped checkbox description', () => {
      const { container } = renderGroup(`
        <CheckboxGroup>
          <Checkbox value="a" aria-describedby="help-a">A</Checkbox>
          <Checkbox value="b" aria-describedby="help-b">B</Checkbox>
        </CheckboxGroup>
      `)

      const boxes = getBoxes(container)
      expect(boxes[0]).toHaveAttribute('aria-describedby', 'help-a')
      expect(boxes[1]).toHaveAttribute('aria-describedby', 'help-b')
    })

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

  describe('FormItem', () => {
    it.each(['options', 'children'] as const)(
      'moves the error owner after removing the first (%s)',
      async (source) => {
        const options = ref([
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' }
        ])
        const { container } = render({
          setup: () => () =>
            h(FormItem, { error: 'Choose an option' }, () =>
              source === 'options'
                ? h(CheckboxGroup, { options: options.value })
                : h(CheckboxGroup, {}, () =>
                    options.value.map((option) =>
                      h(Checkbox, { key: option.value, value: option.value }, () => option.label)
                    )
                  )
            )
        })
        await nextTick()
        const [first, second] = getBoxes(container)
        const errorId = first.getAttribute('aria-describedby')
        expect(first).toHaveAttribute('aria-invalid', 'true')
        expect(second).not.toHaveAttribute('aria-invalid')
        expect(errorId).toBeTruthy()

        options.value = [{ label: 'B', value: 'b' }]
        await nextTick()

        expect(getBoxes(container)).toHaveLength(1)
        expect(getBox(container)).toHaveAttribute('value', 'b')
        expect(getBox(container)).toHaveAttribute('aria-invalid', 'true')
        expect(getBox(container)).toHaveAttribute('aria-describedby', errorId)
      }
    )

    it.each(['options', 'children'] as const)(
      'focuses the first enabled error owner (%s)',
      async (source) => {
        const { container } = render({
          setup: () => () =>
            h(FormItem, { error: 'Choose an option' }, () =>
              source === 'options'
                ? h(CheckboxGroup, {
                    options: [
                      { label: 'A', value: 'a', disabled: true },
                      { label: 'B', value: 'b' }
                    ]
                  })
                : h(CheckboxGroup, { options: [{ label: 'Unused', value: 'unused' }] }, () => [
                    h(Checkbox, { value: 'a', disabled: true }, () => 'A'),
                    h(Checkbox, { value: 'b' }, () => 'B')
                  ])
            )
        })
        await nextTick()
        const [first, second] = getBoxes(container)

        expect(first).toBeDisabled()
        expect(first).not.toHaveAttribute('aria-invalid')
        expect.soft(second).toHaveAttribute('aria-invalid', 'true')
        expect.soft(second).toHaveAccessibleDescription('Choose an option')
        focusFirstInvalidField(container)
        expect(second).toHaveFocus()
      }
    )

    it('assigns distinct default ids to grouped checkboxes in a named FormItem', () => {
      const { container } = render({
        components: { Form, FormItem, Checkbox, CheckboxGroup },
        template: `<Form :model-value="{ tags: [] }">
          <FormItem name="tags" label="Tags">
            <CheckboxGroup>
              <Checkbox value="a">A</Checkbox>
              <Checkbox value="b">B</Checkbox>
            </CheckboxGroup>
          </FormItem>
        </Form>`
      })

      const boxes = getBoxes(container)
      expect(boxes[0].id).toBeTruthy()
      expect(boxes[1].id).toBeTruthy()
      expect(boxes[0].id).not.toBe(boxes[1].id)
    })

    it('reads FormItem when modelValue is omitted', () => {
      const { container } = render({
        components: { Form, FormItem, Checkbox },
        template:
          '<Form :model-value="{ agree: true }"><FormItem name="agree" label="Agree"><Checkbox>Agree</Checkbox></FormItem></Form>'
      })
      expect(getBox(container).checked).toBe(true)
    })

    it('reads FormItem array values on CheckboxGroup', () => {
      const { container } = render({
        components: { Form, FormItem, Checkbox, CheckboxGroup },
        template: `<Form :model-value="{ tags: ['a'] }">
          <FormItem name="tags" label="Tags">
            <CheckboxGroup>
              <Checkbox value="a">A</Checkbox>
              <Checkbox value="b">B</Checkbox>
            </CheckboxGroup>
          </FormItem>
        </Form>`
      })
      const boxes = getBoxes(container)
      expect(boxes[0]?.checked).toBe(true)
      expect(boxes[1]?.checked).toBe(false)
    })
  })
})
