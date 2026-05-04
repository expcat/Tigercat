/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Segmented } from '@expcat/tigercat-vue'
import { renderWithProps } from '../utils'

const defaultOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' }
]

describe('Segmented', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = renderWithProps(Segmented, { options: defaultOptions })
    const group = container.querySelector('[role="radiogroup"]')
    expect(group).toBeInTheDocument()
  })

  it('renders all options', () => {
    renderWithProps(Segmented, { options: defaultOptions })
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
    expect(screen.getByText('Option C')).toBeInTheDocument()
  })

  it('renders radio options', () => {
    const { container } = renderWithProps(Segmented, { options: defaultOptions })
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios.length).toBe(3)
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

  // --- Block mode ---
  it('applies block class', () => {
    const { container } = renderWithProps(Segmented, { options: defaultOptions, block: true })
    const group = container.querySelector('[role="radiogroup"]')
    expect(group?.className).toContain('w-full')
  })
})
