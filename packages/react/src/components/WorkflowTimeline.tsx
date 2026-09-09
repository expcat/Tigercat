import React, { useMemo, useState } from 'react'
import {
  classNames,
  getWorkflowActionConfirmCopy,
  getWorkflowStepActorsPresentation,
  getWorkflowTimelineLabels,
  mergeTigerLocale,
  resolveWorkflowActionButtonProps,
  resolveWorkflowSignMode,
  resolveWorkflowStepKind,
  shouldConfirmWorkflowAction,
  shouldShowWorkflowActionCommentInput,
  shouldShowWorkflowActions,
  shouldShowWorkflowSignMode,
  sortWorkflowActionBarItems,
  timelineDescriptionClasses,
  timelineLabelClasses,
  workflowSignModeLabel,
  workflowStepActorProgressClasses,
  workflowStepActorRowClasses,
  workflowStepActorsListClasses,
  workflowStepsToTimelineItems,
  workflowStepStatusColor,
  workflowStepStatusDotClasses,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  type TimelineItem,
  type TigerLocaleWorkflowTimeline,
  type WorkflowActionBarItem,
  type WorkflowActionBarProps as CoreWorkflowActionBarProps,
  type WorkflowStepActorsPresentation,
  type WorkflowTimelineItem,
  type WorkflowTimelineProps as CoreWorkflowTimelineProps,
  type WorkflowTimelineStepStatus
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import { Popconfirm } from './Popconfirm'
import { Tag } from './Tag'
import { Textarea } from './Textarea'
import { Timeline } from './Timeline'

export interface WorkflowActionBarProps
  extends CoreWorkflowActionBarProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  commentInput?: boolean
  commentRequired?: boolean
  onAction?: (item: WorkflowActionBarItem, payload?: { comment?: string }) => void
}

export interface WorkflowTimelineProps
  extends
    Omit<CoreWorkflowTimelineProps, 'pendingDot'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  pendingDot?: React.ReactNode
  pendingContent?: React.ReactNode
  commentInput?: boolean
  commentRequired?: boolean
  onAction?: (item: WorkflowActionBarItem, payload?: { comment?: string }) => void
  renderItem?: (item: TimelineItem, index: number) => React.ReactNode
  renderDot?: (item: TimelineItem, options: { pending: boolean }) => React.ReactNode
  renderActions?: (actions: WorkflowActionBarItem[]) => React.ReactNode
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

function renderWorkflowStepActors(presentation: WorkflowStepActorsPresentation) {
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
        <div key={actor.key} className={workflowStepActorRowClasses}>
          {actor.avatar ? <Avatar size="sm" src={actor.avatar} alt="" aria-hidden="true" /> : null}
          <StatusDot status={actor.status} />
          {actor.name ? <span>{actor.name}</span> : null}
        </div>
      ))}
    </div>
  )
}

function renderStepContent(
  item: WorkflowTimelineItem,
  labels: Required<TigerLocaleWorkflowTimeline>
) {
  const step = item.step
  const title = step.title ?? step.label
  const kind = resolveWorkflowStepKind(step)
  const statusLabel = workflowStepStatusLabel(item.status, labels, kind)
  const signMode = resolveWorkflowSignMode(step)
  const showSignMode = shouldShowWorkflowSignMode(kind, signMode)

  return (
    <div className="min-w-0">
      {step.time ? <div className={timelineLabelClasses}>{step.time}</div> : null}
      <div className={workflowStepHeaderClasses}>
        {title ? <div className={timelineDescriptionClasses}>{title}</div> : null}
        {showSignMode ? (
          <Tag variant="primary" size="sm" pill>
            {workflowSignModeLabel(signMode, labels)}
          </Tag>
        ) : null}
        <Tag variant={workflowStepStatusTagVariant(item.status)} size="sm" pill>
          {statusLabel}
        </Tag>
      </div>
      {renderWorkflowStepActors(getWorkflowStepActorsPresentation(step, labels))}
      {step.comment ? <div className={workflowStepCommentClasses}>{step.comment}</div> : null}
    </div>
  )
}

