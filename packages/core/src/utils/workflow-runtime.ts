/**
 * Pure workflow runtime: task-level state transitions without I/O or org lookup.
 * Not a BPM engine — JSON-tree + tasks only.
 */

import type {
  ApproverSource,
  FieldPermission,
  WorkflowAddsignPosition,
  WorkflowButtonConfig,
  WorkflowInstance,
  WorkflowInstanceStatus,
  WorkflowNodeButtonPolicy,
  WorkflowPendingAfterAddsign,
  WorkflowReturnResume,
  WorkflowReturnTarget,
  WorkflowRuntimeAction,
  WorkflowTask,
  WorkflowTaskStatus,
  WorkflowTimelineAction,
  WorkflowTimelineActor,
  WorkflowTimelineStep
} from '../types/workflow-timeline'
import {
  getCurrentWorkflowStep,
  isWorkflowTimelineStepStatus,
  resolveWorkflowSignMode,
  resolveWorkflowStepActors,
  resolveWorkflowStepKind,
  resolveWorkflowStepStatus
} from './workflow-timeline-utils'

export const WORKFLOW_FIELD_PERMISSIONS: readonly FieldPermission[] = [
  'editable',
  'readonly',
  'hidden'
]

export const WORKFLOW_TASK_STATUSES: readonly WorkflowTaskStatus[] = [
  'pending',
  'active',
  'approved',
  'rejected',
  'canceled',
  'blocked'
]

export const DEFAULT_WORKFLOW_BUTTONS: WorkflowButtonConfig[] = [
  { action: 'approve', enabled: true, placement: 'bar' },
  { action: 'reject', enabled: true, placement: 'bar', commentRequired: true },
  { action: 'transfer', enabled: true, placement: 'bar' },
  { action: 'cancel', enabled: true, placement: 'bar' },
  { action: 'comment', enabled: true, placement: 'bar' }
]

/**
 * Complete 2.5.0 action set for demos. Not the omitted-policy 2.4.2 default.
 * `request_changes` is on `more` so the full set is visible without crowding.
 */
export const FULL_WORKFLOW_BUTTONS: WorkflowButtonConfig[] = [
  { action: 'approve', enabled: true, placement: 'bar' },
  { action: 'reject', enabled: true, placement: 'bar', commentRequired: true },
  { action: 'transfer', enabled: true, placement: 'more' },
  { action: 'addsign', enabled: true, placement: 'more' },
  { action: 'return', enabled: true, placement: 'more', commentRequired: true },
  { action: 'cancel', enabled: true, placement: 'bar' },
  { action: 'comment', enabled: true, placement: 'bar' },
  { action: 'request_changes', enabled: true, placement: 'more', commentRequired: true }
]

export function createFullWorkflowButtonPolicy(
  overrides?: Partial<WorkflowNodeButtonPolicy>
): WorkflowNodeButtonPolicy {
  return {
    buttons: (overrides?.buttons ?? FULL_WORKFLOW_BUTTONS).map((button) => ({ ...button })),
    addsign: overrides?.addsign ?? { positions: ['before', 'after'] },
    returnResume: overrides?.returnResume ?? 'resequence'
  }
}

const TERMINAL_INSTANCE = new Set<string>(['approved', 'rejected', 'canceled'])
const OPEN_TASK = new Set<WorkflowTaskStatus>(['pending', 'active'])
const APPROVER_SOURCE_TYPES = new Set<ApproverSource['type']>([
  'fixed',
  'self',
  'starter_pick',
  'role',
  'group',
  'dept_leader',
  'manager_chain'
])

export function isFieldPermission(value: unknown): value is FieldPermission {
  return value === 'editable' || value === 'readonly' || value === 'hidden'
}

export function isApproverSource(value: unknown): value is ApproverSource {
  if (typeof value !== 'object' || value == null || !('type' in value)) return false
  return APPROVER_SOURCE_TYPES.has((value as ApproverSource).type)
}

export function listApproverSources(
  policy: ApproverSource | ApproverSource[] | undefined
): ApproverSource[] {
  if (!policy) return []
  return Array.isArray(policy)
    ? policy.filter(isApproverSource)
    : isApproverSource(policy)
      ? [policy]
      : []
}

export function workflowInstanceUsesTasks(instance: Pick<WorkflowInstance, 'tasks'>): boolean {
  return Array.isArray(instance.tasks)
}

export function resolveWorkflowButtonPolicy(
  step: Pick<WorkflowTimelineStep, 'buttonPolicy'> | undefined
): WorkflowNodeButtonPolicy {
  const policy = step?.buttonPolicy
  if (policy && Array.isArray(policy.buttons) && policy.buttons.length > 0) return policy
  return { buttons: DEFAULT_WORKFLOW_BUTTONS.map((button) => ({ ...button })) }
}

