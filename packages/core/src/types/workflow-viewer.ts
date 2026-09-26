/**
 * WorkflowViewer props. The tree uses the same step model as WorkflowTimeline.
 */

import type { TigerLocale, TigerLocaleWorkflowTimeline } from './locale'
import type { WorkflowTask, WorkflowTimelineStep } from './workflow-timeline'

/**
 * Read-only workflow tree. Same {@link WorkflowTimelineStep} model as
 * WorkflowTimeline. Sequential siblings share a column. A node with two or
 * more children fans those children into columns. `loopTo` draws a back-edge.
 * Not a second timeline and not BPMN.
 */
export interface WorkflowViewerProps {
  /** Approval steps. Children stay nested for the tree. */
  steps?: WorkflowTimelineStep[]
  /**
   * Instance-level per-actor tasks. When present, each person is a row.
   * Wins over `step.tasks` / `actors`.
   */
  tasks?: WorkflowTask[]
  /**
   * Highlight the taken path from start to the current or rollback step.
   * @default true
   */
  highlightPath?: boolean
  /**
   * Show the reject rollback-point label when a rejected step exists.
   * @default true
   */
  showRollbackPoint?: boolean
  /** Locale override merged on top of ConfigProvider locale. */
  locale?: Partial<TigerLocale>
  /** Kind / sign-mode / path overlay. Wins over `locale.workflowTimeline`. */
  labels?: Partial<TigerLocaleWorkflowTimeline>
  /** Additional CSS classes */
  className?: string
}
