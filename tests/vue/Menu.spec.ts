/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { waitFor } from '@testing-library/vue'
import { h } from 'vue'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-vue'

describe('Menu', () => {
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
})
