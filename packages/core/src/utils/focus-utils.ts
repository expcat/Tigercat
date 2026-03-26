export interface FocusElementOptions {
  preventScroll?: boolean
}

export function isHTMLElement(value: unknown): value is HTMLElement {
  if (typeof HTMLElement === 'undefined') return false
  return value instanceof HTMLElement
}

export function getActiveElement(doc?: Document): HTMLElement | null {
  const active = doc?.activeElement
  return isHTMLElement(active) ? active : null
}

export function captureActiveElement(doc: Document = document): HTMLElement | null {
  return getActiveElement(doc)
}

export function focusElement(
  element: HTMLElement | null | undefined,
  options?: FocusElementOptions
): boolean {
  if (!element) return false
  if (typeof element.focus !== 'function') return false

  try {
    if (options) {
      element.focus(options)
    } else {
      element.focus()
    }
    return true
  } catch {
    return false
  }
}

export function focusFirst(
  candidates: Array<HTMLElement | null | undefined>,
  options?: FocusElementOptions
): HTMLElement | null {
  for (const el of candidates) {
    if (focusElement(el, options)) return el ?? null
  }
  return null
}

export function restoreFocus(
  previous: HTMLElement | null | undefined,
  options?: FocusElementOptions
): boolean {
  return focusElement(previous, options)
}

/**
 * Get all focusable menu items within a container
 */
export function getMenuItems(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])'))
}

/**
 * Handle keyboard navigation within a menu (↑↓/Home/End)
 * Returns true if the event was handled
 */
export function handleMenuNavigation(container: HTMLElement, event: KeyboardEvent): boolean {
  const items = getMenuItems(container)
  if (items.length === 0) return false

  const currentIndex = items.indexOf(document.activeElement as HTMLElement)
  let nextIndex = -1

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      break
    case 'ArrowUp':
      event.preventDefault()
      nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      break
    case 'Home':
      event.preventDefault()
      nextIndex = 0
      break
    case 'End':
      event.preventDefault()
      nextIndex = items.length - 1
      break
    default:
      return false
  }

  if (nextIndex >= 0) {
    items[nextIndex].focus()
    return true
  }
  return false
}

/**
 * Focus the first non-disabled menu item in a container
 */
export function focusFirstMenuItem(container: HTMLElement): boolean {
  const items = getMenuItems(container)
  if (items.length === 0) return false
  items[0].focus()
  return true
}
