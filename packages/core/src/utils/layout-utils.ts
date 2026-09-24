import { classNames } from './class-names'
import { devWarn } from './dev-warn'
import type { HeaderVariant, LayoutDirection, LayoutSiderSide } from '../types/layout'

export const LAYOUT_SIDER_NAME = 'TigerSidebar'

/** Id of the page-level Content `main`. The outermost skip link targets this. */
export const LAYOUT_MAIN_ID = 'tiger-main'

export function getLayoutSkipLinkClasses(): string {
  return 'tiger-skip-link'
}

export function isLayoutSiderTypeName(name: unknown): boolean {
  return name === LAYOUT_SIDER_NAME
}

/**
 * Wrapped sidebars are not a direct `TigerSidebar`. Warn once when the caller
 * also omitted `hasSider`. Ordinary header/content children do not warn.
 */
export function warnIfLayoutSiderMissed(options: {
  hasSider?: boolean
  childNames: Array<string | null | undefined>
}): void {
  if (options.hasSider !== undefined) return
  if (options.childNames.some((name) => name === LAYOUT_SIDER_NAME)) return
  const wrapped = options.childNames.some(
    (name) => typeof name === 'string' && name !== LAYOUT_SIDER_NAME && /sider|sidebar/i.test(name)
  )
  if (!wrapped) return
  devWarn(
    'Layout.hasSider',
    'Layout could not see a direct TigerSidebar. Pass hasSider when the sidebar is wrapped.'
  )
}

export type LayoutSectionKind = 'header' | 'content' | 'footer'
export type SidebarLandmark = 'default' | 'own' | 'plain'

export function resolveLayoutSectionTag(options: {
  kind: LayoutSectionKind
  nested: boolean
  explicit?: string | null
}): string {
  if (typeof options.explicit === 'string' && options.explicit.trim())
    return options.explicit.trim()
  if (options.nested) return 'div'
  if (options.kind === 'header') return 'header'
  if (options.kind === 'footer') return 'footer'
  return 'main'
}

/** Second unnamed sidebar is not another complementary landmark. */
export function resolveSidebarLandmark(options: {
  hasOwnName: boolean
  namedSidebarClaimed: boolean
}): SidebarLandmark {
  if (options.hasOwnName) return 'own'
  if (options.namedSidebarClaimed) return 'plain'
  return 'default'
}

export function resolveLayoutHasSider(options: {
  hasSider?: boolean
  mode?: LayoutDirection
  childIsSider: boolean
}): boolean {
  if (options.hasSider !== undefined) return options.hasSider
  if (options.mode === 'horizontal') return true
  if (options.mode === 'vertical') return false
  return options.childIsSider
}

export function getLayoutRootClasses(
  options: {
    hasSider?: boolean
    nested?: boolean
    fullHeight?: boolean
  } = {}
): string {
  return classNames(
    'tiger-layout',
    options.hasSider ? 'tiger-flex-row' : undefined,
    options.nested && 'tiger-layout-nested',
    options.fullHeight && !options.nested && 'tiger-layout-full'
  )
}

/** Default column shell (no sider, not nested, not fullHeight). */
export const layoutRootClasses = getLayoutRootClasses()

export function resolveHeaderSticky(options: {
  sticky?: boolean
  fullHeightShell?: boolean
}): boolean {
  if (options.fullHeightShell) return false
  return options.sticky === true
}

export function getLayoutHeaderClasses(
  variant: HeaderVariant = 'default',
  options: { sticky?: boolean } = {}
): string {
  const variantClass =
    variant === 'translucent'
      ? 'tiger-header-translucent'
      : variant === 'blur'
        ? 'tiger-header-blur'
        : 'tiger-header-default'
  return classNames('tiger-header', variantClass, options.sticky && 'tiger-header-sticky')
}

export const layoutHeaderClasses = getLayoutHeaderClasses('default')

export function getLayoutSidebarClasses(
  options: {
    collapsed?: boolean
    side?: LayoutSiderSide
    widthProvided?: boolean
  } = {}
): string {
  const side = options.side ?? 'start'
  return classNames(
    'tiger-sidebar tiger-motion-aware',
    side === 'end' && 'tiger-sidebar-end',
    options.collapsed && 'tiger-sidebar-collapsed',
    !options.widthProvided && !options.collapsed && 'tiger-sidebar-default-width'
  )
}

export const layoutSidebarClasses = getLayoutSidebarClasses()

export const layoutSidebarCollapsedClasses = 'tiger-sidebar-collapsed'

export function isCssLengthZero(value: string | undefined): boolean {
  if (value == null) return false
  const n = Number.parseFloat(value.trim())
  return Number.isFinite(n) && n === 0
}

/**
 * Width/minWidth for a sidebar.
 * Uncollapsed default width lives on the `tiger-sidebar-default-width` class so
 * caller `style.width` can win. Collapsed always writes the collapsed width.
 */
export function getSidebarStyle(
  collapsed: boolean,
  width?: string,
  collapsedWidth: string = '64px'
): { width?: string; minWidth?: string } {
  if (collapsed) {
    const w = collapsedWidth
    return { width: w, minWidth: w }
  }
  if (width) return { width, minWidth: width }
  return {}
}

export function isSidebarFullyHidden(collapsed: boolean, collapsedWidth?: string): boolean {
  return collapsed && isCssLengthZero(collapsedWidth ?? '64px')
}

export function resolveSidebarAriaProps(options: {
  ariaLabel?: unknown
  ariaLabelledby?: unknown
  fallback: string
}): { 'aria-label'?: string; 'aria-labelledby'?: string } {
  const labelledby = typeof options.ariaLabelledby === 'string' ? options.ariaLabelledby.trim() : ''
  if (labelledby) return { 'aria-labelledby': labelledby }
  if (options.ariaLabel !== undefined) {
    const label = typeof options.ariaLabel === 'string' ? options.ariaLabel.trim() : ''
    if (!label) return {}
    return { 'aria-label': label }
  }
  return { 'aria-label': options.fallback }
}

/** Content fill uses the surface-muted token. */
export const layoutContentClasses = 'tiger-content bg-[var(--tiger-surface-muted)]'

export function getLayoutContentClasses(padding: boolean | string = true): string {
  return classNames(
    layoutContentClasses,
    padding === false ? undefined : typeof padding === 'string' ? padding : 'p-6'
  )
}

export const layoutFooterClasses = 'tiger-footer'
export const layoutFooterCompactClasses = 'tiger-footer-compact'

export function getLayoutFooterClasses(size: 'default' | 'compact' = 'default'): string {
  return classNames(layoutFooterClasses, size === 'compact' && layoutFooterCompactClasses)
}

export const LAYOUT_CONTENT_TAGS = ['main', 'div', 'section', 'article'] as const
export const LAYOUT_FOOTER_TAGS = ['footer', 'div'] as const
export const CONTAINER_TAGS = [
  'div',
  'section',
  'article',
  'main',
  'nav',
  'header',
  'footer'
] as const

export type LayoutContentTag = (typeof LAYOUT_CONTENT_TAGS)[number]
export type LayoutFooterTag = (typeof LAYOUT_FOOTER_TAGS)[number]
export type ContainerTag = (typeof CONTAINER_TAGS)[number]
