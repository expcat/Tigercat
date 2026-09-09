import React, { useCallback, useMemo, useState } from 'react'
import {
  buildWorkflowDesignerNodes,
  classNames,
  cloneWorkflowDesignerActors,
  createWorkflowDesignerStep,
  findWorkflowDesignerNode,
  getWorkflowDesignerLabels,
  getWorkflowTimelineLabels,
  insertWorkflowStepAfterPath,
  insertWorkflowStepAtPath,
  mergeTigerLocale,
  moveWorkflowStepAtPath,
  patchWorkflowStepAtPath,
  removeWorkflowStepAtPath,
  resolveWorkflowDesignerView,
  workflowDesignerActionButtonClasses,
  workflowDesignerActorRowClasses,
  workflowDesignerCardClassName,
  workflowDesignerChildrenClasses,
  workflowDesignerControlClasses,
  workflowDesignerEmptyClasses,
  workflowDesignerFieldClasses,
  workflowDesignerFieldsClasses,
  workflowDesignerHintClasses,
  workflowDesignerInsertRowClasses,
  workflowDesignerItemClasses,
  workflowDesignerKindColor,
  workflowDesignerKindDotClasses,
  workflowDesignerKindOptions,
  workflowDesignerLabelClasses,
  workflowDesignerListClasses,
  workflowDesignerPanelClasses,
  workflowDesignerPathKey,
  workflowDesignerRootClasses,
  workflowDesignerShellClasses,
  workflowDesignerSignModeHint,
  workflowDesignerSignModeOptions,
  workflowDesignerSummaryActorsClasses,
  workflowDesignerSummaryClasses,
  workflowDesignerSummaryRowClasses,
  workflowDesignerSummaryTitleClasses,
  workflowDesignerToolbarClasses,
  workflowDesignerTreeClasses,
  workflowSignModeLabel,
  type TigerLocaleWorkflowDesigner,
  type TigerLocaleWorkflowTimeline,
  type WorkflowDesignerNode,
  type WorkflowDesignerPath,
  type WorkflowDesignerProps as CoreWorkflowDesignerProps,
  type WorkflowDesignerStepPatch,
  type WorkflowSignMode,
  type WorkflowStepKind,
  type WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'
import { Tag } from './Tag'

export interface WorkflowDesignerProps
  extends
    Omit<CoreWorkflowDesignerProps, 'onChange' | 'onSelect'>,
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'onChange' | 'onSelect' | 'defaultValue' | 'children'
    > {
  onChange?: (steps: WorkflowTimelineStep[]) => void
  onSelect?: (path: WorkflowDesignerPath, step: WorkflowTimelineStep | undefined) => void
}

function ActionButton({
  label,
  ariaLabel,
  disabled,
  onClick
}: {
  label: string
  ariaLabel?: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={workflowDesignerActionButtonClasses}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}>
      {label}
    </button>
  )
}

function DesignerNode({
  node,
  selectedKey,
  locked,
  moveUp,
  moveDown,
  addChild,
  insertSibling,
  removeStep,
  timelineLabels,
  onSelect,
  onMove,
  onAddChild,
  onInsertSibling,
  onRemove
}: {
  node: WorkflowDesignerNode
  selectedKey: string | null
  locked: boolean
  moveUp: string
  moveDown: string
  addChild: string
  insertSibling: string
  removeStep: string
  timelineLabels: Required<TigerLocaleWorkflowTimeline>
  onSelect: (node: WorkflowDesignerNode) => void
  onMove: (path: WorkflowDesignerPath, delta: number) => void
  onAddChild: (path: WorkflowDesignerPath) => void
  onInsertSibling: (path: WorkflowDesignerPath) => void
  onRemove: (path: WorkflowDesignerPath) => void
}) {
  const selected = selectedKey === workflowDesignerPathKey(node.path)
  const groupName = node.title || node.key

  return (
    <li className={workflowDesignerItemClasses}>
      <div
        className={workflowDesignerCardClassName(selected)}
        role="group"
        aria-label={groupName}
        aria-selected={selected ? true : undefined}
        onClick={() => onSelect(node)}>
        <div className={workflowDesignerSummaryClasses}>
          <div className={workflowDesignerSummaryRowClasses}>
            <span
              className={workflowDesignerKindDotClasses}
              style={{ backgroundColor: workflowDesignerKindColor(node.kind) }}
              aria-hidden="true"
            />
            <span className={workflowDesignerSummaryTitleClasses}>{groupName}</span>
            {node.kind === 'approve' ? (
              <Tag variant="primary" size="sm" pill>
                {workflowSignModeLabel(node.signMode, timelineLabels)}
              </Tag>
            ) : null}
          </div>
          {node.actorName ? (
            <div className={workflowDesignerSummaryActorsClasses}>{node.actorName}</div>
          ) : null}
        </div>
        <div className={workflowDesignerToolbarClasses}>
          <ActionButton
            label={moveUp}
            disabled={locked || !node.canMoveUp}
            onClick={() => onMove(node.path, -1)}
          />
          <ActionButton
            label={moveDown}
            disabled={locked || !node.canMoveDown}
            onClick={() => onMove(node.path, 1)}
          />
          <ActionButton label={addChild} disabled={locked} onClick={() => onAddChild(node.path)} />
          <ActionButton label={removeStep} disabled={locked} onClick={() => onRemove(node.path)} />
        </div>
      </div>
      {node.children.length > 0 ? (
        <div className={workflowDesignerChildrenClasses}>
          <ol className={workflowDesignerListClasses}>
            {node.children.map((child) => (
              <DesignerNode
                key={child.key}
                node={child}
                selectedKey={selectedKey}
                locked={locked}
                moveUp={moveUp}
                moveDown={moveDown}
                addChild={addChild}
                insertSibling={insertSibling}
                removeStep={removeStep}
                timelineLabels={timelineLabels}
                onSelect={onSelect}
                onMove={onMove}
                onAddChild={onAddChild}
                onInsertSibling={onInsertSibling}
                onRemove={onRemove}
              />
            ))}
          </ol>
        </div>
      ) : null}
      <div className={workflowDesignerInsertRowClasses}>
        <ActionButton
          label={insertSibling}
          ariaLabel={`${insertSibling} (${groupName})`}
          disabled={locked}
          onClick={() => onInsertSibling(node.path)}
        />
      </div>
    </li>
  )
}

