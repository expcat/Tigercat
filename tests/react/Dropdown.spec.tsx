/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dropdown, DropdownMenu, DropdownItem } from '@expcat/tigercat-react'
import React from 'react'

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
    const { container } = render(
      <Dropdown>
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('supports offset prop', () => {
    const { container } = render(
      <Dropdown placement="top-end" offset={12}>
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Verify component renders with offset prop
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
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
    expect(trigger).toHaveClass('cursor-not-allowed', 'opacity-50')

    await fireEvent.click(screen.getByText('Trigger'))
    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('toggles visibility in click trigger mode and calls onVisibleChange', async () => {
    const handleVisibleChange = vi.fn()

    const { container } = render(
      <Dropdown trigger="click" onVisibleChange={handleVisibleChange}>
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    expect(handleVisibleChange).toHaveBeenCalledWith(true)

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).toHaveAttribute('hidden')
    expect(handleVisibleChange).toHaveBeenCalledWith(false)
  })

  it('closes on outside click (click trigger)', async () => {
    const { container } = render(
      <Dropdown trigger="click">
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')

    await fireEvent.click(document.body)
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('closes on Escape when open', async () => {
    const { container } = render(
      <Dropdown trigger="click">
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')
    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')

    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('closes on item click by default, but not when item is disabled', async () => {
    const { container } = render(
      <Dropdown trigger="click">
        <button>Trigger</button>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownItem disabled>Disabled Item</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    // Floating UI uses `hidden` attribute now
    const wrapper = container.querySelector('.tiger-dropdown-container > .absolute')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    await fireEvent.click(screen.getByText('Item 1'))
    expect(wrapper).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Trigger'))
    expect(wrapper).not.toHaveAttribute('hidden')
    await fireEvent.click(screen.getByText('Disabled Item'))
    expect(wrapper).not.toHaveAttribute('hidden')
  })
})
