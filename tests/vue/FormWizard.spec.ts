/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { FormWizard } from '@expcat/tigercat-vue/FormWizard'
import type { WizardStep } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

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

  // ==================== v0.6.0 Features ====================
  describe('v0.6.0 Features', () => {
    it('skips steps with skipCondition returning true', async () => {
      const stepsWithSkip: WizardStep[] = [
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
      // Step 2 should be skipped, we should be on Step 3
      expect(screen.getByText('Content 3')).toBeInTheDocument()
    })

    it('clicking a skipped step title walks forward to the next unskipped step', async () => {
      const stepsWithSkip: WizardStep[] = [
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

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      await fireEvent.click(screen.getByRole('button', { name: 'Step 2' }))
      expect(screen.getByText('Content 3')).toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    })

    it('clicking a skipped step title walks backward to the previous unskipped step', async () => {
      const stepsWithSkip: WizardStep[] = [
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
      await fireEvent.click(screen.getByRole('button', { name: 'Step 2' }))
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    })

    it('clicking a later non-skipped step lands there even if a middle step is skipped', async () => {
      const stepsWithSkip: WizardStep[] = [
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

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      await fireEvent.click(screen.getByRole('button', { name: 'Step 3' }))
      expect(screen.getByText('Content 3')).toBeInTheDocument()
    })

    it('stays on the current step when clicking a skipped last step with nothing after', async () => {
      const stepsWithSkipLast: WizardStep[] = [
        { title: 'Step 1' },
        { title: 'Step 2' },
        { title: 'Step 3', skipCondition: () => true }
      ]

      render(FormWizard, {
        props: { steps: stepsWithSkipLast, clickable: true },
        slots: {
          step: ({ index }: { index: number }) => h('div', `Content ${index + 1}`)
        }
      })

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      await fireEvent.click(screen.getByRole('button', { name: 'Step 3' }))
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
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
      expect(autoSave).toHaveBeenCalledWith(1, steps[1])
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(FormWizard)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
