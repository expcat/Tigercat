/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { WorkflowActionBar, WorkflowTimeline } from '@expcat/tigercat-react/WorkflowTimeline'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { WorkflowActionBarItem, WorkflowTimelineStep } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils/react'

const mixedSteps: WorkflowTimelineStep[] = [
  {
    key: 'submit',
    title: 'Submit',
    status: 'approved',
    actor: { name: 'Ada' },
    comment: 'Please review',
    time: '09:00'
  },
  {
    key: 'manager',
    title: 'Manager',
    status: 'active',
    actor: { name: 'Lin' },
    time: 'Now'
  },
  {
    key: 'finance',
    title: 'Finance',
    status: 'pending'
  },
  {
    key: 'reject-hist',
    title: 'Prior reject',
    status: 'rejected',
    comment: 'Need receipts'
  },
  {
    key: 'cancel-hist',
    title: 'CC',
    status: 'canceled'
  }
]

const actions: WorkflowActionBarItem[] = [
  { key: 'approve', label: 'Approve', action: 'approve' },
  { key: 'reject', label: 'Reject', action: 'reject', variant: 'danger' },
  { key: 'cancel', label: 'Cancel', action: 'cancel', disabled: true }
]

describe('WorkflowTimeline (React)', () => {
  it('renders step title, status, actor, comment, and time', () => {
    render(<WorkflowTimeline steps={mixedSteps} />)

    expect(screen.getByText('Submit')).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Please review')).toBeInTheDocument()
    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('Canceled')).toBeInTheDocument()
    expect(screen.getByLabelText('Workflow timeline')).toBeInTheDocument()
  })

  it('uses ConfigProvider locale for status tags', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <WorkflowTimeline steps={mixedSteps} />
      </ConfigProvider>
    )

    expect(screen.getByText('已通过')).toBeInTheDocument()
    expect(screen.getByText('进行中')).toBeInTheDocument()
    expect(screen.getByText('待处理')).toBeInTheDocument()
    expect(screen.getByText('已驳回')).toBeInTheDocument()
    expect(screen.getByText('已撤销')).toBeInTheDocument()
    expect(screen.getByLabelText('审批进度')).toBeInTheDocument()
  })

  it('lets labels override locale status tags', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <WorkflowTimeline steps={mixedSteps} labels={{ approved: '通过了' }} />
      </ConfigProvider>
    )

    expect(screen.getByText('通过了')).toBeInTheDocument()
    expect(screen.getByText('进行中')).toBeInTheDocument()
  })

  it('shows the action bar when the current step is active', () => {
    render(<WorkflowTimeline steps={mixedSteps} actions={actions} />)

    expect(screen.getByRole('toolbar', { name: 'Workflow actions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('hides the action bar when no step is active', () => {
    const pendingOnly: WorkflowTimelineStep[] = [
      { key: 'wait', title: 'Waiting', status: 'pending' }
    ]
    render(<WorkflowTimeline steps={pendingOnly} actions={actions} />)

    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
    expect(screen.getByText('Waiting')).toBeInTheDocument()
  })

  it('emits action when an enabled action is clicked', () => {
    const onAction = vi.fn()
    render(<WorkflowTimeline steps={mixedSteps} actions={actions} onAction={onAction} />)

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'approve', action: 'approve' })
    )
  })

  it('does not emit action from a disabled button', () => {
    const onAction = vi.fn()
    render(<WorkflowTimeline steps={mixedSteps} actions={actions} onAction={onAction} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onAction).not.toHaveBeenCalled()
  })

  it('lists countersign actors inline without extra timeline points', () => {
    const countersign: WorkflowTimelineStep[] = [
      {
        key: 'manager',
        title: 'Manager',
        status: 'active',
        signMode: 'countersign',
        actors: [
          { name: 'Lin', status: 'approved' },
          { name: 'Chen', status: 'pending' }
        ]
      }
    ]
    render(<WorkflowTimeline steps={countersign} />)

    expect(screen.getByText('Lin')).toBeInTheDocument()
    expect(screen.getByText('Chen')).toBeInTheDocument()
    expect(screen.getByText('1/2 signed')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('uses CC sent for a terminal carbon-copy step', () => {
    render(
      <WorkflowTimeline steps={[{ key: 'hr', kind: 'cc', title: 'HR', status: 'canceled' }]} />
    )

    expect(screen.getByText('CC sent')).toBeInTheDocument()
    expect(screen.queryByText('Canceled')).not.toBeInTheDocument()
  })

  describe('WorkflowActionBar', () => {
    it('renders labelled buttons and emits the clicked item', () => {
      const onAction = vi.fn()
      render(<WorkflowActionBar items={actions} onAction={onAction} />)

      expect(screen.getByRole('toolbar', { name: 'Workflow actions' })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
      expect(onAction).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'reject', action: 'reject' })
      )
    })

    it('sorts items approve → reject → transfer → cancel → comment and keeps variants', () => {
      const shuffled: WorkflowActionBarItem[] = [
        { key: 'comment', label: 'Comment', action: 'comment' },
        { key: 'cancel', label: 'Cancel', action: 'cancel' },
        { key: 'transfer', label: 'Transfer', action: 'transfer' },
        { key: 'reject', label: 'Reject', action: 'reject' },
        { key: 'approve', label: 'Approve', action: 'approve' }
      ]
      render(<WorkflowActionBar items={shuffled} />)

      const buttons = within(screen.getByRole('toolbar')).getAllByRole('button')
      expect(buttons.map((button) => button.textContent)).toEqual([
        'Approve',
        'Reject',
        'Transfer',
        'Cancel',
        'Comment'
      ])
      expect(screen.getByRole('button', { name: 'Approve' }).className).not.toContain(
        'text-[var(--tiger-error,#dc2626)]'
      )
      expect(screen.getByRole('button', { name: 'Reject' }).className).toContain(
        'text-[var(--tiger-error,#dc2626)]'
      )
    })

    it('shows reject confirm description, danger OK, and submits an empty comment', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(
        <ConfigProvider locale={zhCN}>
          <WorkflowActionBar items={actions} confirm onAction={onAction} />
        </ConfigProvider>
      )

      await user.click(screen.getByRole('button', { name: 'Reject' }))
      await waitFor(() => expect(screen.getByText('确认拒绝该申请？')).toBeVisible())
      expect(screen.getByText('意见将通知发起人。')).toBeVisible()
      expect(screen.queryByText(/该步骤/)).not.toBeInTheDocument()
      expect(screen.getByPlaceholderText('请输入审批意见（选填）')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '确定' }).className).toContain(
        'bg-[var(--tiger-error,#dc2626)]'
      )

      await user.click(screen.getByRole('button', { name: '确定' }))
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'reject' }), {
          comment: ''
        })
      )
    })

    it('passes typed comment on confirm', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<WorkflowActionBar items={actions} confirm onAction={onAction} />)

      await user.click(screen.getByRole('button', { name: 'Reject' }))
      const textarea = await screen.findByPlaceholderText('Comment (optional)')
      await user.type(textarea, 'need receipts')
      await user.click(screen.getByRole('button', { name: 'OK' }))
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'reject' }), {
          comment: 'need receipts'
        })
      )
    })

    it('does not block empty submit when commentRequired', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<WorkflowActionBar items={actions} confirm commentRequired onAction={onAction} />)

      await user.click(screen.getByRole('button', { name: 'Reject' }))
      const textarea = await screen.findByPlaceholderText('Comment required')
      expect(textarea).toHaveAttribute('aria-required', 'true')
      expect(textarea).not.toHaveAttribute('required')
      await user.click(screen.getByRole('button', { name: 'OK' }))
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'reject' }), {
          comment: ''
        })
      )
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<WorkflowTimeline steps={mixedSteps} actions={actions} />)
      expect(screen.getByRole('list', { name: 'Workflow timeline' })).toBeInTheDocument()
      expect(screen.getByRole('toolbar', { name: 'Workflow actions' })).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<WorkflowTimeline />)
      expect(container.firstChild).toBeTruthy()
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
    })
  })
})