export function workflowButtonCommentRequired(
  step: Pick<WorkflowTimelineStep, 'buttonPolicy'> | undefined,
  action: WorkflowTimelineAction
): boolean {
  const button = resolveWorkflowButtonPolicy(step).buttons.find((item) => item.action === action)
  if (button?.commentRequired != null) return button.commentRequired
  return action === 'reject' || action === 'return' || action === 'request_changes'
}

/**
 * Confirm-layer intercept: empty comment fails when required.
 * The reducer itself does not block; ActionBar (s2) calls this before submit.
 */
export function assertWorkflowActionComment(
  comment: string | undefined,
  commentRequired?: boolean
): boolean {
  if (!commentRequired) return true
  return comment != null && comment.trim() !== ''
}

export function cloneWorkflowInstance(instance: WorkflowInstance): WorkflowInstance {
  const next: WorkflowInstance = {
    ...instance,
    steps: instance.steps.map(cloneRuntimeStep),
    formValues: instance.formValues ? { ...instance.formValues } : instance.formValues,
    starter: instance.starter ? { ...instance.starter } : instance.starter,
    cursor: instance.cursor ? { ...instance.cursor } : instance.cursor,
    history: instance.history?.map((entry) => ({ ...entry }))
  }
  if (instance.tasks) {
    next.tasks = instance.tasks.map(cloneTask)
  }
  return next
}

function cloneTask(task: WorkflowTask): WorkflowTask {
  return { ...task, assignee: { ...task.assignee } }
}

function cloneRuntimeStep(step: WorkflowTimelineStep): WorkflowTimelineStep {
  const next: WorkflowTimelineStep = { ...step }
  if (step.actor) next.actor = { ...step.actor }
  if (step.actors) next.actors = step.actors.map((actor) => ({ ...actor }))
  if (step.children) next.children = step.children.map(cloneRuntimeStep)
  if (step.tasks) next.tasks = step.tasks.map(cloneTask)
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
      ? step.approverPolicy.map(cloneApproverSource)
      : cloneApproverSource(step.approverPolicy)
  }
  if (step.advanced) {
    next.advanced = {
      ...step.advanced,
      timeout: step.advanced.timeout ? { ...step.advanced.timeout } : step.advanced.timeout
    }
  }
  if (step.origin) next.origin = { ...step.origin }
  if (step.pendingAfterAddsign) {
    next.pendingAfterAddsign = clonePendingAfter(step.pendingAfterAddsign)
  }
  return next
}

function cloneApproverSource(source: ApproverSource): ApproverSource {
  if (source.type === 'fixed') {
    return { type: 'fixed', actors: source.actors.map((actor) => ({ ...actor })) }
  }
  return { ...source }
}

function clonePendingAfter(pending: WorkflowPendingAfterAddsign): WorkflowPendingAfterAddsign {
  return {
    ...pending,
    assignees: pending.assignees.map((actor) => ({ ...actor }))
  }
}

export function findWorkflowStepByKey(
  steps: readonly WorkflowTimelineStep[] | undefined,
  key: string | undefined
): WorkflowTimelineStep | undefined {
  if (!steps || key == null) return undefined
  for (const step of steps) {
    if (step.key === key) return step
    const nested = findWorkflowStepByKey(step.children, key)
    if (nested) return nested
  }
  return undefined
}

function flattenRuntimeSteps(steps: readonly WorkflowTimelineStep[]): WorkflowTimelineStep[] {
  const result: WorkflowTimelineStep[] = []
  const visit = (list: readonly WorkflowTimelineStep[]): void => {
    for (const step of list) {
      result.push(step)
      if (step.children && step.children.length > 0) visit(step.children)
    }
  }
  visit(steps)
  return result
}

function actorIdOf(actor: Pick<WorkflowTimelineActor, 'id'> | undefined): string | undefined {
  if (actor?.id == null) return undefined
  return String(actor.id)
}

function sameActorId(left: unknown, right: unknown): boolean {
  if (left == null || right == null) return false
  return String(left) === String(right)
}

function isOpenTask(task: Pick<WorkflowTask, 'status'>): boolean {
  return OPEN_TASK.has(task.status)
}

function patchStep(
  draft: WorkflowInstance,
  key: string,
  update: (step: WorkflowTimelineStep) => WorkflowTimelineStep
): void {
  const apply = (list: WorkflowTimelineStep[]): WorkflowTimelineStep[] =>
    list.map((step) => {
      if (step.key === key) return update(step)
      if (step.children && step.children.length > 0) {
        const children = apply(step.children)
        if (children !== step.children) return { ...step, children }
      }
      return step
    })
  draft.steps = apply(draft.steps)
}

