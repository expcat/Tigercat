/**
 * Shared scroll-root input for Affix, BackTop, Anchor, and ScrollSpy.
 *
 * A CSS selector, Element, Window, Document, getter, `null` (window), or
 * `undefined` (nearest overflow ancestor when `from` is passed, else window).
 */

export type ScrollRootInput =
  | string
  | Window
  | Element
  | Document
  | (() => ScrollRootInput | null | undefined)
  | null
  | undefined
