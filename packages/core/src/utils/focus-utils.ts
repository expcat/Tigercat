import { isBrowser } from './env'

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

export function captureActiveElement(doc?: Document): HTMLElement | null {
  return getActiveElement(doc ?? (isBrowser() ? document : undefined))
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

const TEXT_EDITING_INPUT_TYPES = new Set([
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
  'number',
  'date',
  'time',
  'datetime-local'
])

/** Arrow keys inside inputs, textareas, and contenteditable stay with the caret. */
export function isTextEditingTarget(target: EventTarget | null): boolean {
  if (!target || typeof Element === 'undefined' || !(target instanceof Element)) return false
  if ((target as HTMLElement).isContentEditable) return true
  const tag = target.tagName
  if (tag === 'TEXTAREA') return true
  if (tag !== 'INPUT') return false
  const type = (target.getAttribute('type') ?? 'text').toLowerCase()
  return TEXT_EDITING_INPUT_TYPES.has(type)
}

export interface TypeaheadBuffer {
  push(character: string, now?: number): string
  reset(): void
  query(): string
}

const TYPEAHEAD_TIMEOUT_MS = 500

/**
 * Shared typeahead buffer for menu, menubar, and tree.
 * The same letter cycles matches; a pause clears the buffer.
 */
export function createTypeaheadBuffer(timeoutMs = TYPEAHEAD_TIMEOUT_MS): TypeaheadBuffer {
  let buffer = ''
  let stamp = 0
  return {
    push(character: string, now = Date.now()) {
      if (now - stamp > timeoutMs) buffer = ''
      stamp = now
      buffer += character
      return buffer
    },
    reset() {
      buffer = ''
      stamp = 0
    },
    query() {
      return buffer
    }
  }
}

/** `1` and `'1'` are different keys. One prefix for menu, tabs, tree, and navigation. */
export function typedKeyId(key: string | number): string {
  return typeof key === 'number' ? `n:${key}` : `s:${key}`
}

export function isTypeaheadCharacter(
  key: string,
  modifiers: { altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {}
): boolean {
  if (modifiers.altKey || modifiers.ctrlKey || modifiers.metaKey) return false
  if (key.length !== 1) return false
  return key.charCodeAt(0) > 32
}

/**
 * Index of the next enabled label that starts with `query`.
 * A repeated single letter cycles from the item after `fromIndex`.
 */
export function findTypeaheadMatchIndex(
  labels: readonly string[],
  query: string,
  fromIndex: number,
  disabled?: readonly boolean[]
): number {
  const raw = query.toLocaleLowerCase()
  if (!raw || labels.length === 0) return -1
  const repeated = raw.length > 1 && [...raw].every((char) => char === raw[0])
  const needle = repeated ? raw[0] : raw
  const start = repeated ? fromIndex + 1 : fromIndex < 0 ? 0 : fromIndex
  for (let offset = 0; offset < labels.length; offset++) {
    const index = (start + offset + labels.length) % labels.length
    if (disabled?.[index]) continue
    if (labels[index].trim().toLocaleLowerCase().startsWith(needle)) return index
  }
  return -1
}

function isHiddenOrInert(element: HTMLElement, stopAt: HTMLElement): boolean {
  let current: HTMLElement | null = element
  while (current && current !== stopAt) {
    if (current.hidden || current.hasAttribute('hidden')) return true
    if (current.inert || current.hasAttribute('inert')) return true
    if (current.getAttribute('aria-hidden') === 'true') return true
    current = current.parentElement
  }
  return false
}

/**
 * Get enabled, visible menu items in the nearest `role="menu"` (or `container`
 * when it has no menu). Nested / hidden submenu items are excluded.
 */
export function getMenuItems(container: HTMLElement): HTMLElement[] {
  const menu = container.matches('[role="menu"]')
    ? container
    : (container.querySelector<HTMLElement>(':scope [role="menu"]') ?? container)

  return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter((el) => {
    const owner = el.closest<HTMLElement>('[role="menu"]')
    if (owner && owner !== menu) return false
    const ariaDisabled = el.getAttribute('aria-disabled')
    if (el.hasAttribute('disabled') || (ariaDisabled !== null && ariaDisabled !== 'false')) {
      return false
    }
    if (isHiddenOrInert(el, menu)) return false
    return true
  })
}

/**
 * Handle keyboard navigation within a menu (↑↓/Home/End)
 * Returns true if the event was handled
 */
export function handleMenuNavigation(container: HTMLElement, event: KeyboardEvent): boolean {
  if (isTextEditingTarget(event.target)) return false
  const items = getMenuItems(container)
  if (items.length === 0) return false

  const activeElement =
    container.ownerDocument?.activeElement ?? (isBrowser() ? document.activeElement : null)
  const currentIndex = items.indexOf(activeElement as HTMLElement)
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
export function focusMenuItem(container: HTMLElement, edge: 'first' | 'last'): boolean {
  const items = getMenuItems(container)
  if (items.length === 0) return false
  const item = edge === 'last' ? items[items.length - 1] : items[0]
  item.focus()
  return true
}

export function focusFirstMenuItem(container: HTMLElement): boolean {
  return focusMenuItem(container, 'first')
}

export function focusLastMenuItem(container: HTMLElement): boolean {
  return focusMenuItem(container, 'last')
}

/** Focus the first item once the panel is painted (not `hidden` / `visibility:hidden`). */
export function focusFirstMenuItemWhenVisible(container: HTMLElement, attempts = 16): boolean {
  const tryFocus = (): boolean => {
    if (container.hidden || container.hasAttribute('hidden')) return false
    if (
      typeof getComputedStyle === 'function' &&
      getComputedStyle(container).visibility === 'hidden'
    ) {
      return false
    }
    return focusFirstMenuItem(container)
  }
  if (tryFocus()) return true
  if (typeof requestAnimationFrame !== 'function' || attempts <= 0) return false
  const tick = (left: number): void => {
    requestAnimationFrame(() => {
      if (!tryFocus() && left > 1) tick(left - 1)
    })
  }
  tick(attempts)
  return false
}