function insertRelative(
  steps: WorkflowTimelineStep[],
  targetKey: string,
  node: WorkflowTimelineStep,
  position: WorkflowAddsignPosition
): WorkflowTimelineStep[] | null {
  const index = steps.findIndex((step) => step.key === targetKey)
  if (index >= 0) {
    const next = [...steps]
    next.splice(position === 'before' ? index : index + 1, 0, node)
    return next
  }
  let found = false
  const mapped = steps.map((step) => {
    if (!step.children || step.children.length === 0) return step
    const children = insertRelative(step.children, targetKey, node, position)
    if (!children) return step
    if (children === step.children) return step
    found = true
    return { ...step, children }
  })
  return found ? mapped : null
}

function nodeTasks(draft: WorkflowInstance, nodeKey: string): WorkflowTask[] {
  return (draft.tasks ?? []).filter((task) => task.nodeKey === nodeKey)
}

function replaceNodeTasks(draft: WorkflowInstance, nodeKey: string, next: WorkflowTask[]): void {
  const rest = (draft.tasks ?? []).filter((task) => task.nodeKey !== nodeKey)
  draft.tasks = [...rest, ...next]
}

function patchTask(
  draft: WorkflowInstance,
  taskId: string,
  update: (task: WorkflowTask) => WorkflowTask
): void {
  draft.tasks = (draft.tasks ?? []).map((task) => (task.id === taskId ? update(task) : task))
}

function seedTasksForNode(
  node: WorkflowTimelineStep,
  origin: WorkflowTask['origin'] = 'definition'
): WorkflowTask[] {
  const actors = resolveWorkflowStepActors(node)
  const signMode = resolveWorkflowSignMode(node)
  return actors.map((actor, index) => ({
    id: `${node.key}:${actorIdOf(actor) ?? index}`,
    nodeKey: node.key,
    assignee: { ...actor },
    status: (signMode === 'sequential' && index === 0 ? 'active' : 'pending') as WorkflowTaskStatus,
    origin
  }))
}

function uniqueKey(steps: readonly WorkflowTimelineStep[], preferred: string): string {
  const used = new Set(flattenRuntimeSteps(steps).map((step) => step.key))
  if (!used.has(preferred)) return preferred
  let n = 2
  while (used.has(`${preferred}-${n}`)) n += 1
  return `${preferred}-${n}`
}

function stampFrom(action: WorkflowRuntimeAction): string {
  if (action.at && action.at.trim()) return action.at.replace(/[^\w-]+/g, '')
  if (action.actorId != null) return String(action.actorId)
  return 'tmp'
}

function currentNode(
  draft: WorkflowInstance,
  action: WorkflowRuntimeAction
): WorkflowTimelineStep | undefined {
  const key = action.nodeKey ?? draft.cursor?.nodeKey
  if (key) return findWorkflowStepByKey(draft.steps, key)
  return getCurrentWorkflowStep(draft.steps)
}

function currentTask(
  draft: WorkflowInstance,
  node: WorkflowTimelineStep,
  action: WorkflowRuntimeAction
): WorkflowTask | undefined {
  const tasks = nodeTasks(draft, node.key)
  if (action.taskId) return tasks.find((task) => task.id === action.taskId)
  if (action.actorId != null) {
    const match = tasks.find(
      (task) =>
        sameActorId(task.assignee.id, action.actorId) &&
        (isOpenTask(task) || task.status === 'blocked')
    )
    if (match) return match
  }
  const signMode = resolveWorkflowSignMode(node)
  if (signMode === 'sequential') {
    return tasks.find((task) => task.status === 'active') ?? tasks.find(isOpenTask)
  }
  return tasks.find(isOpenTask)
}

function isTaskActionable(
  node: WorkflowTimelineStep,
  task: WorkflowTask,
  allTasks: readonly WorkflowTask[] | undefined
): boolean {
  if (!isOpenTask(task)) return false
  if (resolveWorkflowSignMode(node) !== 'sequential') return true
  if (task.status === 'active') return true
  const open = (allTasks ?? []).filter((item) => item.nodeKey === node.key && isOpenTask(item))
  const active = open.find((item) => item.status === 'active')
  return (active ?? open[0])?.id === task.id
}

function instanceIsTerminal(instance: WorkflowInstance): boolean {
  if (instance.status && TERMINAL_INSTANCE.has(instance.status)) return true
  return false
}

function pushHistory(
  draft: WorkflowInstance,
  action: WorkflowRuntimeAction,
  nodeKey?: string,
  taskId?: string
): void {
  const entry = {
    at: action.at ?? '',
    actorId: action.actorId != null ? String(action.actorId) : '',
    action: action.action,
    nodeKey,
    taskId,
    comment: action.comment
  }
  if (entry.comment == null) delete (entry as { comment?: string }).comment
  if (entry.nodeKey == null) delete (entry as { nodeKey?: string }).nodeKey
  if (entry.taskId == null) delete (entry as { taskId?: string }).taskId
  draft.history = [...(draft.history ?? []), entry]
}

function cancelOpenTasks(draft: WorkflowInstance): void {
  if (!draft.tasks) return
  draft.tasks = draft.tasks.map((task) =>
    isOpenTask(task) || task.status === 'blocked' ? { ...task, status: 'canceled' } : task
  )
}

