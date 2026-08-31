/**
 * Collapse component utilities
 * Shared styles and helpers for Collapse components
 */

import type { ExpandIconPosition } from '../types/collapse'
import { isBrowser } from './env'
import { devWarn } from './dev-warn'
import { prefersReducedMotion } from './transition'

/**
 * Base collapse container classes
 */
export const collapseBaseClasses =
  'w-full bg-[var(--tiger-surface,#fff)] border border-[var(--tiger-component-collapse-border-color,var(--tiger-border,#e5e7eb))] rounded overflow-hidden'

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
export const collapsePanelBaseClasses =
  'border-b border-[var(--tiger-component-collapse-border-color,var(--tiger-border,#e5e7eb))] last:border-b-0'

/**
 * Header row: button + extra sit as siblings
 */
export const collapseHeaderRowClasses =
  'flex items-center px-[var(--tiger-component-collapse-header-padding-x,16px)] py-[var(--tiger-component-collapse-header-padding-y,16px)]'

/**
 * Collapse panel header button
 */
export const collapsePanelHeaderBaseClasses =
  'flex min-w-0 flex-1 items-center cursor-pointer bg-transparent p-0 border-0 text-start transition-colors duration-200 motion-reduce:transition-none hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'

/**
 * Collapse panel header active classes
 */
export const collapsePanelHeaderActiveClasses = ''

/**
 * Collapse panel header disabled classes
 */
export const collapsePanelHeaderDisabledClasses = 'cursor-not-allowed opacity-50'

/**
 * Extra content sits beside the header button
 */
export const collapseExtraClasses = 'ms-auto shrink-0'

/**
 * Collapse panel content wrapper classes
 */
export const collapsePanelContentWrapperClasses =
  'tiger-collapse-content overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out motion-reduce:transition-none'

/**
 * Collapse panel content base classes
 */
export const collapsePanelContentBaseClasses =
  'px-[var(--tiger-component-collapse-content-padding,16px)] py-[var(--tiger-component-collapse-content-padding,16px)] bg-[var(--tiger-surface,#fff)] text-[var(--tiger-text,#374151)]'

/**
 * Collapse icon base classes.
 * Collapsed points inline-end; expanded points block-end.
 */
export const collapseIconBaseClasses =
  'shrink-0 transition-transform duration-300 ease-in-out motion-reduce:transition-none text-[var(--tiger-text-muted,#6b7280)] -rotate-90 rtl:rotate-90'

/**
 * Collapse icon expanded classes
 */
export const collapseIconExpandedClasses = 'rotate-0 rtl:rotate-0'

/**
 * Collapse icon position classes
 */
export const collapseIconPositionClasses = {
  start: 'me-2',
  end: 'ms-auto'
}

/**
 * Collapse header text classes
 */
export const collapseHeaderTextClasses = 'flex-1 font-medium text-[var(--tiger-text,#111827)]'

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

export function collapseKeyOf(key: string | number): string {
  return String(key)
}

export function isSameCollapseKey(a: string | number, b: string | number): boolean {
  return collapseKeyOf(a) === collapseKeyOf(b)
}

export interface NormalizeActiveKeysOptions {
  /**
   * Accordion keeps a single key. Extra keys are dropped (last wins).
   */
  accordion?: boolean
}

/**
 * Normalize active keys to array format.
 *
 * Duplicate keys that stringify the same (`1` / `"1"`) collapse to one entry.
 * Accordion keeps the last key when more than one is passed.
 */
export function normalizeActiveKeys(
  activeKey: string | number | (string | number)[] | undefined,
  options?: NormalizeActiveKeysOptions
): (string | number)[] {
  if (activeKey === undefined) {
    return []
  }

  const list = Array.isArray(activeKey) ? activeKey : [activeKey]
  const seen = new Map<string, string | number>()
  for (const key of list) {
    seen.set(collapseKeyOf(key), key)
  }
  let result = [...seen.values()]

  if (options?.accordion && result.length > 1) {
    devWarn(
      'Collapse.accordion',
      '[Tigercat Collapse] accordion keeps only one panel; extra active keys were dropped (last wins).'
    )
    result = result.slice(-1)
  }

  return result
}

/**
 * Check if a panel key is active. `1` and `"1"` match.
 */
export function isPanelActive(panelKey: string | number, activeKeys: (string | number)[]): boolean {
  return activeKeys.some((key) => isSameCollapseKey(key, panelKey))
}

/**
 * Toggle panel key in active keys array. Always returns an array
 * (empty when accordion collapses the last panel).
 */
