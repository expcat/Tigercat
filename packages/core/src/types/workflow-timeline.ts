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
 * Closed set of approval actions a step, task, or action-bar item may represent.
 * `addsign` / `return` / `request_changes` are 2.5.0 runtime actions.
 */
export type WorkflowTimelineAction =
  | 'approve'
  | 'reject'
  | 'transfer'
  | 'cancel'
  | 'comment'
  | 'addsign'
  | 'return'
  | 'request_changes'

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
 * Per-field form permission relative to the initiate SchemaForm schema.
 */
export type FieldPermission = 'editable' | 'readonly' | 'hidden'

/**
 * Where an action button renders. `more` is the overflow menu.
 */
export type WorkflowButtonPlacement = 'bar' | 'more'

/**
 * Add-sign position. 2.5.0 supports before / after only (no concurrent add-sign).
 */
export type WorkflowAddsignPosition = 'before' | 'after'

/**
 * After a return, how the instance resumes once the target is done.
 * `resequence` = redo every node from the target; `direct` = skip ahead to the returner.
 */
export type WorkflowReturnResume = 'resequence' | 'direct'

/**
 * Node auto-decision. Display + Mock; core does not run a scheduler.
 */
export type WorkflowAutoDecide = 'manual' | 'auto_pass' | 'auto_reject'

/**
 * What to do when `resolveApprovers` returns nobody.
 */
export type WorkflowEmptyApprover = 'skip_pass' | 'pause' | 'transfer_admin' | 'transfer_user'

/**
 * Timeout policy action. Display only — core does not tick a clock.
 */
export type WorkflowTimeoutAction = 'remind' | 'auto_pass' | 'auto_reject' | 'transfer'

/**
 * Approver source contract. Hosts inject `resolveApprovers`; Tigercat stores
 * keys only and does not ship org / tenant / directory components.
 */
export type ApproverSource =
  | { type: 'fixed'; actors: Array<{ id: string; name?: string }> }
  | { type: 'self' }
  | { type: 'starter_pick'; multiple?: boolean; signMode?: WorkflowSignMode }
  | { type: 'role'; key: string }
  | { type: 'group'; key: string }
  | { type: 'dept_leader'; level?: number }
  | { type: 'manager_chain'; upTo?: number }

/**
 * Context passed to a host `resolveApprovers` implementation.
 */
export interface ApproverResolveContext {
  starter: WorkflowTimelineActor
  formValues: Record<string, unknown>
}

/**
 * Host-injected resolver. Core never calls a directory.
 */
export type ResolveApprovers = (
  source: ApproverSource | ApproverSource[],
  ctx: ApproverResolveContext
) => WorkflowTimelineActor[]

/**
 * One action-bar row in a node's button policy.
 */
export interface WorkflowButtonConfig {
  action: WorkflowTimelineAction
  enabled: boolean
  label?: string
  commentRequired?: boolean
  placement?: WorkflowButtonPlacement
}

/**
 * Per-node button table plus add-sign / return sub-options.
 */
export interface WorkflowNodeButtonPolicy {
  buttons: WorkflowButtonConfig[]
  addsign?: { positions: WorkflowAddsignPosition[] }
  returnResume?: WorkflowReturnResume
}

/**
 * Inspector "advanced" enums. Timeout is a label + action, not a job queue.
 */
export interface WorkflowNodeAdvanced {
  emptyApprover?: WorkflowEmptyApprover
  autoDecide?: WorkflowAutoDecide
  timeout?: {
    action?: WorkflowTimeoutAction
    durationLabel?: string
  }
  returnResume?: WorkflowReturnResume
}

/**
 * Per-actor runtime task. `blocked` is waiting on a before-addsign node.
 */
export type WorkflowTaskStatus =
  'pending' | 'active' | 'approved' | 'rejected' | 'canceled' | 'blocked'

export type WorkflowTaskOrigin = 'definition' | 'addsign' | 'transfer' | 'return'

/**
 * One person's work on one node. Instance-level `tasks[]` is the source of
 * truth when present; node `tasks[]` is an optional mirror.
 */
export interface WorkflowTask {
  id: string
  nodeKey: string
  assignee: WorkflowTimelineActor
  status: WorkflowTaskStatus
  action?: WorkflowTimelineAction
  comment?: string
  actedAt?: string
  origin?: WorkflowTaskOrigin
}

