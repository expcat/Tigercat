/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import { Dropdown, DropdownMenu, DropdownItem } from '@expcat/tigercat-react'
import React from 'react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Dropdown', () => {
  it('renders trigger and menu content', () => {
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

  it('is hidden by default (hover trigger)', () => {
    render(
      <Dropdown>
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('supports offset prop', () => {
    render(
      <Dropdown placement="top-end" offset={12}>
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Verify component renders with offset prop
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
    expect(wrapper).toBeInTheDocument()
  })

  it('respects disabled prop (prevents opening)', async () => {
    const { container } = render(
      <Dropdown disabled trigger="click">
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    const trigger = container.querySelector('.tiger-dropdown-trigger')
    expect(trigger).toHaveClass('cursor-not-allowed', 'opacity-50', 'pointer-events-none')

    await fireEvent.click(screen.getByText('Trigger'))
    // Floating UI uses `hidden` attribute now
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('toggles visibility in click trigger mode and calls onOpenChange', async () => {
    const handleOpenChange = vi.fn()

    render(
      <Dropdown trigger="click" onOpenChange={handleOpenChange}>
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    expect(handleOpenChange).toHaveBeenCalledWith(true)

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).toHaveAttribute('hidden')
    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes on outside click (click trigger)', async () => {
    render(
      <Dropdown trigger="click">
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')

    await fireEvent.click(document.body)
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('closes on Escape when open', async () => {
    render(
      <Dropdown trigger="click">
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')

    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('closes on item click by default, but not when item is disabled', async () => {
    render(
      <Dropdown trigger="click">
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownItem disabled>Disabled Item</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = document.querySelector('[data-tiger-dropdown-menu]')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    await fireEvent.click(screen.getByText('Item 1'))
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    await fireEvent.click(screen.getByText('Disabled Item'))
    expect(wrapper).not.toHaveAttribute('hidden')
  })

  it('renders chevron indicator by default', () => {
    const { container } = render(
      <Dropdown>
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    const chevron = container.querySelector('.tiger-dropdown-chevron')
    expect(chevron).toBeInTheDocument()
    expect(chevron?.tagName.toLowerCase()).toBe('svg')
  })

  it('hides chevron when showArrow is false', () => {
    const { container } = render(
      <Dropdown showArrow={false}>
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    const chevron = container.querySelector('.tiger-dropdown-chevron')
    expect(chevron).not.toBeInTheDocument()
  })

  it('rotates chevron when dropdown is open', async () => {
    const { container } = render(
      <Dropdown trigger="click">
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    const chevron = container.querySelector('.tiger-dropdown-chevron')
    expect(chevron).not.toHaveClass('rotate-180')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(chevron).toHaveClass('rotate-180')
  })

  describe('a11y', () => {
    it('trigger has aria-haspopup and aria-expanded', () => {
      render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const trigger = screen.getByText('Trigger').closest('[aria-haspopup]')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('trigger has aria-controls pointing to menu id when open', async () => {
      render(
        <Dropdown trigger="click">
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const trigger = screen.getByText('Trigger').closest('[aria-haspopup]')!
      expect(trigger).not.toHaveAttribute('aria-controls')

      await fireEvent.click(screen.getByText('Trigger'))
      const controlsId = trigger.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()

      const menu = document.querySelector(`[id="${controlsId}"]`)
      expect(menu).toBeInTheDocument()
      expect(menu).toHaveAttribute('role', 'menu')
    })

    it('menu items have role="menuitem" and tabIndex={-1}', () => {
      render(
        <Dropdown defaultOpen>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const items = screen.getAllByRole('menuitem')
      expect(items).toHaveLength(2)
      items.forEach((item) => {
        expect(item).toHaveAttribute('tabindex', '-1')
      })
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Dropdown defaultOpen>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )
      await act(async () => {
        await Promise.resolve()
      })
      await expectNoA11yViolationsIsolated(container, {
        rules: { 'aria-allowed-attr': { enabled: false } }
      })
    })
  })

  describe('disabled', () => {
    it('does not open when disabled', async () => {
      render(
        <Dropdown trigger="click" disabled>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      await fireEvent.click(screen.getByText('Trigger'))
      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
      expect(wrapper).toHaveAttribute('hidden')
    })
  })

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = render(
        <Dropdown className="my-dropdown">
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const root = container.querySelector('.tiger-dropdown-container')
      expect(root?.className).toContain('my-dropdown')
    })
  })

  describe('defaultOpen', () => {
    it('renders open when defaultOpen is true', () => {
      render(
        <Dropdown defaultOpen>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
      expect(wrapper).not.toHaveAttribute('hidden')
    })
  })
  describe('portal', () => {
    it('renders the menu into document.body by default', () => {
      const { container } = render(
        <Dropdown defaultOpen>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
      expect(wrapper?.parentElement).toBe(document.body)
      expect(container.querySelector('[data-tiger-dropdown-menu]')).toBeNull()
    })

    it('renders the menu in place when portal is false', () => {
      const { container } = render(
        <Dropdown defaultOpen portal={false}>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const wrapper = container.querySelector(
        '.tiger-dropdown-container > [data-tiger-dropdown-menu]'
      )
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveAttribute('hidden')
    })

    it('does not treat clicks inside the portaled menu as outside clicks', async () => {
      render(
        <Dropdown trigger="click" closeOnClick={false}>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
      await fireEvent.click(screen.getByText('Trigger'))
      expect(wrapper).not.toHaveAttribute('hidden')

      await fireEvent.click(screen.getByText('Item 1'))
      expect(wrapper).not.toHaveAttribute('hidden')

      await fireEvent.click(document.body)
      expect(wrapper).toHaveAttribute('hidden')
    })
  })

  describe('Edge Cases', () => {
    it('does not close on item click when closeOnClick is false', async () => {
      render(
        <Dropdown trigger="click" closeOnClick={false}>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const wrapper = document.querySelector('[data-tiger-dropdown-menu]')
      await fireEvent.click(screen.getByText('Trigger'))
      expect(wrapper).not.toHaveAttribute('hidden')

      await fireEvent.click(screen.getByText('Item 1'))
      expect(wrapper).not.toHaveAttribute('hidden')
    })

    it('renders disabled item with aria-disabled', () => {
      render(
        <Dropdown defaultOpen>
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem disabled>Disabled</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const item = screen.getByText('Disabled').closest('[role="menuitem"]')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })

    it('updates aria-expanded when toggling', async () => {
      render(
        <Dropdown trigger="click">
          <button>Trigger</button>
          <DropdownMenu>
            <DropdownItem>Item 1</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )

      const trigger = screen.getByText('Trigger').closest('[aria-haspopup]')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await fireEvent.click(screen.getByText('Trigger'))
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await fireEvent.click(screen.getByText('Trigger'))
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('renders with empty DropdownMenu', () => {
      const { container } = render(
        <Dropdown>
          <button>Trigger</button>
          <DropdownMenu>{null}</DropdownMenu>
        </Dropdown>
      )

      expect(container.querySelector('.tiger-dropdown-container')).toBeInTheDocument()
    })
  })
})
