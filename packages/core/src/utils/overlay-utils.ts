import { isEscapeKey, isTabKey, type KeyLikeEvent } from './a11y-utils'
import { isBrowser } from './env'
import { prefersReducedMotion } from './transition'

interface BodyScrollLockState {
  count: number
  scrollX: number
  scrollY: number
  previousOverflow: string
  previousPaddingRight: string
  previousPosition: string
  previousTop: string
  previousLeft: string
  previousRight: string
  previousWidth: string
  previousHtmlOverflow: string
}

const bodyScrollLocks = new WeakMap<Document, BodyScrollLockState>()

type EscapeDismissLayer = () => HTMLElement | null

interface EscapeDismissEntry {
  dismiss: () => void
  getLayer?: EscapeDismissLayer
  order: number
}

const escapeDismissStacks = new WeakMap<Document, EscapeDismissEntry[]>()
const escapeDismissListeners = new WeakMap<Document, (event: KeyboardEvent) => void>()
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

export interface OverlayPresence {
  open: boolean
  hasOpened: boolean
  leaving: boolean
  destroyOnClose: boolean
}

/** Open and leave frames always render. `destroyOnClose` only gates the idle closed tree. */
export function shouldRenderOverlay(presence: OverlayPresence): boolean {
  if (presence.open || presence.leaving) return true
  if (presence.destroyOnClose) return false
  return presence.hasOpened
}

export function isOverlayVisuallyHidden(open: boolean, leaving: boolean): boolean {
  return !open && !leaving
}

export const OVERLAY_SWIPE_HANDLE_ATTR = 'data-tiger-overlay-handle'

const OVERLAY_DRAG_INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]'

export function isOverlaySwipeHandleTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(`[${OVERLAY_SWIPE_HANDLE_ATTR}]`))
}

export function isScrollAtSwipeCloseEdge(
  element: HTMLElement,
  direction: 'left' | 'right' | 'up' | 'down'
): boolean {
  const epsilon = 1
  if (direction === 'down') return element.scrollTop <= epsilon
  if (direction === 'up') {
    return element.scrollTop + element.clientHeight >= element.scrollHeight - epsilon
  }
  if (direction === 'right') return element.scrollLeft <= epsilon
  return element.scrollLeft + element.clientWidth >= element.scrollWidth - epsilon
}

export function canStartOverlaySwipeClose(options: {
  target: EventTarget | null
  scrollContainer: HTMLElement | null
  closeDirection: 'left' | 'right' | 'up' | 'down'
}): boolean {
  if (isOverlaySwipeHandleTarget(options.target)) return true
  if (!options.scrollContainer) return true
  return isScrollAtSwipeCloseEdge(options.scrollContainer, options.closeDirection)
}

export function isOverlayDragHandleEvent(event: { target: EventTarget | null }): boolean {
  const target = event.target
  if (!(target instanceof Element)) return false
  return !target.closest(OVERLAY_DRAG_INTERACTIVE_SELECTOR)
}

export function clampOverlayDragOffset(
  origin: { x: number; y: number },
  delta: { x: number; y: number },
  startRect: { left: number; top: number; width: number; height: number },
  viewport: { width: number; height: number },
  minVisible = 48
): { x: number; y: number } {
  const minX = minVisible - startRect.width - startRect.left + origin.x
  const maxX = viewport.width - minVisible - startRect.left + origin.x
  const minY = minVisible - startRect.height - startRect.top + origin.y
  const maxY = viewport.height - minVisible - startRect.top + origin.y
  return {
    x: Math.min(maxX, Math.max(minX, origin.x + delta.x)),
    y: Math.min(maxY, Math.max(minY, origin.y + delta.y))
  }
}

function cssTimeToMs(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return 0
  if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed) || 0
  if (trimmed.endsWith('s')) return (Number.parseFloat(trimmed) || 0) * 1000
  return 0
}

