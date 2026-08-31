/**
 * Tabs shared styles, key matching, keyboard/swipe, and indicator helpers.
 */

import type { TabType, TabPosition, TabSize } from '../types/tabs'
import { isBrowser } from './env'
import type { SwipeDirection } from './gesture-utils'

export interface TabNavListStyle {
  display?: string
  gridTemplateColumns?: string
  gridTemplateRows?: string
  gap?: string
}

export interface TabIndicatorStyle {
  width?: string
  height?: string
  transform?: string
  insetInlineStart?: string
  insetBlockStart?: string
  opacity: string
}

export interface TabRecord {
  key: string | number
  disabled: boolean
  closable?: boolean
  label?: string
}

export const TAB_PANE_COMPONENT_NAME = 'TigerTabPane'

export const tabsBaseClasses = 'w-full'

export const tabNavBaseClasses = 'flex'

export const tabNavPositionClasses = {
  top: 'flex-row',
  bottom: 'flex-row',
  left: 'flex-col',
  right: 'flex-col'
}

export const tabNavLineBorderClasses = {
  top: 'border-b border-[var(--tiger-border,#e5e7eb)]',
  bottom: 'border-t border-[var(--tiger-border,#e5e7eb)]',
  left: 'border-e border-[var(--tiger-border,#e5e7eb)]',
  right: 'border-s border-[var(--tiger-border,#e5e7eb)]'
}

export const tabNavListBaseClasses = 'relative flex gap-1 overflow-auto'

export const tabNavListPositionClasses = {
  top: 'flex-row',
  bottom: 'flex-row',
  left: 'flex-col',
  right: 'flex-col'
}

export const tabNavListCenteredClasses = 'justify-center'

export const tabItemBaseClasses =
  'relative z-10 cursor-pointer transition-all duration-200 motion-reduce:transition-none select-none flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40 focus-visible:ring-offset-2 active:opacity-90'

export const tabItemSizeClasses = {
  small: 'text-sm px-3 py-1.5',
  medium: 'text-base px-4 py-2',
  large: 'text-lg px-5 py-2.5'
}

export const tabItemLineClasses =
  'border-transparent hover:text-[var(--tiger-primary,#2563eb)] text-[var(--tiger-text-muted,#6b7280)] shrink-0'

export const tabItemLineActiveClasses = 'text-[var(--tiger-primary,#2563eb)] font-medium'

export const tabIndicatorBaseClasses =
  'pointer-events-none absolute z-0 rounded-full bg-[var(--tiger-primary,#2563eb)] transition-[inset,width,height] duration-200 ease-out motion-reduce:transition-none'

export const tabIndicatorPositionClasses: Record<TabPosition, string> = {
  top: 'bottom-0 h-0.5',
  bottom: 'top-0 h-0.5',
  left: 'inset-inline-end-0 w-0.5',
  right: 'inset-inline-start-0 w-0.5'
}

export const tabItemCardClasses =
  'border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#fff)] hover:text-[var(--tiger-primary,#2563eb)] text-[var(--tiger-text-muted,#6b7280)] shrink-0'

export const tabItemCardActiveClasses =
  'bg-[var(--tiger-surface,#fff)] border-[var(--tiger-primary,#2563eb)] text-[var(--tiger-primary,#2563eb)] font-medium z-10'

export const tabItemEditableCardClasses =
  'border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)] hover:bg-[var(--tiger-surface,#fff)] hover:text-[var(--tiger-primary,#2563eb)] text-[var(--tiger-text-muted,#6b7280)] shrink-0'

export const tabItemEditableCardActiveClasses =
  'bg-[var(--tiger-surface,#fff)] border-[var(--tiger-primary,#2563eb)] text-[var(--tiger-primary,#2563eb)] font-medium z-10'

export const tabItemPillsClasses =
  'rounded-full bg-transparent hover:bg-[var(--tiger-primary-subtle,#eff6ff)] hover:text-[var(--tiger-primary,#2563eb)] text-[var(--tiger-text-muted,#6b7280)] shrink-0'

export const tabItemPillsActiveClasses =
  'bg-[var(--tiger-primary,#2563eb)] text-white font-medium shadow-sm'

export const tabItemDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