function syncActorStatuses(draft: WorkflowInstance, nodeKey: string): void {
  const tasks = nodeTasks(draft, nodeKey)
  if (tasks.length === 0) return
  const byId = new Map<string, WorkflowTaskStatus>()
  for (const task of tasks) {
    const id = actorIdOf(task.assignee)
    if (id)
      byId.set(
        id,
        task.status === 'blocked' ? 'pending' : task.status === 'active' ? 'pending' : task.status
      )
  }
  patchStep(draft, nodeKey, (step) => {
    const next: WorkflowTimelineStep = { ...step }
    if (step.actors && step.actors.length > 0) {
      next.actors = step.actors.map((actor) => {
        const id = actorIdOf(actor)
        const status = id ? byId.get(id) : undefined
        return status ? { ...actor, status: toStepStatus(status) } : actor
      })
    }
    if (step.actor) {
      const id = actorIdOf(step.actor)
      const status = id ? byId.get(id) : tasks[0]?.status
      if (status) next.actor = { ...step.actor, status: toStepStatus(status) }
    }
    return next
  })
}

function toStepStatus(status: WorkflowTaskStatus): WorkflowInstanceStatus {
  if (isWorkflowTimelineStepStatus(status)) return status
  return 'pending'
}

function markNode(
  draft: WorkflowInstance,
  nodeKey: string,
  status: WorkflowInstanceStatus,
  extra?: Partial<WorkflowTimelineStep>
): void {
  patchStep(draft, nodeKey, (step) => ({ ...step, ...extra, status }))
}

function nextActionableKey(draft: WorkflowInstance, fromKey: string): string | undefined {
  const flat = flattenRuntimeSteps(draft.steps)
  const index = flat.findIndex((step) => step.key === fromKey)
  if (index < 0) return undefined
  for (let i = index + 1; i < flat.length; i += 1) {
    const step = flat[i]
    if (!step) continue
    const kind = resolveWorkflowStepKind(step)
    const status = resolveWorkflowStepStatus(step)
    if (kind === 'condition') continue
    if (kind === 'cc') return step.key
    if (kind === 'start' || kind === 'approve') {
      if (status === 'pending' || status === 'active') return step.key
    }
  }
  return undefined
}

function enterNode(
  draft: WorkflowInstance,
  nodeKey: string,
  action: WorkflowRuntimeAction,
  depth: number
): void {
  if (depth > 32) return
  const node = findWorkflowStepByKey(draft.steps, nodeKey)
  if (!node) return
  const kind = resolveWorkflowStepKind(node)
  draft.cursor = { nodeKey }
  draft.status = 'active'

  if (kind === 'cc') {
    markNode(draft, nodeKey, 'approved')
    completeNode(draft, nodeKey, action, depth + 1)
    return
  }
  if (kind === 'condition') {
    const child = node.children?.find((item) => {
      const childKind = resolveWorkflowStepKind(item)
      const childStatus = resolveWorkflowStepStatus(item)
      return (
        (childKind === 'approve' || childKind === 'start' || childKind === 'cc') &&
        (childStatus === 'pending' || childStatus === 'active')
      )
    })
    if (child) {
      enterNode(draft, child.key, action, depth + 1)
      return
    }
    completeNode(draft, nodeKey, action, depth + 1)
    return
  }

  const autoDecide = node.advanced?.autoDecide
  if (autoDecide === 'auto_pass') {
    markNode(draft, nodeKey, 'approved', { action: 'approve' })
    completeNode(draft, nodeKey, action, depth + 1)
    return
  }
  if (autoDecide === 'auto_reject') {
    markNode(draft, nodeKey, 'rejected', { action: 'reject', rollbackPoint: true })
    draft.status = 'rejected'
    cancelOpenTasks(draft)
    return
  }

  markNode(draft, nodeKey, 'active')
  if (!workflowInstanceUsesTasks(draft)) return

  let tasks = nodeTasks(draft, nodeKey)
  if (tasks.length === 0) {
    const seeded = seedTasksForNode(node)
    if (seeded.length === 0) {
      const empty = node.advanced?.emptyApprover ?? 'pause'
      if (empty === 'skip_pass') {
        markNode(draft, nodeKey, 'approved')
        completeNode(draft, nodeKey, action, depth + 1)
      }
      return
    }
    replaceNodeTasks(draft, nodeKey, seeded)
    tasks = seeded
  } else {
    const signMode = resolveWorkflowSignMode(node)
    const reset = tasks.map((task, index) => {
      if (task.status === 'approved' || task.status === 'rejected' || task.status === 'canceled') {
        return task
      }
      if (signMode === 'sequential') {
        return { ...task, status: (index === 0 ? 'active' : 'pending') as WorkflowTaskStatus }
      }
      return { ...task, status: 'pending' as WorkflowTaskStatus }
    })
    const open = reset.filter((task) => isOpenTask(task) || task.status === 'blocked')
    if (open.length === 0) {
      const seeded = seedTasksForNode(node, 'return')
      if (seeded.length > 0) {
        replaceNodeTasks(draft, nodeKey, seeded)
      } else {
        markNode(draft, nodeKey, 'approved')
        completeNode(draft, nodeKey, action, depth + 1)
        return
      }
    } else {
      replaceNodeTasks(draft, nodeKey, reset)
    }
  }
  syncActorStatuses(draft, nodeKey)
}

