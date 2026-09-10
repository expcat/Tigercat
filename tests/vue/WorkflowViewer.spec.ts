/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { WorkflowViewer } from '@expcat/tigercat-vue/WorkflowViewer'
import { WorkflowActionBar } from '@expcat/tigercat-vue/WorkflowTimeline'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { WorkflowActionBarItem, WorkflowTimelineStep } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils'

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

describe('WorkflowViewer (Vue)', () => {
  it('renders start, approval, CC, condition stub, and sign mode', () => {
    render(WorkflowViewer, { props: { steps: treeSteps } })

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
    render(WorkflowViewer, { props: { steps: treeSteps } })

    const active = screen.getByText('Director').closest('[aria-current="step"]')
    expect(active).toBeTruthy()
    expect(within(active as HTMLElement).getByText('Active')).toBeInTheDocument()
    expect(screen.getAllByText('Rollback point').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Need receipts')).toBeInTheDocument()
  })

  it('lists countersign actors in the card with progress instead of sibling branches', () => {
    render(WorkflowViewer, { props: { steps: treeSteps } })

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
    render(WorkflowViewer, { props: { steps: treeSteps } })

    const legend = screen.getByRole('group', { name: 'Path legend' })
    expect(legend).toHaveTextContent('Current path')
    expect(legend).toHaveTextContent('Untaken branch')
    expect(legend).toHaveTextContent('Rollback point')
  })

  it('labels a terminal CC step as notified without a sign-mode tag', () => {
    render(WorkflowViewer, { props: { steps: treeSteps } })

    const card = screen.getByText('HR').parentElement?.parentElement
    expect(card).toBeTruthy()
    expect(within(card as HTMLElement).getByText('CC sent')).toBeInTheDocument()
    expect(within(card as HTMLElement).queryByText('Countersign')).not.toBeInTheDocument()
    expect(within(card as HTMLElement).queryByText('Or-sign')).not.toBeInTheDocument()
  })

  it('uses ConfigProvider locale for kind, sign mode, and rollback copy', () => {
    render({
      render: () =>
        h(ConfigProvider, { locale: zhCN }, () => h(WorkflowViewer, { steps: treeSteps }))
    })

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
    render(WorkflowViewer, { props: { steps: treeSteps, showRollbackPoint: false } })
    expect(screen.queryByText('Rollback point')).not.toBeInTheDocument()
    expect(screen.getByText('Prior reject')).toBeInTheDocument()
  })

  describe('WorkflowActionBar confirm recipe', () => {
    it('opens a confirm dialog before emitting reject', async () => {
      const user = userEvent.setup()
      const { emitted } = render(WorkflowActionBar, { props: { items: actions, confirm: true } })

      await user.click(screen.getByRole('button', { name: 'Reject' }))
      await waitFor(() => expect(screen.getByText('Reject this request?')).toBeVisible())
      expect(screen.getByText('The requester will be notified.')).toBeVisible()
      expect(screen.getByPlaceholderText('Comment required')).toBeInTheDocument()
      expect(emitted().action).toBeFalsy()

      await user.type(screen.getByPlaceholderText('Comment required'), 'need receipts')
      await user.click(screen.getByRole('button', { name: 'OK' }))
      await waitFor(() => expect(emitted().action?.[0]?.[0]).toMatchObject({ action: 'reject' }))
      expect(emitted().action?.[0]?.[1]).toEqual({ comment: 'need receipts' })
    })

    it('emits comment immediately because comment is not in the recipe', async () => {
      const { emitted } = render(WorkflowActionBar, { props: { items: actions, confirm: true } })
      await fireEvent.click(screen.getByRole('button', { name: 'Comment' }))
      expect(emitted().action?.[0]?.[0]).toMatchObject({ action: 'comment' })
      expect(emitted().action?.[0]?.[1]).toBeUndefined()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(WorkflowViewer, { props: { steps: treeSteps } })
      expect(screen.getByRole('region', { name: 'Workflow' })).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(WorkflowViewer)
      expect(container.firstChild).toBeTruthy()
      expect(screen.getByLabelText('Workflow')).toBeInTheDocument()
    })
  })
})
