/**
 * Layout classes for the optional WorkflowDetailShell recipe.
 *
 * Host gives the shell a bounded height (`h-full` / `flex-1 min-h-0` on a
 * flex column parent). Do not hand-calc magic rem (`h-[calc(100dvh-20rem)]`).
 * Root is a flex column; body scrolls; action stays pinned. Not a second Timeline.
 */

import type { FormValues } from '../types/form'
import type { SchemaFormSchema } from '../types/schema-form'
import type {
  FieldPermission,
  WorkflowFieldPermissionMode,
  WorkflowStepKind
} from '../types/workflow-timeline'
import { classNames } from './class-names'
import { mergeWorkflowFormValues } from './workflow-field-permissions'
import { reduceWorkflowAction } from './workflow-runtime'
import type { WorkflowInstance, WorkflowRuntimeAction } from '../types/workflow-timeline'

export const workflowDetailShellRootClasses =
  'tiger-workflow-detail-shell relative flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-[var(--tiger-border)] bg-[var(--tiger-surface)]'
export const workflowDetailShellHeaderClasses =
  'tiger-workflow-detail-shell__header shrink-0 border-b border-[var(--tiger-border)] px-4 py-3'
export const workflowDetailShellBodyClasses =
  'tiger-workflow-detail-shell__body min-h-0 flex-1 overflow-auto px-4 py-4 space-y-4'
export const workflowDetailShellFormClasses = 'tiger-workflow-detail-shell__form'
export const workflowDetailShellTabsClasses = 'tiger-workflow-detail-shell__tabs'
export const workflowDetailShellActionClasses =
  'tiger-workflow-detail-shell__action sticky bottom-0 z-10 mt-auto shrink-0 border-t border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-4 py-3'

export function getWorkflowDetailShellRootClasses(className?: string): string {
  return classNames(workflowDetailShellRootClasses, className)
}

/**
 * Detail submit. Only editable paths overlay `original`. Hidden and readonly
 * paths keep the server value. There is no second permission merge.
 */
export function submitWorkflowDetailForm(input: {
  original?: FormValues
  submitted?: FormValues
  schema?: SchemaFormSchema
  permissions?: Record<string, FieldPermission>
  mode?: WorkflowFieldPermissionMode | string
  kind?: WorkflowStepKind
}): FormValues {
  return mergeWorkflowFormValues(
    input.original,
    input.submitted,
    input.schema,
    input.permissions,
    input.mode ?? 'readonly',
    input.kind
  )
}

/**
 * One approval submit: merge the form, then apply the action-bar opinion
 * through the same reducer call. Hidden and readonly paths stay on `original`.
 */
export function submitWorkflowDetailAction(input: {
  original?: FormValues
  submitted?: FormValues
  schema?: SchemaFormSchema
  permissions?: Record<string, FieldPermission>
  mode?: WorkflowFieldPermissionMode | string
  kind?: WorkflowStepKind
  instance: WorkflowInstance
  action: WorkflowRuntimeAction
}): { values: FormValues; instance: WorkflowInstance } {
  const values = submitWorkflowDetailForm(input)
  return {
    values,
    instance: reduceWorkflowAction(input.instance, input.action)
  }
}
