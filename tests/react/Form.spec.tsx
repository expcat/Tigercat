/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { Form, FormItem, type FormHandle, type FormRule } from '@tigercat/react'
import { expectNoA11yViolations } from '../utils/react'

describe('Form', () => {
  it('renders a semantic form element', () => {
    const { container } = render(
      <Form model={{}}>
        <div>Content</div>
      </Form>
    )

    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
    expect(form?.tagName.toLowerCase()).toBe('form')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Form model={{}} className="custom-class">
        <div>Content</div>
      </Form>
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('validates with FormItem rules override on blur', async () => {
    const rules: FormRule[] = [{ required: true, message: 'Username is required' }]
    const formRef = React.createRef<FormHandle>()

    function Demo() {
      const [model, setModel] = useState({ username: '' })
      return (
        <Form ref={formRef} model={model}>
          <FormItem label="Username" name="username" rules={rules}>
            <input
              aria-label="username"
              value={model.username}
              onChange={(e) => setModel({ username: e.target.value })}
            />
          </FormItem>
          <button type="submit">Submit</button>
        </Form>
      )
    }

    render(<Demo />)
    await formRef.current?.validateField('username', undefined, 'blur')

    const error = await screen.findByText('Username is required')
    expect(error).toBeInTheDocument()

    const input = screen.getByLabelText('username')
    expect(input).toHaveAttribute('aria-invalid', 'true')

    const errorElement = error.closest('[role=alert]') ?? error
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(errorElement.getAttribute('id')).toBe(describedBy)
  })

  it('respects rule trigger=submit for field validation', async () => {
    const rules: FormRule[] = [
      { required: true, message: 'Username is required', trigger: 'submit' }
    ]

    function Demo() {
      const [model, setModel] = useState({ username: '' })
      return (
        <Form model={model}>
          <FormItem label="Username" name="username" rules={rules}>
            <input
              aria-label="username"
              value={model.username}
              onChange={(e) => setModel({ username: e.target.value })}
            />
          </FormItem>
          <button type="submit">Submit</button>
        </Form>
      )
    }

    const { container } = render(<Demo />)
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()

    fireEvent.focusOut(screen.getByLabelText('username'))
    expect(screen.queryByText('Username is required')).not.toBeInTheDocument()

    fireEvent.submit(form as HTMLFormElement)
    expect(await screen.findByText('Username is required')).toBeInTheDocument()
  })

  it('merges aria-describedby with error id and clears validation', async () => {
    const rules: FormRule[] = [{ required: true, message: 'Username is required' }]
    const formRef = React.createRef<FormHandle>()

    function Demo() {
      const [model, setModel] = useState({ username: '' })
      return (
        <Form ref={formRef} model={model}>
          <div id="username-help">Helper text</div>
          <FormItem label="Username" name="username" rules={rules}>
            <input
              aria-label="username"
              aria-describedby="username-help"
              value={model.username}
              onChange={(e) => setModel({ username: e.target.value })}
            />
          </FormItem>
          <button type="submit">Submit</button>
        </Form>
      )
    }

    render(<Demo />)

    await formRef.current?.validateField('username', undefined, 'blur')
    const error = await screen.findByText('Username is required')
    const errorElement = error.closest('[role=alert]') ?? error
    const errorId = errorElement.getAttribute('id')
    expect(errorId).toBeTruthy()

    const input = screen.getByLabelText('username')
    const describedBy = input.getAttribute('aria-describedby') ?? ''
    const parts = describedBy.split(' ').filter(Boolean)
    expect(parts).toContain('username-help')
    expect(parts).toContain(errorId as string)
    expect(input).toHaveAttribute('aria-invalid', 'true')

    formRef.current?.clearValidate('username')

    await waitFor(() => {
      expect(screen.queryByText('Username is required')).not.toBeInTheDocument()
      expect(input).not.toHaveAttribute('aria-invalid')
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Form model={{}}>
        <div>Accessible form</div>
      </Form>
    )

    await expectNoA11yViolations(container)
  })
})
