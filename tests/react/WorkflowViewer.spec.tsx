/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { WorkflowViewer } from '@expcat/tigercat-react/WorkflowViewer'
import { WorkflowActionBar } from '@expcat/tigercat-react/WorkflowTimeline'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { WorkflowActionBarItem, WorkflowTimelineStep } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils/react'

const treeSteps: WorkflowTimelineStep[] = [
  {
    key: 'start',
    kind: 'start',
    title: 'Submit',
    status: 'approved',
    actor: { name: 'Ada' }
  },
  {
    key: 'manager',
    title: 'Manager',
    status: 'approved',
    signMode: 'countersign',
    actors: [
      { name: 'Lin', status: 'approved' },
      { name: 'Chen', status: 'pending' }
    ]
  },
  {
    key: 'cc',
    kind: 'cc',
    title: 'HR',
    status: 'canceled'
  },
  {
    key: 'cond',
    kind: 'condition',
    title: 'Amount',
    status: 'approved',
    children: [
      { key: 'yes', title: '<= 5000', status: 'approved' },
      { key: 'no', title: '> 5000', status: 'pending' }
    ]
  },
  {
    key: 'reject-hist',
    title: 'Prior reject',
    status: 'rejected',
    rollbackPoint: true,
    comment: 'Need receipts'
  },
  {
    key: 'director',
    title: 'Director',
    status: 'active',
    actor: { name: 'Wu' }
  },
  {
    key: 'finance',
    title: 'Finance',
    status: 'pending'
  }
]

const actions: WorkflowActionBarItem[] = [
  { key: 'approve', label: 'Approve', action: 'approve' },
  { key: 'reject', label: 'Reject', action: 'reject', variant: 'danger' },
  { key: 'comment', label: 'Comment', action: 'comment' }
]

