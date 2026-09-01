/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { h, ref } from 'vue'
import { FormWizard } from '@expcat/tigercat-vue/FormWizard'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'
import type { WizardStep } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils'

const steps: WizardStep[] = [{ title: 'Step 1' }, { title: 'Step 2' }]

describe('FormWizard (Vue)', () => {
  it('renders step content and moves to next step', async () => {
    render(FormWizard, {
      props: { steps },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Form wizard' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' }).querySelector('svg')).toBeTruthy()

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Content 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument()
  })

  it('blocks next step when beforeNext returns false', async () => {
    const beforeNext = vi.fn().mockReturnValue(false)

    render(FormWizard, {
      props: { steps, beforeNext },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(beforeNext).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('shows a string beforeNext result as an alert', async () => {
    const beforeNext = vi.fn().mockReturnValue('需要先完成校验')

    render(FormWizard, {
      props: { steps, beforeNext },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('需要先完成校验')
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('validates step fields through an ancestor Form', async () => {
    const onFinish = vi.fn()
    const model = ref({ name: '' })

    render({
      setup() {
        return () =>
          h(
            Form,
            {
              model: model.value,
              rules: { name: [{ required: true, message: 'Name is required' }] },
              'onUpdate:model': (next: { name: string }) => {
                model.value = next
              }
            },
            {
              default: () =>
                h(
                  FormWizard,
                  {
                    steps: [{ title: 'Name', fields: ['name'] }, { title: 'Done' }],
                    onFinish
                  },
                  {
                    step: ({ index }: { index: number }) =>
                      index === 0
                        ? h(FormItem, { name: 'name', label: 'Name' }, { default: () => h(Input) })
                        : h('div', 'Confirm')
                  }
                )
            }
          )
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('shows Finish when the last step is skipped', async () => {
    const onFinish = vi.fn()
    const stepsWithSkip = [
      { title: 'Step 1' },
      { title: 'Step 2' },
      { title: 'Step 3', skipCondition: () => true }
    ]

    render(FormWizard, {
      props: { steps: stepsWithSkip, onFinish },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Content 2')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Finish' }))
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1))
  })

  it('skips steps with skipCondition returning true', async () => {
    const stepsWithSkip = [
      { title: 'Step 1' },
      { title: 'Step 2', skipCondition: () => true },
      { title: 'Step 3' }
    ]

    render(FormWizard, {
      props: { steps: stepsWithSkip },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Content 3')).toBeInTheDocument()
  })

  it('does not jump forward by clicking a later step title', async () => {
    const stepsWithSkip = [
      { title: 'Step 1' },
      { title: 'Step 2', skipCondition: () => true },
      { title: 'Step 3' }
    ]

    render(FormWizard, {
      props: { steps: stepsWithSkip, clickable: true },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    await fireEvent.click(screen.getByText('Step 3'))
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('allows clicking back to an earlier unskipped step', async () => {
    const stepsWithSkip = [
      { title: 'Step 1' },
      { title: 'Step 2', skipCondition: () => true },
      { title: 'Step 3' }
    ]

    render(FormWizard, {
      props: { steps: stepsWithSkip, clickable: true, defaultCurrent: 2 },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    expect(screen.getByText('Content 3')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: /Step 1/ }))
    expect(await screen.findByText('Content 1')).toBeInTheDocument()
  })

  it('calls autoSave on step change', async () => {
    const autoSave = vi.fn()

    render(FormWizard, {
      props: { steps, autoSave },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(autoSave).toHaveBeenCalledWith(1, steps[1]))
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(FormWizard, {
        props: {
          steps: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }],
          clickable: true,
          beforeNext: () => '需要先完成校验'
        },
        slots: {
          step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
        }
      })
      await fireEvent.click(screen.getByRole('button', { name: 'Next' }))
      await expectNoA11yViolations(container)
    })
  })
})
