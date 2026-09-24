/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { AppShell } from '@expcat/tigercat-react/AppShell'
import { DataTableWithToolbar } from '@expcat/tigercat-react/DataTableWithToolbar'
import { WorkflowDetailShell } from '@expcat/tigercat-react/WorkflowDetailShell'

describe('W10 composites', () => {
  it('renders one page shell around the existing main', () => {
    const { container } = render(
      <AppShell
        title="Home"
        tabs={[{ key: 'home', title: 'Home' }]}
        breadcrumb={[{ title: 'Home' }]}>
        Page
      </AppShell>
    )
    expect(container.querySelector('[data-tiger-app-shell]')).toBeTruthy()
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelector('a.tiger-skip-link')?.getAttribute('href')).toBe('#tiger-main')
  })

  it('shows a collapsed query summary', () => {
    const { container } = render(
      <DataTableWithToolbar
        columns={[{ key: 'name', title: 'Name' }]}
        dataSource={[{ key: '1', name: 'Ada' }]}
        query={{
          defaultCollapsed: true,
          fields: [{ key: 'name', label: 'Name', defaultValue: 'Ada' }]
        }}
      />
    )
    expect(container.querySelector('[data-tiger-query-summary]')?.textContent).toContain(
      'Name: Ada'
    )
  })

  it('uses the locale title on the detail shell', () => {
    const { container } = render(<WorkflowDetailShell />)
    expect(container.querySelector('h1')?.textContent).toBe('Approval')
  })
})
