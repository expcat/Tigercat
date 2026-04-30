/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { Tour } from '@expcat/tigercat-vue'
import type { TourStep } from '@expcat/tigercat-core'

const baseSteps: TourStep[] = [
  { title: 'Step 1', description: 'First step description' },
  { title: 'Step 2', description: 'Second step description' },
  { title: 'Step 3', description: 'Last step description' }
]

describe('Tour', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should not render when open is false', () => {
    render(Tour, { props: { steps: baseSteps, open: false } })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render the first step when open is true', async () => {
    render(Tour, { props: { steps: baseSteps, open: true } })
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('First step description')).toBeInTheDocument()
    })
  })

  it('should show indicator with current/total when showIndicators is true', async () => {
    render(Tour, { props: { steps: baseSteps, open: true } })
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })
  })

  it('should hide indicator when showIndicators is false', async () => {
    render(Tour, { props: { steps: baseSteps, open: true, showIndicators: false } })
    await waitFor(() => {
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument()
    })
  })

  it('should advance to next step on Next click and emit change events', async () => {
    const onChange = vi.fn()
    const onUpdateCurrent = vi.fn()
    render(Tour, {
      props: {
        steps: baseSteps,
        open: true,
        onChange,
        'onUpdate:current': onUpdateCurrent
      }
    })

    await waitFor(() => expect(screen.getByText('Next')).toBeInTheDocument())
    await fireEvent.click(screen.getByText('Next'))

    expect(onUpdateCurrent).toHaveBeenCalledWith(1)
    expect(onChange).toHaveBeenCalledWith(1)
    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })
  })

  it('should not show Previous button on the first step', async () => {
    render(Tour, { props: { steps: baseSteps, open: true } })
    await waitFor(() => {
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    })
  })

  it('should go back to previous step on Previous click', async () => {
    render(Tour, { props: { steps: baseSteps, open: true } })

    await waitFor(() => expect(screen.getByText('Next')).toBeInTheDocument())
    await fireEvent.click(screen.getByText('Next'))
    await waitFor(() => expect(screen.getByText('Previous')).toBeInTheDocument())
    await fireEvent.click(screen.getByText('Previous'))

    await waitFor(() => {
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })
  })

  it('should show Finish on the last step and emit finish + update:open(false)', async () => {
    const onFinish = vi.fn()
    const onUpdateOpen = vi.fn()
    render(Tour, {
      props: {
        steps: baseSteps,
        open: true,
        current: 2,
        onFinish,
        'onUpdate:open': onUpdateOpen
      }
    })

    await waitFor(() => expect(screen.getByText('Finish')).toBeInTheDocument())
    await fireEvent.click(screen.getByText('Finish'))

    expect(onFinish).toHaveBeenCalled()
    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('should respect controlled current prop', async () => {
    render(Tour, { props: { steps: baseSteps, open: true, current: 1 } })
    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })
  })

  it('should render close button by default and emit close + update:open(false)', async () => {
    const onClose = vi.fn()
    const onUpdateOpen = vi.fn()
    render(Tour, {
      props: {
        steps: baseSteps,
        open: true,
        onClose,
        'onUpdate:open': onUpdateOpen
      }
    })

    await waitFor(() => expect(screen.getByLabelText('Close tour')).toBeInTheDocument())
    await fireEvent.click(screen.getByLabelText('Close tour'))

    expect(onClose).toHaveBeenCalled()
    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('should hide close button when closable is false', async () => {
    render(Tour, { props: { steps: baseSteps, open: true, closable: false } })
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(screen.queryByLabelText('Close tour')).not.toBeInTheDocument()
  })

  it('should support custom button labels', async () => {
    render(Tour, {
      props: {
        steps: baseSteps,
        open: true,
        current: 1,
        nextText: '下一步',
        prevText: '上一步',
        finishText: '完成'
      }
    })

    await waitFor(() => {
      expect(screen.getByText('下一步')).toBeInTheDocument()
      expect(screen.getByText('上一步')).toBeInTheDocument()
    })
  })

  it('should close when clicking the full-screen mask (no target)', async () => {
    const onClose = vi.fn()
    const onUpdateOpen = vi.fn()
    render(Tour, {
      props: {
        steps: [{ title: 'Solo', description: 'no target' }],
        open: true,
        onClose,
        'onUpdate:open': onUpdateOpen
      }
    })

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    const mask = document.querySelector('div.fixed.inset-0.bg-black\\/45')
    expect(mask).toBeInTheDocument()
    await fireEvent.click(mask!)

    expect(onClose).toHaveBeenCalled()
    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('should not render mask when step.mask is false', async () => {
    render(Tour, {
      props: {
        steps: [{ title: 'No mask', description: '...', mask: false }],
        open: true
      }
    })
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(document.querySelector('div.fixed.inset-0.bg-black\\/45')).not.toBeInTheDocument()
  })

  it('should render spotlight overlay when target rect is found', async () => {
    const target = document.createElement('div')
    target.id = 'tour-target'
    target.getBoundingClientRect = () =>
      ({ top: 100, left: 200, width: 50, height: 30, right: 250, bottom: 130, x: 200, y: 100, toJSON: () => ({}) }) as DOMRect
    document.body.appendChild(target)

    render(Tour, {
      props: {
        steps: [{ title: 'With target', description: '...', target: '#tour-target' }],
        open: true
      }
    })

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    // Spotlight overlay uses inline style with box-shadow; presence indicates target rect resolved.
    const overlay = document.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('should apply custom className to the popover', async () => {
    render(Tour, {
      props: { steps: baseSteps, open: true, className: 'my-custom-tour' }
    })
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveClass('my-custom-tour')
    })
  })

  it('should render dialog with role and aria-modal attributes', async () => {
    render(Tour, { props: { steps: baseSteps, open: true } })
    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })
  })

  it('should render nothing if step does not exist (out-of-range current)', () => {
    render(Tour, { props: { steps: baseSteps, open: true, current: 99 } })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
