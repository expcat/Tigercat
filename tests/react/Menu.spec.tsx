/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Menu, MenuItem, MenuItemGroup, SubMenu } from '@expcat/tigercat-react/Menu'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import type { MenuItem as CoreMenuItem } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import React from 'react'
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
      const { container } = render(
        <Menu aria-label="Site">
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      expect(screen.getByRole('navigation', { name: 'Site' })).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-menu-root]')).not.toHaveAttribute('role', 'menu')
      expect(getItem('Item 1')).toBeInTheDocument()
    })

    it('renders data-driven items including groups, dividers, and links', () => {
      render(
        <Menu
          defaultOpenKeys={['admin']}
          items={[
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
          ]}
        />
      )

      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home')
      expect(screen.getByText('Team')).toBeInTheDocument()
      expect(getItem('Users')).toBeInTheDocument()
    })

    it('expands ancestors when searching a nested label without defaultOpenKeys', async () => {
      const user = userEvent.setup()
      render(<Menu items={dataItems} searchable />)

      await user.type(screen.getByRole('searchbox'), 'Roles')
      expect(getItem('Roles')).toBeVisible()
      expect(getItem('Administration')).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps a matching parent as a submenu', () => {
      render(<Menu items={dataItems} defaultSearchValue="Administration" />)

      const trigger = getItem('Administration')
      expect(trigger).toHaveAttribute('aria-expanded')
      expect(getItem('Users')).toBeInTheDocument()
      expect(getItem('Roles')).toBeInTheDocument()
    })

    it('reads search copy from the official locale object', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <Menu items={dataItems} searchable />
        </ConfigProvider>
      )

      expect(screen.getByRole('searchbox', { name: '搜索' })).toBeInTheDocument()
    })

    it('places the search field outside the menu list', () => {
      const { container } = render(<Menu items={dataItems} searchable aria-label="Site" />)
      const list = container.querySelector('[data-tiger-menu-root]')
      expect(list?.querySelector('input[type="search"]')).toBeNull()
      expect(screen.getByRole('searchbox')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('treats 1 and "1" as the same key and deselects on a second click', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(
        <Menu defaultSelectedKeys={[1]} onSelect={onSelect}>
          <MenuItem itemKey="1">One</MenuItem>
          <MenuItem itemKey="2">Two</MenuItem>
        </Menu>
      )

      expect(getItem('One')).toHaveAttribute('data-tiger-selected', 'true')
      await user.click(getItem('One'))
      expect(onSelect).toHaveBeenCalledWith('1', { selectedKeys: [] })
    })

    it('puts aria-current=page only on selected links', () => {
      render(
        <Menu defaultSelectedKeys={['home']}>
          <MenuItem itemKey="home" href="/home">
            Home
          </MenuItem>
          <MenuItem itemKey="tasks">Tasks</MenuItem>
        </Menu>
      )

      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
      expect(getItem('Tasks')).not.toHaveAttribute('aria-current')
    })
  })

  describe('Keyboard', () => {
    it('moves between vertical items with arrows and leaves every item in the tab order', async () => {
      const user = userEvent.setup()
      render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const item1 = getItem('Item 1')
      const item2 = getItem('Item 2')
      expect(item1).toHaveAttribute('tabindex', '0')
      expect(item2).toHaveAttribute('tabindex', '0')
      item1.focus()
      await user.keyboard('{ArrowDown}')
      expect(item2).toHaveFocus()
    })

    it('uses RTL arrows on a horizontal menubar', async () => {
      const user = userEvent.setup()
      render(
        <ConfigProvider direction="rtl">
          <Menu mode="horizontal">
            <MenuItem itemKey="1">Item 1</MenuItem>
            <MenuItem itemKey="2">Item 2</MenuItem>
          </Menu>
        </ConfigProvider>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })
      item1.focus()
      await user.keyboard('{ArrowLeft}')
      expect(item2).toHaveFocus()
    })

    it('enters an already open inline submenu with ArrowRight', async () => {
      const user = userEvent.setup()
      render(
        <Menu defaultOpenKeys={['sub1']}>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      getItem('Submenu').focus()
      await user.keyboard('{ArrowRight}')
      expect(getItem('Sub Item 1')).toHaveFocus()
    })
  })

  describe('SubMenu', () => {
    it('toggles from click and shares openKeys for popup mode', async () => {
      const user = userEvent.setup()
      render(
        <Menu mode="horizontal" multiple={false}>
          <SubMenu itemKey="a" title="First">
            <MenuItem itemKey="1">One</MenuItem>
          </SubMenu>
          <SubMenu itemKey="b" title="Second">
            <MenuItem itemKey="2">Two</MenuItem>
          </SubMenu>
        </Menu>
      )

      const first = screen.getByRole('menuitem', { name: 'First' })
      const second = screen.getByRole('menuitem', { name: 'Second' })
      fireEvent.click(first)
      expect(first).toHaveAttribute('aria-expanded', 'true')
      second.focus()
      await user.keyboard('{Enter}')
      expect(first).toHaveAttribute('aria-expanded', 'false')
      expect(second).toHaveAttribute('aria-expanded', 'true')
    })

    it('does not open a disabled submenu on hover', async () => {
      const user = userEvent.setup()
      render(
        <Menu mode="horizontal">
          <SubMenu itemKey="sub1" title="Submenu" disabled>
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      await user.hover(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('focuses the first popup child after Enter when portaled', async () => {
      const user = userEvent.setup()
      render(
        <Menu mode="horizontal">
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      trigger.focus()
      await user.keyboard('{Enter}')
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'Sub Item 1' })).toHaveFocus()
      })
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-controls')
    })

    it('ignores HTML strings as icons and skips a first letter for non-text children', () => {
      const { container } = render(
        <Menu collapsed>
          <MenuItem itemKey="xss" icon={'<img onerror="alert(1)" src="x" />'}>
            Safe
          </MenuItem>
          <MenuItem itemKey="obj">
            <span data-testid="node">Node</span>
          </MenuItem>
        </Menu>
      )

      expect(container.querySelector('img')).toBeNull()
      expect(container.innerHTML).not.toContain('onerror')
      expect(container.textContent).not.toContain('[')
    })
  })

  describe('Groups', () => {
    it('labels a group and keeps the wrapper out of the list', () => {
      render(
        <Menu>
          <MenuItemGroup title="Group Title">
            <MenuItem itemKey="1">Item 1</MenuItem>
          </MenuItemGroup>
        </Menu>
      )

      const title = screen.getByText('Group Title')
      expect(title.nextElementSibling).toHaveAttribute('aria-labelledby', title.id)
      expect(title.parentElement?.tagName).toBe('LI')
    })
  })

  describe('Accessibility', () => {
    it('passes axe on a filled tree', async () => {
      const { container } = render(
        <Menu searchable defaultSelectedKeys={['1']} defaultOpenKeys={['sub1']} aria-label="Site">
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2" disabled>
            Item 2
          </MenuItem>
          <MenuItemGroup title="More">
            <SubMenu itemKey="sub1" title="Submenu">
              <MenuItem itemKey="3">Sub Item 1</MenuItem>
            </SubMenu>
          </MenuItemGroup>
        </Menu>
      )

      await expectNoA11yViolations(container)
    })
  })
})
