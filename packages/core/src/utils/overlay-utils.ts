import { isEscapeKey, isTabKey, type KeyLikeEvent } from './a11y-utils'
import { isBrowser } from './env'

let bodyScrollLockCount = 0
let previousBodyOverflow = ''

type EscapeDismissLayer = () => HTMLElement | null

interface EscapeDismissEntry {
  dismiss: () => void
  getLayer?: EscapeDismissLayer
  order: number
}

const escapeDismissStacks = new WeakMap<Document, EscapeDismissEntry[]>()
let escapeDismissOrder = 0

type ComposedPathEvent = Event & {
  composedPath?: () => EventTarget[]
}

function getComposedPath(event: Event): EventTarget[] {
  const eventWithPath = event as ComposedPathEvent
  if (typeof eventWithPath.composedPath === 'function') {
    return eventWithPath.composedPath()
  }
  return []
}

function isNode(value: unknown): value is Node {
  return typeof Node !== 'undefined' && value instanceof Node
}

export type ElementLike = {
  contains: (node: Node) => boolean
}

export interface IsEventOutsideOptions {
  ignore?: Array<ElementLike | null | undefined>
}

export type MaskClickLikeEvent = {
  target: EventTarget | null
  currentTarget: EventTarget | null
}

export function shouldCloseOnMaskClick(event: MaskClickLikeEvent, maskClosable: boolean): boolean {
  return maskClosable && event.target === event.currentTarget
}

export function isEventOutside(
  event: Event,
  containers: Array<ElementLike | null | undefined>,
  options: IsEventOutsideOptions = {}
): boolean {
  const path = getComposedPath(event)
  const target = (event as { target?: unknown }).target

  const allContainers = [...containers, ...(options.ignore ?? [])].filter((el): el is ElementLike =>
    Boolean(el)
  )

  const isInsideAny = allContainers.some((container) => {
    if (path.length > 0 && path.includes(container as unknown as EventTarget)) {
      return true
    }

    if (isNode(target) && container.contains(target)) {
      return true
    }

    return false
  })

  return !isInsideAny
}

function isDisabledFieldset(element: HTMLElement): boolean {
  return element instanceof HTMLFieldSetElement && element.disabled
}

function isInertElement(element: HTMLElement): boolean {
  return Boolean(element.inert) || element.hasAttribute('inert')
}

export function getFocusableElements(root: ParentNode): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'summary',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ]

  const elements = Array.from(root.querySelectorAll<HTMLElement>(selectors.join(',')))

  return elements.filter((el) => {
    let current: HTMLElement | null = el
    while (current) {
      if (current.hidden || current.getAttribute('aria-hidden') === 'true') return false
      if (isInertElement(current) || isDisabledFieldset(current)) return false
      if (current.style.display === 'none' || current.style.visibility === 'hidden') return false

      const view: Window | null = current.ownerDocument.defaultView
      const style: CSSStyleDeclaration | undefined = view?.getComputedStyle(current)
      if (style?.display === 'none' || style?.visibility === 'hidden') return false

      if (current === root) break
      current = current.parentElement
    }
    if (el.getAttribute('disabled') !== null) return false
    if (el.tabIndex < 0) return false
    return true
  })
}

export interface FocusTrapNavigation {
  shouldHandle: boolean
  next?: HTMLElement
}

export function getFocusTrapNavigation(
  event: KeyLikeEvent & { shiftKey?: boolean },
  focusables: HTMLElement[],
  activeElement: Element | null
): FocusTrapNavigation {
  if (!isTabKey(event)) return { shouldHandle: false }
  if (focusables.length === 0) return { shouldHandle: true }

  const currentIndex = activeElement ? focusables.findIndex((el) => el === activeElement) : -1

  const isShift = Boolean(event.shiftKey)

  if (currentIndex === -1) {
    return {
      shouldHandle: true,
      next: isShift ? focusables[focusables.length - 1] : focusables[0]
    }
  }

  const isFirst = currentIndex === 0
  const isLast = currentIndex === focusables.length - 1

  if (isShift && isFirst) {
    return { shouldHandle: true, next: focusables[focusables.length - 1] }
  }

  if (!isShift && isLast) {
    return { shouldHandle: true, next: focusables[0] }
  }

  return { shouldHandle: false }
}

function compareEscapeDismissEntries(
  ownerDocument: Document,
  a: EscapeDismissEntry,
  b: EscapeDismissEntry
): number {
  const aLayer = a.getLayer?.()
  const bLayer = b.getLayer?.()

  if (aLayer && bLayer && aLayer !== bLayer) {
    if (aLayer.contains(bLayer)) return -1
    if (bLayer.contains(aLayer)) return 1

    const view = ownerDocument.defaultView
    const aZIndex = Number.parseFloat(view?.getComputedStyle(aLayer).zIndex ?? '')
    const bZIndex = Number.parseFloat(view?.getComputedStyle(bLayer).zIndex ?? '')
    if (Number.isFinite(aZIndex) && Number.isFinite(bZIndex) && aZIndex !== bZIndex) {
      return aZIndex - bZIndex
    }

    const position = aLayer.compareDocumentPosition(bLayer)
    if (position & 4) return -1
    if (position & 2) return 1
  }

  return a.order - b.order
}

