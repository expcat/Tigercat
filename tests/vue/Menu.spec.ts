/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Menu, MenuItem, SubMenu } from '@tigercat/vue'

describe('Menu', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Menu, {
        slots: {
          default: () => [
            h(MenuItem, { itemKey: '1' }, () => 'Item 1'),
            h(MenuItem, { itemKey: '2' }, () => 'Item 2'),
          ],
        },
      })

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should render with vertical mode by default', () => {
      const { container } = render(Menu, {
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')],
        },
      })

      const menu = container.querySelector('ul')
      expect(menu).toHaveClass('flex-col')
    })

    it('should render with horizontal mode', () => {
      const { container } = render(Menu, {
        props: { mode: 'horizontal' },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')],
        },
      })

      const menu = container.querySelector('ul')
      expect(menu).toHaveClass('flex-row')
    })

    it('should render with dark theme', () => {
      const { container } = render(Menu, {
        props: { theme: 'dark' },
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')],
        },
      })

      const menu = container.querySelector('ul')
      expect(menu).toHaveClass('bg-gray-800')
    })
  })

  describe('MenuItem', () => {
    it('should render menu item with text', () => {
      render(Menu, {
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Test Item')],
        },
      })

      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })
  })

  describe('SubMenu', () => {
    it('should render submenu with title', () => {
      render(Menu, {
        slots: {
          default: () => [
            h(SubMenu, { itemKey: 'sub1', title: 'Submenu' }, () => [
              h(MenuItem, { itemKey: '1' }, () => 'Sub Item 1'),
            ]),
          ],
        },
      })

      expect(screen.getByText('Submenu')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      const { container } = render(Menu, {
        slots: {
          default: () => [h(MenuItem, { itemKey: '1' }, () => 'Item 1')],
        },
      })

      const menu = container.querySelector('ul')
      expect(menu).toHaveAttribute('role', 'menu')

      const menuItem = screen.getByText('Item 1').closest('li')
      expect(menuItem).toHaveAttribute('role', 'menuitem')
    })
  })
})
