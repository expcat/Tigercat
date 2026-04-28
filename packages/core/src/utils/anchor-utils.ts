/**
 * Anchor component utilities
 * Shared styles and helpers for Anchor components
 */

import type { AnchorDirection } from '../types/anchor'

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
  'absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full'

/**
 * Anchor ink container classes (horizontal)
 */
export const anchorInkContainerHorizontalClasses =
  'absolute left-0 right-0 bottom-0 h-0.5 bg-gray-200 rounded-full'

/**
 * Active ink indicator classes (vertical)
 */
export const anchorInkActiveVerticalClasses =
  'absolute w-0.5 bg-[var(--tiger-primary,#2563eb)] rounded-full transition-[top,height] duration-200 ease-in-out'

/**
 * Active ink indicator classes (horizontal)
 */
export const anchorInkActiveHorizontalClasses =
  'absolute h-0.5 bg-[var(--tiger-primary,#2563eb)] rounded-full transition-[left,width] duration-200 ease-in-out'

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
  'block text-sm text-gray-600 hover:text-[var(--tiger-primary,#2563eb)] transition-colors duration-200 whitespace-nowrap'

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
  if (container === window) {
    return window.scrollY || document.documentElement.scrollTop
  }
  return (container as HTMLElement).scrollTop
}

/**
 * Get container height
 */
export function getContainerHeight(container: HTMLElement | Window): number {
  if (container === window) {
    return window.innerHeight
  }
  return (container as HTMLElement).clientHeight
}

/**
 * Get element offset relative to container
 */
export function getElementOffsetTop(element: HTMLElement, container: HTMLElement | Window): number {
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
  const element = getAnchorTargetElement(href)
  if (!element) {
    return
  }

  const top = getElementOffsetTop(element, container) - targetOffset
  const scrollTarget = container === window ? window : (container as HTMLElement)
  scrollTarget.scrollTo({ top, behavior: 'smooth' })
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

  const scrollTop = getContainerScrollTop(container)

  // Find the first visible anchor
  for (let i = links.length - 1; i >= 0; i--) {
    const href = links[i]
    const element = getAnchorTargetElement(href)

    if (element) {
      const offsetTop = getElementOffsetTop(element, container) - targetOffset - bounds

      if (scrollTop >= offsetTop) {
        return href
      }
    }
  }

  // Default to first link if no anchor is visible
  return links[0] || ''
}

// ---------------------------------------------------------------------------
// IntersectionObserver-based active-anchor detection (preferred over scroll)
// ---------------------------------------------------------------------------

export interface AnchorObserverOptions {
  /** Distance from top of root that defines the "active zone" */
  offsetTop?: number
  /** Scroll root. `null` = viewport. */
  root?: Element | null
  /** Called whenever the active anchor changes. Empty string when none active. */
  onChange: (activeHref: string) => void
}

/**
 * Create an IntersectionObserver-based active-anchor tracker.
 *
 * Observes each link target and tracks which sections currently intersect a
 * thin band at the top of the scroll root (just below `offsetTop`). The first
 * intersecting section in document order is reported as active. Falls back to
 * the last section that has scrolled past `offsetTop` when nothing intersects.
 *
 * Returns a teardown function. Safe when `IntersectionObserver` is unavailable
 * (returns no-op) or no targets resolve.
 */
export function createAnchorObserver(links: string[], options: AnchorObserverOptions): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const { offsetTop = 0, root = null, onChange } = options
  if (typeof document === 'undefined') return () => {}

  const targets = new Map<Element, string>()
  for (const href of links) {
    const el = getAnchorTargetElement(href)
    if (el) targets.set(el, href)
  }
  if (targets.size === 0) return () => {}

  const visible = new Set<string>()

  const computeActive = (): string => {
    // Topmost visible section in document order
    for (const href of links) {
      if (visible.has(href)) return href
    }
    // Otherwise: the last one that has scrolled past the offset line
    let fallback = ''
    for (const href of links) {
      const el = getAnchorTargetElement(href)
      if (el && el.getBoundingClientRect().top <= offsetTop + 1) {
        fallback = href
      }
    }
    return fallback
  }

  let last = ''
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const href = targets.get(entry.target)
        if (!href) continue
        if (entry.isIntersecting) visible.add(href)
        else visible.delete(href)
      }
      const next = computeActive()
      if (next !== last) {
        last = next
        onChange(next)
      }
    },
    {
      root,
      // Active zone: from `offsetTop` down to ~40% of viewport height.
      // Sections fully below this band are considered "below".
      rootMargin: `-${offsetTop}px 0px -60% 0px`,
      threshold: [0, 1]
    }
  )

  for (const target of targets.keys()) observer.observe(target)

  // Initial synchronous emit using fallback computation. IO callbacks may
  // not fire on mount in all environments (e.g. test shims) and consumers
  // generally expect an initial active-anchor signal.
  const initial = computeActive()
  if (initial) {
    last = initial
    onChange(initial)
  }

  return () => observer.disconnect()
}