/** Longest transition-duration + delay on this element. 0 when nothing is transitioning. */
export function readTransitionDurationMs(element: HTMLElement): number {
  const view = element.ownerDocument.defaultView
  if (!view || typeof view.getComputedStyle !== 'function') return 0
  const style = view.getComputedStyle(element)
  const durations = style.transitionDuration.split(',')
  const delays = (style.transitionDelay || '0s').split(',')
  let max = 0
  durations.forEach((part, index) => {
    const duration = cssTimeToMs(part)
    if (duration <= 0) return
    const delay = cssTimeToMs(delays[index] ?? delays[0] ?? '0s')
    max = Math.max(max, duration + delay)
  })
  return max
}

/**
 * Run `onFinish` when `element`'s own transition ends.
 * Reduced motion, a missing element, or a 0ms transition finishes immediately.
 */
export function whenOverlayTransitionEnds(
  element: HTMLElement | null | undefined,
  onFinish: () => void,
  reducedMotion?: boolean
): () => void {
  if (!element || !isBrowser() || (reducedMotion ?? prefersReducedMotion())) {
    onFinish()
    return () => undefined
  }
  const duration = readTransitionDurationMs(element)
  if (duration <= 0) {
    onFinish()
    return () => undefined
  }

  let settled = false
  let timer = 0
  const finish = () => {
    if (settled) return
    settled = true
    element.removeEventListener('transitionend', onEnd)
    element.ownerDocument.defaultView?.clearTimeout(timer)
    onFinish()
  }
  const onEnd = (event: TransitionEvent) => {
    if (event.target !== element) return
    finish()
  }
  element.addEventListener('transitionend', onEnd)
  timer = element.ownerDocument.defaultView?.setTimeout(finish, duration) ?? 0
  return () => {
    if (settled) return
    settled = true
    element.removeEventListener('transitionend', onEnd)
    element.ownerDocument.defaultView?.clearTimeout(timer)
  }
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

function isContentEditableHost(element: HTMLElement): boolean {
  const value = element.getAttribute('contenteditable')
  if (value === null) return false
  const normalized = value.trim().toLowerCase()
  return normalized === '' || normalized === 'true'
}

function tabIndexRank(element: HTMLElement): number {
  const raw = element.getAttribute('tabindex')
  if (raw === null || raw.trim() === '') return 0
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function isSequentiallyTabbable(element: HTMLElement): boolean {
  if (element.getAttribute('disabled') !== null) return false
  const raw = element.getAttribute('tabindex')
  if (raw !== null) {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isFinite(parsed) && parsed < 0) return false
  }
  if (isContentEditableHost(element)) return true
  return element.tabIndex >= 0
}

/** DOM order, with positive tabindex first (sequential focus navigation). */
function sortByFocusNavigation(elements: HTMLElement[]): HTMLElement[] {
  return elements
    .map((element, index) => ({ element, index, tab: tabIndexRank(element) }))
    .sort((a, b) => {
      if (a.tab > 0 && b.tab > 0) return a.tab - b.tab || a.index - b.index
      if (a.tab > 0) return -1
      if (b.tab > 0) return 1
      return a.index - b.index
    })
    .map((item) => item.element)
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
    '[contenteditable=""]',
    '[contenteditable="true"]'
  ]

  const elements = Array.from(root.querySelectorAll<HTMLElement>(selectors.join(',')))

  const visible = elements.filter((el) => {
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
    return isSequentiallyTabbable(el)
  })

  return sortByFocusNavigation(visible)
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
    const listener = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !isEscapeKey(event)) return
      const topmost = entries.reduce<EscapeDismissEntry | undefined>((current, entry) => {
        if (!current) return entry
        return compareEscapeDismissEntries(ownerDocument, current, entry) < 0 ? entry : current
      }, undefined)
      if (topmost) {
        event.preventDefault()
        topmost.dismiss()
      }
    }
    ownerDocument.addEventListener('keydown', listener)
    escapeDismissListeners.set(ownerDocument, listener)
  }

  const entry = { dismiss, getLayer, order: ++escapeDismissOrder }
  stack.push(entry)

  return () => {
    const index = stack.lastIndexOf(entry)
    if (index >= 0) stack.splice(index, 1)
    if (stack.length > 0) return
    const listener = escapeDismissListeners.get(ownerDocument)
    if (listener) {
      ownerDocument.removeEventListener('keydown', listener)
      escapeDismissListeners.delete(ownerDocument)
    }
    escapeDismissStacks.delete(ownerDocument)
  }
}

