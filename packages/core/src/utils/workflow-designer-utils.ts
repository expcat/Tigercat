/**
 * Framework-agnostic helpers for the simple JSON-tree WorkflowDesigner.
 * Paths are arrays of step `key`s. This is not a BPMN graph.
 */

import { classNames } from './class-names'
import type { WorkflowDesignerPath, WorkflowDesignerStepPatch } from '../types/workflow-designer'
import type { SchemaFormSchema } from '../types/schema-form'
import type { TigerLocaleWorkflowDesigner, TigerLocaleWorkflowTimeline } from '../types/locale'
import type {
  ApproverSource,
  FieldPermission,
  WorkflowAutoDecide,
  WorkflowButtonConfig,
  WorkflowEmptyApprover,
  WorkflowNodeAdvanced,
  WorkflowNodeButtonPolicy,
  WorkflowSignMode,
  WorkflowStepKind,
  WorkflowTimeoutAction,
  WorkflowTimelineAction,
  WorkflowTimelineActor,
  WorkflowTimelineStep
} from '../types/workflow-timeline'
import { flattenSchemaFormFields } from './schema-form-utils'
import { createFullWorkflowButtonPolicy, listApproverSources } from './workflow-runtime'
import {
  resolveWorkflowSignMode,
  resolveWorkflowStepActors,
  resolveWorkflowStepKind,
  workflowSignModeLabel,
  workflowStepKindLabel,
  WORKFLOW_SIGN_MODES,
  WORKFLOW_STEP_KINDS
} from './workflow-timeline-utils'

export const EMPTY_WORKFLOW_DESIGNER_STEPS: WorkflowTimelineStep[] = []

export const workflowDesignerRootClasses = 'tiger-workflow-designer w-full'
export const workflowDesignerShellClasses = 'flex flex-col gap-3 lg:flex-row lg:items-stretch'
export const workflowDesignerTreeClasses =
  'tiger-workflow-designer__canvas relative flex min-w-0 flex-1 flex-col gap-2 rounded-lg bg-[var(--tiger-fill,#f3f4f6)] px-4 py-3'
export const workflowDesignerListClasses =
  'tiger-workflow-designer__flow relative m-0 flex list-none flex-col gap-0 border-s-2 border-[var(--tiger-primary,#2563eb)]/35 p-0 ps-4'
export const workflowDesignerItemClasses =
  'tiger-workflow-designer__node relative flex min-w-0 flex-col'
export const workflowDesignerCardClasses =
  'min-w-0 cursor-pointer rounded-lg border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] px-3 py-2'
export const workflowDesignerCardSelectedClasses =
  'border-[var(--tiger-primary,#2563eb)] bg-[var(--tiger-primary-soft,#eff6ff)] ring-2 ring-[var(--tiger-primary,#2563eb)] ring-offset-1'
export const workflowDesignerSummaryClasses = 'flex min-w-0 flex-col gap-1'
export const workflowDesignerSummaryRowClasses = 'flex min-w-0 items-center gap-2'
export const workflowDesignerSummaryTitleClasses =
  'min-w-0 truncate text-sm font-medium text-[var(--tiger-text,#111827)]'
export const workflowDesignerSummaryActorsClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerKindDotClasses = 'inline-block h-2 w-2 shrink-0 rounded-full'
export const workflowDesignerToolbarClasses = 'mt-2 flex flex-wrap items-center gap-1'
export const workflowDesignerInsertRowClasses =
  'relative z-[1] -ms-[1.15rem] flex items-center gap-1 py-1'
export const workflowDesignerInsertButtonClasses =
  'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] text-xs font-medium leading-none text-[var(--tiger-text-muted,#6b7280)] disabled:cursor-not-allowed disabled:opacity-50'
export const workflowDesignerInsertGlyph = '+'
export const workflowDesignerEmptyInspectorClasses =
  'flex min-h-[12rem] items-center justify-center px-3 text-center text-sm text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerPanelClasses =
  'min-w-0 rounded-lg border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] px-3 py-3 lg:sticky lg:top-0 lg:w-[24rem] lg:shrink-0'
export const workflowDesignerPaletteClasses = 'flex flex-wrap items-center gap-1'
export const workflowDesignerTabListClasses =
  'mb-3 flex flex-wrap gap-1 border-b border-[var(--tiger-border,#d1d5db)] pb-2'
export const workflowDesignerTabClasses =
  'inline-flex items-center rounded-md px-2 py-1 text-xs text-[var(--tiger-text,#111827)] disabled:cursor-not-allowed disabled:opacity-50'
export const workflowDesignerTabSelectedClasses =
  'bg-[var(--tiger-primary-soft,#dbeafe)] text-[var(--tiger-primary,#2563eb)]'
export const workflowDesignerIssueBannerClasses =
  'rounded-md border border-[var(--tiger-error,#dc2626)] bg-[var(--tiger-error-soft,#fef2f2)] px-3 py-2 text-sm text-[var(--tiger-error,#dc2626)]'
