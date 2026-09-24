/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/vue'
import { AppShell } from '@expcat/tigercat-vue/AppShell'
import { DataTableWithToolbar } from '@expcat/tigercat-vue/DataTableWithToolbar'
import { WorkflowDetailShell } from '@expcat/tigercat-vue/WorkflowDetailShell'

describe('W10 composites', () => {
  it('renders one page shell around the existing main', () => {
    const { container } = render(AppShell, {
      props: {
        title: 'Home',
        tabs: [{ key: 'home', title: 'Home' }],
        breadcrumb: [{ title: 'Home' }]
      },
      slots: { default: () => 'Page' }
    })
    expect(container.querySelector('[data-tiger-app-shell]')).toBeTruthy()
    expect(container.querySelectorAll('main')).toHaveLength(1)
    expect(container.querySelector('a.tiger-skip-link')?.getAttribute('href')).toBe('#tiger-main')
    expect(container.textContent).toContain('Home')
  })

  it('shows a query summary when collapsed and keeps object filters out of the row text', async () => {
    const { container, getByText } = render(DataTableWithToolbar, {
      props: {
        columns: [{ key: 'name', title: 'Name' }],
        dataSource: [{ key: '1', name: 'Ada' }],
        query: {
          defaultCollapsed: true,
          fields: [
            { key: 'name', label: 'Name', defaultValue: 'Ada' },
            { key: 'range', label: 'Range', defaultValue: { start: '2024-01-01' } }
          ]
        }
      }
    })
    expect(container.querySelector('[data-tiger-query-summary]')?.textContent).toContain(
      'Name: Ada'
    )
    expect(container.querySelector('[data-tiger-query-summary]')?.textContent).toContain('Range')
    expect(getByText('Ada')).toBeTruthy()
  })

  it('uses the locale title on the detail shell', () => {
    const { container } = render(WorkflowDetailShell)
    expect(container.querySelector('h1')?.textContent).toBe('Approval')
  })
})
