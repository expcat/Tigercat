/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Textarea } from '@tigercat/react'
import { expectNoA11yViolations, componentSizes } from '../utils/react'

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass('block')
    expect(textarea).toHaveClass('border')
  })

  it('passes through native attributes', () => {
    render(
      <Textarea
        data-testid="test-textarea"
        title="Textarea title"
        aria-describedby="textarea-help"
      />
    )

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('data-testid', 'test-textarea')
    expect(textarea).toHaveAttribute('title', 'Textarea title')
    expect(textarea).toHaveAttribute('aria-describedby', 'textarea-help')
  })

  it.each(componentSizes)('supports size %s', (size) => {
    render(<Textarea size={size} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('supports common native props', () => {
    render(
      <Textarea
        rows={5}
        maxLength={10}
        minLength={2}
        name="description"
        id="textarea-id"
        autoComplete="off"
        autoFocus
      />
    )

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
    expect(textarea).toHaveAttribute('maxlength', '10')
    expect(textarea).toHaveAttribute('minlength', '2')
    expect(textarea).toHaveAttribute('name', 'description')
    expect(textarea).toHaveAttribute('id', 'textarea-id')
    expect(textarea).toHaveAttribute('autocomplete', 'off')
    expect(textarea).toHaveFocus()
  })

  it('handles controlled and uncontrolled values', async () => {
    const user = userEvent.setup()

    const { rerender } = render(<Textarea value="initial" />)
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toBe('initial')

    rerender(<Textarea value={'Line 1\nLine 2'} />)
    expect(textarea.value).toBe('Line 1\nLine 2')

    const { unmount } = render(<Textarea defaultValue="default" />)
    const uncontrolled = screen.getAllByRole('textbox')[1] as HTMLTextAreaElement
    expect(uncontrolled.value).toBe('default')
    await user.type(uncontrolled, 'x')
    expect(uncontrolled.value).toBe('defaultx')
    unmount()
  })

  it('handles events', async () => {
    const user = userEvent.setup()
    const onInput = vi.fn()
    const onChange = vi.fn()
    const onFocus = vi.fn()
    const onBlur = vi.fn()

    const { getByRole } = render(
      <Textarea onInput={onInput} onChange={onChange} onFocus={onFocus} onBlur={onBlur} />
    )

    const textarea = getByRole('textbox')
    await user.click(textarea)
    expect(onFocus).toHaveBeenCalled()

    await user.type(textarea, 'a')
    expect(onInput).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalled()

    await user.tab()
    expect(onBlur).toHaveBeenCalled()
  })

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { getByRole } = render(<Textarea disabled onChange={onChange} />)

    const textarea = getByRole('textbox')
    expect(textarea).toBeDisabled()

    await user.type(textarea, 'test')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not allow typing when readonly', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<Textarea readonly value="fixed" />)

    const textarea = getByRole('textbox') as HTMLTextAreaElement
    await user.type(textarea, 'x')
    expect(textarea.value).toBe('fixed')
  })

  it('shows count when showCount is enabled', () => {
    render(<Textarea defaultValue="abc" showCount maxLength={10} />)
    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Textarea aria-label="Description" />)
    await expectNoA11yViolations(container)
  })
})
