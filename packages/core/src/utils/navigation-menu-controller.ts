/**
 * NavigationMenu open / hover / menubar / panel keyboard commits.
 * Vue/React bind DOM and controlled props; they must not copy this machine.
 */

import { handleMenuNavigation } from './focus-utils'
import { devWarn } from './dev-warn'
import { getFocusableElements } from './overlay-utils'
import {
  NAVIGATION_MENU_BAR_ITEM_ATTR,
  NAVIGATION_MENU_ITEM_VALUE_ATTR,
  getNavigationMenuBarItems,
  isNavigationMenuValueOpen,
  sameNavigationMenuValue
} from './navigation-menu-utils'
import type { NavigationMenuValue } from '../types/navigation-menu'

export function containsFocusTarget(
  container: HTMLElement | null | undefined,
  target: EventTarget | null
): boolean {
  return Boolean(container && target instanceof Node && container.contains(target))
}

export function getOpenPanelFromMenubar(menubar: HTMLElement | null): HTMLElement | null {
  if (!menubar) return null
  const trigger = menubar.querySelector<HTMLElement>('[aria-expanded="true"][aria-controls]')
  const contentId = trigger?.getAttribute('aria-controls')
  if (!contentId) return null
  return menubar.ownerDocument.getElementById(contentId)
}

export function resolveElementDir(element: HTMLElement | null | undefined): 'ltr' | 'rtl' {
  if (!element) return 'ltr'
  const marked =
    element.closest('[dir]')?.getAttribute('dir') ??
    element.ownerDocument.documentElement.getAttribute('dir')
  return marked === 'rtl' ? 'rtl' : 'ltr'
}

export function getNavigationMenuItemValue(element: HTMLElement | null): string | null {
  if (!element) return null
  return element.getAttribute(NAVIGATION_MENU_ITEM_VALUE_ATTR)
}

export function getNavigationMenuRovingTabIndex(
  itemValue: NavigationMenuValue,
  tabStopValue: NavigationMenuValue | null | undefined
): 0 | -1 {
  if (tabStopValue == null || tabStopValue === '') return -1
  return sameNavigationMenuValue(itemValue, tabStopValue) ? 0 : -1
}

export function resolveNavigationMenuTabStopValue(options: {
  items: HTMLElement[]
  tabStopValue: NavigationMenuValue | null | undefined
}): string | null {
  const { items, tabStopValue } = options
  if (items.length === 0) return null
  if (tabStopValue != null && tabStopValue !== '') {
    const match = items.find((el) =>
      sameNavigationMenuValue(getNavigationMenuItemValue(el) ?? '', tabStopValue)
    )
    if (match) return getNavigationMenuItemValue(match)
  }
  return getNavigationMenuItemValue(items[0])
}

function isInlineEndKey(key: string, dir: 'ltr' | 'rtl'): boolean {
  return dir === 'rtl' ? key === 'ArrowLeft' : key === 'ArrowRight'
}

function isInlineStartKey(key: string, dir: 'ltr' | 'rtl'): boolean {
  return dir === 'rtl' ? key === 'ArrowRight' : key === 'ArrowLeft'
}

export function getMenubarNavigationTarget(
  container: HTMLElement,
  event: KeyboardEvent
): HTMLElement | null {
  const items = getNavigationMenuBarItems(container)
  if (items.length === 0) return null

  const dir = resolveElementDir(container)
  const activeElement = container.ownerDocument?.activeElement ?? null
  const currentIndex = items.indexOf(activeElement as HTMLElement)
  let nextIndex = -1

  if (isInlineEndKey(event.key, dir)) {
    nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
  } else if (isInlineStartKey(event.key, dir)) {
    nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = items.length - 1
  } else {
    return null
  }

  return items[nextIndex] ?? null
}

/**
 * Handle ArrowLeft/ArrowRight/Home/End within a menubar.
 * Updates roving tabindex and focuses the next item. Returns that item.
 */
export function handleMenubarNavigation(
  container: HTMLElement,
  event: KeyboardEvent
): HTMLElement | null {
  const next = getMenubarNavigationTarget(container, event)
  if (!next) return null

  event.preventDefault()
  const items = getNavigationMenuBarItems(container)
  items.forEach((el) => {
    el.tabIndex = el === next ? 0 : -1
  })
  next.focus()
  return next
}

export type NavigationMenuPanelKeyAction =
  'menu-nav' | 'close-to-trigger' | 'move-menubar-next' | 'tab-exit' | 'shift-tab-exit'

