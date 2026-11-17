/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
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
  it('renders the trigger surface and menu content', async () => {
    renderMenu()

    expect(screen.getByText('Surface')).toBeInTheDocument()
    expect(screen.queryByText('Copy')).not.toBeInTheDocument()
    await openMenu()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('keeps a disabled child button disabled', () => {
    for (const disabled of [true, ''] as const) {
      const view = render(ContextMenu, {
        slots: {
          default: () => [
            h('button', { disabled: disabled as boolean }, 'Unavailable'),
            h(ContextMenuMenu, null, () => h(ContextMenuItem, null, () => 'Copy'))
          ]
        }
      })

      expect(view.getByRole('button', { name: 'Unavailable' })).toBeDisabled()
      view.unmount()
    }
  })

  it('is absent until opened', () => {
    renderMenu()
    expect(document.querySelector('[data-tiger-context-menu]')).toBeNull()
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
    expect(getMenu()).toBeTruthy()
  })

  it('opens from a virtual reference instead of a point node', async () => {
    renderMenu()
    await openMenu(120, 60)
    expect(document.querySelector('[data-tiger-context-menu-point]')).toBeNull()
    expect(getMenu()).toBeTruthy()
  })

  it('closes on item click, outside click, and Escape', async () => {
    renderMenu()

    await openMenu()
    expect(getMenu()).toBeTruthy()
    await fireEvent.click(screen.getByText('Copy'))
    expect(getMenu()).toBeNull()

    await openMenu()
    await fireEvent.click(screen.getByText('Disabled'))
    expect(getMenu()).toBeTruthy()

    await clickOutsideOverlay()
    expect(getMenu()).toBeNull()

    await openMenu()
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(getMenu()).toBeNull()
  })

  it('does not open when disabled and leaves the native menu intact', async () => {
    const { container } = renderMenu({ disabled: true })
    const trigger = container.querySelector('[data-tiger-context-menu-trigger]')!
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    trigger.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(document.querySelector('[data-tiger-context-menu]')).toBeNull()
  })

  it('renders open when defaultOpen is true', () => {
    renderMenu({ defaultOpen: true })
    expect(document.querySelector('[data-tiger-context-menu]')).toBeTruthy()
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
    expect(getMenu()).toBeTruthy()
  })

  describe('portal', () => {
    it('renders the menu into document.body by default', () => {
      const { container } = renderMenu({ defaultOpen: true })
      const wrapper = document.querySelector('[data-tiger-context-menu]')
      expect(wrapper).toBeTruthy()
      expect(document.body.contains(wrapper)).toBe(true)
      expect(container.contains(wrapper)).toBe(false)
    })

    it('renders the menu in place when portal is false', () => {
      const { container } = renderMenu({ defaultOpen: true, portal: false })
      const wrapper = container.querySelector('.tiger-context-menu [data-tiger-context-menu]')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('keyboard', () => {
    it('focuses the first available item when open changes externally', async () => {
      const { rerender } = renderMenu({ open: false })
      const trigger = document.querySelector<HTMLElement>('[data-tiger-context-menu-trigger]')!
      trigger.focus()
      expect(trigger).toHaveFocus()

      await rerender({ open: true })
      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Copy' })).toHaveFocus())
    })

    it('moves through checkbox and radio items with ArrowDown', async () => {
      render(ContextMenu, {
        props: {
          defaultOpen: true,
          items: [
            { key: 'alpha', label: 'Alpha' },
            { key: 'check', label: 'Check', type: 'checkbox' },
            { key: 'radio', label: 'Radio', type: 'radio' },
            { key: 'zulu', label: 'Zulu' }
          ]
        }
      })

      const alpha = screen.getByRole('menuitem', { name: 'Alpha' })
      alpha.focus()
      await fireEvent.keyDown(alpha, { key: 'ArrowDown' })
      const check = screen.getByRole('menuitemcheckbox', { name: 'Check' })
      expect(check).toHaveFocus()
      await fireEvent.keyDown(check, { key: 'ArrowDown' })
      expect(screen.getByRole('menuitemradio', { name: 'Radio' })).toHaveFocus()
    })

    it('opens on Shift+F10 and moves focus with arrows', async () => {
      renderMenu()
      const trigger = screen.getByText('Surface').closest('[data-tiger-context-menu-trigger]')!
      await fireEvent.keyDown(trigger, { key: 'F10', shiftKey: true })
      const wrapper = document.querySelector('[data-tiger-context-menu]')
      expect(wrapper).toBeTruthy()

      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Copy' })).toHaveFocus())
      await fireEvent.keyDown(wrapper!, { key: 'ArrowDown' })
      expect(document.activeElement).toHaveTextContent('Delete')
    })

    it('keeps ArrowDown inside an open submenu and opens a nested submenu with ArrowRight and closes it with Escape', async () => {
      renderMenu({}, [
        h(ContextMenuSub, { title: 'More' }, () => [
          h(ContextMenuItem, null, () => 'Mail'),
          h(ContextMenuItem, null, () => 'Link')
        ])
      ])
      await openMenu()

      const subTrigger = screen.getByRole('menuitem', { name: 'More' })
      expect(subTrigger).toHaveAttribute('aria-expanded', 'false')
      subTrigger.focus()
      await fireEvent.keyDown(subTrigger, { key: 'ArrowRight' })
      expect(subTrigger).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Mail')).toBeInTheDocument()

      const mail = screen.getByRole('menuitem', { name: 'Mail' })
      mail.focus()
      const popup = document.querySelector('[data-tiger-context-menu-sub]')!
      await fireEvent.keyDown(popup, { key: 'ArrowDown' })
      expect(screen.getByRole('menuitem', { name: 'Link' })).toHaveFocus()
      expect(screen.getByRole('menuitem', { name: 'Copy' })).not.toHaveFocus()

      await fireEvent.keyDown(popup, { key: 'Escape' })
      expect(subTrigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('moves focus into the first submenu item after the overlay is positioned (T03)', async () => {
      const rect = {
        x: 8,
        y: 8,
        left: 8,
        top: 8,
        right: 120,
        bottom: 36,
        width: 112,
        height: 28,
        toJSON() {
          return this
        }
      } as DOMRect
      const originalRect = Element.prototype.getBoundingClientRect
      Element.prototype.getBoundingClientRect = function () {
        return rect
      }
      const originalFocus = HTMLElement.prototype.focus
      HTMLElement.prototype.focus = function (this: HTMLElement, ...args: []) {
        const sub = this.closest('[data-tiger-context-menu-sub]')
        if (sub && sub.style.visibility === 'hidden') return
        return originalFocus.apply(this, args)
      }
      try {
        renderMenu({}, [
          h(ContextMenuSub, { title: '分享到' }, () => [
            h(ContextMenuItem, null, () => '邮件'),
            h(ContextMenuItem, null, () => '链接')
          ])
        ])
        await openMenu()
        const share = screen.getByRole('menuitem', { name: '分享到' })
        share.focus()
        await fireEvent.keyDown(share, { key: 'ArrowRight' })
        expect(share).toHaveAttribute('aria-expanded', 'true')
        await waitFor(() => expect(screen.getByRole('menuitem', { name: '邮件' })).toHaveFocus())
      } finally {
        Element.prototype.getBoundingClientRect = originalRect
        HTMLElement.prototype.focus = originalFocus
      }
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

  describe('items schema', () => {
    it('keeps nested submenu ancestors open and blocks disabled branches', async () => {
      render(ContextMenu, {
        props: {
          defaultOpen: true,
          portal: false,
          items: [
            {
              key: 'root',
              label: 'Root',
              children: [
                {
                  key: 'nested',
                  label: 'Nested',
                  children: [{ key: 'leaf', label: 'Leaf' }]
                },
                { key: 'plain', label: 'Plain' }
              ]
            },
            {
              key: 'blocked',
              label: 'Blocked',
              disabled: true,
              children: [{ key: 'never', label: 'Never' }]
            }
          ]
        }
      })

      const root = screen.getByRole('menuitem', { name: 'Root' })
      await fireEvent.mouseEnter(root.closest('.relative') as HTMLElement)
      expect(root).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Plain')).toBeInTheDocument()

      const nested = screen.getByRole('menuitem', { name: 'Nested' })
      await fireEvent.mouseEnter(nested.closest('.relative') as HTMLElement)
      expect(nested).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Leaf')).toBeInTheDocument()
      expect(root).toHaveAttribute('aria-expanded', 'true')

      const blocked = screen.getByRole('menuitem', { name: 'Blocked' })
      await fireEvent.mouseEnter(blocked.closest('.relative') as HTMLElement)
      expect(blocked).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('Never')).not.toBeInTheDocument()
    })

    it('keeps schema submenu keyboard navigation in its own layer', async () => {
      render(ContextMenu, {
        props: {
          defaultOpen: true,
          portal: false,
          items: [
            { key: 'first', label: 'First' },
            {
              key: 'more',
              label: 'More',
              children: [
                { key: 'mail', label: 'Mail' },
                { key: 'link', label: 'Link' }
              ]
            },
            { key: 'last', label: 'Last' }
          ]
        }
      })

      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'First' })).toHaveFocus())
      const more = screen.getByRole('menuitem', { name: 'More' })
      more.focus()
      await fireEvent.keyDown(more, { key: 'ArrowRight' })
      const mail = screen.getByRole('menuitem', { name: 'Mail' })
      const link = screen.getByRole('menuitem', { name: 'Link' })
      await waitFor(() => expect(mail).toHaveFocus())

      await fireEvent.keyDown(mail, { key: 'ArrowDown' })
      expect(link).toHaveFocus()
      await fireEvent.keyDown(link, { key: 'ArrowUp' })
      expect(mail).toHaveFocus()

      await fireEvent.keyDown(mail, { key: 'ArrowLeft' })
      expect(more).toHaveAttribute('aria-expanded', 'false')
      expect(more).toHaveFocus()
      expect(screen.queryByRole('menuitem', { name: 'Mail' })).not.toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'First' })).toBeInTheDocument()

      await fireEvent.keyDown(more, { key: 'ArrowRight' })
      const reopenedMail = screen.getByRole('menuitem', { name: 'Mail' })
      await waitFor(() => expect(reopenedMail).toHaveFocus())
      await fireEvent.keyDown(reopenedMail, { key: 'Escape' })
      expect(more).toHaveAttribute('aria-expanded', 'false')
      expect(more).toHaveFocus()
      expect(screen.getByRole('menuitem', { name: 'First' })).toBeInTheDocument()
    })

    it('opens a More submenu with click or ArrowRight', async () => {
      const items = [
        {
          key: 'more',
          label: 'More',
          children: [{ key: 'nested', label: 'Nested' }]
        }
      ]

      const keyboard = render(ContextMenu, {
        props: { defaultOpen: true, portal: false, items }
      })
      const more = screen.getByRole('menuitem', { name: 'More' })
      more.focus()
      expect(more).toHaveAttribute('aria-expanded', 'false')
      await fireEvent.keyDown(more, { key: 'ArrowRight' })
      expect(more).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('menuitem', { name: 'Nested' })).toBeTruthy()
      keyboard.unmount()

      render(ContextMenu, {
        props: { defaultOpen: true, portal: false, items }
      })
      const moreClick = screen.getByRole('menuitem', { name: 'More' })
      expect(moreClick).toHaveAttribute('aria-expanded', 'false')
      await fireEvent.click(moreClick)
      expect(moreClick).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('menuitem', { name: 'Nested' })).toBeTruthy()
    })
  })

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = renderMenu({ className: 'my-context-menu' })
      const root = container.querySelector('.tiger-context-menu')
      expect(root?.className).toContain('my-context-menu')
    })
  })

  describe('dynamic class', () => {
    it('updates ContextMenuItem class from attr-before to attr-after', async () => {
      const itemClass = ref('attr-before')
      render(
        defineComponent({
          setup() {
            return () =>
              h(ContextMenu, null, {
                default: () => [
                  h('div', null, 'Surface'),
                  h(ContextMenuMenu, null, () => [
                    h(ContextMenuItem, { class: itemClass.value }, () => 'Copy')
                  ])
                ]
              })
          }
        })
      )

      await openMenu()
      const item = screen.getByRole('menuitem', { name: 'Copy' })
      expect(item.className).toContain('attr-before')
      itemClass.value = 'attr-after'
      await nextTick()
      expect(item.className).toContain('attr-after')
      expect(item.className).not.toContain('attr-before')
    })

    it('updates ContextMenuMenu class from attr-before to attr-after', async () => {
      const menuClass = ref('attr-before')
      render(
        defineComponent({
          setup() {
            return () =>
              h(ContextMenu, null, {
                default: () => [
                  h('div', null, 'Surface'),
                  h(ContextMenuMenu, { class: menuClass.value }, () => [
                    h(ContextMenuItem, null, () => 'Copy')
                  ])
                ]
              })
          }
        })
      )

      await openMenu()
      const menu = screen.getByRole('menu')
      expect(menu.className).toContain('attr-before')
      menuClass.value = 'attr-after'
      await nextTick()
      expect(menu.className).toContain('attr-after')
      expect(menu.className).not.toContain('attr-before')
    })

    it('updates ContextMenuSub class from attr-before to attr-after', async () => {
      const subClass = ref('attr-before')
      render(
        defineComponent({
          setup() {
            return () =>
              h(ContextMenu, null, {
                default: () => [
                  h('div', null, 'Surface'),
                  h(ContextMenuMenu, null, () => [
                    h(ContextMenuSub, { class: subClass.value, title: 'More' }, () => [
                      h(ContextMenuItem, null, () => 'Share')
                    ])
                  ])
                ]
              })
          }
        })
      )

      await openMenu()
      const trigger = document.querySelector('[data-tiger-context-menu-sub-trigger]')
      expect(trigger?.className).toContain('attr-before')
      subClass.value = 'attr-after'
      await nextTick()
      expect(trigger?.className).toContain('attr-after')
      expect(trigger?.className).not.toContain('attr-before')
    })
  })
})
