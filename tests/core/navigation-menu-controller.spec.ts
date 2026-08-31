/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  NAVIGATION_MENU_BAR_ITEM_ATTR,
  NAVIGATION_MENU_ITEM_VALUE_ATTR,
  applyNavigationMenuPanelKey,
  createNavigationMenuHoverSession,
  getNavigationMenuRovingTabIndex,
  getNavigationMenuTabExitTarget,
  handleMenubarNavigation,
  isNavigationMenuValueOpen,
  resolveNavigationMenuTabStopValue
} from '@expcat/tigercat-core'

function barItem(
  label: string,
  value: string,
  options?: { disabled?: boolean }
): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = label
  button.setAttribute(NAVIGATION_MENU_BAR_ITEM_ATTR, '')
  button.setAttribute(NAVIGATION_MENU_ITEM_VALUE_ATTR, value)
  if (options?.disabled) {
    button.disabled = true
    button.setAttribute('aria-disabled', 'true')
  }
  return button
}

describe('navigation-menu-controller', () => {
  afterEach(() => {
    document.body.replaceChildren()
    document.documentElement.removeAttribute('dir')
    vi.useRealTimers()
  })

  it('keeps the current tab stop instead of resetting to the first item', () => {
    const first = barItem('Products', 'products')
    const second = barItem('Docs', 'docs')
    first.tabIndex = -1
    second.tabIndex = 0
    expect(
      resolveNavigationMenuTabStopValue({
        items: [first, second],
        tabStopValue: 'docs'
      })
    ).toBe('docs')
    expect(getNavigationMenuRovingTabIndex('products', 'docs')).toBe(-1)
    expect(getNavigationMenuRovingTabIndex('docs', 'docs')).toBe(0)
  })

  it('moves to the visual next item with ArrowLeft in rtl', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    const menubar = document.createElement('ul')
    const products = barItem('Products', 'products')
    const docs = barItem('Docs', 'docs')
    menubar.append(products, docs)
    document.body.append(menubar)
    products.tabIndex = 0
    docs.tabIndex = -1
    products.focus()

    const next = handleMenubarNavigation(
      menubar,
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    )
    expect(next).toBe(docs)
    expect(document.activeElement).toBe(docs)
    expect(docs.tabIndex).toBe(0)
    expect(products.tabIndex).toBe(-1)
  })

  it('closes a hover session only for the matching item, including 1 vs "1"', () => {
    vi.useFakeTimers()
    let value: string | number | null = 1
    const session = createNavigationMenuHoverSession({
      getDelayDuration: () => 0,
      getSkipDelayDuration: () => 50,
      getValue: () => value,
      setValue: (next) => {
        value = next
      }
    })

    session.scheduleClose('1')
    vi.advanceTimersByTime(50)
    expect(value).toBeNull()
    expect(isNavigationMenuValueOpen(1, value)).toBe(false)
  })

  it('does not close a later item after a pending hover close', () => {
    vi.useFakeTimers()
    let value: string | number | null = 'products'
    const session = createNavigationMenuHoverSession({
      getDelayDuration: () => 0,
      getSkipDelayDuration: () => 200,
      getValue: () => value,
      setValue: (next) => {
        value = next
      }
    })

    session.scheduleClose('products')
    session.scheduleOpen('docs')
    vi.advanceTimersByTime(200)
    expect(value).toBe('docs')
  })

  it('maps panel Tab to tab-exit and ArrowLeft to close', () => {
    const panel = document.createElement('div')
    const tab = applyNavigationMenuPanelKey({
      event: new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }),
      panel
    })
    expect(tab).toBe('tab-exit')

    const close = applyNavigationMenuPanelKey({
      event: new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
      panel
    })
    expect(close).toBe('close-to-trigger')
  })

  it('resolves Tab exit to the control after the nav, not a node after the portal', () => {
    const before = document.createElement('button')
    before.textContent = 'Before'
    const nav = document.createElement('nav')
    const trigger = barItem('Products', 'products')
    trigger.tabIndex = 0
    nav.append(trigger)
    const after = document.createElement('button')
    after.textContent = 'After'
    const portal = document.createElement('div')
    const panel = document.createElement('div')
    const item = document.createElement('button')
    item.textContent = 'Overview'
    item.tabIndex = -1
    panel.append(item)
    portal.append(panel)
    document.body.append(before, nav, after, portal)

    expect(getNavigationMenuTabExitTarget(nav, panel, false)).toBe(after)
    expect(getNavigationMenuTabExitTarget(nav, panel, true)).toBe(before)
  })
})
