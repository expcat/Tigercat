/**
 * Framework-agnostic helpers for approval / workflow timelines.
 * Normalize, select, and convert {@link WorkflowTimelineStep} lists onto
 * existing {@link TimelineItem}.
 */

import type { ButtonVariant } from '../types/button'
import type { TigerLocaleWorkflowTimeline } from '../types/locale'
import type { TagVariant } from '../types/tag'
import type { TimelineItem } from '../types/timeline'
import { classNames } from './class-names'
import type {
  ApproverSource,
  WorkflowActionBarItem,
  WorkflowActionBarViewerRole,
  WorkflowActionPayload,
  WorkflowAddsignPosition,
  WorkflowButtonConfig,
  WorkflowButtonPlacement,
  WorkflowNodeAdvanced,
  WorkflowNodeButtonPolicy,
  WorkflowPendingAfterAddsign,
  WorkflowSignMode,
  WorkflowStepKind,
  WorkflowTask,
  WorkflowTaskOrigin,
  WorkflowTaskStatus,
  WorkflowTimelineAction,
  WorkflowTimelineActor,
  WorkflowTimelineStep,
  WorkflowTimelineStepStatus
} from '../types/workflow-timeline'

export const EMPTY_WORKFLOW_TIMELINE_STEPS: WorkflowTimelineStep[] = []

export const EMPTY_WORKFLOW_ACTION_BAR_ITEMS: WorkflowActionBarItem[] = []

/**
 * Default English labels for status tags. Bindings may override via locale later.
 */
export const WORKFLOW_STEP_STATUS_LABELS: Record<WorkflowTimelineStepStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  approved: 'Approved',
  rejected: 'Rejected',
  canceled: 'Canceled'
}

/**
 * Tag variants that match approval status cues.
 */
export const WORKFLOW_STEP_STATUS_TAG_VARIANTS: Record<WorkflowTimelineStepStatus, TagVariant> = {
  pending: 'default',
  active: 'primary',
  approved: 'success',
  rejected: 'danger',
  canceled: 'default'
}

export const WORKFLOW_STEP_STATUSES: readonly WorkflowTimelineStepStatus[] = [
  'pending',
  'active',
  'approved',
  'rejected',
  'canceled'
]

export const WORKFLOW_TERMINAL_STEP_STATUSES: readonly WorkflowTimelineStepStatus[] = [
  'approved',
  'rejected',
  'canceled'
]

const STATUS_SET = new Set<string>(WORKFLOW_STEP_STATUSES)
const TERMINAL_STATUS_SET = new Set<string>(WORKFLOW_TERMINAL_STEP_STATUSES)

/**
 * CSS color hints for Timeline dots. Data only — no framework nodes.
 */
export const WORKFLOW_STEP_STATUS_COLORS: Record<WorkflowTimelineStepStatus, string> = {
  pending: 'var(--tiger-border,#d1d5db)',
  active: 'var(--tiger-primary,#2563eb)',
  approved: 'var(--tiger-success,#16a34a)',
  rejected: 'var(--tiger-error,#dc2626)',
  canceled: 'var(--tiger-text-muted,#6b7280)'
}

export type WorkflowStepHighlight = 'active' | 'pending' | null

export type WorkflowStepStatusCounts = Record<WorkflowTimelineStepStatus, number>

/**
 * A TimelineItem that carries the source step and resolved status,
 * so Vue/React renderers do not need unsafe casts.
 */
export interface WorkflowTimelineItem extends TimelineItem {
  status: WorkflowTimelineStepStatus
  step: WorkflowTimelineStep
  onPath: boolean
  returnTarget: boolean
  temporary: boolean
  conditionBranch: boolean
}

export function isWorkflowTimelineStepStatus(value: unknown): value is WorkflowTimelineStepStatus {
  return typeof value === 'string' && STATUS_SET.has(value)
}

export function resolveWorkflowStepStatus(
  step: Pick<WorkflowTimelineStep, 'status'> | undefined
): WorkflowTimelineStepStatus {
  return isWorkflowTimelineStepStatus(step?.status) ? step.status : 'pending'
}

export function workflowStepStatusColor(status: WorkflowTimelineStepStatus): string {
  return WORKFLOW_STEP_STATUS_COLORS[status]
}

export function isWorkflowStepActive(step: WorkflowTimelineStep): boolean {
  return resolveWorkflowStepStatus(step) === 'active'
}

export function isWorkflowStepPending(step: WorkflowTimelineStep): boolean {
  return resolveWorkflowStepStatus(step) === 'pending'
}

export function isWorkflowStepTerminal(step: WorkflowTimelineStep): boolean {
  return TERMINAL_STATUS_SET.has(resolveWorkflowStepStatus(step))
}

/**
 * Highlight hint for pending / active steps. Terminal steps return `null`.
 */
export function workflowStepHighlight(step: WorkflowTimelineStep): WorkflowStepHighlight {
  const status = resolveWorkflowStepStatus(step)
  if (status === 'active') return 'active'
  if (status === 'pending') return 'pending'
  return null
}

function emptyStatusCounts(): WorkflowStepStatusCounts {
  return {
    pending: 0,
    active: 0,
    approved: 0,
    rejected: 0,
    canceled: 0
  }
}

function visitSteps(
  steps: readonly WorkflowTimelineStep[],
  visit: (step: WorkflowTimelineStep) => void
): void {
  for (const step of steps) {
    visit(step)
    if (step.children && step.children.length > 0) {
      visitSteps(step.children, visit)
    }
  }
}

function flattenSteps(steps: readonly WorkflowTimelineStep[]): WorkflowTimelineStep[] {
  const result: WorkflowTimelineStep[] = []
  visitSteps(steps, (step) => {
    result.push(step)
  })
  return result
}

/**
 * Stable display order: explicit `order` when any sibling has it (missing
 * values sort last), otherwise input order. Original index is the tiebreaker.
 */
export function sortWorkflowTimelineSteps(
  steps: readonly WorkflowTimelineStep[]
): WorkflowTimelineStep[] {
  if (steps.length <= 1) return [...steps]

  const hasOrder = steps.some((step) => step.order != null)
  if (!hasOrder) return [...steps]

  return steps
    .map((step, index) => ({ step, index }))
    .sort((a, b) => {
      const aOrder = a.step.order ?? Number.POSITIVE_INFINITY
      const bOrder = b.step.order ?? Number.POSITIVE_INFINITY
      if (aOrder !== bOrder) return aOrder - bOrder
      return a.index - b.index
    })
    .map(({ step }) => step)
}

function copyActor(actor: WorkflowTimelineStep['actor']): WorkflowTimelineStep['actor'] {
  return actor == null ? actor : { ...actor }
}

function copyActors(
  actors: WorkflowTimelineActor[] | undefined
): WorkflowTimelineActor[] | undefined {
  if (!actors) return undefined
  return actors.map((actor) => ({ ...actor }))
}

