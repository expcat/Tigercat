/**
 * Base shared prop interfaces
 *
 * These provide common prop shapes for interactive, form-control,
 * and layout components. Component-specific Props should extend or
 * pick from these as needed.
 *
 * @example
 * ```ts
 * import type { BaseInteractiveProps } from '@expcat/tigercat-core'
 *
 * export interface MyButtonProps extends BaseInteractiveProps {
 *   variant?: 'primary' | 'secondary'
 * }
 * ```
 */

/**
 * Standard component size values.
 * Individual components may extend this union (e.g. add 'xs' | 'xl').
 */
export type ComponentSize = 'sm' | 'md' | 'lg'

/**
 * Base props shared by interactive (clickable / focusable) components.
 *
 * Covers: Button, Link, Tag, Card, Badge, etc.
 */
export interface BaseInteractiveProps {
  /** Whether the component is disabled */
  disabled?: boolean
  /** Component size */
  size?: ComponentSize
  /** Whether the component shows a loading indicator */
  loading?: boolean
}

/**
 * Base props shared by form-control components.
 *
 * Covers: Input, Select, Checkbox, Radio, Switch, DatePicker, etc.
 *
 * Uses generics so each component can specify its own value type.
 */
export interface BaseFormControlProps<T = unknown> {
  /** Controlled value */
  value?: T
  /** Default (uncontrolled) value */
  defaultValue?: T
  /** Form field name attribute */
  name?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Component size */
  size?: ComponentSize
  /** Placeholder text */
  placeholder?: string
}

/**
 * Base props shared by layout / spacing components.
 *
 * Covers: Space, Row/Col, Container, etc.
 */
export interface BaseLayoutProps {
  /** Layout direction */
  direction?: 'horizontal' | 'vertical'
  /** Cross-axis alignment */
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  /** Main-axis justification */
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
  /** Whether children should wrap */
  wrap?: boolean
}
