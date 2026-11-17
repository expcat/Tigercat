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
    expect(root.querySelector('[data-slot="action"]')?.tagName).toBe('DIV')
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
    expect(action.tagName).toBe('DIV')
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
    expect(container.querySelector('[data-slot="header"]')).toHaveTextContent('Approval')
    expect(container.querySelector('[data-slot="tabs"]')).toBeNull()
    expect(container.querySelector('[data-slot="action"]')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Hidden approve' })).not.toBeInTheDocument()
    expect(screen.getByText('Only form')).toBeInTheDocument()
  })

  it('treats empty strings as empty regions and still shows zero', () => {
    const { container } = render(
      <>
        <WorkflowDetailShell header="" form="" tabs="" action="   " />
        <WorkflowDetailShell header={0} form={0} />
      </>
    )
    const shells = container.querySelectorAll('[data-tiger-workflow-detail-shell]')
    expect(shells).toHaveLength(2)
    expect(shells[0].querySelector('[data-slot="form"]')).toBeNull()
    expect(shells[0].querySelector('[data-slot="tabs"]')).toBeNull()
    expect(shells[0].querySelector('[data-slot="action"]')).toBeNull()
    expect(shells[0].querySelector('[data-slot="header"]')).toHaveTextContent('Approval')
    expect(shells[1].querySelector('[data-slot="header"]')).toHaveTextContent('0')
    expect(shells[1].querySelector('[data-slot="form"]')).toHaveTextContent('0')
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

  it('keeps a caller aria-label and lets ariaLabel win', () => {
    const fromAttr = render(<WorkflowDetailShell aria-label="From attr" />)
    expect(fromAttr.container.firstElementChild).toHaveAttribute('aria-label', 'From attr')
    fromAttr.unmount()
    const named = render(<WorkflowDetailShell ariaLabel="Named shell" />)
    expect(named.container.firstElementChild).toHaveAttribute('aria-label', 'Named shell')
  })

  it('shows title 0 instead of the default title', () => {
    const zero = render(<WorkflowDetailShell title={0 as unknown as string} />)
    expect(zero.container.querySelector('h1')).toHaveTextContent('0')
    expect(zero.container.querySelector('h1')).not.toHaveTextContent('Approval')
    zero.unmount()
    const empty = render(<WorkflowDetailShell title="" />)
    expect(empty.container.querySelector('h1')).toHaveTextContent('Approval')
  })
})