function completeNode(
  draft: WorkflowInstance,
  nodeKey: string,
  action: WorkflowRuntimeAction,
  depth: number
): void {
  if (depth > 32) return
  const node = findWorkflowStepByKey(draft.steps, nodeKey)
  if (!node) return
  markNode(draft, nodeKey, 'approved', { pendingAfterAddsign: undefined })

  if (node.pendingAfterAddsign && node.pendingAfterAddsign.assignees.length > 0) {
    insertAddsignNode(
      draft,
      nodeKey,
      'after',
      node.pendingAfterAddsign.assignees,
      node.pendingAfterAddsign.signMode ?? resolveWorkflowSignMode(node),
      {
        ...action,
        tempNodeKey: node.pendingAfterAddsign.tempNodeKey ?? action.tempNodeKey
      },
      node.pendingAfterAddsign.fromTaskId
    )
    return
  }

  if (node.temporary && node.origin?.type === 'addsign' && node.origin.position === 'before') {
    restoreBeforeAddsign(draft, node.origin.fromNodeKey, node.origin.fromTaskId)
    return
  }

  if (draft.resumeToNodeKey && draft.resumeToNodeKey !== nodeKey) {
    const resumeKey = draft.resumeToNodeKey
    draft.resumeToNodeKey = undefined
    enterNode(draft, resumeKey, action, depth + 1)
    return
  }

  const nextKey = nextActionableKey(draft, nodeKey)
  if (!nextKey) {
    draft.status = 'approved'
    draft.cursor = { nodeKey }
    return
  }
  enterNode(draft, nextKey, action, depth + 1)
}

function restoreBeforeAddsign(
  draft: WorkflowInstance,
  fromNodeKey: string,
  fromTaskId?: string
): void {
  const origin = findWorkflowStepByKey(draft.steps, fromNodeKey)
  markNode(draft, fromNodeKey, 'active')
  draft.cursor = { nodeKey: fromNodeKey }
  draft.status = 'active'
  if (!workflowInstanceUsesTasks(draft) || !fromTaskId) return
  const signMode = resolveWorkflowSignMode(origin)
  patchTask(draft, fromTaskId, (task) => ({
    ...task,
    status: signMode === 'sequential' ? 'active' : 'pending'
  }))
  syncActorStatuses(draft, fromNodeKey)
}

function insertAddsignNode(
  draft: WorkflowInstance,
  relativeKey: string,
  position: WorkflowAddsignPosition,
  assignees: WorkflowTimelineActor[],
  signMode: WorkflowTimelineStep['signMode'],
  action: WorkflowRuntimeAction,
  fromTaskId?: string
): boolean {
  const preferred = action.tempNodeKey || `addsign-${position}-${relativeKey}-${stampFrom(action)}`
  const key = uniqueKey(draft.steps, preferred)
  const temp: WorkflowTimelineStep = {
    key,
    kind: 'approve',
    status: 'active',
    signMode,
    actors: assignees.map((actor) => ({ ...actor, status: 'pending' })),
    temporary: true,
    origin: {
      type: 'addsign',
      position,
      fromNodeKey: relativeKey,
      fromTaskId
    }
  }
  const inserted = insertRelative(draft.steps, relativeKey, temp, position)
  if (!inserted) return false
  draft.steps = inserted
  draft.cursor = { nodeKey: key }
  draft.status = 'active'
  if (workflowInstanceUsesTasks(draft)) {
    draft.tasks = [...(draft.tasks ?? []), ...seedTasksForNode(temp, 'addsign')]
  }
  return true
}

function filterAddsignAssignees(
  assignees: WorkflowTimelineActor[] | undefined,
  operatorId: unknown
): WorkflowTimelineActor[] {
  if (!assignees || assignees.length === 0) return []
  const seen = new Set<string>()
  const next: WorkflowTimelineActor[] = []
  for (const actor of assignees) {
    const id = actorIdOf(actor)
    if (!id || sameActorId(id, operatorId) || seen.has(id)) continue
    seen.add(id)
    next.push({ ...actor })
  }
  return next
}

