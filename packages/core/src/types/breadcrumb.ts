/**
 * Breadcrumb component types and interfaces
 */

/**
 * Breadcrumb separator type
 */
export type BreadcrumbSeparator = string | 'slash' | 'arrow' | 'chevron';

/**
 * Base breadcrumb props interface
 */
export interface BreadcrumbProps {
  /**
   * Custom separator between breadcrumb items
   * @default '/'
   */
  separator?: BreadcrumbSeparator;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: Record<string, unknown>;
}

/**
 * Base breadcrumb item props interface
 */
export interface BreadcrumbItemProps {
  /**
   * Navigation link URL
   */
  href?: string;

  /**
   * Link target attribute
   */
  target?: '_blank' | '_self' | '_parent' | '_top';

  /**
   * Whether this is the current/last item
   * @default false
   */
  current?: boolean;

  /**
   * Custom separator for this item (overrides global separator)
   */
  separator?: BreadcrumbSeparator;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Inline styles
   */
  style?: Record<string, unknown>;
}
