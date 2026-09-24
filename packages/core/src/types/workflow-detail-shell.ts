/**
 * Optional workflow detail layout recipe.
 *
 * Hosts compose SchemaForm + Timeline/Viewer tabs + sticky ActionBar.
 * Give the shell a bounded height (`h-full` on a flex-1 parent). Do not
 * hand-calc magic rem. This is not a second Timeline or a form designer.
 * `submit` merges the client values through `mergeWorkflowFormValues`.
 */

import type { FormValues } from './form'
import type { TigerLocale } from './locale'
import type { SchemaFormSchema } from './schema-form'
import type {
  FieldPermission,
  WorkflowFieldPermissionMode,
  WorkflowStepKind
} from './workflow-timeline'

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
   * Accessible name for the detail region. Omitted: locale `workflowDetailShell.ariaLabel`.
   */
  ariaLabel?: string
  /** Server values. Hidden and readonly paths keep these on submit. */
  originalValues?: FormValues
  /** Current client values. `submit()` uses these when called with no argument. */
  values?: FormValues
  /** Starter schema. Hidden fields stay hidden through the merge. */
  schema?: SchemaFormSchema
  /** Node field map. Missing paths use the single stricter default. */
  fieldPermissions?: Record<string, FieldPermission>
  /**
   * View mode passed to the permission merge.
   * @default 'readonly'
   */
  permissionMode?: WorkflowFieldPermissionMode | string
  /** Current node kind. Combined with `permissionMode` by the single default. */
  nodeKind?: WorkflowStepKind
  /** Merged values after `submit`. */
  onSubmit?: (values: FormValues) => void
  /** Locale override merged on top of ConfigProvider. */
  locale?: Partial<TigerLocale>
  /**
   * Additional CSS classes on the root.
   */
  className?: string
  /**
   * Custom styles on the root.
   */
  style?: Record<string, unknown>
}