export const tabCloseButtonClasses =
  'ms-2 p-0.5 rounded-[var(--tiger-radius-sm,0.375rem)] hover:bg-[var(--tiger-surface-muted,#e5e7eb)] transition-colors duration-150 motion-reduce:transition-none'

export const tabContentBaseClasses = 'min-w-0'

export const tabPaneBaseClasses = 'w-full'

export const tabPaneHiddenClasses = 'hidden'

export const tabAddButtonClasses =
  'shrink-0 px-3 py-2 border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)] hover:bg-[var(--tiger-surface,#fff)] hover:text-[var(--tiger-primary,#2563eb)] text-[var(--tiger-text-muted,#6b7280)] cursor-pointer transition-colors duration-200 motion-reduce:transition-none'

export function normalizeTabKey(key: string | number): string {
  return String(key)
}

export function formatTabKey(key: string | number): string {
  return typeof key === 'number' ? `n:${key}` : `s:${key}`
}

export function parseTabKey(raw: string | null | undefined): string | number | undefined {
  if (raw == null || raw === '') return undefined
  if (raw.startsWith('n:')) {
    const value = Number(raw.slice(2))
    return Number.isFinite(value) ? value : raw.slice(2)
  }
  if (raw.startsWith('s:')) return raw.slice(2)
  return raw
}

export function isKeyActive(key: string | number, activeKey: string | number | undefined): boolean {
  return activeKey !== undefined && normalizeTabKey(key) === normalizeTabKey(activeKey)
}

export function findTabIndex(
  keys: Array<string | number>,
  key: string | number | undefined
): number {
  if (key === undefined) return -1
  return keys.findIndex((item) => normalizeTabKey(item) === normalizeTabKey(key))
}

export function getEnabledTabKeys(tabs: TabRecord[]): Array<string | number> {
  return tabs.filter((tab) => !tab.disabled).map((tab) => tab.key)
}

export function getDefaultActiveKey(tabs: TabRecord[]): string | number | undefined {
  return tabs.find((tab) => !tab.disabled)?.key
}

export function resolveDisplayedActiveKey(
  requested: string | number | undefined,
  tabs: TabRecord[]
): string | number | undefined {
  if (requested !== undefined && tabs.some((tab) => isKeyActive(tab.key, requested))) {
    return tabs.find((tab) => isKeyActive(tab.key, requested))?.key
  }
  return getDefaultActiveKey(tabs)
}

export function getNextActiveKey(
  removedKey: string | number,
  currentActiveKey: string | number | undefined,
  tabs: TabRecord[]
): string | number | undefined {
  const remaining = tabs.filter((tab) => !isKeyActive(tab.key, removedKey))
  if (!isKeyActive(removedKey, currentActiveKey)) {
    return resolveDisplayedActiveKey(currentActiveKey, remaining)
  }

  const keys = tabs.map((tab) => tab.key)
  const removedIndex = findTabIndex(keys, removedKey)

  const enabledAfter = remaining.filter((tab) => {
    if (tab.disabled) return false
    return findTabIndex(keys, tab.key) > removedIndex
  })
  if (enabledAfter.length > 0) return enabledAfter[0].key

  const enabledBefore = remaining.filter((tab) => {
    if (tab.disabled) return false
    return findTabIndex(keys, tab.key) < removedIndex
  })
  if (enabledBefore.length > 0) {
    return enabledBefore[enabledBefore.length - 1].key
  }

  return getDefaultActiveKey(remaining)
}

export function getAdjacentEnabledKey(
  tabs: TabRecord[],
  currentKey: string | number | undefined,
  delta: 1 | -1
): string | number | undefined {
  const enabled = getEnabledTabKeys(tabs)
  if (enabled.length === 0) return undefined
  const currentIndex = findTabIndex(enabled, currentKey)
  const baseIndex = currentIndex >= 0 ? currentIndex : 0
  return enabled[(baseIndex + delta + enabled.length) % enabled.length]
}

export function getTabKeyboardDelta(
  key: string,
  position: TabPosition,
  dir: 'ltr' | 'rtl'
): 1 | -1 | 'home' | 'end' | null {
  const vertical = position === 'left' || position === 'right'
  if (key === 'Home') return 'home'
  if (key === 'End') return 'end'
  if (vertical) {
    if (key === 'ArrowDown') return 1
    if (key === 'ArrowUp') return -1
    return null
  }
  const rtl = dir === 'rtl'
  if (key === 'ArrowRight') return rtl ? -1 : 1
  if (key === 'ArrowLeft') return rtl ? 1 : -1
  return null
}

