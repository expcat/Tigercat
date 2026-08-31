import { overlayZIndexClass } from './floating'
import { classNames } from './class-names'
import { injectLayoutGridStyles } from './layout-grid-styles'
import type { HeaderVariant, LayoutDirection, LayoutSiderSide } from '../types/layout'

export const LAYOUT_SIDER_NAME = 'TigerSidebar'

export function isLayoutSiderTypeName(name: unknown): boolean {
  return name === LAYOUT_SIDER_NAME || name === 'Sidebar'
}

export function resolveLayoutHasSider(options: {
  hasSider?: boolean
  direction?: LayoutDirection
  childIsSider: boolean
}): boolean {
  if (options.hasSider !== undefined) return options.hasSider
  if (options.direction === 'horizontal') return true
  if (options.direction === 'vertical') return false
  return options.childIsSider
}

export function getLayoutRootClasses(
  options: {
    hasSider?: boolean
    nested?: boolean
    fullHeight?: boolean
  } = {}
): string {
  injectLayoutGridStyles()
  return classNames(
    'tiger-layout',
    options.hasSider ? 'tiger-flex-row' : undefined,
    options.nested && 'tiger-layout-nested',
    options.fullHeight && !options.nested && 'tiger-layout-full'
  )
}

/** Default column shell (no sider, not nested, not fullHeight). */
export const layoutRootClasses = getLayoutRootClasses()

export function getLayoutHeaderClasses(variant: HeaderVariant = 'default'): string {
  injectLayoutGridStyles()
  const variantClass =
    variant === 'translucent'
      ? classNames('tiger-header-translucent', overlayZIndexClass.viewport)
      : variant === 'blur'
        ? classNames('tiger-header-blur', overlayZIndexClass.viewport)
        : 'tiger-header-default'
  return classNames('tiger-header', variantClass)
}

export const layoutHeaderClasses = getLayoutHeaderClasses('default')

export function getLayoutSidebarClasses(
  options: {
    collapsed?: boolean
    side?: LayoutSiderSide
    widthProvided?: boolean
  } = {}
): string {
  injectLayoutGridStyles()
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

/** Content fill: optional `--tiger-layout-content-bg`, then registered `--tiger-surface-muted`. */
export const layoutContentClasses =
  'tiger-content bg-[var(--tiger-layout-content-bg,var(--tiger-surface-muted,#f9fafb))]'

export function getLayoutContentClasses(padding: boolean | string = true): string {
  injectLayoutGridStyles()
  return classNames(
    layoutContentClasses,
    padding === false ? undefined : typeof padding === 'string' ? padding : 'p-6'
  )
}

export const layoutFooterClasses = 'tiger-footer'

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