export function isWorkflowAddsignAfterAllowed(
  node: WorkflowTimelineStep,
  tasks: readonly WorkflowTask[] | undefined,
  operatorTaskId?: string
): boolean {
  const mode = resolveWorkflowSignMode(node)
  const nodeTaskList = (tasks ?? node.tasks ?? []).filter((task) => task.nodeKey === node.key)
  if (mode === 'orsign') {
    const countable = nodeTaskList.filter((task) => task.status !== 'canceled')
    if (countable.length >= 2) return false
    const actors = resolveWorkflowStepActors(node)
    if (!tasks && actors.length >= 2) return false
    return true
  }
  if (mode === 'countersign') {
    if (nodeTaskList.length === 0) return true
    const open = nodeTaskList.filter(isOpenTask)
    if (open.length !== 1) return false
    if (operatorTaskId) return open[0]?.id === operatorTaskId
    return true
  }
  return true
}

function eligibleReturnNode(step: WorkflowTimelineStep, currentKey: string): boolean {
  if (step.key === currentKey) return false
  const kind = resolveWorkflowStepKind(step)
  if (kind === 'cc' || kind === 'condition') return false
  if (step.temporary && resolveWorkflowStepStatus(step) !== 'approved') return false
  if (kind === 'start') return true
  return kind === 'approve' && resolveWorkflowStepStatus(step) === 'approved'
}

export function getWorkflowReturnCandidates(instance: WorkflowInstance): WorkflowTimelineStep[] {
  const currentKey = instance.cursor?.nodeKey ?? getCurrentWorkflowStep(instance.steps)?.key
  if (!currentKey) return []
  return flattenRuntimeSteps(instance.steps).filter((step) => eligibleReturnNode(step, currentKey))
}

export function workflowReturnTargetFromStep(step: WorkflowTimelineStep): WorkflowReturnTarget {
  const actors = resolveWorkflowStepActors(step)
  const names = actors
    .map((actor) => actor.name)
    .filter((name): name is string => Boolean(name && name.trim()))
  const target: WorkflowReturnTarget = { key: step.key }
  const title = step.title ?? step.label
  if (title) target.title = title
  target.kind = resolveWorkflowStepKind(step)
  if (names.length > 0) target.actorName = names.join(', ')
  target.status = resolveWorkflowStepStatus(step)
  return target
}

/**
 * Presentational return-picker rows. Uses the same eligibility as the reducer.
 */
export function listWorkflowReturnTargets(
  steps: readonly WorkflowTimelineStep[] | undefined,
  currentKey?: string
): WorkflowReturnTarget[] {
  if (!steps || steps.length === 0) return []
  const cursorKey = currentKey ?? getCurrentWorkflowStep(steps)?.key
  if (!cursorKey) return []
  return getWorkflowReturnCandidates({ steps: [...steps], cursor: { nodeKey: cursorKey } }).map(
    workflowReturnTargetFromStep
  )
}

function resetNodeForReturn(
  draft: WorkflowInstance,
  nodeKey: string,
  origin: WorkflowTask['origin']
): void {
  const node = findWorkflowStepByKey(draft.steps, nodeKey)
  if (!node) return
  patchStep(draft, nodeKey, (step) => ({
    ...step,
    status: 'pending',
    action: undefined,
    comment: undefined,
    rollbackPoint: undefined
  }))
  if (!workflowInstanceUsesTasks(draft)) return
  const existing = nodeTasks(draft, nodeKey)
  const actors =
    existing.length > 0 ? existing.map((task) => task.assignee) : resolveWorkflowStepActors(node)
  const reset: WorkflowTask[] = actors.map((actor, index) => ({
    id: existing[index]?.id ?? `${nodeKey}:${actorIdOf(actor) ?? index}`,
    nodeKey,
    assignee: { ...actor },
    status: 'pending',
    origin
  }))
  replaceNodeTasks(draft, nodeKey, reset)
}

function applyReturn(
  draft: WorkflowInstance,
  action: WorkflowRuntimeAction,
  current: WorkflowTimelineStep
): boolean {
  const targetKey = action.targetNodeKey
  if (!targetKey || targetKey === current.key) return false
  const candidates = getWorkflowReturnCandidates({ ...draft, cursor: { nodeKey: current.key } })
  if (!candidates.some((step) => step.key === targetKey)) return false
  const resume: WorkflowReturnResume =
    action.resume ??
    current.buttonPolicy?.returnResume ??
    current.advanced?.returnResume ??
    'resequence'
  const flat = flattenRuntimeSteps(draft.steps)
  const targetIndex = flat.findIndex((step) => step.key === targetKey)
  const currentIndex = flat.findIndex((step) => step.key === current.key)
  if (targetIndex < 0 || currentIndex < 0 || targetIndex >= currentIndex) return false

  if (resume === 'direct') {
    draft.resumeToNodeKey = current.key
    resetNodeForReturn(draft, targetKey, 'return')
  } else {
    draft.resumeToNodeKey = undefined
    for (let i = targetIndex; i <= currentIndex; i += 1) {
      const step = flat[i]
      if (!step) continue
      const kind = resolveWorkflowStepKind(step)
      if (kind === 'condition') continue
      resetNodeForReturn(draft, step.key, 'return')
    }
  }
  enterNode(draft, targetKey, action, 0)
  return true
}