export const workflowDesignerIssueListClasses = 'm-0 list-disc space-y-1 ps-4'
export const workflowDesignerTableClasses = 'w-full border-collapse text-sm'
export const workflowDesignerTableHeadClasses =
  'border-b border-[var(--tiger-border,#d1d5db)] py-1 text-start text-xs font-medium text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerTableCellClasses =
  'border-b border-[var(--tiger-border,#e5e7eb)] py-1 align-middle'
export const workflowDesignerFieldsClasses = 'flex flex-col gap-2'
export const workflowDesignerFieldClasses = 'flex min-w-0 flex-col gap-1'
export const workflowDesignerLabelClasses =
  'text-xs font-medium text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerHintClasses = 'text-xs text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerControlClasses =
  'w-full rounded-md border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] px-2 py-1 text-sm text-[var(--tiger-text,#111827)]'
export const workflowDesignerActorRowClasses = 'flex min-w-0 items-center gap-1'
export const workflowDesignerEmptyClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerChildrenClasses =
  'ms-5 border-s-2 border-[var(--tiger-border,#d1d5db)] ps-3'
export const workflowDesignerActionButtonClasses =
  'inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] px-2 py-1 text-xs text-[var(--tiger-text,#111827)] disabled:cursor-not-allowed disabled:opacity-50'

export const WORKFLOW_DESIGNER_KIND_COLORS: Record<WorkflowStepKind, string> = {
  start: 'var(--tiger-primary,#2563eb)',
  approve: 'var(--tiger-success,#16a34a)',
  cc: 'var(--tiger-text-muted,#6b7280)',
  condition: 'var(--tiger-warning,#d97706)',
  end: 'var(--tiger-text,#111827)'
}

export const WORKFLOW_DESIGNER_PALETTE_KINDS: readonly WorkflowStepKind[] = WORKFLOW_STEP_KINDS

export const WORKFLOW_DESIGNER_INSPECTOR_TABS = [
  'approvers',
  'buttons',
  'fieldPermissions',
  'advanced'
] as const

export type WorkflowDesignerInspectorTab = (typeof WORKFLOW_DESIGNER_INSPECTOR_TABS)[number]

export const WORKFLOW_APPROVER_SOURCE_TYPES: readonly ApproverSource['type'][] = [
  'fixed',
  'self',
  'starter_pick',
  'role',
  'group',
  'dept_leader',
  'manager_chain'
]

export const WORKFLOW_AUTO_DECIDES: readonly WorkflowAutoDecide[] = [
  'manual',
  'auto_pass',
  'auto_reject'
]

export const WORKFLOW_EMPTY_APPROVERS: readonly WorkflowEmptyApprover[] = [
  'skip_pass',
  'pause',
  'transfer_admin',
  'transfer_user'
]

export const WORKFLOW_TIMEOUT_ACTIONS: readonly WorkflowTimeoutAction[] = [
  'remind',
  'auto_pass',
  'auto_reject',
  'transfer'
]

export type WorkflowDesignerIssueCode =
  'missing_start' | 'missing_end' | 'empty_approvers' | 'missing_branches' | 'buttons_all_disabled'

export interface WorkflowDesignerIssue {
  code: WorkflowDesignerIssueCode
  path: string[]
  blocking: boolean
}

export interface WorkflowDesignerFieldPermissionRow {
  name: string
  label: string
  permission: FieldPermission
}

export function workflowDesignerKindColor(kind: WorkflowStepKind): string {
  return WORKFLOW_DESIGNER_KIND_COLORS[kind]
}

export function workflowDesignerPathKey(path: WorkflowDesignerPath): string {
  return path.join('\0')
}

export function workflowDesignerSignModeHint(
  mode: WorkflowSignMode,
  labels: Pick<
    TigerLocaleWorkflowTimeline,
    'signSequentialHint' | 'signCountersignHint' | 'signOrsignHint'
  >
): string {
  if (mode === 'countersign') return labels.signCountersignHint ?? ''
  if (mode === 'orsign') return labels.signOrsignHint ?? ''
  return labels.signSequentialHint ?? ''
}

export interface WorkflowDesignerNode {
  key: string
  path: string[]
  step: WorkflowTimelineStep
  kind: WorkflowStepKind
  signMode: WorkflowSignMode
  title: string
  actorName: string
  actorNames: string[]
  index: number
  canMoveUp: boolean
  canMoveDown: boolean
  children: WorkflowDesignerNode[]
}

export interface WorkflowDesignerView {
  list: WorkflowTimelineStep[]
  valid: boolean
  parentPath: string[]
}

