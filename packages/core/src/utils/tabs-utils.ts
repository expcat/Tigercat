/**
 * Tabs shared styles, key matching, keyboard/swipe, and indicator helpers.
 */

import type { TabType, TabPosition, TabSize } from '../types/tabs'
import { isBrowser } from './env'
import { typedKeyId } from './focus-utils'
import type { SwipeDirection } from './gesture-utils'
import { logicalInlineScrollPosition } from './scroll-area-utils'

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
  top: 'w-full min-w-0 flex-row',
  bottom: 'w-full min-w-0 flex-row',
  left: 'max-w-full shrink-0 flex-col',
  right: 'max-w-full shrink-0 flex-col'
}

export const tabNavLineBorderClasses = {
  top: 'border-b border-[var(--tiger-border)]',
  bottom: 'border-t border-[var(--tiger-border)]',
  left: 'border-e border-[var(--tiger-border)]',
  right: 'border-s border-[var(--tiger-border)]'
}

export const tabNavListBaseClasses = 'relative flex gap-1'

/**
 * Scroll on the tab axis only.
 * `overflow-x: auto` computes a visible cross axis to `auto`, so a horizontal
 * bar that is 1px shorter than its tabs paints a vertical scrollbar between
 * the last tab and the add button. `clip` does not do that.
 * Vertical lists stay content-sized (`shrink-0`); they must not shrink to 0
 * and must not scroll on the inline axis.
 */
const tabNavListScrollClasses: Record<TabPosition, string> = {
  top: 'min-h-min min-w-0 flex-1 overflow-x-auto overflow-y-clip',
  bottom: 'min-h-min min-w-0 flex-1 overflow-x-auto overflow-y-clip',
  left: 'w-max max-w-full shrink-0 overflow-x-clip overflow-y-auto',
  right: 'w-max max-w-full shrink-0 overflow-x-clip overflow-y-auto'
}

export const tabNavListPositionClasses = {
  top: 'flex-row',
  bottom: 'flex-row',
  left: 'flex-col',
  right: 'flex-col'
}

export const tabNavListCenteredClasses = 'justify-center'

export const tabItemBaseClasses =
  'relative z-10 cursor-pointer [transition:var(--tiger-transition-quick)] motion-reduce:transition-none select-none flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40 focus-visible:ring-offset-2 active:opacity-90'

export const tabItemSizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-5 py-2.5'
}

export const tabItemLineClasses =
  'border-transparent hover:text-[var(--tiger-primary)] text-[var(--tiger-text-secondary)] shrink-0'

export const tabItemLineActiveClasses = 'text-[var(--tiger-primary)] font-medium'

export const tabIndicatorBaseClasses =
  'pointer-events-none absolute z-0 rounded-full bg-[var(--tiger-primary)] transition-[inset,width,height] duration-200 ease-out motion-reduce:transition-none'

export const tabIndicatorPositionClasses: Record<TabPosition, string> = {
  top: 'bottom-0 h-0.5',
  bottom: 'top-0 h-0.5',
  left: 'inset-inline-end-0 w-0.5',
  right: 'inset-inline-start-0 w-0.5'
}

export const tabItemCardClasses =
  'border border-[var(--tiger-border)] bg-[var(--tiger-surface)] hover:text-[var(--tiger-primary)] text-[var(--tiger-text-secondary)] shrink-0'

export const tabItemCardActiveClasses =
  'border bg-[var(--tiger-surface)] border-[var(--tiger-primary)] text-[var(--tiger-primary)] font-medium z-10 shrink-0'

export const tabItemEditableCardClasses =
  'border border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)] hover:bg-[var(--tiger-surface)] hover:text-[var(--tiger-primary)] text-[var(--tiger-text-secondary)] shrink-0'

export const tabItemEditableCardActiveClasses =
  'border bg-[var(--tiger-surface)] border-[var(--tiger-primary)] text-[var(--tiger-primary)] font-medium z-10 shrink-0'

export const tabItemPillsClasses =
  'rounded-full bg-transparent hover:bg-[var(--tiger-primary-subtle)] hover:text-[var(--tiger-primary)] text-[var(--tiger-text-secondary)] shrink-0'

export const tabItemPillsActiveClasses =
  'bg-[var(--tiger-primary)] text-white font-medium shadow-sm'

export const tabItemDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

