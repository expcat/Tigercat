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
import type {
  WorkflowActionBarItem,
  WorkflowReturnTarget,
  WorkflowTimelineActor,
  WorkflowTimelineStep
} from '@expcat/tigercat-core'
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

  it('keeps a single flatten Timeline while showing tasks, add-sign, and return-to', () => {
    const steps: WorkflowTimelineStep[] = [
      {
        key: 'add',
        title: 'Expert',
        status: 'approved',
        temporary: true,
        origin: { type: 'addsign', position: 'after', fromNodeKey: 'start' }
      },
      {
        key: 'cs',
        title: 'Countersign',
        status: 'active',
        signMode: 'countersign',
        returnTarget: true
      }
    ]
    render(
      <WorkflowTimeline
        steps={steps}
        tasks={[
          {
            id: 't1',
            nodeKey: 'cs',
            assignee: { name: 'Lin' },
            status: 'approved',
            actedAt: '11:00',
            comment: 'task-ok'
          },
          {
            id: 't2',
            nodeKey: 'cs',
            assignee: { name: 'Chen' },
            status: 'pending'
          }
        ]}
      />
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Added approver')).toBeInTheDocument()
    expect(screen.getByText('After')).toBeInTheDocument()
    expect(screen.getByText('Returned here')).toBeInTheDocument()
    expect(screen.getByText('1/2 signed')).toBeInTheDocument()
    expect(screen.getByText('task-ok')).toBeInTheDocument()
    expect(screen.getByText('11:00')).toBeInTheDocument()
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

    it('shows reject confirm description, danger OK, and required comment copy', async () => {
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
      expect(screen.getByPlaceholderText('请输入审批意见')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '确定' }).className).toContain(
        'bg-[var(--tiger-error,#dc2626)]'
      )
    })

    it('passes typed comment on confirm', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<WorkflowActionBar items={actions} confirm onAction={onAction} />)

      await user.click(screen.getByRole('button', { name: 'Reject' }))
      const textarea = await screen.findByPlaceholderText('Comment required')
      await user.type(textarea, 'need receipts')
      await user.click(screen.getByRole('button', { name: 'OK' }))
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'reject' }), {
          comment: 'need receipts'
        })
      )
    })

    it('blocks empty submit when commentRequired and keeps the dialog open', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<WorkflowActionBar items={actions} confirm commentRequired onAction={onAction} />)

      await user.click(screen.getByRole('button', { name: 'Reject' }))
      await waitFor(() => expect(screen.getByText('Reject this request?')).toBeVisible())
      const dialog = screen
        .getByText('Reject this request?')
        .closest('[role="dialog"]') as HTMLElement
      const textarea = within(dialog).getByPlaceholderText('Comment required')
      expect(textarea).toHaveAttribute('aria-required', 'true')
      expect(textarea).not.toHaveAttribute('required')
      await user.click(within(dialog).getByRole('button', { name: 'OK' }))
      await waitFor(() =>
        expect(within(dialog).getByRole('alert')).toHaveTextContent('A comment is required')
      )
      expect(onAction).not.toHaveBeenCalled()
      expect(screen.getByText('Reject this request?')).toBeVisible()
    })

    it('allows empty reject when the item opts out of commentRequired', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      const optionalReject: WorkflowActionBarItem[] = [
        { key: 'reject', label: 'Reject', action: 'reject', commentRequired: false }
      ]
      render(<WorkflowActionBar items={optionalReject} confirm onAction={onAction} />)

      await user.click(screen.getByRole('button', { name: 'Reject' }))
      await user.click(await screen.findByRole('button', { name: 'OK' }))
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'reject' }), {
          comment: ''
        })
      )
    })

    it('folds more actions and collects return / addsign payload', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      const people: WorkflowTimelineActor[] = [
        { id: 'lin', name: 'Lin' },
        { id: 'expert', name: 'Expert' }
      ]
      const full: WorkflowActionBarItem[] = [
        { key: 'approve', label: 'Approve', action: 'approve' },
        { key: 'return', label: 'Return', action: 'return', placement: 'more' },
        { key: 'addsign', label: 'Add approver', action: 'addsign', placement: 'more' }
      ]
      const targets: WorkflowReturnTarget[] = [
        { key: 'start', title: 'Start', actorName: 'Ada' },
        { key: 'manager', title: 'Manager', actorName: 'Lin' }
      ]
      render(
        <WorkflowActionBar
          items={full}
          confirm
          returnTargets={targets}
          addsignPositions={['before', 'after']}
          onAction={onAction}
          renderAssigneePicker={({ value, onChange }) => (
            <div>
              {people.map((person) => (
                <button key={String(person.id)} type="button" onClick={() => onChange(person)}>
                  Pick {person.name}
                </button>
              ))}
              {value ? <span>Selected {value.name}</span> : null}
            </div>
          )}
        />
      )

      expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Return' })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'More' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Return' }))
      await waitFor(() => expect(screen.getByText('Return this request?')).toBeVisible())
      expect(screen.getByRole('radio', { name: /Start/ })).toBeInTheDocument()
      await user.click(screen.getByRole('radio', { name: /Manager/ }))
      await user.type(screen.getByPlaceholderText('Comment required'), 'send back')
      await user.click(screen.getByRole('button', { name: 'OK' }))
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'return' }), {
          comment: 'send back',
          targetNodeKey: 'manager'
        })
      )

      onAction.mockClear()
      await user.click(screen.getByRole('button', { name: 'More' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Add approver' }))
      await waitFor(() => expect(screen.getByText('Add an approver?')).toBeVisible())
      await user.click(screen.getByRole('radio', { name: 'After' }))
      await user.click(screen.getByRole('button', { name: 'Pick Expert' }))
      await user.click(screen.getByRole('button', { name: 'OK' }))
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith(
          expect.objectContaining({ action: 'addsign' }),
          expect.objectContaining({
            position: 'after',
            assignee: expect.objectContaining({ id: 'expert' })
          })
        )
      )
    })

    it('disables return without a picker and addsign without an assignee slot', () => {
      const items: WorkflowActionBarItem[] = [
        { key: 'return', label: 'Return', action: 'return' },
        { key: 'addsign', label: 'Add approver', action: 'addsign' }
      ]
      render(<WorkflowActionBar items={items} confirm />)
      expect(screen.getByRole('button', { name: 'Return' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Add approver' })).toBeDisabled()
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