function cloneStep(step: WorkflowTimelineStep): WorkflowTimelineStep {
  const next: WorkflowTimelineStep = {
    ...step,
    actor: step.actor ? { ...step.actor } : undefined,
    actors: step.actors ? step.actors.map((actor) => ({ ...actor })) : undefined,
    children: step.children ? cloneWorkflowSteps(step.children) : undefined
  }
  if (step.tasks) {
    next.tasks = step.tasks.map((task) => ({ ...task, assignee: { ...task.assignee } }))
  }
  if (step.fieldPermissions) next.fieldPermissions = { ...step.fieldPermissions }
  if (step.buttonPolicy) {
    next.buttonPolicy = {
      ...step.buttonPolicy,
      buttons: step.buttonPolicy.buttons.map((button) => ({ ...button })),
      addsign: step.buttonPolicy.addsign
        ? { positions: [...step.buttonPolicy.addsign.positions] }
        : step.buttonPolicy.addsign
    }
  }
  if (step.approverPolicy) {
    next.approverPolicy = Array.isArray(step.approverPolicy)
      ? step.approverPolicy.map((source) =>
          source.type === 'fixed'
            ? { type: 'fixed', actors: source.actors.map((actor) => ({ ...actor })) }
            : { ...source }
        )
      : step.approverPolicy.type === 'fixed'
        ? { type: 'fixed', actors: step.approverPolicy.actors.map((actor) => ({ ...actor })) }
        : { ...step.approverPolicy }
  }
  if (step.advanced) {
    next.advanced = {
      ...step.advanced,
      timeout: step.advanced.timeout ? { ...step.advanced.timeout } : step.advanced.timeout
    }
  }
  if (step.origin) next.origin = { ...step.origin }
  if (step.pendingAfterAddsign) {
    next.pendingAfterAddsign = {
      ...step.pendingAfterAddsign,
      assignees: step.pendingAfterAddsign.assignees.map((actor) => ({ ...actor }))
    }
  }
  return next
}

function workflowDesignerActorNames(step: WorkflowTimelineStep): string[] {
  const names: string[] = []
  for (const actor of resolveWorkflowStepActors(step)) {
    if (typeof actor.name === 'string' && actor.name.trim() !== '') names.push(actor.name)
  }
  return names
}

export function cloneWorkflowSteps(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowTimelineStep[] {
  if (!steps || steps.length === 0) return []
  return steps.map(cloneStep)
}

export function collectWorkflowStepKeys(
  steps: readonly WorkflowTimelineStep[] | undefined
): Set<string> {
  const keys = new Set<string>()
  const visit = (list: readonly WorkflowTimelineStep[]): void => {
    for (const step of list) {
      keys.add(step.key)
      if (step.children && step.children.length > 0) visit(step.children)
    }
  }
  if (steps && steps.length > 0) visit(steps)
  return keys
}

export function createWorkflowDesignerStep(
  existing: readonly WorkflowTimelineStep[] | undefined = EMPTY_WORKFLOW_DESIGNER_STEPS,
  patch: Partial<WorkflowTimelineStep> = {}
): WorkflowTimelineStep {
  const keys = collectWorkflowStepKeys(existing)
  let next = 1
  while (keys.has(`step-${next}`)) next += 1
  const requested = patch.key != null ? String(patch.key) : ''
  const key = requested && !keys.has(requested) ? requested : `step-${next}`
  return {
    kind: 'approve',
    title: '',
    status: 'pending',
    ...patch,
    key
  }
}

function findIndexByKey(list: readonly WorkflowTimelineStep[], key: string): number {
  return list.findIndex((step) => step.key === key)
}

export function getWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[] | undefined,
  path: WorkflowDesignerPath | undefined
): WorkflowTimelineStep | undefined {
  if (!steps || !path || path.length === 0) return undefined
  let list: readonly WorkflowTimelineStep[] | undefined = steps
  let current: WorkflowTimelineStep | undefined
  for (const key of path) {
    if (!list) return undefined
    current = list.find((step) => step.key === key)
    if (!current) return undefined
    list = current.children
  }
  return current
}

function updateListAt(
  steps: readonly WorkflowTimelineStep[],
  parentPath: WorkflowDesignerPath,
  update: (list: WorkflowTimelineStep[]) => WorkflowTimelineStep[]
): WorkflowTimelineStep[] {
  if (parentPath.length === 0) return update(cloneWorkflowSteps(steps))

  const [head, ...rest] = parentPath
  let found = false
  const next = steps.map((step) => {
    if (step.key !== head) return cloneStep(step)
    found = true
    return {
      ...cloneStep(step),
      children: updateListAt(step.children ?? [], rest, update)
    }
  })
  return found ? next : cloneWorkflowSteps(steps)
}

export function patchWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath,
  patch: WorkflowDesignerStepPatch
): WorkflowTimelineStep[] {
  if (path.length === 0) return cloneWorkflowSteps(steps)
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  if (key == null) return cloneWorkflowSteps(steps)
  return updateListAt(steps, parentPath, (list) =>
    list.map((step) => {
      if (step.key !== key) return step
      const nextActors =
        patch.actors === undefined
          ? step.actors
          : patch.actors == null || patch.actors.length === 0
            ? undefined
            : patch.actors.map((actor) => ({ ...actor }))
      const nextActor =
        patch.actors !== undefined
          ? nextActors?.[0]
          : patch.actor === undefined
            ? step.actor
            : patch.actor == null
              ? undefined
              : { ...step.actor, ...patch.actor }
      return {
        ...step,
        ...patch,
        actor: nextActor,
        actors: nextActors,
        key: step.key,
        children: step.children
      }
    })
  )
}

