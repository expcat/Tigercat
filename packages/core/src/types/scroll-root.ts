/**
 * Shared scroll-root input for Affix, BackTop, Anchor, and ScrollSpy.
 *
 * A CSS selector, Element, Window, Document, getter, or `undefined` (window).
 */

export type ScrollRootInput =
  | string
  | Window
  | Element
  | Document
  | (() => ScrollRootInput | null | undefined)
  | null
  | undefined
