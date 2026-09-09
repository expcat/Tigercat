/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { WorkflowDesigner } from '@expcat/tigercat-react/WorkflowDesigner'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
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

describe('WorkflowDesigner (React)', () => {
  it('renders the JSON tree for editing', () => {
    render(<WorkflowDesigner value={treeSteps} />)

    expect(screen.getByRole('region', { name: 'Workflow designer' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Manager' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Lin' })).toBeInTheDocument()
    expect(screen.getByText('Add step')).toBeInTheDocument()
  })

  it('edits a title and emits the full tree', () => {
    const onChange = vi.fn()
    render(<WorkflowDesigner value={treeSteps} onChange={onChange} />)

    const manager = screen.getByRole('group', { name: 'Manager' })
    fireEvent.change(within(manager).getByLabelText('Title'), { target: { value: 'Director' } })

    expect(onChange).toHaveBeenCalled()
    const next = onChange.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.title).toBe('Director')
    expect(next.find((step) => step.key === 'manager')?.children).toHaveLength(2)
  })

  it('edits only the subpath list and writes back into the full tree', () => {
    const onChange = vi.fn()
    render(<WorkflowDesigner value={treeSteps} path={['manager']} onChange={onChange} />)

    expect(screen.getByRole('group', { name: 'Lin' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Chen' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Submit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Manager' })).not.toBeInTheDocument()

    fireEvent.change(within(screen.getByRole('group', { name: 'Lin' })).getByLabelText('Title'), {
      target: { value: 'Lin Wei' }
    })

    const next = onChange.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next[0]?.title).toBe('Submit')
    expect(next.find((step) => step.key === 'manager')?.children?.[0]?.title).toBe('Lin Wei')
  })

  it('uses ConfigProvider locale for designer chrome', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <WorkflowDesigner value={treeSteps} />
      </ConfigProvider>
    )

    expect(screen.getByRole('region', { name: '流程设计器' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '添加步骤' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '添加子步骤' }).length).toBeGreaterThan(0)
  })

  it('shows the subpath empty copy when the path is missing', () => {
    render(<WorkflowDesigner value={treeSteps} path={['ghost']} />)
    expect(screen.getByText('No subtree at this path.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add step' })).toBeDisabled()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<WorkflowDesigner value={treeSteps} />)
      expect(screen.getByRole('region', { name: 'Workflow designer' })).toBeInTheDocument()
      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const onChange = vi.fn()
      render(<WorkflowDesigner onChange={onChange} />)
      expect(screen.getByText('No steps yet. Add a start node to begin.')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Add step' }))
      const next = onChange.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
      expect(next).toHaveLength(1)
      expect(next[0]?.kind).toBe('start')
    })
  })
})
