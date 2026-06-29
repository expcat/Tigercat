/**
 * FloatButton component types and interfaces
 */

import type { ViewportOffset, ViewportPlacement } from './viewport'

/**
 * FloatButton shape
 */
export type FloatButtonShape = 'circle' | 'square'

/**
 * FloatButton size
 */
export type FloatButtonSize = 'sm' | 'md' | 'lg'

/**
 * Base FloatButton props (framework-agnostic)
 */
export interface FloatButtonProps {
  /**
   * Shape of the button
   * @default 'circle'
   */
  shape?: FloatButtonShape

  /**
   * Button size
   * @default 'md'
   */
  size?: FloatButtonSize

  /**
   * Tooltip text shown on hover
   */
  tooltip?: string

  /**
   * Button type / variant
   * @default 'primary'
   */
  type?: 'primary' | 'default'

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Accessible label
   */
  ariaLabel?: string

  /**
   * Additional CSS class name
   */
  className?: string

  /**
   * Whether the standalone button should be fixed to the viewport.
   * @default false
   */
  floating?: boolean

  /**
   * Fixed viewport corner used when floating is true.
   * @default 'bottom-right'
   */
  placement?: ViewportPlacement

  /**
   * Fixed viewport offset used when floating is true.
   * @default 24
   */
  offset?: ViewportOffset
}

/**
 * FloatButton.Group props (framework-agnostic)
 */
export interface FloatButtonGroupProps {
  /**
   * Shape applied to all child buttons
   * @default 'circle'
   */
  shape?: FloatButtonShape

  /**
   * Whether the group expands on trigger
   * @default 'click'
   */
  trigger?: 'click' | 'hover'

  /**
   * Whether the group is open (controlled)
   */
  open?: boolean

  /**
   * Additional CSS class name
   */
  className?: string
}