function applyApproveTask(
  draft: WorkflowInstance,
  node: WorkflowTimelineStep,
  task: WorkflowTask,
  action: WorkflowRuntimeAction
): boolean {
  if (!isTaskActionable(node, task, draft.tasks)) return false
  patchTask(draft, task.id, (item) => ({
    ...item,
    status: 'approved',
    action: 'approve',
    comment: action.comment,
    actedAt: action.at
  }))
  syncActorStatuses(draft, node.key)
  const signMode = resolveWorkflowSignMode(node)
  const remaining = nodeTasks(draft, node.key).filter(isOpenTask)
  if (signMode === 'orsign') {
    draft.tasks = (draft.tasks ?? []).map((item) =>
      item.nodeKey === node.key && isOpenTask(item) ? { ...item, status: 'canceled' } : item
    )
    completeNode(draft, node.key, action, 0)
    return true
  }
  if (signMode === 'sequential') {
    const next = nodeTasks(draft, node.key).find((item) => item.status === 'pending')
    if (next) {
      patchTask(draft, next.id, (item) => ({ ...item, status: 'active' }))
      markNode(draft, node.key, 'active')
      draft.cursor = { nodeKey: node.key }
      return true
    }
    completeNode(draft, node.key, action, 0)
    return true
  }
  if (remaining.length === 0) {
    completeNode(draft, node.key, action, 0)
  } else {
    markNode(draft, node.key, 'active')
    draft.cursor = { nodeKey: node.key }
  }
  return true
}

function applyApproveNode(
  draft: WorkflowInstance,
  node: WorkflowTimelineStep,
  action: WorkflowRuntimeAction
): boolean {
  markNode(draft, node.key, 'approved', {
    action: 'approve',
    comment: action.comment,
    time: action.at
  })
  completeNode(draft, node.key, action, 0)
  return true
}

function applyReject(
  draft: WorkflowInstance,
  node: WorkflowTimelineStep,
  task: WorkflowTask | undefined,
  action: WorkflowRuntimeAction
): boolean {
  if (task) {
    if (!isTaskActionable(node, task, draft.tasks)) return false
    patchTask(draft, task.id, (item) => ({
      ...item,
      status: 'rejected',
      action: 'reject',
      comment: action.comment,
      actedAt: action.at
    }))
  }
  markNode(draft, node.key, 'rejected', {
    action: 'reject',
    comment: action.comment,
    time: action.at,
    rollbackPoint: true
  })
  cancelOpenTasks(draft)
  draft.status = 'rejected'
  draft.cursor = { nodeKey: node.key }
  return true
}

function applyTransfer(
  draft: WorkflowInstance,
  node: WorkflowTimelineStep,
  task: WorkflowTask | undefined,
  action: WorkflowRuntimeAction
): boolean {
  const assignee = action.assignee
  if (!assignee || actorIdOf(assignee) == null) return false
  if (task) {
    if (!isTaskActionable(node, task, draft.tasks)) return false
    if (sameActorId(task.assignee.id, assignee.id)) return false
    patchTask(draft, task.id, (item) => ({
      ...item,
      assignee: { ...assignee },
      origin: 'transfer',
      comment: action.comment,
      actedAt: action.at
    }))
    syncActorStatuses(draft, node.key)
    patchStep(draft, node.key, (step) => {
      const next: WorkflowTimelineStep = { ...step }
      if (step.actor && sameActorId(step.actor.id, task.assignee.id)) {
        next.actor = { ...assignee }
      }
      if (step.actors) {
        next.actors = step.actors.map((actor) =>
          sameActorId(actor.id, task.assignee.id) ? { ...assignee, status: actor.status } : actor
        )
      }
      return next
    })
    draft.cursor = { nodeKey: node.key }
    return true
  }
  patchStep(draft, node.key, (step) => {
    const next: WorkflowTimelineStep = { ...step, actor: { ...assignee } }
    if (step.actors && step.actors.length > 0) {
      const operator = action.actorId
      let replaced = false
      next.actors = step.actors.map((actor) => {
        if (!replaced && (operator == null || sameActorId(actor.id, operator))) {
          replaced = true
          return { ...assignee, status: actor.status }
        }
        return actor
      })
    }
    return next
  })
  draft.cursor = { nodeKey: node.key }
  return true
}