export const WorkflowActionBar: React.FC<WorkflowActionBarProps> = ({
  items,
  disabled,
  ariaLabel,
  confirm,
  commentInput,
  commentRequired,
  className,
  style,
  onAction,
  'aria-label': ariaLabelAttr,
  ...rest
}) => {
  const config = useTigerConfig()
  const stepLabels = useMemo(() => getWorkflowTimelineLabels(config.locale), [config.locale])
  const toolbarClasses = useMemo(() => classNames(workflowActionBarClasses, className), [className])
  const sortedItems = useMemo(() => sortWorkflowActionBarItems(items ?? []), [items])
  const [comments, setComments] = useState<Record<string, string>>({})

  return (
    <div
      {...rest}
      className={toolbarClasses}
      style={style}
      role="toolbar"
      aria-label={ariaLabel ?? ariaLabelAttr ?? stepLabels.actionsAriaLabel}>
      {sortedItems.map((item) => {
        const buttonProps = resolveWorkflowActionButtonProps(item)
        const isDisabled = Boolean(disabled || item.disabled)
        const confirmCopy = shouldConfirmWorkflowAction(item, confirm)
          ? getWorkflowActionConfirmCopy(item.action, stepLabels, { commentRequired })
          : null
        const showComment =
          confirmCopy != null && shouldShowWorkflowActionCommentInput(item.action, commentInput)

        const emitAction = () => {
          if (isDisabled) return
          if (showComment) {
            onAction?.(item, { comment: comments[item.key] ?? '' })
            setComments((prev) => {
              if (!(item.key in prev)) return prev
              const next = { ...prev }
              delete next[item.key]
              return next
            })
            return
          }
          onAction?.(item)
        }

        const button = (
          <Button
            key={item.key}
            size="sm"
            variant={buttonProps.variant}
            danger={buttonProps.danger}
            disabled={isDisabled}
            onClick={confirmCopy ? undefined : emitAction}>
            {item.label}
          </Button>
        )
        if (!confirmCopy) return button

        const descriptionContent = showComment ? (
          <>
            {confirmCopy.description ? <div>{confirmCopy.description}</div> : null}
            <Textarea
              size="sm"
              rows={2}
              className="mt-2 w-full"
              value={comments[item.key] ?? ''}
              placeholder={confirmCopy.commentPlaceholder}
              aria-label={confirmCopy.commentPlaceholder}
              aria-required={commentRequired || undefined}
              onInput={(event) => {
                const value = event.currentTarget.value
                setComments((prev) => ({ ...prev, [item.key]: value }))
              }}
            />
          </>
        ) : undefined

        return (
          <Popconfirm
            key={item.key}
            asChild
            title={confirmCopy.title}
            description={showComment ? undefined : confirmCopy.description}
            descriptionContent={descriptionContent}
            okType={confirmCopy.okType}
            disabled={isDisabled}
            onConfirm={emitAction}>
            {button}
          </Popconfirm>
        )
      })}
    </div>
  )
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  steps,
  actions,
  showActions,
  confirm,
  commentInput,
  commentRequired,
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
  const timelineItems = useMemo(() => workflowStepsToTimelineItems(steps), [steps])
  const sortedActions = useMemo(() => sortWorkflowActionBarItems(actions ?? []), [actions])
  const showActionBar = shouldShowWorkflowActions(steps, actions, showActions)
  const rootClasses = useMemo(() => classNames(workflowTimelineRootClasses, className), [className])

  const handleRenderItem = (item: TimelineItem, index: number) => {
    if (renderItem) return renderItem(item, index)
    if (isWorkflowTimelineItem(item)) return renderStepContent(item, stepLabels)
    return null
  }

  const actionBar =
    showActionBar && actions ? (
      renderActions ? (
        renderActions(sortedActions)
      ) : (
        <WorkflowActionBar
          items={sortedActions}
          confirm={confirm}
          commentInput={commentInput}
          commentRequired={commentRequired}
          onAction={onAction}
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
