import React, { useMemo } from 'react'
import {
  buildWorkflowViewerTree,
  classNames,
  getWorkflowReturnTargetStep,
  getWorkflowRollbackStep,
  getWorkflowStepActorsPresentation,
  getWorkflowStepRuntimeChrome,
  getWorkflowTimelineLabels,
  getWorkflowViewerLegendItems,
  mergeTigerLocale,
  shouldShowWorkflowSignMode,
  timelineDescriptionClasses,
  workflowSignModeLabel,
  workflowStepActorCurrentClasses,
  workflowStepActorMetaClasses,
  workflowStepActorProgressClasses,
  workflowStepActorRowClasses,
  workflowStepActorsListClasses,
  workflowStepKindLabel,
  workflowStepStatusColor,
  workflowStepStatusDotClasses,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  workflowTaskRowStatusLabel,
  workflowViewerActiveTitleClasses,
  workflowViewerBranchClasses,
  workflowViewerCardClassName,
  workflowViewerChildLayout,
  workflowViewerConnectorClasses,
  workflowViewerItemClasses,
  workflowViewerKindRowClasses,
  workflowViewerLegendClasses,
  workflowViewerLegendItemClasses,
  workflowViewerListClasses,
  workflowViewerReturnTargetLabelClasses,
  workflowViewerRollbackLabelClasses,
  workflowViewerRootClasses,
  type TigerLocaleWorkflowTimeline,
  type WorkflowStepActorsPresentation,
  type WorkflowTask,
  type WorkflowTimelineStep,
  type WorkflowTimelineStepStatus,
  type WorkflowViewerLegendItem,
  type WorkflowViewerNode,
  type WorkflowViewerProps as CoreWorkflowViewerProps
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { useTigerConfig } from './ConfigProvider'
import { Tag } from './Tag'

export interface WorkflowViewerProps
  extends CoreWorkflowViewerProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {}

const workflowStepActorClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
const workflowStepCommentClasses = 'text-sm text-[var(--tiger-text-secondary,#4b5563)] mt-1'

function StatusDot({ status }: { status: WorkflowTimelineStepStatus }) {
  return (
    <span
      className={workflowStepStatusDotClasses}
      style={{ backgroundColor: workflowStepStatusColor(status) }}
      aria-hidden="true"
    />
  )
}

function StepActors({
  step,
  labels,
  tasks
}: {
  step: WorkflowTimelineStep
  labels: Required<TigerLocaleWorkflowTimeline>
  tasks?: WorkflowTask[]
}) {
  const presentation = getWorkflowStepActorsPresentation(step, labels, tasks)
  return renderWorkflowStepActors(presentation, labels)
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

function ViewerLegend({
  items,
  ariaLabel
}: {
  items: WorkflowViewerLegendItem[]
  ariaLabel: string
}) {
  if (items.length === 0) return null
  return (
    <div className={workflowViewerLegendClasses} role="group" aria-label={ariaLabel}>
      {items.map((item) => (
        <span key={item.key} className={workflowViewerLegendItemClasses}>
          <span className={item.swatchClassName} aria-hidden="true" />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function ViewerCard({
  node,
  labels,
  highlightPath,
  showRollbackPoint,
  tasks
}: {
  node: WorkflowViewerNode
  labels: Required<TigerLocaleWorkflowTimeline>
  highlightPath: boolean
  showRollbackPoint: boolean
  tasks?: WorkflowTask[]
}) {
  const step = node.step
  const title = step.title ?? step.label
  const statusLabel = workflowStepStatusLabel(node.status, labels, node.kind)
  const kindLabel = workflowStepKindLabel(node.kind, labels)
  const showSignMode = shouldShowWorkflowSignMode(node.kind, node.signMode)
  const rollbackLabel = showRollbackPoint && node.rollbackPoint ? labels.rollbackPoint : null
  const isActive = node.status === 'active'
  const chrome = getWorkflowStepRuntimeChrome(step, labels, {
    onPath: node.onPath,
    returnTarget: node.returnTarget,
    conditionBranch: node.conditionBranch,
    highlightPath
  })

  return (
    <div
      className={workflowViewerCardClassName(node, { highlightPath, showRollbackPoint })}
      aria-current={isActive ? 'step' : undefined}
      data-workflow-path={node.onPath ? 'on' : 'off'}
      data-workflow-addsign={chrome.addsign ? (step.origin?.position ?? 'true') : undefined}
      data-workflow-return-target={node.returnTarget ? 'true' : undefined}>
      <div className={workflowViewerKindRowClasses}>
        <StatusDot status={node.status} />
        <Tag variant="default" size="sm" pill>
          {kindLabel}
        </Tag>
        {showSignMode ? (
          <Tag variant="primary" size="sm" pill>
            {workflowSignModeLabel(node.signMode, labels)}
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
          <Tag variant={node.onPath ? 'success' : 'default'} size="sm" pill>
            {chrome.branchPathLabel}
          </Tag>
        ) : null}
        <Tag variant={workflowStepStatusTagVariant(node.status)} size="sm" pill>
          {statusLabel}
        </Tag>
      </div>
      {title ? (
        <div
          className={classNames(
            timelineDescriptionClasses,
            'mt-1',
            isActive ? workflowViewerActiveTitleClasses : null
          )}>
          {title}
        </div>
      ) : null}
      <StepActors step={step} labels={labels} tasks={tasks} />
      {step.comment ? <div className={workflowStepCommentClasses}>{step.comment}</div> : null}
      {rollbackLabel ? (
        <div className={workflowViewerRollbackLabelClasses}>{rollbackLabel}</div>
      ) : null}
      {chrome.returnTargetLabel ? (
        <div className={workflowViewerReturnTargetLabelClasses}>{chrome.returnTargetLabel}</div>
      ) : null}
      {chrome.pendingAfterAddsignLabel ? (
        <div className={workflowStepActorMetaClasses}>{chrome.pendingAfterAddsignLabel}</div>
      ) : null}
    </div>
  )
}

function ViewerSequence({
  nodes,
  labels,
  highlightPath,
  showRollbackPoint,
  layout,
  tasks
}: {
  nodes: WorkflowViewerNode[]
  labels: Required<TigerLocaleWorkflowTimeline>
  highlightPath: boolean
  showRollbackPoint: boolean
  layout: 'stack' | 'branch'
  tasks?: WorkflowTask[]
}) {
  return (
    <ol className={layout === 'branch' ? workflowViewerBranchClasses : workflowViewerListClasses}>
      {nodes.map((node, index) => (
        <li key={node.key} className={workflowViewerItemClasses}>
          {layout === 'stack' && index > 0 ? (
            <div className={workflowViewerConnectorClasses} aria-hidden="true" />
          ) : null}
          <ViewerCard
            node={node}
            labels={labels}
            highlightPath={highlightPath}
            showRollbackPoint={showRollbackPoint}
            tasks={tasks}
          />
          {node.children.length > 0 ? (
            <>
              <div className={workflowViewerConnectorClasses} aria-hidden="true" />
              <ViewerSequence
                nodes={node.children}
                labels={labels}
                highlightPath={highlightPath}
                showRollbackPoint={showRollbackPoint}
                layout={workflowViewerChildLayout(node)}
                tasks={tasks}
              />
            </>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

export const WorkflowViewer: React.FC<WorkflowViewerProps> = ({
  steps,
  tasks,
  highlightPath = true,
  showRollbackPoint = true,
  locale,
  labels: labelsOverride,
  className,
  style,
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
  const tree = useMemo(() => buildWorkflowViewerTree(steps, { tasks }), [steps, tasks])
  const rootClasses = useMemo(() => classNames(workflowViewerRootClasses, className), [className])
  const legendItems = useMemo(() => {
    if (highlightPath === false) return []
    return getWorkflowViewerLegendItems(stepLabels, {
      showRollbackPoint: showRollbackPoint !== false && getWorkflowRollbackStep(steps) != null,
      showReturnTarget: getWorkflowReturnTargetStep(steps, tasks) != null
    })
  }, [highlightPath, showRollbackPoint, stepLabels, steps, tasks])

  return (
    <div
      {...rest}
      className={rootClasses}
      style={style}
      role="region"
      aria-label={ariaLabel ?? stepLabels.viewerAriaLabel}>
      <ViewerLegend items={legendItems} ariaLabel={stepLabels.legendAriaLabel} />
      <ViewerSequence
        nodes={tree}
        labels={stepLabels}
        highlightPath={highlightPath}
        showRollbackPoint={showRollbackPoint}
        layout="stack"
        tasks={tasks}
      />
    </div>
  )
}

export default WorkflowViewer
