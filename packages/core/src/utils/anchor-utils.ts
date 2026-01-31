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
  const classes = [anchorBaseClasses]

  if (affix) {
    classes.push(anchorAffixClasses)
  }

  if (className) {
    classes.push(className)
  }

  return classes.filter(Boolean).join(' ')
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
  const classes = [anchorLinkBaseClasses]

  if (active) {
    classes.push(anchorLinkActiveClasses)
  }

  if (className) {
    classes.push(className)
  }

  return classes.filter(Boolean).join(' ')
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

  const offsetTop = getElementOffsetTop(element, container) - targetOffset

  if (container === window) {
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  } else {
    ;(container as HTMLElement).scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
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
