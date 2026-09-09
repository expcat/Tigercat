/**
 * Presentational approval / workflow timeline model.
 *
 * Maps onto existing {@link TimelineItem} via `workflowStepsToTimelineItems`.
 * This is not a fork of generic Timeline — extra fields stay on the step
 * model and are not added to `TimelineItem`.
 */

import type { TigerLocale, TigerLocaleWorkflowTimeline } from './locale'
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
 * Display kind for a workflow tree node. Omitted values normalize to `approve`.
 * Condition is a branch stub, not a BPMN gateway.
 */
export type WorkflowStepKind = 'start' | 'approve' | 'cc' | 'condition'

/**
 * How an approval node collects signatures. Display-only.
 * `sequential` = 依次, `countersign` = 会签, `orsign` = 或签.
 */
export type WorkflowSignMode = 'sequential' | 'countersign' | 'orsign'

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
  /**
   * Per-actor approval status for countersign / or-sign lists.
   * Omitted values are treated as pending by progress helpers.
   */
  status?: WorkflowTimelineStepStatus
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
   * Approver list for countersign / or-sign / sequential display.
   * When non-empty, this wins over singular {@link actor}.
   * People belong here — do not model approvers as `children`.
   */
  actors?: WorkflowTimelineActor[]
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
   * WorkflowViewer keeps this tree (parallel / CC / condition branches).
   */
  children?: WorkflowTimelineStep[]
  /**
   * Tree-node kind. Omitted / unknown values normalize to `approve`.
   */
  kind?: WorkflowStepKind
  /**
   * Countersign / or-sign / sequential. Display-only; omitted means sequential.
   */
  signMode?: WorkflowSignMode
  /**
   * Marks this step as the reject rollback point. Viewer also infers the last
   * rejected step when no explicit flag is set.
   */
  rollbackPoint?: boolean
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
  /**
   * When true, this item always uses the confirm-dialog recipe.
   * When false, it never does. Omitted: follow the action-bar `confirm` flag.
   */
  confirm?: boolean
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
   * Forwarded to the nested action bar confirm-dialog recipe.
   * @default false
   */
  confirm?: boolean
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
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>
  /**
   * Status-tag and aria-label overlay. Wins over `locale.workflowTimeline`.
   */
  labels?: Partial<TigerLocaleWorkflowTimeline>
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Optional comment collected from the action-bar confirm dialog.
 */
export interface WorkflowActionPayload {
  comment?: string
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
   * Enable the confirm-dialog recipe for approve / reject / cancel / transfer.
   * Per-item `confirm` overrides this. Copy comes from `locale.workflowTimeline`.
   * @default false
   */
  confirm?: boolean
  /**
   * Show a comment field in the confirm dialog. Omitted: reject shows it when
   * `confirm` is on; approve / transfer may opt in; `comment` never uses Popconfirm.
   */
  commentInput?: boolean
  /**
   * Switch placeholder / aria copy to the required locale string.
   * Does **not** block empty submit in the library.
   */
  commentRequired?: boolean
  /**
   * Fired after an action is confirmed (or immediately when confirm is off).
   * `payload` is omitted for callers that do not collect a comment.
   */
  onAction?: (item: WorkflowActionBarItem, payload?: WorkflowActionPayload) => void
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Read-only DingTalk-style workflow tree. Same {@link WorkflowTimelineStep}
 * model as WorkflowTimeline — not a second timeline.
 */
export interface WorkflowViewerProps {
  /**
   * Approval steps. Normalized in place; children stay nested for the tree.
   */
  steps?: WorkflowTimelineStep[]
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
  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>
  /**
   * Kind / sign-mode / path overlay. Wins over `locale.workflowTimeline`.
   */
  labels?: Partial<TigerLocaleWorkflowTimeline>
  /**
   * Additional CSS classes
   */
  className?: string
}