/** Register an overlay in the document Escape stack. Only the topmost entry is dismissed. */
export function registerEscapeDismiss(
  ownerDocument: Document,
  dismiss: () => void,
  getLayer?: EscapeDismissLayer
): () => void {
  let stack = escapeDismissStacks.get(ownerDocument)
  if (!stack) {
    stack = []
    escapeDismissStacks.set(ownerDocument, stack)
    const entries = stack
    ownerDocument.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || !isEscapeKey(event)) return
      const topmost = entries.reduce<EscapeDismissEntry | undefined>((current, entry) => {
        if (!current) return entry
        return compareEscapeDismissEntries(ownerDocument, current, entry) < 0 ? entry : current
      }, undefined)
      if (topmost) {
        event.preventDefault()
        topmost.dismiss()
      }
    })
  }

  const entry = { dismiss, getLayer, order: ++escapeDismissOrder }
  stack.push(entry)

  return () => {
    const index = stack.lastIndexOf(entry)
    if (index >= 0) stack.splice(index, 1)
  }
}

export function lockBodyScroll(targetDocument?: Document): () => void {
  const resolvedDocument = targetDocument ?? (isBrowser() ? document : undefined)
  const body = resolvedDocument?.body
  if (!body) return () => undefined

  let active = true

  if (bodyScrollLockCount === 0) {
    previousBodyOverflow = body.style.overflow
    body.style.overflow = 'hidden'
  }

  bodyScrollLockCount += 1

  return () => {
    if (!active) return
    active = false
    bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1)

    if (bodyScrollLockCount === 0) {
      body.style.overflow = previousBodyOverflow
      previousBodyOverflow = ''
    }
  }
}

export function getBodyScrollLockCount(): number {
  return bodyScrollLockCount
}

function isLiveRegionElement(element: HTMLElement): boolean {
  return (
    element.hasAttribute('aria-live') ||
    element.id.startsWith('tigercat-live-region') ||
    element.id.startsWith('tiger-live-region')
  )
}

/** Inert every sibling between the overlay and document.body so pointer input cannot leave. */
export function setBackgroundInert(overlayRoot: HTMLElement): () => void {
  const restored: Array<{ element: HTMLElement; wasInert: boolean }> = []
  let current: HTMLElement | null = overlayRoot

  while (current && current !== current.ownerDocument.body) {
    const parent = current.parentElement
    if (!parent) break

    for (const child of Array.from(parent.children)) {
      if (
        !(child instanceof HTMLElement) ||
        child === current ||
        current.contains(child) ||
        isLiveRegionElement(child)
      ) {
        continue
      }
      restored.push({ element: child, wasInert: isInertElement(child) })
      child.setAttribute('inert', '')
      child.inert = true
    }

    if (parent === current.ownerDocument.body) break
    current = parent
  }

  return () => {
    for (const { element, wasInert } of restored) {
      if (wasInert) continue
      element.inert = false
      element.removeAttribute('inert')
    }
  }
}

export interface FocusTrapOptions {
  initialFocus?: HTMLElement | null
  returnFocusOnDeactivate?: boolean
  escapeDeactivates?: boolean
  onEscape?: () => void
}

export interface FocusTrap {
  activate: () => void
  deactivate: () => void
}

/** Thin wrapper around the overlay Tab cycle used by Modal / Drawer / Tour. */
export function createFocusTrap(container: HTMLElement, options: FocusTrapOptions = {}): FocusTrap {
  if (!isBrowser()) {
    return {
      activate() {},
      deactivate() {}
    }
  }

  const {
    initialFocus = null,
    returnFocusOnDeactivate = true,
    escapeDeactivates = true,
    onEscape
  } = options

  let previouslyFocused: HTMLElement | null = null
  let active = false

  function handleKeyDown(event: KeyboardEvent): void {
    if (!active) return

    if (escapeDeactivates && isEscapeKey(event)) {
      event.preventDefault()
      onEscape?.()
      return
    }

    const focusables = getFocusableElements(container)
    const navigation = getFocusTrapNavigation(
      event,
      focusables,
      container.ownerDocument.activeElement
    )
    if (!navigation.shouldHandle) return

    event.preventDefault()
    navigation.next?.focus()
  }

  return {
    activate() {
      if (active) return
      active = true
      previouslyFocused = container.ownerDocument.activeElement as HTMLElement | null
      container.ownerDocument.addEventListener('keydown', handleKeyDown, true)

      if (initialFocus) {
        initialFocus.focus()
        return
      }
      const focusables = getFocusableElements(container)
      focusables[0]?.focus()
    },
    deactivate() {
      if (!active) return
      active = false
      container.ownerDocument.removeEventListener('keydown', handleKeyDown, true)

      if (returnFocusOnDeactivate && previouslyFocused) {
        previouslyFocused.focus()
        previouslyFocused = null
      }
    }
  }
}
