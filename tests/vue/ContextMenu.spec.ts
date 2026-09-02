/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuMenu,
  ContextMenuSub
} from '@expcat/tigercat-vue/ContextMenu'
import { expectNoA11yViolationsIsolated } from '../utils'
import { clickOutsideOverlay } from '../utils/frame-scheduler'

function renderMenu(props: Record<string, unknown> = {}, extraItems: ReturnType<typeof h>[] = []) {
  return render(ContextMenu, {
    props,
    slots: {
      default: () => [
        h('div', null, 'Surface'),
        h(ContextMenuMenu, null, () => [
          h(ContextMenuItem, null, () => 'Copy'),
          h(ContextMenuItem, { disabled: true }, () => 'Disabled'),
          h(ContextMenuItem, { divided: true }, () => 'Delete'),
          ...extraItems
        ])
      ]
    }
  })
}

async function openMenu(clientX = 80, clientY = 40) {
  const trigger = document.querySelector('[data-tiger-context-menu-trigger]') as HTMLElement
  await fireEvent.contextMenu(trigger, { clientX, clientY })
}

function getMenu() {
  return document.querySelector('[data-tiger-context-menu]')
}

describe('ContextMenu', () => {
  it('renders the trigger surface and menu content', () => {
    renderMenu()

    expect(screen.getByText('Surface')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('is hidden by default', () => {
    renderMenu()
    const wrapper = document.querySelector('[data-tiger-context-menu]')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('opens on contextmenu, prevents the browser menu, and records data-state', async () => {
    const { container } = renderMenu()
    const trigger = container.querySelector('[data-tiger-context-menu-trigger]') as HTMLElement
    expect(trigger).toHaveAttribute('data-state', 'closed')

    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 64,
      clientY: 32
    })
    trigger.addEventListener('contextmenu', (e) => {
      expect(e.defaultPrevented).toBe(true)
    })
    await fireEvent(trigger, event)

    expect(event.defaultPrevented).toBe(true)
    expect(trigger).toHaveAttribute('data-state', 'open')
    expect(getMenu()).not.toHaveAttribute('hidden')
  })

  it('positions the virtual reference at the cursor', async () => {
    renderMenu()
    await openMenu(120, 60)
    const point = document.querySelector('[data-tiger-context-menu-point]') as HTMLElement
    expect(point.style.left).toBe('120px')
    expect(point.style.top).toBe('60px')
  })

  it('closes on item click, outside click, and Escape', async () => {
    renderMenu()

    await openMenu()
    expect(getMenu()).not.toHaveAttribute('hidden')
    await fireEvent.click(screen.getByText('Copy'))
    expect(getMenu()).toHaveAttribute('hidden')

    await openMenu()
    await fireEvent.click(screen.getByText('Disabled'))
    expect(getMenu()).not.toHaveAttribute('hidden')

    await clickOutsideOverlay()
    expect(getMenu()).toHaveAttribute('hidden')

    await openMenu()
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(getMenu()).toHaveAttribute('hidden')
  })

  it('does not open when disabled and leaves the native menu intact', async () => {
    const { container } = renderMenu({ disabled: true })
    const trigger = container.querySelector('[data-tiger-context-menu-trigger]')!
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    trigger.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(document.querySelector('[data-tiger-context-menu]')).toHaveAttribute('hidden')
  })

  it('renders open when defaultOpen is true', () => {
    renderMenu({ defaultOpen: true })
    expect(document.querySelector('[data-tiger-context-menu]')).not.toHaveAttribute('hidden')
  })

  it('emits update:open and open-change', async () => {
    const { emitted } = renderMenu()
    await openMenu()
    expect(emitted()['open-change']?.[0]).toEqual([true])
    expect(emitted()['update:open']?.[0]).toEqual([true])
  })

  it('does not close on item click when closeOnClick is false', async () => {
    renderMenu({ closeOnClick: false })
    await openMenu()
    await fireEvent.click(screen.getByText('Copy'))
    expect(getMenu()).not.toHaveAttribute('hidden')
  })

  describe('portal', () => {
    it('renders the menu into document.body by default', () => {
      const { container } = renderMenu({ defaultOpen: true })
      const wrapper = document.querySelector('[data-tiger-context-menu]')
      expect(wrapper?.closest('[data-tiger-overlay-layer]')?.parentElement).toBe(document.body)
      expect(container.querySelector('[data-tiger-context-menu]')).toBeNull()
    })

    it('renders the menu in place when portal is false', () => {
      const { container } = renderMenu({ defaultOpen: true, portal: false })
      const wrapper = container.querySelector('.tiger-context-menu [data-tiger-context-menu]')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveAttribute('hidden')
    })
  })

  describe('keyboard', () => {
    it('opens on Shift+F10 and moves focus with arrows', async () => {
      renderMenu()
      const trigger = screen.getByText('Surface').closest('[data-tiger-context-menu-trigger]')!
      await fireEvent.keyDown(trigger, { key: 'F10', shiftKey: true })
      const wrapper = document.querySelector('[data-tiger-context-menu]')
      expect(wrapper).not.toHaveAttribute('hidden')

      screen.getByRole('menuitem', { name: 'Copy' }).focus()
      await fireEvent.keyDown(wrapper!, { key: 'ArrowDown' })
      expect(document.activeElement).toHaveTextContent('Delete')
    })

    it('opens a nested submenu with ArrowRight and closes it with Escape', async () => {
      renderMenu({}, [
        h(ContextMenuSub, { title: 'More' }, () => [h(ContextMenuItem, null, () => 'Share')])
      ])
      await openMenu()

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
    it('exposes menu roles and aria-expanded on the trigger', async () => {
      renderMenu()
      const trigger = screen.getByText('Surface').closest('[aria-haspopup]')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await openMenu()
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
      const { container } = renderMenu({ defaultOpen: true })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = renderMenu({ className: 'my-context-menu' })
      const root = container.querySelector('.tiger-context-menu')
      expect(root?.className).toContain('my-context-menu')
    })
  })
})