export function insertWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[],
  parentPath: WorkflowDesignerPath,
  step: WorkflowTimelineStep,
  index?: number
): WorkflowTimelineStep[] {
  return updateListAt(steps, parentPath, (list) => {
    const copy = list.slice()
    const at = index == null || index > copy.length ? copy.length : Math.max(0, index)
    copy.splice(at, 0, cloneStep(step))
    return copy
  })
}

/**
 * Insert `step` as a sibling after the node at `path`.
 * Does not nest the new node under the target.
 */
export function insertWorkflowStepAfterPath(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath,
  step: WorkflowTimelineStep
): WorkflowTimelineStep[] {
  if (path.length === 0) return cloneWorkflowSteps(steps)
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  if (key == null) return cloneWorkflowSteps(steps)

  const siblings =
    parentPath.length === 0 ? steps : (getWorkflowStepAtPath(steps, parentPath)?.children ?? null)
  if (!siblings) return cloneWorkflowSteps(steps)
  const index = findIndexByKey(siblings, key)
  if (index < 0) return cloneWorkflowSteps(steps)
  return insertWorkflowStepAtPath(steps, parentPath, step, index + 1)
}

export function removeWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath
): WorkflowTimelineStep[] {
  if (path.length === 0) return cloneWorkflowSteps(steps)
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  if (key == null) return cloneWorkflowSteps(steps)
  return updateListAt(steps, parentPath, (list) => list.filter((step) => step.key !== key))
}

export function moveWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath,
  delta: number
): WorkflowTimelineStep[] {
  if (path.length === 0 || delta === 0) return cloneWorkflowSteps(steps)
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  if (key == null) return cloneWorkflowSteps(steps)
  return updateListAt(steps, parentPath, (list) => {
    const index = findIndexByKey(list, key)
    if (index < 0) return list
    const nextIndex = index + delta
    if (nextIndex < 0 || nextIndex >= list.length) return list
    const copy = list.slice()
    const [item] = copy.splice(index, 1)
    if (!item) return list
    copy.splice(nextIndex, 0, item)
    return copy
  })
}

/**
 * Resolve the sibling list the designer should edit.
 * `path` is the parent path of that list (empty = root).
 */
export function resolveWorkflowDesignerView(
  steps: readonly WorkflowTimelineStep[] | undefined,
  path?: WorkflowDesignerPath
): WorkflowDesignerView {
  const parentPath = path ? [...path] : []
  if (!steps) {
    return { list: [], valid: parentPath.length === 0, parentPath }
  }
  if (parentPath.length === 0) {
    return { list: cloneWorkflowSteps(steps), valid: true, parentPath }
  }
  const parent = getWorkflowStepAtPath(steps, parentPath)
  if (!parent) return { list: [], valid: false, parentPath }
  return { list: cloneWorkflowSteps(parent.children), valid: true, parentPath }
}

/**
 * Write an edited sibling list back into the full tree at `path`.
 */
export function applyWorkflowDesignerView(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath | undefined,
  list: readonly WorkflowTimelineStep[]
): WorkflowTimelineStep[] {
  const parentPath = path ? [...path] : []
  if (parentPath.length === 0) return cloneWorkflowSteps(list)
  if (!getWorkflowStepAtPath(steps, parentPath)) return cloneWorkflowSteps(steps)
  return updateListAt(steps, parentPath, () => cloneWorkflowSteps(list))
}

export function buildWorkflowDesignerNodes(
  list: readonly WorkflowTimelineStep[],
  parentPath: WorkflowDesignerPath = []
): WorkflowDesignerNode[] {
  return list.map((step, index) => {
    const path = [...parentPath, step.key]
    const children = step.children ?? EMPTY_WORKFLOW_DESIGNER_STEPS
    const actorNames = workflowDesignerActorNames(step)
    return {
      key: step.key,
      path,
      step,
      kind: resolveWorkflowStepKind(step),
      signMode: resolveWorkflowSignMode(step),
      title: step.title ?? step.label ?? '',
      actorName: actorNames.join(', '),
      actorNames,
      index,
      canMoveUp: index > 0,
      canMoveDown: index < list.length - 1,
      children: buildWorkflowDesignerNodes(children, path)
    }
  })
}

export function findWorkflowDesignerNode(
  nodes: readonly WorkflowDesignerNode[],
  path: WorkflowDesignerPath | undefined
): WorkflowDesignerNode | undefined {
  if (!path || path.length === 0) return undefined
  for (const node of nodes) {
    if (workflowDesignerPathKey(node.path) === workflowDesignerPathKey(path)) return node
    const nested = findWorkflowDesignerNode(node.children, path)
    if (nested) return nested
  }
  return undefined
}

