/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Tour } from '@expcat/tigercat-react'
import type { TourStep } from '@expcat/tigercat-core'

const baseSteps: TourStep[] = [
  { title: 'Step 1', description: 'First step description' },
  { title: 'Step 2', description: 'Second step description' },
  { title: 'Step 3', description: 'Last step description' }
]

describe('Tour', () => {
  it('should not render when open is false', () => {
    render(<Tour steps={baseSteps} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render the first step when open is true', async () => {
    render(<Tour steps={baseSteps} open={true} />)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('First step description')).toBeInTheDocument()
    })
  })

  it('should show indicator with current/total when showIndicators is true', async () => {
    render(<Tour steps={baseSteps} open={true} />)
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })
  })

  it('should hide indicator when showIndicators is false', async () => {
    render(<Tour steps={baseSteps} open={true} showIndicators={false} />)
    await waitFor(() => {
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument()
    })
  })

  it('should advance to next step on Next click and emit onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Tour steps={baseSteps} open={true} onChange={onChange} />)

    await waitFor(() => expect(screen.getByText('Next')).toBeInTheDocument())
    await user.click(screen.getByText('Next'))

    expect(onChange).toHaveBeenCalledWith(1)
    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })
  })

  it('should not show Previous button on the first step', async () => {
    render(<Tour steps={baseSteps} open={true} />)
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
  })

  it('should go back to previous step on Previous click', async () => {
    const user = userEvent.setup()
    render(<Tour steps={baseSteps} open={true} />)

    await waitFor(() => expect(screen.getByText('Next')).toBeInTheDocument())
    await user.click(screen.getByText('Next'))
    await waitFor(() => expect(screen.getByText('Previous')).toBeInTheDocument())
    await user.click(screen.getByText('Previous'))

    await waitFor(() => {
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })
  })

  it('should show Finish on the last step and emit onFinish + onClose', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    const onClose = vi.fn()
    render(
      <Tour
        steps={baseSteps}
        open={true}
        current={2}
        onFinish={onFinish}
        onClose={onClose}
      />
    )

    await waitFor(() => expect(screen.getByText('Finish')).toBeInTheDocument())
    await user.click(screen.getByText('Finish'))

    expect(onFinish).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('should respect controlled current prop', async () => {
    render(<Tour steps={baseSteps} open={true} current={1} />)
    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })
  })

  it('should render close button by default and emit onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Tour steps={baseSteps} open={true} onClose={onClose} />)

    await waitFor(() => expect(screen.getByLabelText('Close tour')).toBeInTheDocument())
    await user.click(screen.getByLabelText('Close tour'))

    expect(onClose).toHaveBeenCalled()
  })

  it('should hide close button when closable is false', async () => {
    render(<Tour steps={baseSteps} open={true} closable={false} />)
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.queryByLabelText('Close tour')).not.toBeInTheDocument()
  })

  it('should support custom button labels', async () => {
    render(
      <Tour
        steps={baseSteps}
        open={true}
        current={1}
        nextText="下一步"
        prevText="上一步"
        finishText="完成"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('下一步')).toBeInTheDocument()
      expect(screen.getByText('上一步')).toBeInTheDocument()
    })
  })

  it('should close when clicking the full-screen mask (no target)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Tour
        steps={[{ title: 'Solo', description: 'no target' }]}
        open={true}
        onClose={onClose}
      />
    )

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    const mask = document.querySelector('div.fixed.inset-0.bg-black\\/45')
    expect(mask).toBeInTheDocument()
    await user.click(mask as Element)

    expect(onClose).toHaveBeenCalled()
  })

  it('should not render mask when step.mask is false', async () => {
    render(
      <Tour
        steps={[{ title: 'No mask', description: '...', mask: false }]}
        open={true}
      />
    )
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(document.querySelector('div.fixed.inset-0.bg-black\\/45')).not.toBeInTheDocument()
  })

  it('should render spotlight overlay when target rect is found', async () => {
    const target = document.createElement('div')
    target.id = 'tour-target'
    target.getBoundingClientRect = () =>
      ({
        top: 100,
        left: 200,
        width: 50,
        height: 30,
        right: 250,
        bottom: 130,
        x: 200,
        y: 100,
        toJSON: () => ({})
      }) as DOMRect
    document.body.appendChild(target)

    render(
      <Tour
        steps={[{ title: 'With target', description: '...', target: '#tour-target' }]}
        open={true}
      />
    )

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    const overlay = document.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('should apply custom className to the popover', async () => {
    render(<Tour steps={baseSteps} open={true} className="my-custom-tour" />)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveClass('my-custom-tour')
    })
  })

  it('should render dialog with role and aria-modal attributes', async () => {
    render(<Tour steps={baseSteps} open={true} />)
    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })
  })

  it('should render nothing if step does not exist (out-of-range current)', () => {
    render(<Tour steps={baseSteps} open={true} current={99} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
