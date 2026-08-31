/**
 * Shared scroll-root resolution for Affix, BackTop, Anchor, and ScrollSpy.
 *
 * One input type (selector / Element / Window / getter) and one fallback:
 * invalid or missing targets become `window` and `devWarn`, they never throw.
 */

import type { ScrollRootInput } from '../types/scroll-root'
import { devWarn } from './dev-warn'
import { isBrowser } from './env'

export type { ScrollRootInput }

export interface ScrollRootRect {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface ResolvedScrollRoot {
  /** Window or Element. `null` only when `document` is unavailable (SSR). */
  target: Window | Element | null
  isWindow: boolean
  getRect: () => ScrollRootRect
}

const EMPTY_RECT: ScrollRootRect = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0
}

const MAX_GETTER_DEPTH = 4

function windowRect(): ScrollRootRect {
  if (!isBrowser()) return { ...EMPTY_RECT }
  return {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight
  }
}

function elementRect(el: Element): ScrollRootRect {
  const r = el.getBoundingClientRect()
  return {
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height
  }
}

export function createWindowScrollRoot(): ResolvedScrollRoot {
  return {
    target: isBrowser() ? window : null,
    isWindow: true,
    getRect: windowRect
  }
}

function isWindowValue(value: unknown): value is Window {
  return isBrowser() && value === window
}

function isElementValue(value: unknown): value is Element {
  return typeof Element !== 'undefined' && value instanceof Element
}

/**
 * `querySelectorAll` that never throws on a bad selector.
 */
export function querySelectorAllSafe(
  selector: string,
  root: ParentNode | null | undefined = isBrowser() ? document : null
): Element[] {
  if (!root || typeof root.querySelectorAll !== 'function') return []
  try {
    return Array.from(root.querySelectorAll(selector))
  } catch {
    return []
  }
}

export function querySelectorSafe(selector: string, root?: ParentNode | null): Element | null {
  return querySelectorAllSafe(selector, root)[0] ?? null
}

function resolveSelector(selector: string): ResolvedScrollRoot {
  if (!isBrowser()) return createWindowScrollRoot()

  let matches: Element[]
  try {
    matches = Array.from(document.querySelectorAll(selector))
  } catch {
    devWarn(
      `scrollRoot.invalidSelector:${selector}`,
      `[Tigercat] Invalid scroll target selector "${selector}". Falling back to window.`
    )
    return createWindowScrollRoot()
  }

  if (matches.length === 0) {
    devWarn(
      `scrollRoot.missing:${selector}`,
      `[Tigercat] Scroll target "${selector}" matched no elements. Falling back to window.`
    )
    return createWindowScrollRoot()
  }

  if (matches.length > 1) {
    devWarn(
      `scrollRoot.multiple:${selector}`,
      `[Tigercat] Scroll target "${selector}" matched ${matches.length} elements. Using the first.`
    )
  }

  const el = matches[0]
  return {
    target: el,
    isWindow: false,
    getRect: () => elementRect(el)
  }
}

/**
 * Resolve a scroll root from a CSS selector, Element, Window, Document, or getter.
 *
 * Invalid selectors, empty results, and thrown getters fall back to `window`.
 * Multiple matches use the first node and warn.
 */
export function resolveScrollRoot(input?: ScrollRootInput, depth: number = 0): ResolvedScrollRoot {
  if (depth > MAX_GETTER_DEPTH) {
    devWarn(
      'scrollRoot.cycle',
      '[Tigercat] Scroll target getter nested too deeply. Falling back to window.'
    )
    return createWindowScrollRoot()
  }

  if (input === undefined || input === null) {
    return createWindowScrollRoot()
  }

  if (typeof input === 'function') {
    try {
      return resolveScrollRoot(input(), depth + 1)
    } catch {
      devWarn('scrollRoot.getter', '[Tigercat] Scroll target getter threw. Falling back to window.')
      return createWindowScrollRoot()
    }
  }

  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (!trimmed) return createWindowScrollRoot()
    return resolveSelector(trimmed)
  }

  if (isWindowValue(input)) {
    return createWindowScrollRoot()
  }

  if (typeof Document !== 'undefined' && input instanceof Document) {
    return createWindowScrollRoot()
  }

  if (isElementValue(input)) {
    return {
      target: input,
      isWindow: false,
      getRect: () => elementRect(input)
    }
  }

  devWarn(
    'scrollRoot.invalid',
    '[Tigercat] Scroll target is not a selector, Element, or Window. Falling back to window.'
  )
  return createWindowScrollRoot()
}

export function getScrollRootEventTarget(root: ResolvedScrollRoot): EventTarget | null {
  if (!root.target) return null
  return root.isWindow && isBrowser() ? window : root.target
}

export function isSameScrollRoot(a: ResolvedScrollRoot, b: ResolvedScrollRoot): boolean {
  if (a.isWindow && b.isWindow) return true
  return a.target === b.target
}
