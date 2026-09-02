/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Form, type FormHandle } from '@expcat/tigercat-react/Form'
import { useFormController } from '@expcat/tigercat-react/useFormController'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'
import { Space } from '@expcat/tigercat-react/Space'
import type { FormRule, FormRules } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
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
    it('renders horizontal layout (label-left) by default', () => {
      const { container } = render(
        <Form model={{}}>
          <FormItem label="Name">
            <input type="text" />
          </FormItem>
        </Form>
      )

      expect(container.querySelector('.tiger-form--label-left')).toBeInTheDocument()
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
      expect(container.querySelector('.tiger-form-item__label')).toHaveClass('text-start')
    })

    it('keeps explicit top label alignment', () => {
      const { container } = render(
        <Form model={{}} labelPosition="top" labelAlign="right">
          <FormItem label="Name">
            <input type="text" />
          </FormItem>
        </Form>
      )

      expect(container.querySelector('.tiger-form-item__label')).toHaveClass('text-end')
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
    it('supports conditional visibility and skips hidden field validation', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model, setModel] = useState({ accountType: 'personal', companyName: '' })
        const rules: FormRules = {
          companyName: [{ required: true, message: 'Company is required' }]
        }

        return (
          <Form
            ref={formRef}
            model={model}
            rules={rules}
            conditions={{
              companyName: { showWhen: { field: 'accountType', value: 'company' } }
            }}>
            <button
              type="button"
              onClick={() => setModel((current) => ({ ...current, accountType: 'company' }))}>
              Company
            </button>
            <FormItem label="Company" name="companyName">
              <input aria-label="companyName" value={model.companyName} readOnly />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)

      expect(screen.queryByLabelText('companyName')).not.toBeInTheDocument()
      await act(async () => {
        expect(await formRef.current?.validate()).toBe(true)
      })

      await userEvent.click(screen.getByRole('button', { name: 'Company' }))

      expect(screen.getByLabelText('companyName')).toBeInTheDocument()
      await act(async () => {
        expect(await formRef.current?.validate()).toBe(false)
      })
      expect(await screen.findByText('Company is required')).toBeInTheDocument()
    })

    it('supports conditional disabled and required state on FormItem', async () => {
      const formRef = React.createRef<FormHandle>()

      render(
        <Form ref={formRef} model={{ newsletter: true, locked: true, email: '' }}>
          <FormItem
            label="Email"
            name="email"
            condition={{
              requiredWhen: { field: 'newsletter', value: true },
              disabledWhen: { field: 'locked', value: true }
            }}>
            <input aria-label="email" readOnly />
          </FormItem>
        </Form>
      )

      expect(document.querySelector('.tiger-form-item__asterisk')).toBeInTheDocument()
      expect(screen.getByLabelText('email')).toBeDisabled()

      await act(async () => {
        await formRef.current?.validateField('email')
      })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
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

    it('localizes built-in validation messages via ConfigProvider locale', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: '' })
        // No per-rule message → falls back to the localized built-in message
        const rules: FormRules = { username: [{ required: true }] }
        return (
          <ConfigProvider locale={zhCN}>
            <Form ref={formRef} model={model} rules={rules}>
              <FormItem label="Username" name="username">
                <input aria-label="username" value={model.username} readOnly />
              </FormItem>
            </Form>
          </ConfigProvider>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('username', undefined, 'blur')
      })

      expect(await screen.findByText('此字段为必填项')).toBeInTheDocument()
    })

    it('uses Traditional Chinese required copy under zhTW', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model] = useState({ username: '' })
        return (
          <ConfigProvider locale={zhTW}>
            <Form ref={formRef} model={model} rules={{ username: [{ required: true }] }}>
              <FormItem label="Username" name="username">
                <input aria-label="username" value={model.username} readOnly />
              </FormItem>
            </Form>
          </ConfigProvider>
        )
      }

      render(<Demo />)
      await act(async () => {
        await formRef.current?.validateField('username')
      })

      const message = await screen.findByRole('alert')
      expect(message).toHaveTextContent('此欄位為必填項')
      expect(message).not.toHaveTextContent('此字段为必填项')
      expect(message).not.toHaveTextContent('This field is required')
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

    it('debounces change-triggered validation when validateDebounce is set', async () => {
      vi.useFakeTimers()
      const onValidate = vi.fn()

      try {
        function Demo() {
          const [model, setModel] = useState({ name: '' })
          const rules: FormRules = {
            name: [{ min: 3, message: 'Name must be at least 3 characters', trigger: 'change' }]
          }

          return (
            <Form model={model} rules={rules} validateDebounce={200} onValidate={onValidate}>
              <FormItem label="Name" name="name">
                <input
                  aria-label="name"
                  value={model.name}
                  onChange={(event) => setModel({ name: event.target.value })}
                />
              </FormItem>
            </Form>
          )
        }

        render(<Demo />)
        fireEvent.change(screen.getByLabelText('name'), { target: { value: 'Jo' } })

        expect(onValidate).not.toHaveBeenCalled()
        await act(async () => {
          await vi.advanceTimersByTimeAsync(199)
        })
        expect(onValidate).not.toHaveBeenCalled()
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1)
        })

        expect(onValidate).toHaveBeenCalledWith('name', false, 'Name must be at least 3 characters')
      } finally {
        vi.useRealTimers()
      }
    })

    it('does not show required error after the first keystroke (Pages 02 / Input, no Form onChange)', async () => {
      function Demo() {
        const [model, setModel] = useState({ email: '' })
        const rules: FormRules = {
          email: [{ required: true, message: 'Email is required' }]
        }
        return (
          <Form model={model} rules={rules}>
            <FormItem name="email" label="Email">
              <Input
                aria-label="email"
                value={model.email}
                onChange={(event) => setModel({ email: event.target.value })}
              />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      const input = screen.getByLabelText('email')

      fireEvent.change(input, { target: { value: 'a' } })

      await waitFor(() => {
        expect(input).toHaveValue('a')
      })
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })

    it('does not show required error after the first native-input keystroke', async () => {
      function Demo() {
        const [model, setModel] = useState({ name: '' })
        const rules: FormRules = {
          name: [{ required: true, message: 'Name is required' }]
        }
        return (
          <Form model={model} rules={rules}>
            <FormItem name="name" label="Name">
              <input
                aria-label="name"
                value={model.name}
                onChange={(event) => setModel({ name: event.target.value })}
              />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      const input = screen.getByLabelText('name')

      fireEvent.change(input, { target: { value: 'J' } })

      await waitFor(() => {
        expect(input).toHaveValue('J')
      })
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    })

    it('clears a required error on the first valid character without an extra blur', async () => {
      const formRef = React.createRef<FormHandle>()

      function Demo() {
        const [model, setModel] = useState({ email: '' })
        const rules: FormRules = {
          email: [{ required: true, message: 'Email is required' }]
        }
        return (
          <Form ref={formRef} model={model} rules={rules}>
            <FormItem name="email" label="Email">
              <Input
                aria-label="email"
                value={model.email}
                onChange={(event) => setModel({ email: event.target.value })}
              />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      const input = screen.getByLabelText('email')

      await act(async () => {
        await formRef.current?.validateField('email')
      })
      expect(await screen.findByText('Email is required')).toBeInTheDocument()

      fireEvent.change(input, { target: { value: 'a' } })

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
      })

      fireEvent.change(input, { target: { value: '' } })

      expect(await screen.findByText('Email is required')).toBeInTheDocument()
    })

    it('writes nested name paths before change-triggered validation', async () => {
      function Demo() {
        const [model, setModel] = useState({ user: { email: '' } })
        const rules: FormRules = {
          'user.email': [{ required: true, message: 'Email is required' }]
        }
        return (
          <Form model={model} rules={rules}>
            <FormItem name="user.email" label="Email">
              <input
                aria-label="email"
                value={model.user.email}
                onChange={(event) => setModel({ user: { email: event.target.value } })}
              />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      const input = screen.getByLabelText('email')

      fireEvent.change(input, { target: { value: 'a' } })

      await waitFor(() => {
        expect(input).toHaveValue('a')
      })
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
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

    it('validates only specified fields via validateFields', async () => {
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
        await formRef.current?.validateFields(['email'])
      })

      expect(await screen.findByText('Email required')).toBeInTheDocument()
      expect(screen.queryByText('Username required')).not.toBeInTheDocument()

      await act(async () => {
        await formRef.current?.validateFields(['username'])
      })

      expect(await screen.findByText('Username required')).toBeInTheDocument()
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

    it('resetFields restores the initial model snapshot', async () => {
      const formRef = React.createRef<FormHandle>()

      const Demo = () => {
        const [model, setModel] = React.useState({ username: 'initial' })
        return (
          <Form ref={formRef} model={model} onChange={setModel}>
            <FormItem name="username" label="Username">
              <input
                aria-label="username"
                value={model.username}
                onChange={(event) => setModel({ username: event.target.value })}
              />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      const input = screen.getByLabelText('username') as HTMLInputElement

      fireEvent.change(input, { target: { value: 'changed' } })
      expect(input.value).toBe('changed')

      await act(async () => {
        formRef.current?.resetFields()
      })

      expect(input.value).toBe('initial')
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

    it('validates only the requested field when validateField is called', async () => {
      const formRef = React.createRef<FormHandle>()
      const fieldNames = Array.from({ length: 24 }, (_, index) => `field${index}`)
      const validators = Object.fromEntries(fieldNames.map((field) => [field, vi.fn(() => null)]))
      const model = Object.fromEntries(fieldNames.map((field) => [field, 'value']))
      const rules = Object.fromEntries(
        fieldNames.map((field) => [field, { validator: validators[field] }])
      ) as FormRules

      render(
        <Form ref={formRef} model={model} rules={rules}>
          {fieldNames.map((field) => (
            <FormItem key={field} label={field} name={field}>
              <input aria-label={field} />
            </FormItem>
          ))}
        </Form>
      )

      await act(async () => {
        await formRef.current?.validateField('field12')
      })

      expect(validators.field12).toHaveBeenCalledTimes(1)
      for (const field of fieldNames.filter((field) => field !== 'field12')) {
        expect(validators[field]).not.toHaveBeenCalled()
      }
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

      // Wait until validation marks the field invalid, then assert the
      // error message itself stays suppressed
      await waitFor(() => {
        expect(screen.getByLabelText('username')).toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not leak Input-only internals (errorMessage/_shakeTrigger) to non-Input children', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { container } = render(
        <Form model={{}}>
          <FormItem label="Bio" error="Something went wrong" showMessage={false}>
            <Space>
              <input aria-label="bio" />
            </Space>
          </FormItem>
        </Form>
      )

      // The Space wrapper spreads unknown props to its <div>; the Input-only internals
      // must not be forwarded onto it.
      const wrapper = screen.getByLabelText('bio').parentElement as HTMLElement
      expect(wrapper.hasAttribute('errormessage')).toBe(false)
      expect(wrapper.hasAttribute('_shaketrigger')).toBe(false)
      expect(container.querySelector('[errormessage]')).toBeNull()

      const leaked = errorSpy.mock.calls.some((args) =>
        args.some((arg) => String(arg).includes('does not recognize'))
      )
      expect(leaked).toBe(false)

      errorSpy.mockRestore()
    })

    it('hides the error surface when showMessage is false and still marks the control invalid', () => {
      render(
        <Form model={{}}>
          <FormItem label="Username" error="Username taken" showMessage={false}>
            <Input aria-label="username" />
          </FormItem>
        </Form>
      )

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.queryByText('Username taken')).not.toBeInTheDocument()
      expect(screen.getByLabelText('username')).toHaveAttribute('aria-invalid', 'true')
    })

    it('keeps aria-invalid when a wrapped Input has a controlled error and showMessage is false', () => {
      const WrappedInput = (props: React.ComponentProps<typeof Input>) => (
        <Input aria-label={props['aria-label']} />
      )

      render(
        <Form model={{}}>
          <FormItem label="Username" error="Username taken" showMessage={false}>
            <WrappedInput aria-label="username" />
          </FormItem>
        </Form>
      )

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.getByLabelText('username')).toHaveAttribute('aria-invalid', 'true')
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
  })

  // ==================== Accessibility ====================
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <Form model={{ name: '' }} rules={{ name: { required: true } }}>
          <FormItem name="name" label="Name" required>
            <Input />
          </FormItem>
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

  describe('loading prop', () => {
    it('should add loading class when loading is true', () => {
      const { container } = render(<Form loading>content</Form>)
      expect(container.querySelector('form')!.className).toContain('tiger-form--loading')
    })

    it('should not submit when loading is true', async () => {
      const onSubmit = vi.fn()
      const { container } = render(
        <Form loading onSubmit={onSubmit}>
          content
        </Form>
      )
      await fireEvent.submit(container.querySelector('form')!)
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('addField / removeField', () => {
    it('should add a field via ref addField method', async () => {
      const formRef = React.createRef<FormHandle>()
      const onChange = vi.fn()

      render(
        <Form ref={formRef} model={{ name: 'Alice' }} onChange={onChange}>
          content
        </Form>
      )

      await act(async () => {
        formRef.current?.addField('age', 25)
      })

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice', age: 25 }))
    })

    it('should remove a field via ref removeField method', async () => {
      const formRef = React.createRef<FormHandle>()
      const onChange = vi.fn()

      render(
        <Form ref={formRef} model={{ name: 'Alice', email: 'test@test.com' }} onChange={onChange}>
          content
        </Form>
      )

      await act(async () => {
        formRef.current?.removeField('email')
      })

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice' }))
      expect(onChange).toHaveBeenCalledWith(
        expect.not.objectContaining({ email: expect.anything() })
      )
    })
  })

  // ==================== v0.6.0 Features ====================
  describe('v0.6.0 Features', () => {
    describe('Undo / Redo', () => {
      it('exposes undo/redo/snapshotHistory via ref when undoable', async () => {
        const formRef = React.createRef<FormHandle>()
        const onChange = vi.fn()

        render(
          <Form ref={formRef} model={{ name: 'Alice' }} undoable onChange={onChange}>
            content
          </Form>
        )

        expect(formRef.current?.canUndo).toBe(false)
        expect(formRef.current?.canRedo).toBe(false)

        await act(async () => {
          formRef.current?.snapshotHistory()
        })
      })
    })

    describe('errorDisplayMode', () => {
      it('renders error in block mode', async () => {
        const formRef = React.createRef<FormHandle>()
        const rules: FormRules = { email: { required: true, message: 'Required' } }

        render(
          <Form ref={formRef} model={{ email: '' }} rules={rules}>
            <FormItem name="email" label="Email" errorDisplayMode="block">
              <input />
            </FormItem>
          </Form>
        )

        await act(async () => {
          try {
            await formRef.current?.validate()
          } catch {
            // expected
          }
        })

        const errorEl = screen.getByRole('alert')
        expect(errorEl).toHaveTextContent('Required')
        expect(errorEl.className).toContain('--tiger-error')
      })

      it('renders error in popup mode with absolute positioning', async () => {
        const formRef = React.createRef<FormHandle>()
        const rules: FormRules = { email: { required: true, message: 'Required' } }

        render(
          <Form ref={formRef} model={{ email: '' }} rules={rules}>
            <FormItem name="email" label="Email" errorDisplayMode="popup">
              <input />
            </FormItem>
          </Form>
        )

        await act(async () => {
          try {
            await formRef.current?.validate()
          } catch {
            // expected
          }
        })

        fireEvent.mouseEnter(screen.getByRole('textbox').closest('.tiger-form-item__content')!)
        const errorEl = await screen.findByRole('alert')
        expect(errorEl).toHaveTextContent('Required')
        expect(errorEl.className).toContain('--tiger-error')
      })
    })
  })

  describe('FormItem takeover', () => {
    it('owns an unbound Input so typing validates and resetFields clears the box', async () => {
      const formRef = React.createRef<FormHandle>()

      render(
        <Form ref={formRef} rules={{ name: { required: true, message: 'Required' } }}>
          <FormItem name="name" label="Name">
            <Input aria-label="name" />
          </FormItem>
        </Form>
      )

      const input = screen.getByLabelText('name')
      fireEvent.change(input, { target: { value: 'Ada' } })
      await act(async () => {
        expect(await formRef.current?.validate()).toBe(true)
      })

      await act(async () => {
        formRef.current?.resetFields()
      })
      expect(input).toHaveValue('')
    })

    it('marks required from rules without a required prop, and keeps aria-required when asterisks are hidden', () => {
      const { rerender } = render(
        <Form model={{ name: '' }}>
          <FormItem name="name" label="Name" rules={{ required: true }}>
            <Input aria-label="name" />
          </FormItem>
        </Form>
      )

      expect(document.querySelector('.tiger-form-item__asterisk')).toBeInTheDocument()
      expect(screen.getByLabelText('name')).toHaveAttribute('aria-required', 'true')

      rerender(
        <Form model={{ name: '' }} showRequiredAsterisk={false}>
          <FormItem name="name" label="Name" rules={{ required: true }}>
            <Input aria-label="name" />
          </FormItem>
        </Form>
      )

      expect(document.querySelector('.tiger-form-item__asterisk')).not.toBeInTheDocument()
      expect(screen.getByLabelText('name')).toHaveAttribute('aria-required', 'true')
    })

    it('associates the label with an Input wrapped in Space', () => {
      render(
        <Form model={{ name: '' }}>
          <FormItem name="name" label="Full Name">
            <Space>
              <Input aria-label="name" />
            </Space>
          </FormItem>
        </Form>
      )

      const label = document.querySelector('label')
      const input = screen.getByLabelText('name')
      expect(label).toHaveAttribute('for', input.id)
    })

    it('shares values with useFormController passed as controller', async () => {
      const formRef = React.createRef<FormHandle>()
      let ctrl: ReturnType<typeof useFormController> | null = null

      function Demo() {
        ctrl = useFormController({
          initialValues: { name: '' },
          rules: { name: { required: true, message: 'Required' } }
        })
        return (
          <Form ref={formRef} controller={ctrl}>
            <FormItem name="name" label="Name">
              <Input aria-label="name" />
            </FormItem>
          </Form>
        )
      }

      render(<Demo />)
      act(() => {
        ctrl?.setFieldValue('name', 'Ada')
      })
      expect(screen.getByLabelText('name')).toHaveValue('Ada')
      await act(async () => {
        formRef.current?.resetFields()
      })
      expect(ctrl?.getFieldValue('name')).toBe('')
      expect(screen.getByLabelText('name')).toHaveValue('')
    })

    it('writes an empty value and required error when a clearable Input is cleared', async () => {
      const formRef = React.createRef<FormHandle>()

      render(
        <Form ref={formRef} rules={{ name: { required: true, message: 'Required' } }}>
          <FormItem name="name" label="Name">
            <Input aria-label="name" clearable />
          </FormItem>
        </Form>
      )

      const input = screen.getByLabelText('name')
      fireEvent.change(input, { target: { value: 'Ada' } })
      fireEvent.click(screen.getByRole('button', { name: 'Clear input' }))

      expect(input).toHaveValue('')
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Required')
      })
    })
  })
})
