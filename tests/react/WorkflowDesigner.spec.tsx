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
  it('renders summary cards without inline title or kind inputs', () => {
    render(<WorkflowDesigner value={treeSteps} />)

    expect(screen.getByRole('region', { name: 'Workflow designer' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Submit' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Manager' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Lin' })).toBeInTheDocument()
    expect(screen.getByText('Add step')).toBeInTheDocument()
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Kind')).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Node settings' })).not.toBeInTheDocument()
  })

  it('opens the edit panel and writes title plus actors into the full tree', () => {
    const onChange = vi.fn()
    render(<WorkflowDesigner defaultValue={treeSteps} onChange={onChange} />)

    fireEvent.click(screen.getByRole('group', { name: 'Manager' }))
    const panel = screen.getByRole('region', { name: 'Node settings' })
    fireEvent.change(within(panel).getByLabelText('Title'), { target: { value: 'Director' } })

    expect(onChange).toHaveBeenCalled()
    let next = onChange.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.title).toBe('Director')
    expect(next.find((step) => step.key === 'manager')?.children).toHaveLength(2)

    fireEvent.click(within(panel).getByRole('button', { name: 'Add approver' }))
    next = onChange.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.actors).toHaveLength(1)

    fireEvent.change(within(panel).getByLabelText('Approvers 1'), { target: { value: 'Ada' } })
    next = onChange.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.find((step) => step.key === 'manager')?.actors?.[0]?.name).toBe('Ada')
  })

  it('inserts a sibling after the node instead of nesting a child', () => {
    const onChange = vi.fn()
    render(<WorkflowDesigner value={treeSteps} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Insert after (Manager)' }))

    const next = onChange.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
    expect(next.map((step) => step.key)).toEqual(['start', 'manager', 'step-1', 'finance'])
    expect(next[1]?.children?.map((step) => step.key)).toEqual(['a', 'b'])
    expect(next[2]?.kind).toBe('approve')
  })

  it.each(['cc', 'start', 'condition'] as const)('hides sign mode for kind=%s', (kind) => {
    render(<WorkflowDesigner value={[{ key: 'n', kind, title: 'Node' }]} />)
    fireEvent.click(screen.getByRole('group', { name: 'Node' }))
    expect(screen.getByRole('region', { name: 'Node settings' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Sign mode')).not.toBeInTheDocument()
  })

  it('edits only the subpath list and writes back into the full tree', () => {
    const onChange = vi.fn()
    render(<WorkflowDesigner value={treeSteps} path={['manager']} onChange={onChange} />)

    expect(screen.getByRole('group', { name: 'Lin' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Chen' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Submit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Manager' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('group', { name: 'Lin' }))
    fireEvent.change(
      within(screen.getByRole('region', { name: 'Node settings' })).getByLabelText('Title'),
      { target: { value: 'Lin Wei' } }
    )

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
    expect(screen.getAllByRole('button', { name: /在后方插入/ }).length).toBeGreaterThan(0)
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
      expect(screen.getByText('Add a start node, then insert approvers')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Add step' }))
      const next = onChange.mock.calls.at(-1)?.[0] as WorkflowTimelineStep[]
      expect(next).toHaveLength(1)
      expect(next[0]?.kind).toBe('start')
    })
  })
})
