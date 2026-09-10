/**
 * Layout classes for the optional WorkflowDetailShell recipe.
 *
 * Hosts should give the shell a bounded height (`h-full` / `h-[32rem]`).
 * The action region stays pinned; form + tabs scroll. Not a second Timeline.
 */

import { classNames } from './class-names'

export const workflowDetailShellRootClasses =
  'tiger-workflow-detail-shell relative flex min-h-0 flex-col overflow-hidden rounded-md border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-bg,#fff)]'
export const workflowDetailShellHeaderClasses =
  'tiger-workflow-detail-shell__header shrink-0 border-b border-[var(--tiger-border,#e5e7eb)] px-4 py-3'
export const workflowDetailShellBodyClasses =
  'tiger-workflow-detail-shell__body min-h-0 flex-1 overflow-auto px-4 py-4 space-y-4'
export const workflowDetailShellFormClasses = 'tiger-workflow-detail-shell__form'
export const workflowDetailShellTabsClasses = 'tiger-workflow-detail-shell__tabs'
export const workflowDetailShellActionClasses =
  'tiger-workflow-detail-shell__action sticky bottom-0 z-10 shrink-0 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-bg,#fff)] px-4 py-3'

export const WORKFLOW_DETAIL_SHELL_DEFAULT_ARIA_LABEL = 'Workflow detail'

export function getWorkflowDetailShellRootClasses(className?: string): string {
  return classNames(workflowDetailShellRootClasses, className)
}