export function cloneWorkflowDesignerActors(
  step: Pick<WorkflowTimelineStep, 'actor' | 'actors'> | undefined
): WorkflowTimelineActor[] {
  return resolveWorkflowStepActors(step).map((actor) => ({ ...actor }))
}

export function workflowDesignerCardClassName(selected: boolean): string {
  return classNames(
    workflowDesignerCardClasses,
    selected ? workflowDesignerCardSelectedClasses : null
  )
}

export function workflowDesignerKindOptions(
  labels?: Partial<{
    kindStart?: string
    kindApprove?: string
    kindCc?: string
    kindCondition?: string
    kindEnd?: string
  }>
): Array<{ value: WorkflowStepKind; label: string }> {
  return WORKFLOW_STEP_KINDS.map((kind) => ({
    value: kind,
    label: workflowStepKindLabel(kind, labels)
  }))
}

export function workflowDesignerTabClassName(selected: boolean): string {
  return classNames(
    workflowDesignerTabClasses,
    selected ? workflowDesignerTabSelectedClasses : null
  )
}

export function workflowDesignerInspectorTabLabel(
  tab: WorkflowDesignerInspectorTab,
  labels: Pick<
    TigerLocaleWorkflowDesigner,
    'tabApprovers' | 'tabButtons' | 'tabFieldPermissions' | 'tabAdvanced'
  >
): string {
  if (tab === 'approvers') return labels.tabApprovers ?? 'Approvers'
  if (tab === 'buttons') return labels.tabButtons ?? 'Actions'
  if (tab === 'fieldPermissions') return labels.tabFieldPermissions ?? 'Form permissions'
  return labels.tabAdvanced ?? 'Advanced'
}

export function workflowDesignerInspectorTabEnabled(
  tab: WorkflowDesignerInspectorTab,
  kind: WorkflowStepKind
): boolean {
  if (kind === 'condition' || kind === 'end') return tab === 'advanced'
  if (kind === 'cc') return tab !== 'buttons'
  return true
}

export function workflowDesignerDefaultInspectorTab(
  kind: WorkflowStepKind
): WorkflowDesignerInspectorTab {
  return workflowDesignerInspectorTabEnabled('approvers', kind) ? 'approvers' : 'advanced'
}

function uniqueDesignerKey(used: Set<string>, seed?: string): string {
  const base = seed && seed.trim() !== '' ? `${seed}-copy` : 'step'
  if (!used.has(base)) return base
  let next = 1
  while (used.has(`${base}-${next}`)) next += 1
  return `${base}-${next}`
}

function remapWorkflowStepKeys(
  step: WorkflowTimelineStep,
  used: Set<string>
): WorkflowTimelineStep {
  const key = uniqueDesignerKey(used, step.key)
  used.add(key)
  const next = cloneStep(step)
  next.key = key
  if (step.children && step.children.length > 0) {
    next.children = step.children.map((child) => remapWorkflowStepKeys(child, used))
  }
  return next
}

export function cloneWorkflowDesignerStepWithNewKeys(
  step: WorkflowTimelineStep,
  existing: readonly WorkflowTimelineStep[] | undefined = EMPTY_WORKFLOW_DESIGNER_STEPS
): WorkflowTimelineStep {
  return remapWorkflowStepKeys(step, collectWorkflowStepKeys(existing))
}

export function duplicateWorkflowStepAfterPath(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath
): WorkflowTimelineStep[] {
  const source = getWorkflowStepAtPath(steps, path)
  if (!source || path.length === 0) return cloneWorkflowSteps(steps)
  const copy = cloneWorkflowDesignerStepWithNewKeys(source, steps)
  return insertWorkflowStepAfterPath(steps, path, copy)
}

export function createWorkflowDesignerPaletteStep(
  existing: readonly WorkflowTimelineStep[] | undefined,
  kind: WorkflowStepKind,
  labels?: Partial<TigerLocaleWorkflowTimeline & TigerLocaleWorkflowDesigner>
): WorkflowTimelineStep {
  const title = workflowStepKindLabel(kind, labels)
  if (kind !== 'condition') {
    return createWorkflowDesignerStep(existing, { kind, title })
  }
  const branchTitle = labels?.branchLabel || 'Branch'
  const first = createWorkflowDesignerStep(existing, {
    kind: 'approve',
    title: `${branchTitle} 1`,
    expression: ''
  })
  const second = createWorkflowDesignerStep([...(existing ?? []), first], {
    kind: 'approve',
    title: `${branchTitle} 2`,
    expression: ''
  })
  return createWorkflowDesignerStep([...(existing ?? []), first, second], {
    kind,
    title,
    children: [first, second]
  })
}

