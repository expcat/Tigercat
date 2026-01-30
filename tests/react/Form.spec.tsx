/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { Form, FormItem, type FormHandle, type FormRule, type FormRules } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Form', () => {
  // ==================== Basic Functionality ====================
  describe('Basic Functionality', () => {
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

    it('renders form with default classes', () => {
      const { container } = render(
        <Form model={{}}>
          <div>Content</div>
        </Form>
      )

      const form = container.querySelector('form')
      expect(form).toHaveClass('tiger-form')
    })

    it('applies custom className', () => {
      const { container } = render(
        <Form model={{}} className="custom-class">
          <div>Content</div>
        </Form>
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('renders FormItem with label', () => {
      render(
        <Form model={{}}>
          <FormItem label="Name">
            <input type="text" />
          </FormItem>
        </Form>
      )

      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    it('renders FormItem required asterisk when required prop is true', () => {
      const { container } = render(
        <Form model={{}}>
          <FormItem label="Name" required>
            <input type="text" />
          </FormItem>
        </Form>
      )

      const asterisk = container.querySelector('.tiger-form-item__asterisk')
      expect(asterisk).toBeInTheDocument()
      expect(asterisk?.textContent).toBe('*')
    })

    it('hides asterisk when showRequiredAsterisk is false', () => {
      const { container } = render(
        <Form model={{}} showRequiredAsterisk={false}>
          <FormItem label="Name" required>
            <input type="text" />
          </FormItem>
        </Form>
      )

      const asterisk = container.querySelector('.tiger-form-item__asterisk')
      expect(asterisk).not.toBeInTheDocument()
    })
  })

  // ==================== Layout Modes ====================
  describe('Layout Modes', () => {
    it('renders horizontal layout (label-right) by default', () => {
      const { container } = render(
        <Form model={{}}>
          <FormItem label="Name">
            <input type="text" />
          </FormItem>
        </Form>
      )

      expect(container.querySelector('.tiger-form--label-right')).toBeInTheDocument()
    })

    it('renders with label position left', () => {
      const { container } = render(
        <Form model={{}} labelPosition="left">
          <FormItem label="Name">
            <input type="text" />
          </FormItem>
        </Form>
      )

      expect(container.querySelector('.tiger-form--label-left')).toBeInTheDocument()
    })

    it('renders with label position top', () => {
      const { container } = render(
        <Form model={{}} labelPosition="top">
          <FormItem label="Name">
            <input type="text" />
          </FormItem>
        </Form>
      )

      expect(container.querySelector('.tiger-form--label-top')).toBeInTheDocument()
    })

    it('applies custom label width', () => {
      const { container } = render(
        <Form model={{}} labelWidth={120}>
          <FormItem label="Name">
            <input type="text" />
          </FormItem>
        </Form>
      )

      const label = container.querySelector('.tiger-form-item__label')
      expect(label).toHaveStyle({ width: '120px' })
    })

    it('FormItem labelWidth overrides Form labelWidth', () => {
      const { container } = render(
        <Form model={{}} labelWidth={100}>
          <FormItem label="Name" labelWidth={150}>
            <input type="text" />
          </FormItem>
        </Form>
      )

      const label = container.querySelector('.tiger-form-item__label')
      expect(label).toHaveStyle({ width: '150px' })
    })
  })

  // ==================== Validation Functionality ====================
  describe('Validation Functionality', () => {
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
      await act(async () => {
        await formRef.current?.validateField('username', undefined, 'blur')
      })

      const error = await screen.findByText('Username is required')
      expect(error).toBeInTheDocument()

      const input = screen.getByLabelText('username')
      expect(input).toHaveAttribute('aria-invalid', 'true')

      const errorElement = error.closest('[role=alert]') ?? error
      const describedBy = input.getAttribute('aria-describedby')
      expect(describedBy).toBeTruthy()
      expect(errorElement.getAttribute('id')).toBe(describedBy)
    })

    it('validates required field', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ email: '' })
        const rules: FormRules = {
          email: [{ required: true, message: 'Email is required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Email" name="email">
              <input aria-label="email" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('email')
      })

      expect(await screen.findByText('Email is required')).toBeInTheDocument()
    })

    it('validates email format', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ email: 'invalid-email' })
        const rules: FormRules = {
          email: [{ type: 'email', message: 'Please enter valid email' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Email" name="email">
              <input aria-label="email" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('email')
      })

      expect(await screen.findByText('Please enter valid email')).toBeInTheDocument()
    })

    it('validates minimum length', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ password: 'abc' })
        const rules: FormRules = {
          password: [{ min: 6, message: 'Password must be at least 6 characters' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Password" name="password">
              <input type="password" aria-label="password" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('password')
      })

      expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument()
    })

    it('validates maximum length', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ name: 'a very long name that exceeds the limit' })
        const rules: FormRules = {
          name: [{ max: 10, message: 'Name must be at most 10 characters' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Name" name="name">
              <input aria-label="name" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('name')
      })

      expect(await screen.findByText('Name must be at most 10 characters')).toBeInTheDocument()
    })

    it('validates with regex pattern', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ phone: 'abc' })
        const rules: FormRules = {
          phone: [{ pattern: /^\d+$/, message: 'Phone must contain only numbers' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Phone" name="phone">
              <input aria-label="phone" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('phone')
      })

      expect(await screen.findByText('Phone must contain only numbers')).toBeInTheDocument()
    })

    it('validates with custom validator function', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ age: 15 })
        const rules: FormRules = {
          age: [{
            validator: (value) => {
              if ((value as number) < 18) return 'Must be 18 or older'
              return true
            }
          }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Age" name="age">
              <input type="number" aria-label="age" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('age')
      })

      expect(await screen.findByText('Must be 18 or older')).toBeInTheDocument()
    })

    it('validates with async validator', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: 'taken' })
        const rules: FormRules = {
          username: [{
            validator: async (value) => {
              await new Promise(resolve => setTimeout(resolve, 10))
              if (value === 'taken') return 'Username is already taken'
              return true
            }
          }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('username')
      })

      expect(await screen.findByText('Username is already taken')).toBeInTheDocument()
    })

    it('displays validation error message in alert role', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ field: '' })
        const rules: FormRules = {
          field: [{ required: true, message: 'Field is required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Field" name="field">
              <input aria-label="field" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('field')
      })

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveTextContent('Field is required')
      })
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

    it('validates on blur when trigger is blur', async () => {
      const user = userEvent.setup()

      function Demo() {
        const [model, setModel] = useState({ name: '' })
        const rules: FormRules = {
          name: [{ required: true, message: 'Name is required', trigger: 'blur' }]
        }
        return (
          <Form model={model} rules={rules}>
            <FormItem label="Name" name="name">
              <input
                aria-label="name"
                value={model.name}
                onChange={(e) => setModel({ name: e.target.value })}
              />
            </FormItem>
            <button type="button">Other</button>
          </Form>
        )
      }

      render(<Demo />)
      const input = screen.getByLabelText('name')

      await user.click(input)
      await user.tab() // This triggers blur

      expect(await screen.findByText('Name is required')).toBeInTheDocument()
    })

    it('clears error when valid value is entered', async () => {
      const user = userEvent.setup()
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model, setModel] = useState({ name: '' })
        const rules: FormRules = {
          name: [{ required: true, message: 'Name is required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Name" name="name">
              <input
                aria-label="name"
                value={model.name}
                onChange={(e) => setModel({ name: e.target.value })}
              />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)

      // Trigger validation error
      await act(async () => {
        await formRef.current?.validateField('name')
      })
      expect(await screen.findByText('Name is required')).toBeInTheDocument()

      // Enter valid value and re-validate
      const input = screen.getByLabelText('name')
      await user.clear(input)
      await user.type(input, 'John')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
      })
    })
  })

  // ==================== Form Operations ====================
  describe('Form Operations', () => {
    it('calls onSubmit with valid data', async () => {
      const onSubmit = vi.fn()

      function Demo() {
        const [model] = useState({ username: 'john', password: 'secret123' })
        return (
          <Form model={model} onSubmit={onSubmit}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
            <button type="submit">Submit</button>
          </Form>
        )
      }

      render(<Demo />)
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
      fireEvent.submit(form as HTMLFormElement)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          valid: true,
          values: { username: 'john', password: 'secret123' },
          errors: []
        })
      })
    })

    it('calls onSubmit with invalid data and errors', async () => {
      const onSubmit = vi.fn()

      function Demo() {
        const [model] = useState({ username: '' })
        const rules: FormRules = {
          username: [{ required: true, message: 'Username is required' }]
        }
        return (
          <Form model={model} rules={rules} onSubmit={onSubmit}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
            <button type="submit">Submit</button>
          </Form>
        )
      }

      render(<Demo />)
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
      fireEvent.submit(form as HTMLFormElement)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          valid: false,
          values: { username: '' },
          errors: [{ field: 'username', message: 'Username is required' }]
        })
      })
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

      await act(async () => {
        await formRef.current?.validateField('username', undefined, 'blur')
      })
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

      act(() => {
        formRef.current?.clearValidate('username')
      })

      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument()
        expect(input).not.toHaveAttribute('aria-invalid')
      })
    })

    it('validates entire form via exposed validate method', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: '', email: '' })
        const rules: FormRules = {
          username: [{ required: true, message: 'Username required' }],
          email: [{ required: true, message: 'Email required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
            <FormItem label="Email" name="email">
              <input aria-label="email" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)

      let isValid: boolean | undefined
      await act(async () => {
        isValid = await formRef.current?.validate()
      })
      expect(isValid).toBe(false)

      expect(await screen.findByText('Username required')).toBeInTheDocument()
      expect(await screen.findByText('Email required')).toBeInTheDocument()
    })

    it('clearValidate clears all errors when called without args', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: '', email: '' })
        const rules: FormRules = {
          username: [{ required: true, message: 'Username required' }],
          email: [{ required: true, message: 'Email required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
            <FormItem label="Email" name="email">
              <input aria-label="email" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)

      await act(async () => {
        await formRef.current?.validate()
      })
      expect(await screen.findByText('Username required')).toBeInTheDocument()
      expect(await screen.findByText('Email required')).toBeInTheDocument()

      act(() => {
        formRef.current?.clearValidate()
      })

      await waitFor(() => {
        expect(screen.queryByText('Username required')).not.toBeInTheDocument()
        expect(screen.queryByText('Email required')).not.toBeInTheDocument()
      })
    })

    it('clearValidate clears specific field errors', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: '', email: '' })
        const rules: FormRules = {
          username: [{ required: true, message: 'Username required' }],
          email: [{ required: true, message: 'Email required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
            <FormItem label="Email" name="email">
              <input aria-label="email" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)

      await act(async () => {
        await formRef.current?.validate()
      })
      expect(await screen.findByText('Username required')).toBeInTheDocument()
      expect(await screen.findByText('Email required')).toBeInTheDocument()

      act(() => {
        formRef.current?.clearValidate('username')
      })

      await waitFor(() => {
        expect(screen.queryByText('Username required')).not.toBeInTheDocument()
        expect(screen.getByText('Email required')).toBeInTheDocument()
      })
    })

    it('clearValidate clears multiple field errors via array', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: '', email: '', phone: '' })
        const rules: FormRules = {
          username: [{ required: true, message: 'Username required' }],
          email: [{ required: true, message: 'Email required' }],
          phone: [{ required: true, message: 'Phone required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
            <FormItem label="Email" name="email">
              <input aria-label="email" />
            </FormItem>
            <FormItem label="Phone" name="phone">
              <input aria-label="phone" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)

      await act(async () => {
        await formRef.current?.validate()
      })

      act(() => {
        formRef.current?.clearValidate(['username', 'email'])
      })

      await waitFor(() => {
        expect(screen.queryByText('Username required')).not.toBeInTheDocument()
        expect(screen.queryByText('Email required')).not.toBeInTheDocument()
        expect(screen.getByText('Phone required')).toBeInTheDocument()
      })
    })

    it('resetFields clears validation errors', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: '' })
        const rules: FormRules = {
          username: [{ required: true, message: 'Username required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)

      await act(async () => {
        await formRef.current?.validate()
      })
      expect(await screen.findByText('Username required')).toBeInTheDocument()

      act(() => {
        formRef.current?.resetFields()
      })

      await waitFor(() => {
        expect(screen.queryByText('Username required')).not.toBeInTheDocument()
      })
    })

    it('calls onValidate when field is validated', async () => {
      const onValidate = vi.fn()
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: '' })
        const rules: FormRules = {
          username: [{ required: true, message: 'Username required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules} onValidate={onValidate}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('username')
      })

      await waitFor(() => {
        expect(onValidate).toHaveBeenCalledWith('username', false, 'Username required')
      })
    })
  })

  // ==================== Edge Cases ====================
  describe('Edge Cases', () => {
    it('handles nested form field paths', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({
          user: {
            profile: {
              name: ''
            }
          }
        })
        const rules: FormRules = {
          'user.profile.name': [{ required: true, message: 'Name is required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Name" name="user.profile.name">
              <input aria-label="name" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('user.profile.name')
      })

      expect(await screen.findByText('Name is required')).toBeInTheDocument()
    })

    it('handles dynamic field addition', async () => {
      function Demo() {
        const [showField2, setShowField2] = useState(false)
        const [model] = useState({ field1: '', field2: '' })
        const rules: FormRules = {
          field1: [{ required: true, message: 'Field 1 required' }],
          field2: [{ required: true, message: 'Field 2 required' }]
        }

        return (
          <Form model={model} rules={rules}>
            <FormItem label="Field 1" name="field1">
              <input aria-label="field1" />
            </FormItem>
            {showField2 && (
              <FormItem label="Field 2" name="field2">
                <input aria-label="field2" />
              </FormItem>
            )}
            <button type="button" onClick={() => setShowField2(true)}>
              Add Field
            </button>
          </Form>
        )
      }

      render(<Demo />)

      // Initially only field1 is visible
      expect(screen.getByLabelText('field1')).toBeInTheDocument()
      expect(screen.queryByLabelText('field2')).not.toBeInTheDocument()

      // Add field2
      fireEvent.click(screen.getByRole('button', { name: 'Add Field' }))

      expect(screen.getByLabelText('field2')).toBeInTheDocument()

      // Validate the newly added field
      fireEvent.blur(screen.getByLabelText('field2'))
      expect(await screen.findByText('Field 2 required')).toBeInTheDocument()
    })

    it('handles disabled form state', () => {
      const { container } = render(
        <Form model={{}} disabled>
          <FormItem label="Username" name="username">
            <input aria-label="username" />
          </FormItem>
        </Form>
      )

      expect(container.querySelector('.tiger-form--disabled')).toBeInTheDocument()
      expect(container.querySelector('.tiger-form-item--disabled')).toBeInTheDocument()
    })

    it('handles FormItem error prop (controlled error)', () => {
      render(
        <Form model={{}}>
          <FormItem label="Username" name="username" error="Custom error message">
            <input aria-label="username" />
          </FormItem>
        </Form>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('handles showMessage=false to hide error messages', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: '' })
        const rules: FormRules = {
          username: [{ required: true, message: 'Username required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Username" name="username" showMessage={false}>
              <input aria-label="username" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('username')
      })

      // Wait a bit for potential error message
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('supports different form sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      sizes.forEach((size) => {
        const { container, unmount } = render(
          <Form model={{}} size={size}>
            <FormItem label="Name" name="name">
              <input type="text" />
            </FormItem>
          </Form>
        )

        expect(container.querySelector(`.tiger-form-item--${size}`)).toBeInTheDocument()
        unmount()
      })
    })

    it('FormItem size overrides Form size', () => {
      const { container } = render(
        <Form model={{}} size="sm">
          <FormItem label="Name" name="name" size="lg">
            <input type="text" />
          </FormItem>
        </Form>
      )

      expect(container.querySelector('.tiger-form-item--lg')).toBeInTheDocument()
      expect(container.querySelector('.tiger-form-item--sm')).not.toBeInTheDocument()
    })

    it('handles multiple validation rules on single field', async () => {
      const user = userEvent.setup()
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model, setModel] = useState({ password: '' })
        const rules: FormRule[] = [
          { required: true, message: 'Password is required' },
          { min: 8, message: 'Password must be at least 8 characters' }
        ]
        return (
          <Form ref={formRef} model={model}>
            <FormItem label="Password" name="password" rules={rules}>
              <input
                type="password"
                aria-label="password"
                value={model.password}
                onChange={(e) => setModel({ password: e.target.value })}
              />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      const input = screen.getByLabelText('password')

      // Empty field - should show required error
      await act(async () => {
        await formRef.current?.validateField('password')
      })
      expect(await screen.findByText('Password is required')).toBeInTheDocument()

      // Short password - should show min length error
      await user.type(input, '123')
      await act(async () => {
        await formRef.current?.validateField('password')
      })

      await waitFor(() => {
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })

    it('handles form without rules gracefully', async () => {
      const onSubmit = vi.fn()

      function Demo() {
        const [model] = useState({ username: 'john' })
        return (
          <Form model={model} onSubmit={onSubmit}>
            <FormItem label="Username" name="username">
              <input aria-label="username" />
            </FormItem>
            <button type="submit">Submit</button>
          </Form>
        )
      }

      render(<Demo />)
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
      fireEvent.submit(form as HTMLFormElement)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          valid: true,
          values: { username: 'john' },
          errors: []
        })
      })
    })

    it('supports value transform before validation', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ email: '  test@example.com  ' })
        const rules: FormRules = {
          email: [{
            type: 'email',
            message: 'Invalid email',
            transform: (value) => (value as string).trim()
          }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Email" name="email">
              <input aria-label="email" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('email')
      })

      // Should pass validation after trim
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
    })
  })

  // ==================== Accessibility ====================
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <Form model={{}}>
          <div>Accessible form</div>
        </Form>
      )

      await expectNoA11yViolations(container)
    })

    it('associates label with input field', () => {
      const { container } = render(
        <Form model={{}}>
          <FormItem label="Full Name" name="name">
            <input type="text" />
          </FormItem>
        </Form>
      )

      const label = container.querySelector('label')
      const input = container.querySelector('input')

      expect(label).toHaveAttribute('for')
      expect(input).toHaveAttribute('id')
      expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'))
    })

    it('sets aria-invalid on invalid field', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ name: '' })
        const rules: FormRules = {
          name: [{ required: true, message: 'Required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Name" name="name">
              <input aria-label="name" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      const input = screen.getByLabelText('name')

      expect(input).not.toHaveAttribute('aria-invalid')

      await act(async () => {
        await formRef.current?.validateField('name')
      })

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('sets aria-required on required field', () => {
      render(
        <Form model={{}}>
          <FormItem label="Name" name="name" required>
            <input aria-label="name" />
          </FormItem>
        </Form>
      )

      const input = screen.getByLabelText('name')
      expect(input).toHaveAttribute('aria-required', 'true')
    })

    it('error message has role=alert', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ name: '' })
        const rules: FormRules = {
          name: [{ required: true, message: 'Name required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem label="Name" name="name">
              <input aria-label="name" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('name')
      })

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('Name required')
    })
  })
})
