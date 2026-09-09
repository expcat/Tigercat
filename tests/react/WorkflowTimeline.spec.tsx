/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
