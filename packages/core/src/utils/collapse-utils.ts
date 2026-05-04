/**
 * Collapse component utilities
 * Shared styles and helpers for Collapse components
 */

import type { ExpandIconPosition } from '../types/collapse'

/**
 * Base collapse container classes
 */
export const collapseBaseClasses = 'w-full bg-white border border-gray-200 rounded overflow-hidden'

/**
 * Collapse ghost mode classes (transparent without border)
 */
export const collapseGhostClasses = 'border-0 bg-transparent'

/**
 * Collapse borderless classes
 */
export const collapseBorderlessClasses = 'border-0'

/**
 * Collapse panel base classes
 */
export const collapsePanelBaseClasses = 'border-b border-gray-200 last:border-b-0'

/**
 * Collapse panel header base classes
 */
export const collapsePanelHeaderBaseClasses =
  'flex items-center px-4 py-3 cursor-pointer transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'

/**
 * Collapse panel header active classes
 */
export const collapsePanelHeaderActiveClasses = 'bg-gray-50'

/**
 * Collapse panel header disabled classes
 */
export const collapsePanelHeaderDisabledClasses =
  'cursor-not-allowed opacity-50 hover:bg-transparent'

/**
 * Collapse panel content wrapper classes
 */
export const collapsePanelContentWrapperClasses =
  'overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out'

/**
 * Collapse panel content base classes
 */
export const collapsePanelContentBaseClasses = 'px-4 py-3 bg-white text-gray-700'

/**
 * Collapse icon base classes
 */
export const collapseIconBaseClasses = 'transition-transform duration-300 ease-in-out text-gray-500'

/**
 * Collapse icon expanded classes
 */
export const collapseIconExpandedClasses = 'rotate-90'

/**
 * Collapse icon position classes
 */
export const collapseIconPositionClasses = {
  start: 'mr-2',
  end: 'ml-auto'
}

/**
 * Collapse header text classes
 */
export const collapseHeaderTextClasses = 'flex-1 font-medium text-gray-900'

/**
 * Get collapse container classes
 */
export function getCollapseContainerClasses(
  bordered: boolean,
  ghost: boolean,
  className?: string
): string {
  const classes = [collapseBaseClasses]

  if (ghost) {
    classes.push(collapseGhostClasses)
  } else if (!bordered) {
    classes.push(collapseBorderlessClasses)
  }

  if (className) {
    classes.push(className)
  }

  return classes.join(' ')
}

/**
 * Get collapse panel classes
 */
export function getCollapsePanelClasses(ghost: boolean, className?: string): string {
  const classes: string[] = []

  if (!ghost) {
    classes.push(collapsePanelBaseClasses)
  }

  if (className) {
    classes.push(className)
  }

  return classes.join(' ')
}

/**
 * Get collapse panel header classes
 */
export function getCollapsePanelHeaderClasses(
  active: boolean,
  disabled: boolean,
  className?: string
): string {
  const classes = [collapsePanelHeaderBaseClasses]

  if (disabled) {
    classes.push(collapsePanelHeaderDisabledClasses)
  } else if (active) {
    classes.push(collapsePanelHeaderActiveClasses)
  }

  if (className) {
    classes.push(className)
  }

  return classes.join(' ')
}

/**
 * Get collapse icon classes
 */
export function getCollapseIconClasses(
  expanded: boolean,
  position: ExpandIconPosition,
  className?: string
): string {
  const classes = [collapseIconBaseClasses, collapseIconPositionClasses[position]]

  if (expanded) {
    classes.push(collapseIconExpandedClasses)
  }

  if (className) {
    classes.push(className)
  }

  return classes.join(' ')
}

/**
 * Normalize active keys to array format
 */
export function normalizeActiveKeys(
  activeKey: string | number | (string | number)[] | undefined
): (string | number)[] {
  if (activeKey === undefined) {
    return []
  }
  return Array.isArray(activeKey) ? activeKey : [activeKey]
}

/**
 * Check if a panel key is active
 */
export function isPanelActive(panelKey: string | number, activeKeys: (string | number)[]): boolean {
  return activeKeys.includes(panelKey)
}

/**
 * Toggle panel key in active keys array
 */
