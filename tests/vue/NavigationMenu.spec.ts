/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { h } from 'vue'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@expcat/tigercat-vue/NavigationMenu'
import { expectNoA11yViolationsIsolated } from '../utils'

function renderNav(props: Record<string, unknown> = {}) {
  return render(NavigationMenu, {
    props: { delayDuration: 0, skipDelayDuration: 0, ...props },
    slots: {
      default: () => [
        h(NavigationMenuList, null, () => [
          h(NavigationMenuItem, { value: 'products' }, () => [
            h(NavigationMenuTrigger, null, () => 'Products'),
            h(NavigationMenuContent, null, () => [
              h(NavigationMenuLink, null, () => 'Overview'),
              h(NavigationMenuLink, { disabled: true }, () => 'Disabled'),
              h(NavigationMenuLink, null, () => 'Pricing')
            ])
          ]),
          h(NavigationMenuItem, { value: 'docs' }, () => [
            h(NavigationMenuTrigger, null, () => 'Docs'),
            h(NavigationMenuContent, null, () => [h(NavigationMenuLink, null, () => 'Guide')])
          ]),
          h(NavigationMenuItem, null, () => [
            h(NavigationMenuLink, { href: '/about' }, () => 'About')
          ])
        ])
      ]
    }
  })
}

function getPanel(name: 'Products' | 'Docs' = 'Products') {
  const trigger = screen.getByRole('menuitem', { name })
  const controls = trigger.getAttribute('aria-controls')
  if (!controls) {
    return document.querySelector('[data-tiger-navigation-menu-content]')
  }
  return document.getElementById(controls)?.closest('[data-tiger-navigation-menu-content]')
}

