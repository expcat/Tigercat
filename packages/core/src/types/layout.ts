/**
 * Layout component types and interfaces
 */

/**
 * Base layout props interface
 */
export interface LayoutProps {
  /**
   * Additional CSS classes
   */
  className?: string
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
   * Header height
   * @default '64px'
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
   * Sidebar width
   * @default '256px'
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
   * Footer height
   * @default 'auto'
   */
  height?: string
}
