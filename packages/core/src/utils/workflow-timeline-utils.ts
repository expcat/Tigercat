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
  WorkflowActionBarItem,
  WorkflowSignMode,
  WorkflowStepKind,
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

/**
 * Countersign progress from the actor list. Children are never counted.
 * No names → `{ approved: 0, total: 0 }`. A singular `actor` uses that
 * actor's status, then the step status, as a 0/1 or 1/1.
 */
export function workflowActorProgress(
  step: Pick<WorkflowTimelineStep, 'actor' | 'actors' | 'status'> | undefined
): WorkflowActorProgress {
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
}

export interface WorkflowStepActorsPresentation {
  actors: WorkflowStepActorView[]
  list: boolean
  progressLabel?: string
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

/**
 * In-card / inline actor presentation. A list is used when there are two or
 * more names (countersign / or-sign / sequential). Countersign also gets N/M.
 * People are never modeled as `children`.
 */
export function getWorkflowStepActorsPresentation(
  step: Pick<WorkflowTimelineStep, 'actor' | 'actors' | 'status' | 'signMode'> | undefined,
  labels?: Pick<TigerLocaleWorkflowTimeline, 'actorsProgress'>
): WorkflowStepActorsPresentation {
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
  const presentation: WorkflowStepActorsPresentation = { actors, list }
  if (list && resolveWorkflowSignMode(step) === 'countersign') {
    presentation.progressLabel = formatWorkflowActorsProgress(
      labels?.actorsProgress,
      workflowActorProgress(step)
    )
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

function stepToTimelineItem(step: WorkflowTimelineStep): WorkflowTimelineItem {
  const status = resolveWorkflowStepStatus(step)
  const item: WorkflowTimelineItem = {
    key: step.key,
    color: workflowStepStatusColor(status),
    status,
    step
  }
  if (step.time != null) item.label = step.time
  const content = step.title ?? step.label
  if (content != null) item.content = content
  return item
}

/**
 * Convert approval steps to {@link TimelineItem} rows.
 * Nested children flatten after their parent. Color/status are data hints.
 */
export function workflowStepsToTimelineItems(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowTimelineItem[] {
  const normalized = normalizeWorkflowTimelineSteps(steps)
  if (normalized === EMPTY_WORKFLOW_TIMELINE_STEPS) return []
  return flattenSteps(normalized).map(stepToTimelineItem)
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
  'condition'
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
  condition: 'Condition'
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

export function workflowActionNeedsConfirm(action: WorkflowTimelineAction): boolean {
  return action === 'approve' || action === 'reject' || action === 'cancel' || action === 'transfer'
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
  return null
}

const ACTION_BAR_SORT_ORDER: Record<WorkflowTimelineAction, number> = {
  approve: 0,
  reject: 1,
  transfer: 2,
  cancel: 3,
  comment: 4
}

/**
 * Stable visual order: approve → reject → transfer → cancel → comment.
 * Unknown / extra actions keep their relative input order after those.
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
 * that use the confirm-dialog recipe (approve / reject / cancel / transfer).
 */
export function shouldConfirmWorkflowAction(
  item: Pick<WorkflowActionBarItem, 'action' | 'confirm'>,
  barConfirm?: boolean
): boolean {
  if (item.confirm === false) return false
  if (item.confirm === true) return workflowActionNeedsConfirm(item.action)
  if (barConfirm !== true) return false
  return workflowActionNeedsConfirm(item.action)
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
export const workflowViewerCardOffPathClasses = 'opacity-50'
export const workflowViewerCardActiveClasses =
  'ring-2 ring-[var(--tiger-primary,#2563eb)] ring-offset-1'
export const workflowViewerKindRowClasses = 'flex flex-wrap items-center gap-1'
export const workflowViewerRollbackLabelClasses = 'mt-1 text-xs text-[var(--tiger-error,#dc2626)]'
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
export const workflowStepStatusDotClasses = 'inline-block h-2 w-2 shrink-0 rounded-full'
export const workflowStepActorsListClasses = 'mt-1 flex flex-col gap-0.5'
export const workflowStepActorRowClasses =
  'flex items-center gap-1.5 text-sm text-[var(--tiger-text-muted,#6b7280)]'
export const workflowStepActorProgressClasses = 'text-xs text-[var(--tiger-text-muted,#6b7280)]'

export type WorkflowViewerLegendKey = 'currentPath' | 'offPath' | 'rollbackPoint'

export interface WorkflowViewerLegendItem {
  key: WorkflowViewerLegendKey
  label: string
  swatchClassName: string
}

/**
 * Path legend rows. Current path and off-path always; rollback only when asked.
 */
export function getWorkflowViewerLegendItems(
  labels: Pick<TigerLocaleWorkflowTimeline, 'currentPath' | 'offPath' | 'rollbackPoint'>,
  options?: { showRollbackPoint?: boolean }
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
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowViewerNode[] {
  const normalized = normalizeWorkflowTimelineSteps(steps)
  if (normalized === EMPTY_WORKFLOW_TIMELINE_STEPS) return EMPTY_WORKFLOW_VIEWER_NODES
  const path = getWorkflowCurrentPathKeys(normalized)
  const rollback = getWorkflowRollbackStep(normalized)

  const mapList = (list: readonly WorkflowTimelineStep[]): WorkflowViewerNode[] =>
    list.map((step) => ({
      key: step.key,
      step,
      status: resolveWorkflowStepStatus(step),
      kind: resolveWorkflowStepKind(step),
      signMode: resolveWorkflowSignMode(step),
      onPath: path.has(step.key),
      rollbackPoint: rollback?.key === step.key,
      children: step.children ? mapList(step.children) : []
    }))

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
  },
  options?: { highlightPath?: boolean; showRollbackPoint?: boolean }
): string {
  const highlightPath = options?.highlightPath !== false
  const showRollbackPoint = options?.showRollbackPoint !== false
  const rollback = showRollbackPoint && node.rollbackPoint
  return classNames(
    node.kind === 'cc' ? workflowViewerCardCcClasses : workflowViewerCardClasses,
    highlightPath && !node.onPath ? workflowViewerCardOffPathClasses : null,
    rollback
      ? workflowViewerCardRollbackClasses
      : highlightPath && node.onPath
        ? workflowViewerCardOnPathClasses
        : null,
    node.status === 'active' ? workflowViewerCardActiveClasses : null
  )
}
