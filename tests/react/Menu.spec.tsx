/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Menu, MenuItem, SubMenu } from '@tigercat/react'
import React from 'react'

describe('Menu', () => {
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
