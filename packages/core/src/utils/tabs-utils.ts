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
export const tabNavBaseClasses = 'flex transition-colors duration-200'

/**
 * Tab nav position classes
 */
export const tabNavPositionClasses = {
  top: 'flex-row border-b border-gray-200',
  bottom: 'flex-row border-t border-gray-200',
  left: 'flex-col border-r border-gray-200',
  right: 'flex-col border-l border-gray-200',
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
  right: 'flex-col',
}

/**
 * Tab nav list centered classes
 */
export const tabNavListCenteredClasses = 'justify-center'

/**
 * Tab item base classes
 */
export const tabItemBaseClasses = 'relative px-4 py-2 cursor-pointer transition-all duration-200 select-none flex items-center gap-2'

/**
 * Tab item size classes
 */
export const tabItemSizeClasses = {
  small: 'text-sm px-3 py-1.5',
  medium: 'text-base px-4 py-2',
  large: 'text-lg px-5 py-2.5',
}

/**
 * Tab item type classes - line
 */
export const tabItemLineClasses = 'border-b-2 border-transparent hover:text-[var(--tiger-primary,#2563eb)] text-gray-600'

/**
 * Tab item type classes - line active
 */
export const tabItemLineActiveClasses = 'border-[var(--tiger-primary,#2563eb)] text-[var(--tiger-primary,#2563eb)] font-medium'

/**
 * Tab item type classes - card
 */
export const tabItemCardClasses = 'border border-gray-200 rounded-t bg-white hover:text-[var(--tiger-primary,#2563eb)] text-gray-600 -mb-px'

/**
 * Tab item type classes - card active
 */
export const tabItemCardActiveClasses = 'bg-white border-[var(--tiger-primary,#2563eb)] border-b-white text-[var(--tiger-primary,#2563eb)] font-medium z-10'

/**
 * Tab item type classes - editable-card
 */
export const tabItemEditableCardClasses = 'border border-gray-200 rounded-t bg-gray-50 hover:bg-white hover:text-[var(--tiger-primary,#2563eb)] text-gray-600 -mb-px'

/**
 * Tab item type classes - editable-card active
 */
export const tabItemEditableCardActiveClasses = 'bg-white border-[var(--tiger-primary,#2563eb)] border-b-white text-[var(--tiger-primary,#2563eb)] font-medium z-10'

/**
 * Tab item disabled classes
 */
export const tabItemDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

/**
 * Tab close button classes
 */
export const tabCloseButtonClasses = 'ml-2 p-0.5 rounded hover:bg-gray-200 transition-colors duration-150'

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
export const tabAddButtonClasses = 'px-3 py-2 border border-gray-200 rounded-t bg-gray-50 hover:bg-white hover:text-[var(--tiger-primary,#2563eb)] text-gray-600 cursor-pointer transition-colors duration-200'

/**
 * Get tabs container classes
 */
export function getTabsContainerClasses(position: TabPosition): string {
  const classes = [tabsBaseClasses]
  
  if (position === 'left' || position === 'right') {
    classes.push('flex')
    if (position === 'right') {
      classes.push('flex-row-reverse')
    }
  }
  
  return classes.filter(Boolean).join(' ')
}

/**
 * Get tab nav classes based on position
 */
export function getTabNavClasses(position: TabPosition, type: TabType): string {
  const classes = [tabNavBaseClasses, tabNavPositionClasses[position]]
  
  // No border for card types since they have their own borders
  if (type === 'card' || type === 'editable-card') {
    classes.push('border-0')
  }
  
  return classes.filter(Boolean).join(' ')
}

/**
 * Get tab nav list classes
 */
export function getTabNavListClasses(position: TabPosition, centered: boolean): string {
  const classes = [tabNavListBaseClasses, tabNavListPositionClasses[position]]
  
  if (centered && (position === 'top' || position === 'bottom')) {
    classes.push(tabNavListCenteredClasses)
  }
  
  return classes.filter(Boolean).join(' ')
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
  const classes = [tabItemBaseClasses, tabItemSizeClasses[size]]
  
  if (disabled) {
    classes.push(tabItemDisabledClasses)
  } else {
    switch (type) {
      case 'line':
        classes.push(tabItemLineClasses)
        if (active) {
          classes.push(tabItemLineActiveClasses)
        }
        break
      case 'card':
        classes.push(tabItemCardClasses)
        if (active) {
          classes.push(tabItemCardActiveClasses)
        }
        break
      case 'editable-card':
        classes.push(tabItemEditableCardClasses)
        if (active) {
          classes.push(tabItemEditableCardActiveClasses)
        }
        break
    }
  }
  
  return classes.filter(Boolean).join(' ')
}

/**
 * Get tab pane classes based on active state
 */
export function getTabPaneClasses(active: boolean): string {
  const classes = [tabPaneBaseClasses]
  
  if (!active) {
    classes.push(tabPaneHiddenClasses)
  }
  
  return classes.filter(Boolean).join(' ')
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
