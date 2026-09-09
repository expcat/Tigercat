import React, { useMemo } from 'react'
import {
  buildWorkflowViewerTree,
  classNames,
  getWorkflowRollbackStep,
  getWorkflowStepActorsPresentation,
  getWorkflowTimelineLabels,
  getWorkflowViewerLegendItems,
  mergeTigerLocale,
  shouldShowWorkflowSignMode,
  timelineDescriptionClasses,
  workflowSignModeLabel,
  workflowStepActorProgressClasses,
  workflowStepActorRowClasses,
  workflowStepActorsListClasses,
  workflowStepKindLabel,
  workflowStepStatusColor,
  workflowStepStatusDotClasses,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
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
  workflowViewerRollbackLabelClasses,
  workflowViewerRootClasses,
  type TigerLocaleWorkflowTimeline,
  type WorkflowStepActorsPresentation,
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
  labels
}: {
  step: WorkflowTimelineStep
  labels: Required<TigerLocaleWorkflowTimeline>
}) {
  const presentation = getWorkflowStepActorsPresentation(step, labels)
  return renderWorkflowStepActors(presentation)
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
  showRollbackPoint
}: {
  node: WorkflowViewerNode
  labels: Required<TigerLocaleWorkflowTimeline>
  highlightPath: boolean
  showRollbackPoint: boolean
}) {
  const step = node.step
  const title = step.title ?? step.label
  const statusLabel = workflowStepStatusLabel(node.status, labels, node.kind)
  const kindLabel = workflowStepKindLabel(node.kind, labels)
  const showSignMode = shouldShowWorkflowSignMode(node.kind, node.signMode)
  const rollbackLabel = showRollbackPoint && node.rollbackPoint ? labels.rollbackPoint : null
  const isActive = node.status === 'active'

  return (
    <div
      className={workflowViewerCardClassName(node, { highlightPath, showRollbackPoint })}
      aria-current={isActive ? 'step' : undefined}>
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
      <StepActors step={step} labels={labels} />
      {step.comment ? <div className={workflowStepCommentClasses}>{step.comment}</div> : null}
      {rollbackLabel ? (
        <div className={workflowViewerRollbackLabelClasses}>{rollbackLabel}</div>
      ) : null}
    </div>
  )
}

function ViewerSequence({
  nodes,
  labels,
  highlightPath,
  showRollbackPoint,
  layout
}: {
  nodes: WorkflowViewerNode[]
  labels: Required<TigerLocaleWorkflowTimeline>
  highlightPath: boolean
  showRollbackPoint: boolean
  layout: 'stack' | 'branch'
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
  const tree = useMemo(() => buildWorkflowViewerTree(steps), [steps])
  const rootClasses = useMemo(() => classNames(workflowViewerRootClasses, className), [className])
  const legendItems = useMemo(() => {
    if (highlightPath === false) return []
    return getWorkflowViewerLegendItems(stepLabels, {
      showRollbackPoint: showRollbackPoint !== false && getWorkflowRollbackStep(steps) != null
    })
  }, [highlightPath, showRollbackPoint, stepLabels, steps])

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
      />
    </div>
  )
}

export default WorkflowViewer
