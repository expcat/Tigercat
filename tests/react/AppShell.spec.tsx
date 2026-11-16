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

  it('puts the page body in the selected tab panel', () => {
    const { container } = render(
      <AppShell
        tabs={[
          { key: 'home', title: 'Home' },
          { key: 'list', title: 'List' }
        ]}>
        PAGE-BODY
      </AppShell>
    )
    const selected = [...container.querySelectorAll('[role="tabpanel"]')].find(
      (panel) => panel.getAttribute('aria-hidden') !== 'true'
    )
    expect(selected?.textContent).toContain('PAGE-BODY')
    const textHosts = [...container.querySelectorAll('*')].filter((el) =>
      [...el.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.includes('PAGE-BODY')
      )
    )
    expect(textHosts.length).toBeGreaterThan(0)
    for (const host of textHosts) {
      expect(host.closest('[role="tabpanel"]')).toBe(selected)
    }
  })

  it('keeps breadcrumbExtra and tabsExtra with or without arrays', () => {
    const filled = render(
      <AppShell
        breadcrumb={[{ title: 'HomeCrumb' }]}
        tabs={[{ key: 'home', title: 'Home' }]}
        breadcrumbExtra="CRUMB-EXTRA"
        tabsExtra="TABS-EXTRA"
      />
    )
    expect(filled.container.textContent).toContain('HomeCrumb')
    expect(filled.container.textContent).toContain('CRUMB-EXTRA')
    expect(filled.container.textContent).toContain('TABS-EXTRA')
    filled.unmount()

    const empty = render(
      <AppShell breadcrumb={[]} tabs={[]} breadcrumbExtra="CRUMB-EXTRA" tabsExtra="TABS-EXTRA" />
    )
    expect(empty.container.textContent).toContain('CRUMB-EXTRA')
    expect(empty.container.textContent).toContain('TABS-EXTRA')
  })
})
