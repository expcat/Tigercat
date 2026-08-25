/**
 * Anchor component utilities
 * Shared styles and helpers for Anchor components
 */

import type { AnchorDirection } from '../types/anchor'
import { isBrowser } from './env'

/**
 * Base anchor wrapper classes
 */
export const anchorBaseClasses = 'relative'

/**
 * Anchor wrapper classes for fixed positioning
 */
export const anchorAffixClasses = 'fixed'

/**
 * Anchor ink container classes (vertical)
 */
export const anchorInkContainerVerticalClasses =
  'absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--tiger-border,#e5e7eb)] rounded-full'

/**
 * Anchor ink container classes (horizontal)
 */
export const anchorInkContainerHorizontalClasses =
  'absolute left-0 right-0 bottom-0 h-0.5 bg-[var(--tiger-border,#e5e7eb)] rounded-full'

/**
 * Active ink indicator classes (vertical)
 */
export const anchorInkActiveVerticalClasses =
  'absolute w-0.5 bg-[var(--tiger-primary,#2563eb)] rounded-full transition-[top,height] duration-200 ease-in-out motion-reduce:transition-none'

/**
 * Active ink indicator classes (horizontal)
 */
export const anchorInkActiveHorizontalClasses =
  'absolute h-0.5 bg-[var(--tiger-primary,#2563eb)] rounded-full transition-[left,width] duration-200 ease-in-out motion-reduce:transition-none'

/**
 * Anchor link list classes (vertical)
 */
export const anchorLinkListVerticalClasses = 'pl-4 space-y-2'

/**
 * Anchor link list classes (horizontal)
 */
export const anchorLinkListHorizontalClasses = 'flex items-center space-x-4 pb-2'

/**
 * Anchor link base classes
 */
export const anchorLinkBaseClasses =
  'block text-sm text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-primary,#2563eb)] transition-colors duration-200 motion-reduce:transition-none whitespace-nowrap'

/**
 * Anchor link active classes
 */
export const anchorLinkActiveClasses = 'text-[var(--tiger-primary,#2563eb)] font-medium'

/**
 * Get anchor wrapper classes
 */
export function getAnchorWrapperClasses(affix: boolean, className?: string): string {
  return [anchorBaseClasses, affix && anchorAffixClasses, className].filter(Boolean).join(' ')
}

/**
 * Get anchor ink container classes based on direction
 */
export function getAnchorInkContainerClasses(direction: AnchorDirection): string {
  return direction === 'vertical'
    ? anchorInkContainerVerticalClasses
    : anchorInkContainerHorizontalClasses
}

/**
 * Get active ink indicator classes based on direction
 */
export function getAnchorInkActiveClasses(direction: AnchorDirection): string {
  return direction === 'vertical'
    ? anchorInkActiveVerticalClasses
    : anchorInkActiveHorizontalClasses
}

/**
 * Get anchor link list classes based on direction
 */
export function getAnchorLinkListClasses(direction: AnchorDirection): string {
  return direction === 'vertical' ? anchorLinkListVerticalClasses : anchorLinkListHorizontalClasses
}

/**
 * Get anchor link classes based on active state
 */
export function getAnchorLinkClasses(active: boolean, className?: string): string {
  return [anchorLinkBaseClasses, active && anchorLinkActiveClasses, className]
    .filter(Boolean)
    .join(' ')
}

/**
 * Get target element from href
 */
export function getAnchorTargetElement(href: string): HTMLElement | null {
  if (!isBrowser()) {
    return null
  }

  if (!href || !href.startsWith('#')) {
    return null
  }

  const id = href.slice(1)
  if (!id) {
    return null
  }

  return document.getElementById(id)
}

/**
 * Get scroll top of container
 */
export function getContainerScrollTop(container: HTMLElement | Window): number {
  if (!isBrowser()) {
    return (container as HTMLElement | undefined)?.scrollTop ?? 0
  }

  if (container === window) {
    return window.scrollY || document.documentElement.scrollTop
  }
  return (container as HTMLElement).scrollTop
}

/**
 * Get container height
 */
export function getContainerHeight(container: HTMLElement | Window): number {
  if (!isBrowser()) {
    return (container as HTMLElement | undefined)?.clientHeight ?? 0
  }

  if (container === window) {
    return window.innerHeight
  }
  return (container as HTMLElement).clientHeight
}

