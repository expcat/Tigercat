/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { Mentions } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

const defaultOptions = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
  { value: 'charlie', label: 'Charlie' }
]

describe('Mentions', () => {
  // --- Basic rendering ---
  it('renders textarea', () => {
    const { container } = renderWithProps(Mentions, { options: defaultOptions })
    expect(container.querySelector('textarea')).toBeInTheDocument()
  })
  it('applies className prop', () => {
    const { container } = renderWithProps(Mentions, {
      options: defaultOptions,
      className: 'my-mentions'
    })
    expect(container.querySelector('.my-mentions')).toBeInTheDocument()
  })

  // --- Disabled ---
  it('disables textarea when disabled', () => {
    const { container } = renderWithProps(Mentions, { options: defaultOptions, disabled: true })
    expect(container.querySelector('textarea')).toBeDisabled()
  })

  // --- Rows ---
  it('applies rows prop', () => {
    const { container } = renderWithProps(Mentions, { options: defaultOptions, rows: 5 })
    expect(container.querySelector('textarea')).toHaveAttribute('rows', '5')
  })

  // --- Input handling ---
  it('emits update:modelValue on input', async () => {
    const onChange = vi.fn()
    const { container } = render(Mentions, {
      props: { options: defaultOptions, modelValue: '', 'onUpdate:modelValue': onChange }
    })
    const textarea = container.querySelector('textarea')!
    await fireEvent.update(textarea, 'hello')
    expect(onChange).toHaveBeenCalled()
  })
  it('positions dropdown with floating styles when mention query opens', async () => {
    const { container } = render(Mentions, {
      props: {
        options: defaultOptions,
        modelValue: ''
      }
    })
    const textarea = container.querySelector('textarea')!

    await fireEvent.update(textarea, '@a')

    const dropdown = await screen.findByRole('listbox')

    await waitFor(() => {
      expect(dropdown.style.getPropertyValue('--tiger-overlay-x')).not.toBe('')
      expect(dropdown.style.getPropertyValue('--tiger-overlay-y')).not.toBe('')
      expect(dropdown).toHaveAttribute('data-positioned', 'true')
    })
  })

  // --- Keyboard navigation ---
  it('navigates options with ArrowDown and ArrowUp', async () => {
    const { container } = render(Mentions, {
      props: { options: defaultOptions, modelValue: '' }
    })
    const textarea = container.querySelector('textarea')!

    await fireEvent.update(textarea, '@')
    await screen.findByRole('listbox')

    // ArrowDown should move active index
    await fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    const options = document.body.querySelectorAll('[role="option"]')
    expect(options[1]?.getAttribute('aria-selected')).toBe('true')

    // ArrowUp should move back
    await fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(options[0]?.getAttribute('aria-selected')).toBe('true')
  })

  it('selects option with Enter key', async () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    const { container } = render(Mentions, {
      props: {
        options: defaultOptions,
        modelValue: '',
        'onUpdate:modelValue': onChange,
        onSelect
      }
    })
    const textarea = container.querySelector('textarea')!

    await fireEvent.update(textarea, '@')
    await screen.findByRole('listbox')

    await fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalled()
  })

  it('closes dropdown on Escape', async () => {
    const { container } = render(Mentions, {
      props: { options: defaultOptions, modelValue: '' }
    })
    const textarea = container.querySelector('textarea')!

    await fireEvent.update(textarea, '@')
    await screen.findByRole('listbox')

    await fireEvent.keyDown(textarea, { key: 'Escape' })
    expect(document.body.querySelector('[role="listbox"]')).not.toBeInTheDocument()
  })
  // --- Filtering ---
  it('filters options based on query text', async () => {
    const { container } = render(Mentions, {
      props: { options: defaultOptions, modelValue: '' }
    })
    const textarea = container.querySelector('textarea')!

    await fireEvent.update(textarea, '@al')
    await screen.findByRole('listbox')

    const options = document.body.querySelectorAll('[role="option"]')
    expect(options).toHaveLength(1)
    expect(options[0].textContent).toBe('Alice')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Mentions)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