export function togglePanelKey(
  panelKey: string | number,
  activeKeys: (string | number)[],
  accordion: boolean
): (string | number)[] {
  const isActive = isPanelActive(panelKey, activeKeys)

  if (isActive) {
    return activeKeys.filter((key) => !isSameCollapseKey(key, panelKey))
  }

  if (accordion) {
    return [panelKey]
  }

  return [...activeKeys, panelKey]
}

export type CollapseHeaderFocusAction = 'next' | 'prev' | 'first' | 'last'

export interface CollapseHeaderRecord {
  key: string
  el: { focus(): void }
  disabled: boolean
}

/**
 * Next enabled accordion header index. Wraps at the ends.
 */
export function getNextAccordionHeaderIndex(
  headers: CollapseHeaderRecord[],
  currentKey: string,
  action: CollapseHeaderFocusAction
): number {
  const enabled = headers
    .map((header, index) => ({ header, index }))
    .filter((entry) => !entry.header.disabled)

  if (enabled.length === 0) return -1

  if (action === 'first') return enabled[0].index
  if (action === 'last') return enabled[enabled.length - 1].index

  const current = enabled.findIndex((entry) => entry.header.key === currentKey)
  if (current < 0) return enabled[0].index

  if (action === 'next') {
    return enabled[(current + 1) % enabled.length].index
  }

  return enabled[(current - 1 + enabled.length) % enabled.length].index
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
  prefersReducedMotion?: () => boolean
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

export function getInitialCollapseContentStyle(
  expanded: boolean
): Pick<CSSStyleDeclaration, 'maxHeight' | 'opacity'> {
  return {
    maxHeight: expanded ? 'none' : '0px',
    opacity: expanded ? '1' : '0'
  }
}

function applyInitialStyle(element: CollapseTransitionElement, expanded: boolean): void {
  if (expanded) {
    setExpandedStyle(element)
  } else {
    setCollapsedStyle(element)
  }
}

export function createCollapseTransitionController(
  element: CollapseTransitionElement,
  options: CollapseTransitionControllerOptions
): CollapseTransitionController {
  const requestFrame = options.requestAnimationFrame ?? globalThis.requestAnimationFrame
  const cancelFrame = options.cancelAnimationFrame ?? globalThis.cancelAnimationFrame
  const reducedMotion = () =>
    options.prefersReducedMotion ? options.prefersReducedMotion() : prefersReducedMotion()
  let frame = 0
  let expanded = options.expanded
  let resizeObserver: ResizeObserver | undefined

  applyInitialStyle(element, expanded)

  const clearFrame = () => {
    cancelCollapseFrame(frame, cancelFrame)
    frame = 0
  }

  const syncExpandedHeight = () => {
    if (!expanded) return
    if (element.style.maxHeight === 'none') return
    element.style.maxHeight = `${element.scrollHeight}px`
  }

  const stopObserver = () => {
    resizeObserver?.disconnect()
    resizeObserver = undefined
  }

  const startObserver = () => {
    if (!isBrowser() || typeof ResizeObserver === 'undefined') return
    stopObserver()
    resizeObserver = new ResizeObserver(() => {
      syncExpandedHeight()
    })
    resizeObserver.observe(element as unknown as Element)
  }

  const handleTransitionEnd = (event: Event) => {
    const transitionEvent = event as TransitionEvent
    if ((event.target as unknown) !== element || transitionEvent.propertyName !== 'max-height') {
      return
    }

    if (expanded) {
      element.style.maxHeight = 'none'
      stopObserver()
    }
  }

  element.addEventListener('transitionend', handleTransitionEnd)
  if (expanded) {
    startObserver()
  }

  return {
    update(nextExpanded: boolean) {
      if (nextExpanded === expanded) return

      clearFrame()
      expanded = nextExpanded

      if (reducedMotion()) {
        stopObserver()
        if (nextExpanded) {
          setExpandedStyle(element)
          startObserver()
        } else {
          setCollapsedStyle(element)
        }
        return
      }

      if (nextExpanded) {
        element.style.overflow = 'hidden'
        element.style.maxHeight = '0px'
        element.style.opacity = '1'
        startObserver()
        frame = requestCollapseFrame(() => {
          frame = 0
          element.style.maxHeight = `${element.scrollHeight}px`
        }, requestFrame)
      } else {
        stopObserver()
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
      stopObserver()
      element.removeEventListener('transitionend', handleTransitionEnd)
    }
  }
}
