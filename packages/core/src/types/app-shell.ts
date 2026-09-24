/**
 * Application shell. Composes Layout, Sidebar, Header, Breadcrumb, Tabs,
 * and PageHeader. It does not read a route table.
 */

import type { HeaderVariant, LayoutSiderSide } from './layout'

export interface AppShellTab {
  key: string
  title: string
}

export interface AppShellBreadcrumbItem {
  key?: string
  title: string
  href?: string
}

export interface AppShellProps {
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  side?: LayoutSiderSide
  /** Independent of header variant. Passed to Header.sticky. */
  headerSticky?: boolean
  headerVariant?: HeaderVariant
  breadcrumb?: AppShellBreadcrumbItem[]
  /** Route titles supplied by the caller. The shell does not read a router. */
  tabs?: AppShellTab[]
  activeTab?: string
  defaultActiveTab?: string
  onTabChange?: (key: string) => void
  title?: string
  subTitle?: string
  fullHeight?: boolean
  className?: string
}

export function resolveAppShellActiveTab(
  tabs: readonly AppShellTab[] | undefined,
  active: string | undefined,
  fallback: string | undefined
): string | undefined {
  const keys = new Set((tabs ?? []).map((tab) => tab.key))
  if (active && keys.has(active)) return active
  if (fallback && keys.has(fallback)) return fallback
  return tabs?.[0]?.key
}
