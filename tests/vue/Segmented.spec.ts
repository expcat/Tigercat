/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Segmented } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

const defaultOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' }
]

describe('Segmented', () => {
  it('renders all options', () => {
    renderWithProps(Segmented, { options: defaultOptions })
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
    expect(screen.getByText('Option C')).toBeInTheDocument()
  })
  it('applies className prop', () => {
    const { container } = renderWithProps(Segmented, {
      options: defaultOptions,
      className: 'my-seg'
    })
    expect(container.querySelector('.my-seg')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = renderWithProps(Segmented, { options: defaultOptions, size })
    expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
  })

  // --- Selection ---
  it('selects value on click', async () => {
    const onChange = vi.fn()
    const { container } = render(Segmented, {
      props: { options: defaultOptions, modelValue: 'a', 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(screen.getByText('Option B'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('checks the selected radio', () => {
    const { container } = renderWithProps(Segmented, { options: defaultOptions, modelValue: 'b' })
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios[1].getAttribute('aria-checked')).toBe('true')
    expect(radios[0].getAttribute('aria-checked')).toBe('false')
  })

  it('moves the active indicator with transform when value changes', async () => {
    const { container, rerender } = renderWithProps(Segmented, {
      options: defaultOptions,
      modelValue: 'b'
    })
    const indicator = container.querySelector('[data-tiger-segmented-indicator]')

    expect(indicator).toHaveStyle({ transform: 'translateX(100%)' })
    expect(indicator).toHaveStyle({ width: 'calc((100% - (0.25rem * 2)) / 3)' })

    await rerender({ options: defaultOptions, modelValue: 'c' })
    expect(indicator).toHaveStyle({ transform: 'translateX(200%)' })
  })

  // --- Disabled ---
  it('disables all options when disabled', () => {
    const { container } = renderWithProps(Segmented, { options: defaultOptions, disabled: true })
    const radios = container.querySelectorAll('[role="radio"]')
    radios.forEach((r) => expect(r.getAttribute('aria-disabled')).toBe('true'))
  })

  it('disables individual option', () => {
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' }
    ]
    const { container } = renderWithProps(Segmented, { options: opts })
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios[0].getAttribute('aria-disabled')).toBe('false')
    expect(radios[1].getAttribute('aria-disabled')).toBe('true')
    expect(radios[2].getAttribute('aria-disabled')).toBe('false')
  })

  // --- Keyboard / roving tabindex (C13-1) ---
  it('exposes a single roving tab-stop on the selected option', () => {
    const { container } = renderWithProps(Segmented, { options: defaultOptions, modelValue: 'b' })
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios[0].getAttribute('tabindex')).toBe('-1')
    expect(radios[1].getAttribute('tabindex')).toBe('0')
    expect(radios[2].getAttribute('tabindex')).toBe('-1')
  })
  it('moves selection with arrow keys and wraps', async () => {
    const onChange = vi.fn()
    const { container } = render(Segmented, {
      props: { options: defaultOptions, modelValue: 'a', 'onUpdate:modelValue': onChange }
    })
    const radios = container.querySelectorAll('[role="radio"]')
    await fireEvent.keyDown(radios[0], { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('b')
    onChange.mockClear()
    await fireEvent.keyDown(radios[0], { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenCalledWith('c')
  })
  it('skips disabled options during arrow navigation', async () => {
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' }
    ]
    const onChange = vi.fn()
    const { container } = render(Segmented, {
      props: { options: opts, modelValue: 'a', 'onUpdate:modelValue': onChange }
    })
    const radios = container.querySelectorAll('[role="radio"]')
    await fireEvent.keyDown(radios[0], { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('forwards aria-label to the radiogroup root', () => {
    const { container } = render(Segmented, {
      props: { options: defaultOptions },
      attrs: { 'aria-label': 'View mode' }
    })
    expect(container.querySelector('[role="radiogroup"]')).toHaveAttribute(
      'aria-label',
      'View mode'
    )
  })

  // --- Block mode ---
  it('applies block class', () => {
    const { container } = renderWithProps(Segmented, { options: defaultOptions, block: true })
    const group = container.querySelector('[role="radiogroup"]')
    expect(group?.className).toContain('w-full')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Segmented)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {})
})
