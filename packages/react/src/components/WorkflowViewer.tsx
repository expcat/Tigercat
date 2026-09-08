import React, { useMemo } from 'react'
import {
  buildWorkflowViewerTree,
  classNames,
  getWorkflowTimelineLabels,
  mergeTigerLocale,
  timelineDescriptionClasses,
  workflowSignModeLabel,
  workflowStepKindLabel,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  workflowViewerBranchClasses,
  workflowViewerCardClassName,
  workflowViewerChildLayout,
  workflowViewerConnectorClasses,
  workflowViewerItemClasses,
  workflowViewerKindRowClasses,
  workflowViewerListClasses,
  workflowViewerRollbackLabelClasses,
  workflowViewerRootClasses,
  type TigerLocaleWorkflowTimeline,
  type WorkflowViewerNode,
  type WorkflowViewerProps as CoreWorkflowViewerProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { Tag } from './Tag'

export interface WorkflowViewerProps
  extends CoreWorkflowViewerProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {}

const workflowStepActorClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
const workflowStepCommentClasses = 'text-sm text-[var(--tiger-text-secondary,#4b5563)] mt-1'

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
  const statusLabel = workflowStepStatusLabel(node.status, labels)
  const kindLabel = workflowStepKindLabel(node.kind, labels)
  const showSignMode = node.kind === 'approve' && node.signMode !== 'sequential'
  const rollbackLabel = showRollbackPoint && node.rollbackPoint ? labels.rollbackPoint : null

  return (
    <div
      className={workflowViewerCardClassName(node, { highlightPath, showRollbackPoint })}
      aria-current={node.status === 'active' ? 'step' : undefined}>
      <div className={workflowViewerKindRowClasses}>
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
      {title ? <div className={classNames(timelineDescriptionClasses, 'mt-1')}>{title}</div> : null}
      {step.actor?.name ? <div className={workflowStepActorClasses}>{step.actor.name}</div> : null}
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

  return (
    <div
      {...rest}
      className={rootClasses}
      style={style}
      role="region"
      aria-label={ariaLabel ?? stepLabels.viewerAriaLabel}>
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
