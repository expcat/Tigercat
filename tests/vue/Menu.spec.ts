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

function enabledTabStops(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-tiger-menuitem="true"]')).filter(
    (el) =>
      el.getAttribute('tabindex') === '0' &&
      el.getAttribute('aria-disabled') !== 'true' &&
      !(el instanceof HTMLButtonElement && el.disabled)
  )
}

describe('Menu', () => {
  describe('Rendering', () => {
    it('renders a named vertical menu with one tab stop', () => {
      const { container } = render(Menu, {
        attrs: { 'aria-label': 'Site' },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2')
          ]
        }
      })

      expect(screen.getByRole('menu', { name: 'Site' })).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-menu-root]')).toHaveAttribute('role', 'menu')
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

      expect(screen.getByRole('menuitem', { name: 'Home' })).toHaveAttribute('href', '/home')
      expect(screen.getByText('Team')).toBeInTheDocument()
      expect(getItem('Users')).toBeInTheDocument()
    })

    it('prefers items over default content, including an empty array', async () => {
      const { rerender } = render(Menu, {
        props: { items: [{ key: 'data', label: 'Data item' }] },
        slots: { default: () => h(MenuItem, { itemKey: 'slot' }, () => 'Slot item') }
      })

      expect(getItem('Data item')).toBeInTheDocument()
      expect(screen.queryByText('Slot item')).not.toBeInTheDocument()

      await rerender({ items: [] })
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()

      await rerender({ items: undefined })
      expect(getItem('Slot item')).toBeInTheDocument()
    })

    it('preserves inline indentation through nested groups', () => {
      render(Menu, {
        props: { mode: 'inline', defaultOpenKeys: ['section'] },
        slots: {
          default: () =>
            h(SubMenu, { itemKey: 'section', title: 'Section' }, () =>
              h(MenuItemGroup, { title: 'Outer' }, () =>
                h(MenuItemGroup, { title: 'Inner' }, () =>
                  h(MenuItem, { itemKey: 'leaf' }, () => 'Leaf')
                )
              )
            )
        }
      })

      expect(screen.getByText('Inner')).toHaveStyle({ paddingInlineStart: '24px' })
      expect(getItem('Leaf')).toHaveStyle({ paddingInlineStart: '24px' })
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

    it('hides search when collapsed even if searchable is true', () => {
      render(Menu, {
        attrs: { 'aria-label': 'Site' },
        props: { items: dataItems, searchable: true, collapsed: true }
      })
      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    })

    it('keeps collapsed text-only glyphs inside a fixed rail', () => {
      const { container } = render(Menu, {
        attrs: { 'aria-label': 'Site' },
        props: {
          collapsed: true,
          items: [
            { key: 'dashboard', label: '仪表盘' },
            {
              key: 'team',
              label: '团队',
              children: [{ key: 'members', label: '成员' }]
            }
          ]
        }
      })
      const menu = container.querySelector('[data-tiger-menu]')
      expect(menu?.className).toContain('w-[64px]')
      const glyphs = container.querySelectorAll('[data-tiger-menu-collapsed-glyph]')
      expect(Array.from(glyphs).map((node) => node.textContent)).toEqual(['仪', '团'])
      for (const glyph of glyphs) {
        expect(glyph.className).not.toContain('flex-1')
      }
      const title = container.querySelector('[data-tiger-submenu-title]')
      expect(title?.className).toContain('justify-center')
      expect(title?.className).not.toContain('justify-between')
      expect(container.querySelector('.tiger-tooltip')?.className).toContain('w-full')
    })
  })

  describe('Selection', () => {
    it('composes caller click and keydown with selection and arrow navigation', async () => {
      const order: string[] = []
      const onClick = vi.fn(() => order.push('click'))
      const onKeydown = vi.fn((event: KeyboardEvent) => {
        expect(event.defaultPrevented).toBe(false)
      })
      const onSelect = vi.fn(() => order.push('select'))
      render(Menu, {
        attrs: { onSelect },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: 'a', onClick, onKeydown }, () => 'Alpha'),
            h(MenuItem, { itemKey: 'b' }, () => 'Beta')
          ]
        }
      })

      const alpha = getItem('Alpha')
      await fireEvent.click(alpha)
      expect(onClick).toHaveBeenCalledTimes(1)
      expect.soft(onSelect).toHaveBeenCalledTimes(1)
      expect.soft(order).toEqual(['click', 'select'])
      expect.soft(alpha).toHaveAttribute('data-tiger-selected', 'true')

      alpha.focus()
      await fireEvent.keyDown(alpha, { key: 'ArrowDown' })
      expect(onKeydown).toHaveBeenCalledTimes(1)
      expect(getItem('Beta')).toHaveFocus()
    })

    it('honors caller preventDefault and disabled items before internal actions', async () => {
      const onSelect = vi.fn()
      const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
      const onKeydown = vi.fn((event: KeyboardEvent) => event.preventDefault())
      render(Menu, {
        attrs: { onSelect },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: 'a', onClick, onKeydown }, () => 'Alpha'),
            h(MenuItem, { itemKey: 'b', disabled: true }, () => 'Beta')
          ]
        }
      })

      const alpha = getItem('Alpha')
      alpha.focus()
      await fireEvent.click(alpha)
      await fireEvent.keyDown(alpha, { key: 'ArrowDown' })
      await fireEvent.click(getItem('Beta'))
      await fireEvent.keyDown(getItem('Beta'), { key: 'b' })
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onKeydown).toHaveBeenCalledTimes(1)
      expect(onSelect).not.toHaveBeenCalled()
      expect(alpha).toHaveFocus()
      expect(alpha).toHaveAttribute('data-tiger-selected', 'false')
    })

    it('keeps 1 and "1" distinct and a second click stays selected', async () => {
      const { emitted } = render(Menu, {
        props: { defaultSelectedKeys: ['1'] },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'One'),
            h(MenuItem, { itemKey: '2' }, () => 'Two')
          ]
        }
      })

      expect(getItem('One')).toHaveAttribute('data-tiger-selected', 'true')
      await fireEvent.click(getItem('One'))
      expect(emitted().select?.[0]?.[1]).toEqual({ selectedKeys: ['1'] })
    })
  })

  describe('Keyboard', () => {
    it('keeps typeahead out of a closed inline submenu', async () => {
      render(Menu, {
        props: { mode: 'inline', defaultOpenKeys: ['sub'] },
        slots: {
          default: () => [
            h(MenuItem, { itemKey: 'a' }, () => 'Alpha'),
            h(SubMenu, { itemKey: 'sub', title: 'Submenu' }, () =>
              h(MenuItem, { itemKey: 'b' }, () => 'Beta')
            )
          ]
        }
      })

      const beta = getItem('Beta')
      await fireEvent.click(getItem('Submenu'))
      expect(getItem('Submenu')).toHaveAttribute('aria-expanded', 'false')
      expect(beta.closest('[data-tiger-menu-hidden="true"]')).not.toBeNull()
      const alpha = getItem('Alpha')
      alpha.focus()
      await fireEvent.keyDown(alpha, { key: 'b' })
      expect(alpha).toHaveFocus()
    })

    it('moves the roving tab stop with a typeahead match', async () => {
      render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: 'a' }, () => 'Alpha'),
            h(MenuItem, { itemKey: 'b' }, () => 'Beta')
          ]
        }
      })

      const alpha = getItem('Alpha')
      const beta = getItem('Beta')
      alpha.focus()
      await fireEvent.keyDown(alpha, { key: 'b' })
      expect(beta).toHaveFocus()
      expect([alpha, beta].map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0'])
    })

    it('moves between vertical items with arrows and keeps one tab stop', async () => {
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
      expect(item2).toHaveAttribute('tabindex', '-1')
      item1.focus()
      await fireEvent.keyDown(item1, { key: 'ArrowDown' })
      expect(item2).toHaveFocus()
      expect(item2).toHaveAttribute('tabindex', '0')
      expect(item1).toHaveAttribute('tabindex', '-1')
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

    it('keeps one enabled tab stop when items are only a group or the first item is disabled', () => {
      const grouped = render(Menu, {
        props: {
          items: [
            {
              type: 'group',
              title: 'Group',
              children: [
                { key: 'a', label: 'Alpha' },
                { key: 'b', label: 'Beta' }
              ]
            }
          ]
        }
      })
      expect(enabledTabStops(grouped.container)).toHaveLength(1)
      grouped.unmount()

      const disabledFirst = render(Menu, {
        props: {
          items: [
            { key: 'a', label: 'Alpha', disabled: true },
            { key: 'b', label: 'Beta' }
          ]
        }
      })
      expect(enabledTabStops(disabledFirst.container)).toHaveLength(1)
      const beta = Array.from(
        disabledFirst.container.querySelectorAll<HTMLElement>('[data-tiger-menuitem="true"]')
      ).find((el) => el.textContent?.includes('Beta'))
      expect(beta).toHaveAttribute('tabindex', '0')
    })
  })

  describe('SubMenu', () => {
    it('composes caller click and keydown with submenu opening and child focus', async () => {
      const onClick = vi.fn()
      const onKeydown = vi.fn((event: KeyboardEvent) => {
        expect(event.defaultPrevented).toBe(false)
      })
      render(Menu, {
        props: { mode: 'inline' },
        slots: {
          default: () =>
            h(SubMenu, { itemKey: 'sub', title: 'Submenu', onClick, onKeydown }, () =>
              h(MenuItem, { itemKey: 'child' }, () => 'Child')
            )
        }
      })

      const trigger = getItem('Submenu')
      await fireEvent.click(trigger)
      expect(onClick).toHaveBeenCalledTimes(1)
      expect.soft(trigger).toHaveAttribute('aria-expanded', 'true')
      trigger.focus()
      await fireEvent.keyDown(trigger, { key: 'ArrowRight' })
      expect(onKeydown).toHaveBeenCalledTimes(1)
      await waitFor(() => expect(getItem('Child')).toHaveFocus())
    })

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
      await fireEvent.pointerEnter(trigger.parentElement!, { pointerType: 'touch' })
      await fireEvent.mouseEnter(trigger.parentElement!)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      await fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await fireEvent.pointerEnter(trigger.parentElement!, { pointerType: 'mouse' })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('keeps one inline submenu open at a time when openMultiple is false', async () => {
      render(Menu, {
        props: { mode: 'inline', openMultiple: false, defaultOpenKeys: ['a'] },
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'a', title: 'Alpha' }, () =>
              h(MenuItem, { itemKey: 'a1' }, () => 'Alpha Item')
            ),
            h(SubMenu, { itemKey: 'b', title: 'Beta' }, () =>
              h(MenuItem, { itemKey: 'b1' }, () => 'Beta Item')
            )
          ]
        }
      })

      expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )

      await fireEvent.click(screen.getByRole('menuitem', { name: 'Beta' }))
      expect(screen.getByRole('menuitem', { name: 'Beta' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
      expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveAttribute(
        'aria-expanded',
        'false'
      )
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
      await fireEvent.pointerEnter(trigger.parentElement!, { pointerType: 'mouse' })
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
