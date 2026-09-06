/**
 * Presentational approval / workflow timeline model.
 *
 * Maps onto existing {@link TimelineItem} via `workflowStepsToTimelineItems`.
 * This is not a fork of generic Timeline — extra fields stay on the step
 * model and are not added to `TimelineItem`.
 */

import type { TimelineMode } from './timeline'

/**
 * Closed set of approval-step statuses.
 */
export type WorkflowTimelineStepStatus = 'pending' | 'active' | 'approved' | 'rejected' | 'canceled'

/**
 * Closed set of approval actions a step or action-bar item may represent.
 */
export type WorkflowTimelineAction = 'approve' | 'reject' | 'transfer' | 'cancel' | 'comment'

/**
 * Actor on a workflow step. Avatar is an image URL; icon is a registered
 * name string (not a framework node).
 */
export interface WorkflowTimelineActor {
  /**
   * Stable actor id.
   */
  id?: string | number
  /**
   * Display name.
   */
  name?: string
  /**
   * Avatar image URL.
   */
  avatar?: string
  /**
   * Registered icon name. Kept as a string for the Icon registry.
   */
  icon?: string
}

/**
 * One approval / workflow step. Optional `children` cover parallel / CC stubs.
 */
export interface WorkflowTimelineStep {
  /**
   * Stable step id. Copied onto `TimelineItem.key`.
   */
  key: string
  /**
   * Step title (e.g. "Manager approval"). Used as Timeline content when mapping.
   */
  title?: string
  /**
   * Alternate caption. Used as title when `title` is omitted.
   */
  label?: string
  /**
   * Approval status. Omitted / unknown values normalize to `pending`.
   */
  status?: WorkflowTimelineStepStatus
  /**
   * Person or role associated with the step.
   */
  actor?: WorkflowTimelineActor
  /**
   * Action taken on this step, when known.
   */
  action?: WorkflowTimelineAction
  /**
   * Free-text opinion / comment.
   */
  comment?: string
  /**
   * ISO timestamp or already-formatted display string.
   */
  time?: string
  /**
   * Explicit display rank. When any sibling has `order`, missing values sort last.
   */
  order?: number
  /**
   * Nested parallel / CC stubs. Kept minimal; flatten when mapping to Timeline.
   */
  children?: WorkflowTimelineStep[]
}

/**
 * An approval timeline (array of {@link WorkflowTimelineStep}).
 */
export type WorkflowTimeline = WorkflowTimelineStep[]

/**
 * Action-bar button variant. `danger` is for reject / cancel.
 */
export type WorkflowActionBarVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

/**
 * Presentational action-bar item for a later UI slice. Types only.
 */
export interface WorkflowActionBarItem {
  /**
   * Stable action id.
   */
  key: string
  /**
   * Button label.
   */
  label: string
  /**
   * Approval action this item triggers.
   */
  action: WorkflowTimelineAction
  /**
   * Visual variant. Reject / cancel typically use `danger`.
   */
  variant?: WorkflowActionBarVariant
  /**
   * When true, the action is not available.
   */
  disabled?: boolean
  /**
   * Required permission code, or codes that must all pass.
   * Omitted / empty means unrestricted.
   */
  permission?: string | string[]
}

/**
 * Presentational workflow timeline props. Vue/React bindings render these.
 */
export interface WorkflowTimelineProps {
  /**
   * Approval steps. Normalized and mapped onto Timeline items.
   */
  steps?: WorkflowTimelineStep[]
  /**
   * Action-bar items. Shown when a step is `active` unless `showActions` overrides.
   */
  actions?: WorkflowActionBarItem[]
  /**
   * Force the action bar on or off. Omitted: show when `actions` is non-empty
   * and `getCurrentWorkflowStep` finds an `active` step.
   */
  showActions?: boolean
  /**
   * Timeline layout mode. Passed through to Timeline.
   * @default 'left'
   */
  mode?: TimelineMode
  /**
   * Append Timeline's pending item after the mapped steps.
   * @default false
   */
  pending?: boolean
  /**
   * Pending item dot content. Passed through to Timeline.
   */
  pendingDot?: unknown
  /**
   * Reverse Timeline order. Pending still stays at the DOM end.
   * @default false
   */
  reverse?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Presentational action-bar props. Vue/React bindings render these.
 */
export interface WorkflowActionBarProps {
  /**
   * Action buttons to render.
   */
  items?: WorkflowActionBarItem[]
  /**
   * Disable every action, in addition to per-item `disabled`.
   */
  disabled?: boolean
  /**
   * Accessible name for the toolbar. Defaults to "Workflow actions".
   */
  ariaLabel?: string
  /**
   * Additional CSS classes
   */
  className?: string
}
