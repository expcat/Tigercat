/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ColorSwatch } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('ColorSwatch', () => {
  it('renders default color groups', () => {
    render(<ColorSwatch />)

    expect(screen.getByRole('radiogroup', { name: 'Color swatches' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio').length).toBeGreaterThan(0)
  })

  it('renders custom colors and selected value', () => {
    render(<ColorSwatch value="#222222" colors={['#111111', '#222222']} />)

    expect(screen.getByRole('radio', { name: '#222222' })).toHaveAttribute('aria-checked', 'true')
  })

  it('renders custom groups', () => {
    render(
      <ColorSwatch
        groups={[
          { label: 'Brand', colors: ['#0f172a'] },
          { label: 'Status', colors: [{ value: '#16a34a', label: 'Success' }] }
        ]}
      />
    )

    expect(screen.getByText('Brand')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Success' })).toBeInTheDocument()
  })

  it('calls onChange when a color is selected', () => {
    const onChange = vi.fn()
    render(<ColorSwatch colors={['#111111', '#222222']} onChange={onChange} />)

    fireEvent.click(screen.getByRole('radio', { name: '#222222' }))

    expect(onChange).toHaveBeenCalledWith('#222222', expect.objectContaining({ value: '#222222' }))
  })

  it('supports uncontrolled defaultValue', () => {
    render(<ColorSwatch defaultValue="#111111" colors={['#111111', '#222222']} />)

    fireEvent.click(screen.getByRole('radio', { name: '#222222' }))

    expect(screen.getByRole('radio', { name: '#222222' })).toHaveAttribute('aria-checked', 'true')
  })

  it('does not select disabled colors', () => {
    const onChange = vi.fn()
    render(<ColorSwatch colors={[{ value: '#111111', disabled: true }]} onChange={onChange} />)

    fireEvent.click(screen.getByRole('radio', { name: '#111111' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports keyboard navigation and selection', () => {
    const onChange = vi.fn()
    render(
      <ColorSwatch
        columns={3}
        colors={['#111111', { value: '#222222', disabled: true }, '#333333']}
        onChange={onChange}
      />
    )

    const first = screen.getByRole('radio', { name: '#111111' })
    act(() => {
      first.focus()
    })
    act(() => {
      fireEvent.keyDown(first, { key: 'ArrowRight' })
    })
    fireEvent.keyDown(screen.getByRole('radio', { name: '#333333' }), { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith('#333333', expect.objectContaining({ value: '#333333' }))
  })

  it('applies size and className', () => {
    const { container } = render(
      <ColorSwatch className="brand-swatches" size="lg" colors={['#111111']} />
    )

    expect(container.querySelector('.brand-swatches')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '#111111' }).className).toContain('h-10 w-10')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ColorSwatch colors={['#111111', '#222222']} />)

    await expectNoA11yViolationsIsolated(container)
  })

  describe('Edge Cases and Boundary', () => {
    it.each([
      ['sm', 'h-6 w-6'],
      ['md', 'h-8 w-8'],
      ['lg', 'h-10 w-10']
    ] as const)('renders %s size boundary', (size, expectedClass) => {
      render(<ColorSwatch size={size} colors={['#111111']} />)

      expect(screen.getByRole('radio', { name: '#111111' }).className).toContain(expectedClass)
    })

    it('renders an empty custom color list without fallback swatches', () => {
      render(<ColorSwatch ariaLabel="Theme swatches" colors={[]} />)

      expect(screen.getByRole('radiogroup', { name: 'Theme swatches' })).toBeInTheDocument()
      expect(screen.queryAllByRole('radio')).toHaveLength(0)
    })

    it('matches selected colors case-insensitively', () => {
      render(<ColorSwatch value="#ABCDEF" colors={['#abcdef']} />)

      expect(screen.getByRole('radio', { name: '#abcdef' })).toHaveAttribute('aria-checked', 'true')
    })

    it('ignores keyboard selection when disabled', () => {
      const onChange = vi.fn()
      render(<ColorSwatch disabled colors={['#111111', '#222222']} onChange={onChange} />)

      fireEvent.keyDown(screen.getByRole('radio', { name: '#111111' }), { key: 'Enter' })

      expect(onChange).not.toHaveBeenCalled()
    })

    it('keeps disabled options out of the tab sequence', () => {
      render(<ColorSwatch colors={[{ value: '#111111', disabled: true }, '#222222']} />)

      expect(screen.getByRole('radio', { name: '#111111' })).toHaveAttribute('tabindex', '-1')
      expect(screen.getByRole('radio', { name: '#222222' })).toHaveAttribute('tabindex', '0')
    })
  })
})