describe('WorkflowViewer (React)', () => {
  it('renders start, approval, CC, condition stub, and sign mode', () => {
    render(<WorkflowViewer steps={treeSteps} />)

    expect(screen.getByText('Submit')).toBeInTheDocument()
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('CC')).toBeInTheDocument()
    expect(screen.getByText('Condition')).toBeInTheDocument()
    expect(screen.getByText('Countersign')).toBeInTheDocument()
    expect(screen.getByText('<= 5000')).toBeInTheDocument()
    expect(screen.getByText('> 5000')).toBeInTheDocument()
    expect(screen.getByLabelText('Workflow')).toBeInTheDocument()
  })

  it('marks the active step and shows the rollback point', () => {
    render(<WorkflowViewer steps={treeSteps} />)

    const active = screen.getByText('Director').closest('[aria-current="step"]')
    expect(active).toBeTruthy()
    expect(within(active as HTMLElement).getByText('Active')).toBeInTheDocument()
    expect(screen.getAllByText('Rollback point').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Need receipts')).toBeInTheDocument()
  })

  it('lists countersign actors in the card with progress instead of sibling branches', () => {
    render(<WorkflowViewer steps={treeSteps} />)

    const card = screen.getByText('Manager').parentElement?.parentElement
    expect(card).toBeTruthy()
    expect(within(card as HTMLElement).getByText('Lin')).toBeInTheDocument()
    expect(within(card as HTMLElement).getByText('Chen')).toBeInTheDocument()
    expect(within(card as HTMLElement).getByText('1/2 signed')).toBeInTheDocument()
    expect(screen.getByText('Lin').closest('[aria-current]')).toBeNull()
    expect(screen.getByText('<= 5000')).toBeInTheDocument()
    expect(screen.getByText('> 5000')).toBeInTheDocument()
  })

  it('renders a path legend for current, off-path, and rollback', () => {
    render(<WorkflowViewer steps={treeSteps} />)

    const legend = screen.getByRole('group', { name: 'Path legend' })
    expect(legend).toHaveTextContent('Current path')
    expect(legend).toHaveTextContent('Untaken branch')
    expect(legend).toHaveTextContent('Rollback point')
  })

  it('labels a terminal CC step as notified without a sign-mode tag', () => {
    render(<WorkflowViewer steps={treeSteps} />)

    const card = screen.getByText('HR').parentElement?.parentElement
    expect(card).toBeTruthy()
    expect(within(card as HTMLElement).getByText('CC sent')).toBeInTheDocument()
    expect(within(card as HTMLElement).queryByText('Countersign')).not.toBeInTheDocument()
    expect(within(card as HTMLElement).queryByText('Or-sign')).not.toBeInTheDocument()
  })

  it('uses ConfigProvider locale for kind, sign mode, and rollback copy', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <WorkflowViewer steps={treeSteps} />
      </ConfigProvider>
    )

    expect(screen.getByText('发起')).toBeInTheDocument()
    expect(screen.getByText('抄送')).toBeInTheDocument()
    expect(screen.getByText('条件')).toBeInTheDocument()
    expect(screen.getByText('会签')).toBeInTheDocument()
    expect(screen.getAllByText('驳回回退点').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByLabelText('审批流程')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: '路径图例' })).toHaveTextContent('当前路径')
    expect(screen.getByRole('group', { name: '路径图例' })).toHaveTextContent('未走分支')
    expect(screen.getByText('已抄送')).toBeInTheDocument()
  })

  it('hides the rollback label when showRollbackPoint is false', () => {
    render(<WorkflowViewer steps={treeSteps} showRollbackPoint={false} />)
    expect(screen.queryByText('Rollback point')).not.toBeInTheDocument()
    expect(screen.getByText('Prior reject')).toBeInTheDocument()
  })

  it('renders per-actor task rows, add-sign tags, return-to, and off-path branch labels', () => {
    const steps: WorkflowTimelineStep[] = [
      { key: 'start', kind: 'start', title: 'Submit', status: 'approved' },
      {
        key: 'add',
        title: 'Expert',
        status: 'approved',
        temporary: true,
        origin: { type: 'addsign', position: 'before', fromNodeKey: 'cs' }
      },
      {
        key: 'cond',
        kind: 'condition',
        title: 'Amount',
        status: 'approved',
        children: [
          { key: 'low', title: 'Low', status: 'approved' },
          { key: 'high', title: 'High', status: 'pending' }
        ]
      },
      {
        key: 'cs',
        title: 'Finance',
        status: 'active',
        signMode: 'countersign',
        returnTarget: true
      }
    ]
    const tasks = [
      {
        id: 't1',
        nodeKey: 'cs',
        assignee: { id: 'a', name: 'Lin' },
        status: 'approved' as const,
        actedAt: '10:00',
        comment: 'ok-lin'
      },
      {
        id: 't2',
        nodeKey: 'cs',
        assignee: { id: 'b', name: 'Chen' },
        status: 'pending' as const
      },
      {
        id: 't3',
        nodeKey: 'cs',
        assignee: { id: 'c', name: 'Wu' },
        status: 'pending' as const
      }
    ]
    render(<WorkflowViewer steps={steps} tasks={tasks} />)

    const finance = screen.getByText('Finance').closest('[data-workflow-return-target="true"]')
    expect(finance).toBeTruthy()
    expect(within(finance as HTMLElement).getByText('Lin')).toBeInTheDocument()
    expect(within(finance as HTMLElement).getByText('10:00')).toBeInTheDocument()
    expect(within(finance as HTMLElement).getByText('ok-lin')).toBeInTheDocument()
    expect(within(finance as HTMLElement).getByText('1/3 signed')).toBeInTheDocument()
    expect(screen.getAllByText('Returned here').length).toBeGreaterThanOrEqual(1)

    const expert = screen.getByText('Expert').closest('[data-workflow-addsign="before"]')
    expect(expert).toBeTruthy()
    expect(within(expert as HTMLElement).getByText('Added approver')).toBeInTheDocument()
    expect(within(expert as HTMLElement).getByText('Before')).toBeInTheDocument()

    const high = screen.getByText('High').closest('[data-workflow-path="off"]')
    expect(high).toBeTruthy()
    expect(within(high as HTMLElement).getByText('Untaken branch')).toBeInTheDocument()
    const low = screen.getByText('Low').closest('[data-workflow-path="on"]')
    expect(low).toBeTruthy()
    expect(within(low as HTMLElement).getByText('Current path')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Path legend' })).toHaveTextContent('Returned here')
  })

  describe('WorkflowActionBar confirm recipe', () => {
    it('opens a confirm dialog before emitting reject', async () => {
      const user = userEvent.setup()
      const onAction = vi.fn()
      render(<WorkflowActionBar items={actions} confirm onAction={onAction} />)

      await user.click(screen.getByRole('button', { name: 'Reject' }))
      await waitFor(() => expect(screen.getByText('Reject this request?')).toBeVisible())
      expect(screen.getByText('The requester will be notified.')).toBeVisible()
      expect(screen.getByPlaceholderText('Comment required')).toBeInTheDocument()
      expect(onAction).not.toHaveBeenCalled()

      const textarea = screen.getByPlaceholderText('Comment required')
      await user.type(textarea, 'need receipts')
      await user.click(screen.getByRole('button', { name: 'OK' }))
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'reject' }), {
          comment: 'need receipts'
        })
      )
    })

    it('emits comment immediately because comment is not in the recipe', () => {
      const onAction = vi.fn()
      render(<WorkflowActionBar items={actions} confirm onAction={onAction} />)
      fireEvent.click(screen.getByRole('button', { name: 'Comment' }))
      expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'comment' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<WorkflowViewer steps={treeSteps} />)
      expect(screen.getByRole('region', { name: 'Workflow' })).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<WorkflowViewer />)
      expect(container.firstChild).toBeTruthy()
      expect(screen.getByLabelText('Workflow')).toBeInTheDocument()
    })
  })
})