export function getTabSwipeDelta(
  direction: SwipeDirection,
  position: TabPosition,
  dir: 'ltr' | 'rtl'
): 1 | -1 | null {
  const vertical = position === 'left' || position === 'right'
  if (vertical) {
    if (direction === 'up') return -1
    if (direction === 'down') return 1
    return null
  }
  const rtl = dir === 'rtl'
  if (direction === 'left') return rtl ? -1 : 1
  if (direction === 'right') return rtl ? 1 : -1
  return null
}

export function isSwipeBlockedByNestedScroll(
  target: EventTarget | null,
  root: EventTarget | null
): boolean {
  if (!isBrowser() || !(target instanceof Element)) return false
  let node: Element | null = target
  while (node && node !== root) {
    if (node instanceof HTMLElement) {
      const overflowX = getComputedStyle(node).overflowX
      if (
        (overflowX === 'auto' || overflowX === 'scroll') &&
        node.scrollWidth > node.clientWidth + 1
      ) {
        return true
      }
    }
    node = node.parentElement
  }
  return false
}

export function pickTablistNamingAttrs(
  attrs: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!attrs) return {}
  const naming: Record<string, unknown> = {}
  const id = attrs.id
  const ariaLabel = attrs['aria-label'] ?? attrs.ariaLabel
  const ariaLabelledby = attrs['aria-labelledby'] ?? attrs.ariaLabelledby
  if (id != null) naming.id = id
  if (ariaLabel != null) naming['aria-label'] = ariaLabel
  if (ariaLabelledby != null) naming['aria-labelledby'] = ariaLabelledby
  return naming
}

export function isTabPaneType(type: unknown, tabPane: unknown): boolean {
  if (type === tabPane) return true
  if (!type || typeof type !== 'object') return false
  const named = type as { name?: string; displayName?: string }
  return named.name === TAB_PANE_COMPONENT_NAME || named.displayName === 'TabPane'
}

export function isTabPaneChildProps(props: Record<string, unknown> | null | undefined): boolean {
  if (!props) return false
  const key = props.tabKey ?? props['tab-key']
  return (typeof key === 'string' || typeof key === 'number') && typeof props.label === 'string'
}

export function readTabPaneKey(props: Record<string, unknown>): string | number | undefined {
  const key = props.tabKey ?? props['tab-key']
  return typeof key === 'string' || typeof key === 'number' ? key : undefined
}

export function getTabsContainerClasses(position: TabPosition): string {
  if (position === 'right') return `${tabsBaseClasses} flex flex-row-reverse`
  if (position === 'left') return `${tabsBaseClasses} flex`
  return tabsBaseClasses
}

export function getTabNavClasses(position: TabPosition, type: TabType): string {
  const base = `${tabNavBaseClasses} ${tabNavPositionClasses[position]} items-stretch`
  return type === 'line' ? `${base} ${tabNavLineBorderClasses[position]}` : base
}

export function getTabNavListClasses(position: TabPosition, centered: boolean): string {
  const base = `${tabNavListBaseClasses} ${tabNavListPositionClasses[position]}`
  return centered && (position === 'top' || position === 'bottom')
    ? `${base} ${tabNavListCenteredClasses}`
    : base
}

export function getTabNavListStyle(
  _type: TabType,
  _position: TabPosition,
  _tabCount: number
): TabNavListStyle {
  return {}
}

export function getTabIndicatorClasses(type: TabType, position: TabPosition): string {
  return type === 'line'
    ? `${tabIndicatorBaseClasses} ${tabIndicatorPositionClasses[position]}`
    : 'hidden'
}

export function getTabIndicatorStyleFromBox(
  box: {
    inlineStart: number
    blockStart: number
    inlineSize: number
    blockSize: number
  } | null,
  position: TabPosition
): TabIndicatorStyle {
  if (!box) {
    return { opacity: '0' }
  }
  if (position === 'left' || position === 'right') {
    return {
      height: `${box.blockSize}px`,
      insetBlockStart: `${box.blockStart}px`,
      opacity: '1'
    }
  }
  return {
    width: `${box.inlineSize}px`,
    insetInlineStart: `${box.inlineStart}px`,
    opacity: '1'
  }
}

