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
 * Icon position relative to button text.
 * `start` / `end` follow writing direction; `left` / `right` are aliases.
 * @since 0.5.0
 */
export type ButtonIconPosition = 'start' | 'end' | 'left' | 'right'

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
   * DOM order follows this value (`start`/`left` = icon then label).
   * @default 'start'
   * @since 0.5.0
   */
  iconPosition?: ButtonIconPosition

  /**
   * HTML `type`. Same attribute as native `type`: `htmlType ?? type ?? 'button'`.
   * If both are set and differ, `htmlType` wins.
   * @default 'button'
   * @since 0.5.0
   */
  htmlType?: ButtonHtmlType

  /**
   * Whether to apply danger/destructive styling
   * Overrides variant colors with error/danger colors
   * @default false
   * @since 0.5.0
   */
  danger?: boolean
}

/**
 * Button group props interface
 * @since 0.5.0
 */
export interface ButtonGroupProps {
  /**
   * Size applied to all buttons in the group
   */
  size?: ButtonSize

  /**
   * Whether to render buttons vertically
   * @default false
   */
  vertical?: boolean
}