export function insertWorkflowDesignerPaletteStep(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath,
  kind: WorkflowStepKind,
  labels?: Partial<TigerLocaleWorkflowTimeline & TigerLocaleWorkflowDesigner>
): { steps: WorkflowTimelineStep[]; path: string[] } {
  const created = createWorkflowDesignerPaletteStep(steps, kind, labels)
  if (path.length === 0) {
    const next = insertWorkflowStepAtPath(steps, [], created)
    return { steps: next, path: [created.key] }
  }
  const next = insertWorkflowStepAfterPath(steps, path, created)
  return { steps: next, path: [...path.slice(0, -1), created.key] }
}

function approverSourceIsResolvable(source: ApproverSource): boolean {
  if (source.type === 'fixed') {
    return source.actors.some((actor) => Boolean(actor.id || actor.name))
  }
  if (source.type === 'role' || source.type === 'group') return Boolean(source.key)
  return true
}

function workflowDesignerHasApprovers(step: WorkflowTimelineStep): boolean {
  const sources = listApproverSources(step.approverPolicy)
  if (sources.some(approverSourceIsResolvable)) return true
  return resolveWorkflowStepActors(step).some((actor) => Boolean(actor.id || actor.name))
}

function workflowDesignerEmptyApproverBlocks(step: WorkflowTimelineStep): boolean {
  const policy = step.advanced?.emptyApprover ?? 'pause'
  return policy === 'pause'
}