function applyAddsign(
  draft: WorkflowInstance,
  node: WorkflowTimelineStep,
  task: WorkflowTask | undefined,
  action: WorkflowRuntimeAction
): boolean {
  const operatorId = task?.assignee.id ?? action.actorId
  const assignees = filterAddsignAssignees(action.assignees, operatorId)
  if (assignees.length === 0) return false
  const position: WorkflowAddsignPosition = action.position === 'after' ? 'after' : 'before'
  const signMode =
    action.signMode ?? (assignees.length >= 2 ? resolveWorkflowSignMode(node) : 'sequential')
  const tasks = draft.tasks

  if (position === 'after') {
    if (
      resolveWorkflowSignMode(node) === 'orsign' &&
      !isWorkflowAddsignAfterAllowed(node, tasks, task?.id)
    ) {
      return false
    }
    if (task) {
      if (!isTaskActionable(node, task, draft.tasks)) return false
      patchTask(draft, task.id, (item) => ({
        ...item,
        status: 'approved',
        action: 'addsign',
        comment: action.comment,
        actedAt: action.at
      }))
      syncActorStatuses(draft, node.key)
      const stillOpen = nodeTasks(draft, node.key).filter(isOpenTask)
      if (stillOpen.length > 0) {
        patchStep(draft, node.key, (step) => ({
          ...step,
          pendingAfterAddsign: {
            assignees,
            signMode,
            comment: action.comment,
            fromTaskId: task.id,
            tempNodeKey: action.tempNodeKey
          }
        }))
        markNode(draft, node.key, 'active')
        draft.cursor = { nodeKey: node.key }
        return true
      }
      markNode(draft, node.key, 'approved', { action: 'addsign', comment: action.comment })
      return insertAddsignNode(draft, node.key, 'after', assignees, signMode, action, task.id)
    }
    markNode(draft, node.key, 'approved', {
      action: 'addsign',
      comment: action.comment,
      time: action.at
    })
    return insertAddsignNode(draft, node.key, 'after', assignees, signMode, action)
  }

  if (task) {
    if (!isTaskActionable(node, task, draft.tasks)) return false
    patchTask(draft, task.id, (item) => ({
      ...item,
      status: 'blocked',
      action: 'addsign',
      comment: action.comment,
      actedAt: action.at
    }))
    syncActorStatuses(draft, node.key)
    markNode(draft, node.key, 'active')
    return insertAddsignNode(draft, node.key, 'before', assignees, signMode, action, task.id)
  }
  markNode(draft, node.key, 'pending')
  return insertAddsignNode(draft, node.key, 'before', assignees, signMode, action)
}

function applyCancel(
  draft: WorkflowInstance,
  node: WorkflowTimelineStep | undefined,
  action: WorkflowRuntimeAction
): boolean {
  if (draft.starter && action.actorId != null && !sameActorId(draft.starter.id, action.actorId)) {
    return false
  }
  cancelOpenTasks(draft)
  if (node) {
    markNode(draft, node.key, 'canceled', {
      action: 'cancel',
      comment: action.comment,
      time: action.at
    })
  }
  draft.status = 'canceled'
  return true
}

function applyComment(_draft: WorkflowInstance): boolean {
  return true
}

/**
 * Apply one runtime action. Illegal / no-op inputs return the original instance
 * (same reference). Successful transitions return a deep clone.
 */
export function reduceWorkflowAction(
  instance: WorkflowInstance,
  action: WorkflowRuntimeAction
): WorkflowInstance {
  if (!instance?.steps || instance.steps.length === 0) return instance
  if (!action?.action) return instance
  if (instanceIsTerminal(instance) && action.action !== 'comment') return instance

  const draft = cloneWorkflowInstance(instance)
  const node = currentNode(draft, action)
  if (!node && action.action !== 'cancel' && action.action !== 'comment') return instance

  const usesTasks = workflowInstanceUsesTasks(draft)
  const task = node && usesTasks ? currentTask(draft, node, action) : undefined

  let ok = false
  switch (action.action) {
    case 'approve':
      if (!node) break
      ok = usesTasks
        ? task
          ? applyApproveTask(draft, node, task, action)
          : false
        : applyApproveNode(draft, node, action)
      break
    case 'reject':
      if (!node) break
      ok = applyReject(draft, node, usesTasks ? task : undefined, action)
      break
    case 'transfer':
      if (!node) break
      ok = applyTransfer(draft, node, usesTasks ? task : undefined, action)
      break
    case 'addsign':
      if (!node) break
      ok = applyAddsign(draft, node, usesTasks ? task : undefined, action)
      break
    case 'return':
      if (!node) break
      ok = applyReturn(draft, action, node)
      break
    case 'request_changes': {
      const start =
        flattenRuntimeSteps(draft.steps).find(
          (step) => resolveWorkflowStepKind(step) === 'start'
        ) ?? draft.steps[0]
      if (!start || !node) break
      ok = applyReturn(
        draft,
        { ...action, action: 'return', targetNodeKey: start.key, resume: 'direct' },
        node
      )
      break
    }
    case 'cancel':
      ok = applyCancel(draft, node, action)
      break
    case 'comment':
      ok = applyComment(draft)
      break
    default:
      ok = false
  }

  if (!ok) return instance
  pushHistory(draft, action, node?.key, task?.id)
  return draft
}
