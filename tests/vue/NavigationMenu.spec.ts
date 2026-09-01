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
import { expectNoA11yViolations } from '../utils'

function renderNav(props: Record<string, unknown> = {}) {
  return render(NavigationMenu, {
    props: { delayDuration: 0, skipDelayDuration: 0, ...props },
    slots: {
      default: () => [
        h(NavigationMenuList, null, () => [
          h(NavigationMenuItem, { value: 'products' }, () => [
            h(NavigationMenuTrigger, null, () => 'Products'),
            h(NavigationMenuContent, null, () => [
              h(NavigationMenuLink, { href: '/overview' }, () => 'Overview'),
              h(NavigationMenuLink, { href: '/disabled', disabled: true }, () => 'Disabled'),
              h(NavigationMenuLink, { href: '/pricing' }, () => 'Pricing')
            ])
          ]),
          h(NavigationMenuItem, { value: 'docs' }, () => [
            h(NavigationMenuTrigger, null, () => 'Docs'),
            h(NavigationMenuContent, { mega: true }, () => [
              h(NavigationMenuLink, { href: '/guide' }, () => 'Guide')
            ])
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

  it('does not open on focus and toggles on click', async () => {
    renderNav()
    const trigger = screen.getByRole('menuitem', { name: 'Products' })

    await fireEvent.focus(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('data-state', 'open')
    expect(getPanel()).not.toHaveAttribute('hidden')

    await fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('opens on hover only when openOnHover is set', async () => {
    const { rerender } = renderNav()
    const trigger = screen.getByRole('menuitem', { name: 'Products' })
    await fireEvent.mouseEnter(trigger)
    expect(trigger).toHaveAttribute('data-state', 'closed')

    await rerender({ delayDuration: 0, skipDelayDuration: 0, openOnHover: true })
    await fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Products' }))
    expect(screen.getByRole('menuitem', { name: 'Products' })).toHaveAttribute('data-state', 'open')
  })

  it('opens with ArrowDown immediately and restores focus on Escape', async () => {
    renderNav()
    const trigger = screen.getByRole('menuitem', { name: 'Products' })

    trigger.focus()
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(getPanel()).not.toHaveAttribute('hidden')
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Overview' })).toHaveFocus()
    })

    await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('keeps the moved tab stop after opening a panel', async () => {
    renderNav()
    const products = screen.getByRole('menuitem', { name: 'Products' })
    products.focus()
    await fireEvent.keyDown(products, { key: 'ArrowRight' })
    const docs = screen.getByRole('menuitem', { name: 'Docs' })
    expect(docs).toHaveFocus()

    await fireEvent.keyDown(docs, { key: 'ArrowDown' })
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Guide' })).toHaveFocus()
    })
    expect(docs.tabIndex).toBe(0)
    expect(products.tabIndex).toBe(-1)
  })

  it('moves Tab out of the panel to the control after the nav', async () => {
    const { container } = renderNav()
    const after = document.createElement('button')
    after.textContent = 'After'
    container.appendChild(after)

    const products = screen.getByRole('menuitem', { name: 'Products' })
    await fireEvent.click(products)
    await fireEvent.keyDown(products, { key: 'ArrowDown' })
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Overview' })).toHaveFocus()
    })

    await fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Overview' }), { key: 'Tab' })
    expect(after).toHaveFocus()
    expect(products).toHaveAttribute('aria-expanded', 'false')
  })

  it('moves across top-level items with arrow keys and Home/End', async () => {
    renderNav()
    const products = screen.getByRole('menuitem', { name: 'Products' })
    products.focus()
    await fireEvent.keyDown(products, { key: 'ArrowRight' })
    expect(document.activeElement).toHaveTextContent('Docs')

    await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' })
    expect(document.activeElement).toHaveTextContent('About')

    await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' })
    expect(document.activeElement).toHaveTextContent('Products')

    await fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' })
    expect(document.activeElement).toHaveTextContent('About')
  })

  it('moves to the visual next item with ArrowLeft when dir is rtl', async () => {
    const { container } = renderNav()
    container.querySelector('[data-tiger-navigation-menu]')?.setAttribute('dir', 'rtl')
    const products = screen.getByRole('menuitem', { name: 'Products' })
    products.focus()
    await fireEvent.keyDown(products, { key: 'ArrowLeft' })
    expect(document.activeElement).toHaveTextContent('Docs')
  })

  it('moves ArrowDown one item per key in a two-item panel', async () => {
    render(NavigationMenu, {
      props: { delayDuration: 0, skipDelayDuration: 0 },
      slots: {
        default: () => [
          h(NavigationMenuItem, { value: 'docs' }, () => [
            h(NavigationMenuTrigger, null, () => 'Docs'),
            h(NavigationMenuContent, null, () => [
              h(NavigationMenuLink, { href: '#guide' }, () => 'Guide'),
              h(NavigationMenuLink, { href: '#api' }, () => 'API')
            ])
          ])
        ]
      }
    })
    const docs = screen.getByRole('menuitem', { name: 'Docs' })
    docs.focus()
    await fireEvent.keyDown(docs, { key: 'ArrowDown' })
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Guide' })).toHaveFocus()
    })
    await fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Guide' }), {
      key: 'ArrowDown'
    })
    expect(screen.getByRole('menuitem', { name: 'API' })).toHaveFocus()
  })

  it('skips a disabled panel link when moving with ArrowDown', async () => {
    renderNav()
    const products = screen.getByRole('menuitem', { name: 'Products' })
    await fireEvent.click(products)
    await fireEvent.keyDown(products, { key: 'ArrowDown' })
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Overview' })).toHaveFocus()
    })
    await fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Overview' }), {
      key: 'ArrowDown'
    })
    expect(screen.getByRole('menuitem', { name: 'Pricing' })).toHaveFocus()
  })

  it('opens the matching item when value is 1 and the item key is "1"', () => {
    render(NavigationMenu, {
      props: { delayDuration: 0, skipDelayDuration: 0, defaultValue: 1 },
      slots: {
        default: () => [
          h(NavigationMenuItem, { value: '1' }, () => [
            h(NavigationMenuTrigger, null, () => 'One'),
            h(NavigationMenuContent, null, () => [h(NavigationMenuLink, null, () => 'Inside')])
          ])
        ]
      }
    })
    expect(screen.getByRole('menuitem', { name: 'One' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on item click, outside click, and Escape', async () => {
    renderNav({ defaultValue: 'products' })
    expect(getPanel()).not.toHaveAttribute('hidden')

    await fireEvent.click(screen.getByText('Overview'))
    expect(getPanel()).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByRole('menuitem', { name: 'Products' }))
    await fireEvent.click(screen.getByText('Disabled'))
    expect(getPanel()).not.toHaveAttribute('hidden')

    await fireEvent.click(document.body)
    expect(getPanel()).toHaveAttribute('hidden')

    await fireEvent.click(screen.getByRole('menuitem', { name: 'Products' }))
    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('does not open when disabled, including the top-level link', async () => {
    renderNav({ disabled: true })
    const trigger = screen.getByRole('menuitem', { name: 'Products' })
    const about = screen.getByRole('menuitem', { name: 'About' })
    await fireEvent.click(trigger)
    expect(getPanel()).toHaveAttribute('hidden')
    expect(about).toHaveAttribute('aria-disabled', 'true')
    expect(about).not.toHaveAttribute('href')
    expect(about.tabIndex).toBe(-1)
  })

  it('keeps aria-controls while closed', async () => {
    renderNav({ defaultValue: 'products' })
    const products = screen.getByRole('menuitem', { name: 'Products' })
    expect(products).toHaveAttribute('aria-controls')
    await fireEvent.click(screen.getByRole('menuitem', { name: 'About' }))
    expect(products).toHaveAttribute('aria-expanded', 'false')
    expect(products).toHaveAttribute('aria-controls')
    expect(getPanel()).toHaveAttribute('hidden')
  })

  it('does not name the landmark Main by default', () => {
    renderNav()
    renderNav()
    const navs = document.querySelectorAll('[data-tiger-navigation-menu]')
    expect(navs).toHaveLength(2)
    navs.forEach((nav) => {
      expect(nav).not.toHaveAttribute('aria-label', 'Main')
    })
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
    await fireEvent.click(screen.getByRole('menuitem', { name: 'Products' }))
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
    renderNav({ openOnHover: true, delayDuration: 0, skipDelayDuration: 200 })
    const products = screen.getByRole('menuitem', { name: 'Products' })
    const docs = screen.getByRole('menuitem', { name: 'Docs' })

    await fireEvent.mouseEnter(products)
    expect(products).toHaveAttribute('aria-expanded', 'true')

    await fireEvent.mouseLeave(products)
    await fireEvent.keyDown(docs, { key: 'Enter' })

    await vi.advanceTimersByTimeAsync(200)

    expect(docs).toHaveAttribute('aria-expanded', 'true')
    expect(products).toHaveAttribute('aria-expanded', 'false')
    expect(getPanel('Docs')).not.toHaveAttribute('hidden')
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
    it('exposes menubar semantics and a menu panel for mega content', async () => {
      renderNav({ defaultValue: 'docs' })
      const menubar = screen.getByRole('menubar')
      expect(menubar).toBeInTheDocument()

      const trigger = screen.getByRole('menuitem', { name: 'Docs' })
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const controlsId = trigger.getAttribute('aria-controls')
      expect(controlsId).toBeTruthy()
      const menu = document.querySelector(`[id="${controlsId}"]`)
      expect(menu).toHaveAttribute('role', 'menu')
    })

    it('should have no accessibility violations with an open panel', async () => {
      renderNav({ defaultValue: 'products', 'aria-label': 'Site' })
      const nav = document.querySelector('[data-tiger-navigation-menu]')
      const menu = document.querySelector(
        '[data-tiger-navigation-menu-content]:not([hidden]) [role="menu"]'
      )
      expect(nav).toBeTruthy()
      expect(menu).toBeTruthy()
      await expectNoA11yViolations(nav as HTMLElement)
      await expectNoA11yViolations(menu as HTMLElement)
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
