/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { NumberKeyboard } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('NumberKeyboard', () => {
  it('renders digit, delete, and confirm keys', () => {
    render(<NumberKeyboard />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<NumberKeyboard className="custom-keyboard" />)
    expect(container.querySelector('.custom-keyboard')).toBeInTheDocument()
  })

  it('emits value changes in uncontrolled mode', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(onChange.mock.calls.map(([value]) => value)).toEqual(['1', '12'])
  })

  it('uses controlled value when provided', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard value="9" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(onChange).toHaveBeenCalledWith('91', expect.objectContaining({ action: 'input' }))
  })

  it('deletes the last character', () => {
    const onChange = vi.fn()
    const onDelete = vi.fn()
    render(<NumberKeyboard defaultValue="123" onChange={onChange} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('12', expect.objectContaining({ action: 'delete' }))
    expect(onChange).toHaveBeenCalledWith('12', expect.objectContaining({ key: 'delete' }))
  })
  it('does not emit when disabled', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard disabled onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not emit when readonly', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard readonly onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports custom labels and hidden confirm key', () => {
    render(<NumberKeyboard deleteText="Back" confirmText="OK" showConfirm={false} />)
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'OK' })).not.toBeInTheDocument()
  })

  it('emits key press payloads', () => {
    const onKeyPress = vi.fn()
    render(<NumberKeyboard onKeyPress={onKeyPress} />)
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onKeyPress).toHaveBeenCalledWith(
      expect.objectContaining({ value: '3' }),
      expect.objectContaining({ value: '3', mode: 'number' })
    )
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<NumberKeyboard />)
      await expectNoA11yViolationsIsolated(container)
    })
  })

})
