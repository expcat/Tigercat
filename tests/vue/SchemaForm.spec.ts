/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { SchemaForm } from '@expcat/tigercat-vue/SchemaForm'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { SchemaFormSchema } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils'

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

describe('SchemaForm (Vue)', () => {
  it('renders fields from schema', () => {
    render(SchemaForm, { props: { schema: basicSchema, showActions: true } })

    expect(screen.getByRole('form', { name: 'Schema form' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByLabelText(/Bio/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('edits a field and emits the form model', async () => {
    const onUpdate = vi.fn()
    const onChange = vi.fn()
    const model = reactive({ name: '', bio: '' })
    render(SchemaForm, {
      props: {
        schema: basicSchema,
        model,
        'onUpdate:model': onUpdate,
        onChange
      }
    })

    await fireEvent.update(screen.getByPlaceholderText('Your name'), 'Ada')

    expect(onUpdate).toHaveBeenCalled()
    const next = onUpdate.mock.calls.at(-1)?.[0] as { name: string }
    expect(next.name).toBe('Ada')
    expect(onChange.mock.calls.at(-1)?.[0]).toBe(next)
  })

  it('validates required fields on submit', async () => {
    const onSubmit = vi.fn()
    render(SchemaForm, {
      props: { schema: basicSchema, onSubmit }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(onSubmit).toHaveBeenCalled()
    })
    const event = onSubmit.mock.calls.at(-1)?.[0] as { valid: boolean }
    expect(event.valid).toBe(false)
  })

  it('renders nested groups and dotted paths', async () => {
    const onUpdate = vi.fn()
    render(SchemaForm, {
      props: {
        schema: groupSchema,
        'onUpdate:model': onUpdate
      }
    })

    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('City block')).toBeInTheDocument()
    const city = screen.getByLabelText(/City$/) as HTMLInputElement
    expect(city.value).toBe('Shanghai')

    await fireEvent.update(city, 'Beijing')
    const next = onUpdate.mock.calls.at(-1)?.[0] as { address?: { city?: string } }
    expect(next.address?.city).toBe('Beijing')
  })

  it('uses locale overlay for actions', () => {
    render({
      components: { ConfigProvider, SchemaForm },
      setup() {
        return { locale: zhCN, schema: basicSchema }
      },
      template: '<ConfigProvider :locale="locale"><SchemaForm :schema="schema" /></ConfigProvider>'
    })

    expect(screen.getByRole('form', { name: '动态表单' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重置' })).toBeInTheDocument()
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(SchemaForm, { props: { schema: basicSchema } })
    await expectNoA11yViolations(container)
  })
})
