/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { h } from 'vue'
import { Menu, MenuItem, SubMenu, MenuItemGroup } from '@expcat/tigercat-vue'
import type { MenuItem as CoreMenuItem } from '@expcat/tigercat-core'
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
    it('renders data-driven items', () => {
      render(Menu, {
        props: { items: dataItems, defaultOpenKeys: ['admin'] }
      })

      expect(screen.getByRole('menuitem', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Administration' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Users' })).toBeInTheDocument()
    })

    it('filters data-driven items by search value while preserving matching ancestors', () => {
      render(Menu, {
        props: { items: dataItems, defaultSearchValue: 'roles', defaultOpenKeys: ['admin'] }
      })

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Administration' })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Roles' })).toBeInTheDocument()
      expect(screen.queryByText('Users')).not.toBeInTheDocument()
    })

    it('renders built-in search input and filters data-driven items', async () => {
      const onSearch = vi.fn()
      const { emitted } = render(Menu, {
        props: { items: dataItems, searchable: true, onSearch }
      })

      await fireEvent.update(screen.getByRole('searchbox', { name: 'Search menu' }), 'settings')

      expect(onSearch).toHaveBeenCalledWith('settings')
      expect(emitted()['update:searchValue'][0]).toEqual(['settings'])
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('shows empty text when data-driven search has no matches', () => {
      render(Menu, {
        props: { items: dataItems, defaultSearchValue: 'missing', emptyText: 'No matches' }
      })

      expect(screen.getByText('No matches')).toBeInTheDocument()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
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
      expect(trigger).toHaveAttribute('data-state', 'open')
    })

    it('exposes data-state on a collapsed submenu trigger', () => {
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
      expect(trigger).toHaveAttribute('data-state', 'closed')
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
      expect(menu?.className).not.toContain('min-w-[200px]')
    })

    it('falls back to vertical popup behavior when an inline menu is collapsed', async () => {
      const { container } = render(Menu, {
        props: { mode: 'inline', collapsed: true, popupPortal: true },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'reports', title: 'Reports' }, () => [
              h(MenuItem, { itemKey: 'daily' }, () => 'Daily')
            ])
          ]
        }
      })

      const menu = container.querySelector('ul[data-tiger-menu-root="true"]')
      expect(menu).toHaveAttribute('data-tiger-menu-mode', 'vertical')
      expect(menu).toHaveAttribute('data-tiger-menu-requested-mode', 'inline')

      const trigger = screen.getAllByRole('menuitem')[0]
      const popup = document.body.querySelector('[data-tiger-submenu-popup]') as HTMLElement

      expect(popup).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-submenu-popup]')).not.toBe(popup)

      await fireEvent.mouseEnter(trigger.parentElement as HTMLElement)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(popup).not.toHaveAttribute('aria-hidden')
      expect(screen.getByRole('menuitem', { name: 'Daily' })).toBeInTheDocument()
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
        expect(screen.getByRole('menuitem', { name: 'Sub Item 1' })).toHaveFocus()
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
    it('closes other submenus when multiple is false', async () => {
      const { emitted } = render(Menu, {
        props: { multiple: false, defaultOpenKeys: ['sub1'] },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu 1' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Item 1')
            ]),
            h(SubMenu, { itemKey: 'sub2', title: 'Submenu 2' }, () => [
              h(MenuItem, { itemKey: '2' }, () => 'Item 2')
            ])
          ]
        }
      })

      const trigger1 = screen.getByRole('menuitem', { name: 'Submenu 1' })
      expect(trigger1).toHaveAttribute('aria-expanded', 'true')

      const trigger2 = screen.getByRole('menuitem', { name: 'Submenu 2' })
      await fireEvent.click(trigger2)

      const updates = emitted()['update:openKeys'] as unknown as Array<[unknown]>
      expect(updates[0][0]).toEqual(['sub2'])
    })

    it('uses height transition wrapper for inline submenu motion', async () => {
      const { container } = render(Menu, {
        props: { mode: 'inline' },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      await fireEvent.click(screen.getByRole('menuitem', { name: 'Submenu' }))

      const wrapper = container.querySelector('[data-tiger-submenu-motion="height"]')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper?.className).toContain('transition-[height,opacity]')
      expect(wrapper?.className).not.toContain('grid-rows')
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

      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('warns for child components rendered outside Menu context', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { rerender } = render(MenuItem, {
        props: { itemKey: 'orphan' },
        slots: { default: () => 'Orphan item' }
      })
      expect(screen.getByRole('menuitem', { name: 'Orphan item' })).toBeInTheDocument()
      expect(warn).toHaveBeenCalledWith('MenuItem must be used within Menu component')

      rerender({ itemKey: 'orphan-sub', title: 'Orphan submenu' })
      render(SubMenu, {
        props: { itemKey: 'orphan-sub', title: 'Orphan submenu' },
        slots: { default: () => [h(MenuItem, { itemKey: 'child' }, () => 'Child')] }
      })
      expect(warn).toHaveBeenCalledWith('SubMenu must be used within Menu component')
      expect(screen.queryByRole('menuitem', { name: 'Orphan submenu' })).not.toBeInTheDocument()

      warn.mockRestore()
    })

    it('renders collapsed item labels and icon-only items', () => {
      const icon = '<svg aria-hidden="true"><path d="M0 0h1v1H0z" /></svg>'
      render(Menu, {
        props: { collapsed: true },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: 'alpha' }, () => 'alpha'),
            h(MenuItem, { itemKey: 'icon', icon }, () => 'Icon label'),
            h(SubMenu, { itemKey: 'reports', title: 'reports' }, () => [
              h(MenuItem, { itemKey: 'daily' }, () => 'Daily')
            ]),
            h(
              SubMenu,
              {
                itemKey: 'settings',
                title: 'Settings',
                icon: h('span', { 'data-testid': 'settings-icon' })
              },
              () => [h(MenuItem, { itemKey: 'profile' }, () => 'Profile')]
            )
          ]
        }
      })

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
      const { container } = render(Menu, {
        props: { mode: 'horizontal' },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              'text child',
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ]),
            h(MenuItem, { itemKey: '2' }, () => 'Peer')
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      const popup = container.querySelector('ul[aria-hidden="true"]') as HTMLElement
      expect(popup).toBeInTheDocument()

      await fireEvent.mouseEnter(trigger.parentElement as HTMLElement)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(popup).not.toHaveAttribute('aria-hidden')

      await fireEvent.mouseLeave(trigger.parentElement as HTMLElement)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      trigger.focus()
      await fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      await fireEvent.keyDown(trigger, { key: 'Escape' })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('can render popup submenus through a body teleport', async () => {
      const { container } = render(Menu, {
        props: { mode: 'horizontal', popupPortal: true },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1')
            ])
          ]
        }
      })

      const trigger = screen.getByRole('menuitem', { name: 'Submenu' })
      const popup = document.body.querySelector('[data-tiger-submenu-popup]') as HTMLElement

      expect(popup).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-submenu-popup]')).not.toBe(popup)

      await fireEvent.mouseEnter(trigger.parentElement as HTMLElement)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(popup).not.toHaveAttribute('aria-hidden')

      trigger.focus()
      await fireEvent.keyDown(trigger, { key: 'Escape' })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('keeps non-menu children in groups unchanged', () => {
      const { container } = render(Menu, {
        slots: {
          default: () => [
            h(MenuItemGroup, null, () => [
              'plain text',
              h('span', { 'data-testid': 'custom-child' }, 'Custom child'),
              h(MenuItem, { itemKey: '1' }, () => 'Item 1')
            ])
          ]
        }
      })

      expect(screen.getByTestId('custom-child')).toHaveTextContent('Custom child')
      expect(container.querySelector('[role="group"]')).toHaveTextContent('plain text')
    })
  })
})