export function getNavigationMenuPanelKeyAction(
  event: KeyboardEvent,
  dir: 'ltr' | 'rtl' = 'ltr'
): NavigationMenuPanelKeyAction | null {
  if (event.key === 'Tab') return event.shiftKey ? 'shift-tab-exit' : 'tab-exit'
  if (event.key === 'Escape') return 'close-to-trigger'
  if (isInlineStartKey(event.key, dir)) return 'close-to-trigger'
  if (isInlineEndKey(event.key, dir)) return 'move-menubar-next'
  if (
    event.key === 'ArrowDown' ||
    event.key === 'ArrowUp' ||
    event.key === 'Home' ||
    event.key === 'End'
  ) {
    return 'menu-nav'
  }
  return null
}

export function applyNavigationMenuPanelKey(options: {
  event: KeyboardEvent
  panel: HTMLElement
  dir?: 'ltr' | 'rtl'
}): NavigationMenuPanelKeyAction | null {
  const action = getNavigationMenuPanelKeyAction(options.event, options.dir ?? 'ltr')
  if (action === 'menu-nav') {
    handleMenuNavigation(options.panel, options.event)
    return action
  }
  if (action) options.event.preventDefault()
  return action
}

export function getNavigationMenuTabExitTarget(
  nav: HTMLElement,
  panel: HTMLElement | null,
  shiftKey: boolean
): HTMLElement | null {
  const ownerDocument = nav.ownerDocument
  const focusables = getFocusableElements(ownerDocument.body).filter(
    (el) => !panel?.contains(el) && el !== panel
  )
  const navFocusables = focusables.filter((el) => nav.contains(el))
  if (navFocusables.length === 0) return null

  const edge = shiftKey ? navFocusables[0] : navFocusables[navFocusables.length - 1]
  const index = focusables.indexOf(edge)
  if (index < 0) return null
  return shiftKey ? (focusables[index - 1] ?? null) : (focusables[index + 1] ?? null)
}

export function isFocusInsideNavigationMenu(
  nav: HTMLElement | null,
  menubar: HTMLElement | null,
  relatedTarget: EventTarget | null
): boolean {
  if (containsFocusTarget(nav, relatedTarget)) return true
  return containsFocusTarget(getOpenPanelFromMenubar(menubar), relatedTarget)
}

export function createNavigationMenuHoverSession(options: {
  getDelayDuration: () => number
  getSkipDelayDuration: () => number
  getValue: () => NavigationMenuValue | null
  setValue: (next: NavigationMenuValue | null) => void
  isDisabled?: () => boolean
}): {
  scheduleOpen: (itemValue: NavigationMenuValue) => void
  scheduleClose: (itemValue: NavigationMenuValue) => void
  cancelClose: () => void
  clear: () => void
} {
  let openTimer: ReturnType<typeof setTimeout> | null = null
  let closeTimer: ReturnType<typeof setTimeout> | null = null
  let lastOpenAt = 0

  const clearOpen = () => {
    if (!openTimer) return
    clearTimeout(openTimer)
    openTimer = null
  }

  const clearClose = () => {
    if (!closeTimer) return
    clearTimeout(closeTimer)
    closeTimer = null
  }

  const clear = () => {
    clearOpen()
    clearClose()
  }

  const scheduleOpen = (itemValue: NavigationMenuValue) => {
    if (options.isDisabled?.()) return
    clearClose()

    const skip = lastOpenAt > 0 && Date.now() - lastOpenAt < options.getSkipDelayDuration()
    const delay = skip ? 0 : options.getDelayDuration()

    const apply = () => {
      lastOpenAt = Date.now()
      options.setValue(itemValue)
      openTimer = null
    }

    if (delay <= 0) {
      apply()
      return
    }

    clearOpen()
    openTimer = setTimeout(apply, delay)
  }

  const scheduleClose = (itemValue: NavigationMenuValue) => {
    clearOpen()

    const close = () => {
      if (isNavigationMenuValueOpen(itemValue, options.getValue())) {
        options.setValue(null)
      }
      closeTimer = null
    }

    const delay = options.getSkipDelayDuration()
    if (delay <= 0) {
      close()
      return
    }

    clearClose()
    closeTimer = setTimeout(close, delay)
  }

  return {
    scheduleOpen,
    scheduleClose,
    cancelClose: clearClose,
    clear
  }
}

export function warnNavigationMenuOpenWithoutValue(
  open: boolean | undefined,
  hasValue: boolean
): void {
  if (open !== true || hasValue) return
  devWarn(
    'NavigationMenu.open.noValue',
    'NavigationMenu: `open={true}` does not open a panel without `value` / `defaultValue`.'
  )
}

export function isNavigationMenuBarItem(element: Element): boolean {
  return element.hasAttribute(NAVIGATION_MENU_BAR_ITEM_ATTR)
}
