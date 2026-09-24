/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { render, fireEvent } from '@testing-library/vue'
import { Dropdown } from '@expcat/tigercat-vue/Dropdown'
import { Menu } from '@expcat/tigercat-vue/Menu'
import { Tabs, TabPane } from '@expcat/tigercat-vue/Tabs'
import { Tree } from '@expcat/tigercat-vue/Tree'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-vue/Breadcrumb'
import { PageHeader } from '@expcat/tigercat-vue/PageHeader'
import { FloatButton } from '@expcat/tigercat-vue/FloatButton'
import { Pagination } from '@expcat/tigercat-vue/Pagination'
import { Steps, StepsItem } from '@expcat/tigercat-vue/Steps'
import { Spotlight } from '@expcat/tigercat-vue/Spotlight'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from '@expcat/tigercat-vue/NavigationMenu'

describe('vue W9 T07', () => {
  it('E1 renders a shared dropdown item', async () => {
    const { getByRole, findByRole } = render(Dropdown, {
      props: {
        items: [
          { key: 'go', type: 'danger', label: 'Delete' },
          { key: 'pin', type: 'checkbox', label: 'Pin', checked: false, shortcut: 'P' }
        ]
      },
      slots: { default: () => h('button', null, 'Open') }
    })
    await fireEvent.click(getByRole('button', { name: 'Open' }))
    expect(await findByRole('menuitem', { name: /Delete/ })).toBeTruthy()
    expect(await findByRole('menuitemcheckbox', { name: /Pin/ })).toBeTruthy()
  })

  it('E2 shows a badge on a menu item', () => {
    const { getByText } = render(Menu, {
      props: { items: [{ key: 'inbox', label: 'Inbox', badge: 2 }] }
    })
    expect(getByText('2')).toBeTruthy()
  })

  it('E3 marks a shared viewport and current page', () => {
    const { container } = render(NavigationMenu, {
      props: { current: 'home', viewport: true },
      slots: {
        default: () =>
          h(NavigationMenuItem, { value: 'home' }, () => h(NavigationMenuLink, { href: '/home' }, () => 'Home'))
      }
    })
    expect(container.querySelector('[data-tiger-navigation-viewport="true"]')).toBeTruthy()
    expect(container.querySelector('[data-tiger-navigation-indicator]')).toBeTruthy()
  })

  it('E4 manual activation does not select on arrow', async () => {
    const { getByRole } = render(Tabs, {
      props: { activation: 'manual', defaultActiveKey: 'a' },
      slots: {
        default: () => [h(TabPane, { tabKey: 'a', label: 'Alpha' }), h(TabPane, { tabKey: 'b', label: 'Beta' })]
      }
    })
    const first = getByRole('tab', { name: 'Alpha' })
    first.focus()
    await fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(getByRole('tab', { name: 'Alpha' }).getAttribute('aria-selected')).toBe('true')
  })

  it('E5 shift-selects a tree range', async () => {
    const { getByRole } = render(Tree, {
      props: {
        selectionMode: 'multiple',
        treeData: [
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
          { key: 'c', label: 'C' }
        ]
      }
    })
    await fireEvent.click(getByRole('treeitem', { name: 'A' }))
    await fireEvent.click(getByRole('treeitem', { name: 'C' }), { shiftKey: true })
    expect(getByRole('treeitem', { name: 'B' }).getAttribute('aria-selected')).toBe('true')
  })

  it('E7 ellipsis opens collapsed breadcrumb items', async () => {
    const { getByRole, findByRole } = render(Breadcrumb, {
      props: { maxItems: 2 },
      slots: {
        default: () => [
          h(BreadcrumbItem, { href: '/' }, () => 'Home'),
          h(BreadcrumbItem, { href: '/docs' }, () => 'Docs'),
          h(BreadcrumbItem, { href: '/api' }, () => 'API')
        ]
      }
    })
    await fireEvent.click(getByRole('button'))
    expect(await findByRole('menu')).toBeTruthy()
  })

  it('E8 renders caller tabs and footer', () => {
    const { getByText } = render(PageHeader, {
      props: { title: 'Page', backHref: '/back' },
      slots: {
        tabs: () => h('div', null, 'Tab slot'),
        footer: () => h('div', null, 'Footer slot')
      }
    })
    expect(getByText('Tab slot')).toBeTruthy()
    expect(getByText('Footer slot')).toBeTruthy()
  })

  it('E9 renders a float button link', () => {
    const { getByRole } = render(FloatButton, { props: { href: '/inbox', ariaLabel: 'Inbox' } })
    expect(getByRole('link', { name: 'Inbox' }).getAttribute('href')).toBe('/inbox')
  })

  it('E10 ellipsis jump uses the same clamp', () => {
    const { getAllByLabelText } = render(Pagination, { props: { total: 200, ellipsisJump: true } })
    expect(getAllByLabelText('Go to page').length).toBeGreaterThan(0)
  })

  it('E11 dots the step marker', () => {
    const { container } = render(Steps, {
      props: { progressDot: true, clickable: true, current: 1, status: 'error' },
      slots: { default: () => [h(StepsItem, { title: 'One' }), h(StepsItem, { title: 'Two' })] }
    })
    expect(container.querySelector('.tiger-step-icon--dot')).toBeTruthy()
  })

  it('E12 lists footer shortcuts', () => {
    const { getAllByText } = render(Spotlight, {
      props: {
        open: true,
        recentIds: ['b'],
        items: [
          { key: 'a', label: 'Alpha' },
          { key: 'b', label: 'Beta', shortcut: '⌘B' }
        ]
      }
    })
    expect(getAllByText('⌘B').length).toBeGreaterThan(0)
  })
})