export function validateWorkflowDesigner(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowDesignerIssue[] {
  const issues: WorkflowDesignerIssue[] = []
  let hasStart = false
  let hasEnd = false

  const visit = (
    list: readonly WorkflowTimelineStep[],
    parentPath: string[],
    parentKind?: WorkflowStepKind
  ): void => {
    for (const step of list) {
      const path = [...parentPath, step.key]
      const kind = resolveWorkflowStepKind(step)
      if (kind === 'start') hasStart = true
      if (kind === 'end') hasEnd = true
      if (kind === 'approve' && parentKind !== 'condition') {
        if (!workflowDesignerHasApprovers(step) && workflowDesignerEmptyApproverBlocks(step)) {
          issues.push({ code: 'empty_approvers', path, blocking: true })
        }
        const buttons = step.buttonPolicy?.buttons
        if (buttons && buttons.length > 0 && buttons.every((button) => !button.enabled)) {
          issues.push({ code: 'buttons_all_disabled', path, blocking: true })
        }
      }
      if (kind === 'condition' && (!step.children || step.children.length === 0)) {
        issues.push({ code: 'missing_branches', path, blocking: true })
      }
      if (step.children && step.children.length > 0) visit(step.children, path, kind)
    }
  }

  visit(steps ?? [], [])
  if (!hasEnd) issues.unshift({ code: 'missing_end', path: [], blocking: true })
  if (!hasStart) issues.unshift({ code: 'missing_start', path: [], blocking: true })
  return issues
}

export function workflowDesignerBlockingIssues(
  issues: readonly WorkflowDesignerIssue[]
): WorkflowDesignerIssue[] {
  return issues.filter((issue) => issue.blocking)
}

export function workflowDesignerIssueMessage(
  issue: WorkflowDesignerIssue,
  labels: Pick<
    TigerLocaleWorkflowDesigner,
    | 'validationMissingStart'
    | 'validationMissingEnd'
    | 'validationEmptyApprovers'
    | 'validationMissingBranches'
    | 'validationButtonsAllDisabled'
  >
): string {
  if (issue.code === 'missing_start') return labels.validationMissingStart ?? 'Add a start node'
  if (issue.code === 'missing_end') return labels.validationMissingEnd ?? 'Add an end node'
  if (issue.code === 'empty_approvers') {
    return labels.validationEmptyApprovers ?? 'This approval node has no approvers'
  }
  if (issue.code === 'missing_branches') {
    return labels.validationMissingBranches ?? 'This condition node has no branches'
  }
  return labels.validationButtonsAllDisabled ?? 'All action buttons are disabled'
}

export function workflowDesignerApproverSourceFromStep(step: WorkflowTimelineStep): ApproverSource {
  const existing = listApproverSources(step.approverPolicy)[0]
  if (existing) return existing
  const actors = resolveWorkflowStepActors(step)
    .filter((actor) => actor.id != null || (typeof actor.name === 'string' && actor.name !== ''))
    .map((actor) => ({
      id: String(actor.id ?? actor.name ?? ''),
      name: actor.name
    }))
  return { type: 'fixed', actors }
}

export function workflowDesignerApproverSourceOfType(
  type: ApproverSource['type'],
  previous?: ApproverSource
): ApproverSource {
  if (type === 'fixed') {
    return {
      type: 'fixed',
      actors: previous?.type === 'fixed' ? previous.actors.map((actor) => ({ ...actor })) : []
    }
  }
  if (type === 'self') return { type: 'self' }
  if (type === 'starter_pick') {
    return previous?.type === 'starter_pick' ? { ...previous } : { type: 'starter_pick' }
  }
  if (type === 'role') {
    return {
      type: 'role',
      key: previous && 'key' in previous ? String(previous.key ?? '') : ''
    }
  }
  if (type === 'group') {
    return {
      type: 'group',
      key: previous && 'key' in previous ? String(previous.key ?? '') : ''
    }
  }
  if (type === 'dept_leader') {
    return {
      type: 'dept_leader',
      level: previous?.type === 'dept_leader' ? previous.level : 1
    }
  }
  return {
    type: 'manager_chain',
    upTo: previous?.type === 'manager_chain' ? previous.upTo : 1
  }
}

export function workflowDesignerApproverSummary(
  step: WorkflowTimelineStep,
  labels?: Partial<TigerLocaleWorkflowDesigner>
): string {
  const source = listApproverSources(step.approverPolicy)[0]
  if (source) {
    if (source.type === 'fixed') {
      return source.actors
        .map((actor) => actor.name || actor.id)
        .filter((name) => name != null && String(name).trim() !== '')
        .join(', ')
    }
    if (source.type === 'self') return labels?.sourceSelf ?? 'Submitter'
    if (source.type === 'starter_pick') return labels?.sourceStarterPick ?? 'Submitter picks'
    if (source.type === 'role') {
      const prefix = labels?.sourceRole ?? 'Role'
      return source.key ? `${prefix}: ${source.key}` : prefix
    }
    if (source.type === 'group') {
      const prefix = labels?.sourceGroup ?? 'Group'
      return source.key ? `${prefix}: ${source.key}` : prefix
    }
    if (source.type === 'dept_leader') return labels?.sourceDeptLeader ?? 'Department leader'
    return labels?.sourceManagerChain ?? 'Manager chain'
  }
  return workflowDesignerActorNames(step).join(', ')
}

export function workflowDesignerEditableButtonPolicy(
  step: WorkflowTimelineStep
): WorkflowNodeButtonPolicy {
  if (step.buttonPolicy?.buttons && step.buttonPolicy.buttons.length > 0) {
    return {
      ...step.buttonPolicy,
      buttons: step.buttonPolicy.buttons.map((button) => ({ ...button })),
      addsign: step.buttonPolicy.addsign
        ? { positions: [...step.buttonPolicy.addsign.positions] }
        : step.buttonPolicy.addsign
    }
  }
  if (resolveWorkflowStepKind(step) === 'start') {
    return {
      buttons: [
        { action: 'cancel', enabled: true, placement: 'bar' },
        { action: 'comment', enabled: true, placement: 'bar' }
      ]
    }
  }
  return createFullWorkflowButtonPolicy()
}

export function patchWorkflowDesignerButton(
  policy: WorkflowNodeButtonPolicy,
  action: WorkflowTimelineAction,
  patch: Partial<WorkflowButtonConfig>
): WorkflowNodeButtonPolicy {
  const buttons = policy.buttons.map((button) =>
    button.action === action ? { ...button, ...patch, action } : { ...button }
  )
  const has = buttons.some((button) => button.action === action)
  return {
    ...policy,
    buttons: has ? buttons : [...buttons, { action, enabled: true, ...patch }]
  }
}

export function resolveWorkflowDesignerFieldPermission(
  kind: WorkflowStepKind,
  permissions: Record<string, FieldPermission> | undefined,
  fieldPath: string
): FieldPermission {
  const current = permissions?.[fieldPath]
  if (current === 'editable' || current === 'readonly' || current === 'hidden') return current
  return kind === 'start' ? 'editable' : 'readonly'
}

export function workflowDesignerFieldPermissionRows(
  schema: SchemaFormSchema | undefined,
  step: WorkflowTimelineStep
): WorkflowDesignerFieldPermissionRow[] {
  const kind = resolveWorkflowStepKind(step)
  return flattenSchemaFormFields(schema).map((field) => ({
    name: field.name,
    label: field.label || field.name,
    permission: resolveWorkflowDesignerFieldPermission(kind, step.fieldPermissions, field.name)
  }))
}

export function applyWorkflowDesignerFieldPermissionColumn(
  schema: SchemaFormSchema | undefined,
  permissions: Record<string, FieldPermission> | undefined,
  permission: FieldPermission
): Record<string, FieldPermission> {
  const next: Record<string, FieldPermission> = { ...permissions }
  for (const field of flattenSchemaFormFields(schema)) {
    next[field.name] = permission
  }
  return next
}

export function workflowDesignerAdvancedFromStep(step: WorkflowTimelineStep): WorkflowNodeAdvanced {
  return {
    emptyApprover: step.advanced?.emptyApprover,
    autoDecide: step.advanced?.autoDecide ?? 'manual',
    timeout: step.advanced?.timeout
      ? { ...step.advanced.timeout }
      : { action: 'remind', durationLabel: '' },
    returnResume: step.advanced?.returnResume
  }
}

export function workflowDesignerApproverSourceOptions(
  labels?: Partial<TigerLocaleWorkflowDesigner>
): Array<{ value: ApproverSource['type']; label: string }> {
  return WORKFLOW_APPROVER_SOURCE_TYPES.map((type) => {
    if (type === 'fixed') return { value: type, label: labels?.sourceFixed ?? 'Specified members' }
    if (type === 'self') return { value: type, label: labels?.sourceSelf ?? 'Submitter' }
    if (type === 'starter_pick') {
      return { value: type, label: labels?.sourceStarterPick ?? 'Submitter picks' }
    }
    if (type === 'role') return { value: type, label: labels?.sourceRole ?? 'Role' }
    if (type === 'group') return { value: type, label: labels?.sourceGroup ?? 'Group' }
    if (type === 'dept_leader') {
      return { value: type, label: labels?.sourceDeptLeader ?? 'Department leader' }
    }
    return { value: type, label: labels?.sourceManagerChain ?? 'Manager chain' }
  })
}

export function workflowDesignerEmptyApproverOptions(
  labels?: Partial<TigerLocaleWorkflowTimeline>
): Array<{ value: WorkflowEmptyApprover; label: string }> {
  return WORKFLOW_EMPTY_APPROVERS.map((value) => {
    if (value === 'skip_pass') {
      return { value, label: labels?.emptyApproverSkipPass ?? 'Skip and pass' }
    }
    if (value === 'pause') return { value, label: labels?.emptyApproverPause ?? 'Pause' }
    if (value === 'transfer_admin') {
      return { value, label: labels?.emptyApproverTransferAdmin ?? 'Transfer to admin' }
    }
    return { value, label: labels?.emptyApproverTransferUser ?? 'Transfer to user' }
  })
}

export function workflowDesignerAutoDecideOptions(
  labels?: Partial<TigerLocaleWorkflowTimeline>
): Array<{ value: WorkflowAutoDecide; label: string }> {
  return WORKFLOW_AUTO_DECIDES.map((value) => {
    if (value === 'auto_pass') return { value, label: labels?.autoDecideAutoPass ?? 'Auto-approve' }
    if (value === 'auto_reject') {
      return { value, label: labels?.autoDecideAutoReject ?? 'Auto-reject' }
    }
    return { value, label: labels?.autoDecideManual ?? 'Manual' }
  })
}

export function workflowDesignerTimeoutActionOptions(
  labels?: Partial<TigerLocaleWorkflowDesigner & TigerLocaleWorkflowTimeline>
): Array<{ value: WorkflowTimeoutAction; label: string }> {
  return WORKFLOW_TIMEOUT_ACTIONS.map((value) => {
    if (value === 'auto_pass') return { value, label: labels?.autoDecideAutoPass ?? 'Auto-approve' }
    if (value === 'auto_reject') {
      return { value, label: labels?.autoDecideAutoReject ?? 'Auto-reject' }
    }
    if (value === 'transfer') return { value, label: labels?.actionTransfer ?? 'Transfer' }
    return { value, label: labels?.timeoutRemind ?? 'Remind' }
  })
}

export function workflowDesignerActionLabel(
  action: WorkflowTimelineAction,
  labels?: Partial<TigerLocaleWorkflowTimeline>
): string {
  if (action === 'reject') return labels?.actionReject ?? 'Reject'
  if (action === 'transfer') return labels?.actionTransfer ?? 'Transfer'
  if (action === 'cancel') return labels?.actionCancel ?? 'Withdraw'
  if (action === 'comment') return labels?.actionComment ?? 'Comment'
  if (action === 'addsign') return labels?.actionAddsign ?? 'Add approver'
  if (action === 'return') return labels?.actionReturn ?? 'Return'
  if (action === 'request_changes') return labels?.actionRequestChanges ?? 'Request changes'
  return labels?.actionApprove ?? 'Approve'
}

export function workflowDesignerFieldPermissionLabel(
  permission: FieldPermission,
  labels?: Partial<TigerLocaleWorkflowTimeline>
): string {
  if (permission === 'readonly') return labels?.fieldReadonly ?? 'Read-only'
  if (permission === 'hidden') return labels?.fieldHidden ?? 'Hidden'
  return labels?.fieldEditable ?? 'Editable'
}

export function actorsFromApproverSource(
  source: ApproverSource
): WorkflowTimelineActor[] | undefined {
  if (source.type !== 'fixed') return undefined
  if (source.actors.length === 0) return undefined
  return source.actors.map((actor) => ({ id: actor.id, name: actor.name }))
}

export function workflowDesignerSignModeOptions(
  labels?: Partial<{ signSequential?: string; signCountersign?: string; signOrsign?: string }>
): Array<{ value: WorkflowSignMode; label: string }> {
  return WORKFLOW_SIGN_MODES.map((mode) => ({
    value: mode,
    label: workflowSignModeLabel(mode, labels)
  }))
}