export function measureTabIndicatorBox(
  list: HTMLElement,
  tab: HTMLElement | null,
  position: TabPosition,
  dir: 'ltr' | 'rtl'
): { inlineStart: number; blockStart: number; inlineSize: number; blockSize: number } | null {
  if (!tab) return null
  const listRect = list.getBoundingClientRect()
  const tabRect = tab.getBoundingClientRect()
  if (position === 'left' || position === 'right') {
    return {
      inlineStart: 0,
      blockStart: tabRect.top - listRect.top + list.scrollTop,
      inlineSize: tabRect.width,
      blockSize: tabRect.height
    }
  }
  const inlineStart =
    dir === 'rtl'
      ? listRect.right - tabRect.right + list.scrollLeft
      : tabRect.left - listRect.left + list.scrollLeft
  return {
    inlineStart,
    blockStart: 0,
    inlineSize: tabRect.width,
    blockSize: tabRect.height
  }
}

/** @deprecated Use getTabIndicatorStyleFromBox with a measured tab. */
export function getTabIndicatorStyle(
  activeIndex: number,
  tabCount: number,
  position: TabPosition
): TabIndicatorStyle {
  if (activeIndex < 0 || tabCount <= 0) {
    return { opacity: '0' }
  }
  const safeTabCount = Math.max(1, tabCount)
  const safeActiveIndex = Math.min(Math.max(0, activeIndex), safeTabCount - 1)
  const size = `calc(100% / ${safeTabCount})`
  if (position === 'left' || position === 'right') {
    return {
      height: size,
      insetBlockStart: `calc(${safeActiveIndex} * ${size})`,
      opacity: '1'
    }
  }
  return {
    width: size,
    insetInlineStart: `calc(${safeActiveIndex} * ${size})`,
    opacity: '1'
  }
}

function getCardChromeClasses(position: TabPosition, active: boolean): string {
  if (position === 'bottom') {
    return active ? 'rounded-b -mt-px border-t-[var(--tiger-surface,#fff)]' : 'rounded-b -mt-px'
  }
  if (position === 'left') {
    return active ? 'rounded-s -me-px border-e-[var(--tiger-surface,#fff)]' : 'rounded-s -me-px'
  }
  if (position === 'right') {
    return active ? 'rounded-e -ms-px border-s-[var(--tiger-surface,#fff)]' : 'rounded-e -ms-px'
  }
  return active ? 'rounded-t -mb-px border-b-[var(--tiger-surface,#fff)]' : 'rounded-t -mb-px'
}

export function getTabItemClasses(
  active: boolean,
  disabled: boolean,
  type: TabType,
  size: TabSize,
  position: TabPosition = 'top'
): string {
  let cls = `${tabItemBaseClasses} ${tabItemSizeClasses[size]}`

  if (disabled) return `${cls} ${tabItemDisabledClasses}`

  switch (type) {
    case 'line':
      cls += ` ${tabItemLineClasses}`
      if (active) cls += ` ${tabItemLineActiveClasses}`
      break
    case 'card':
      cls += ` ${tabItemCardClasses} ${getCardChromeClasses(position, active)}`
      if (active) cls += ` ${tabItemCardActiveClasses}`
      break
    case 'editable-card':
      cls += ` ${tabItemEditableCardClasses} ${getCardChromeClasses(position, active)}`
      if (active) cls += ` ${tabItemEditableCardActiveClasses}`
      break
    case 'pills':
      cls += ` ${tabItemPillsClasses}`
      if (active) cls += ` ${tabItemPillsActiveClasses}`
      break
  }

  return cls
}

export function getTabContentClasses(position: TabPosition): string {
  if (position === 'left' || position === 'right') {
    return `${tabContentBaseClasses} flex-1`
  }
  return `${tabContentBaseClasses} w-full`
}

export function getTabPaneClasses(active: boolean): string {
  return active ? tabPaneBaseClasses : `${tabPaneBaseClasses} ${tabPaneHiddenClasses}`
}

export function getTabAddButtonClasses(position: TabPosition): string {
  if (position === 'bottom') return `${tabAddButtonClasses} rounded-b`
  if (position === 'left') return `${tabAddButtonClasses} rounded-s`
  if (position === 'right') return `${tabAddButtonClasses} rounded-e`
  return `${tabAddButtonClasses} rounded-t`
}
