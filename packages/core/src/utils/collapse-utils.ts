/**
 * Collapse component utilities
 * Shared styles and helpers for Collapse components
 */

import type { ExpandIconPosition } from '../types/collapse'

/**
 * Base collapse container classes
 */
export const collapseBaseClasses =
  'w-full bg-white border border-gray-200 rounded overflow-hidden'

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
  'overflow-hidden transition-all duration-300 ease-in-out'

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
 * Collapse extra content classes
 */
export const collapseExtraClasses = 'ml-auto'

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

  return classes.filter(Boolean).join(' ')
}

/**
 * Get collapse panel classes
 */
export function getCollapsePanelClasses(ghost: boolean, className?: string): string {
  const classes = []

  if (!ghost) {
    classes.push(collapsePanelBaseClasses)
  }

  if (className) {
    classes.push(className)
  }

  return classes.filter(Boolean).join(' ')
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

  return classes.filter(Boolean).join(' ')
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

  return classes.filter(Boolean).join(' ')
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
export function isPanelActive(
  panelKey: string | number,
  activeKeys: (string | number)[]
): boolean {
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

/**
 * Right arrow SVG icon for collapse
 */
export const collapseRightArrowIcon = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`.trim()
