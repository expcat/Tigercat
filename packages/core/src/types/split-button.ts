/**
 * SplitButton component types and interfaces
 */

import type { ButtonHtmlType, ButtonIconPosition, ButtonSize, ButtonVariant } from './button'

/**
 * Default accessible name for the chevron menu trigger
 */
export const DEFAULT_SPLIT_BUTTON_TRIGGER_ARIA_LABEL = 'More options'

/**
 * Default visual variant
 */
export const DEFAULT_SPLIT_BUTTON_VARIANT: ButtonVariant = 'primary'

/**
 * Default size
 */
export const DEFAULT_SPLIT_BUTTON_SIZE: ButtonSize = 'md'

/**
 * Base SplitButton props interface (framework-agnostic)
 */
export interface SplitButtonProps {
  /**
   * Visual variant applied to the primary action and the menu trigger
   * @default 'primary'
   */
  variant?: ButtonVariant

  /**
   * Size applied to the primary action and the menu trigger
   * @default 'md'
   */
  size?: ButtonSize

  /**
   * Whether both the primary action and the menu trigger are disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the primary action is in a loading state. Also disables the menu trigger.
   * @default false
   */
  loading?: boolean

  /**
   * Whether to apply danger/destructive styling to both buttons
   * @default false
   */
  danger?: boolean

  /**
   * Whether the split control should take the full width of its parent
   * @default false
   */
  block?: boolean

  /**
   * HTML button type for the primary action
   * @default 'button'
   */
  htmlType?: ButtonHtmlType

  /**
   * Position of the icon relative to the primary action text
   * @default 'left'
   */
  iconPosition?: ButtonIconPosition

  /**
   * Whether the menu is open (controlled mode)
   */
  open?: boolean

  /**
   * Default open state (uncontrolled mode)
   * @default false
   */
  defaultOpen?: boolean

  /**
   * Whether to close the menu when a menu item is clicked
   * @default true
   */
  closeOnClick?: boolean

  /**
   * Render the menu into document.body (portal/Teleport)
   * @default true
   */
  portal?: boolean

  /**
   * Accessible name for the chevron menu trigger
   * @default 'More options'
   */
  triggerAriaLabel?: string

  /**
   * Additional CSS classes on the root group
   */
  className?: string

  /**
   * Inline styles on the root group
   */
  style?: Record<string, unknown>
}
