/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import { fireEvent, render, screen, within } from '@testing-library/vue'
import { WorkflowDesigner } from '@expcat/tigercat-vue/WorkflowDesigner'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { WorkflowTimelineStep } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils'

const treeSteps: WorkflowTimelineStep[] = [
  { key: 'start', kind: 'start', title: 'Submit' },
  {
    key: 'manager',
    title: 'Manager',
    signMode: 'countersign',
    children: [
      { key: 'a', title: 'Lin' },
      { key: 'b', title: 'Chen' }
    ]
  },
  { key: 'finance', title: 'Finance' }
]

describe('WorkflowDesigner (Vue)', () => {
  it('renders summary cards without inline title or kind inputs', () => {
    render(WorkflowDesigner, { props: { modelValue: treeSteps } })

    expect(screen.getByRole('region', { name: 'Workflow designer' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Manager' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Lin' })).toBeInTheDocument()
    expect(screen.getByText('Add step')).toBeInTheDocument()
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Kind')).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Node settings' })).not.toBeInTheDocument()
  })

  it('opens the edit panel and writes title plus actors into the full tree', async () => {
    const onUpdate = vi.fn()
    const onChange = vi.fn()
    render(WorkflowDesigner, {
      props: {
        defaultValue: treeSteps,
        'onUpdate:modelValue': onUpdate,
        onChange
      }
    })

    await fireEvent.click(screen.getByRole('group', { name: 'Manager' }))
    const panel = screen.getByRole('region', { name: 'Node settings' })
    await fireEvent.update(within(panel).getByLabelText('Title'), 'Director')

    expect(onUpdate).toHaveBeenCalled()
    let next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.title).toBe('Director')
    expect(next.find((step) => step.key === 'manager')?.children).toHaveLength(2)
    expect(onChange.mock.calls.at(-1)?.[0]).toBe(next)

    await fireEvent.click(within(panel).getByRole('button', { name: 'Add approver' }))
    next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.actors).toHaveLength(1)

    await fireEvent.update(within(panel).getByLabelText('Approvers 1'), 'Ada')
    next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.actors?.[0]?.name).toBe('Ada')
  })

  it('inserts a sibling after the node instead of nesting a child', async () => {
    const onUpdate = vi.fn()
    render(WorkflowDesigner, {
      props: { modelValue: treeSteps, 'onUpdate:modelValue': onUpdate }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Insert after (Manager)' }))
    await fireEvent.click(screen.getByRole('menuitem', { name: 'Approval' }))

    const next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.map((step) => step.key)).toEqual(['start', 'manager', 'step-1', 'finance'])
    expect(next[1]?.children?.map((step) => step.key)).toEqual(['a', 'b'])
    expect(next[2]?.kind).toBe('approve')
  })

  it('exposes inspector tabs and writes approverPolicy, buttonPolicy, and fieldPermissions', async () => {
    const onUpdate = vi.fn()
    render(WorkflowDesigner, {
      props: {
        defaultValue: treeSteps,
        schema: { fields: [{ name: 'amount', label: 'Amount' }] },
        'onUpdate:modelValue': onUpdate
      }
    })

    await fireEvent.click(screen.getByRole('group', { name: 'Manager' }))
    const panel = screen.getByRole('region', { name: 'Node settings' })
    expect(within(panel).getByRole('tab', { name: 'Approvers' })).toBeInTheDocument()
    expect(within(panel).getByRole('tab', { name: 'Actions' })).toBeInTheDocument()
    expect(within(panel).getByRole('tab', { name: 'Form permissions' })).toBeInTheDocument()
    expect(within(panel).getByRole('tab', { name: 'Advanced' })).toBeInTheDocument()

    await fireEvent.update(within(panel).getByLabelText('Approver source'), 'self')
    let next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.approverPolicy).toEqual({ type: 'self' })

    await fireEvent.click(within(panel).getByRole('tab', { name: 'Actions' }))
    await fireEvent.update(within(panel).getByLabelText('Approve Display name'), 'OK')
    next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(
      next
        .find((step) => step.key === 'manager')
        ?.buttonPolicy?.buttons.find((button) => button.action === 'approve')?.label
    ).toBe('OK')

    await fireEvent.click(within(panel).getByRole('tab', { name: 'Form permissions' }))
    await fireEvent.click(within(panel).getByLabelText('Amount Hidden'))
    next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.fieldPermissions?.amount).toBe('hidden')
  })

  it('copies a node and shows publish validation', async () => {
    const onUpdate = vi.fn()
    render(WorkflowDesigner, {
      props: { defaultValue: treeSteps, 'onUpdate:modelValue': onUpdate }
    })

    expect(screen.getByRole('status', { name: 'Publish checks' })).toBeInTheDocument()
    expect(screen.getByText('Add an end node')).toBeInTheDocument()

    await fireEvent.click(
      within(screen.getByRole('group', { name: 'Manager' })).getByRole('button', { name: 'Copy' })
    )
    const next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.map((step) => step.key)).toEqual(['start', 'manager', 'manager-copy', 'finance'])
  })

  it.each(['cc', 'start', 'condition'] as const)('hides sign mode for kind=%s', async (kind) => {
    render(WorkflowDesigner, { props: { modelValue: [{ key: 'n', kind, title: 'Node' }] } })
    await fireEvent.click(screen.getByRole('group', { name: 'Node' }))
    expect(screen.getByRole('region', { name: 'Node settings' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Sign mode')).not.toBeInTheDocument()
  })

  it('edits only the subpath list and writes back into the full tree', async () => {
    const onUpdate = vi.fn()
    render(WorkflowDesigner, {
      props: {
        modelValue: treeSteps,
        path: ['manager'],
        'onUpdate:modelValue': onUpdate
      }
    })

    expect(screen.getByRole('group', { name: 'Lin' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Chen' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Submit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Manager' })).not.toBeInTheDocument()

    await fireEvent.click(screen.getByRole('group', { name: 'Lin' }))
    await fireEvent.update(
      within(screen.getByRole('region', { name: 'Node settings' })).getByLabelText('Title'),
      'Lin Wei'
    )

    const next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next[0]?.title).toBe('Submit')
    expect(next.find((step) => step.key === 'manager')?.children?.[0]?.title).toBe('Lin Wei')
  })

  it('uses ConfigProvider locale for designer chrome', () => {
    render({
      render: () =>
        h(ConfigProvider, { locale: zhCN }, () => h(WorkflowDesigner, { modelValue: treeSteps }))
    })

    expect(screen.getByRole('region', { name: '流程设计器' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加步骤' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '添加子步骤' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /在后方插入/ }).length).toBeGreaterThan(0)
  })

  it('shows the subpath empty copy when the path is missing', () => {
    render(WorkflowDesigner, { props: { modelValue: treeSteps, path: ['ghost'] } })
    expect(screen.getByText('No subtree at this path.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add step' })).toBeDisabled()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(WorkflowDesigner, { props: { modelValue: treeSteps } })
      expect(screen.getByRole('region', { name: 'Workflow designer' })).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', async () => {
      const onUpdate = vi.fn()
      render(WorkflowDesigner, { props: { 'onUpdate:modelValue': onUpdate } })
      expect(screen.getByText('Add a start node, then insert approvers')).toBeInTheDocument()
      await fireEvent.click(screen.getByRole('button', { name: 'Add step' }))
      const next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
      expect(next).toHaveLength(1)
      expect(next[0]?.kind).toBe('start')
    })
  })
})
