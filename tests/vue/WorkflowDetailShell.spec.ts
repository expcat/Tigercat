/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { render, screen } from '@testing-library/vue'
import { WorkflowDetailShell } from '@expcat/tigercat-vue/WorkflowDetailShell'
import { expectNoA11yViolations } from '../utils'

describe('WorkflowDetailShell (Vue)', () => {
  it('renders header, form, tabs, and sticky action slots', () => {
    render(WorkflowDetailShell, {
      slots: {
        header: () => h('h2', 'Leave request'),
        form: () => h('p', 'Form body'),
        tabs: () => h('p', 'Timeline tab'),
        action: () => h('button', 'Approve')
      }
    })

    const root = screen.getByRole('region', { name: 'Workflow detail' })
    expect(root).toHaveAttribute('data-tiger-workflow-detail-shell')
    expect(root.querySelector('[data-slot="header"]')).toHaveTextContent('Leave request')
    expect(root.querySelector('[data-slot="form"]')).toHaveTextContent('Form body')
    expect(root.querySelector('[data-slot="tabs"]')).toHaveTextContent('Timeline tab')
    expect(root.querySelector('[data-slot="action"]')?.tagName).toBe('FOOTER')
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
  })

  it('omits empty regions and hides the action slot when showActions is false', () => {
    const { container } = render(WorkflowDetailShell, {
      props: { showActions: false, ariaLabel: 'Request detail' },
      slots: {
        form: () => h('p', 'Only form'),
        action: () => h('button', 'Hidden approve')
      }
    })

    expect(screen.getByRole('region', { name: 'Request detail' })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="header"]')).toBeNull()
    expect(container.querySelector('[data-slot="tabs"]')).toBeNull()
    expect(container.querySelector('[data-slot="action"]')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Hidden approve' })).not.toBeInTheDocument()
    expect(screen.getByText('Only form')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(WorkflowDetailShell, {
      slots: {
        header: () => h('h2', 'Detail'),
        form: () => h('p', 'Fields'),
        action: () => h('button', 'Approve')
      }
    })
    await expectNoA11yViolations(container)
  })
})
