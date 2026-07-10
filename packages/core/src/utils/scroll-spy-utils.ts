import type {
  ScrollSpyChangePayload,
  ScrollSpyDirection,
  ScrollSpyItem,
  ScrollSpyKey
} from '../types/scroll-spy'
import { createAnchorObserver, findActiveAnchor, scrollToAnchor } from './anchor-utils'
import { isBrowser } from './env'

export interface FlatScrollSpyItem extends ScrollSpyItem {
  depth: number
}

export interface ScrollSpyObserverOptions {
  container: HTMLElement | Window
  offsetTop?: number
  targetOffset?: number
  bounds?: number
  onChange: (item: ScrollSpyItem) => void
}

export const scrollSpyRootClasses =
  'relative text-sm text-[var(--tiger-text-muted,#6b7280)]'

export const scrollSpyStickyClasses = 'sticky top-0'

export const scrollSpyListVerticalClasses = 'flex flex-col gap-1'

export const scrollSpyListHorizontalClasses = 'flex flex-wrap items-center gap-2'

export const scrollSpyNestedListClasses =
  'mt-1 ml-3 flex flex-col gap-1 border-l border-[var(--tiger-border,#e5e7eb)] pl-3'

export const scrollSpyItemBaseClasses =
  'block rounded-md px-3 py-1.5 text-left transition-colors duration-200 motion-reduce:transition-none hover:bg-[var(--tiger-surface-muted,#f3f4f6)] hover:text-[var(--tiger-primary,#2563eb)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tiger-surface,#fff)]'

export const scrollSpyItemActiveClasses =
  'bg-[var(--tiger-primary,#2563eb)]/10 font-medium text-[var(--tiger-primary,#2563eb)]'

export const scrollSpyItemDisabledClasses = 'cursor-not-allowed opacity-50 hover:bg-transparent'

export function getScrollSpyKeyString(key: ScrollSpyKey): string {
  return String(key)
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

export function getScrollSpyListClasses(direction: ScrollSpyDirection): string {
  return direction === 'horizontal' ? scrollSpyListHorizontalClasses : scrollSpyListVerticalClasses
}

export function getScrollSpyRootClasses(sticky: boolean, className?: string): string {
  return [scrollSpyRootClasses, sticky && scrollSpyStickyClasses, className]
    .filter(Boolean)
    .join(' ')
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

export function createScrollSpyObserver(
  items: ScrollSpyItem[] = [],
  options: ScrollSpyObserverOptions
): () => void {
  if (!isBrowser()) return () => {}

  const enabledItems = getEnabledScrollSpyItems(items)
  if (enabledItems.length === 0) return () => {}

  const hrefs = enabledItems.map((item) => item.href)
  const itemByHref = new Map(enabledItems.map((item) => [item.href, item]))
  const offset = options.targetOffset ?? options.offsetTop ?? 0

  const notify = (href: string) => {
    const item = itemByHref.get(href)
    if (item) options.onChange(item)
  }

  if (typeof IntersectionObserver !== 'undefined') {
    const root = options.container === window ? null : (options.container as Element)
    return createAnchorObserver(hrefs, {
      offsetTop: offset,
      root,
      onChange: notify
    })
  }

  const update = () => {
    const activeHref = findActiveAnchor(hrefs, options.container, options.bounds ?? 5, offset)
    notify(activeHref)
  }

  const scrollTarget = options.container === window ? window : (options.container as HTMLElement)
  scrollTarget.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update, { passive: true })

  return () => {
    scrollTarget.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
  }
}
