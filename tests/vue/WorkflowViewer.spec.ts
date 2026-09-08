/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
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
    children: [
      { key: 'a', title: 'Lin', status: 'approved' },
      { key: 'b', title: 'Chen', status: 'approved' }
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

    expect(screen.getByText('Director').closest('[aria-current="step"]')).toBeTruthy()
    expect(screen.getByText('Rollback point')).toBeInTheDocument()
    expect(screen.getByText('Need receipts')).toBeInTheDocument()
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
    expect(screen.getByText('驳回回退点')).toBeInTheDocument()
    expect(screen.getByLabelText('审批流程')).toBeInTheDocument()
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
      expect(emitted().action).toBeFalsy()

      await user.click(screen.getByRole('button', { name: 'OK' }))
      await waitFor(() => expect(emitted().action?.[0]?.[0]).toMatchObject({ action: 'reject' }))
    })

    it('emits comment immediately because comment is not in the recipe', async () => {
      const { emitted } = render(WorkflowActionBar, { props: { items: actions, confirm: true } })
      await fireEvent.click(screen.getByRole('button', { name: 'Comment' }))
      expect(emitted().action?.[0]?.[0]).toMatchObject({ action: 'comment' })
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
