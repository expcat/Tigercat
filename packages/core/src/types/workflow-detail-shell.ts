/**
 * Optional workflow detail layout recipe.
 *
 * Hosts compose SchemaForm + Timeline/Viewer tabs + sticky ActionBar.
 * This is not a second Timeline, not a form designer, and not an Admin page
 * (Admin wires a real detail shell in a later slice).
 */

/**
 * Shared WorkflowDetailShell chrome. Content is Vue slots / React node props:
 * `header`, `form`, `tabs`, `action`.
 */
export interface WorkflowDetailShellProps {
  /**
   * When false, the sticky action region is omitted even if a slot is filled.
   * @default true
   */
  showActions?: boolean
  /**
   * Accessible name for the detail region.
   * @default 'Workflow detail'
   */
  ariaLabel?: string
  /**
   * Additional CSS classes on the root.
   */
  className?: string
  /**
   * Custom styles on the root.
   */
  style?: Record<string, unknown>
}
