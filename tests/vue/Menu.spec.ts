/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { h } from 'vue'
import { Menu, MenuItem, SubMenu, MenuItemGroup } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils/a11y-helpers'

describe('Menu', () => {
  describe('Rendering', () => {
    it('renders items and basic roles', () => {
      const { container } = render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('role', 'menu')

      expect(screen.getByRole('menuitem', { name: 'Item 1' })).toBeInTheDocument()
    })

    it('renders in vertical mode by default', () => {
      const { container } = render(Menu, {
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('data-tiger-menu-mode', 'vertical')
    })

    it('renders in horizontal mode', () => {
      const { container } = render(Menu, {
        props: { mode: 'horizontal' },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('data-tiger-menu-mode', 'horizontal')
      expect(menu).toHaveClass('flex')
    })

    it('renders in inline mode', () => {
      const { container } = render(Menu, {
        props: { mode: 'inline' },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('data-tiger-menu-mode', 'inline')
    })

    it('renders with dark theme', () => {
      const { container } = render(Menu, {
        props: { theme: 'dark' },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      const menu = container.querySelector('ul')
      // Dark theme sets CSS variables for dark colors
      expect(menu?.className).toContain('[--tiger-surface:#111827]')
    })

    it('renders with light theme by default', () => {
      const { container } = render(Menu, {
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      const menu = container.querySelector('ul')
      // Light theme sets CSS variables for light colors
      expect(menu?.className).toContain('[--tiger-surface:#ffffff]')
    })
  })

  describe('Props', () => {
    it('respects defaultSelectedKeys prop', async () => {
      render(Menu, {
        props: { defaultSelectedKeys: ['2'] },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      await waitFor(() => {
        expect(item2).toHaveAttribute('tabindex', '0')
      })
      expect(item1).toHaveAttribute('tabindex', '-1')
      expect(item2).toHaveAttribute('data-tiger-selected', 'true')
    })

    it('respects controlled selectedKeys prop', async () => {
      render(Menu, {
        props: { selectedKeys: ['1'] },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      expect(item1).toHaveAttribute('data-tiger-selected', 'true')
    })

    it('respects defaultOpenKeys prop', () => {
      render(Menu, {
        props: { defaultOpenKeys: ['sub1'] },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('respects controlled openKeys prop', () => {
      render(Menu, {
        props: { openKeys: ['sub1'] },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('supports collapsed mode', () => {
      const { container } = render(Menu, {
        props: { collapsed: true },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      const menu = container.querySelector('ul')
      // Collapsed mode sets min-w-[64px] instead of w-16
      expect(menu?.className).toContain('min-w-[64px]')
    })

    it('supports custom inlineIndent', () => {
      render(Menu, {
        props: { mode: 'inline', inlineIndent: 32, defaultOpenKeys: ['sub1'] },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Item L1')
            ])
          ]
        }
      })

      const item = screen.getByRole('menuitem', { name: 'Item L1' })
      expect(item).toHaveStyle({ paddingLeft: '32px' })
    })
  })

  describe('Events', () => {
    it('emits update:selectedKeys when selecting an item', async () => {
      const { emitted } = render(Menu, {
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      await fireEvent.click(screen.getByRole('menuitem', { name: 'Item 1' }))

      expect(emitted()).toHaveProperty('update:selectedKeys')
      const updates = emitted()['update:selectedKeys'] as unknown as Array<[unknown]>
      expect(updates[0][0]).toEqual(['1'])
    })

    it('emits select event with key and info', async () => {
      const onSelect = vi.fn()

      render(Menu, {
        props: { onSelect },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      await fireEvent.click(screen.getByRole('menuitem', { name: 'Item 1' }))

      expect(onSelect).toHaveBeenCalledWith('1', { selectedKeys: ['1'] })
    })

    it('emits update:openKeys when toggling a submenu', async () => {
      const { emitted } = render(Menu, {
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      await fireEvent.click(trigger)

      expect(emitted()).toHaveProperty('update:openKeys')
      const updates = emitted()['update:openKeys'] as unknown as Array<[unknown]>
      expect(updates[0][0]).toEqual(['sub1'])
    })

    it('emits open-change event with key and info', async () => {
      const onOpenChange = vi.fn()

      render(Menu, {
        props: { 'onOpen-change': onOpenChange },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      await fireEvent.click(screen.getByRole('menuitem', { name: 'Submenu' }))

      expect(onOpenChange).toHaveBeenCalledWith('sub1', { openKeys: ['sub1'] })
    })

    it('does not emit events when clicking disabled item', async () => {
      const onSelect = vi.fn()

      render(Menu, {
        props: { onSelect },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1', disabled: true }, () => 'Disabled Item')]
        }
      })

      await fireEvent.click(screen.getByRole('menuitem', { name: 'Disabled Item' }))

      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard roving with arrow keys', async () => {
      render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2'),
            h(MenuItem, { itemKey: '3' }, () => 'Item 3')
          ]
        }
      })

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })
      const item3 = screen.getByRole('menuitem', { name: 'Item 3' })

      item1.focus()
      expect(item1).toHaveFocus()

      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      expect(item2).toHaveFocus()

      await fireEvent.keyDown(item2, { key: 'End' })
      expect(item3).toHaveFocus()

      await fireEvent.keyDown(item3, { key: 'Home' })
      expect(item1).toHaveFocus()
    })

    it('skips disabled items when moving focus', async () => {
      render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2', disabled: true }, () => 'Item 2'),
            h(MenuItem, { itemKey: '3' }, () => 'Item 3')
          ]
        }
      })

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item3 = screen.getByRole('menuitem', { name: 'Item 3' })

      item1.focus()
      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      expect(item3).toHaveFocus()
    })

    it('supports ArrowUp navigation', async () => {
      render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2'),
            h(MenuItem, { itemKey: '3' }, () => 'Item 3')
          ]
        }
      })

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item3 = screen.getByRole('menuitem', { name: 'Item 3' })

      item3.focus()
      await fireEvent.keyDown(item3, { key: 'ArrowUp' })

      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })
      expect(item2).toHaveFocus()

      await fireEvent.keyDown(item2, { key: 'ArrowUp' })
      expect(item1).toHaveFocus()
    })

    it('uses ArrowRight/ArrowLeft in horizontal mode', async () => {
      render(Menu, {
        props: { mode: 'horizontal' },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      item1.focus()
      await fireEvent.keyDown(item1, { key: 'ArrowRight' })
      expect(item2).toHaveFocus()

      await fireEvent.keyDown(item2, { key: 'ArrowLeft' })
      expect(item1).toHaveFocus()
    })

    it('selects item with Enter key', async () => {
      const onSelect = vi.fn()

      render(Menu, {
        props: { onSelect },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      const item = screen.getByRole('menuitem', { name: 'Item 1' })
      item.focus()
      await fireEvent.keyDown(item, { key: 'Enter' })

      expect(onSelect).toHaveBeenCalledWith('1', { selectedKeys: ['1'] })
    })

    it('selects item with Space key', async () => {
      const onSelect = vi.fn()

      render(Menu, {
        props: { onSelect },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      const item = screen.getByRole('menuitem', { name: 'Item 1' })
      item.focus()
      await fireEvent.keyDown(item, { key: ' ' })

      expect(onSelect).toHaveBeenCalledWith('1', { selectedKeys: ['1'] })
    })

    it('wraps focus at boundaries', async () => {
      render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      item2.focus()
      await fireEvent.keyDown(item2, { key: 'ArrowDown' })
      expect(item1).toHaveFocus()
    })
  })

  describe('SubMenu', () => {
    it('toggles expand/collapse on click', async () => {
      render(Menu, {
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('opens submenu with Enter key and focuses first child', async () => {
      render(Menu, {
        props: { defaultOpenKeys: [] },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1'),
              h(MenuItem, { itemKey: '2' }, () => 'Sub Item 2')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      trigger.focus()

      await fireEvent.keyDown(trigger, { key: 'Enter' })

      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await waitFor(() => {
        expect(
          screen.getByRole('menuitem', { name: 'Sub Item 1' })
        ).toHaveFocus()
      })
    })

    it('closes submenu with Escape key', async () => {
      render(Menu, {
        props: { defaultOpenKeys: ['sub1'] },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      trigger.focus()
      await fireEvent.keyDown(trigger, { key: 'Escape' })

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('has aria-haspopup attribute', () => {
      render(Menu, {
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    })

    it('disables entire submenu when disabled', async () => {
      const onOpenChange = vi.fn()

      render(Menu, {
        props: { 'onOpen-change': onOpenChange },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu', disabled: true }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-disabled', 'true')

      await fireEvent.click(trigger)
      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  describe('MenuItemGroup', () => {
    it('renders group with title', () => {
      render(Menu, {
        slots: {
          default: () => [
            h(MenuItemGroup, { title: 'Group Title' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
              h(MenuItem, { itemKey: '2' }, () => 'Item 2')
            ])
          ]
        }
      })

      expect(screen.getByText('Group Title')).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Item 1' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Item 2' })).toBeInTheDocument()
    })

    it('renders group items within role="group"', () => {
      const { container } = render(Menu, {
        slots: {
          default: () => [
            h(MenuItemGroup, { title: 'Group Title' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Item 1')
            ])
          ]
        }
      })

      const group = container.querySelector('[role="group"]')
      expect(group).toBeInTheDocument()
    })
  })

  describe('Indentation', () => {
    it('auto indents nested items in inline mode', () => {
      render(Menu, {
        props: { mode: 'inline', defaultOpenKeys: ['sub1', 'sub2'] },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Level 1' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Item L1'),
              h(SubMenu, { itemKey: 'sub2', title: 'Level 2' }, () => [
                h(MenuItem, { itemKey: '2' }, () => 'Item L2')
              ])
            ])
          ]
        }
      })

      const itemL1 = screen.getByRole('menuitem', { name: 'Item L1' })
      const itemL2 = screen.getByRole('menuitem', { name: 'Item L2' })

      expect(itemL1).toHaveStyle({ paddingLeft: '24px' })
      expect(itemL2).toHaveStyle({ paddingLeft: '48px' })
    })
  })

  describe('Tab Stop Management', () => {
    it('sets selected item as tab stop', async () => {
      render(Menu, {
        props: { defaultSelectedKeys: ['2'] },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
      const item2 = screen.getByRole('menuitem', { name: 'Item 2' })

      await waitFor(() => {
        expect(item2).toHaveAttribute('tabindex', '0')
      })
      expect(item1).toHaveAttribute('tabindex', '-1')
    })

    it('sets first item as tab stop when no selection', async () => {
      render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      await waitFor(() => {
        const item1 = screen.getByRole('menuitem', { name: 'Item 1' })
        expect(item1).toHaveAttribute('tabindex', '0')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      const { container } = render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      const menu = container.querySelector('[role="menu"]')
      expect(menu).toBeInTheDocument()

      const items = screen.getAllByRole('menuitem')
      expect(items).toHaveLength(2)
    })

    it('sets aria-disabled on disabled items', () => {
      render(Menu, {
        slots: {
          default: () => [h(MenuItem, { itemKey: '1', disabled: true }, () => 'Disabled Item')]
        }
      })

      const item = screen.getByRole('menuitem', { name: 'Disabled Item' })
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })

    it('sets aria-current on selected item', () => {
      render(Menu, {
        props: { defaultSelectedKeys: ['1'] },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')]
        }
      })

      const item = screen.getByRole('menuitem', { name: 'Item 1' })
      expect(item).toHaveAttribute('aria-current', 'page')
    })

    it('sets aria-expanded on submenu', () => {
      render(Menu, {
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('passes a11y audit', async () => {
      const { container } = render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2'),
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '3' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      await expectNoA11yViolations(container)
    })
  })
})