function DesignerEditPanel({
  node,
  locked,
  labels,
  timelineLabels,
  kindOptions,
  signModeOptions,
  onPatch
}: {
  node: WorkflowDesignerNode
  locked: boolean
  labels: Required<TigerLocaleWorkflowDesigner>
  timelineLabels: Required<TigerLocaleWorkflowTimeline>
  kindOptions: Array<{ value: WorkflowStepKind; label: string }>
  signModeOptions: Array<{ value: WorkflowSignMode; label: string }>
  onPatch: (path: WorkflowDesignerPath, patch: WorkflowDesignerStepPatch) => void
}) {
  const actors = cloneWorkflowDesignerActors(node.step)
  const showSignMode = node.kind === 'approve'
  const showActors = node.kind !== 'condition'

  return (
    <div
      className={workflowDesignerPanelClasses}
      role="region"
      aria-label={labels.editPanelAriaLabel}>
      <div className={workflowDesignerFieldsClasses}>
        <label className={workflowDesignerFieldClasses}>
          <span className={workflowDesignerLabelClasses}>{labels.titleLabel}</span>
          <input
            className={workflowDesignerControlClasses}
            value={node.title}
            placeholder={labels.titlePlaceholder}
            disabled={locked}
            aria-label={labels.titleLabel}
            onChange={(event) => onPatch(node.path, { title: event.target.value })}
          />
        </label>
        <label className={workflowDesignerFieldClasses}>
          <span className={workflowDesignerLabelClasses}>{labels.kindLabel}</span>
          <select
            className={workflowDesignerControlClasses}
            value={node.kind}
            disabled={locked}
            aria-label={labels.kindLabel}
            onChange={(event) =>
              onPatch(node.path, { kind: event.target.value as WorkflowStepKind })
            }>
            {kindOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {showSignMode ? (
          <label className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{labels.signModeLabel}</span>
            <select
              className={workflowDesignerControlClasses}
              value={node.signMode}
              disabled={locked}
              aria-label={labels.signModeLabel}
              onChange={(event) =>
                onPatch(node.path, { signMode: event.target.value as WorkflowSignMode })
              }>
              {signModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className={workflowDesignerHintClasses}>
              {workflowDesignerSignModeHint(node.signMode, timelineLabels)}
            </span>
          </label>
        ) : null}
        {showActors ? (
          <div className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{labels.actorsLabel}</span>
            {actors.map((actor, index) => (
              <div key={index} className={workflowDesignerActorRowClasses}>
                <input
                  className={workflowDesignerControlClasses}
                  value={actor.name ?? ''}
                  placeholder={labels.actorPlaceholder}
                  disabled={locked}
                  aria-label={`${labels.actorsLabel} ${index + 1}`}
                  onChange={(event) => {
                    const next = cloneWorkflowDesignerActors(node.step)
                    const current = next[index]
                    if (!current) return
                    next[index] = { ...current, name: event.target.value }
                    onPatch(node.path, { actors: next })
                  }}
                />
                <ActionButton
                  label={labels.removeActor}
                  disabled={locked}
                  onClick={() => {
                    const next = cloneWorkflowDesignerActors(node.step).filter(
                      (_, actorIndex) => actorIndex !== index
                    )
                    onPatch(node.path, { actors: next })
                  }}
                />
              </div>
            ))}
            <ActionButton
              label={labels.addActor}
              disabled={locked}
              onClick={() => {
                const next = [...cloneWorkflowDesignerActors(node.step), { name: '' }]
                onPatch(node.path, { actors: next })
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  value,
  defaultValue,
  path,
  disabled = false,
  readonly = false,
  locale,
  labels: labelsOverride,
  ariaLabel,
  className,
  style,
  onChange,
  onSelect,
  ...rest
}) => {
  const config = useTigerConfig()
  const [steps, setSteps] = useControlledState<WorkflowTimelineStep[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange
  })
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const designerLabels = useMemo(
    () => getWorkflowDesignerLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const timelineLabels = useMemo(() => getWorkflowTimelineLabels(mergedLocale), [mergedLocale])
  const view = useMemo(() => resolveWorkflowDesignerView(steps, path), [steps, path])
  const nodes = useMemo(
    () => buildWorkflowDesignerNodes(view.list, view.parentPath),
    [view.list, view.parentPath]
  )
  const locked = disabled || readonly
  const kindOptions = useMemo(() => workflowDesignerKindOptions(timelineLabels), [timelineLabels])
  const signModeOptions = useMemo(
    () => workflowDesignerSignModeOptions(timelineLabels),
    [timelineLabels]
  )
  const rootClasses = useMemo(() => classNames(workflowDesignerRootClasses, className), [className])
  const selectedNode = useMemo(() => {
    if (!selectedKey) return undefined
    const selectedPath = selectedKey.split('\0')
    return findWorkflowDesignerNode(nodes, selectedPath)
  }, [nodes, selectedKey])

  const handleSelect = useCallback(
    (node: WorkflowDesignerNode) => {
      setSelectedKey(workflowDesignerPathKey(node.path))
      onSelect?.(node.path, node.step)
    },
    [onSelect]
  )
  const handlePatch = useCallback(
    (nodePath: WorkflowDesignerPath, patch: WorkflowDesignerStepPatch) => {
      setSteps(patchWorkflowStepAtPath(steps, nodePath, patch))
    },
    [setSteps, steps]
  )
  const handleMove = useCallback(
    (nodePath: WorkflowDesignerPath, delta: number) => {
      setSteps(moveWorkflowStepAtPath(steps, nodePath, delta))
    },
    [setSteps, steps]
  )
  const handleAddChild = useCallback(
    (nodePath: WorkflowDesignerPath) => {
      setSteps(insertWorkflowStepAtPath(steps, nodePath, createWorkflowDesignerStep(steps)))
    },
    [setSteps, steps]
  )
  const handleInsertSibling = useCallback(
    (nodePath: WorkflowDesignerPath) => {
      const created = createWorkflowDesignerStep(steps)
      setSteps(insertWorkflowStepAfterPath(steps, nodePath, created))
      const nextPath = [...nodePath.slice(0, -1), created.key]
      setSelectedKey(workflowDesignerPathKey(nextPath))
      onSelect?.(nextPath, created)
    },
    [onSelect, setSteps, steps]
  )
  const handleRemove = useCallback(
    (nodePath: WorkflowDesignerPath) => {
      if (selectedKey === workflowDesignerPathKey(nodePath)) setSelectedKey(null)
      setSteps(removeWorkflowStepAtPath(steps, nodePath))
    },
    [selectedKey, setSteps, steps]
  )
  const handleAddStep = useCallback(() => {
    if (!view.valid) return
    const created = createWorkflowDesignerStep(steps)
    if (view.parentPath.length === 0 && steps.length === 0) created.kind = 'start'
    setSteps(insertWorkflowStepAtPath(steps, view.parentPath, created))
  }, [setSteps, steps, view.parentPath, view.valid])

  const emptyCopy = view.valid ? designerLabels.emptyHint : designerLabels.subpathEmpty

  return (
    <div
      {...rest}
      className={rootClasses}
      style={style}
      role="region"
      aria-label={ariaLabel ?? designerLabels.ariaLabel}>
      <div className={workflowDesignerShellClasses}>
        <div className={workflowDesignerTreeClasses}>
          {nodes.length === 0 ? (
            <p className={workflowDesignerEmptyClasses}>{emptyCopy}</p>
          ) : (
            <ol className={workflowDesignerListClasses}>
              {nodes.map((node) => (
                <DesignerNode
                  key={node.key}
                  node={node}
                  selectedKey={selectedKey}
                  locked={locked}
                  moveUp={designerLabels.moveUp}
                  moveDown={designerLabels.moveDown}
                  addChild={designerLabels.addChild}
                  insertSibling={designerLabels.insertSibling}
                  removeStep={designerLabels.removeStep}
                  timelineLabels={timelineLabels}
                  onSelect={handleSelect}
                  onMove={handleMove}
                  onAddChild={handleAddChild}
                  onInsertSibling={handleInsertSibling}
                  onRemove={handleRemove}
                />
              ))}
            </ol>
          )}
          <ActionButton
            label={designerLabels.addStep}
            disabled={locked || !view.valid}
            onClick={handleAddStep}
          />
        </div>
        {selectedNode ? (
          <DesignerEditPanel
            node={selectedNode}
            locked={locked}
            labels={designerLabels}
            timelineLabels={timelineLabels}
            kindOptions={kindOptions}
            signModeOptions={signModeOptions}
            onPatch={handlePatch}
          />
        ) : null}
      </div>
    </div>
  )
}

export default WorkflowDesigner
