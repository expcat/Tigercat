/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { WorkflowActionBar, WorkflowTimeline } from '@expcat/tigercat-vue/WorkflowTimeline'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { WorkflowActionBarItem, WorkflowTimelineStep } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils'

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

describe('WorkflowTimeline (Vue)', () => {
  it('renders step title, status, actor, comment, and time', () => {
    render(WorkflowTimeline, { props: { steps: mixedSteps } })

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
    render({
      render: () =>
        h(ConfigProvider, { locale: zhCN }, () => h(WorkflowTimeline, { steps: mixedSteps }))
    })

    expect(screen.getByText('已通过')).toBeInTheDocument()
    expect(screen.getByText('进行中')).toBeInTheDocument()
    expect(screen.getByText('待处理')).toBeInTheDocument()
    expect(screen.getByText('已驳回')).toBeInTheDocument()
    expect(screen.getByText('已撤销')).toBeInTheDocument()
    expect(screen.getByLabelText('审批进度')).toBeInTheDocument()
  })

  it('lets labels override locale status tags', () => {
    render({
      render: () =>
        h(ConfigProvider, { locale: zhCN }, () =>
          h(WorkflowTimeline, { steps: mixedSteps, labels: { approved: '通过了' } })
        )
    })

    expect(screen.getByText('通过了')).toBeInTheDocument()
    expect(screen.getByText('进行中')).toBeInTheDocument()
  })

  it('shows the action bar when the current step is active', () => {
    render(WorkflowTimeline, { props: { steps: mixedSteps, actions } })

    expect(screen.getByRole('toolbar', { name: 'Workflow actions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('hides the action bar when no step is active', () => {
    const pendingOnly: WorkflowTimelineStep[] = [
      { key: 'wait', title: 'Waiting', status: 'pending' }
    ]
    render(WorkflowTimeline, { props: { steps: pendingOnly, actions } })

    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
    expect(screen.getByText('Waiting')).toBeInTheDocument()
  })

  it('emits action when an enabled action is clicked', async () => {
    const { emitted } = render(WorkflowTimeline, {
      props: { steps: mixedSteps, actions }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    expect(emitted().action?.[0]?.[0]).toMatchObject({ key: 'approve', action: 'approve' })
  })

  it('does not emit action from a disabled button', async () => {
    const { emitted } = render(WorkflowTimeline, {
      props: { steps: mixedSteps, actions }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(emitted().action).toBeFalsy()
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
    render(WorkflowTimeline, { props: { steps: countersign } })

    expect(screen.getByText('Lin')).toBeInTheDocument()
    expect(screen.getByText('Chen')).toBeInTheDocument()
    expect(screen.getByText('1/2 signed')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('uses CC sent for a terminal carbon-copy step', () => {
    render(WorkflowTimeline, {
      props: { steps: [{ key: 'hr', kind: 'cc', title: 'HR', status: 'canceled' }] }
    })

    expect(screen.getByText('CC sent')).toBeInTheDocument()
    expect(screen.queryByText('Canceled')).not.toBeInTheDocument()
  })

  describe('WorkflowActionBar', () => {
    it('renders labelled buttons and emits the clicked item', async () => {
      const { emitted } = render(WorkflowActionBar, { props: { items: actions } })

      expect(screen.getByRole('toolbar', { name: 'Workflow actions' })).toBeInTheDocument()
      await fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
      expect(emitted().action?.[0]?.[0]).toMatchObject({ key: 'reject', action: 'reject' })
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(WorkflowTimeline, {
        props: { steps: mixedSteps, actions }
      })
      expect(screen.getByRole('list', { name: 'Workflow timeline' })).toBeInTheDocument()
      expect(screen.getByRole('toolbar', { name: 'Workflow actions' })).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(WorkflowTimeline)
      expect(container.firstChild).toBeTruthy()
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
    })
  })
})
