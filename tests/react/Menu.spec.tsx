/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Menu, MenuItem, SubMenu, MenuItemGroup } from '@expcat/tigercat-react'
import React from 'react'
import { expectNoA11yViolations } from '../utils/a11y-helpers'

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
      expect(menu).toHaveClass('flex')
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
      expect(item2).toHaveClass('font-medium')
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

      render(
        <Menu selectedKeys={['1']} onSelect={onSelect}>
          <MenuItem itemKey="1">Item 1</MenuItem>
          <MenuItem itemKey="2">Item 2</MenuItem>
        </Menu>
      )

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      await user.click(item2)

      // Should call onSelect
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

      await expectNoA11yViolations(container)
    })
  })
})