/**
 * Origin of a temporary add-sign node inserted into the instance tree.
 */
export interface WorkflowAddsignOrigin {
  type: 'addsign'
  position: WorkflowAddsignPosition
  fromNodeKey: string
  fromTaskId?: string
}

/**
 * After-addsign intent parked on a countersign node that is not yet complete.
 */
export interface WorkflowPendingAfterAddsign {
  assignees: WorkflowTimelineActor[]
  signMode?: WorkflowSignMode
  comment?: string
  fromTaskId?: string
  tempNodeKey?: string
}

/**
 * Instance-level status. Same closed set as a step, applied to the whole run.
 */
export type WorkflowInstanceStatus = WorkflowTimelineStepStatus

export interface WorkflowHistoryEntry {
  at: string
  actorId: string
  action: WorkflowTimelineAction | string
  comment?: string
  nodeKey?: string
  taskId?: string
}

/**
 * Runtime instance. `steps` is the live tree (may include temporary add-sign
 * nodes). Omit `tasks` to keep 2.4.2 node-level writeback.
 */
export interface WorkflowInstance {
  id?: string
  status?: WorkflowInstanceStatus
  steps: WorkflowTimelineStep[]
  tasks?: WorkflowTask[]
  cursor?: { nodeKey: string }
  history?: WorkflowHistoryEntry[]
  formValues?: Record<string, unknown>
  starter?: WorkflowTimelineActor
  /**
   * Set by a `direct` return. Completing the return target jumps here instead
   * of the next sequential node.
   */
  resumeToNodeKey?: string
}

/**
 * Input to {@link reduceWorkflowAction}. Pure — pass `at` for stable timestamps.
 */
export interface WorkflowRuntimeAction {
  action: WorkflowTimelineAction
  actorId?: string | number
  taskId?: string
  nodeKey?: string
  comment?: string
  at?: string
  assignee?: WorkflowTimelineActor
  assignees?: WorkflowTimelineActor[]
  position?: WorkflowAddsignPosition
  signMode?: WorkflowSignMode
  targetNodeKey?: string
  resume?: WorkflowReturnResume
  tempNodeKey?: string
}

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
  /**
   * Who should approve this node. Keys only; host resolves via `resolveApprovers`.
   */
  approverPolicy?: ApproverSource | ApproverSource[]
  /**
   * Per-node action buttons. Omitted: 2.4.2 default set (no add-sign / return).
   */
  buttonPolicy?: WorkflowNodeButtonPolicy
  /**
   * Field path → permission. Missing paths: start=`editable`, others=`readonly`.
   */
  fieldPermissions?: Record<string, FieldPermission>
  /**
   * Empty-approver / auto-decide / timeout display enums.
   */
  advanced?: WorkflowNodeAdvanced
  /**
   * Optional per-node task mirror. Instance-level `tasks[]` wins at runtime.
   */
  tasks?: WorkflowTask[]
  /**
   * Temporary add-sign node inserted into the instance tree only.
   */
  temporary?: boolean
  /**
   * Why a temporary node exists. Not written onto the published definition.
   */
  origin?: WorkflowAddsignOrigin
  /**
   * After-addsign parked until this countersign node completes.
   */
  pendingAfterAddsign?: WorkflowPendingAfterAddsign
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
 * Optional payload collected from the action-bar confirm dialog / picker slots.
 */
export interface WorkflowActionPayload {
  comment?: string
  assignee?: WorkflowTimelineActor
  assignees?: WorkflowTimelineActor[]
  position?: WorkflowAddsignPosition
  signMode?: WorkflowSignMode
  targetNodeKey?: string
  resume?: WorkflowReturnResume
  taskId?: string
  actorId?: string | number
}

/**
 * Presentational action-bar props. Vue/React bindings render these.
 * Display order is approve → reject → transfer → return → addsign → cancel →
 * comment, then remaining keys in original relative order. Not a BPM engine.
 */
export interface WorkflowActionBarProps {
  /**
   * Action buttons to render. Sorted approve → reject → transfer → return →
   * addsign → cancel → comment unless a custom `renderActions` replaces the bar.
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
   * Per-item `confirm` overrides this. Copy is `locale.workflowTimeline` title +
   * description; reject shows a comment field unless `commentInput` is false.
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
 * model as WorkflowTimeline — not a second timeline. Countersign people use
 * `actors`; `children` are parallel / CC / condition branches.
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
