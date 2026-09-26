/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, reactive } from 'vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { SchemaForm } from '@expcat/tigercat-vue/SchemaForm'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { FormHandle, SchemaFormSchema } from '@expcat/tigercat-core'
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
    const fields = document.querySelector('.tiger-schema-form__fields')
    expect(fields?.className).toContain('gap-y-[var(--tiger-spacing-lg)]')
    expect(fields?.className).toContain('max-content')
    const item = document.querySelector('.tiger-form-item') as HTMLElement | null
    expect(item?.style.display).toBe('grid')
    expect(item?.style.gridTemplateColumns).toBe('subgrid')
  })

  it('edits a field and emits the form model', async () => {
    const onUpdate = vi.fn()
    const onChange = vi.fn()
    const model = reactive({ name: '', bio: '' })
    render(SchemaForm, {
      props: {
        schema: basicSchema,
        modelValue: model,
        'onUpdate:modelValue': onUpdate,
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
    const event = onSubmit.mock.calls.at(-1)?.[0] as { valid: boolean; errors: unknown[] }
    expect(event.valid).toBe(false)
    expect(event.errors.length).toBeGreaterThan(0)
  })

  it('paints a schema checkbox from defaultValue without a local v-model', () => {
    render(SchemaForm, {
      props: {
        schema: {
          fields: [{ name: 'agree', label: 'Agree', type: 'checkbox', defaultValue: true }]
        },
        showActions: false
      }
    })
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('paints schema radio options without a field slot', () => {
    render(SchemaForm, {
      props: {
        schema: {
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
        },
        showActions: false
      }
    })
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios).toHaveLength(2)
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(radios[1].checked).toBe(true)
  })

  it('forwards undoable onto the inner Form engine', async () => {
    let formRef: FormHandle | null = null
    const Demo = defineComponent({
      setup() {
        return () =>
          h(SchemaForm, {
            schema: {
              fields: [{ name: 'name', label: 'Name', defaultValue: 'Ada' }]
            },
            undoable: true,
            showActions: false,
            ref: (el: unknown) => {
              formRef = el as FormHandle
            }
          })
      }
    })
    render(Demo)
    expect(formRef!.canUndo).toBe(false)
    await fireEvent.update(screen.getByLabelText(/Name/), 'Grace')
    expect(formRef!.canUndo).toBe(true)
    formRef!.undo()
    expect(formRef!.canUndo).toBe(false)
    expect(formRef!.canRedo).toBe(true)
  })

  it('emits validate from the inner Form', async () => {
    const onValidate = vi.fn()
    let formRef: FormHandle | null = null
    const Demo = defineComponent({
      setup() {
        return () =>
          h(SchemaForm, {
            schema: basicSchema,
            showActions: false,
            onValidate,
            ref: (el: unknown) => {
              formRef = el as FormHandle
            }
          })
      }
    })
    render(Demo)
    await formRef!.validateField('name')
    expect(onValidate).toHaveBeenCalledWith('name', false, expect.any(String))
  })

  it('renders nested groups and dotted paths', async () => {
    const onUpdate = vi.fn()
    render(SchemaForm, {
      props: {
        schema: groupSchema,
        'onUpdate:modelValue': onUpdate
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

  it('renders date widgets from the schema union', () => {
    render(SchemaForm, {
      props: {
        schema: {
          fields: [{ name: 'due', label: 'Due', type: 'date', placeholder: 'Pick a day' }]
        },
        showActions: false
      }
    })
    expect(screen.getByPlaceholderText('Pick a day')).toBeInTheDocument()
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(SchemaForm, { props: { schema: basicSchema } })
    await expectNoA11yViolations(container)
  })
})
