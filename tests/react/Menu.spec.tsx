/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Menu, MenuItem, SubMenu } from '@tigercat/react'
import React from 'react'

describe('Menu', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(
        <Menu>
          <MenuItem key="1">Item 1</MenuItem>
          <MenuItem key="2">Item 2</MenuItem>
        </Menu>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should render with vertical mode by default', () => {
      const { container } = render(
        <Menu>
          <MenuItem key="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      expect(menu).toHaveClass('flex-col')
    })

    it('should render with horizontal mode', () => {
      const { container } = render(
        <Menu mode="horizontal">
          <MenuItem key="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      expect(menu).toHaveClass('flex-row')
    })

    it('should render with dark theme', () => {
      const { container } = render(
        <Menu theme="dark">
          <MenuItem key="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      expect(menu).toHaveClass('bg-gray-800')
    })
  })

  describe('MenuItem', () => {
    it('should render menu item with text', () => {
      render(
        <Menu>
          <MenuItem key="1">Test Item</MenuItem>
        </Menu>
      )

      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })
  })

  describe('SubMenu', () => {
    it('should render submenu with title', () => {
      render(
        <Menu>
          <SubMenu key="sub1" title="Submenu">
            <MenuItem key="1">Sub Item 1</MenuItem>
          </SubMenu>
        </Menu>
      )

      expect(screen.getByText('Submenu')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      const { container } = render(
        <Menu>
          <MenuItem key="1">Item 1</MenuItem>
        </Menu>
      )

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('role', 'menu')

      const menuItem = screen.getByText('Item 1').closest('li')
      expect(menuItem).toHaveAttribute('role', 'menuitem')
    })
  })
})