function restoreBodyScroll(resolvedDocument: Document, state: BodyScrollLockState): void {
  const body = resolvedDocument.body
  const root = resolvedDocument.documentElement
  body.style.overflow = state.previousOverflow
  body.style.paddingRight = state.previousPaddingRight
  body.style.position = state.previousPosition
  body.style.top = state.previousTop
  body.style.left = state.previousLeft
  body.style.right = state.previousRight
  body.style.width = state.previousWidth
  root.style.overflow = state.previousHtmlOverflow
  resolvedDocument.defaultView?.scrollTo(state.scrollX, state.scrollY)
}

export function lockBodyScroll(targetDocument?: Document): () => void {
  if (!isBrowser()) return () => undefined
  const resolvedDocument = targetDocument ?? document
  const body = resolvedDocument.body
  if (!body) return () => undefined

  let state = bodyScrollLocks.get(resolvedDocument)
  if (!state) {
    const view = resolvedDocument.defaultView
    const computedPadding = view ? Number.parseFloat(view.getComputedStyle(body).paddingRight) : 0
    const scrollbarWidth = view
      ? Math.max(0, view.innerWidth - resolvedDocument.documentElement.clientWidth)
      : 0
    const scrollX = view?.scrollX ?? 0
    const scrollY = view?.scrollY ?? 0
    state = {
      count: 0,
      scrollX,
      scrollY,
      previousOverflow: body.style.overflow,
      previousPaddingRight: body.style.paddingRight,
      previousPosition: body.style.position,
      previousTop: body.style.top,
      previousLeft: body.style.left,
      previousRight: body.style.right,
      previousWidth: body.style.width,
      previousHtmlOverflow: resolvedDocument.documentElement.style.overflow
    }
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = `-${scrollX}px`
    body.style.right = '0'
    body.style.width = '100%'
    resolvedDocument.documentElement.style.overflow = 'hidden'
    if (scrollbarWidth > 0 && Number.isFinite(computedPadding)) {
      body.style.paddingRight = `${computedPadding + scrollbarWidth}px`
    }
    bodyScrollLocks.set(resolvedDocument, state)
  }

  state.count += 1
  let active = true

  return () => {
    if (!active) return
    active = false
    const current = bodyScrollLocks.get(resolvedDocument)
    if (!current) return
    current.count = Math.max(0, current.count - 1)
    if (current.count > 0) return
    restoreBodyScroll(resolvedDocument, current)
    bodyScrollLocks.delete(resolvedDocument)
  }
}

export function getBodyScrollLockCount(targetDocument?: Document): number {
  const resolvedDocument = targetDocument ?? (isBrowser() ? document : undefined)
  if (!resolvedDocument) return 0
  return bodyScrollLocks.get(resolvedDocument)?.count ?? 0
}

export function resetBodyScrollLock(targetDocument?: Document): void {
  const resolvedDocument = targetDocument ?? (isBrowser() ? document : undefined)
  if (!resolvedDocument) return
  const state = bodyScrollLocks.get(resolvedDocument)
  if (!state) return
  restoreBodyScroll(resolvedDocument, state)
  bodyScrollLocks.delete(resolvedDocument)
}

function isLiveRegionElement(element: HTMLElement): boolean {
  return element.hasAttribute('aria-live') || element.hasAttribute('data-tiger-live-region')
}

function isToastLayerElement(element: HTMLElement): boolean {
  return element.hasAttribute('data-tiger-toast')
}