/**
 * Get element offset relative to container
 */
export function getElementOffsetTop(element: HTMLElement, container: HTMLElement | Window): number {
  if (!isBrowser()) {
    return 0
  }

  if (container === window) {
    const rect = element.getBoundingClientRect()
    return rect.top + window.scrollY
  }

  // Calculate offset relative to scrolling container
  // Walk up the offsetParent chain to find the position relative to container
  const containerEl = container as HTMLElement
  let offset = 0
  let el: HTMLElement | null = element

  while (el && el !== containerEl) {
    offset += el.offsetTop
    el = el.offsetParent as HTMLElement | null
    // If we've gone outside the container, just use bounding rect calculation
    if (el === null || el === document.body) {
      const containerRect = containerEl.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      return elementRect.top - containerRect.top + containerEl.scrollTop
    }
  }

  return offset
}

/**
 * Scroll to element with smooth animation
 */
export function scrollToAnchor(
  href: string,
  container: HTMLElement | Window,
  targetOffset: number = 0
): void {
  if (!isBrowser()) {
    return
  }

  const element = getAnchorTargetElement(href)
  if (!element) {
    return
  }

  const top = getElementOffsetTop(element, container) - targetOffset
  const scrollTarget = container === window ? window : (container as HTMLElement)
  scrollTarget.scrollTo({ top, behavior: 'smooth' })
}

/**
 * Last href in document order whose section top is at or above `offsetLine`.
 *
 * Offset line is `rootTop + offsetTop + bounds` (viewport/rect space) or
 * `scrollTop + targetOffset + bounds` (container scroll space). Sections whose
 * top cannot be resolved are skipped. If none qualify, the first link.
 */
export function findActiveAnchorAtOffsetLine(
  links: string[],
  getSectionTop: (href: string) => number | null,
  offsetLine: number
): string {
  if (links.length === 0) {
    return ''
  }

  for (let i = links.length - 1; i >= 0; i--) {
    const href = links[i]
    const top = getSectionTop(href)
    if (top !== null && top <= offsetLine) {
      return href
    }
  }

  return links[0] || ''
}

/**
 * Find current active anchor based on scroll position
 */
export function findActiveAnchor(
  links: string[],
  container: HTMLElement | Window,
  bounds: number = 5,
  targetOffset: number = 0
): string {
  if (links.length === 0) {
    return ''
  }

  if (!isBrowser()) {
    return links[0] || ''
  }

  const scrollTop = getContainerScrollTop(container)
  const offsetLine = scrollTop + targetOffset + bounds

  return findActiveAnchorAtOffsetLine(
    links,
    (href) => {
      const element = getAnchorTargetElement(href)
      if (!element) {
        return null
      }
      return getElementOffsetTop(element, container)
    },
    offsetLine
  )
}

const DEFAULT_SCROLL_LOCK_IDLE_MS = 150
const DEFAULT_SCROLL_LOCK_TIMEOUT_MS = 2000

export interface ProgrammaticScrollLock {
  isLocked: () => boolean
  lock: () => void
  unlock: () => void
  dispose: () => void
}

export interface ProgrammaticScrollLockOptions {
  /** Idle ms with no scroll events before unlocking (no-scrollend fallback). @default 150 */
  idleMs?: number
  /** Safety timeout so the lock cannot stick forever. @default 2000 */
  timeoutMs?: number
}

/**
 * Ignore observer/scroll-source updates until a programmatic `scrollTo` finishes.
 *
 * Unlocks on `scrollend` when the event exists, otherwise after a short idle
 * with no `scroll` events. A safety timeout always fires so the lock cannot stick.
 * Rapid `lock()` calls reset timers; last click wins.
 */
