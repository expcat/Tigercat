/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { ColorSwatch } from '@expcat/tigercat-vue/ColorSwatch'
import { expectNoA11yViolations, renderWithProps } from '../utils'

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

  it('emits update:modelValue when a color is selected', async () => {
    const onUpdate = vi.fn()
    render(ColorSwatch, {
      props: {
        colors: ['#111111', '#222222'],
        'onUpdate:modelValue': onUpdate
      }
    })

    await fireEvent.click(screen.getByRole('radio', { name: '#222222' }))

    expect(onUpdate).toHaveBeenCalledTimes(1)
    expect(onUpdate).toHaveBeenCalledWith('#222222')
  })

  it('selects a color without modelValue', async () => {
    renderWithProps(ColorSwatch, { colors: ['#111111', '#222222'] })

    await fireEvent.click(screen.getByRole('radio', { name: '#222222' }))

    expect(screen.getByRole('radio', { name: '#222222' })).toHaveAttribute('aria-checked', 'true')
  })

  it('seeds the selected color from defaultValue', () => {
    renderWithProps(ColorSwatch, { defaultValue: '#111111', colors: ['#111111', '#222222'] })

    expect(screen.getByRole('radio', { name: '#111111' })).toHaveAttribute('aria-checked', 'true')
  })

  it('does not select disabled colors', async () => {
    const onUpdate = vi.fn()
    render(ColorSwatch, {
      props: { colors: [{ value: '#111111', disabled: true }], 'onUpdate:modelValue': onUpdate }
    })

    await fireEvent.click(screen.getByRole('radio', { name: '#111111' }))

    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('supports keyboard navigation and selection', async () => {
    const onUpdate = vi.fn()
    render(ColorSwatch, {
      props: {
        columns: 3,
        colors: ['#111111', { value: '#222222', disabled: true }, '#333333'],
        'onUpdate:modelValue': onUpdate
      }
    })

    const first = screen.getByRole('radio', { name: '#111111' })
    first.focus()
    await fireEvent.keyDown(first, { key: 'ArrowRight' })
    await fireEvent.keyDown(screen.getByRole('radio', { name: '#333333' }), { key: 'Enter' })

    expect(onUpdate).toHaveBeenCalledWith('#333333')
  })

  it('applies size and class', () => {
    const { container } = renderWithProps(ColorSwatch, {
      class: 'brand-swatches',
      size: 'lg',
      colors: ['#111111']
    })

    expect(container.querySelector('.brand-swatches')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '#111111' })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithProps(ColorSwatch, {
      groups: [{ label: 'Brand', colors: ['#111111', { value: '#222222', disabled: true }] }],
      modelValue: '#111111'
    })

    await expectNoA11yViolations(container)
  })

  describe('Edge Cases and Boundary', () => {
    it.each([
      ['sm', 'h-6 w-6'],
      ['md', 'h-8 w-8'],
      ['lg', 'h-10 w-10']
    ] as const)('renders %s size boundary', (size, expectedClass) => {
      renderWithProps(ColorSwatch, { size, colors: ['#111111'] })

      expect(screen.getByRole('radio', { name: '#111111' }).className).toContain(expectedClass)
    })

    it('renders an empty custom color list without fallback swatches', () => {
      renderWithProps(ColorSwatch, { ariaLabel: 'Theme swatches', colors: [] })

      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
      expect(screen.queryAllByRole('radio')).toHaveLength(0)
    })

    it('matches selected colors by parsed value', () => {
      renderWithProps(ColorSwatch, { modelValue: '#ABCDEF', colors: ['#abcdef'] })

      expect(screen.getByRole('radio', { name: '#abcdef' })).toHaveAttribute('aria-checked', 'true')
    })

    it('matches short hex to long hex and skips unparseable paint', () => {
      renderWithProps(ColorSwatch, {
        modelValue: 'rgb(255, 0, 0)',
        colors: ['#ff0000', 'not-a-color']
      })

      expect(screen.getByRole('radio', { name: '#ff0000' })).toHaveAttribute('aria-checked', 'true')
      const bad = screen.getByRole('radio', { name: 'not-a-color' }) as HTMLElement
      expect(bad.style.backgroundColor).toContain('tiger-surface-muted')
      expect(bad.style.backgroundColor).not.toBe('not-a-color')
    })

    it('ignores keyboard selection when disabled', async () => {
      const onUpdate = vi.fn()
      render(ColorSwatch, {
        props: { disabled: true, colors: ['#111111', '#222222'], 'onUpdate:modelValue': onUpdate }
      })

      await fireEvent.keyDown(screen.getByRole('radio', { name: '#111111' }), { key: 'Enter' })

      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('keeps disabled options out of the tab sequence', () => {
      renderWithProps(ColorSwatch, {
        colors: [{ value: '#111111', disabled: true }, '#222222']
      })

      expect(screen.getByRole('radio', { name: '#111111' })).toHaveAttribute('tabindex', '-1')
      expect(screen.getByRole('radio', { name: '#222222' })).toHaveAttribute('tabindex', '0')
    })
  })
})
