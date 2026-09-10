import React, { useMemo, useRef, useState } from 'react'
import {
  assertWorkflowActionComment,
  buildWorkflowActionPayload,
  classNames,
  getWorkflowActionConfirmCopy,
  getWorkflowStepActorsPresentation,
  getWorkflowStepRuntimeChrome,
  getWorkflowTimelineLabels,
  isWorkflowActionBarItemDisabled,
  listWorkflowReturnTargets,
  mergeTigerLocale,
  resolveAddsignPositions,
  resolveWorkflowActionBarItems,
  resolveWorkflowActionButtonProps,
  sortWorkflowActionBarItems,
  resolveWorkflowSignMode,
  resolveWorkflowStepKind,
  shouldConfirmWorkflowAction,
  shouldShowWorkflowActionCommentInput,
  shouldShowWorkflowActions,
  shouldShowWorkflowSignMode,
  splitWorkflowActionBarItems,
  timelineDescriptionClasses,
  timelineLabelClasses,
  workflowActionBarCommentRequired,
  workflowActionBarItemDisabledReason,
  workflowActionNeedsPicker,
  workflowSignModeLabel,
  workflowStepActorCurrentClasses,
  workflowStepActorMetaClasses,
  workflowStepActorProgressClasses,
  workflowStepActorRowClasses,
  workflowStepActorsListClasses,
  workflowStepsToTimelineItems,
  workflowStepStatusColor,
  workflowStepStatusDotClasses,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  workflowTaskRowStatusLabel,
  workflowTimelineOffPathClasses,
  workflowViewerReturnTargetLabelClasses,
  type TimelineItem,
  type TigerLocaleWorkflowTimeline,
  type WorkflowActionBarItem,
  type WorkflowActionBarProps as CoreWorkflowActionBarProps,
  type WorkflowActionPayload,
  type WorkflowAddsignPosition,
  type WorkflowAssigneePickerContext,
  type WorkflowReturnPickerContext,
  type WorkflowReturnTarget,
  type WorkflowStepActorsPresentation,
  type WorkflowTask,
  type WorkflowTimelineActor,
  type WorkflowTimelineItem,
  type WorkflowTimelineProps as CoreWorkflowTimelineProps,
  type WorkflowTimelineStepStatus
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import { Dropdown, DropdownItem, DropdownMenu } from './Dropdown'
import { Popconfirm } from './Popconfirm'
import { Radio } from './Radio'
import { RadioGroup } from './RadioGroup'
import { Tag } from './Tag'
import { Textarea } from './Textarea'
import { Timeline } from './Timeline'

export interface WorkflowActionBarProps
  extends CoreWorkflowActionBarProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  commentInput?: boolean
  commentRequired?: boolean
  onAction?: (item: WorkflowActionBarItem, payload?: WorkflowActionPayload) => void
  renderReturnPicker?: (ctx: WorkflowReturnPickerContext) => React.ReactNode
  renderAssigneePicker?: (ctx: WorkflowAssigneePickerContext) => React.ReactNode
}

export interface WorkflowTimelineProps
  extends
    Omit<CoreWorkflowTimelineProps, 'pendingDot'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  pendingDot?: React.ReactNode
  pendingContent?: React.ReactNode
  commentInput?: boolean
  commentRequired?: boolean
  onAction?: (item: WorkflowActionBarItem, payload?: WorkflowActionPayload) => void
  renderItem?: (item: TimelineItem, index: number) => React.ReactNode
  renderDot?: (item: TimelineItem, options: { pending: boolean }) => React.ReactNode
  renderActions?: (actions: WorkflowActionBarItem[]) => React.ReactNode
  renderReturnPicker?: (ctx: WorkflowReturnPickerContext) => React.ReactNode
  renderAssigneePicker?: (ctx: WorkflowAssigneePickerContext) => React.ReactNode
}

interface ActionDraft {
  comment: string
  targetNodeKey?: string
  position?: WorkflowAddsignPosition
  signMode?: string
  assignee?: WorkflowTimelineActor
  error?: string
}

const workflowTimelineRootClasses = 'flex flex-col gap-4'
const workflowActionBarClasses = 'flex flex-wrap items-center gap-2'
const workflowStepHeaderClasses = 'flex flex-wrap items-center gap-2'
const workflowStepActorClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
const workflowStepCommentClasses = 'text-sm text-[var(--tiger-text-secondary,#4b5563)] mt-1'