export function togglePanelKey(
  panelKey: string | number,
  activeKeys: (string | number)[],
  accordion: boolean
): (string | number)[] {
  const isActive = isPanelActive(panelKey, activeKeys)

  if (isActive) {
    // Collapse the panel
    return activeKeys.filter((key) => key !== panelKey)
  } else {
    // Expand the panel
    if (accordion) {
      // In accordion mode, only one panel can be active
      return [panelKey]
    } else {
      // In normal mode, multiple panels can be active
      return [...activeKeys, panelKey]
    }
  }
}

export interface CollapseTransitionElement {
  scrollHeight: number
  style: Pick<CSSStyleDeclaration, 'maxHeight' | 'opacity' | 'overflow'>
  addEventListener: HTMLElement['addEventListener']
  removeEventListener: HTMLElement['removeEventListener']
}

export interface CollapseTransitionController {
  update(expanded: boolean): void
  dispose(): void
}

export interface CollapseTransitionControllerOptions {
  expanded: boolean
  requestAnimationFrame?: typeof globalThis.requestAnimationFrame
  cancelAnimationFrame?: typeof globalThis.cancelAnimationFrame
}

function requestCollapseFrame(
  callback: FrameRequestCallback,
  requestFrame: typeof globalThis.requestAnimationFrame | undefined
): number {
  if (typeof requestFrame === 'function') {
    return requestFrame(callback)
  }

  callback(0)
  return 0
}

function cancelCollapseFrame(
  frame: number,
  cancelFrame: typeof globalThis.cancelAnimationFrame | undefined
): void {
  if (frame && typeof cancelFrame === 'function') {
    cancelFrame(frame)
  }
}

function setCollapsedStyle(element: CollapseTransitionElement): void {
  element.style.overflow = 'hidden'
  element.style.maxHeight = '0px'
  element.style.opacity = '0'
}

function setExpandedStyle(element: CollapseTransitionElement): void {
  element.style.overflow = 'hidden'
  element.style.maxHeight = 'none'
  element.style.opacity = '1'
}

export function getInitialCollapseContentStyle(expanded: boolean): {
  maxHeight: string
  opacity: string
}
export function getInitialCollapseContentStyle(
  expanded: boolean
): Pick<CSSStyleDeclaration, 'maxHeight' | 'opacity'> {
  return {
    maxHeight: expanded ? 'none' : '0px',
    opacity: expanded ? '1' : '0'
  }
}

export function createCollapseTransitionController(
  element: CollapseTransitionElement,
  options: CollapseTransitionControllerOptions
): CollapseTransitionController {
  const requestFrame = options.requestAnimationFrame ?? globalThis.requestAnimationFrame
  const cancelFrame = options.cancelAnimationFrame ?? globalThis.cancelAnimationFrame
  let frame = 0
  let expanded = options.expanded

  if (expanded) {
    setExpandedStyle(element)
  } else {
    setCollapsedStyle(element)
  }

  const clearFrame = () => {
    cancelCollapseFrame(frame, cancelFrame)
    frame = 0
  }

  const handleTransitionEnd = (event: Event) => {
    const transitionEvent = event as TransitionEvent
    if ((event.target as unknown) !== element || transitionEvent.propertyName !== 'max-height') {
      return
    }

    if (expanded) {
      element.style.maxHeight = 'none'
    }
  }

  element.addEventListener('transitionend', handleTransitionEnd)

  return {
    update(nextExpanded: boolean) {
      if (nextExpanded === expanded) return

      clearFrame()
      expanded = nextExpanded

      if (nextExpanded) {
        element.style.overflow = 'hidden'
        element.style.maxHeight = '0px'
        element.style.opacity = '1'
        frame = requestCollapseFrame(() => {
          frame = 0
          element.style.maxHeight = `${element.scrollHeight}px`
        }, requestFrame)
      } else {
        element.style.overflow = 'hidden'
        element.style.maxHeight = `${element.scrollHeight}px`
        element.style.opacity = '1'
        frame = requestCollapseFrame(() => {
          frame = 0
          element.style.maxHeight = '0px'
          element.style.opacity = '0'
        }, requestFrame)
      }
    },
    dispose() {
      clearFrame()
      element.removeEventListener('transitionend', handleTransitionEnd)
    }
  }
}