export const tabCloseButtonClasses =
  'ms-2 p-0.5 rounded-[var(--tiger-radius-sm)] hover:bg-[var(--tiger-surface-muted)] transition-colors duration-150 motion-reduce:transition-none'

export const tabContentBaseClasses = 'min-w-0'

export const tabPaneBaseClasses = 'w-full'

export const tabPaneHiddenClasses = 'hidden'

export const tabAddButtonClasses =
  'shrink-0 px-3 py-2 border border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)] hover:bg-[var(--tiger-surface)] hover:text-[var(--tiger-primary)] text-[var(--tiger-text-secondary)] cursor-pointer transition-colors duration-200 motion-reduce:transition-none'

export function normalizeTabKey(key: string | number): string {
  return typedKeyId(key)
}

export function formatTabKey(key: string | number): string {
  return typedKeyId(key)
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
  return activeKey !== undefined && formatTabKey(key) === formatTabKey(activeKey)
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

/**
 * Controlled keys are reflected as given. An illegal key does not become the
 * first tab. Uncontrolled keys still fall back to the first enabled tab.
 */
export function resolveDisplayedActiveKey(
  requested: string | number | undefined,
  tabs: TabRecord[],
  options?: { controlled?: boolean }
): string | number | undefined {
  if (requested !== undefined) {
    const match = tabs.find((tab) => isKeyActive(tab.key, requested))
    return match ? match.key : requested
  }
  if (options?.controlled) return undefined
  return getDefaultActiveKey(tabs)
}

export function isIllegalTabKey(
  requested: string | number | undefined,
  tabs: TabRecord[]
): boolean {
  if (requested === undefined) return false
  return !tabs.some((tab) => isKeyActive(tab.key, requested) && !tab.disabled)
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
  if (position === 'right') return `${tabsBaseClasses} flex min-w-0 flex-row-reverse`
  if (position === 'left') return `${tabsBaseClasses} flex min-w-0`
  return tabsBaseClasses
}

export function getTabNavClasses(position: TabPosition, type: TabType): string {
  const base = `${tabNavBaseClasses} ${tabNavPositionClasses[position]} items-stretch`
  return type === 'line' ? `${base} ${tabNavLineBorderClasses[position]}` : base
}

function tabListSeamPadding(position: TabPosition, type: TabType): string {
  if (type !== 'card' && type !== 'editable-card') return ''
  // Card tabs use a 1px negative margin to cover the shared edge. The clip
  // scrollport needs that pixel inside the padding box or the seam is cut off.
  if (position === 'bottom') return 'pt-px'
  if (position === 'left') return 'pe-px'
  if (position === 'right') return 'ps-px'
  return 'pb-px'
}

export function getTabNavListClasses(
  position: TabPosition,
  centered: boolean,
  type: TabType = 'line'
): string {
  const parts = [
    tabNavListBaseClasses,
    tabNavListPositionClasses[position],
    tabNavListScrollClasses[position],
    tabListSeamPadding(position, type),
    centered && (position === 'top' || position === 'bottom') ? tabNavListCenteredClasses : ''
  ]
  return parts.filter(Boolean).join(' ')
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
  const scrollFromStart = logicalInlineScrollPosition(
    list.scrollLeft,
    list.scrollWidth,
    list.clientWidth,
    dir
  )
  const visualDelta = dir === 'rtl' ? listRect.right - tabRect.right : tabRect.left - listRect.left
  const inlineStart = visualDelta + scrollFromStart
  return {
    inlineStart,
    blockStart: 0,
    inlineSize: tabRect.width,
    blockSize: tabRect.height
  }
}

function getCardChromeClasses(position: TabPosition, active: boolean): string {
  if (position === 'bottom') {
    return active ? 'rounded-b -mt-px border-t-[var(--tiger-surface)]' : 'rounded-b -mt-px'
  }
  if (position === 'left') {
    return active ? 'rounded-s -me-px border-e-[var(--tiger-surface)]' : 'rounded-s -me-px'
  }
  if (position === 'right') {
    return active ? 'rounded-e -ms-px border-s-[var(--tiger-surface)]' : 'rounded-e -ms-px'
  }
  return active ? 'rounded-t -mb-px border-b-[var(--tiger-surface)]' : 'rounded-t -mb-px'
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

  // Inactive and active color utilities are mutually exclusive. Tailwind v4
  // resolves conflicting utilities by stylesheet order, so keeping both
  // `bg-transparent` and `bg-primary` on one node paints the inactive color.
  switch (type) {
    case 'line':
      cls += active
        ? ` border-transparent shrink-0 ${tabItemLineActiveClasses}`
        : ` ${tabItemLineClasses}`
      break
    case 'card':
      cls += active ? ` ${tabItemCardActiveClasses}` : ` ${tabItemCardClasses}`
      cls += ` ${getCardChromeClasses(position, active)}`
      break
    case 'editable-card':
      cls += active ? ` ${tabItemEditableCardActiveClasses}` : ` ${tabItemEditableCardClasses}`
      cls += ` ${getCardChromeClasses(position, active)}`
      break
    case 'pills':
      cls += active
        ? ` rounded-full shrink-0 ${tabItemPillsActiveClasses}`
        : ` ${tabItemPillsClasses}`
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

export type TabActivation = 'automatic' | 'manual'

export function tabActivationSelectsOnArrow(activation: TabActivation | undefined): boolean {
  return activation !== 'manual'
}

export function splitOverflowTabKeys<K extends string | number>(options: {
  keys: readonly K[]
  widths: readonly number[]
  available: number
  activeKey?: K
  moreWidth?: number
  /** Main-axis gap between tabs. Omitted gaps look like a leftover scrollbar. */
  gap?: number
}): { visible: K[]; overflow: K[] } {
  const moreWidth = options.moreWidth ?? 48
  const gap = options.gap ?? 0
  const widths = options.keys.map((key, index) => options.widths[index] ?? 0)
  const total = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, widths.length - 1)
  // 1px of subpixel rounding is not overflow. A not-yet-laid-out port is 0.
  if (options.available <= 0 || total <= options.available + 1) {
    return { visible: [...options.keys], overflow: [] }
  }
  const budget = Math.max(0, options.available - moreWidth)
  const visible: K[] = []
  let used = 0
  options.keys.forEach((key, index) => {
    const width = widths[index]
    const next = visible.length === 0 ? width : used + gap + width
    if (next <= budget + 1) {
      visible.push(key)
      used = next
    }
  })
  if (
    options.activeKey != null &&
    !visible.some((key) => String(key) === String(options.activeKey))
  ) {
    const activeIndex = options.keys.findIndex((key) => String(key) === String(options.activeKey))
    if (activeIndex >= 0) {
      if (visible.length > 0) visible.pop()
      visible.push(options.keys[activeIndex])
    }
  }
  const visibleSet = new Set(visible.map((key) => String(key)))
  const overflow = options.keys.filter((key) => !visibleSet.has(String(key)))
  return { visible, overflow }
}

/**
 * Overflow uses the tab axis. Vertical tabs are stacked, so summing their
 * widths always exceeds the nav width and hides the whole column into More.
 * The More control sits outside the scrollport, so `moreSize` defaults to 0;
 * pass it only when that control is inside the measured port.
 */
export function resolveTabListOverflow<K extends string | number>(options: {
  position: TabPosition
  keys: readonly K[]
  inlineSizes: readonly number[]
  blockSizes: readonly number[]
  clientWidth: number
  clientHeight: number
  activeKey?: K
  moreSize?: number
  gap?: number
}): { visible: K[]; overflow: K[] } {
  const vertical = options.position === 'left' || options.position === 'right'
  return splitOverflowTabKeys({
    keys: options.keys,
    widths: vertical ? options.blockSizes : options.inlineSizes,
    available: vertical ? options.clientHeight : options.clientWidth,
    activeKey: options.activeKey,
    moreWidth: options.moreSize ?? 0,
    gap: options.gap
  })
}

export function nextTabOrder<K extends string | number>(keys: readonly K[], from: K, to: K): K[] {
  const next = [...keys]
  const fromIndex = next.findIndex((key) => String(key) === String(from))
  const toIndex = next.findIndex((key) => String(key) === String(to))
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return next
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function getTabAddButtonClasses(position: TabPosition): string {
  if (position === 'bottom') return `${tabAddButtonClasses} rounded-b`
  if (position === 'left') return `${tabAddButtonClasses} rounded-s`
  if (position === 'right') return `${tabAddButtonClasses} rounded-e`
  return `${tabAddButtonClasses} rounded-t`
}
