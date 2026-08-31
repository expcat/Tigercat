/**
 * PageHeader component types and interfaces
 */

/**
 * Default accessible name for the built-in back control
 */
export const PAGE_HEADER_DEFAULT_BACK_ARIA_LABEL = 'Back'

/**
 * Inputs used to decide whether the back control is rendered.
 *
 * `showBack: false` always hides the control, including a custom back slot.
 * When `showBack` is omitted, the control appears if a handler, href, or
 * custom back override is present.
 */
export interface PageHeaderBackVisibilityInput {
  /**
   * Explicit visibility switch
   */
  showBack?: boolean

  /**
   * True when a back handler (`onBack` / `@back`) is provided
   */
  hasHandler?: boolean

  /**
   * True when `backHref` is a non-empty string
   */
  hasBackHref?: boolean

  /**
   * True when a custom back slot / node is provided
   */
  hasBackOverride?: boolean
}

/**
 * Flags describing which heading-row regions have content
 */
export interface PageHeaderHeadingContentFlags {
  showBack?: boolean
  hasBreadcrumb?: boolean
  hasTitle?: boolean
  hasSubtitle?: boolean
  hasActions?: boolean
}

/**
 * Base PageHeader props interface (framework-agnostic)
 */
export interface PageHeaderProps {
  /**
   * Whether to show the back control.
   * When omitted, the control is shown if `onBack` / `@back`, `backHref`,
   * or a custom back slot is provided. Set `false` to force-hide.
   */
  showBack?: boolean

  /**
   * Navigation URL for the default back control. Renders a Link instead of
   * a Button when set and no custom back slot is provided.
   */
  backHref?: string

  /**
   * Accessible name for the default back control
   * @default 'Back'
   */
  backAriaLabel?: string

  /**
   * Page title. Rendered as a heading (`h1` by default).
   */
  title?: string

  /**
   * Heading level for `title`.
   * @default 1
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6

  /**
   * Secondary text shown beside the title
   */
  subTitle?: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Inline styles
   */
  style?: Record<string, unknown>
}
