import React, { useMemo } from 'react'
import {
  classNames,
  getWorkflowTimelineLabels,
  mergeTigerLocale,
  resolveWorkflowActionButtonProps,
  shouldShowWorkflowActions,
  timelineDescriptionClasses,
  timelineLabelClasses,
  workflowStepsToTimelineItems,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  type TimelineItem,
  type TigerLocaleWorkflowTimeline,
  type WorkflowActionBarItem,
  type WorkflowActionBarProps as CoreWorkflowActionBarProps,
  type WorkflowTimelineItem,
  type WorkflowTimelineProps as CoreWorkflowTimelineProps
} from '@expcat/tigercat-core'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'
import { Tag } from './Tag'
import { Timeline } from './Timeline'

export interface WorkflowActionBarProps
  extends CoreWorkflowActionBarProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  onAction?: (item: WorkflowActionBarItem) => void
}

export interface WorkflowTimelineProps
  extends
    Omit<CoreWorkflowTimelineProps, 'pendingDot'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  pendingDot?: React.ReactNode
  pendingContent?: React.ReactNode
  onAction?: (item: WorkflowActionBarItem) => void
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

function renderStepContent(
  item: WorkflowTimelineItem,
  labels: Required<TigerLocaleWorkflowTimeline>
) {
  const step = item.step
  const title = step.title ?? step.label
  const statusLabel = workflowStepStatusLabel(item.status, labels)

  return (
    <div className="min-w-0">
      {step.time ? <div className={timelineLabelClasses}>{step.time}</div> : null}
      <div className={workflowStepHeaderClasses}>
        {title ? <div className={timelineDescriptionClasses}>{title}</div> : null}
        <Tag variant={workflowStepStatusTagVariant(item.status)} size="sm" pill>
          {statusLabel}
        </Tag>
      </div>
      {step.actor?.name ? <div className={workflowStepActorClasses}>{step.actor.name}</div> : null}
      {step.comment ? <div className={workflowStepCommentClasses}>{step.comment}</div> : null}
    </div>
  )
}

export const WorkflowActionBar: React.FC<WorkflowActionBarProps> = ({
  items,
  disabled,
  ariaLabel,
  className,
  style,
  onAction,
  'aria-label': ariaLabelAttr,
  ...rest
}) => {
  const config = useTigerConfig()
  const stepLabels = useMemo(() => getWorkflowTimelineLabels(config.locale), [config.locale])
  const toolbarClasses = useMemo(() => classNames(workflowActionBarClasses, className), [className])

  return (
    <div
      {...rest}
      className={toolbarClasses}
      style={style}
      role="toolbar"
      aria-label={ariaLabel ?? ariaLabelAttr ?? stepLabels.actionsAriaLabel}>
      {(items ?? []).map((item) => {
        const buttonProps = resolveWorkflowActionButtonProps(item)
        const isDisabled = Boolean(disabled || item.disabled)
        return (
          <Button
            key={item.key}
            size="sm"
            variant={buttonProps.variant}
            danger={buttonProps.danger}
            disabled={isDisabled}
            onClick={() => {
              if (isDisabled) return
              onAction?.(item)
            }}>
            {item.label}
          </Button>
        )
      })}
    </div>
  )
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  steps,
  actions,
  showActions,
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
        renderActions(actions)
      ) : (
        <WorkflowActionBar
          items={actions}
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
