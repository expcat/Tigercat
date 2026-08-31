/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { h } from 'vue'
import { Menu, MenuItem, MenuItemGroup, SubMenu } from '@expcat/tigercat-vue/Menu'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import type { MenuItem as CoreMenuItem } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolations } from '../utils/a11y-helpers'

const dataItems: CoreMenuItem[] = [
  { key: 'dashboard', label: 'Dashboard' },
  {
    key: 'admin',
    label: 'Administration',
    children: [
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles' }
    ]
  },
  { key: 'settings', label: 'Settings' }
]

function getItem(name: string) {
  return screen.queryByRole('menuitem', { name }) ?? screen.getByRole('button', { name })
}

describe('Menu', () => {
  describe('Rendering', () => {
    it('renders a named nav list without putting items in a popup menu role', () => {
      const { container } = render(Menu, {
        attrs: { 'aria-label': 'Site' },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      expect(screen.getByRole('navigation', { name: 'Site' })).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-menu-root]')).not.toHaveAttribute('role', 'menu')
      expect(getItem('Item 1')).toBeInTheDocument()
    })

    it('renders data-driven items including groups, dividers, and links', () => {
      render(Menu, {
        props: {
          defaultOpenKeys: ['admin'],
          items: [
            { key: 'home', label: 'Home', href: '/home' },
            { type: 'divider' },
            {
              type: 'group',
              title: 'Team',
              children: [
                {
                  key: 'admin',
                  label: 'Administration',
                  children: [{ key: 'users', label: 'Users' }]
                }
              ]
            }
          ]
        }
      })

      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home')
      expect(screen.getByText('Team')).toBeInTheDocument()
      expect(getItem('Users')).toBeInTheDocument()
    })

    it('expands ancestors when searching a nested label without defaultOpenKeys', async () => {
      render(Menu, { props: { items: dataItems, searchable: true } })
      await fireEvent.update(screen.getByRole('searchbox'), 'Roles')
      expect(getItem('Roles')).toBeVisible()
      expect(getItem('Administration')).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps a matching parent as a submenu', () => {
      render(Menu, { props: { items: dataItems, defaultSearchValue: 'Administration' } })
      expect(getItem('Administration')).toHaveAttribute('aria-expanded')
      expect(getItem('Users')).toBeInTheDocument()
      expect(getItem('Roles')).toBeInTheDocument()
    })

    it('reads search copy from the official locale object', () => {
      render({
        setup: () => () =>
          h(ConfigProvider, { locale: zhCN }, () => h(Menu, { items: dataItems, searchable: true }))
      })
      expect(screen.getByRole('searchbox', { name: '搜索' })).toBeInTheDocument()
    })

    it('places the search field outside the menu list', () => {
      const { container } = render(Menu, {
        attrs: { 'aria-label': 'Site' },
        props: { items: dataItems, searchable: true }
      })
      const list = container.querySelector('[data-tiger-menu-root]')
      expect(list?.querySelector('input[type="search"]')).toBeNull()
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('treats 1 and "1" as the same key and deselects on a second click', async () => {
      const { emitted } = render(Menu, {
        props: { defaultSelectedKeys: [1] },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'One'),
            h(MenuItem, { itemKey: '2' }, () => 'Two')
          ]
        }
      })

      expect(getItem('One')).toHaveAttribute('data-tiger-selected', 'true')
      await fireEvent.click(getItem('One'))
      expect(emitted().select[0]).toEqual(['1', { selectedKeys: [] }])
    })
  })

  describe('Keyboard', () => {
    it('moves between vertical items with arrows and leaves every item in the tab order', async () => {
      render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      const item1 = getItem('Item 1')
      const item2 = getItem('Item 2')
      expect(item1).toHaveAttribute('tabindex', '0')
      expect(item2).toHaveAttribute('tabindex', '0')
      item1.focus()
      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      expect(item2).toHaveFocus()
    })

    it('enters an already open inline submenu with ArrowRight', async () => {
      render(Menu, {
        props: { defaultOpenKeys: ['sub1'] },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () =>
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            )
          ]
        }
      })

      const trigger = getItem('Submenu')
      trigger.focus()
      await fireEvent.keyDown(trigger, { key: 'ArrowRight' })
      await waitFor(() => {
        expect(getItem('Sub Item 1')).toHaveFocus()
      })
    })
  })

  describe('SubMenu', () => {
    it('opens a horizontal submenu from click', async () => {
      render(Menu, {
        props: { mode: 'horizontal' },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () =>
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            )
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      await fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('does not open a disabled submenu on hover', async () => {
      render(Menu, {
        props: { mode: 'horizontal' },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu', disabled: true }, () =>
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            )
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      await fireEvent.mouseEnter(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('focuses the first popup child after Enter when portaled', async () => {
      render(Menu, {
        props: { mode: 'horizontal' },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () =>
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            )
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      trigger.focus()
      await fireEvent.keyDown(trigger, { key: 'Enter' })
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'Sub Item 1' })).toHaveFocus()
      })
    })

    it('ignores HTML strings as icons and skips a first letter for non-text children', () => {
      const { container } = render(Menu, {
        props: { collapsed: true },
        slots: {
          default: () => [
            h(
              MenuItem,
              { itemKey: 'xss', icon: '<img onerror="alert(1)" src="x" />' },
              () => 'Safe'
            ),
            h(MenuItem, { itemKey: 'obj' }, () => h('span', { 'data-testid': 'node' }, 'Node'))
          ]
        }
      })

      expect(container.querySelector('img')).toBeNull()
      expect(container.innerHTML).not.toContain('onerror')
      expect(container.textContent).not.toContain('[')
    })
  })

  describe('Accessibility', () => {
    it('passes axe on a filled tree', async () => {
      const { container } = render(Menu, {
        attrs: { 'aria-label': 'Site' },
        props: {
          searchable: true,
          defaultSelectedKeys: ['1'],
          defaultOpenKeys: ['sub1']
        },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2', disabled: true }, () => 'Item 2'),
            h(MenuItemGroup, { title: 'More' }, () =>
              h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () =>
                h(MenuItem, { itemKey: '3' }, () => 'Sub Item 1')
              )
            )
          ]
        }
      })

      await expectNoA11yViolations(container)
    })
  })
})