describe('NavigationMenu', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a menubar with triggers and a top-level link', () => {
    renderNav()

    expect(screen.getByRole('menubar')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Products' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('keeps panels hidden by default', () => {
    renderNav()
    const wrapper = document.querySelector('[data-tiger-navigation-menu-content]')
    expect(wrapper).toHaveAttribute('hidden')
  })

  it('opens on hover and records data-state', async () => {
    renderNav()
    const trigger = screen.getByRole('menuitem', { name: 'Products' })
    expect(trigger).toHaveAttribute('data-state', 'closed')

    await fireEvent.mouseEnter(trigger)
    expect(trigger).toHaveAttribute('data-state', 'open')
    expect(getPanel()).not.toHaveAttribute('hidden')
  })

  it('opens on focus and ArrowDown, then restores focus on Escape', async () => {
    renderNav()
    const trigger = screen.getByRole('menuitem', { name: 'Products' })

    await fireEvent.focus(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    trigger.focus()
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(getPanel()).not.toHaveAttribute('hidden')
    await waitFor(() => {
      expect(document.activeElement).toHaveTextContent('Overview')
    })
  })

  it('moves across top-level items with arrow keys', async () => {
    renderNav()
    const products = screen.getByRole('menuitem', { name: 'Products' })
    products.focus()
    await fireEvent.keyDown(products, { key: 'ArrowRight' })
    expect(document.activeElement).toHaveTextContent('Docs')

    await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' })
    expect(document.activeElement).toHaveTextContent('About')
  })

  it('closes on item click, outside click, and Escape', async () => {
    renderNav({ defaultValue: 'products' })
    expect(getPanel()).not.toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Overview'))
    expect(getPanel()).toHaveAttribute('hidden')

    await fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Products' }))
    await fireEvent.click(screen.getByText('Disabled'))
    expect(getPanel()).not.toHaveAttribute('hidden')

    await fireEvent.click(document.body)
    expect(getPanel()).toHaveAttribute('hidden')

    await fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Products' }))
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('does not open when disabled', async () => {
    renderNav({ disabled: true })
    const trigger = screen.getByRole('menuitem', { name: 'Products' })
    await fireEvent.mouseEnter(trigger)
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('renders open when defaultValue is set', () => {
    renderNav({ defaultValue: 'products' })
    expect(getPanel()).not.toHaveAttribute('hidden')
    expect(screen.getByRole('menuitem', { name: 'Products' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  it('emits update:value, value-change, update:open, and open-change', async () => {
    const { emitted } = renderNav()
    await fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Products' }))
    expect(emitted()['value-change']?.[0]).toEqual(['products'])
    expect(emitted()['update:value']?.[0]).toEqual(['products'])
    expect(emitted()['open-change']?.[0]).toEqual([true])
    expect(emitted()['update:open']?.[0]).toEqual([true])
  })

  it('does not close on item click when closeOnClick is false', async () => {
    renderNav({ defaultValue: 'products', closeOnClick: false })
    await fireEvent.click(screen.getByText('Overview'))
    expect(getPanel()).not.toHaveAttribute('hidden')
  })

  it('does not dismiss a later keyboard-opened panel after a pending hover close', async () => {
    vi.useFakeTimers()
    renderNav({ delayDuration: 0, skipDelayDuration: 200 })
    const products = screen.getByRole('menuitem', { name: 'Products' })
    const docs = screen.getByRole('menuitem', { name: 'Docs' })

    await fireEvent.mouseEnter(products)
    expect(products).toHaveAttribute('aria-expanded', 'true')

    await fireEvent.mouseLeave(products)
    await fireEvent.focus(docs)
    await fireEvent.keyDown(docs, { key: 'Enter' })

    await vi.advanceTimersByTimeAsync(200)

    expect(docs).toHaveAttribute('aria-expanded', 'true')
    expect(products).toHaveAttribute('aria-expanded', 'false')
    expect(getPanel('Docs')).not.toHaveAttribute('hidden')
  })

  it('closes the open panel when focus moves to a top-level link without content', async () => {
    renderNav({ defaultValue: 'products' })
    const products = screen.getByRole('menuitem', { name: 'Products' })
    const about = screen.getByRole('menuitem', { name: 'About' })
    expect(products).toHaveAttribute('aria-expanded', 'true')

    about.focus()
    await fireEvent.focus(about)

    expect(about).toHaveFocus()
    expect(products).toHaveAttribute('aria-expanded', 'false')
    expect(products).not.toHaveAttribute('aria-controls')
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('closes the open panel when focus leaves the menubar', async () => {
    const { container } = renderNav({ defaultValue: 'products' })
    const outside = document.createElement('button')
    outside.textContent = 'Outside'
    container.appendChild(outside)

    const products = screen.getByRole('menuitem', { name: 'Products' })
    expect(products).toHaveAttribute('aria-expanded', 'true')

    await fireEvent.focusOut(products, { relatedTarget: outside })
    outside.focus()

    expect(outside).toHaveFocus()
    expect(products).toHaveAttribute('aria-expanded', 'false')
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('moves ArrowDown focus into the matching item panel, not another open panel', async () => {
    renderNav({ defaultValue: 'products' })
    renderNav()

    const docsTriggers = screen.getAllByRole('menuitem', { name: 'Docs' })
    const secondDocs = docsTriggers[1]
    secondDocs.focus()
    await fireEvent.focus(secondDocs)
    await fireEvent.keyDown(secondDocs, { key: 'ArrowDown' })

    await waitFor(() => {
      expect(document.activeElement).toHaveTextContent('Guide')
    })
    expect(document.activeElement).not.toHaveTextContent('Overview')
    expect(screen.getAllByRole('menuitem', { name: 'Products' })[0]).toHaveAttribute(
      'aria-expanded',
      'true'
    )
  })

  describe('portal', () => {
    it('renders the panel into document.body by default', () => {
      const { container } = renderNav({ defaultValue: 'products' })
      const wrapper = document.querySelector('[data-tiger-navigation-menu-content]')
      expect(wrapper?.closest('[data-tiger-overlay-layer]')?.parentElement).toBe(document.body)
      expect(container.querySelector('[data-tiger-navigation-menu-content]')).toBeNull()
    })

    it('renders the panel in place when portal is false', () => {
      const { container } = renderNav({ defaultValue: 'products', portal: false })
      const wrapper = container.querySelector(
        '.tiger-navigation-menu [data-tiger-navigation-menu-content]'
      )
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveAttribute('hidden')
    })
  })

  describe('a11y', () => {
    it('exposes menubar semantics and aria-expanded on triggers', async () => {
      renderNav()
      const menubar = screen.getByRole('menubar')
      expect(menubar).toBeInTheDocument()

      const trigger = screen.getByRole('menuitem', { name: 'Products' })
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await fireEvent.mouseEnter(trigger)
      const controlsId = trigger.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()
      const menu = document.querySelector(`[id="${controlsId}"]`)
      expect(menu).toHaveAttribute('role', 'menu')
    })

    it('should have no accessibility violations', async () => {
      const { container } = renderNav({ defaultValue: 'products' })
      await expectNoA11yViolationsIsolated(container, {
        rules: { 'aria-allowed-attr': { enabled: false } }
      })
    })
  })

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = renderNav({ className: 'my-navigation-menu' })
      const root = container.querySelector('.tiger-navigation-menu')
      expect(root?.className).toContain('my-navigation-menu')
    })
  })
})
