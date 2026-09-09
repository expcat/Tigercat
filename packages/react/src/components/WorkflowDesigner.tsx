import React, { useCallback, useMemo, useState } from 'react'
import {
  buildWorkflowDesignerNodes,
  classNames,
  createWorkflowDesignerStep,
  getWorkflowDesignerLabels,
  getWorkflowTimelineLabels,
  insertWorkflowStepAtPath,
  mergeTigerLocale,
  moveWorkflowStepAtPath,
  patchWorkflowStepAtPath,
  removeWorkflowStepAtPath,
  resolveWorkflowDesignerView,
  workflowDesignerActionButtonClasses,
  workflowDesignerCardClassName,
  workflowDesignerChildrenClasses,
  workflowDesignerControlClasses,
  workflowDesignerEmptyClasses,
  workflowDesignerFieldClasses,
  workflowDesignerFieldsClasses,
  workflowDesignerItemClasses,
  workflowDesignerKindOptions,
  workflowDesignerLabelClasses,
  workflowDesignerListClasses,
  workflowDesignerRootClasses,
  workflowDesignerSignModeOptions,
  workflowDesignerToolbarClasses,
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

function pathKey(path: WorkflowDesignerPath): string {
  return path.join('\0')
}

function ActionButton({
  label,
  disabled,
  onClick
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={workflowDesignerActionButtonClasses}
      disabled={disabled}
      onClick={onClick}>
      {label}
    </button>
  )
}

function DesignerNode({
  node,
  selectedKey,
  locked,
  titleLabel,
  titlePlaceholder,
  kindLabel,
  signModeLabel,
  actorLabel,
  actorPlaceholder,
  moveUp,
  moveDown,
  addChild,
  removeStep,
  kindOptions,
  signModeOptions,
  onSelect,
  onPatch,
  onMove,
  onAddChild,
  onRemove
}: {
  node: WorkflowDesignerNode
  selectedKey: string | null
  locked: boolean
  titleLabel: string
  titlePlaceholder: string
  kindLabel: string
  signModeLabel: string
  actorLabel: string
  actorPlaceholder: string
  moveUp: string
  moveDown: string
  addChild: string
  removeStep: string
  kindOptions: Array<{ value: WorkflowStepKind; label: string }>
  signModeOptions: Array<{ value: WorkflowSignMode; label: string }>
  onSelect: (node: WorkflowDesignerNode) => void
  onPatch: (path: WorkflowDesignerPath, patch: WorkflowDesignerStepPatch) => void
  onMove: (path: WorkflowDesignerPath, delta: number) => void
  onAddChild: (path: WorkflowDesignerPath) => void
  onRemove: (path: WorkflowDesignerPath) => void
}) {
  const selected = selectedKey === pathKey(node.path)
  const groupName = node.title || node.key

  return (
    <li className={workflowDesignerItemClasses}>
      <div
        className={workflowDesignerCardClassName(selected)}
        role="group"
        aria-label={groupName}
        aria-selected={selected ? true : undefined}
        onClick={() => onSelect(node)}>
        <div className={workflowDesignerFieldsClasses}>
          <label className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{titleLabel}</span>
            <input
              className={workflowDesignerControlClasses}
              value={node.title}
              placeholder={titlePlaceholder}
              disabled={locked}
              aria-label={titleLabel}
              onChange={(event) => onPatch(node.path, { title: event.target.value })}
            />
          </label>
          <label className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{kindLabel}</span>
            <select
              className={workflowDesignerControlClasses}
              value={node.kind}
              disabled={locked}
              aria-label={kindLabel}
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
          {node.kind === 'approve' ? (
            <label className={workflowDesignerFieldClasses}>
              <span className={workflowDesignerLabelClasses}>{signModeLabel}</span>
              <select
                className={workflowDesignerControlClasses}
                value={node.signMode}
                disabled={locked}
                aria-label={signModeLabel}
                onChange={(event) =>
                  onPatch(node.path, { signMode: event.target.value as WorkflowSignMode })
                }>
                {signModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{actorLabel}</span>
            <input
              className={workflowDesignerControlClasses}
              value={node.actorName}
              placeholder={actorPlaceholder}
              disabled={locked}
              aria-label={actorLabel}
              onChange={(event) =>
                onPatch(node.path, { actor: { ...node.step.actor, name: event.target.value } })
              }
            />
          </label>
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
                titleLabel={titleLabel}
                titlePlaceholder={titlePlaceholder}
                kindLabel={kindLabel}
                signModeLabel={signModeLabel}
                actorLabel={actorLabel}
                actorPlaceholder={actorPlaceholder}
                moveUp={moveUp}
                moveDown={moveDown}
                addChild={addChild}
                removeStep={removeStep}
                kindOptions={kindOptions}
                signModeOptions={signModeOptions}
                onSelect={onSelect}
                onPatch={onPatch}
                onMove={onMove}
                onAddChild={onAddChild}
                onRemove={onRemove}
              />
            ))}
          </ol>
        </div>
      ) : null}
    </li>
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

  const handleSelect = useCallback(
    (node: WorkflowDesignerNode) => {
      setSelectedKey(pathKey(node.path))
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
  const handleRemove = useCallback(
    (nodePath: WorkflowDesignerPath) => {
      if (selectedKey === pathKey(nodePath)) setSelectedKey(null)
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

  const emptyCopy = view.valid ? designerLabels.emptyText : designerLabels.subpathEmpty

  return (
    <div
      {...rest}
      className={rootClasses}
      style={style}
      role="region"
      aria-label={ariaLabel ?? designerLabels.ariaLabel}>
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
              titleLabel={designerLabels.titleLabel}
              titlePlaceholder={designerLabels.titlePlaceholder}
              kindLabel={designerLabels.kindLabel}
              signModeLabel={designerLabels.signModeLabel}
              actorLabel={designerLabels.actorLabel}
              actorPlaceholder={designerLabels.actorPlaceholder}
              moveUp={designerLabels.moveUp}
              moveDown={designerLabels.moveDown}
              addChild={designerLabels.addChild}
              removeStep={designerLabels.removeStep}
              kindOptions={kindOptions}
              signModeOptions={signModeOptions}
              onSelect={handleSelect}
              onPatch={handlePatch}
              onMove={handleMove}
              onAddChild={handleAddChild}
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
  )
}

export default WorkflowDesigner
