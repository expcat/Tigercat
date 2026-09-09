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
  it('renders the JSON tree for editing', () => {
    render(WorkflowDesigner, { props: { modelValue: treeSteps } })

    expect(screen.getByRole('region', { name: 'Workflow designer' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Manager' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Lin' })).toBeInTheDocument()
    expect(screen.getByText('Add step')).toBeInTheDocument()
  })

  it('edits a title and emits the full tree', async () => {
    const onUpdate = vi.fn()
    const onChange = vi.fn()
    render(WorkflowDesigner, {
      props: {
        modelValue: treeSteps,
        'onUpdate:modelValue': onUpdate,
        onChange
      }
    })

    const manager = screen.getByRole('group', { name: 'Manager' })
    await fireEvent.update(within(manager).getByLabelText('Title'), 'Director')

    expect(onUpdate).toHaveBeenCalled()
    const next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.title).toBe('Director')
    expect(next.find((step) => step.key === 'manager')?.children).toHaveLength(2)
    expect(onChange.mock.calls.at(-1)?.[0]).toBe(next)
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

    await fireEvent.update(
      within(screen.getByRole('group', { name: 'Lin' })).getByLabelText('Title'),
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
      expect(screen.getByText('No steps yet. Add a start node to begin.')).toBeInTheDocument()
      await fireEvent.click(screen.getByRole('button', { name: 'Add step' }))
      const next = onUpdate.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
      expect(next).toHaveLength(1)
      expect(next[0]?.kind).toBe('start')
    })
  })
})