function isWorkflowTimelineItem(item: unknown): item is WorkflowTimelineItem {
  return (
    typeof item === 'object' &&
    item != null &&
    'step' in item &&
    'status' in item &&
    typeof (item as WorkflowTimelineItem).status === 'string'
  )
}

function StatusDot({ status }: { status: WorkflowTimelineStepStatus }) {
  return (
    <span
      className={workflowStepStatusDotClasses}
      style={{ backgroundColor: workflowStepStatusColor(status) }}
      aria-hidden="true"
    />
  )
}

function renderWorkflowStepActors(
  presentation: WorkflowStepActorsPresentation,
  labels: Required<TigerLocaleWorkflowTimeline>
) {
  if (presentation.actors.length === 0) return null
  if (!presentation.list) {
    const only = presentation.actors[0]
    if (!only?.name) return null
    return <div className={workflowStepActorClasses}>{only.name}</div>
  }

  return (
    <div className={workflowStepActorsListClasses}>
      {presentation.progressLabel ? (
        <div className={workflowStepActorProgressClasses}>{presentation.progressLabel}</div>
      ) : null}
      {presentation.actors.map((actor) => (
        <div
          key={actor.key}
          className={classNames(
            workflowStepActorRowClasses,
            actor.current ? workflowStepActorCurrentClasses : null
          )}
          data-workflow-current={actor.current ? 'true' : undefined}>
          {actor.avatar ? <Avatar size="sm" src={actor.avatar} alt="" aria-hidden="true" /> : null}
          <StatusDot status={actor.status} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {actor.name ? <span>{actor.name}</span> : null}
              {actor.addsign ? (
                <Tag variant="primary" size="sm" pill>
                  {labels.addsignTag}
                </Tag>
              ) : null}
              {presentation.fromTasks ? (
                <span className={workflowStepActorMetaClasses}>
                  {workflowTaskRowStatusLabel(actor, labels)}
                </span>
              ) : null}
            </div>
            {actor.actedAt ? (
              <div className={workflowStepActorMetaClasses}>{actor.actedAt}</div>
            ) : null}
            {actor.comment ? (
              <div className={workflowStepCommentClasses}>{actor.comment}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function renderStepContent(
  item: WorkflowTimelineItem,
  labels: Required<TigerLocaleWorkflowTimeline>,
  tasks?: WorkflowTask[]
) {
  const step = item.step
  const title = step.title ?? step.label
  const kind = resolveWorkflowStepKind(step)
  const statusLabel = workflowStepStatusLabel(item.status, labels, kind)
  const signMode = resolveWorkflowSignMode(step)
  const showSignMode = shouldShowWorkflowSignMode(kind, signMode)
  const chrome = getWorkflowStepRuntimeChrome(step, labels, {
    onPath: item.onPath,
    returnTarget: item.returnTarget,
    conditionBranch: item.conditionBranch
  })

  return (
    <div
      className={classNames('min-w-0', !item.onPath ? workflowTimelineOffPathClasses : null)}
      data-workflow-path={item.onPath ? 'on' : 'off'}
      data-workflow-addsign={chrome.addsign ? workflowAddsignData(step) : undefined}
      data-workflow-return-target={item.returnTarget ? 'true' : undefined}>
      {step.time ? <div className={timelineLabelClasses}>{step.time}</div> : null}
      <div className={workflowStepHeaderClasses}>
        {title ? <div className={timelineDescriptionClasses}>{title}</div> : null}
        {showSignMode ? (
          <Tag variant="primary" size="sm" pill>
            {workflowSignModeLabel(signMode, labels)}
          </Tag>
        ) : null}
        {chrome.addsignTag ? (
          <Tag variant="primary" size="sm" pill>
            {chrome.addsignTag}
          </Tag>
        ) : null}
        {chrome.addsignPositionLabel ? (
          <Tag variant="default" size="sm" pill>
            {chrome.addsignPositionLabel}
          </Tag>
        ) : null}
        {chrome.branchPathLabel ? (
          <Tag variant={item.onPath ? 'success' : 'default'} size="sm" pill>
            {chrome.branchPathLabel}
          </Tag>
        ) : null}
        <Tag variant={workflowStepStatusTagVariant(item.status)} size="sm" pill>
          {statusLabel}
        </Tag>
      </div>
      {renderWorkflowStepActors(getWorkflowStepActorsPresentation(step, labels, tasks), labels)}
      {step.comment ? <div className={workflowStepCommentClasses}>{step.comment}</div> : null}
      {chrome.returnTargetLabel ? (
        <div className={workflowViewerReturnTargetLabelClasses}>{chrome.returnTargetLabel}</div>
      ) : null}
      {chrome.pendingAfterAddsignLabel ? (
        <div className={workflowStepActorMetaClasses}>{chrome.pendingAfterAddsignLabel}</div>
      ) : null}
    </div>
  )
}

function workflowAddsignData(step: WorkflowTimelineItem['step']): string {
  return step.origin?.position ?? 'true'
}

function emptyDraft(
  item: WorkflowActionBarItem,
  returnTargets: WorkflowReturnTarget[],
  addsignPositions: WorkflowAddsignPosition[]
): ActionDraft {
  const draft: ActionDraft = { comment: '' }
  if (item.action === 'return' && returnTargets[0]) draft.targetNodeKey = returnTargets[0].key
  if (item.action === 'addsign' && addsignPositions[0]) draft.position = addsignPositions[0]
  return draft
}

export const WorkflowActionBar: React.FC<WorkflowActionBarProps> = ({
  items,
  buttonPolicy,
  disabled,
  ariaLabel,
  confirm,
  commentInput,
  commentRequired,
  returnTargets,
  addsignPositions,
  currentSignMode,
  isStarter,
  viewerRole,
  moreLabel,
  className,
  style,
  onAction,
  renderReturnPicker,
  renderAssigneePicker,
  'aria-label': ariaLabelAttr,
  ...rest
}) => {
  const config = useTigerConfig()
  const stepLabels = useMemo(() => getWorkflowTimelineLabels(config.locale), [config.locale])
  const toolbarClasses = useMemo(() => classNames(workflowActionBarClasses, className), [className])
  const resolvedItems = useMemo(
    () =>
      resolveWorkflowActionBarItems({
        items,
        buttonPolicy,
        labels: stepLabels,
        isStarter,
        viewerRole
      }),
    [items, buttonPolicy, stepLabels, isStarter, viewerRole]
  )
  const { bar, more } = useMemo(() => splitWorkflowActionBarItems(resolvedItems), [resolvedItems])
  const targets = returnTargets ?? []
  const hasReturnPicker = renderReturnPicker != null || returnTargets != null
  const hasAssigneePicker = renderAssigneePicker != null
  const positions = useMemo(
    () => resolveAddsignPositions(addsignPositions, buttonPolicy),
    [addsignPositions, buttonPolicy]
  )
  const [drafts, setDrafts] = useState<Record<string, ActionDraft>>({})
  const [moreItem, setMoreItem] = useState<WorkflowActionBarItem | null>(null)
  const moreWrapRef = useRef<HTMLDivElement>(null)

  const disableOptions = {
    barDisabled: disabled,
    hasReturnPicker,
    hasAssigneePicker,
    returnTargetCount: returnTargets == null ? undefined : targets.length
  }

  const getDraft = (item: WorkflowActionBarItem): ActionDraft =>
    drafts[item.key] ?? emptyDraft(item, targets, positions)

  const patchDraft = (item: WorkflowActionBarItem, patch: Partial<ActionDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [item.key]: {
        ...(prev[item.key] ?? emptyDraft(item, targets, positions)),
        ...patch
      }
    }))
  }

  const clearDraft = (item: WorkflowActionBarItem) => {
    setDrafts((prev) => {
      if (!(item.key in prev)) return prev
      const next = { ...prev }
      delete next[item.key]
      return next
    })
  }

  const emitReadyAction = (
    item: WorkflowActionBarItem,
    event?: { preventDefault: () => void }
  ): boolean => {
    if (isWorkflowActionBarItemDisabled(item, disableOptions)) return false
    const confirming = shouldConfirmWorkflowAction(item, confirm)
    if (!confirming) {
      onAction?.(item)
      return true
    }
    const required = workflowActionBarCommentRequired(item, commentRequired)
    const showComment = shouldShowWorkflowActionCommentInput(item.action, commentInput, required)
    const draft = getDraft(item)
    const picker = workflowActionNeedsPicker(item.action)

    if (showComment && !assertWorkflowActionComment(draft.comment, required)) {
      patchDraft(item, { error: stepLabels.commentRequiredBlock })
      event?.preventDefault()
      return false
    }
    if (picker === 'return' && !draft.targetNodeKey) {
      patchDraft(item, { error: stepLabels.returnNoTargets })
      event?.preventDefault()
      return false
    }
    if (picker === 'assignee' && !draft.assignee) {
      event?.preventDefault()
      return false
    }

    const payload = buildWorkflowActionPayload({
      action: item.action,
      comment: draft.comment,
      showComment,
      targetNodeKey: draft.targetNodeKey,
      position: draft.position,
      signMode: (draft.signMode as WorkflowActionPayload['signMode']) ?? currentSignMode,
      assignee: draft.assignee,
      assignees: draft.assignee ? [draft.assignee] : undefined
    })
    if (payload) onAction?.(item, payload)
    else onAction?.(item)
    clearDraft(item)
    return true
  }

  const renderPickerFields = (item: WorkflowActionBarItem, copyDescription?: string) => {
    const required = workflowActionBarCommentRequired(item, commentRequired)
    const showComment = shouldShowWorkflowActionCommentInput(item.action, commentInput, required)
    const draft = getDraft(item)
    const picker = workflowActionNeedsPicker(item.action)
    const confirmCopy = getWorkflowActionConfirmCopy(item.action, stepLabels, {
      commentRequired: required
    })

    const returnPickerCtx: WorkflowReturnPickerContext = {
      targets,
      value: draft.targetNodeKey,
      onChange: (key) => patchDraft(item, { targetNodeKey: key, error: undefined }),
      emptyText: stepLabels.returnNoTargets,
      title: stepLabels.returnPickerTitle
    }

    const assigneeCtx: WorkflowAssigneePickerContext = {
      action: item.action,
      value: draft.assignee,
      values: draft.assignee ? [draft.assignee] : undefined,
      onChange: (actor) => patchDraft(item, { assignee: actor, error: undefined }),
      multiple: item.action === 'addsign'
    }

    return (
      <>
        {copyDescription ? <div>{copyDescription}</div> : null}
        {picker === 'return' ? (
          <div className="mt-2">
            <div className="mb-1 text-sm font-medium">{stepLabels.returnPickerTitle}</div>
            {renderReturnPicker ? (
              renderReturnPicker(returnPickerCtx)
            ) : targets.length === 0 ? (
              <div className="text-sm text-[var(--tiger-text-muted,#6b7280)]">
                {stepLabels.returnNoTargets}
              </div>
            ) : (
              <RadioGroup
                size="sm"
                value={draft.targetNodeKey}
                aria-label={stepLabels.returnPickerTitle}
                onChange={(value) =>
                  patchDraft(item, { targetNodeKey: String(value), error: undefined })
                }>
                {targets.map((target) => (
                  <Radio key={target.key} value={target.key}>
                    {target.title ?? target.key}
                    {target.actorName ? `  ${target.actorName}` : ''}
                  </Radio>
                ))}
              </RadioGroup>
            )}
          </div>
        ) : null}
        {item.action === 'addsign' && positions.length > 1 ? (
          <div className="mt-2">
            <RadioGroup
              size="sm"
              value={draft.position}
              aria-label={stepLabels.actionAddsign}
              onChange={(value) =>
                patchDraft(item, { position: value as WorkflowAddsignPosition, error: undefined })
              }>
              {positions.map((position) => (
                <Radio key={position} value={position}>
                  {position === 'after' ? stepLabels.addsignAfter : stepLabels.addsignBefore}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        ) : null}
        {picker === 'assignee' && renderAssigneePicker ? (
          <div className="mt-2">{renderAssigneePicker(assigneeCtx)}</div>
        ) : null}
        {showComment ? (
          <Textarea
            size="sm"
            rows={2}
            className="mt-2 w-full"
            value={draft.comment}
            placeholder={confirmCopy?.commentPlaceholder}
            aria-label={confirmCopy?.commentPlaceholder}
            aria-required={required || undefined}
            onInput={(event) => {
              patchDraft(item, { comment: event.currentTarget.value, error: undefined })
            }}
          />
        ) : null}
        {draft.error ? (
          <div role="alert" className="mt-2 text-sm text-[var(--tiger-error,#dc2626)]">
            {draft.error}
          </div>
        ) : null}
      </>
    )
  }

  const renderActionControl = (item: WorkflowActionBarItem, trigger: React.ReactElement) => {
    const itemDisabled = isWorkflowActionBarItemDisabled(item, disableOptions)
    const reason = workflowActionBarItemDisabledReason(item, {
      ...disableOptions,
      returnNoTargets: stepLabels.returnNoTargets
    })
    const required = workflowActionBarCommentRequired(item, commentRequired)
    const confirmCopy = shouldConfirmWorkflowAction(item, confirm)
      ? getWorkflowActionConfirmCopy(item.action, stepLabels, { commentRequired: required })
      : null
    const showComment =
      confirmCopy != null &&
      shouldShowWorkflowActionCommentInput(item.action, commentInput, required)
    const extra =
      confirmCopy != null &&
      (showComment ||
        workflowActionNeedsPicker(item.action) != null ||
        (item.action === 'addsign' && positions.length > 1))

    const labeledTrigger = reason
      ? React.cloneElement(trigger, { title: reason, 'aria-description': reason })
      : trigger

    if (!confirmCopy) {
      return React.cloneElement(labeledTrigger, {
        key: item.key,
        onClick: () => {
          emitReadyAction(item)
        }
      })
    }

    return (
      <Popconfirm
        key={item.key}
        asChild
        title={confirmCopy.title}
        description={extra ? undefined : confirmCopy.description}
        descriptionContent={extra ? renderPickerFields(item, confirmCopy.description) : undefined}
        okType={confirmCopy.okType}
        disabled={itemDisabled}
        onConfirm={(event) => {
          emitReadyAction(item, event)
        }}>
        {labeledTrigger}
      </Popconfirm>
    )
  }

  const renderBarButton = (item: WorkflowActionBarItem) => {
    const buttonProps = resolveWorkflowActionButtonProps(item)
    const itemDisabled = isWorkflowActionBarItemDisabled(item, disableOptions)
    const button = (
      <Button
        key={item.key}
        size="sm"
        variant={buttonProps.variant}
        danger={buttonProps.danger}
        disabled={itemDisabled}>
        {item.label}
      </Button>
    )
    return renderActionControl(item, button)
  }

  const moreConfirmCopy =
    moreItem && shouldConfirmWorkflowAction(moreItem, confirm)
      ? getWorkflowActionConfirmCopy(moreItem.action, stepLabels, {
          commentRequired: workflowActionBarCommentRequired(moreItem, commentRequired)
        })
      : null
  const moreRequired = moreItem
    ? workflowActionBarCommentRequired(moreItem, commentRequired)
    : false
  const moreShowComment =
    moreItem != null &&
    moreConfirmCopy != null &&
    shouldShowWorkflowActionCommentInput(moreItem.action, commentInput, moreRequired)
  const moreExtra =
    moreItem != null &&
    moreConfirmCopy != null &&
    (moreShowComment ||
      workflowActionNeedsPicker(moreItem.action) != null ||
      (moreItem.action === 'addsign' && positions.length > 1))

  return (
    <div
      {...rest}
      className={toolbarClasses}
      style={style}
      role="toolbar"
      aria-label={ariaLabel ?? ariaLabelAttr ?? stepLabels.actionsAriaLabel}>
      {bar.map((item) => renderBarButton(item))}
      {more.length > 0 ? (
        <div ref={moreWrapRef} className="relative inline-flex">
          <Dropdown asChild>
            <Button size="sm" variant="outline">
              {moreLabel ?? stepLabels.moreActions}
            </Button>
            <DropdownMenu>
              {more.map((item) => {
                const itemDisabled = isWorkflowActionBarItemDisabled(item, disableOptions)
                const reason = workflowActionBarItemDisabledReason(item, {
                  ...disableOptions,
                  returnNoTargets: stepLabels.returnNoTargets
                })
                const needsDialog = shouldConfirmWorkflowAction(item, confirm)
                return (
                  <DropdownItem
                    key={item.key}
                    disabled={itemDisabled}
                    title={reason}
                    onClick={() => {
                      if (itemDisabled) return
                      if (needsDialog) setMoreItem(item)
                      else emitReadyAction(item)
                    }}>
                    {item.label}
                  </DropdownItem>
                )
              })}
            </DropdownMenu>
          </Dropdown>
          <Popconfirm
            open={moreItem != null}
            onOpenChange={(open) => {
              if (!open) {
                setMoreItem(null)
                const trigger = moreWrapRef.current?.querySelector('button')
                trigger?.focus()
              }
            }}
            title={moreConfirmCopy?.title}
            description={moreExtra ? undefined : moreConfirmCopy?.description}
            descriptionContent={
              moreItem && moreExtra
                ? renderPickerFields(moreItem, moreConfirmCopy?.description)
                : undefined
            }
            okType={moreConfirmCopy?.okType}
            disabled={moreItem == null}
            onConfirm={(event) => {
              if (!moreItem) return
              if (emitReadyAction(moreItem, event)) setMoreItem(null)
            }}>
            <span className="pointer-events-none absolute inset-0" aria-hidden="true" />
          </Popconfirm>
        </div>
      ) : null}
    </div>
  )
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  steps,
  tasks,
  actions,
  showActions,
  confirm,
  commentInput,
  commentRequired,
  buttonPolicy,
  returnTargets,
  addsignPositions,
  isStarter,
  viewerRole,
  mode = 'left',
  pending = false,
  pendingDot,
  pendingContent,
  reverse = false,
  locale,
  labels: labelsOverride,
  className,
  style,
  onAction,
  renderItem,
  renderDot,
  renderActions,
  renderReturnPicker,
  renderAssigneePicker,
  'aria-label': ariaLabel,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const stepLabels = useMemo(
    () => getWorkflowTimelineLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const timelineItems = useMemo(
    () => workflowStepsToTimelineItems(steps, { tasks }),
    [steps, tasks]
  )
  const resolvedActions = useMemo(
    () =>
      resolveWorkflowActionBarItems({
        items: actions,
        buttonPolicy,
        labels: stepLabels,
        isStarter,
        viewerRole
      }),
    [actions, buttonPolicy, stepLabels, isStarter, viewerRole]
  )
  const sortedActions = useMemo(
    () => sortWorkflowActionBarItems(resolvedActions),
    [resolvedActions]
  )
  const derivedReturnTargets = useMemo(
    () => (returnTargets !== undefined ? returnTargets : listWorkflowReturnTargets(steps)),
    [returnTargets, steps]
  )
  const showActionBar = shouldShowWorkflowActions(steps, sortedActions, showActions)
  const rootClasses = useMemo(() => classNames(workflowTimelineRootClasses, className), [className])

  const handleRenderItem = (item: TimelineItem, index: number) => {
    if (renderItem) return renderItem(item, index)
    if (isWorkflowTimelineItem(item)) return renderStepContent(item, stepLabels, tasks)
    return null
  }

  const actionBar =
    showActionBar && sortedActions.length > 0 ? (
      renderActions ? (
        renderActions(sortedActions)
      ) : (
        <WorkflowActionBar
          items={sortedActions}
          buttonPolicy={buttonPolicy}
          confirm={confirm}
          commentInput={commentInput}
          commentRequired={commentRequired}
          returnTargets={derivedReturnTargets}
          addsignPositions={addsignPositions}
          isStarter={isStarter}
          viewerRole={viewerRole}
          onAction={onAction}
          renderReturnPicker={renderReturnPicker}
          renderAssigneePicker={renderAssigneePicker}
          ariaLabel={stepLabels.actionsAriaLabel}
        />
      )
    ) : null

  return (
    <div {...rest} className={rootClasses} style={style}>
      <Timeline
        items={timelineItems}
        mode={mode}
        pending={pending}
        pendingDot={pendingDot}
        pendingContent={pendingContent}
        reverse={reverse}
        renderItem={handleRenderItem}
        renderDot={renderDot}
        aria-label={ariaLabel ?? stepLabels.ariaLabel}
      />
      {actionBar}
    </div>
  )
}

export default WorkflowTimeline
