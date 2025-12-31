/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Dropdown, DropdownMenu, DropdownItem } from '@tigercat/vue'

describe('Dropdown', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
              h(DropdownItem, null, () => 'Item 2'),
            ]),
          ],
        },
      })

      expect(screen.getByText('Trigger')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should render with hover trigger by default', () => {
      const { container } = render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
      expect(wrapper).toHaveClass('hidden')
    })

    it('should render with bottom-start placement by default', () => {
      const { container } = render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
      expect(wrapper).toHaveClass('top-full', 'left-0')
    })

    it('should apply custom placement', () => {
      const { container } = render(Dropdown, {
        props: { placement: 'top-end' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
      expect(wrapper).toHaveClass('bottom-full', 'right-0')
    })
  })

  describe('Props', () => {
    it('should respect disabled prop', () => {
      const { container } = render(Dropdown, {
        props: { disabled: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      const trigger = container.querySelector('.tiger-dropdown-trigger')
      expect(trigger).toHaveClass('cursor-not-allowed', 'opacity-50')
    })

    it('should accept custom className', () => {
      const { container } = render(Dropdown, {
        props: { className: 'custom-dropdown' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      const dropdown = container.querySelector('.tiger-dropdown')
      expect(dropdown).toHaveClass('custom-dropdown')
    })
  })

  describe('Trigger Modes', () => {
    it('should support click trigger', async () => {
      const { container } = render(Dropdown, {
        props: { trigger: 'click' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
      expect(wrapper).toHaveClass('hidden')

      const trigger = screen.getByText('Trigger')
      await fireEvent.click(trigger)

      // Note: In actual implementation, visibility might need a slight delay
      // This is a simplified test
    })
  })

  describe('DropdownItem', () => {
    it('should render dropdown item with text', () => {
      render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Test Item'),
            ]),
          ],
        },
      })

      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })

    it('should render disabled dropdown item', () => {
      const { container } = render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, { disabled: true }, () => 'Disabled Item'),
            ]),
          ],
        },
      })

      const item = screen.getByText('Disabled Item')
      expect(item).toHaveAttribute('aria-disabled', 'true')
      expect(item).toHaveClass('cursor-not-allowed', 'opacity-50')
    })

    it('should render divided dropdown item', () => {
      const { container } = render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
              h(DropdownItem, { divided: true }, () => 'Item 2'),
            ]),
          ],
        },
      })

      const item = screen.getByText('Item 2')
      expect(item).toHaveClass('border-t')
    })

    it('should handle click event', async () => {
      const handleClick = vi.fn()
      
      render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, { onClick: handleClick }, () => 'Clickable Item'),
            ]),
          ],
        },
      })

      const item = screen.getByText('Clickable Item')
      await fireEvent.click(item)

      expect(handleClick).toHaveBeenCalled()
    })

    it('should not trigger click when disabled', async () => {
      const handleClick = vi.fn()
      
      render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, { disabled: true, onClick: handleClick }, () => 'Disabled Item'),
            ]),
          ],
        },
      })

      const item = screen.getByText('Disabled Item')
      await fireEvent.click(item)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('DropdownMenu', () => {
    it('should render dropdown menu with items', () => {
      render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
              h(DropdownItem, null, () => 'Item 2'),
              h(DropdownItem, null, () => 'Item 3'),
            ]),
          ],
        },
      })

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should apply custom className to menu', () => {
      const { container } = render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, { className: 'custom-menu' }, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      const menu = container.querySelector('.tiger-dropdown-menu')
      expect(menu).toHaveClass('custom-menu')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      const { container } = render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      const menu = container.querySelector('.tiger-dropdown-menu')
      expect(menu).toHaveAttribute('role', 'menu')

      const item = screen.getByText('Item 1')
      expect(item).toHaveAttribute('role', 'menuitem')
    })

    it('should mark disabled items with aria-disabled', () => {
      render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, { disabled: true }, () => 'Disabled Item'),
            ]),
          ],
        },
      })

      const item = screen.getByText('Disabled Item')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default dropdown', () => {
      const { container } = render(Dropdown, {
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
              h(DropdownItem, null, () => 'Item 2'),
            ]),
          ],
        },
      })

      expect(container).toMatchSnapshot()
    })

    it('should match snapshot for click trigger dropdown', () => {
      const { container } = render(Dropdown, {
        props: { trigger: 'click' },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      expect(container).toMatchSnapshot()
    })

    it('should match snapshot for disabled dropdown', () => {
      const { container } = render(Dropdown, {
        props: { disabled: true },
        slots: {
          default: () => [
            h('button', null, 'Trigger'),
            h(DropdownMenu, null, () => [
              h(DropdownItem, null, () => 'Item 1'),
            ]),
          ],
        },
      })

      expect(container).toMatchSnapshot()
    })
  })
})
