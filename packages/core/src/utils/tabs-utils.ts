/**
 * Tabs component utilities
 * Shared styles and helpers for Tabs components
 */

import type { TabType, TabPosition, TabSize } from '../types/tabs'

/**
 * Base tabs container classes
 */
export const tabsBaseClasses = 'w-full'

/**
 * Tab nav base classes
 */
export const tabNavBaseClasses = 'flex'

/**
 * Tab nav position classes (direction only)
 */
export const tabNavPositionClasses = {
  top: 'flex-row',
  bottom: 'flex-row',
  left: 'flex-col',
  right: 'flex-col'
}

/**
 * Tab nav border classes (applied only for line type)
 */
export const tabNavLineBorderClasses = {
  top: 'border-b border-gray-200',
  bottom: 'border-t border-gray-200',
  left: 'border-r border-gray-200',
  right: 'border-l border-gray-200'
}

/**
 * Tab nav list base classes
 */
export const tabNavListBaseClasses = 'flex gap-1'

/**
 * Tab nav list position classes
 */
export const tabNavListPositionClasses = {
  top: 'flex-row',
  bottom: 'flex-row',
  left: 'flex-col',
  right: 'flex-col'
}

/**
 * Tab nav list centered classes
 */
export const tabNavListCenteredClasses = 'justify-center'

/**
 * Tab item base classes
 * @since 0.2.0 - Added focus-visible ring for keyboard navigation
 */
export const tabItemBaseClasses =
  'relative cursor-pointer transition-all duration-200 select-none flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] focus-visible:ring-offset-2 active:opacity-90'

/**
 * Tab item size classes
 */
export const tabItemSizeClasses = {
  small: 'text-sm px-3 py-1.5',
  medium: 'text-base px-4 py-2',
  large: 'text-lg px-5 py-2.5'
}

/**
 * Tab item type classes - line
 */
export const tabItemLineClasses =
  'border-b-2 border-transparent hover:text-[var(--tiger-primary,#2563eb)] text-gray-600'

/**
 * Tab item type classes - line active
 */
export const tabItemLineActiveClasses =
  'border-[var(--tiger-primary,#2563eb)] text-[var(--tiger-primary,#2563eb)] font-medium'

/**
 * Tab item type classes - card
 */
export const tabItemCardClasses =
  'border border-gray-200 rounded-t bg-white hover:text-[var(--tiger-primary,#2563eb)] text-gray-600 -mb-px'

/**
 * Tab item type classes - card active
 */
export const tabItemCardActiveClasses =
  'bg-white border-[var(--tiger-primary,#2563eb)] border-b-white text-[var(--tiger-primary,#2563eb)] font-medium z-10'

/**
 * Tab item type classes - editable-card
 */
export const tabItemEditableCardClasses =
  'border border-gray-200 rounded-t bg-gray-50 hover:bg-white hover:text-[var(--tiger-primary,#2563eb)] text-gray-600 -mb-px'

/**
 * Tab item type classes - editable-card active
 */
export const tabItemEditableCardActiveClasses =
  'bg-white border-[var(--tiger-primary,#2563eb)] border-b-white text-[var(--tiger-primary,#2563eb)] font-medium z-10'

/**
 * Tab item disabled classes
 */
export const tabItemDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

/**
 * Tab close button classes
 */
export const tabCloseButtonClasses =
  'ml-2 p-0.5 rounded hover:bg-gray-200 transition-colors duration-150'

/**
 * Tab content container classes
 */
export const tabContentBaseClasses = 'w-full'

/**
 * Tab pane classes
 */
export const tabPaneBaseClasses = 'w-full'

/**
 * Tab pane hidden classes
 */
export const tabPaneHiddenClasses = 'hidden'

/**
 * Tab add button classes (for editable-card)
 */
export const tabAddButtonClasses =
  'px-3 py-2 border border-gray-200 rounded-t bg-gray-50 hover:bg-white hover:text-[var(--tiger-primary,#2563eb)] text-gray-600 cursor-pointer transition-colors duration-200'

/**
 * Get tabs container classes
 */
export function getTabsContainerClasses(position: TabPosition): string {
  if (position === 'right') return `${tabsBaseClasses} flex flex-row-reverse`
  if (position === 'left') return `${tabsBaseClasses} flex`
  return tabsBaseClasses
}

/**
 * Get tab nav classes based on position
 */
export function getTabNavClasses(position: TabPosition, type: TabType): string {
  const base = `${tabNavBaseClasses} ${tabNavPositionClasses[position]}`
  return type === 'line' ? `${base} ${tabNavLineBorderClasses[position]}` : base
}

/**
 * Get tab nav list classes
 */
export function getTabNavListClasses(position: TabPosition, centered: boolean): string {
  const base = `${tabNavListBaseClasses} ${tabNavListPositionClasses[position]}`
  return centered && (position === 'top' || position === 'bottom')
    ? `${base} ${tabNavListCenteredClasses}`
    : base
}

/**
 * Get tab item classes based on state, type, and size
 */
export function getTabItemClasses(
  active: boolean,
  disabled: boolean,
  type: TabType,
  size: TabSize
): string {
  let cls = `${tabItemBaseClasses} ${tabItemSizeClasses[size]}`

  if (disabled) return `${cls} ${tabItemDisabledClasses}`

  switch (type) {
    case 'line':
      cls += ` ${tabItemLineClasses}`
      if (active) cls += ` ${tabItemLineActiveClasses}`
      break
    case 'card':
      cls += ` ${tabItemCardClasses}`
      if (active) cls += ` ${tabItemCardActiveClasses}`
      break
    case 'editable-card':
      cls += ` ${tabItemEditableCardClasses}`
      if (active) cls += ` ${tabItemEditableCardActiveClasses}`
      break
  }

  return cls
}

/**
 * Get tab pane classes based on active state
 */
export function getTabPaneClasses(active: boolean): string {
  return active ? tabPaneBaseClasses : `${tabPaneBaseClasses} ${tabPaneHiddenClasses}`
}

/**
 * Check if a key is active
 */
export function isKeyActive(key: string | number, activeKey: string | number | undefined): boolean {
  return activeKey !== undefined && key === activeKey
}

/**
 * Get the next tab key after removing a tab
 */
export function getNextActiveKey(
  removedKey: string | number,
  currentActiveKey: string | number | undefined,
  allKeys: (string | number)[]
): string | number | undefined {
  // If removing a non-active tab, keep current active key
  if (removedKey !== currentActiveKey) {
    return currentActiveKey
  }

  // Find the index of the removed key
  const removedIndex = allKeys.indexOf(removedKey)

  // If removed key is not found or is the only tab, return undefined
  if (removedIndex === -1 || allKeys.length <= 1) {
    return undefined
  }

  // Try to activate the next tab
  if (removedIndex < allKeys.length - 1) {
    return allKeys[removedIndex + 1]
  }

  // If removing the last tab, activate the previous one
  return allKeys[removedIndex - 1]
}
