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
   * Header height
   * @default '64px'
   */
  height?: string
}

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
