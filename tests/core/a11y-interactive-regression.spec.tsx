/**
 * @vitest-environment happy-dom
 */

import React, { useState } from 'react'
import { act, render as renderReact, screen as reactScreen, waitFor } from '@testing-library/react'
import {
  fireEvent,
  render as renderVue,
  screen as vueScreen,
  waitFor as waitForVue
} from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, reactive } from 'vue'
import {
  Form as ReactForm,
  FormItem as ReactFormItem,
  Modal as ReactModal,
  type FormHandle as ReactFormHandle,
  type FormRules as ReactFormRules
} from '@expcat/tigercat-react'
import { Form as VueForm, FormItem as VueFormItem, Modal as VueModal } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils/a11y-helpers'

describe('interactive a11y regression coverage', () => {
  it('passes axe for an open React modal with focusable content and default footer', async () => {
    renderReact(
      <ReactModal open={true} title="React accessible modal" showDefaultFooter={true}>
        <label htmlFor="react-modal-field">Modal field</label>
        <input id="react-modal-field" />
      </ReactModal>
    )

    await waitFor(() => {
      expect(reactScreen.getByRole('dialog')).toBeInTheDocument()
      expect(reactScreen.getByRole('button', { name: '确定' })).toBeInTheDocument()
    })

    await expectNoA11yViolations(document.body)
  })

  it('passes axe for an open Vue modal with focusable content and default footer', async () => {
    renderVue(VueModal, {
      props: {
        open: true,
        title: 'Vue accessible modal',
        showDefaultFooter: true
      },
      slots: {
        default: '<label for="vue-modal-field">Modal field</label><input id="vue-modal-field" />'
      }
    })

    await waitForVue(() => {
      expect(vueScreen.getByRole('dialog')).toBeInTheDocument()
      expect(vueScreen.getByRole('button', { name: '确定' })).toBeInTheDocument()
    })

    await expectNoA11yViolations(document.body)
  })

  it('passes axe for a React form after validation errors are announced', async () => {
    const formRef = React.createRef<ReactFormHandle>()

    function Demo() {
      const [model] = useState({ email: '' })
      const rules: ReactFormRules = {
        email: [{ required: true, message: 'Email is required' }]
      }

      return (
        <ReactForm ref={formRef} model={model} rules={rules}>
          <ReactFormItem label="Email" name="email">
            <input aria-label="email" />
          </ReactFormItem>
        </ReactForm>
      )
    }

    const { container } = renderReact(<Demo />)

    await act(async () => {
      await formRef.current?.validateField('email')
    })

    await waitFor(() => {
      expect(reactScreen.getByRole('alert')).toHaveTextContent('Email is required')
      expect(reactScreen.getByLabelText('email')).toHaveAttribute('aria-invalid', 'true')
    })

    await expectNoA11yViolations(container)
  })

  it('passes axe for a Vue form after validation errors are announced', async () => {
    const Demo = defineComponent({
      setup() {
        const model = reactive({ email: '' })
        const rules = {
          email: [{ required: true, message: 'Email is required' }]
        }

        return () =>
          h(
            VueForm,
            { model, rules },
            {
              default: () =>
                h(
                  VueFormItem,
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

    const { container } = renderVue(Demo)
    await fireEvent.focusOut(vueScreen.getByLabelText('email'))

    await waitForVue(() => {
      expect(vueScreen.getByRole('alert')).toHaveTextContent('Email is required')
      expect(vueScreen.getByLabelText('email')).toHaveAttribute('aria-invalid', 'true')
    })

    await expectNoA11yViolations(container)
  })
})
