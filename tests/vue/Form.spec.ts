/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { defineComponent, reactive, ref, h, nextTick } from 'vue'
import { Form, FormItem, type FormRule, type FormRules } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

describe('Form', () => {
  // ==================== Basic Functionality ====================
  describe('Basic Functionality', () => {
    it('renders a semantic form element', () => {
      const { container } = render(Form, {
        props: { model: {} },
        slots: { default: '<div>Content</div>' }
      })

      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
      expect(form?.tagName.toLowerCase()).toBe('form')
    })

    it('renders form with default classes', () => {
      const { container } = render(Form, {
        props: { model: {} }
      })

      const form = container.querySelector('form')
      expect(form).toHaveClass('tiger-form')
    })

    it('renders FormItem with label', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name' },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    it('renders FormItem required asterisk when required prop is true', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', required: true },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      const asterisk = container.querySelector('.tiger-form-item__asterisk')
      expect(asterisk).toBeInTheDocument()
      expect(asterisk?.textContent).toBe('*')
    })

    it('hides asterisk when showRequiredAsterisk is false', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model, showRequiredAsterisk: false },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', required: true },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      const asterisk = container.querySelector('.tiger-form-item__asterisk')
      expect(asterisk).not.toBeInTheDocument()
    })
  })

  // ==================== Layout Modes ====================
  describe('Layout Modes', () => {
    it('renders horizontal layout (label-right) by default', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name' },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      expect(container.querySelector('.tiger-form--label-right')).toBeInTheDocument()
    })

    it('renders with label position left', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model, labelPosition: 'left' },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name' },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      expect(container.querySelector('.tiger-form--label-left')).toBeInTheDocument()
    })

    it('renders with label position top', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model, labelPosition: 'top' },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name' },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      expect(container.querySelector('.tiger-form--label-top')).toBeInTheDocument()
    })

    it('applies custom label width', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model, labelWidth: 120 },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name' },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      const label = container.querySelector('.tiger-form-item__label')
      expect(label).toHaveStyle({ width: '120px' })
    })

    it('FormItem labelWidth overrides Form labelWidth', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model, labelWidth: 100 },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', labelWidth: 150 },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      const label = container.querySelector('.tiger-form-item__label')
      expect(label).toHaveStyle({ width: '150px' })
    })
  })

  // ==================== Validation Functionality ====================
  describe('Validation Functionality', () => {
    it('validates with FormItem rules override on blur', async () => {
      const rules: FormRule[] = [{ required: true, message: 'Username is required' }]
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '' })
          return () =>
            h(
              Form,
              { model },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username', rules },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username,
                          onInput: (e: Event) => {
                            model.username = (e.target as HTMLInputElement).value
                          }
                        })
                    }
                  ),
                  h('button', { type: 'submit' }, 'Submit')
                ]
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('username'))

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
      const Demo = defineComponent({
        setup() {
          const model = reactive({ email: '' })
          const rules: FormRules = {
            email: [{ required: true, message: 'Email is required' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Email', name: 'email' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'email',
                          value: model.email
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('email'))

      expect(await screen.findByText('Email is required')).toBeInTheDocument()
    })

    it('validates email format', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ email: 'invalid-email' })
          const rules: FormRules = {
            email: [{ type: 'email', message: 'Please enter valid email' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Email', name: 'email' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'email',
                          value: model.email
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('email'))

      expect(await screen.findByText('Please enter valid email')).toBeInTheDocument()
    })

    it('validates minimum length', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ password: 'abc' })
          const rules: FormRules = {
            password: [{ min: 6, message: 'Password must be at least 6 characters' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Password', name: 'password' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'password',
                          type: 'password',
                          value: model.password
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('password'))

      expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument()
    })

    it('validates maximum length', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: 'a very long name that exceeds the limit' })
          const rules: FormRules = {
            name: [{ max: 10, message: 'Name must be at most 10 characters' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', name: 'name' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'name',
                          value: model.name
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('name'))

      expect(await screen.findByText('Name must be at most 10 characters')).toBeInTheDocument()
    })

    it('validates with regex pattern', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ phone: 'abc' })
          const rules: FormRules = {
            phone: [{ pattern: /^\d+$/, message: 'Phone must contain only numbers' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Phone', name: 'phone' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'phone',
                          value: model.phone
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('phone'))

      expect(await screen.findByText('Phone must contain only numbers')).toBeInTheDocument()
    })

    it('validates with custom validator function', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ age: 15 })
          const rules: FormRules = {
            age: [
              {
                validator: (value) => {
                  if ((value as number) < 18) return 'Must be 18 or older'
                  return true
                }
              }
            ]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Age', name: 'age' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'age',
                          type: 'number',
                          value: model.age
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('age'))

      expect(await screen.findByText('Must be 18 or older')).toBeInTheDocument()
    })

    it('validates with async validator', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: 'taken' })
          const rules: FormRules = {
            username: [
              {
                validator: async (value) => {
                  await new Promise((resolve) => setTimeout(resolve, 10))
                  if (value === 'taken') return 'Username is already taken'
                  return true
                }
              }
            ]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('username'))

      expect(await screen.findByText('Username is already taken')).toBeInTheDocument()
    })

    it('displays validation error message in alert role', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ field: '' })
          const rules: FormRules = {
            field: [{ required: true, message: 'Field is required' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Field', name: 'field' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'field',
                          value: model.field
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('field'))

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
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '' })
          return () =>
            h(
              Form,
              { model },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username', rules },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username,
                          onInput: (e: Event) => {
                            model.username = (e.target as HTMLInputElement).value
                          }
                        })
                    }
                  ),
                  h('button', { type: 'submit' }, 'Submit')
                ]
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('username'))
      expect(screen.queryByText('Username is required')).not.toBeInTheDocument()

      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
      expect(form).toBeTruthy()
      await fireEvent.submit(form as HTMLFormElement)
      expect(await screen.findByText('Username is required')).toBeInTheDocument()
    })

    it('validates on change when trigger is change', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          const rules: FormRules = {
            name: [{ required: true, message: 'Name is required', trigger: 'change' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', name: 'name' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'name',
                          value: model.name,
                          onInput: (e: Event) => {
                            model.name = (e.target as HTMLInputElement).value
                          }
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      const input = screen.getByLabelText('name')

      // Trigger input event (which simulates change) on empty value
      await fireEvent.input(input, { target: { value: '' } })

      // Change event should trigger validation
      expect(await screen.findByText('Name is required')).toBeInTheDocument()
    })

    it('clears error when valid value is entered', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          const rules: FormRules = {
            name: [{ required: true, message: 'Name is required' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', name: 'name' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'name',
                          value: model.name,
                          onInput: (e: Event) => {
                            model.name = (e.target as HTMLInputElement).value
                          }
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      const input = screen.getByLabelText('name')

      // Trigger validation error
      await fireEvent.focusOut(input)
      expect(await screen.findByText('Name is required')).toBeInTheDocument()

      // Enter valid value
      await fireEvent.input(input, { target: { value: 'John' } })
      await fireEvent.focusOut(input)

      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
      })
    })
  })

  // ==================== Form Operations ====================
  describe('Form Operations', () => {
    it('emits submit event with valid data', async () => {
      const onSubmit = vi.fn()
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: 'john', password: 'secret123' })
          return () =>
            h(
              Form,
              { model, onSubmit },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username
                        })
                    }
                  ),
                  h('button', { type: 'submit' }, 'Submit')
                ]
              }
            )
        }
      })

      render(Demo)
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
      await fireEvent.submit(form as HTMLFormElement)

      expect(onSubmit).toHaveBeenCalledWith({
        valid: true,
        values: { username: 'john', password: 'secret123' },
        errors: []
      })
    })

    it('emits submit event with invalid data and errors', async () => {
      const onSubmit = vi.fn()
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '' })
          const rules: FormRules = {
            username: [{ required: true, message: 'Username is required' }]
          }
          return () =>
            h(
              Form,
              { model, rules, onSubmit },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username
                        })
                    }
                  ),
                  h('button', { type: 'submit' }, 'Submit')
                ]
              }
            )
        }
      })

      render(Demo)
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
      await fireEvent.submit(form as HTMLFormElement)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          valid: false,
          values: { username: '' },
          errors: [{ field: 'username', message: 'Username is required' }]
        })
      })
    })

    it('uses registered FormItem rules when calling exposed validateField', async () => {
      const rules: FormRule[] = [{ required: true, message: 'Username is required' }]

      let formApi:
        | {
            validateField: (name: string) => Promise<void>
            clearValidate: (name?: string | string[]) => void
          }
        | undefined

      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '' })
          return () =>
            h(
              Form,
              {
                model,
                ref: (el) => {
                  formApi = (el as typeof formApi) ?? undefined
                }
              },
              {
                default: () => [
                  h('div', { id: 'username-help' }, 'Helper text'),
                  h(
                    FormItem,
                    { label: 'Username', name: 'username', rules },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          'aria-describedby': 'username-help',
                          value: model.username,
                          onInput: (e: Event) => {
                            model.username = (e.target as HTMLInputElement).value
                          }
                        })
                    }
                  )
                ]
              }
            )
        }
      })

      render(Demo)
      expect(formApi).toBeTruthy()

      await formApi?.validateField('username')

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

      formApi?.clearValidate('username')

      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument()
        expect(input).not.toHaveAttribute('aria-invalid')
      })
    })

    it('validates entire form via exposed validate method', async () => {
      let formApi: { validate: () => Promise<boolean> } | undefined

      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '', email: '' })
          const rules: FormRules = {
            username: [{ required: true, message: 'Username required' }],
            email: [{ required: true, message: 'Email required' }]
          }
          return () =>
            h(
              Form,
              {
                model,
                rules,
                ref: (el) => {
                  formApi = (el as typeof formApi) ?? undefined
                }
              },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () => h('input', { 'aria-label': 'username', value: model.username })
                    }
                  ),
                  h(
                    FormItem,
                    { label: 'Email', name: 'email' },
                    {
                      default: () => h('input', { 'aria-label': 'email', value: model.email })
                    }
                  )
                ]
              }
            )
        }
      })

      render(Demo)

      const isValid = await formApi?.validate()
      expect(isValid).toBe(false)

      expect(await screen.findByText('Username required')).toBeInTheDocument()
      expect(await screen.findByText('Email required')).toBeInTheDocument()
    })

    it('validates only specified fields via validateFields', async () => {
      let formApi: { validateFields: (fields: string[]) => Promise<boolean> } | undefined

      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '', email: '' })
          const rules: FormRules = {
            username: [{ required: true, message: 'Username required' }],
            email: [{ required: true, message: 'Email required' }]
          }
          return () =>
            h(
              Form,
              {
                model,
                rules,
                ref: (el) => {
                  formApi = (el as typeof formApi) ?? undefined
                }
              },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () => h('input', { 'aria-label': 'username', value: model.username })
                    }
                  ),
                  h(
                    FormItem,
                    { label: 'Email', name: 'email' },
                    {
                      default: () => h('input', { 'aria-label': 'email', value: model.email })
                    }
                  )
                ]
              }
            )
        }
      })

      render(Demo)

      await formApi?.validateFields(['email'])
      expect(await screen.findByText('Email required')).toBeInTheDocument()
      expect(screen.queryByText('Username required')).not.toBeInTheDocument()

      await formApi?.validateFields(['username'])
      expect(await screen.findByText('Username required')).toBeInTheDocument()
    })

    it('clearValidate clears all errors when called without args', async () => {
      let formApi:
        | {
            validate: () => Promise<boolean>
            clearValidate: (names?: string | string[]) => void
          }
        | undefined

      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '', email: '' })
          const rules: FormRules = {
            username: [{ required: true, message: 'Username required' }],
            email: [{ required: true, message: 'Email required' }]
          }
          return () =>
            h(
              Form,
              {
                model,
                rules,
                ref: (el) => {
                  formApi = (el as typeof formApi) ?? undefined
                }
              },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () => h('input', { 'aria-label': 'username', value: model.username })
                    }
                  ),
                  h(
                    FormItem,
                    { label: 'Email', name: 'email' },
                    {
                      default: () => h('input', { 'aria-label': 'email', value: model.email })
                    }
                  )
                ]
              }
            )
        }
      })

      render(Demo)

      await formApi?.validate()
      expect(await screen.findByText('Username required')).toBeInTheDocument()
      expect(await screen.findByText('Email required')).toBeInTheDocument()

      formApi?.clearValidate()

      await waitFor(() => {
        expect(screen.queryByText('Username required')).not.toBeInTheDocument()
        expect(screen.queryByText('Email required')).not.toBeInTheDocument()
      })
    })

    it('clearValidate clears specific field errors', async () => {
      let formApi:
        | {
            validate: () => Promise<boolean>
            clearValidate: (names?: string | string[]) => void
          }
        | undefined

      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '', email: '' })
          const rules: FormRules = {
            username: [{ required: true, message: 'Username required' }],
            email: [{ required: true, message: 'Email required' }]
          }
          return () =>
            h(
              Form,
              {
                model,
                rules,
                ref: (el) => {
                  formApi = (el as typeof formApi) ?? undefined
                }
              },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () => h('input', { 'aria-label': 'username', value: model.username })
                    }
                  ),
                  h(
                    FormItem,
                    { label: 'Email', name: 'email' },
                    {
                      default: () => h('input', { 'aria-label': 'email', value: model.email })
                    }
                  )
                ]
              }
            )
        }
      })

      render(Demo)

      await formApi?.validate()
      expect(await screen.findByText('Username required')).toBeInTheDocument()
      expect(await screen.findByText('Email required')).toBeInTheDocument()

      formApi?.clearValidate('username')

      await waitFor(() => {
        expect(screen.queryByText('Username required')).not.toBeInTheDocument()
        expect(screen.getByText('Email required')).toBeInTheDocument()
      })
    })

    it('clearValidate clears multiple field errors via array', async () => {
      let formApi:
        | {
            validate: () => Promise<boolean>
            clearValidate: (names?: string | string[]) => void
          }
        | undefined

      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '', email: '', phone: '' })
          const rules: FormRules = {
            username: [{ required: true, message: 'Username required' }],
            email: [{ required: true, message: 'Email required' }],
            phone: [{ required: true, message: 'Phone required' }]
          }
          return () =>
            h(
              Form,
              {
                model,
                rules,
                ref: (el) => {
                  formApi = (el as typeof formApi) ?? undefined
                }
              },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () => h('input', { 'aria-label': 'username', value: model.username })
                    }
                  ),
                  h(
                    FormItem,
                    { label: 'Email', name: 'email' },
                    {
                      default: () => h('input', { 'aria-label': 'email', value: model.email })
                    }
                  ),
                  h(
                    FormItem,
                    { label: 'Phone', name: 'phone' },
                    {
                      default: () => h('input', { 'aria-label': 'phone', value: model.phone })
                    }
                  )
                ]
              }
            )
        }
      })

      render(Demo)

      await formApi?.validate()
      formApi?.clearValidate(['username', 'email'])

      await waitFor(() => {
        expect(screen.queryByText('Username required')).not.toBeInTheDocument()
        expect(screen.queryByText('Email required')).not.toBeInTheDocument()
        expect(screen.getByText('Phone required')).toBeInTheDocument()
      })
    })

    it('resetFields clears validation errors', async () => {
      let formApi:
        | {
            validate: () => Promise<boolean>
            resetFields: () => void
          }
        | undefined

      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '' })
          const rules: FormRules = {
            username: [{ required: true, message: 'Username required' }]
          }
          return () =>
            h(
              Form,
              {
                model,
                rules,
                ref: (el) => {
                  formApi = (el as typeof formApi) ?? undefined
                }
              },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () => h('input', { 'aria-label': 'username', value: model.username })
                    }
                  )
              }
            )
        }
      })

      render(Demo)

      await formApi?.validate()
      expect(await screen.findByText('Username required')).toBeInTheDocument()

      formApi?.resetFields()

      await waitFor(() => {
        expect(screen.queryByText('Username required')).not.toBeInTheDocument()
      })
    })

    it('emits validate event when field is validated', async () => {
      const onValidate = vi.fn()
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '' })
          const rules: FormRules = {
            username: [{ required: true, message: 'Username required' }]
          }
          return () =>
            h(
              Form,
              { model, rules, onValidate },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('username'))

      await waitFor(() => {
        expect(onValidate).toHaveBeenCalledWith('username', false, 'Username required')
      })
    })
  })

  // ==================== Edge Cases ====================
  describe('Edge Cases', () => {
    it('handles nested form field paths', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({
            user: {
              profile: {
                name: ''
              }
            }
          })
          const rules: FormRules = {
            'user.profile.name': [{ required: true, message: 'Name is required' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', name: 'user.profile.name' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'name',
                          value: model.user.profile.name
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('name'))

      expect(await screen.findByText('Name is required')).toBeInTheDocument()
    })

    it('handles dynamic field addition', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive<Record<string, string>>({ field1: '' })
          const showField2 = ref(false)
          const rules: FormRules = {
            field1: [{ required: true, message: 'Field 1 required' }],
            field2: [{ required: true, message: 'Field 2 required' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Field 1', name: 'field1' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'field1',
                          value: model.field1
                        })
                    }
                  ),
                  showField2.value &&
                    h(
                      FormItem,
                      { label: 'Field 2', name: 'field2' },
                      {
                        default: () =>
                          h('input', {
                            'aria-label': 'field2',
                            value: model.field2 || ''
                          })
                      }
                    ),
                  h(
                    'button',
                    {
                      type: 'button',
                      onClick: () => {
                        showField2.value = true
                        model.field2 = ''
                      }
                    },
                    'Add Field'
                  )
                ]
              }
            )
        }
      })

      render(Demo)

      // Initially only field1 is visible
      expect(screen.getByLabelText('field1')).toBeInTheDocument()
      expect(screen.queryByLabelText('field2')).not.toBeInTheDocument()

      // Add field2
      await fireEvent.click(screen.getByRole('button', { name: 'Add Field' }))
      await nextTick()

      expect(screen.getByLabelText('field2')).toBeInTheDocument()

      // Validate the newly added field
      await fireEvent.focusOut(screen.getByLabelText('field2'))
      expect(await screen.findByText('Field 2 required')).toBeInTheDocument()
    })

    it('handles disabled form state', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '' })
          return () =>
            h(
              Form,
              { model, disabled: true },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username
                        })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      expect(container.querySelector('.tiger-form--disabled')).toBeInTheDocument()
      expect(container.querySelector('.tiger-form-item--disabled')).toBeInTheDocument()
    })

    it('handles FormItem error prop (controlled error)', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '' })
          return () =>
            h(
              Form,
              { model },
              {
                default: () =>
                  h(
                    FormItem,
                    {
                      label: 'Username',
                      name: 'username',
                      error: 'Custom error message'
                    },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('handles showMessage=false to hide error messages', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: '' })
          const rules: FormRules = {
            username: [{ required: true, message: 'Username required' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    {
                      label: 'Username',
                      name: 'username',
                      showMessage: false
                    },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('username'))

      // Wait a bit for potential error message
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('supports different form sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const

      sizes.forEach((size) => {
        const Demo = defineComponent({
          setup() {
            const model = reactive({ name: '' })
            return () =>
              h(
                Form,
                { model, size },
                {
                  default: () =>
                    h(
                      FormItem,
                      { label: 'Name', name: 'name' },
                      {
                        default: () => h('input', { type: 'text' })
                      }
                    )
                }
              )
          }
        })

        const { container, unmount } = render(Demo)
        expect(container.querySelector(`.tiger-form-item--${size}`)).toBeInTheDocument()
        unmount()
      })
    })

    it('FormItem size overrides Form size', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model, size: 'sm' },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', name: 'name', size: 'lg' },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      expect(container.querySelector('.tiger-form-item--lg')).toBeInTheDocument()
      expect(container.querySelector('.tiger-form-item--sm')).not.toBeInTheDocument()
    })

    it('handles multiple validation rules on single field', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ password: '' })
          const rules: FormRule[] = [
            { required: true, message: 'Password is required' },
            { min: 8, message: 'Password must be at least 8 characters' }
          ]
          return () =>
            h(
              Form,
              { model },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Password', name: 'password', rules },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'password',
                          type: 'password',
                          value: model.password,
                          onInput: (e: Event) => {
                            model.password = (e.target as HTMLInputElement).value
                          }
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      const input = screen.getByLabelText('password')

      // Empty field - should show required error
      await fireEvent.focusOut(input)
      expect(await screen.findByText('Password is required')).toBeInTheDocument()

      // Short password - should show min length error
      await fireEvent.input(input, { target: { value: '123' } })
      await fireEvent.focusOut(input)

      await waitFor(() => {
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })

    it('handles form without rules gracefully', async () => {
      const onSubmit = vi.fn()
      const Demo = defineComponent({
        setup() {
          const model = reactive({ username: 'john' })
          return () =>
            h(
              Form,
              { model, onSubmit },
              {
                default: () => [
                  h(
                    FormItem,
                    { label: 'Username', name: 'username' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'username',
                          value: model.username
                        })
                    }
                  ),
                  h('button', { type: 'submit' }, 'Submit')
                ]
              }
            )
        }
      })

      render(Demo)
      const form = screen.getByRole('button', { name: 'Submit' }).closest('form')
      await fireEvent.submit(form as HTMLFormElement)

      expect(onSubmit).toHaveBeenCalledWith({
        valid: true,
        values: { username: 'john' },
        errors: []
      })
    })

    it('supports value transform before validation', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ email: '  test@example.com  ' })
          const rules: FormRules = {
            email: [
              {
                type: 'email',
                message: 'Invalid email',
                transform: (value) => (value as string).trim()
              }
            ]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Email', name: 'email' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'email',
                          value: model.email
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('email'))

      // Should pass validation after trim
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
    })
  })

  // ==================== Accessibility ====================
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(Form, {
        props: { model: {} },
        slots: { default: '<div>Accessible form</div>' }
      })

      await expectNoA11yViolations(container)
    })

    it('associates label with input field', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Full Name', name: 'name' },
                    {
                      default: () => h('input', { type: 'text' })
                    }
                  )
              }
            )
        }
      })

      const { container } = render(Demo)
      const label = container.querySelector('label')
      const input = container.querySelector('input')

      expect(label).toHaveAttribute('for')
      expect(input).toHaveAttribute('id')
      expect(label?.getAttribute('for')).toBe(input?.getAttribute('id'))
    })

    it('sets aria-invalid on invalid field', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          const rules: FormRules = {
            name: [{ required: true, message: 'Required' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', name: 'name' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'name',
                          value: model.name
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      const input = screen.getByLabelText('name')

      expect(input).not.toHaveAttribute('aria-invalid')

      await fireEvent.focusOut(input)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('sets aria-required on required field', () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          return () =>
            h(
              Form,
              { model },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', name: 'name', required: true },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'name',
                          value: model.name
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      const input = screen.getByLabelText('name')
      expect(input).toHaveAttribute('aria-required', 'true')
    })

    it('error message has role=alert', async () => {
      const Demo = defineComponent({
        setup() {
          const model = reactive({ name: '' })
          const rules: FormRules = {
            name: [{ required: true, message: 'Name required' }]
          }
          return () =>
            h(
              Form,
              { model, rules },
              {
                default: () =>
                  h(
                    FormItem,
                    { label: 'Name', name: 'name' },
                    {
                      default: () =>
                        h('input', {
                          'aria-label': 'name',
                          value: model.name
                        })
                    }
                  )
              }
            )
        }
      })

      render(Demo)
      await fireEvent.focusOut(screen.getByLabelText('name'))

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('Name required')
    })
  })
})
