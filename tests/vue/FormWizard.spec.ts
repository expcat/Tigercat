/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { FormWizard } from '@expcat/tigercat-vue'
import type { WizardStep } from '@expcat/tigercat-core'

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

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('blocks next step when beforeNext returns false', async () => {
    const beforeNext = vi.fn().mockReturnValue(false)

    render(FormWizard, {
      props: {
        steps,
        beforeNext
      },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(beforeNext).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('blocks next step when beforeNext returns string (treated as non-true)', async () => {
    const beforeNext = vi.fn().mockReturnValue('需要先完成校验')

    render(FormWizard, {
      props: {
        steps,
        beforeNext
      },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(beforeNext).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('supports step-scoped validation metadata', async () => {
    const stepsWithFields: WizardStep[] = [
      { title: 'Step 1', fields: ['name'] },
      { title: 'Step 2', fields: ['email'] }
    ]
    const beforeNext = vi.fn().mockImplementation((_current, step) => {
      return !((step.fields as string[]) || []).includes('name')
    })

    render(FormWizard, {
      props: {
        steps: stepsWithFields,
        beforeNext
      },
      slots: {
        step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(beforeNext).toHaveBeenCalledWith(0, stepsWithFields[0], stepsWithFields)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })
})
