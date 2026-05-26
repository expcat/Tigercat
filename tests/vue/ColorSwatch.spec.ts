/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { ColorSwatch } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated, renderWithProps } from '../utils'

describe('ColorSwatch', () => {
  it('renders default color groups', () => {
    renderWithProps(ColorSwatch, {})

    expect(screen.getByRole('radiogroup', { name: 'Color swatches' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio').length).toBeGreaterThan(0)
  })

  it('renders custom colors and selected value', () => {
    renderWithProps(ColorSwatch, { modelValue: '#222222', colors: ['#111111', '#222222'] })

    expect(screen.getByRole('radio', { name: '#222222' })).toHaveAttribute('aria-checked', 'true')
  })

  it('renders custom groups', () => {
    renderWithProps(ColorSwatch, {
      groups: [
        { label: 'Brand', colors: ['#0f172a'] },
        { label: 'Status', colors: [{ value: '#16a34a', label: 'Success' }] }
      ]
    })

    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Success' })).toBeInTheDocument()
  })

  it('emits update:modelValue and change when a color is selected', async () => {
    const onUpdate = vi.fn()
    const onChange = vi.fn()
    render(ColorSwatch, {
      props: {
        colors: ['#111111', '#222222'],
        'onUpdate:modelValue': onUpdate,
        onChange
      }
    })

    await fireEvent.click(screen.getByRole('radio', { name: '#222222' }))

    expect(onUpdate).toHaveBeenCalledWith('#222222')
    expect(onChange).toHaveBeenCalledWith('#222222', expect.objectContaining({ value: '#222222' }))
  })

  it('does not select disabled colors', async () => {
    const onChange = vi.fn()
    render(ColorSwatch, {
      props: { colors: [{ value: '#111111', disabled: true }], onChange }
    })

    await fireEvent.click(screen.getByRole('radio', { name: '#111111' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports keyboard navigation and selection', async () => {
    const onChange = vi.fn()
    render(ColorSwatch, {
      props: {
        columns: 3,
        colors: ['#111111', { value: '#222222', disabled: true }, '#333333'],
        onChange
      }
    })

    const first = screen.getByRole('radio', { name: '#111111' })
    first.focus()
    await fireEvent.keyDown(first, { key: 'ArrowRight' })
    await fireEvent.keyDown(screen.getByRole('radio', { name: '#333333' }), { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith('#333333', expect.objectContaining({ value: '#333333' }))
  })

  it('applies size and class', () => {
    const { container } = renderWithProps(ColorSwatch, {
      class: 'brand-swatches',
      size: 'lg',
      colors: ['#111111']
    })

    expect(container.querySelector('.brand-swatches')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '#111111' }).className).toContain('h-10 w-10')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithProps(ColorSwatch, { colors: ['#111111', '#222222'] })

    await expectNoA11yViolationsIsolated(container)
  })
})
