/**
 * Optional workflow detail layout recipe.
 *
 * Hosts compose SchemaForm + Timeline/Viewer tabs + sticky ActionBar.
 * Give the shell a bounded height (`h-full` on a flex-1 parent). Do not
 * hand-calc magic rem. This is not a second Timeline or a form designer.
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