export function createProgrammaticScrollLock(
  getTarget: () => HTMLElement | Window,
  options: ProgrammaticScrollLockOptions = {}
): ProgrammaticScrollLock {
  const idleMs = options.idleMs ?? DEFAULT_SCROLL_LOCK_IDLE_MS
  const timeoutMs = options.timeoutMs ?? DEFAULT_SCROLL_LOCK_TIMEOUT_MS

  let locked = false
  let idleTimer: ReturnType<typeof setTimeout> | null = null
  let safetyTimer: ReturnType<typeof setTimeout> | null = null
  let attachedTarget: EventTarget | null = null
  let listeningScrollEnd = false

  const clearTimers = (): void => {
    if (idleTimer !== null) {
      clearTimeout(idleTimer)
      idleTimer = null
    }
    if (safetyTimer !== null) {
      clearTimeout(safetyTimer)
      safetyTimer = null
    }
  }

  const onScroll = (): void => {
    scheduleIdle()
  }

  const onScrollEnd = (): void => {
    unlock()
  }

  const detach = (): void => {
    if (!attachedTarget) {
      return
    }
    attachedTarget.removeEventListener('scroll', onScroll)
    if (listeningScrollEnd) {
      attachedTarget.removeEventListener('scrollend', onScrollEnd)
    }
    attachedTarget = null
    listeningScrollEnd = false
  }

  const unlock = (): void => {
    locked = false
    clearTimers()
    detach()
  }

  const scheduleIdle = (): void => {
    if (idleTimer !== null) {
      clearTimeout(idleTimer)
    }
    idleTimer = setTimeout(() => {
      idleTimer = null
      unlock()
    }, idleMs)
  }

  const lock = (): void => {
    clearTimers()
    detach()
    locked = true

    if (isBrowser()) {
      const container = getTarget()
      const target: EventTarget = container === window ? window : (container as HTMLElement)
      attachedTarget = target
      listeningScrollEnd = 'onscrollend' in window
      target.addEventListener('scroll', onScroll, { passive: true })
      if (listeningScrollEnd) {
        target.addEventListener('scrollend', onScrollEnd)
      }
    }

    scheduleIdle()
    safetyTimer = setTimeout(() => {
      safetyTimer = null
      unlock()
    }, timeoutMs)
  }

  return {
    isLocked: () => locked,
    lock,
    unlock,
    dispose: unlock
  }
}

// ---------------------------------------------------------------------------
// IntersectionObserver-based active-anchor detection (preferred over scroll)
// ---------------------------------------------------------------------------

export interface AnchorObserverOptions {
  /** Distance from top of root that defines the offset line */
  offsetTop?: number
  /**
   * Extra pixels added to the offset line.
   * @default 5
   */
  bounds?: number
  /** Scroll root. `null` = viewport. */
  root?: Element | null
  /** Called whenever the active anchor changes. Empty string when none active. */
  onChange: (activeHref: string) => void
}

/**
 * Create an IntersectionObserver-based active-anchor tracker.
 *
 * IO is the change trigger. The winner is the last link in document order whose
 * section top is at or above `rootTop + offsetTop + bounds` (same rule as
 * `findActiveAnchor`). Visibility / `isIntersecting` order does not decide.
 *
 * Returns a teardown function. Safe when `IntersectionObserver` is unavailable
 * (returns no-op) or no targets resolve.
 */
export function createAnchorObserver(links: string[], options: AnchorObserverOptions): () => void {
  if (!isBrowser()) return () => {}
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const { offsetTop = 0, bounds = 5, root = null, onChange } = options

  const targets = new Map<Element, string>()
  for (const href of links) {
    const el = getAnchorTargetElement(href)
    if (el) targets.set(el, href)
  }
  if (targets.size === 0) return () => {}

  const computeActive = (): string => {
    const rootTop = root ? root.getBoundingClientRect().top : 0
    const offsetLine = rootTop + offsetTop + bounds
    return findActiveAnchorAtOffsetLine(
      links,
      (href) => {
        const el = getAnchorTargetElement(href)
        if (!el) {
          return null
        }
        return el.getBoundingClientRect().top
      },
      offsetLine
    )
  }

  let last = ''
  const observer = new IntersectionObserver(
    () => {
      const next = computeActive()
      if (next !== last) {
        last = next
        onChange(next)
      }
    },
    {
      root,
      // Top inset at the offset line; 0 bottom so last sections still notify.
      rootMargin: `-${offsetTop}px 0px 0px 0px`,
      threshold: [0, 1]
    }
  )

  for (const target of targets.keys()) observer.observe(target)

  // Initial synchronous emit using the same last-at-offset-line rule. IO
  // callbacks may not fire on mount in all environments (e.g. test shims).
  const initial = computeActive()
  if (initial) {
    last = initial
    onChange(initial)
  }

  return () => observer.disconnect()
}
