/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuMenu,
  ContextMenuSub
} from '@expcat/tigercat-react/ContextMenu'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function Demo({
  extra = null,
  ...props
}: React.ComponentProps<typeof ContextMenu> & { extra?: React.ReactNode }) {
  return (
    <ContextMenu {...props}>
      <div>Surface</div>
      <ContextMenuMenu>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem disabled>Disabled</ContextMenuItem>
        <ContextMenuItem divided>Delete</ContextMenuItem>
        {extra}
      </ContextMenuMenu>
    </ContextMenu>
  )
}

function openMenu(clientX = 80, clientY = 40) {
  const trigger = document.querySelector('[data-tiger-context-menu-trigger]') as HTMLElement
  fireEvent.contextMenu(trigger, { clientX, clientY })
}

function getMenu() {
  return document.querySelector('[data-tiger-context-menu]')
}

describe('ContextMenu', () => {
  it('renders the trigger surface and menu content', () => {
    render(<Demo />)

    expect(screen.getByText('Surface')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('is hidden by default', () => {
    render(<Demo />)
    const wrapper = document.querySelector('[data-tiger-context-menu]')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('opens on contextmenu, prevents the browser menu, and records data-state', () => {
    const { container } = render(<Demo />)
    const trigger = container.querySelector('[data-tiger-context-menu-trigger]')
    expect(trigger).toHaveAttribute('data-state', 'closed')

    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 64,
      clientY: 32
    })
    act(() => {
      trigger!.dispatchEvent(event)
    })

    expect(event.defaultPrevented).toBe(true)
    expect(trigger).toHaveAttribute('data-state', 'open')
    expect(getMenu()).not.toHaveAttribute('hidden')
  })

  it('positions the virtual reference at the cursor', () => {
    render(<Demo />)
    act(() => {
      openMenu(120, 60)
    })
    const point = document.querySelector('[data-tiger-context-menu-point]') as HTMLElement
    expect(point.style.left).toBe('120px')
    expect(point.style.top).toBe('60px')
  })

  it('closes on item click, outside click, and Escape', async () => {
    render(<Demo />)

    act(() => {
      openMenu()
    })
    expect(getMenu()).not.toHaveAttribute('hidden')
    await fireEvent.click(screen.getByText('Copy'))
    expect(getMenu()).toHaveAttribute('hidden')

    act(() => {
      openMenu()
    })
    await fireEvent.click(screen.getByText('Disabled'))
    expect(getMenu()).not.toHaveAttribute('hidden')

    await fireEvent.click(document.body)
    expect(getMenu()).toHaveAttribute('hidden')

    act(() => {
      openMenu()
    })
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(getMenu()).toHaveAttribute('hidden')
  })

  it('does not open when disabled and leaves the native menu intact', () => {
    const { container } = render(<Demo disabled />)
    const trigger = container.querySelector('[data-tiger-context-menu-trigger]')!
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    act(() => {
      trigger.dispatchEvent(event)
    })
    expect(event.defaultPrevented).toBe(false)
    expect(document.querySelector('[data-tiger-context-menu]')).toHaveAttribute('hidden')
  })

  it('renders open when defaultOpen is true', () => {
    render(<Demo defaultOpen />)
    expect(document.querySelector('[data-tiger-context-menu]')).not.toHaveAttribute('hidden')
  })

  it('notifies onOpenChange', () => {
    const onOpenChange = vi.fn()
    render(<Demo onOpenChange={onOpenChange} />)
    act(() => {
      openMenu()
    })
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('does not close on item click when closeOnClick is false', async () => {
    render(<Demo closeOnClick={false} />)
    act(() => {
      openMenu()
    })
    await fireEvent.click(screen.getByText('Copy'))
    expect(getMenu()).not.toHaveAttribute('hidden')
  })

  describe('portal', () => {
    it('renders the menu into document.body by default', () => {
      const { container } = render(<Demo defaultOpen />)
      const wrapper = document.querySelector('[data-tiger-context-menu]')
      expect(wrapper?.closest('[data-tiger-overlay-layer]')?.parentElement).toBe(document.body)
      expect(container.querySelector('[data-tiger-context-menu]')).toBeNull()
    })

    it('renders the menu in place when portal is false', () => {
      const { container } = render(<Demo defaultOpen portal={false} />)
      const wrapper = container.querySelector('.tiger-context-menu [data-tiger-context-menu]')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveAttribute('hidden')
    })
  })

  describe('keyboard', () => {
    it('opens on Shift+F10 and moves focus with arrows', async () => {
      render(<Demo />)
      const trigger = screen.getByText('Surface').closest('[data-tiger-context-menu-trigger]')!
      await fireEvent.keyDown(trigger, { key: 'F10', shiftKey: true })
      const wrapper = document.querySelector('[data-tiger-context-menu]')
      expect(wrapper).not.toHaveAttribute('hidden')

      screen.getByRole('menuitem', { name: 'Copy' }).focus()
      await fireEvent.keyDown(wrapper!, { key: 'ArrowDown' })
      expect(document.activeElement).toHaveTextContent('Delete')
    })

    it('opens a nested submenu with ArrowRight and closes it with Escape', async () => {
      render(
        <Demo
          extra={
            <ContextMenuSub title="More">
              <ContextMenuItem>Share</ContextMenuItem>
            </ContextMenuSub>
          }
        />
      )
      act(() => {
        openMenu()
      })

      const subTrigger = screen.getByRole('menuitem', { name: 'More' })
      expect(subTrigger).toHaveAttribute('aria-expanded', 'false')
      subTrigger.focus()
      await fireEvent.keyDown(subTrigger, { key: 'ArrowRight' })
      expect(subTrigger).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Share')).toBeInTheDocument()

      const popup = document.querySelector('[data-tiger-context-menu-sub]')!
      await fireEvent.keyDown(popup, { key: 'Escape' })
      expect(subTrigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('a11y', () => {
    it('exposes menu roles and aria-expanded on the trigger', () => {
      render(<Demo />)
      const trigger = screen.getByText('Surface').closest('[aria-haspopup]')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      act(() => {
        openMenu()
      })
      const controlsId = trigger!.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()
      const menu = document.querySelector(`[id="${controlsId}"]`)
      expect(menu).toHaveAttribute('role', 'menu')

      const items = screen.getAllByRole('menuitem')
      expect(items.length).toBeGreaterThan(0)
      items.forEach((item) => {
        expect(item).toHaveAttribute('tabindex', '-1')
      })
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(<Demo defaultOpen />)
      await act(async () => {
        await Promise.resolve()
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = render(<Demo className="my-context-menu" />)
      const root = container.querySelector('.tiger-context-menu')
      expect(root?.className).toContain('my-context-menu')
    })
  })
})
