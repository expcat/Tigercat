import type {
  ScrollSpyChangePayload,
  ScrollSpyDirection,
  ScrollSpyItem,
  ScrollSpyKey
} from '../types/scroll-spy'
import type { ScrollRootInput } from '../types/scroll-root'
import {
  createAnchorObserver,
  getAnchorTargetElement,
  replaceAnchorHash,
  scrollToAnchor,
  shouldHandleAnchorClick,
  type AnchorClickLike
} from './anchor-utils'
import { overlayZIndexClass } from './floating'
import { isBrowser } from './env'
import { resolveScrollRoot } from './scroll-root'

export interface FlatScrollSpyItem extends ScrollSpyItem {
  depth: number
}

export interface ScrollSpyObserverOptions {
  container?: ScrollRootInput
  offsetTop?: number
  targetOffset?: number
  bounds?: number
  holdUntilScroll?: boolean
  onChange: (item: ScrollSpyItem) => void
}

export const scrollSpyRootClasses = 'relative text-sm text-[var(--tiger-text-muted,#6b7280)]'

export const scrollSpyStickyClasses = `sticky ${overlayZIndexClass.viewport}`

export const scrollSpyListVerticalClasses = 'flex flex-col gap-1'

export const scrollSpyListHorizontalClasses = 'flex flex-wrap items-center gap-2'

export const scrollSpyNestedListClasses =
  'mt-1 ms-3 flex flex-col gap-1 border-s border-[var(--tiger-border,#e5e7eb)] ps-3'

export const scrollSpyItemBaseClasses =
  'block rounded-md px-3 py-1.5 text-start transition-colors duration-200 motion-reduce:transition-none hover:bg-[var(--tiger-surface-muted,#f3f4f6)] hover:text-[var(--tiger-primary,#2563eb)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tiger-surface,#fff)]'

export const scrollSpyItemActiveClasses =
  'bg-[var(--tiger-primary,#2563eb)]/10 font-medium text-[var(--tiger-primary,#2563eb)]'

export const scrollSpyItemDisabledClasses = 'cursor-not-allowed opacity-50 hover:bg-transparent'

export function getScrollSpyKeyString(key: ScrollSpyKey): string {
  return String(key)
}

export function resolveScrollSpyOffset(targetOffset?: number, offsetTop?: number): number {
  return targetOffset ?? offsetTop ?? 0
}

export function flattenScrollSpyItems(
  items: ScrollSpyItem[] = [],
  depth: number = 0
): FlatScrollSpyItem[] {
  const result: FlatScrollSpyItem[] = []

  for (const item of items) {
    result.push({ ...item, depth })
    if (item.children?.length) result.push(...flattenScrollSpyItems(item.children, depth + 1))
  }

  return result
}

export function getEnabledScrollSpyItems(items: ScrollSpyItem[] = []): FlatScrollSpyItem[] {
  return flattenScrollSpyItems(items).filter((item) => !item.disabled && Boolean(item.href))
}

export function getScrollSpyTargetHrefs(items: ScrollSpyItem[] = []): string[] {
  return getEnabledScrollSpyItems(items).map((item) => item.href)
}

export function getScrollSpyItemByKey(
  items: ScrollSpyItem[] = [],
  key?: ScrollSpyKey
): FlatScrollSpyItem | undefined {
  if (key === undefined) return undefined
  const keyString = getScrollSpyKeyString(key)
  return flattenScrollSpyItems(items).find((item) => getScrollSpyKeyString(item.key) === keyString)
}

export function getScrollSpyItemByHref(
  items: ScrollSpyItem[] = [],
  href: string
): FlatScrollSpyItem | undefined {
  return flattenScrollSpyItems(items).find((item) => item.href === href)
}

export function getInitialScrollSpyActiveKey(
  items: ScrollSpyItem[] = [],
  activeKey?: ScrollSpyKey,
  defaultActiveKey?: ScrollSpyKey
): ScrollSpyKey | undefined {
  if (activeKey !== undefined) return activeKey
  if (defaultActiveKey !== undefined) return defaultActiveKey
  return getEnabledScrollSpyItems(items)[0]?.key
}

export function getScrollSpyListClasses(direction: ScrollSpyDirection, nested = false): string {
  if (nested) {
    return direction === 'horizontal'
      ? 'mt-1 flex flex-wrap items-center gap-2'
      : scrollSpyNestedListClasses
  }
  return direction === 'horizontal' ? scrollSpyListHorizontalClasses : scrollSpyListVerticalClasses
}

export function getScrollSpyRootClasses(sticky: boolean, className?: string): string {
  return [scrollSpyRootClasses, sticky && scrollSpyStickyClasses, className]
    .filter(Boolean)
    .join(' ')
}

export function getScrollSpyRootStyle(
  sticky: boolean,
  offset: number,
  style?: Record<string, string | number>
): Record<string, string | number> | undefined {
  if (!sticky && !style) return style
  return {
    ...(sticky ? { top: `${offset}px` } : {}),
    ...style
  }
}

export function getScrollSpyItemClasses(
  active: boolean,
  disabled: boolean = false,
  className?: string
): string {
  return [
    scrollSpyItemBaseClasses,
    active && scrollSpyItemActiveClasses,
    disabled && scrollSpyItemDisabledClasses,
    className
  ]
    .filter(Boolean)
    .join(' ')
}

export function createScrollSpyPayload(
  item: ScrollSpyItem,
  source: ScrollSpyChangePayload['source']
): ScrollSpyChangePayload {
  return {
    activeKey: item.key,
    href: item.href,
    item,
    source
  }
}

export function scrollToScrollSpyItem(
  item: ScrollSpyItem,
  container: HTMLElement | Window,
  targetOffset: number = 0
): void {
  if (item.disabled) return
  scrollToAnchor(item.href, container, targetOffset)
}

export function resolveScrollSpyContainer(input?: ScrollRootInput): HTMLElement | Window {
  const root = resolveScrollRoot(input)
  if (!root.target || root.isWindow) return isBrowser() ? window : (null as unknown as Window)
  return root.target as HTMLElement
}

export function shouldActivateScrollSpyClick(item: ScrollSpyItem, event: AnchorClickLike): boolean {
  if (item.disabled || !item.href) return false
  return shouldHandleAnchorClick(event, {
    hasTargetElement: Boolean(getAnchorTargetElement(item.href))
  })
}

export function activateScrollSpyClick(
  item: ScrollSpyItem,
  container: HTMLElement | Window,
  offset: number
): void {
  replaceAnchorHash(item.href)
  scrollToScrollSpyItem(item, container, offset)
}

export function createScrollSpyObserver(
  items: ScrollSpyItem[] = [],
  options: ScrollSpyObserverOptions
): () => void {
  if (!isBrowser()) return () => {}

  const enabledItems = getEnabledScrollSpyItems(items)
  if (enabledItems.length === 0) return () => {}

  const hrefs = enabledItems.map((item) => item.href)
  const itemByHref = new Map<string, ScrollSpyItem>()
  for (const item of enabledItems) {
    if (!itemByHref.has(item.href)) itemByHref.set(item.href, item)
  }
  const offset = resolveScrollSpyOffset(options.targetOffset, options.offsetTop)
  const container = resolveScrollSpyContainer(options.container)
  const root = container === window ? null : (container as Element)

  return createAnchorObserver(hrefs, {
    offsetTop: offset,
    bounds: options.bounds ?? 5,
    root,
    holdUntilScroll: options.holdUntilScroll ?? true,
    onChange: (href) => {
      const item = itemByHref.get(href)
      if (item) options.onChange(item)
    }
  })
}
