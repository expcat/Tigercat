/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { SchemaForm } from '@expcat/tigercat-react/SchemaForm'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
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
          model={model}
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
    const event = onSubmit.mock.calls.at(-1)?.[0] as { valid: boolean }
    expect(event.valid).toBe(false)
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

  it('has no obvious a11y violations', async () => {
    const { container } = render(<SchemaForm schema={basicSchema} />)
    await expectNoA11yViolations(container)
  })
})