/** True when focus sits in a different overlay layer than `container`. */
export function isFocusInForeignOverlay(
  container: HTMLElement,
  activeElement: Element | null
): boolean {
  if (!(activeElement instanceof Element)) return false
  const foreignLayer = activeElement.closest('[data-tiger-overlay-layer]')
  if (!foreignLayer) return false
  const ownLayer = container.closest('[data-tiger-overlay-layer]') ?? container
  return foreignLayer !== ownLayer
}

/** Inert every sibling between the overlay and document.body so pointer input cannot leave. */
export function setBackgroundInert(overlayRoot: HTMLElement): () => void {
  const restored: Array<{ element: HTMLElement; wasInert: boolean }> = []
  let current: HTMLElement | null = overlayRoot

  while (current && current !== current.ownerDocument.body) {
    const parent: HTMLElement | null = current.parentElement
    if (!parent) break

    for (const child of Array.from(parent.children)) {
      if (
        !(child instanceof HTMLElement) ||
        child === current ||
        current.contains(child) ||
        isLiveRegionElement(child) ||
        isToastLayerElement(child)
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

export const MODAL_LAYER_ATTRIBUTE = 'data-tiger-modal'
export const TOAST_LAYER_ATTRIBUTE = 'data-tiger-toast'

export interface FocusScopeOptions {
  /** Inert the page and lower modal scopes, and lock scroll. */
  modal?: boolean
  /** Modal scopes lock scroll unless this is false. */
  lockScroll?: boolean
  /** Element to focus on activate. */
  initialFocus?: HTMLElement | null
  /** Move focus into the scope when it activates. */
  moveFocus?: boolean
  /** Restore focus when the scope deactivates. */
  returnFocus?: boolean
  /** Focus to restore. Captured on activate when omitted and `returnFocus` is set. */
  previouslyFocused?: HTMLElement | null
  /** Registered on the shared escape stack. Only the topmost entry runs. */
  onEscape?: () => void
  /**
   * Outside element that stays active (a tour target the step asks the user to click).
   * Ancestors of that element are not inert.
   */
  exempt?: () => HTMLElement | null | undefined
}

export interface FocusScope {
  activate: () => void
  deactivate: () => void
}

interface FocusScopeEntry {
  container: HTMLElement
  modal: boolean
  active: boolean
  covered: boolean
  returnFocus: boolean
  previouslyFocused: HTMLElement | null
  releaseInert: (() => void) | null
  releaseScroll: (() => void) | null
  releaseEscape: (() => void) | null
  getExempt?: () => HTMLElement | null | undefined
}

const focusStacks = new WeakMap<Document, FocusScopeEntry[]>()

interface FocusScopeListeners {
  keydown: (event: KeyboardEvent) => void
  focusin: (event: FocusEvent) => void
}

const focusListeners = new WeakMap<Document, FocusScopeListeners>()

function topFocusScope(doc: Document): FocusScopeEntry | undefined {
  const stack = focusStacks.get(doc)
  if (!stack) return undefined
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    if (stack[index].active) return stack[index]
  }
  return undefined
}

function ensureContainerFocusable(container: HTMLElement): HTMLElement {
  if (container.getAttribute('tabindex') === null && container.tabIndex < 0) {
    container.tabIndex = -1
  }
  return container
}

function focusScopeTarget(entry: FocusScopeEntry, initialFocus?: HTMLElement | null): void {
  if (initialFocus) {
    initialFocus.focus()
    return
  }
  const focusables = getFocusableElements(entry.container)
  const next = focusables[0] ?? ensureContainerFocusable(entry.container)
  next.focus()
}

function isExemptFromFocusScope(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest('[data-tiger-toast]') || target.closest('[data-tiger-live-region]')
  )
}

interface OwnedInert {
  element: HTMLElement
  wasInert: boolean
}

const ownedInert = new WeakMap<Document, OwnedInert[]>()

function pickTopModal(modals: FocusScopeEntry[]): FocusScopeEntry | undefined {
  return modals.reduce<FocusScopeEntry | undefined>((top, entry) => {
    if (!top) return entry
    if (top.container.contains(entry.container) && top.container !== entry.container) return entry
    if (entry.container.contains(top.container)) return top
    const position = top.container.compareDocumentPosition(entry.container)
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return entry
    return top
  }, undefined)
}

function releaseOwnedInert(doc: Document): void {
  const owned = ownedInert.get(doc)
  if (!owned) return
  for (const { element, wasInert } of owned) {
    if (wasInert) continue
    element.inert = false
    element.removeAttribute('inert')
  }
  ownedInert.delete(doc)
}

function markInert(doc: Document, element: HTMLElement, owned: OwnedInert[]): void {
  if (owned.some((item) => item.element === element)) return
  owned.push({ element, wasInert: isInertElement(element) })
  element.inert = true
  element.setAttribute('inert', '')
}

/** Inert everything outside the top modal. Ancestors of that modal stay active. */
function syncCoveredModals(doc: Document): void {
  releaseOwnedInert(doc)
  const stack = focusStacks.get(doc) ?? []
  const modals = stack.filter((entry) => entry.active && entry.modal)
  const top = pickTopModal(modals)
  for (const entry of modals) entry.covered = false
  if (!top) return

  const owned: OwnedInert[] = []
  const layer =
    (top.container.closest('[data-tiger-overlay-layer]') as HTMLElement | null) ?? top.container
  const exempt = top.getExempt?.() ?? null
  for (const entry of modals) {
    if (entry === top || layer.contains(entry.container) || entry.container.contains(layer)) {
      entry.container.inert = false
      entry.container.removeAttribute('inert')
      continue
    }
    if (exempt && (entry.container === exempt || entry.container.contains(exempt))) continue
    markInert(doc, entry.container, owned)
    entry.covered = true
  }

  const skipInert = (child: HTMLElement): boolean => {
    if (isLiveRegionElement(child) || isToastLayerElement(child)) return true
    if (exempt && (child === exempt || exempt.contains(child))) return true
    return false
  }

  const inertSiblings = (parent: HTMLElement, keep: HTMLElement): void => {
    for (const child of Array.from(parent.children)) {
      if (!(child instanceof HTMLElement) || child === keep) continue
      if (child.contains(layer) || layer.contains(child)) continue
      if (skipInert(child)) continue
      if (exempt && child.contains(exempt)) {
        inertSiblings(child, exempt)
        continue
      }
      markInert(doc, child, owned)
    }
  }

  let current: HTMLElement | null = layer
  while (current && current !== doc.body) {
    const parent: HTMLElement | null = current.parentElement
    if (!parent) break
    inertSiblings(parent, current)
    if (parent === doc.body) break
    current = parent
  }
  ownedInert.set(doc, owned)
}

/** Reapply inert after an exempt target appears or moves. */
export function syncModalInert(targetDocument?: Document): void {
  if (!isBrowser()) return
  syncCoveredModals(targetDocument ?? document)
}

function isScopeExempt(entry: FocusScopeEntry, target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false
  const exempt = entry.getExempt?.()
  if (!exempt) return false
  return exempt === target || exempt.contains(target)
}

function onFocusScopeKeyDown(doc: Document, event: KeyboardEvent): void {
  const entry = topFocusScope(doc)
  if (!entry || !isTabKey(event)) return
  const active = doc.activeElement
  if (isScopeExempt(entry, active)) return
  const focusables = getFocusableElements(entry.container)
  const inside = active instanceof Node && entry.container.contains(active)
  if (!inside) {
    if (isExemptFromFocusScope(active)) return
    event.preventDefault()
    const next = event.shiftKey ? focusables[focusables.length - 1] : focusables[0]
    ;(next ?? ensureContainerFocusable(entry.container)).focus()
    return
  }
  const navigation = getFocusTrapNavigation(event, focusables, active)
  if (!navigation.shouldHandle) return
  event.preventDefault()
  if (navigation.next) navigation.next.focus()
  else ensureContainerFocusable(entry.container).focus()
}

function onFocusScopeFocusIn(doc: Document, event: FocusEvent): void {
  const entry = topFocusScope(doc)
  if (!entry) return
  const target = event.target
  if (!(target instanceof Node) || entry.container.contains(target)) return
  if (isExemptFromFocusScope(target) || isScopeExempt(entry, target)) return
  const focusables = getFocusableElements(entry.container)
  const next = focusables[0] ?? ensureContainerFocusable(entry.container)
  next.focus()
}

function ensureFocusScopeListeners(doc: Document): void {
  if (focusListeners.has(doc)) return
  const keydown = (event: KeyboardEvent) => onFocusScopeKeyDown(doc, event)
  const focusin = (event: FocusEvent) => onFocusScopeFocusIn(doc, event)
  doc.addEventListener('keydown', keydown, true)
  doc.addEventListener('focusin', focusin, true)
  focusListeners.set(doc, { keydown, focusin })
}

function releaseFocusScopeListeners(doc: Document): void {
  if (topFocusScope(doc)) return
  const listeners = focusListeners.get(doc)
  if (!listeners) return
  doc.removeEventListener('keydown', listeners.keydown, true)
  doc.removeEventListener('focusin', listeners.focusin, true)
  focusListeners.delete(doc)
  focusStacks.delete(doc)
}

/**
 * One stacked focus scope: Tab cycle, focus pull-back, topmost Escape,
 * lower modals inert, and scroll lock for modal scopes.
 */
export function createFocusScope(
  container: HTMLElement,
  options: FocusScopeOptions = {}
): FocusScope {
  if (!isBrowser() || !container?.ownerDocument) {
    return {
      activate() {},
      deactivate() {}
    }
  }

  const doc = container.ownerDocument
  let entry: FocusScopeEntry | null = null

  return {
    activate() {
      if (entry?.active) return
      const returnFocus = options.returnFocus ?? false
      const previouslyFocused =
        options.previouslyFocused !== undefined
          ? options.previouslyFocused
          : returnFocus
            ? (doc.activeElement as HTMLElement | null)
            : null
      entry = {
        container,
        modal: Boolean(options.modal),
        active: true,
        covered: false,
        returnFocus,
        previouslyFocused,
        releaseInert: null,
        releaseScroll: null,
        releaseEscape: null,
        getExempt: options.exempt
      }
      let stack = focusStacks.get(doc)
      if (!stack) {
        stack = []
        focusStacks.set(doc, stack)
      }
      stack.push(entry)
      ensureFocusScopeListeners(doc)
      if (entry.modal) {
        container.setAttribute(MODAL_LAYER_ATTRIBUTE, '')
        if (options.lockScroll !== false) entry.releaseScroll = lockBodyScroll(doc)
      }
      syncCoveredModals(doc)
      if (options.onEscape) {
        entry.releaseEscape = registerEscapeDismiss(doc, options.onEscape, () => container)
      }
      if (options.moveFocus || options.initialFocus) {
        focusScopeTarget(entry, options.initialFocus)
      }
    },
    deactivate() {
      if (!entry?.active) return
      const current = entry
      current.active = false
      const stack = focusStacks.get(doc)
      if (stack) {
        const index = stack.lastIndexOf(current)
        if (index >= 0) stack.splice(index, 1)
      }
      if (current.covered) {
        current.container.inert = false
        current.container.removeAttribute('inert')
        current.covered = false
      }
      current.releaseEscape?.()
      current.releaseScroll?.()
      syncCoveredModals(doc)
      releaseFocusScopeListeners(doc)
      if (current.returnFocus && current.previouslyFocused) {
        const target = current.previouslyFocused
        target.focus()
        // Hiding the layer in the same turn can move focus again. A later turn
        // puts it back, unless another scope is already open.
        setTimeout(() => {
          if (topFocusScope(doc)) return
          if (!doc.contains(target)) return
          target.focus()
        }, 0)
      }
      entry = null
    }
  }
}