function copyApproverSource(source: ApproverSource): ApproverSource {
  if (source.type === 'fixed') {
    return { type: 'fixed', actors: source.actors.map((actor) => ({ ...actor })) }
  }
  return { ...source }
}

function copyButtonPolicy(
  policy: WorkflowNodeButtonPolicy | undefined
): WorkflowNodeButtonPolicy | undefined {
  if (!policy) return undefined
  return {
    ...policy,
    buttons: policy.buttons.map((button) => ({ ...button })),
    addsign: policy.addsign ? { positions: [...policy.addsign.positions] } : policy.addsign
  }
}

function copyAdvanced(
  advanced: WorkflowNodeAdvanced | undefined
): WorkflowNodeAdvanced | undefined {
  if (!advanced) return undefined
  return {
    ...advanced,
    timeout: advanced.timeout ? { ...advanced.timeout } : advanced.timeout
  }
}

function copyTasks(tasks: WorkflowTask[] | undefined): WorkflowTask[] | undefined {
  if (!tasks) return undefined
  return tasks.map((task) => ({ ...task, assignee: { ...task.assignee } }))
}

function copyPendingAfter(
  pending: WorkflowPendingAfterAddsign | undefined
): WorkflowPendingAfterAddsign | undefined {
  if (!pending) return undefined
  return {
    ...pending,
    assignees: pending.assignees.map((actor) => ({ ...actor }))
  }
}

function copyStep(step: WorkflowTimelineStep): WorkflowTimelineStep {
  const next: WorkflowTimelineStep = {
    ...step,
    status: resolveWorkflowStepStatus(step),
    kind: resolveWorkflowStepKind(step),
    signMode: resolveWorkflowSignMode(step)
  }
  if (step.title == null && step.label != null) next.title = step.label
  if (step.actor) next.actor = copyActor(step.actor)
  if (step.actors) next.actors = copyActors(step.actors)
  if (step.children) {
    next.children = normalizeWorkflowTimelineSteps(step.children)
  }
  if (step.tasks) next.tasks = copyTasks(step.tasks)
  if (step.fieldPermissions) next.fieldPermissions = { ...step.fieldPermissions }
  if (step.buttonPolicy) next.buttonPolicy = copyButtonPolicy(step.buttonPolicy)
  if (step.approverPolicy) {
    next.approverPolicy = Array.isArray(step.approverPolicy)
      ? step.approverPolicy.map(copyApproverSource)
      : copyApproverSource(step.approverPolicy)
  }
  if (step.advanced) next.advanced = copyAdvanced(step.advanced)
  if (step.origin) next.origin = { ...step.origin }
  if (step.pendingAfterAddsign)
    next.pendingAfterAddsign = copyPendingAfter(step.pendingAfterAddsign)
  return next
}

/**
 * Approver list for display. Non-empty `actors` wins; otherwise wrap singular
 * `actor`. Empty `actors` falls through so older single-actor data still works.
 */
export function resolveWorkflowStepActors(
  step: Pick<WorkflowTimelineStep, 'actor' | 'actors'> | undefined
): WorkflowTimelineActor[] {
  if (step?.actors && step.actors.length > 0) return step.actors
  if (step?.actor) return [step.actor]
  return []
}

export interface WorkflowActorProgress {
  approved: number
  total: number
}

function isApprovedActorStatus(status: WorkflowTimelineActor['status']): boolean {
  return status === 'approved'
}

function taskProgressForNode(
  step: Pick<WorkflowTimelineStep, 'key'> | undefined,
  tasks: readonly WorkflowTask[]
): WorkflowActorProgress | undefined {
  const nodeTasks =
    step?.key != null ? tasks.filter((task) => task.nodeKey === step.key) : [...tasks]
  if (nodeTasks.length === 0) return undefined
  const countable = nodeTasks.filter((task) => task.status !== 'canceled')
  const pool = countable.length > 0 ? countable : nodeTasks
  let approved = 0
  for (const task of pool) {
    if (task.status === 'approved') approved += 1
  }
  return { approved, total: pool.length }
}

/**
 * Countersign progress. Prefers `tasks` (argument, then `step.tasks`); falls
 * back to `actors[]` + node status for 2.4.2 JSON without tasks. Children are
 * never counted.
 */
export function workflowActorProgress(
  step: Pick<WorkflowTimelineStep, 'actor' | 'actors' | 'status' | 'key' | 'tasks'> | undefined,
  tasks?: readonly WorkflowTask[]
): WorkflowActorProgress {
  const fromArg = tasks !== undefined ? taskProgressForNode(step, tasks) : undefined
  if (fromArg) return fromArg
  if (step?.tasks && step.tasks.length > 0) {
    const fromStep = taskProgressForNode(step, step.tasks)
    if (fromStep) return fromStep
  }

  const fromList = Boolean(step?.actors && step.actors.length > 0)
  const actors = resolveWorkflowStepActors(step)
  if (actors.length === 0) return { approved: 0, total: 0 }

  if (fromList) {
    let approved = 0
    for (const actor of actors) {
      if (isApprovedActorStatus(actor.status)) approved += 1
    }
    return { approved, total: actors.length }
  }

  const actorStatus = actors[0]?.status
  const status = isWorkflowTimelineStepStatus(actorStatus)
    ? actorStatus
    : resolveWorkflowStepStatus(step)
  return { approved: status === 'approved' ? 1 : 0, total: 1 }
}

export function formatWorkflowActorsProgress(
  template: string | undefined,
  progress: WorkflowActorProgress
): string {
  return (template || '{approved}/{total} signed')
    .replace('{approved}', String(progress.approved))
    .replace('{total}', String(progress.total))
}

export interface WorkflowStepActorView {
  key: string
  name: string
  status: WorkflowTimelineStepStatus
  avatar?: string
  actedAt?: string
  comment?: string
  origin?: WorkflowTaskOrigin
  blocked?: boolean
  current?: boolean
  addsign?: boolean
}

export interface WorkflowStepActorsPresentation {
  actors: WorkflowStepActorView[]
  list: boolean
  progressLabel?: string
  fromTasks?: boolean
}

