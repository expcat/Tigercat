/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Switch } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolationsIsolated,
  componentSizes,
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
      const el = getSwitch(container)
      expect(el).toHaveClass('prop-class')
      expect(el).toHaveClass('attrs-class')
      expect(el).toHaveClass('active')
    })

    it.each(componentSizes)('renders %s size', (size) => {
      const { container } = renderWithProps(Switch, { size })
      expect(getSwitch(container)).toBeInTheDocument()
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
    it.each([
      [' ', 'Space'],
      ['Enter', 'Enter']
    ])('toggles when %s is pressed', async (key, code) => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: { modelValue: false, 'onUpdate:modelValue': onUpdate }
      })
      const el = getSwitch(container)
      el.focus()
      await fireEvent.keyDown(el, { key, code })
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

  describe('States', () => {
    it('marks the disabled state and removes it from the tab order', () => {
      const { container } = renderWithProps(Switch, { disabled: true })
      const el = getSwitch(container)
      expect(el).toHaveAttribute('aria-disabled', 'true')
      expect(el).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(Switch, { attrs: { 'aria-label': 'Toggle switch' } })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
