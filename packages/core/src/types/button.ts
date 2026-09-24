/**
 * Button component types and interfaces
 */

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'

/**
 * Button size types
 * @since 0.5.0 - Added 'xs' and 'xl'
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Icon position relative to button text. Follows writing direction.
 * @since 0.5.0
 */
export type ButtonIconPosition = 'start' | 'end'

/**
 * HTML button type attribute
 * @since 0.5.0
 */
export type ButtonHtmlType = 'button' | 'submit' | 'reset'

/**
 * Base button props interface
 */
export interface ButtonProps {
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: ButtonVariant

  /**
   * Button size. When omitted, uses the enclosing ButtonGroup size, then `md`.
   * Passing `undefined` is the same as omitting the prop.
   */
  size?: ButtonSize

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the button is in loading state
   * @default false
   */
  loading?: boolean

  /**
   * Whether the button should take full width of its parent
   * @default false
   */
  block?: boolean

  /**
   * Position of the icon relative to button text.
   * DOM order follows this value (`start` = icon then label).
   * @default 'start'
   * @since 0.5.0
   */
  iconPosition?: ButtonIconPosition

  /**
   * HTML `type` attribute.
   * @default 'button'
   */
  type?: ButtonHtmlType

  /**
   * Whether to apply danger/destructive styling
   * Overrides variant colors with error/danger colors
   * @default false
   * @since 0.5.0
   */
  danger?: boolean
}

/**
 * Button group props interface.
 * Direct children must be Button (no Tooltip/span wrapper between the group
 * and the button root). SplitButton is not joined here.
 * An accessible name (`aria-label` / `aria-labelledby`) is required.
 * @since 0.5.0
 */
export interface ButtonGroupProps {
  /**
   * Size applied to all buttons in the group. A child Button `size` still wins.
   */
  size?: ButtonSize

  /**
   * Whether to render buttons vertically
   * @default false
   */
  vertical?: boolean
}