function workflowActorAvatarUrl(
  actor: Pick<WorkflowTimelineActor, 'avatar'> | undefined
): string | undefined {
  const value = actor?.avatar
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function resolveWorkflowActorStatus(
  actor: Pick<WorkflowTimelineActor, 'status'> | undefined
): WorkflowTimelineStepStatus {
  return isWorkflowTimelineStepStatus(actor?.status) ? actor.status : 'pending'
}

export function resolveWorkflowTaskDisplayStatus(
  status: WorkflowTaskStatus | undefined
): WorkflowTimelineStepStatus {
  if (status === 'blocked') return 'pending'
  return isWorkflowTimelineStepStatus(status) ? status : 'pending'
}

function tasksForStep(
  step: Pick<WorkflowTimelineStep, 'key' | 'tasks'> | undefined,
  tasks?: readonly WorkflowTask[]
): WorkflowTask[] | undefined {
  if (tasks && step?.key != null) {
    const matched = tasks.filter((task) => task.nodeKey === step.key)
    if (matched.length > 0) return matched
  }
  if (step?.tasks && step.tasks.length > 0) return step.tasks
  return undefined
}

function markSequentialCurrent(actors: WorkflowStepActorView[]): void {
  const current = actors.find(
    (actor) =>
      actor.status !== 'approved' && actor.status !== 'rejected' && actor.status !== 'canceled'
  )
  if (current) current.current = true
}

function actorViewFromTask(task: WorkflowTask, index: number): WorkflowStepActorView {
  const view: WorkflowStepActorView = {
    key: task.id || String(task.assignee.id ?? task.assignee.name ?? index),
    name: task.assignee.name ?? '',
    status: resolveWorkflowTaskDisplayStatus(task.status)
  }
  const avatar = workflowActorAvatarUrl(task.assignee)
  if (avatar) view.avatar = avatar
  if (task.actedAt) view.actedAt = task.actedAt
  if (task.comment) view.comment = task.comment
  if (task.origin) view.origin = task.origin
  if (task.status === 'blocked') view.blocked = true
  if (task.origin === 'addsign') view.addsign = true
  return view
}

/**
 * In-card / inline actor presentation. Prefers `tasks` (argument, then
 * `step.tasks`) so each person is a status row; falls back to `actors[]`.
 * Countersign gets N/M; or-sign gets "any one"; sequential highlights current.
 * People are never modeled as `children`.
 */
export function getWorkflowStepActorsPresentation(
  step:
    | Pick<WorkflowTimelineStep, 'actor' | 'actors' | 'status' | 'signMode' | 'key' | 'tasks'>
    | undefined,
  labels?: Pick<TigerLocaleWorkflowTimeline, 'actorsProgress' | 'signOrsignAny'>,
  tasks?: readonly WorkflowTask[]
): WorkflowStepActorsPresentation {
  const signMode = resolveWorkflowSignMode(step)
  const nodeTasks = tasksForStep(step, tasks)
  if (nodeTasks && nodeTasks.length > 0) {
    const actors = nodeTasks.map((task, index) => actorViewFromTask(task, index))
    if (signMode === 'sequential') markSequentialCurrent(actors)
    const presentation: WorkflowStepActorsPresentation = { actors, list: true, fromTasks: true }
    if (signMode === 'countersign') {
      presentation.progressLabel = formatWorkflowActorsProgress(
        labels?.actorsProgress,
        workflowActorProgress(step, tasks)
      )
    } else if (signMode === 'orsign') {
      presentation.progressLabel = labels?.signOrsignAny || 'Any one'
    }
    return presentation
  }

  const resolved = resolveWorkflowStepActors(step)
  const actors: WorkflowStepActorView[] = resolved.map((actor, index) => {
    const view: WorkflowStepActorView = {
      key: String(actor.id ?? actor.name ?? index),
      name: actor.name ?? '',
      status: resolveWorkflowActorStatus(actor)
    }
    const avatar = workflowActorAvatarUrl(actor)
    if (avatar) view.avatar = avatar
    return view
  })
  const list = actors.length > 1
  if (list && signMode === 'sequential') markSequentialCurrent(actors)
  const presentation: WorkflowStepActorsPresentation = { actors, list }
  if (list && signMode === 'countersign') {
    presentation.progressLabel = formatWorkflowActorsProgress(
      labels?.actorsProgress,
      workflowActorProgress(step)
    )
  } else if (list && signMode === 'orsign') {
    presentation.progressLabel = labels?.signOrsignAny || 'Any one'
  }
  return presentation
}

export function shouldShowWorkflowSignMode(
  kind: WorkflowStepKind,
  signMode: WorkflowSignMode
): boolean {
  return kind === 'approve' && signMode !== 'sequential'
}

/**
 * Copy steps, default unknown/omitted status to `pending`, fill `title` from
 * `label` when needed, and stably sort each sibling list. Does not mutate input.
 */
export function normalizeWorkflowTimelineSteps(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowTimelineStep[] {
  if (!steps || steps.length === 0) return EMPTY_WORKFLOW_TIMELINE_STEPS
  return sortWorkflowTimelineSteps(steps.map(copyStep))
}

/**
 * First `active` step in display order (parent then children).
 * `undefined` when none are active.
 */
export function getCurrentWorkflowStep(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowTimelineStep | undefined {
  if (!steps || steps.length === 0) return undefined
  let current: WorkflowTimelineStep | undefined
  visitSteps(steps, (step) => {
    if (current) return
    if (isWorkflowStepActive(step)) current = step
  })
  return current
}

/**
 * An instance is terminal when it has a rejected or canceled step, or when
 * every step is terminal (typically all approved). Empty lists are not terminal.
 */
export function isWorkflowTimelineTerminal(
  steps: readonly WorkflowTimelineStep[] | undefined
): boolean {
  if (!steps || steps.length === 0) return false

  let sawStep = false
  let sawRejectedOrCanceled = false
  let sawOpen = false

  visitSteps(steps, (step) => {
    sawStep = true
    const status = resolveWorkflowStepStatus(step)
    if (status === 'rejected' || status === 'canceled') {
      sawRejectedOrCanceled = true
    } else if (status === 'pending' || status === 'active') {
      sawOpen = true
    }
  })

  if (!sawStep) return false
  if (sawRejectedOrCanceled) return true
  return !sawOpen
}

/**
 * Counts by resolved status, including nested children.
 */
export function countWorkflowStepsByStatus(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowStepStatusCounts {
  const counts = emptyStatusCounts()
  if (!steps || steps.length === 0) return counts
  visitSteps(steps, (step) => {
    counts[resolveWorkflowStepStatus(step)] += 1
  })
  return counts
}

function stepToTimelineItem(
  step: WorkflowTimelineStep,
  extras: Pick<WorkflowTimelineItem, 'onPath' | 'returnTarget' | 'temporary' | 'conditionBranch'>
): WorkflowTimelineItem {
  const status = resolveWorkflowStepStatus(step)
  const item: WorkflowTimelineItem = {
    key: step.key,
    color: workflowStepStatusColor(status),
    status,
    step,
    onPath: extras.onPath,
    returnTarget: extras.returnTarget,
    temporary: extras.temporary,
    conditionBranch: extras.conditionBranch
  }
  if (step.time != null) item.label = step.time
  const content = step.title ?? step.label
  if (content != null) item.content = content
  return item
}

/**
 * Convert approval steps to {@link TimelineItem} rows.
 * Nested children flatten after their parent. Color/status are data hints.
 * Annotates on-path / return-to / add-sign / condition-branch for the same
 * Timeline — not a second component.
 */
export function workflowStepsToTimelineItems(
  steps: readonly WorkflowTimelineStep[] | undefined,
  options?: { tasks?: readonly WorkflowTask[] }
): WorkflowTimelineItem[] {
  const normalized = normalizeWorkflowTimelineSteps(steps)
  if (normalized === EMPTY_WORKFLOW_TIMELINE_STEPS) return []
  const path = getWorkflowCurrentPathKeys(normalized)
  const returnTarget = getWorkflowReturnTargetStep(normalized, options?.tasks)

  const flatten = (
    list: readonly WorkflowTimelineStep[],
    parentKind?: WorkflowStepKind
  ): WorkflowTimelineItem[] => {
    const items: WorkflowTimelineItem[] = []
    for (const step of list) {
      items.push(
        stepToTimelineItem(step, {
          onPath: path.has(step.key),
          returnTarget: returnTarget?.key === step.key,
          temporary: Boolean(step.temporary),
          conditionBranch: parentKind === 'condition'
        })
      )
      if (step.children && step.children.length > 0) {
        items.push(...flatten(step.children, resolveWorkflowStepKind(step)))
      }
    }
    return items
  }

  return flatten(normalized)
}

export function isWorkflowAddsignStep(
  step: Pick<WorkflowTimelineStep, 'temporary' | 'origin'> | undefined
): boolean {
  return Boolean(step?.temporary && step.origin?.type === 'addsign')
}

export function workflowAddsignPositionOf(
  step: Pick<WorkflowTimelineStep, 'temporary' | 'origin'> | undefined
): WorkflowAddsignPosition | undefined {
  if (!isWorkflowAddsignStep(step)) return undefined
  return step?.origin?.position
}

/**
 * Explicit `returnTarget: true` wins; otherwise the active step whose tasks
 * have `origin: 'return'`.
 */
export function getWorkflowReturnTargetStep(
  steps: readonly WorkflowTimelineStep[] | undefined,
  tasks?: readonly WorkflowTask[]
): WorkflowTimelineStep | undefined {
  if (!steps || steps.length === 0) return undefined
  const normalized = normalizeWorkflowTimelineSteps(steps)
  let explicit: WorkflowTimelineStep | undefined
  visitSteps(normalized, (step) => {
    if (step.returnTarget === true && !explicit) explicit = step
  })
  if (explicit) return explicit

  const current = getCurrentWorkflowStep(normalized)
  if (!current) return undefined
  const nodeTasks = tasksForStep(current, tasks)
  if (nodeTasks?.some((task) => task.origin === 'return')) return current
  return undefined
}

export interface WorkflowStepRuntimeChrome {
  addsign: boolean
  addsignTag?: string
  addsignPositionLabel?: string
  returnTarget: boolean
  returnTargetLabel?: string
  conditionBranch: boolean
  onPath: boolean
  branchPathLabel?: string
  pendingAfterAddsignLabel?: string
}

export function getWorkflowStepRuntimeChrome(
  step: Pick<WorkflowTimelineStep, 'temporary' | 'origin' | 'pendingAfterAddsign'>,
  labels: Partial<TigerLocaleWorkflowTimeline>,
  options: {
    onPath: boolean
    returnTarget: boolean
    conditionBranch: boolean
    highlightPath?: boolean
  }
): WorkflowStepRuntimeChrome {
  const chrome: WorkflowStepRuntimeChrome = {
    addsign: isWorkflowAddsignStep(step),
    returnTarget: options.returnTarget,
    conditionBranch: options.conditionBranch,
    onPath: options.onPath
  }
  if (chrome.addsign) {
    chrome.addsignTag = labels.addsignTag || 'Added approver'
    const position = workflowAddsignPositionOf(step)
    if (position === 'after') chrome.addsignPositionLabel = labels.addsignAfter || 'After'
    else if (position === 'before') chrome.addsignPositionLabel = labels.addsignBefore || 'Before'
  }
  if (options.returnTarget) {
    chrome.returnTargetLabel = labels.returnTarget || 'Returned here'
  }
  if (options.highlightPath !== false && options.conditionBranch) {
    chrome.branchPathLabel = options.onPath
      ? labels.currentPath || 'Current path'
      : labels.offPath || 'Untaken branch'
  }
  if (step.pendingAfterAddsign) {
    chrome.pendingAfterAddsignLabel = labels.addsignAfter || 'After'
  }
  return chrome
}

export function workflowStepStatusLabel(
  status: WorkflowTimelineStepStatus,
  labels?: Partial<TigerLocaleWorkflowTimeline>,
  kind?: WorkflowStepKind
): string {
  if (kind === 'cc' && TERMINAL_STATUS_SET.has(status)) {
    return labels?.ccNotified || 'CC sent'
  }
  return labels?.[status] || WORKFLOW_STEP_STATUS_LABELS[status]
}

export function workflowTaskRowStatusLabel(
  actor: Pick<WorkflowStepActorView, 'status' | 'blocked'>,
  labels?: Partial<TigerLocaleWorkflowTimeline>
): string {
  if (actor.blocked) return labels?.taskBlocked || 'Waiting on added approver'
  return workflowStepStatusLabel(actor.status, labels)
}

export function workflowStepStatusTagVariant(status: WorkflowTimelineStepStatus): TagVariant {
  return WORKFLOW_STEP_STATUS_TAG_VARIANTS[status]
}

export interface WorkflowActionButtonProps {
  variant: ButtonVariant
  danger: boolean
}

/**
 * Map an action-bar item onto Button `variant` / `danger`.
 * `danger` variant is outline + danger because Button has no danger variant.
 */
export function resolveWorkflowActionButtonProps(
  item: Pick<WorkflowActionBarItem, 'action' | 'variant'>
): WorkflowActionButtonProps {
  if (item.variant === 'danger') return { variant: 'outline', danger: true }
  if (item.variant) return { variant: item.variant, danger: false }
  if (item.action === 'approve') return { variant: 'primary', danger: false }
  if (item.action === 'reject' || item.action === 'cancel') {
    return { variant: 'outline', danger: true }
  }
  if (item.action === 'comment') return { variant: 'ghost', danger: false }
  return { variant: 'outline', danger: false }
}

/**
 * Action bar visibility: explicit `showActions` wins; otherwise show when
 * there are items and an `active` current step.
 */
export function shouldShowWorkflowActions(
  steps: readonly WorkflowTimelineStep[] | undefined,
  actions: readonly WorkflowActionBarItem[] | undefined,
  showActions?: boolean
): boolean {
  if (showActions === false) return false
  if (!actions || actions.length === 0) return false
  if (showActions === true) return true
  return getCurrentWorkflowStep(steps) != null
}

export const WORKFLOW_STEP_KINDS: readonly WorkflowStepKind[] = [
  'start',
  'approve',
  'cc',
  'condition',
  'end'
]

export const WORKFLOW_SIGN_MODES: readonly WorkflowSignMode[] = [
  'sequential',
  'countersign',
  'orsign'
]

const KIND_SET = new Set<string>(WORKFLOW_STEP_KINDS)
const SIGN_MODE_SET = new Set<string>(WORKFLOW_SIGN_MODES)

export const WORKFLOW_STEP_KIND_LABELS: Record<WorkflowStepKind, string> = {
  start: 'Start',
  approve: 'Approval',
  cc: 'CC',
  condition: 'Condition',
  end: 'End'
}

export const WORKFLOW_SIGN_MODE_LABELS: Record<WorkflowSignMode, string> = {
  sequential: 'Sequential',
  countersign: 'Countersign',
  orsign: 'Or-sign'
}

export function isWorkflowStepKind(value: unknown): value is WorkflowStepKind {
  return typeof value === 'string' && KIND_SET.has(value)
}

export function isWorkflowSignMode(value: unknown): value is WorkflowSignMode {
  return typeof value === 'string' && SIGN_MODE_SET.has(value)
}

export function resolveWorkflowStepKind(
  step: Pick<WorkflowTimelineStep, 'kind'> | undefined
): WorkflowStepKind {
  return isWorkflowStepKind(step?.kind) ? step.kind : 'approve'
}

export function resolveWorkflowSignMode(
  step: Pick<WorkflowTimelineStep, 'signMode'> | undefined
): WorkflowSignMode {
  return isWorkflowSignMode(step?.signMode) ? step.signMode : 'sequential'
}

export function workflowStepKindLabel(
  kind: WorkflowStepKind,
  labels?: Partial<TigerLocaleWorkflowTimeline>
): string {
  if (kind === 'start') return labels?.kindStart || WORKFLOW_STEP_KIND_LABELS.start
  if (kind === 'cc') return labels?.kindCc || WORKFLOW_STEP_KIND_LABELS.cc
  if (kind === 'condition') return labels?.kindCondition || WORKFLOW_STEP_KIND_LABELS.condition
  if (kind === 'end') return labels?.kindEnd || WORKFLOW_STEP_KIND_LABELS.end
  return labels?.kindApprove || WORKFLOW_STEP_KIND_LABELS.approve
}

export function workflowSignModeLabel(
  mode: WorkflowSignMode,
  labels?: Partial<TigerLocaleWorkflowTimeline>
): string {
  if (mode === 'countersign') {
    return labels?.signCountersign || WORKFLOW_SIGN_MODE_LABELS.countersign
  }
  if (mode === 'orsign') return labels?.signOrsign || WORKFLOW_SIGN_MODE_LABELS.orsign
  return labels?.signSequential || WORKFLOW_SIGN_MODE_LABELS.sequential
}

export const WORKFLOW_TIMELINE_ACTIONS: readonly WorkflowTimelineAction[] = [
  'approve',
  'reject',
  'transfer',
  'return',
  'addsign',
  'cancel',
  'comment',
  'request_changes'
]

export function workflowActionNeedsConfirm(action: WorkflowTimelineAction): boolean {
  return action !== 'comment'
}

export interface WorkflowActionConfirmCopy {
  title: string
  description?: string
  okType: 'primary' | 'danger'
  commentPlaceholder?: string
}

function resolveConfirmCommentPlaceholder(
  labels?: Partial<TigerLocaleWorkflowTimeline>,
  commentRequired?: boolean
): string {
  if (commentRequired) return labels?.commentRequired || 'Comment required'
  return labels?.commentPlaceholder || 'Comment (optional)'
}

function confirmCopy(
  title: string,
  description: string,
  okType: 'primary' | 'danger',
  commentPlaceholder: string
): WorkflowActionConfirmCopy {
  const copy: WorkflowActionConfirmCopy = { title, okType, commentPlaceholder }
  if (description) copy.description = description
  return copy
}

export function getWorkflowActionConfirmCopy(
  action: WorkflowTimelineAction,
  labels?: Partial<TigerLocaleWorkflowTimeline>,
  options?: { commentRequired?: boolean }
): WorkflowActionConfirmCopy | null {
  const commentPlaceholder = resolveConfirmCommentPlaceholder(labels, options?.commentRequired)
  if (action === 'approve') {
    return confirmCopy(
      labels?.confirmApprove || 'Approve this request?',
      labels?.confirmApproveDescription || '',
      'primary',
      commentPlaceholder
    )
  }
  if (action === 'reject') {
    return confirmCopy(
      labels?.confirmReject || 'Reject this request?',
      labels?.confirmRejectDescription || 'The requester will be notified.',
      'danger',
      commentPlaceholder
    )
  }
  if (action === 'cancel') {
    return confirmCopy(
      labels?.confirmCancel || 'Withdraw this request?',
      labels?.confirmCancelDescription || 'Withdrawing ends this request.',
      'danger',
      commentPlaceholder
    )
  }
  if (action === 'transfer') {
    return confirmCopy(
      labels?.confirmTransfer || 'Transfer this request?',
      labels?.confirmTransferDescription || 'After transfer you will no longer be the approver.',
      'primary',
      commentPlaceholder
    )
  }
  if (action === 'addsign') {
    return confirmCopy(
      labels?.confirmAddsign || 'Add an approver?',
      labels?.confirmAddsignDescription || 'The added person will approve on a temporary node.',
      'primary',
      commentPlaceholder
    )
  }
  if (action === 'return') {
    return confirmCopy(
      labels?.confirmReturn || 'Return this request?',
      labels?.confirmReturnDescription ||
        'The instance stays open and restarts from the selected node.',
      'danger',
      commentPlaceholder
    )
  }
  if (action === 'request_changes') {
    return confirmCopy(
      labels?.confirmRequestChanges || 'Request changes?',
      labels?.confirmRequestChangesDescription ||
        'The starter can edit and resubmit this instance.',
      'danger',
      commentPlaceholder
    )
  }
  return null
}

const ACTION_BAR_SORT_ORDER: Record<WorkflowTimelineAction, number> = {
  approve: 0,
  reject: 1,
  transfer: 2,
  return: 3,
  addsign: 4,
  cancel: 5,
  comment: 6,
  request_changes: 7
}

/**
 * Stable visual order: approve → reject → transfer → return → addsign →
 * cancel → comment. Unknown / extra actions keep their relative input order
 * after those.
 */
export function sortWorkflowActionBarItems(
  items: readonly WorkflowActionBarItem[]
): WorkflowActionBarItem[] {
  if (items.length <= 1) return [...items]
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aOrder = ACTION_BAR_SORT_ORDER[a.item.action] ?? Number.POSITIVE_INFINITY
      const bOrder = ACTION_BAR_SORT_ORDER[b.item.action] ?? Number.POSITIVE_INFINITY
      if (aOrder !== bOrder) return aOrder - bOrder
      return a.index - b.index
    })
    .map(({ item }) => item)
}

/**
 * Per-item `confirm` wins. Otherwise the bar `confirm` flag applies to actions
 * that use the confirm-dialog recipe. Return / add-sign / transfer still open
 * a dialog when they need picker input, even if the bar flag is off.
 */
export function shouldConfirmWorkflowAction(
  item: Pick<WorkflowActionBarItem, 'action' | 'confirm'>,
  barConfirm?: boolean
): boolean {
  if (item.confirm === false) return false
  if (item.confirm === true) return workflowActionNeedsConfirm(item.action)
  if (workflowActionNeedsPicker(item.action) != null) return workflowActionNeedsConfirm(item.action)
  if (barConfirm !== true) return false
  return workflowActionNeedsConfirm(item.action)
}

/**
 * Comment field in the confirm dialog. Omitted `commentInput` shows it for
 * reject / return / request_changes; `true` opts in other confirming actions;
 * `false` hides it unless `commentRequired` is set. `comment` never uses
 * Popconfirm.
 */
export function shouldShowWorkflowActionCommentInput(
  action: WorkflowTimelineAction,
  commentInput?: boolean,
  commentRequired?: boolean
): boolean {
  if (!workflowActionNeedsConfirm(action)) return false
  if (commentRequired) return true
  if (commentInput === false) return false
  if (commentInput === true) return true
  return action === 'reject' || action === 'return' || action === 'request_changes'
}

const WORKFLOW_ACTION_FALLBACK_LABELS: Record<WorkflowTimelineAction, string> = {
  approve: 'Approve',
  reject: 'Reject',
  transfer: 'Transfer',
  cancel: 'Withdraw',
  comment: 'Comment',
  addsign: 'Add approver',
  return: 'Return',
  request_changes: 'Request changes'
}

export function defaultWorkflowButtonPlacement(
  action: WorkflowTimelineAction
): WorkflowButtonPlacement {
  if (
    action === 'transfer' ||
    action === 'addsign' ||
    action === 'return' ||
    action === 'request_changes'
  ) {
    return 'more'
  }
  return 'bar'
}

export function workflowActionBarItemPlacement(
  item: Pick<WorkflowActionBarItem, 'action' | 'placement'>
): WorkflowButtonPlacement {
  return item.placement ?? 'bar'
}

export function splitWorkflowActionBarItems(items: readonly WorkflowActionBarItem[]): {
  bar: WorkflowActionBarItem[]
  more: WorkflowActionBarItem[]
} {
  const sorted = sortWorkflowActionBarItems(items)
  return {
    bar: sorted.filter((item) => workflowActionBarItemPlacement(item) !== 'more'),
    more: sorted.filter((item) => workflowActionBarItemPlacement(item) === 'more')
  }
}

export function workflowActionBarItemLabel(
  action: WorkflowTimelineAction,
  labels?: Partial<TigerLocaleWorkflowTimeline>,
  explicit?: string
): string {
  if (explicit != null && explicit.trim() !== '') return explicit
  if (action === 'approve') return labels?.actionApprove || WORKFLOW_ACTION_FALLBACK_LABELS.approve
  if (action === 'reject') return labels?.actionReject || WORKFLOW_ACTION_FALLBACK_LABELS.reject
  if (action === 'transfer')
    return labels?.actionTransfer || WORKFLOW_ACTION_FALLBACK_LABELS.transfer
  if (action === 'cancel') return labels?.actionCancel || WORKFLOW_ACTION_FALLBACK_LABELS.cancel
  if (action === 'comment') return labels?.actionComment || WORKFLOW_ACTION_FALLBACK_LABELS.comment
  if (action === 'addsign') return labels?.actionAddsign || WORKFLOW_ACTION_FALLBACK_LABELS.addsign
  if (action === 'return') return labels?.actionReturn || WORKFLOW_ACTION_FALLBACK_LABELS.return
  return labels?.actionRequestChanges || WORKFLOW_ACTION_FALLBACK_LABELS.request_changes
}

export function workflowActionBarCommentRequired(
  item: Pick<WorkflowActionBarItem, 'action' | 'commentRequired'>,
  barCommentRequired?: boolean
): boolean {
  if (item.commentRequired != null) return item.commentRequired
  if (barCommentRequired != null) return barCommentRequired
  return item.action === 'reject' || item.action === 'return' || item.action === 'request_changes'
}

export function workflowActionNeedsPicker(
  action: WorkflowTimelineAction
): 'return' | 'assignee' | null {
  if (action === 'return') return 'return'
  if (action === 'addsign' || action === 'transfer') return 'assignee'
  return null
}

export function isWorkflowActionVisible(
  action: WorkflowTimelineAction,
  options?: { isStarter?: boolean; viewerRole?: WorkflowActionBarViewerRole }
): boolean {
  const role = options?.viewerRole ?? 'approver'
  if (role === 'cc') return action === 'comment'
  if (action === 'cancel') return role === 'starter' || options?.isStarter === true
  if (role === 'starter') return action === 'comment'
  return true
}

export function workflowButtonConfigToActionBarItem(
  config: WorkflowButtonConfig,
  labels?: Partial<TigerLocaleWorkflowTimeline>
): WorkflowActionBarItem {
  const item: WorkflowActionBarItem = {
    key: config.action,
    label: workflowActionBarItemLabel(config.action, labels, config.label),
    action: config.action,
    placement: config.placement ?? defaultWorkflowButtonPlacement(config.action)
  }
  if (config.commentRequired != null) item.commentRequired = config.commentRequired
  if (config.action === 'approve') item.variant = 'primary'
  else if (config.action === 'reject' || config.action === 'cancel') item.variant = 'danger'
  else if (config.action === 'comment') item.variant = 'ghost'
  else item.variant = 'outline'
  return item
}

export function workflowButtonConfigsToActionBarItems(
  buttons: readonly WorkflowButtonConfig[],
  labels?: Partial<TigerLocaleWorkflowTimeline>,
  options?: { isStarter?: boolean; viewerRole?: WorkflowActionBarViewerRole }
): WorkflowActionBarItem[] {
  return buttons
    .filter((button) => button.enabled !== false)
    .filter((button) => isWorkflowActionVisible(button.action, options))
    .map((button) => workflowButtonConfigToActionBarItem(button, labels))
}

export function resolveWorkflowActionBarItems(options: {
  items?: readonly WorkflowActionBarItem[]
  buttonPolicy?: WorkflowNodeButtonPolicy
  labels?: Partial<TigerLocaleWorkflowTimeline>
  isStarter?: boolean
  viewerRole?: WorkflowActionBarViewerRole
}): WorkflowActionBarItem[] {
  if (options.items && options.items.length > 0) return [...options.items]
  if (options.buttonPolicy) {
    return workflowButtonConfigsToActionBarItems(options.buttonPolicy.buttons, options.labels, {
      isStarter: options.isStarter,
      viewerRole: options.viewerRole
    })
  }
  return []
}

export function isWorkflowActionBarItemDisabled(
  item: Pick<WorkflowActionBarItem, 'action' | 'disabled'>,
  options?: {
    barDisabled?: boolean
    hasReturnPicker?: boolean
    hasAssigneePicker?: boolean
    returnTargetCount?: number
  }
): boolean {
  if (options?.barDisabled || item.disabled) return true
  const picker = workflowActionNeedsPicker(item.action)
  if (picker === 'return') {
    if (!options?.hasReturnPicker) return true
    if (options.returnTargetCount === 0) return true
  }
  if (picker === 'assignee' && !options?.hasAssigneePicker) return true
  return false
}

export function workflowActionBarItemDisabledReason(
  item: Pick<WorkflowActionBarItem, 'action' | 'disabled'>,
  options: {
    barDisabled?: boolean
    hasReturnPicker?: boolean
    hasAssigneePicker?: boolean
    returnTargetCount?: number
    returnNoTargets: string
  }
): string | undefined {
  if (item.disabled || options.barDisabled) return undefined
  if (item.action === 'return' && options.hasReturnPicker && options.returnTargetCount === 0) {
    return options.returnNoTargets
  }
  return undefined
}

export function resolveAddsignPositions(
  explicit?: readonly WorkflowAddsignPosition[],
  policy?: WorkflowNodeButtonPolicy
): WorkflowAddsignPosition[] {
  if (explicit && explicit.length > 0) return [...explicit]
  const fromPolicy = policy?.addsign?.positions
  if (fromPolicy && fromPolicy.length > 0) return [...fromPolicy]
  return ['before', 'after']
}

export function buildWorkflowActionPayload(input: {
  comment?: string
  showComment?: boolean
  targetNodeKey?: string
  position?: WorkflowAddsignPosition
  signMode?: WorkflowSignMode
  assignee?: WorkflowTimelineActor
  assignees?: WorkflowTimelineActor[]
  action: WorkflowTimelineAction
}): WorkflowActionPayload | undefined {
  const payload: WorkflowActionPayload = {}
  if (input.showComment) payload.comment = input.comment ?? ''
  if (input.action === 'return' && input.targetNodeKey) {
    payload.targetNodeKey = input.targetNodeKey
  }
  if (input.action === 'addsign') {
    if (input.position) payload.position = input.position
    if (input.signMode) payload.signMode = input.signMode
  }
  if (input.action === 'addsign' || input.action === 'transfer') {
    if (input.assignee) payload.assignee = input.assignee
    const many = input.assignees ?? (input.assignee ? [input.assignee] : undefined)
    if (many && many.length > 0) payload.assignees = many
  }
  return Object.keys(payload).length > 0 ? payload : undefined
}

export const EMPTY_WORKFLOW_VIEWER_NODES: WorkflowViewerNode[] = []

export const workflowViewerRootClasses = 'w-full'
export const workflowViewerListClasses = 'm-0 flex list-none flex-col items-center p-0'
export const workflowViewerBranchClasses =
  'm-0 flex list-none flex-row flex-wrap items-start justify-center gap-6 p-0'
export const workflowViewerItemClasses = 'flex w-full min-w-0 flex-col items-center'
export const workflowViewerConnectorClasses = 'h-4 w-px bg-[var(--tiger-border,#d1d5db)]'
export const workflowViewerCardClasses =
  'min-w-[12rem] max-w-[18rem] rounded-lg border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] px-3 py-2 shadow-sm'
export const workflowViewerCardCcClasses =
  'min-w-[12rem] max-w-[18rem] rounded-lg border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-surface-muted,#f9fafb)] px-3 py-2 shadow-none'
export const workflowViewerCardOnPathClasses = 'border-[var(--tiger-primary,#2563eb)]'
export const workflowViewerCardRollbackClasses = 'border-[var(--tiger-error,#dc2626)]'
export const workflowViewerCardReturnTargetClasses = 'border-[var(--tiger-warning,#d97706)]'
export const workflowViewerCardOffPathClasses = 'opacity-50'
export const workflowViewerCardActiveClasses =
  'ring-2 ring-[var(--tiger-primary,#2563eb)] ring-offset-1'
export const workflowViewerKindRowClasses = 'flex flex-wrap items-center gap-1'
export const workflowViewerRollbackLabelClasses = 'mt-1 text-xs text-[var(--tiger-error,#dc2626)]'
export const workflowViewerReturnTargetLabelClasses =
  'mt-1 text-xs text-[var(--tiger-warning,#d97706)]'
export const workflowViewerActiveTitleClasses = 'text-[var(--tiger-primary,#2563eb)]'
export const workflowViewerLegendClasses =
  'mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--tiger-text-muted,#6b7280)]'
export const workflowViewerLegendItemClasses = 'inline-flex items-center gap-1.5'
export const workflowViewerLegendSwatchClasses =
  'inline-block h-2.5 w-4 shrink-0 rounded-sm border bg-[var(--tiger-bg,#fff)]'
export const workflowViewerLegendCurrentSwatchClasses = 'border-[var(--tiger-primary,#2563eb)]'
export const workflowViewerLegendOffPathSwatchClasses =
  'border-[var(--tiger-border,#d1d5db)] opacity-50'
export const workflowViewerLegendRollbackSwatchClasses = 'border-[var(--tiger-error,#dc2626)]'
export const workflowViewerLegendReturnSwatchClasses = 'border-[var(--tiger-warning,#d97706)]'
export const workflowStepStatusDotClasses = 'inline-block h-2 w-2 shrink-0 rounded-full'
export const workflowStepActorsListClasses = 'mt-1 flex flex-col gap-0.5'
export const workflowStepActorRowClasses =
  'flex items-center gap-1.5 text-sm text-[var(--tiger-text-muted,#6b7280)]'
export const workflowStepActorProgressClasses = 'text-xs text-[var(--tiger-text-muted,#6b7280)]'
export const workflowStepActorCurrentClasses = 'font-medium text-[var(--tiger-primary,#2563eb)]'
export const workflowStepActorMetaClasses = 'text-xs text-[var(--tiger-text-muted,#6b7280)]'
export const workflowTimelineOffPathClasses = 'opacity-50'

export type WorkflowViewerLegendKey = 'currentPath' | 'offPath' | 'rollbackPoint' | 'returnTarget'

export interface WorkflowViewerLegendItem {
  key: WorkflowViewerLegendKey
  label: string
  swatchClassName: string
}

/**
 * Path legend rows. Current path and off-path always; rollback / return-to
 * only when asked.
 */
export function getWorkflowViewerLegendItems(
  labels: Pick<
    TigerLocaleWorkflowTimeline,
    'currentPath' | 'offPath' | 'rollbackPoint' | 'returnTarget'
  >,
  options?: { showRollbackPoint?: boolean; showReturnTarget?: boolean }
): WorkflowViewerLegendItem[] {
  const items: WorkflowViewerLegendItem[] = [
    {
      key: 'currentPath',
      label: labels.currentPath || 'Current path',
      swatchClassName: classNames(
        workflowViewerLegendSwatchClasses,
        workflowViewerLegendCurrentSwatchClasses
      )
    },
    {
      key: 'offPath',
      label: labels.offPath || 'Untaken branch',
      swatchClassName: classNames(
        workflowViewerLegendSwatchClasses,
        workflowViewerLegendOffPathSwatchClasses
      )
    }
  ]
  if (options?.showRollbackPoint) {
    items.push({
      key: 'rollbackPoint',
      label: labels.rollbackPoint || 'Rollback point',
      swatchClassName: classNames(
        workflowViewerLegendSwatchClasses,
        workflowViewerLegendRollbackSwatchClasses
      )
    })
  }
  if (options?.showReturnTarget) {
    items.push({
      key: 'returnTarget',
      label: labels.returnTarget || 'Returned here',
      swatchClassName: classNames(
        workflowViewerLegendSwatchClasses,
        workflowViewerLegendReturnSwatchClasses
      )
    })
  }
  return items
}

/**
 * A tree node derived from {@link WorkflowTimelineStep}. This is a view model
 * over the existing step list, not a second timeline.
 */
export interface WorkflowViewerNode {
  key: string
  step: WorkflowTimelineStep
  status: WorkflowTimelineStepStatus
  kind: WorkflowStepKind
  signMode: WorkflowSignMode
  onPath: boolean
  rollbackPoint: boolean
  returnTarget: boolean
  temporary: boolean
  conditionBranch: boolean
  children: WorkflowViewerNode[]
}

function isTakenStatus(status: WorkflowTimelineStepStatus): boolean {
  return (
    status === 'approved' || status === 'active' || status === 'rejected' || status === 'canceled'
  )
}

function findPathToKey(steps: readonly WorkflowTimelineStep[], targetKey: string): string[] | null {
  const prefix: string[] = []
  for (const step of steps) {
    prefix.push(step.key)
    if (step.key === targetKey) return prefix
    if (step.children && step.children.length > 0) {
      const nested = findPathToKey(step.children, targetKey)
      if (nested) return [...prefix, ...nested]
    }
  }
  return null
}

/**
 * Explicit `rollbackPoint: true` wins; otherwise the last rejected step in
 * display order. `undefined` when the tree has no reject.
 */
export function getWorkflowRollbackStep(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowTimelineStep | undefined {
  if (!steps || steps.length === 0) return undefined
  const normalized = normalizeWorkflowTimelineSteps(steps)
  let explicit: WorkflowTimelineStep | undefined
  let lastRejected: WorkflowTimelineStep | undefined
  visitSteps(normalized, (step) => {
    if (step.rollbackPoint === true && !explicit) explicit = step
    if (resolveWorkflowStepStatus(step) === 'rejected') lastRejected = step
  })
  return explicit ?? lastRejected
}

/**
 * Keys on the taken path: start → current active step, or start → rollback
 * when no step is active. A fully approved tree uses the last taken step.
 * Condition siblings that were not taken stay off the path. Parallel / CC
 * children of an on-path parent that are taken (or pending under an active
 * parent) join the path.
 */
export function getWorkflowCurrentPathKeys(
  steps: readonly WorkflowTimelineStep[] | undefined
): Set<string> {
  const normalized = normalizeWorkflowTimelineSteps(steps)
  if (normalized === EMPTY_WORKFLOW_TIMELINE_STEPS) return new Set()

  const current = getCurrentWorkflowStep(normalized)
  const rollback = getWorkflowRollbackStep(normalized)
  let endKey = current?.key ?? rollback?.key
  if (endKey == null) {
    const flat = flattenSteps(normalized)
    for (let index = flat.length - 1; index >= 0; index -= 1) {
      const step = flat[index]
      if (!step) continue
      const status = resolveWorkflowStepStatus(step)
      if (status === 'approved' || status === 'canceled') {
        endKey = step.key
        break
      }
    }
  }
  if (endKey == null) return new Set()

  const ancestorPath = findPathToKey(normalized, endKey)
  if (!ancestorPath) return new Set()
  const path = new Set(ancestorPath)

  const expand = (list: readonly WorkflowTimelineStep[]): void => {
    for (const step of list) {
      if (!path.has(step.key) || !step.children || step.children.length === 0) continue
      const kind = resolveWorkflowStepKind(step)
      const status = resolveWorkflowStepStatus(step)
      for (const child of step.children) {
        const childStatus = resolveWorkflowStepStatus(child)
        const include =
          path.has(child.key) ||
          isTakenStatus(childStatus) ||
          (kind !== 'condition' && status === 'active' && childStatus === 'pending')
        if (include) path.add(child.key)
      }
      expand(step.children)
    }
  }
  expand(normalized)
  return path
}

export function buildWorkflowViewerTree(
  steps: readonly WorkflowTimelineStep[] | undefined,
  options?: { tasks?: readonly WorkflowTask[] }
): WorkflowViewerNode[] {
  const normalized = normalizeWorkflowTimelineSteps(steps)
  if (normalized === EMPTY_WORKFLOW_TIMELINE_STEPS) return EMPTY_WORKFLOW_VIEWER_NODES
  const path = getWorkflowCurrentPathKeys(normalized)
  const rollback = getWorkflowRollbackStep(normalized)
  const returnTarget = getWorkflowReturnTargetStep(normalized, options?.tasks)

  const mapList = (
    list: readonly WorkflowTimelineStep[],
    parentKind?: WorkflowStepKind
  ): WorkflowViewerNode[] =>
    list.map((step) => {
      const kind = resolveWorkflowStepKind(step)
      return {
        key: step.key,
        step,
        status: resolveWorkflowStepStatus(step),
        kind,
        signMode: resolveWorkflowSignMode(step),
        onPath: path.has(step.key),
        rollbackPoint: rollback?.key === step.key,
        returnTarget: returnTarget?.key === step.key,
        temporary: Boolean(step.temporary),
        conditionBranch: parentKind === 'condition',
        children: step.children ? mapList(step.children, kind) : []
      }
    })

  return mapList(normalized)
}

export function workflowViewerChildLayout(node: {
  children: readonly unknown[]
}): 'stack' | 'branch' {
  return node.children.length > 1 ? 'branch' : 'stack'
}

export function workflowViewerCardClassName(
  node: Pick<WorkflowViewerNode, 'onPath' | 'rollbackPoint' | 'status'> & {
    kind?: WorkflowStepKind
    returnTarget?: boolean
  },
  options?: { highlightPath?: boolean; showRollbackPoint?: boolean }
): string {
  const highlightPath = options?.highlightPath !== false
  const showRollbackPoint = options?.showRollbackPoint !== false
  const rollback = showRollbackPoint && node.rollbackPoint
  const returned = Boolean(node.returnTarget) && !rollback
  return classNames(
    node.kind === 'cc' ? workflowViewerCardCcClasses : workflowViewerCardClasses,
    highlightPath && !node.onPath ? workflowViewerCardOffPathClasses : null,
    rollback
      ? workflowViewerCardRollbackClasses
      : returned
        ? workflowViewerCardReturnTargetClasses
        : highlightPath && node.onPath
          ? workflowViewerCardOnPathClasses
          : null,
    node.status === 'active' ? workflowViewerCardActiveClasses : null
  )
}
