/**
 * Layout component types and interfaces
 */

export type LayoutDirection = 'vertical' | 'horizontal'

export type LayoutSiderSide = 'start' | 'end'

/**
 * Base layout props interface
 */
export interface LayoutProps {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Force a horizontal shell (Sidebar beside Content).
   * When omitted, a direct Sidebar child (or `hasSider`) turns the root into a row.
   */
  direction?: LayoutDirection

  /**
   * Treat this Layout as having a sider even if Sidebar is wrapped.
   */
  hasSider?: boolean

  /**
   * Viewport-height app shell: `h-dvh overflow-hidden` so Content becomes the scroller.
   * Nested Layouts never apply this — they fill the remaining parent height.
   * @default false
   */
  fullHeight?: boolean
}

/**
 * Header props interface
 */
export interface HeaderProps {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Header visual style.
   * @default 'default'
   */
  variant?: HeaderVariant

  /**
   * Header height. When omitted, default height is `h-16` via class so
   * caller `style.height` / class can override. Passed values write inline style.
   */
  height?: string
}

export type HeaderVariant = 'default' | 'translucent' | 'blur'

/**
 * Sidebar props interface
 */
export interface SidebarProps {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Logical side of the shell. `start` is inline-start (left in LTR).
   * @default 'start'
   */
  side?: LayoutSiderSide

  /**
   * Sidebar width. When omitted, default width is `w-64` via class so
   * caller `style.width` / class can override. Passed values write inline style.
   */
  width?: string

  /**
   * Width when collapsed (mini mode).
   * Set to '0px' to fully hide the sidebar when collapsed.
   * @default '64px'
   */
  collapsedWidth?: string

  /**
   * Whether sidebar is collapsed
   * @default false
   */
  collapsed?: boolean
}

/**
 * Content props interface
 */
export interface ContentProps {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * HTML tag. Default `main` — a document may only have one visible main.
   * Nested / preview shells should use `div`.
   * @default 'main'
   */
  as?: string

  /**
   * Built-in content padding. true keeps the default p-6, false removes it,
   * and a string is used as the padding class.
   * @default true
   */
  padding?: boolean | string
}

/**
 * Footer props interface
 */
export interface FooterProps {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * HTML tag. Default `footer`. Nested / preview shells should use `div`
   * so the page does not grow extra `contentinfo` landmarks.
   * @default 'footer'
   */
  as?: string

  /**
   * Footer height. When omitted, no inline height is written (`auto` is the
   * CSS initial value and would block caller `style.height` / class).
   */
  height?: string
}
