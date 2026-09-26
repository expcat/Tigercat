/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { SchemaForm } from '@expcat/tigercat-react/SchemaForm'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import type { FormHandle } from '@expcat/tigercat-react/Form'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { SchemaFormSchema } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils/react'

const basicSchema: SchemaFormSchema = {
  fields: [
    { name: 'name', label: 'Name', required: true, placeholder: 'Your name' },
    { name: 'bio', label: 'Bio', type: 'textarea' }
  ]
}

const groupSchema: SchemaFormSchema = {
  groups: [
    {
      key: 'account',
      title: 'Account',
      fields: [{ name: 'email', label: 'Email', required: true }]
    },
    {
      key: 'address',
      title: 'Address',
      groups: [
        {
          key: 'city-block',
          title: 'City block',
          fields: [{ name: 'address.city', label: 'City', defaultValue: 'Shanghai' }]
        }
      ]
    }
  ]
}

describe('SchemaForm (React)', () => {
  it('renders fields from schema', () => {
    render(<SchemaForm schema={basicSchema} />)

    expect(screen.getByRole('form', { name: 'Schema form' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByLabelText(/Bio/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('edits a field and emits the form model', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Demo() {
      const [model, setModel] = React.useState({ name: '', bio: '' })
      return (
        <SchemaForm
          schema={basicSchema}
          value={model}
          onChange={(values) => {
            setModel(values as { name: string; bio: string })
            onChange(values)
          }}
        />
      )
    }
    render(<Demo />)

    await user.type(screen.getByPlaceholderText('Your name'), 'Ada')

    expect(onChange).toHaveBeenCalled()
    const next = onChange.mock.calls.at(-1)?.[0] as { name: string }
    expect(next.name).toBe('Ada')
  })

  it('validates required fields on submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SchemaForm schema={basicSchema} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(onSubmit).toHaveBeenCalled()
    const event = onSubmit.mock.calls.at(-1)?.[0] as { valid: boolean; errors: unknown[] }
    expect(event.valid).toBe(false)
    expect(event.errors.length).toBeGreaterThan(0)
  })

  it('paints a schema checkbox from defaultValue without a local value', () => {
    render(
      <SchemaForm
        schema={{
          fields: [{ name: 'agree', label: 'Agree', type: 'checkbox', defaultValue: true }]
        }}
        showActions={false}
      />
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('paints schema radio options without a field slot', () => {
    render(
      <SchemaForm
        schema={{
          fields: [
            {
              name: 'plan',
              label: 'Plan',
              type: 'radio',
              defaultValue: 'pro',
              options: [
                { label: 'Free', value: 'free' },
                { label: 'Pro', value: 'pro' }
              ]
            }
          ]
        }}
        showActions={false}
      />
    )
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios).toHaveLength(2)
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(radios[1].checked).toBe(true)
  })

  it('forwards undoable onto the inner Form engine', async () => {
    const user = userEvent.setup()
    const formRef = React.createRef<FormHandle>()
    render(
      <SchemaForm
        ref={formRef}
        undoable
        showActions={false}
        schema={{ fields: [{ name: 'name', label: 'Name', defaultValue: 'Ada' }] }}
      />
    )
    expect(formRef.current?.canUndo).toBe(false)
    const input = screen.getByLabelText(/Name/) as HTMLInputElement
    await user.clear(input)
    await user.type(input, 'Grace')
    expect(formRef.current?.canUndo).toBe(true)
  })

  it('forwards onValidate from the inner Form', async () => {
    const onValidate = vi.fn()
    const formRef = React.createRef<FormHandle>()
    render(
      <SchemaForm ref={formRef} schema={basicSchema} onValidate={onValidate} showActions={false} />
    )
    await act(async () => {
      await formRef.current?.validateField('name')
    })
    expect(onValidate).toHaveBeenCalledWith('name', false, expect.any(String))
  })

  it('renders nested groups and dotted paths', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SchemaForm schema={groupSchema} onChange={onChange} />)

    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('City block')).toBeInTheDocument()
    const city = screen.getByLabelText(/City$/) as HTMLInputElement
    expect(city.value).toBe('Shanghai')
    expect(document.querySelector('legend, fieldset')).toBeNull()
    const titles = [...document.querySelectorAll('.tiger-schema-form__group-title')].map(
      (node) => node.textContent
    )
    expect(titles).toEqual(['Account', 'Address', 'City block'])
    const cityGroup = document.querySelector('[data-schema-group="city-block"]')
    const cityTitle = cityGroup?.querySelector('.tiger-schema-form__group-title')
    const cityFrame = cityGroup?.querySelector('.tiger-schema-form__nested')
    expect(cityTitle?.className).toContain('w-full')
    expect(cityFrame?.contains(cityTitle ?? null)).toBe(false)
    expect(cityFrame?.querySelectorAll('.tiger-form-item__label')).toHaveLength(1)

    await user.clear(city)
    await user.type(city, 'Beijing')
    const next = onChange.mock.calls.at(-1)?.[0] as { address?: { city?: string } }
    expect(next.address?.city).toBe('Beijing')
  })

  it('uses locale overlay for actions', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <SchemaForm schema={basicSchema} />
      </ConfigProvider>
    )

    expect(screen.getByRole('form', { name: '动态表单' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重置' })).toBeInTheDocument()
  })

  it('renders date widgets from the schema union', () => {
    render(
      <SchemaForm
        schema={{
          fields: [{ name: 'due', label: 'Due', type: 'date', placeholder: 'Pick a day' }]
        }}
        showActions={false}
      />
    )
    expect(screen.getByPlaceholderText('Pick a day')).toBeInTheDocument()
  })

  it('shows one group heading and one field label when a nested title matches the field', () => {
    render(
      <SchemaForm
        labelPosition="top"
        showActions={false}
        schema={{
          groups: [
            {
              key: 'address',
              title: '地址',
              groups: [
                {
                  key: 'city',
                  title: '城市',
                  fields: [
                    { name: 'address.city', label: '城市', required: true, defaultValue: '上海' },
                    { name: 'notify', label: '邮件通知', type: 'switch' }
                  ]
                }
              ]
            }
          ]
        }}
      />
    )

    expect(
      [...document.querySelectorAll('.tiger-schema-form__group-title')].map(
        (node) => node.textContent
      )
    ).toEqual(['地址', '城市'])
    expect(
      [...document.querySelectorAll('.tiger-form-item__label')].map((node) =>
        (node.textContent ?? '').replace(/\s+/g, '')
      )
    ).toEqual(['*城市', '邮件通知'])
    expect(document.querySelectorAll('.tiger-form-item__asterisk')).toHaveLength(1)
    const cityLabel = document.querySelector(
      '[data-tiger-field="address.city"] .tiger-form-item__label'
    )
    expect(cityLabel?.closest('.tiger-schema-form__group-title')).toBeNull()
    expect(cityLabel?.closest('[data-schema-group="city"]')).toBeTruthy()
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(<SchemaForm schema={basicSchema} />)
    await expectNoA11yViolations(container)
  })

  it('has no obvious a11y violations in nested groups', async () => {
    const { container } = render(<SchemaForm schema={groupSchema} showActions={false} />)
    await expectNoA11yViolations(container)
  })
})
