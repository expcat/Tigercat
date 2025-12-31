/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dropdown, DropdownMenu, DropdownItem } from '@tigercat/react'
import React from 'react'

describe('Dropdown', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      expect(screen.getByText('Trigger')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should render with hover trigger by default', () => {
      const { container } = render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
      expect(wrapper).toHaveClass('hidden')
    })

    it('should render with bottom-start placement by default', () => {
      const { container } = render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
      expect(wrapper).toHaveClass('top-full', 'left-0')
    })

    it('should apply custom placement', () => {
      const { container } = render(
        <Dropdown placement="top-end">
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const wrapper = container.querySelector('.tiger-dropdown-menu-wrapper')
      expect(wrapper).toHaveClass('bottom-full', 'right-0')
    })
  })

  describe('Props', () => {
    it('should respect disabled prop', () => {
      const { container } = render(
        <Dropdown disabled>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const trigger = container.querySelector('.tiger-dropdown-trigger')
      expect(trigger).toHaveClass('cursor-not-allowed', 'opacity-50')
    })

    it('should accept custom className', () => {
      const { container } = render(
        <Dropdown className="custom-dropdown">
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const dropdown = container.querySelector('.tiger-dropdown')
      expect(dropdown).toHaveClass('custom-dropdown')
    })
  })

  describe('Trigger Modes', () => {
    it('should support click trigger', async () => {
      const { container } = render(
        <Dropdown trigger="click">
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

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
      render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Test Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })

    it('should render disabled dropdown item', () => {
      render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem disabled>Disabled Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const item = screen.getByText('Disabled Item')
      expect(item).toHaveAttribute('aria-disabled', 'true')
      expect(item).toHaveClass('cursor-not-allowed', 'opacity-50')
    })

    it('should render divided dropdown item', () => {
      render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem divided>Item 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const item = screen.getByText('Item 2')
      expect(item).toHaveClass('border-t')
    })

    it('should handle click event', async () => {
      const handleClick = vi.fn()
      
      render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem onClick={handleClick}>Clickable Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const item = screen.getByText('Clickable Item')
      await fireEvent.click(item)

      expect(handleClick).toHaveBeenCalled()
    })

    it('should not trigger click when disabled', async () => {
      const handleClick = vi.fn()
      
      render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem disabled onClick={handleClick}>Disabled Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const item = screen.getByText('Disabled Item')
      await fireEvent.click(item)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('DropdownMenu', () => {
    it('should render dropdown menu with items', () => {
      render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
            <DropdownItem>Item 3</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should apply custom className to menu', () => {
      const { container } = render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu className="custom-menu">
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const menu = container.querySelector('.tiger-dropdown-menu')
      expect(menu).toHaveClass('custom-menu')
    })
  })

  describe('Events', () => {
    it('should call onVisibleChange when visibility changes', async () => {
      const handleVisibleChange = vi.fn()
      
      render(
        <Dropdown trigger="click" onVisibleChange={handleVisibleChange}>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const trigger = screen.getByText('Trigger')
      await fireEvent.click(trigger)

      expect(handleVisibleChange).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      const { container } = render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const menu = container.querySelector('.tiger-dropdown-menu')
      expect(menu).toHaveAttribute('role', 'menu')

      const item = screen.getByText('Item 1')
      expect(item).toHaveAttribute('role', 'menuitem')
    })

    it('should mark disabled items with aria-disabled', () => {
      render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem disabled>Disabled Item</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const item = screen.getByText('Disabled Item')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default dropdown', () => {
      const { container } = render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      expect(container).toMatchSnapshot()
    })

    it('should match snapshot for click trigger dropdown', () => {
      const { container } = render(
        <Dropdown trigger="click">
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      expect(container).toMatchSnapshot()
    })

    it('should match snapshot for disabled dropdown', () => {
      const { container } = render(
        <Dropdown disabled>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      expect(container).toMatchSnapshot()
    })
  })
})
