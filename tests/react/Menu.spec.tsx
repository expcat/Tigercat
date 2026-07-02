/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Menu, MenuItem, SubMenu, MenuItemGroup } from '@expcat/tigercat-react'
import type { MenuItem as CoreMenuItem } from '@expcat/tigercat-core'
import React from 'react'
import { expectNoA11yViolationsIsolated } from '../utils/a11y-helpers'

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

describe('Menu', () => {
  describe('Rendering', () => {
    it('renders items and basic roles', () => {
      const { container } = render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('role', 'menu')

      expect(screen.getByRole('menuitem', { name: 'Item 1' })).toBeInTheDocument()
    })

    it('renders in vertical mode by default', () => {
      const { container } = render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('data-tiger-menu-mode', 'vertical')
    })

    it('renders in horizontal mode', () => {
      const { container } = render(
        <Menu mode="horizontal">
          <MenuItem itemKey="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('data-tiger-menu-mode', 'horizontal')
    })

    it('renders in inline mode', () => {
      const { container } = render(
        <Menu mode="inline">
          <MenuItem itemKey="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('data-tiger-menu-mode', 'inline')
    })

    it('renders with dark theme', () => {
      const { container } = render(
        <Menu theme="dark">
          <MenuItem itemKey="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      // Dark theme sets CSS variables for dark colors
      expect(menu?.className).toContain('[--tiger-surface:#111827]')
    })

    it('renders with light theme by default', () => {
      const { container } = render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      // Light theme sets CSS variables for light colors
      expect(menu?.className).toContain('[--tiger-surface:#ffffff]')
    })

    it('renders data-driven items', () => {
      render(<Menu items={dataItems} defaultOpenKeys={['admin']} />)

      expect(screen.getByRole('menuitem', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Administration' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Users' })).toBeInTheDocument()
    })

    it('filters data-driven items by search value while preserving matching ancestors', () => {
      render(<Menu items={dataItems} defaultSearchValue="roles" defaultOpenKeys={['admin']} />)

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Administration' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Roles' })).toBeInTheDocument()
      expect(screen.queryByText('Users')).not.toBeInTheDocument()
    })

    it('renders built-in search input and filters data-driven items', async () => {
      const user = userEvent.setup()
      const onSearch = vi.fn()

      render(<Menu items={dataItems} searchable onSearchChange={onSearch} />)

      await user.type(screen.getByRole('searchbox', { name: 'Search menu' }), 'settings')

      expect(onSearch).toHaveBeenLastCalledWith('settings')
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('shows empty text when data-driven search has no matches', () => {
      render(<Menu items={dataItems} defaultSearchValue="missing" emptyText="No matches" />)

      expect(screen.getByText('No matches')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('respects defaultSelectedKeys prop', async () => {
      render(
        <Menu defaultSelectedKeys={['2']}>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      await waitFor(() => {
        expect(item2).toHaveAttribute('tabindex', '0')
      })
      expect(item1).toHaveAttribute('tabindex', '-1')
      expect(item2).toHaveAttribute('data-tiger-selected', 'true')
    })

    it('respects controlled selectedKeys prop', () => {
      render(
        <Menu selectedKeys={['1']}>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      expect(item1).toHaveAttribute('data-tiger-selected', 'true')
    })

    it('respects defaultOpenKeys prop', () => {
      render(
        <Menu defaultOpenKeys={['sub1']}>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('data-state', 'open')
    })

    it('exposes data-state on a collapsed submenu trigger', () => {
      render(
        <Menu>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('data-state', 'closed')
    })

    it('respects controlled openKeys prop', () => {
      render(
        <Menu openKeys={['sub1']}>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('supports collapsed mode', () => {
      const { container } = render(
        <Menu collapsed>
          <MenuItem itemKey="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      // Collapsed mode sets min-w-[64px] instead of w-16
      expect(menu?.className).toContain('min-w-[64px]')
      expect(menu?.className).not.toContain('min-w-[200px]')
    })

    it('falls back to vertical popup behavior when an inline menu is collapsed', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <div className="overflow-hidden">
          <Menu mode="inline" collapsed popupPortal>
            <SubMenu itemKey="reports" title="Reports">
              <MenuItem itemKey="daily">Daily</MenuItem>
            </SubMenu>
          </Menu>
        </div>
      )

      const menu = container.querySelector('ul[data-tiger-menu-root="true"]')
      expect(menu).toHaveAttribute('data-tiger-menu-mode', 'vertical')
      expect(menu).toHaveAttribute('data-tiger-menu-requested-mode', 'inline')

      const trigger = screen.getAllByRole('menuitem')[0]
      const popup = document.body.querySelector('[data-tiger-submenu-popup]') as HTMLElement

      expect(popup).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-submenu-popup]')).not.toBe(popup)

      await user.hover(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(popup).not.toHaveAttribute('aria-hidden')
      expect(screen.getByRole('menuitem', { name: 'Daily' })).toBeInTheDocument()
    })

    it('supports custom inlineIndent', () => {
      render(
        <Menu mode="inline" inlineIndent={32} defaultOpenKeys={['sub1']}>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Item L1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const item = screen.getByRole('menuitem', { name: 'Item L1' })
      expect(item).toHaveStyle({ paddingLeft: '32px' })
    })
  })

  describe('Events', () => {
    it('supports uncontrolled selection and calls onSelect', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      render(
        <Menu defaultSelectedKeys={[]} onSelect={onSelect}>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })
      await user.click(item2)

      expect(onSelect).toHaveBeenCalledWith('2', { selectedKeys: ['2'] })
    })

    it('supports uncontrolled openKeys and calls onOpenChange', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      render(
        <Menu defaultOpenKeys={[]} onOpenChange={onOpenChange}>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(onOpenChange).toHaveBeenCalledWith('sub1', { openKeys: ['sub1'] })
    })

    it('does not call onSelect when clicking disabled item', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      render(
        <Menu onSelect={onSelect}>
          <MenuItem itemKey="1" disabled>
            Disabled Item
          </MenuItem>
        </Menu>
      )

      const item = screen.getByRole('menuitem', { name: 'Disabled Item' })
      await user.click(item)

      expect(onSelect).not.toHaveBeenCalled()
    })

    it('controlled mode does not change internal state', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      const onSelectedKeysChange = vi.fn()

      render(
        <Menu selectedKeys={['1']} onSelectedKeysChange={onSelectedKeysChange} onSelect={onSelect}>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      await user.click(item2)

      // Should call onSelect
      expect(onSelectedKeysChange).toHaveBeenCalledWith(['2'])
      expect(onSelect).toHaveBeenCalledWith('2', { selectedKeys: ['2'] })

      // But the selection shouldn't change visually because it's controlled
      expect(item1).toHaveAttribute('data-tiger-selected', 'true')
      expect(item2).toHaveAttribute('data-tiger-selected', 'false')
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard roving with arrow keys', async () => {
      const user = userEvent.setup()

      render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
          <MenuItem itemKey="3">Item 3</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })
      const item3 = screen.getByRole('menuitem', { name: 'Item 3' })

      item1.focus()
      expect(item1).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(item2).toHaveFocus()

      await user.keyboard('{End}')
      expect(item3).toHaveFocus()

      await user.keyboard('{Home}')
      expect(item1).toHaveFocus()
    })

    it('skips disabled items when moving focus', async () => {
      const user = userEvent.setup()

      render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2" disabled>
            Item 2
          </MenuItem>
          <MenuItem itemKey="3">Item 3</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item3 = screen.getByRole('menuitem', { name: 'Item 3' })

      item1.focus()
      await user.keyboard('{ArrowDown}')
      expect(item3).toHaveFocus()
    })

    it('supports ArrowUp navigation', async () => {
      const user = userEvent.setup()

      render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
          <MenuItem itemKey="3">Item 3</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })
      const item3 = screen.getByRole('menuitem', { name: 'Item 3' })

      item3.focus()
      await user.keyboard('{ArrowUp}')
      expect(item2).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(item1).toHaveFocus()
    })

    it('uses ArrowRight/ArrowLeft in horizontal mode', async () => {
      const user = userEvent.setup()

      render(
        <Menu mode="horizontal">
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      item1.focus()
      await user.keyboard('{ArrowRight}')
      expect(item2).toHaveFocus()

      await user.keyboard('{ArrowLeft}')
      expect(item1).toHaveFocus()
    })

    it('selects item with Enter key', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      render(
        <Menu onSelect={onSelect}>
          <MenuItem itemKey="1">Item 1</MenuItem>
        </Menu>
      )

      const item = screen.getByRole('menuitem', { name: 'Item 1' })
      item.focus()
      await user.keyboard('{Enter}')

      expect(onSelect).toHaveBeenCalledWith('1', { selectedKeys: ['1'] })
    })

    it('selects item with Space key', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      render(
        <Menu onSelect={onSelect}>
          <MenuItem itemKey="1">Item 1</MenuItem>
        </Menu>
      )

      const item = screen.getByRole('menuitem', { name: 'Item 1' })
      item.focus()
      await user.keyboard(' ')

      expect(onSelect).toHaveBeenCalledWith('1', { selectedKeys: ['1'] })
    })

    it('wraps focus at boundaries', async () => {
      const user = userEvent.setup()

      render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      item2.focus()
      await user.keyboard('{ArrowDown}')
      expect(item1).toHaveFocus()
    })
  })

  describe('SubMenu', () => {
    it('toggles expand/collapse on click', async () => {
      const user = userEvent.setup()

      render(
        <Menu defaultOpenKeys={[]}>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('opens submenu with Enter and focuses first child', async () => {
      const user = userEvent.setup()

      render(
        <Menu defaultOpenKeys={[]}>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
            <MenuItem itemKey="2">Sub Item 2</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      trigger.focus()
      expect(trigger).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      expect(screen.getByRole('menuitem', { name: 'Sub Item 1' })).toHaveFocus()
    })

    it('closes submenu with Escape key', async () => {
      const user = userEvent.setup()

      render(
        <Menu defaultOpenKeys={['sub1']}>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      trigger.focus()
      await user.keyboard('{Escape}')

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('has aria-haspopup attribute', () => {
      render(
        <Menu>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    })

    it('disables entire submenu when disabled', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      render(
        <Menu onOpenChange={onOpenChange}>
          <SubMenu itemKey="sub1" title="Submenu" disabled>
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-disabled', 'true')

      await user.click(trigger)
      expect(onOpenChange).not.toHaveBeenCalled()
    })
    it('closes other submenus when multiple is false', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      const onOpenKeysChange = vi.fn()

      render(
        <Menu
          multiple={false}
          defaultOpenKeys={['sub1']}
          onOpenKeysChange={onOpenKeysChange}
          onOpenChange={onOpenChange}>
          <SubMenu itemKey="sub1" title="Submenu 1">
            <MenuItem itemKey="1">Item 1</MenuItem>
          </SubMenu>
          <SubMenu itemKey="sub2" title="Submenu 2">
            <MenuItem itemKey="2">Item 2</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger1 = screen.getByRole('menuitem', { name: 'Submenu 1' })
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')

      const trigger2 = screen.getByRole('menuitem', { name: 'Submenu 2' })
      await user.click(trigger2)

      expect(onOpenKeysChange).toHaveBeenCalledWith(['sub2'])
      expect(onOpenChange).toHaveBeenCalledWith('sub2', { openKeys: ['sub2'] })
      expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      expect(trigger2).toHaveAttribute('aria-expanded', 'true')
    })

    it('uses height transition wrapper for inline submenu motion', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Menu mode="inline">
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      await user.click(screen.getByRole('menuitem', { name: 'Submenu' }))

      const wrapper = container.querySelector('[data-tiger-submenu-motion="height"]')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper?.className).toContain('transition-[height,opacity]')
      expect(wrapper?.className).not.toContain('grid-rows')
    })
  })

  describe('MenuItemGroup', () => {
    it('renders group with title', () => {
      render(
        <Menu>
          <MenuItemGroup title="Group Title">
            <MenuItem itemKey="1">Item 1</MenuItem>
            <MenuItem itemKey="2">Item 2</MenuItem>
          </MenuItemGroup>
        </Menu>
      )

      expect(screen.getByText('Group Title')).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Item 1' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Item 2' })).toBeInTheDocument()
    })

    it('renders group items within role="group"', () => {
      const { container } = render(
        <Menu>
          <MenuItemGroup title="Group Title">
            <MenuItem itemKey="1">Item 1</MenuItem>
          </MenuItemGroup>
        </Menu>
      )

      const group = container.querySelector('[role="group"]')
      expect(group).toBeInTheDocument()
    })
  })

  describe('Indentation', () => {
    it('auto indents nested items in inline mode', () => {
      render(
        <Menu mode="inline" defaultOpenKeys={['sub1', 'sub2']}>
          <SubMenu itemKey="sub1" title="Level 1">
            <MenuItem itemKey="1">Item L1</MenuItem>
            <SubMenu itemKey="sub2" title="Level 2">
              <MenuItem itemKey="2">Item L2</MenuItem>
            </SubMenu>
          </SubMenu>
        </Menu>
      )

      const itemL1 = screen.getByRole('menuitem', { name: 'Item L1' })
      const itemL2 = screen.getByRole('menuitem', { name: 'Item L2' })

      expect(itemL1).toHaveStyle({ paddingLeft: '24px' })
      expect(itemL2).toHaveStyle({ paddingLeft: '48px' })
    })
  })

  describe('Tab Stop Management', () => {
    it('sets selected item as tab stop', async () => {
      render(
        <Menu defaultSelectedKeys={['2']}>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      await waitFor(() => {
        expect(item2).toHaveAttribute('tabindex', '0')
      })
      expect(item1).toHaveAttribute('tabindex', '-1')
    })

    it('sets first item as tab stop when no selection', async () => {
      render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      await waitFor(() => {
        const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
        expect(item1).toHaveAttribute('tabindex', '0')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      const { container } = render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('[role="menu"]')
      expect(menu).toBeInTheDocument()

      const items = screen.getAllByRole('menuitem')
      expect(items).toHaveLength(2)
    })

    it('sets aria-disabled on disabled items', () => {
      render(
        <Menu>
          <MenuItem itemKey="1" disabled>
            Disabled Item
          </MenuItem>
        </Menu>
      )

      const item = screen.getByRole('menuitem', { name: 'Disabled Item' })
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })

    it('sets aria-current on selected item', () => {
      render(
        <Menu defaultSelectedKeys={['1']}>
          <MenuItem itemKey="1">Item 1</MenuItem>
        </Menu>
      )

      const item = screen.getByRole('menuitem', { name: 'Item 1' })
      expect(item).toHaveAttribute('aria-current', 'page')
    })

    it('sets aria-expanded on submenu', () => {
      render(
        <Menu>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('passes a11y audit', async () => {
      const { container } = render(
        <Menu>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="3">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('warns for child components rendered outside Menu context', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { rerender } = render(<MenuItem itemKey="orphan">Orphan item</MenuItem>)
      expect(screen.getByRole('menuitem', { name: 'Orphan item' })).toBeInTheDocument()
      expect(warn).toHaveBeenCalledWith('MenuItem must be used within Menu component')

      rerender(
        <SubMenu itemKey="orphan-sub" title="Orphan submenu">
          <MenuItem itemKey="child">Child</MenuItem>
        </SubMenu>
      )
      expect(warn).toHaveBeenCalledWith('SubMenu must be used within Menu component')
      expect(screen.queryByRole('menuitem', { name: 'Orphan submenu' })).not.toBeInTheDocument()

      warn.mockRestore()
    })

    it('renders collapsed item labels and icon-only items', () => {
      const icon = '<svg aria-hidden="true"><path d="M0 0h1v1H0z" /></svg>'
      render(
        <Menu collapsed>
          <MenuItem itemKey="alpha">alpha</MenuItem>
          <MenuItem itemKey="icon" icon={icon}>
            Icon label
          </MenuItem>
          <SubMenu itemKey="reports" title="reports">
            <MenuItem itemKey="daily">Daily</MenuItem>
          </SubMenu>
          <SubMenu itemKey="settings" title="Settings" icon={<span data-testid="settings-icon" />}>
            <MenuItem itemKey="profile">Profile</MenuItem>
          </SubMenu>
        </Menu>
      )

      // First-letter fallbacks stay visible but the accessible name is the full label
      const alphaItem = screen.getByRole('menuitem', { name: 'alpha' })
      expect(alphaItem).toBeInTheDocument()
      expect(alphaItem.querySelector('[aria-hidden="true"]')).toHaveTextContent('A')
      // Collapsed submenu triggers keep the expand arrow hidden
      const reportsTrigger = screen.getByRole('menuitem', { name: 'reports' })
      expect(reportsTrigger).toBeInTheDocument()
      expect(reportsTrigger.querySelector('svg')).toBeNull()
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
      // Icon items keep the full label in the DOM as sr-only
      const iconItem = screen.getByRole('menuitem', { name: 'Icon label' })
      const srLabel = screen.getByText('Icon label')
      expect(srLabel).toHaveClass('sr-only')
      expect(iconItem).toContainElement(srLabel)
      expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument()
    })

    it('opens horizontal submenu as a popup on hover and keyboard', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Menu mode="horizontal">
          <SubMenu itemKey="sub1" title="Submenu">
            text child
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
          <MenuItem itemKey="2">Peer</MenuItem>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      const popup = container.querySelector('ul[aria-hidden="true"]') as HTMLElement
      expect(popup).toBeInTheDocument()

      await user.hover(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(popup).not.toHaveAttribute('aria-hidden')

      await user.unhover(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      trigger.focus()
      await user.keyboard('{Enter}')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await user.keyboard('{Escape}')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('can render popup submenus through a body portal', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Menu mode="horizontal" popupPortal>
          <SubMenu itemKey="sub1" title="Submenu">
            <MenuItem itemKey="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      const popup = document.body.querySelector('[data-tiger-submenu-popup]') as HTMLElement

      expect(popup).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-submenu-popup]')).not.toBe(popup)

      await user.hover(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(popup).not.toHaveAttribute('aria-hidden')

      trigger.focus()
      await user.keyboard('{Escape}')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('keeps non-menu children in groups unchanged', () => {
      const { container } = render(
        <Menu>
          <MenuItemGroup>
            plain text
            <span data-testid="custom-child">Custom child</span>
            <MenuItem itemKey="1">Item 1</MenuItem>
          </MenuItemGroup>
        </Menu>
      )

      expect(screen.getByTestId('custom-child')).toHaveTextContent('Custom child')
      expect(container.querySelector('[role="group"]')).toHaveTextContent('plain text')
    })
  })
})
