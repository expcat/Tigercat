/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { WorkflowDetailShell } from '@expcat/tigercat-react/WorkflowDetailShell'
import { expectNoA11yViolations } from '../utils/react'

describe('WorkflowDetailShell (React)', () => {
  it('renders header, form, tabs, and sticky action regions', () => {
    render(
      <WorkflowDetailShell
        header={<h2>Leave request</h2>}
        form={<p>Form body</p>}
        tabs={<p>Timeline tab</p>}
        action={<button type="button">Approve</button>}
      />
    )

    const root = screen.getByRole('region', { name: 'Workflow detail' })
    expect(root).toHaveAttribute('data-tiger-workflow-detail-shell')
    expect(root.querySelector('[data-slot="header"]')).toHaveTextContent('Leave request')
    expect(root.querySelector('[data-slot="form"]')).toHaveTextContent('Form body')
    expect(root.querySelector('[data-slot="tabs"]')).toHaveTextContent('Timeline tab')
    expect(root.querySelector('[data-slot="action"]')?.tagName).toBe('FOOTER')
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(root.querySelector('[data-slot="body"]')?.nextElementSibling).toBe(
      root.querySelector('[data-slot="action"]')
    )
  })

  it('keeps the action footer inside a bounded-height host', () => {
    const { container } = render(
      <div style={{ height: 320, display: 'flex', flexDirection: 'column' }}>
        <WorkflowDetailShell
          header={<h2>Leave request</h2>}
          form={<p style={{ minHeight: 480 }}>Tall form</p>}
          action={<button type="button">Approve</button>}
        />
      </div>
    )

    const host = container.firstElementChild as HTMLElement
    const root = screen.getByRole('region', { name: 'Workflow detail' })
    const action = root.querySelector('[data-slot="action"]') as HTMLElement
    expect(action).toBeTruthy()
    expect(root.parentElement).toBe(host)
    expect(action.tagName).toBe('FOOTER')
    expect(root.querySelector('[data-slot="body"]')?.contains(action)).toBe(false)
  })

  it('omits empty regions and hides the action node when showActions is false', () => {
    const { container } = render(
      <WorkflowDetailShell
        showActions={false}
        ariaLabel="Request detail"
        form={<p>Only form</p>}
        action={<button type="button">Hidden approve</button>}
      />
    )

    expect(screen.getByRole('region', { name: 'Request detail' })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="header"]')).toBeNull()
    expect(container.querySelector('[data-slot="tabs"]')).toBeNull()
    expect(container.querySelector('[data-slot="action"]')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Hidden approve' })).not.toBeInTheDocument()
    expect(screen.getByText('Only form')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <WorkflowDetailShell
        header={<h2>Detail</h2>}
        form={<p>Fields</p>}
        action={<button type="button">Approve</button>}
      />
    )
    await expectNoA11yViolations(container)
  })
})
