/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { FormWizard } from '@expcat/tigercat-react'

const steps = [{ title: 'Step 1' }, { title: 'Step 2' }]

describe('FormWizard (React)', () => {
  it('renders step content and moves to next step', async () => {
    const user = userEvent.setup()

    render(
      <FormWizard steps={steps} renderStep={(_step, index) => <div>Content {index + 1}</div>} />
    )

    expect(screen.getByText('Content 1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Content 2')).toBeInTheDocument()
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

  it('shows error message when beforeNext returns string', async () => {
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

    expect(beforeNext).toHaveBeenCalledTimes(1)
    expect(screen.getByText('需要先完成校验')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })
})
