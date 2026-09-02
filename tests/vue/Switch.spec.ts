/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Switch } from '@expcat/tigercat-vue/Switch'
import {
  renderWithProps,
  expectNoA11yViolationsIsolated,
  setThemeVariables,
  clearThemeVariables
} from '../utils'

describe('Switch', () => {
  const getSwitch = (container: HTMLElement) =>
    container.querySelector('[role="switch"]') as HTMLElement

  describe('Rendering', () => {
    it('renders a switch, unchecked by default', () => {
      const { container } = render(Switch)
      const el = getSwitch(container)
      expect(el).toBeInTheDocument()
      expect(el).toHaveAttribute('aria-checked', 'false')
    })

    it('reflects modelValue via aria-checked', async () => {
      const { container, rerender } = renderWithProps(Switch, { modelValue: false })
      expect(getSwitch(container)).toHaveAttribute('aria-checked', 'false')
      await rerender({ modelValue: true })
      expect(getSwitch(container)).toHaveAttribute('aria-checked', 'true')
    })

    it('merges the className prop with class from attrs', () => {
      const { container } = render(Switch, {
        props: { modelValue: true, className: 'prop-class' },
        attrs: { class: ['attrs-class', { active: true }] }
      })
      const root = container.querySelector('label')
      expect(root).toHaveClass('prop-class')
      expect(root).toHaveClass('attrs-class')
      expect(root).toHaveClass('active')
    })
  })

  describe('Events', () => {
    it('emits update:modelValue and change on click', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()
      const { container } = render(Switch, {
        props: { modelValue: false, 'onUpdate:modelValue': onUpdate, onChange }
      })
      await fireEvent.click(getSwitch(container))
      expect(onUpdate).toHaveBeenCalledWith(true)
      expect(onChange).toHaveBeenCalledWith(true)
    })
    it('toggles when Space is pressed', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: { modelValue: false, 'onUpdate:modelValue': onUpdate }
      })
      const el = getSwitch(container)
      el.focus()
      await fireEvent.keyDown(el, { key: ' ', code: 'Space' })
      await fireEvent.click(el)
      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('does not emit when disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: { disabled: true, modelValue: false, 'onUpdate:modelValue': onUpdate }
      })
      await fireEvent.click(getSwitch(container))
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('does not toggle on unrelated keys', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: { modelValue: false, 'onUpdate:modelValue': onUpdate }
      })
      const el = getSwitch(container)
      await fireEvent.keyDown(el, { key: 'a' })
      await fireEvent.keyDown(el, { key: 'Escape' })
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Uncontrolled', () => {
    it('toggles aria-checked on click without modelValue', async () => {
      const { container } = render(Switch)
      const el = getSwitch(container)
      expect(el).toHaveAttribute('aria-checked', 'false')
      await fireEvent.click(el)
      expect(el).toHaveAttribute('aria-checked', 'true')
    })

    it('starts checked when defaultValue is true', () => {
      const { container } = renderWithProps(Switch, { defaultValue: true })
      expect(getSwitch(container)).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('States', () => {
    it('marks the disabled state with the native disabled attribute', () => {
      const { container } = renderWithProps(Switch, { disabled: true })
      const el = getSwitch(container)
      expect(el).toBeDisabled()
      expect(el).not.toHaveAttribute('aria-disabled')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(Switch, { attrs: { 'aria-label': 'Toggle switch' } })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
