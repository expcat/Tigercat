import React, { useMemo } from 'react'
import {
  buildWorkflowViewerTree,
  classNames,
  layoutWorkflowViewer,
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
  workflowViewerBarClasses,
  workflowViewerBarStyle,
  workflowViewerCardClassName,
  workflowViewerCardGridStyle,
  workflowViewerCellClasses,
  workflowViewerEdgeForkClasses,
  workflowViewerEdgeGridStyle,
  workflowViewerEdgeJoinClasses,
  workflowViewerEdgeSequenceClasses,
  workflowViewerForkDropClasses,
  workflowViewerGraphClasses,
  workflowViewerGridStyle,
  workflowViewerJoinBarClasses,
  workflowViewerKindRowClasses,
  workflowViewerLegendClasses,
  workflowViewerLegendItemClasses,
  workflowViewerLoopClasses,
  workflowViewerLoopGridStyle,
  workflowViewerLoopLabelClasses,
  workflowViewerLoopLineClasses,
  workflowViewerLoopMarkStyle,
  workflowViewerLoopPieceStyle,
  workflowViewerRiserClasses,
  workflowViewerReturnTargetLabelClasses,
  workflowViewerRollbackLabelClasses,
  workflowViewerRootClasses,
  type TigerLocaleWorkflowTimeline,
  type WorkflowStepActorsPresentation,
  type WorkflowTask,
  type WorkflowTimelineStep,
  type WorkflowTimelineStepStatus,
  type WorkflowViewerLayout,
  type WorkflowViewerLayoutEdge,
  type WorkflowViewerLegendItem,
  type WorkflowViewerLoopPiece,
  type WorkflowViewerNode,
  type WorkflowViewerProps as CoreWorkflowViewerProps
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { useTigerConfig } from './tiger-config'
import { Tag } from './Tag'

export interface WorkflowViewerProps
  extends CoreWorkflowViewerProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {}

const workflowStepActorClasses = 'text-sm text-[var(--tiger-text-secondary)]'
const workflowStepCommentClasses = 'text-sm text-[var(--tiger-text-secondary)] mt-1'

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

const WORKFLOW_VIEWER_LOOP_PIECES: WorkflowViewerLoopPiece[] = [
  'stem-start',
  'stem-mid',
  'stem-end',
  'arm-start',
  'arm-end',
  'label'
]

function ViewerEdge({ edge }: { edge: WorkflowViewerLayoutEdge }) {
  if (edge.kind === 'loop') return null
  if (edge.kind === 'riser') {
    return (
      <div
        className={workflowViewerRiserClasses}
        style={workflowViewerEdgeGridStyle(edge)}
        data-workflow-edge="riser"
        aria-hidden="true"
      />
    )
  }
  const bar =
    edge.kind === 'fork' || edge.kind === 'join' ? (
      <span
        className={edge.kind === 'fork' ? workflowViewerBarClasses : workflowViewerJoinBarClasses}
        style={workflowViewerBarStyle(edge)}
        aria-hidden="true"
      />
    ) : null
  return (
    <div
      className={
        edge.kind === 'fork'
          ? workflowViewerEdgeForkClasses
          : edge.kind === 'join'
            ? workflowViewerEdgeJoinClasses
            : workflowViewerEdgeSequenceClasses
      }
      style={workflowViewerEdgeGridStyle(edge)}
      data-workflow-edge={edge.kind}
      aria-hidden="true">
      {bar}
    </div>
  )
}

function ViewerLoop({
  layout,
  edge,
  labels
}: {
  layout: WorkflowViewerLayout
  edge: WorkflowViewerLayoutEdge
  labels: Required<TigerLocaleWorkflowTimeline>
}) {
  const style = workflowViewerLoopGridStyle(layout, edge)
  if (!style) return null
  const target = layout.placements.find((placement) => placement.key === edge.to)
  const title = target?.node.step.title ?? target?.node.step.label ?? edge.to
  return (
    <div
      className={workflowViewerLoopClasses}
      style={style}
      role="img"
      aria-label={`${labels.returnTarget}: ${title}`}
      data-workflow-edge="loop"
      data-workflow-loop-from={edge.from}
      data-workflow-loop-to={edge.to}>
      {WORKFLOW_VIEWER_LOOP_PIECES.map((piece) => (
        <div
          key={piece}
          style={workflowViewerLoopPieceStyle(piece)}
          data-workflow-loop-piece={piece}
          aria-hidden="true">
          <span
            className={
              piece === 'label' ? workflowViewerLoopLabelClasses : workflowViewerLoopLineClasses
            }
            style={workflowViewerLoopMarkStyle(piece)}>
            {piece === 'label' ? title : null}
          </span>
        </div>
      ))}
    </div>
  )
}

function ViewerGraph({
  nodes,
  labels,
  highlightPath,
  showRollbackPoint,
  tasks
}: {
  nodes: WorkflowViewerNode[]
  labels: Required<TigerLocaleWorkflowTimeline>
  highlightPath: boolean
  showRollbackPoint: boolean
  tasks?: WorkflowTask[]
}) {
  const layout = useMemo(() => layoutWorkflowViewer(nodes), [nodes])
  return (
    <div
      className={workflowViewerGraphClasses}
      style={workflowViewerGridStyle(layout)}
      data-layout="graph"
      data-workflow-fork={layout.hasFork ? 'true' : undefined}
      data-workflow-loop={layout.hasLoop ? 'true' : undefined}>
      {layout.edges
        .filter((edge) => edge.kind !== 'loop')
        .map((edge) => (
          <ViewerEdge key={`${edge.kind}-${edge.from}-${edge.to}`} edge={edge} />
        ))}
      {layout.edges
        .filter((edge) => edge.kind === 'loop')
        .map((edge) => (
          <ViewerLoop
            key={`loop-${edge.from}-${edge.to}`}
            layout={layout}
            edge={edge}
            labels={labels}
          />
        ))}
      {layout.placements.map((placement) => (
        <div
          key={placement.key}
          className={workflowViewerCellClasses}
          style={workflowViewerCardGridStyle(placement)}
          data-workflow-node={placement.key}>
          {placement.forkChild ? (
            <div className={workflowViewerForkDropClasses} aria-hidden="true" />
          ) : null}
          <ViewerCard
            node={placement.node}
            labels={labels}
            highlightPath={highlightPath}
            showRollbackPoint={showRollbackPoint}
            tasks={tasks}
          />
        </div>
      ))}
    </div>
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
      <ViewerGraph
        nodes={tree}
        labels={stepLabels}
        highlightPath={highlightPath}
        showRollbackPoint={showRollbackPoint}
        tasks={tasks}
      />
    </div>
  )
}

export default WorkflowViewer
