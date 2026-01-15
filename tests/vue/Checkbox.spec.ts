/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { nextTick, defineComponent, h } from 'vue'
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils'

describe('Checkbox', () => {
  it('renders checkbox input and label', () => {
    const { container, getByText } = render(Checkbox, {
      slots: { default: 'Check me' }
    })

    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    expect(getByText('Check me')).toBeInTheDocument()
  })

  it.each(componentSizes)('renders %s size', (size) => {
    const { container } = renderWithProps(Checkbox, { size }, { slots: { default: 'Checkbox' } })
    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
  })

  it('supports disabled', () => {
    const { container } = render(Checkbox, {
      props: { disabled: true },
      slots: { default: 'Disabled' }
    })

    expect(container.querySelector('input[type="checkbox"]')).toBeDisabled()
  })

  it('supports controlled modelValue', () => {
    const { container } = render(Checkbox, {
      props: { modelValue: true },
      slots: { default: 'Checked' }
    })

    expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(
      true
    )
  })

  it('supports uncontrolled defaultChecked', () => {
    const { container } = render(Checkbox, {
      props: { defaultChecked: true },
      slots: { default: 'Default checked' }
    })

    expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(
      true
    )
  })

  it('supports indeterminate', async () => {
    const { container } = render(Checkbox, {
      props: { indeterminate: true },
      slots: { default: 'Indeterminate' }
    })

    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    await nextTick()
    expect(checkbox.indeterminate).toBe(true)
  })

  it('emits update:modelValue when clicked (non-group)', async () => {
    const onUpdate = vi.fn()
    const { container } = render(Checkbox, {
      props: { 'onUpdate:modelValue': onUpdate },
      slots: { default: 'Checkbox' }
    })

    await fireEvent.click(container.querySelector('input[type="checkbox"]')!)
    expect(onUpdate).toHaveBeenCalledWith(true)
  })

  it('does not emit update:modelValue when disabled', async () => {
    const onUpdate = vi.fn()
    const { container } = render(Checkbox, {
      props: { disabled: true, 'onUpdate:modelValue': onUpdate },
      slots: { default: 'Disabled' }
    })

    await fireEvent.click(container.querySelector('input[type="checkbox"]')!)
    expect(onUpdate).not.toHaveBeenCalled()
  })

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
  })
})
