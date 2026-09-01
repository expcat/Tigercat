/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { FormWizard } from '@expcat/tigercat-react/FormWizard'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'
import { expectNoA11yViolations } from '../utils/react'

const steps = [{ title: 'Step 1' }, { title: 'Step 2' }]

describe('FormWizard (React)', () => {
  it('renders step content and moves to next step', async () => {
    const user = userEvent.setup()

    render(
      <FormWizard steps={steps} renderStep={(_step, index) => <div>Content {index + 1}</div>} />
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Form wizard' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Content 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument()
  })

  it('blocks next step when beforeNext returns false', async () => {
    const user = userEvent.setup()
    const beforeNext = vi.fn().mockReturnValue(false)

    render(
      <FormWizard
        steps={steps}
        beforeNext={beforeNext}
        renderStep={(_step, index) => <div>Content {index + 1}</div>}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(beforeNext).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('shows a string beforeNext result as an alert', async () => {
    const user = userEvent.setup()
    const beforeNext = vi.fn().mockReturnValue('需要先完成校验')

    render(
      <FormWizard
        steps={steps}
        beforeNext={beforeNext}
        renderStep={(_step, index) => <div>Content {index + 1}</div>}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('alert')).toHaveTextContent('需要先完成校验')
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('validates step fields through an ancestor Form', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()

    function Example() {
      const [model, setModel] = useState({ name: '' })
      return (
        <Form
          model={model}
          rules={{ name: [{ required: true, message: 'Name is required' }] }}
          onChange={setModel}>
          <FormWizard
            steps={[{ title: 'Name', fields: ['name'] }, { title: 'Done' }]}
            onFinish={onFinish}
            renderStep={(_step, index) =>
              index === 0 ? (
                <FormItem name="name" label="Name">
                  <Input />
                </FormItem>
              ) : (
                <div>Confirm</div>
              )
            }
          />
        </Form>
      )
    }

    render(<Example />)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('shows Finish when the last step is skipped', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    const stepsWithSkip = [
      { title: 'Step 1' },
      { title: 'Step 2' },
      { title: 'Step 3', skipCondition: () => true }
    ]

    render(
      <FormWizard
        steps={stepsWithSkip}
        onFinish={onFinish}
        renderStep={(_step, index) => <div>Content {index + 1}</div>}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Content 2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('skips steps with skipCondition returning true', async () => {
    const user = userEvent.setup()
    const stepsWithSkip = [
      { title: 'Step 1' },
      { title: 'Step 2', skipCondition: () => true },
      { title: 'Step 3' }
    ]

    render(
      <FormWizard
        steps={stepsWithSkip}
        renderStep={(_step, index) => <div>Content {index + 1}</div>}
      />
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Content 3')).toBeInTheDocument()
  })

  it('does not jump forward by clicking a later step title', async () => {
    const user = userEvent.setup()
    const stepsWithSkip = [
      { title: 'Step 1' },
      { title: 'Step 2', skipCondition: () => true },
      { title: 'Step 3' }
    ]

    render(
      <FormWizard
        steps={stepsWithSkip}
        clickable
        renderStep={(_step, index) => <div>Content {index + 1}</div>}
      />
    )

    await user.click(screen.getByText('Step 3'))
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('allows clicking back to an earlier unskipped step', async () => {
    const user = userEvent.setup()
    const stepsWithSkip = [
      { title: 'Step 1' },
      { title: 'Step 2', skipCondition: () => true },
      { title: 'Step 3' }
    ]

    render(
      <FormWizard
        steps={stepsWithSkip}
        clickable
        defaultCurrent={2}
        renderStep={(_step, index) => <div>Content {index + 1}</div>}
      />
    )

    expect(screen.getByText('Content 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Step 1/ }))
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('calls autoSave on step change and finish', async () => {
    const user = userEvent.setup()
    const autoSave = vi.fn()
    const onFinish = vi.fn()

    render(
      <FormWizard
        steps={steps}
        autoSave={autoSave}
        onFinish={onFinish}
        renderStep={(_step, index) => <div>Content {index + 1}</div>}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(autoSave).toHaveBeenCalledWith(1, steps[1])
    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(autoSave).toHaveBeenCalledTimes(2)
  })

  it('only fires Finish once while beforeNext is in flight', async () => {
    const user = userEvent.setup()
    let release!: () => void
    const beforeNext = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          release = () => resolve(true)
        })
    )
    const onFinish = vi.fn()

    render(
      <FormWizard
        steps={[{ title: 'Only' }]}
        beforeNext={beforeNext}
        onFinish={onFinish}
        renderStep={() => <div>Only</div>}
      />
    )

    const finish = screen.getByRole('button', { name: 'Finish' })
    await user.click(finish)
    await user.click(finish)
    release()
    await vi.waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1))
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <FormWizard
          steps={[{ title: 'One' }, { title: 'Two' }, { title: 'Three' }]}
          clickable
          beforeNext={() => '需要先完成校验'}
          renderStep={(_step, index) => <div>Content {index + 1}</div>}
        />
      )
      await userEvent.click(screen.getByRole('button', { name: 'Next' }))
      await expectNoA11yViolations(container)
    })
  })
})
