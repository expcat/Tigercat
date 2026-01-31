/**
 * Collapse component types and interfaces
 */

/**
 * Position of the expand icon
 */
export type ExpandIconPosition = 'start' | 'end'

/**
 * Base Collapse props interface
 */
export interface CollapseProps {
  /**
   * Currently active panel keys (controlled mode)
   */
  activeKey?: string | number | (string | number)[]
  /**
   * Default active panel keys (uncontrolled mode)
   */
  defaultActiveKey?: string | number | (string | number)[]
  /**
   * Accordion mode - only one panel can be expanded at a time
   * @default false
   */
  accordion?: boolean
  /**
   * Whether to show border
   * @default true
   */
  bordered?: boolean
  /**
   * Position of the expand icon
   * @default 'start'
   */
  expandIconPosition?: ExpandIconPosition
  /**
   * Ghost mode - transparent without border
   * @default false
   */
  ghost?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}

/**
 * CollapsePanel props interface
 */
export interface CollapsePanelProps {
  /**
   * Unique key for the panel (required)
   */
  panelKey: string | number
  /**
   * Panel header/title
   */
  header?: string
  /**
   * Whether the panel is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether to show arrow icon
   * @default true
   */
  showArrow?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}
