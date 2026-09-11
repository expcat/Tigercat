import React, { useCallback, useMemo, useState } from 'react'
import {
  actorsFromApproverSource,
  applyWorkflowDesignerFieldPermissionColumn,
  buildWorkflowDesignerNodes,
  classNames,
  cloneWorkflowDesignerStepWithNewKeys,
  createWorkflowDesignerPaletteStep,
  createWorkflowDesignerStep,
  findWorkflowDesignerNode,
  getWorkflowDesignerLabels,
  getWorkflowStepAtPath,
  getWorkflowTimelineLabels,
  insertWorkflowDesignerPaletteStep,
  insertWorkflowStepAfterPath,
  insertWorkflowStepAtPath,
  mergeTigerLocale,
  moveWorkflowStepAtPath,
  patchWorkflowDesignerButton,
  patchWorkflowStepAtPath,
  removeWorkflowStepAtPath,
  resolveWorkflowDesignerView,
  validateWorkflowDesigner,
  workflowDesignerActionButtonClasses,
  workflowDesignerActionLabel,
  workflowDesignerActorRowClasses,
  workflowDesignerAdvancedFromStep,
  workflowDesignerApproverSourceFromStep,
  workflowDesignerApproverSourceOfType,
  workflowDesignerApproverSourceOptions,
  workflowDesignerApproverSummary,
  workflowDesignerAutoDecideOptions,
  workflowDesignerCardClassName,
  workflowDesignerChildrenClasses,
  workflowDesignerControlClasses,
  workflowDesignerDefaultInspectorTab,
  workflowDesignerEditableButtonPolicy,
  workflowDesignerEmptyApproverOptions,
  workflowDesignerEmptyClasses,
  workflowDesignerEmptyInspectorClasses,
  workflowDesignerFieldClasses,
  workflowDesignerFieldPermissionLabel,
  workflowDesignerFieldPermissionRows,
  workflowDesignerFieldsClasses,
  workflowDesignerHintClasses,
  workflowDesignerInsertButtonClasses,
  workflowDesignerInsertGlyph,
  workflowDesignerInsertRowClasses,
  workflowDesignerInspectorTabEnabled,
  workflowDesignerInspectorTabLabel,
  workflowDesignerIssueBannerClasses,
  workflowDesignerIssueListClasses,
  workflowDesignerIssueMessage,
  workflowDesignerItemClasses,
  workflowDesignerKindColor,
  workflowDesignerKindDotClasses,
  workflowDesignerKindOptions,
  workflowDesignerLabelClasses,
  workflowDesignerListClasses,
  workflowDesignerPaletteClasses,
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
  workflowDesignerTabClassName,
  workflowDesignerTabListClasses,
  workflowDesignerTableCellClasses,
  workflowDesignerTableClasses,
  workflowDesignerTableHeadClasses,
  workflowDesignerTimeoutActionOptions,
  workflowDesignerToolbarClasses,
  workflowDesignerTreeClasses,
  workflowSignModeLabel,
  WORKFLOW_DESIGNER_INSPECTOR_TABS,
  WORKFLOW_DESIGNER_PALETTE_KINDS,
  WORKFLOW_FIELD_PERMISSIONS,
  type ApproverSource,
  type FieldPermission,
  type SchemaFormSchema,
  type TigerLocaleWorkflowDesigner,
  type TigerLocaleWorkflowTimeline,
  type WorkflowAutoDecide,
  type WorkflowDesignerInspectorTab,
  type WorkflowDesignerNode,
  type WorkflowDesignerPath,
  type WorkflowDesignerProps as CoreWorkflowDesignerProps,
  type WorkflowDesignerStepPatch,
  type WorkflowEmptyApprover,
  type WorkflowNodeAdvanced,
  type WorkflowSignMode,
  type WorkflowStepKind,
  type WorkflowTimeoutAction,
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
  schema?: SchemaFormSchema
  onChange?: (steps: WorkflowTimelineStep[]) => void
  onSelect?: (path: WorkflowDesignerPath, step: WorkflowTimelineStep | undefined) => void
}

function ActionButton({
  label,
  ariaLabel,
  disabled,
  expanded,
  className,
  onClick
}: {
  label: string
  ariaLabel?: string
  disabled: boolean
  expanded?: boolean
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={className ?? workflowDesignerActionButtonClasses}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={expanded}
      aria-haspopup={expanded == null ? undefined : 'menu'}
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
  insertMenuPath,
  locked,
  labels,
  timelineLabels,
  onSelect,
  onMove,
  onAddChild,
  onCopy,
  onInsertKind,
  onToggleInsert,
  onRemove
}: {
  node: WorkflowDesignerNode
  selectedKey: string | null
  insertMenuPath: string | null
  locked: boolean
  labels: Required<TigerLocaleWorkflowDesigner>
  timelineLabels: Required<TigerLocaleWorkflowTimeline>
  onSelect: (node: WorkflowDesignerNode) => void
  onMove: (path: WorkflowDesignerPath, delta: number) => void
  onAddChild: (path: WorkflowDesignerPath) => void
  onCopy: (path: WorkflowDesignerPath) => void
  onInsertKind: (path: WorkflowDesignerPath, kind: WorkflowStepKind) => void
  onToggleInsert: (path: WorkflowDesignerPath) => void
  onRemove: (path: WorkflowDesignerPath) => void
}) {
  const selected = selectedKey === workflowDesignerPathKey(node.path)
  const groupName = node.title || node.key
  const pathKey = workflowDesignerPathKey(node.path)
  const insertOpen = insertMenuPath === pathKey
  const summary = workflowDesignerApproverSummary(node.step, labels)

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
          {summary ? <div className={workflowDesignerSummaryActorsClasses}>{summary}</div> : null}
        </div>
        <div className={workflowDesignerToolbarClasses}>
          <ActionButton
            label={labels.moveUp}
            disabled={locked || !node.canMoveUp}
            onClick={() => onMove(node.path, -1)}
          />
          <ActionButton
            label={labels.moveDown}
            disabled={locked || !node.canMoveDown}
            onClick={() => onMove(node.path, 1)}
          />
          <ActionButton
            label={labels.copyStep}
            disabled={locked}
            onClick={() => onCopy(node.path)}
          />
          <ActionButton
            label={labels.addChild}
            disabled={locked}
            onClick={() => onAddChild(node.path)}
          />
          <ActionButton
            label={labels.removeStep}
            disabled={locked}
            onClick={() => onRemove(node.path)}
          />
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
                insertMenuPath={insertMenuPath}
                locked={locked}
                labels={labels}
                timelineLabels={timelineLabels}
                onSelect={onSelect}
                onMove={onMove}
                onAddChild={onAddChild}
                onCopy={onCopy}
                onInsertKind={onInsertKind}
                onToggleInsert={onToggleInsert}
                onRemove={onRemove}
              />
            ))}
          </ol>
        </div>
      ) : null}
      <div className={workflowDesignerInsertRowClasses}>
        <ActionButton
          label={workflowDesignerInsertGlyph}
          ariaLabel={`${labels.insertSibling} (${groupName})`}
          disabled={locked}
          expanded={insertOpen}
          className={workflowDesignerInsertButtonClasses}
          onClick={() => onToggleInsert(node.path)}
        />
        {insertOpen ? (
          <div
            role="menu"
            aria-label={labels.paletteAriaLabel}
            className={workflowDesignerPaletteClasses}>
            {WORKFLOW_DESIGNER_PALETTE_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                role="menuitem"
                className={workflowDesignerActionButtonClasses}
                disabled={locked}
                onClick={(event) => {
                  event.stopPropagation()
                  onInsertKind(node.path, kind)
                }}>
                {
                  workflowDesignerKindOptions(timelineLabels).find(
                    (option) => option.value === kind
                  )?.label
                }
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  )
}

function DesignerEditPanel({
  node,
  locked,
  labels,
  timelineLabels,
  schema,
  inspectorTab,
  kindOptions,
  signModeOptions,
  onTabChange,
  onPatch,
  onInsertChild,
  onRemovePath
}: {
  node: WorkflowDesignerNode
  locked: boolean
  labels: Required<TigerLocaleWorkflowDesigner>
  timelineLabels: Required<TigerLocaleWorkflowTimeline>
  schema: SchemaFormSchema | undefined
  inspectorTab: WorkflowDesignerInspectorTab
  kindOptions: Array<{ value: WorkflowStepKind; label: string }>
  signModeOptions: Array<{ value: WorkflowSignMode; label: string }>
  onTabChange: (tab: WorkflowDesignerInspectorTab) => void
  onPatch: (path: WorkflowDesignerPath, patch: WorkflowDesignerStepPatch) => void
  onInsertChild: (parentPath: WorkflowDesignerPath, step: WorkflowTimelineStep) => void
  onRemovePath: (path: WorkflowDesignerPath) => void
}) {
  const source = workflowDesignerApproverSourceFromStep(node.step)
  const sourceOptions = workflowDesignerApproverSourceOptions(labels)
  const emptyOptions = workflowDesignerEmptyApproverOptions(timelineLabels)
  const autoDecideOptions = workflowDesignerAutoDecideOptions(timelineLabels)
  const timeoutOptions = workflowDesignerTimeoutActionOptions({ ...labels, ...timelineLabels })
  const buttonPolicy = workflowDesignerEditableButtonPolicy(node.step)
  const advanced = workflowDesignerAdvancedFromStep(node.step)
  const permissionRows = workflowDesignerFieldPermissionRows(schema, node.step)
  const showSignMode = node.kind === 'approve'
  const tabEnabled = (tab: WorkflowDesignerInspectorTab) =>
    workflowDesignerInspectorTabEnabled(tab, node.kind)

  function patchSource(next: ApproverSource): void {
    onPatch(node.path, {
      approverPolicy: next,
      actors: actorsFromApproverSource(next)
    })
  }

  function patchAdvanced(patch: Partial<WorkflowNodeAdvanced>): void {
    onPatch(node.path, {
      advanced: {
        ...advanced,
        ...patch,
        timeout: patch.timeout ? { ...advanced.timeout, ...patch.timeout } : advanced.timeout
      }
    })
  }

  function renderApprovers(): React.ReactNode {
    if (!tabEnabled('approvers')) {
      return <p className={workflowDesignerHintClasses}>{labels.tabNotApplicable}</p>
    }
    return (
      <div className={workflowDesignerFieldsClasses}>
        <label className={workflowDesignerFieldClasses}>
          <span className={workflowDesignerLabelClasses}>{labels.sourceLabel}</span>
          <select
            className={workflowDesignerControlClasses}
            value={source.type}
            disabled={locked}
            aria-label={labels.sourceLabel}
            onChange={(event) =>
              patchSource(
                workflowDesignerApproverSourceOfType(
                  event.target.value as ApproverSource['type'],
                  source
                )
              )
            }>
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {source.type === 'fixed' ? (
          <div className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{labels.actorsLabel}</span>
            {source.actors.map((actor, index) => (
              <div key={index} className={workflowDesignerActorRowClasses}>
                <input
                  className={workflowDesignerControlClasses}
                  value={actor.id}
                  placeholder={labels.actorIdPlaceholder}
                  disabled={locked}
                  aria-label={`${labels.actorIdPlaceholder} ${index + 1}`}
                  onChange={(event) => {
                    const actors = source.actors.map((item, actorIndex) =>
                      actorIndex === index ? { ...item, id: event.target.value } : item
                    )
                    patchSource({ type: 'fixed', actors })
                  }}
                />
                <input
                  className={workflowDesignerControlClasses}
                  value={actor.name ?? ''}
                  placeholder={labels.actorPlaceholder}
                  disabled={locked}
                  aria-label={`${labels.actorsLabel} ${index + 1}`}
                  onChange={(event) => {
                    const actors = source.actors.map((item, actorIndex) =>
                      actorIndex === index ? { ...item, name: event.target.value } : item
                    )
                    patchSource({ type: 'fixed', actors })
                  }}
                />
                <ActionButton
                  label={labels.removeActor}
                  disabled={locked}
                  onClick={() =>
                    patchSource({
                      type: 'fixed',
                      actors: source.actors.filter((_, actorIndex) => actorIndex !== index)
                    })
                  }
                />
              </div>
            ))}
            <ActionButton
              label={labels.addActor}
              disabled={locked}
              onClick={() =>
                patchSource({ type: 'fixed', actors: [...source.actors, { id: '', name: '' }] })
              }
            />
          </div>
        ) : null}
        {source.type === 'role' || source.type === 'group' ? (
          <label className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{labels.sourceKeyLabel}</span>
            <input
              className={workflowDesignerControlClasses}
              value={source.key}
              placeholder={labels.sourceKeyPlaceholder}
              disabled={locked}
              aria-label={labels.sourceKeyLabel}
              onChange={(event) => patchSource({ ...source, key: event.target.value })}
            />
          </label>
        ) : null}
        {source.type === 'dept_leader' ? (
          <label className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{labels.sourceLevelLabel}</span>
            <input
              type="number"
              className={workflowDesignerControlClasses}
              value={source.level ?? 1}
              disabled={locked}
              aria-label={labels.sourceLevelLabel}
              onChange={(event) =>
                patchSource({ type: 'dept_leader', level: Number(event.target.value) || 1 })
              }
            />
          </label>
        ) : null}
        {source.type === 'manager_chain' ? (
          <label className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{labels.sourceUpToLabel}</span>
            <input
              type="number"
              className={workflowDesignerControlClasses}
              value={source.upTo ?? 1}
              disabled={locked}
              aria-label={labels.sourceUpToLabel}
              onChange={(event) =>
                patchSource({ type: 'manager_chain', upTo: Number(event.target.value) || 1 })
              }
            />
          </label>
        ) : null}
        {source.type === 'starter_pick' ? (
          <label className={workflowDesignerActorRowClasses}>
            <input
              type="checkbox"
              checked={Boolean(source.multiple)}
              disabled={locked}
              aria-label={labels.sourceMultiple}
              onChange={(event) =>
                patchSource({ ...source, type: 'starter_pick', multiple: event.target.checked })
              }
            />
            <span className={workflowDesignerLabelClasses}>{labels.sourceMultiple}</span>
          </label>
        ) : null}
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
        {node.kind === 'approve' ? (
          <label className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{labels.emptyApproverLabel}</span>
            <select
              className={workflowDesignerControlClasses}
              value={advanced.emptyApprover ?? 'pause'}
              disabled={locked}
              aria-label={labels.emptyApproverLabel}
              onChange={(event) =>
                patchAdvanced({ emptyApprover: event.target.value as WorkflowEmptyApprover })
              }>
              {emptyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    )
  }

  function renderButtons(): React.ReactNode {
    if (!tabEnabled('buttons')) {
      return <p className={workflowDesignerHintClasses}>{labels.tabNotApplicable}</p>
    }
    return (
      <div className={workflowDesignerFieldsClasses}>
        <table className={workflowDesignerTableClasses}>
          <thead>
            <tr>
              <th className={workflowDesignerTableHeadClasses}>{labels.buttonEnabled}</th>
              <th className={workflowDesignerTableHeadClasses}>{labels.kindLabel}</th>
              <th className={workflowDesignerTableHeadClasses}>{labels.buttonDisplayName}</th>
              <th className={workflowDesignerTableHeadClasses}>{labels.buttonCommentRequired}</th>
              <th className={workflowDesignerTableHeadClasses}>{labels.buttonPlacement}</th>
            </tr>
          </thead>
          <tbody>
            {buttonPolicy.buttons.map((button) => (
              <tr key={button.action}>
                <td className={workflowDesignerTableCellClasses}>
                  <input
                    type="checkbox"
                    checked={button.enabled}
                    disabled={locked}
                    aria-label={`${workflowDesignerActionLabel(button.action, timelineLabels)} ${labels.buttonEnabled}`}
                    onChange={(event) =>
                      onPatch(node.path, {
                        buttonPolicy: patchWorkflowDesignerButton(buttonPolicy, button.action, {
                          enabled: event.target.checked
                        })
                      })
                    }
                  />
                </td>
                <td className={workflowDesignerTableCellClasses}>
                  {workflowDesignerActionLabel(button.action, timelineLabels)}
                </td>
                <td className={workflowDesignerTableCellClasses}>
                  <input
                    className={workflowDesignerControlClasses}
                    value={button.label ?? ''}
                    disabled={locked}
                    aria-label={`${workflowDesignerActionLabel(button.action, timelineLabels)} ${labels.buttonDisplayName}`}
                    onChange={(event) =>
                      onPatch(node.path, {
                        buttonPolicy: patchWorkflowDesignerButton(buttonPolicy, button.action, {
                          label: event.target.value
                        })
                      })
                    }
                  />
                </td>
                <td className={workflowDesignerTableCellClasses}>
                  <input
                    type="checkbox"
                    checked={Boolean(button.commentRequired)}
                    disabled={locked}
                    aria-label={`${workflowDesignerActionLabel(button.action, timelineLabels)} ${labels.buttonCommentRequired}`}
                    onChange={(event) =>
                      onPatch(node.path, {
                        buttonPolicy: patchWorkflowDesignerButton(buttonPolicy, button.action, {
                          commentRequired: event.target.checked
                        })
                      })
                    }
                  />
                </td>
                <td className={workflowDesignerTableCellClasses}>
                  <select
                    className={workflowDesignerControlClasses}
                    value={button.placement ?? 'bar'}
                    disabled={locked}
                    aria-label={`${workflowDesignerActionLabel(button.action, timelineLabels)} ${labels.buttonPlacement}`}
                    onChange={(event) =>
                      onPatch(node.path, {
                        buttonPolicy: patchWorkflowDesignerButton(buttonPolicy, button.action, {
                          placement: event.target.value as 'bar' | 'more'
                        })
                      })
                    }>
                    <option value="bar">{labels.buttonPlacementBar}</option>
                    <option value="more">{labels.buttonPlacementMore}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {buttonPolicy.buttons.some((button) => button.action === 'addsign' && button.enabled) ? (
          <fieldset className={workflowDesignerFieldClasses}>
            <legend className={workflowDesignerLabelClasses}>{labels.addsignPositions}</legend>
            {(['before', 'after'] as const).map((position) => {
              const checked = buttonPolicy.addsign?.positions.includes(position) ?? false
              return (
                <label key={position} className={workflowDesignerActorRowClasses}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={locked}
                    aria-label={`${labels.addsignPositions} ${position}`}
                    onChange={(event) => {
                      const current = new Set(buttonPolicy.addsign?.positions ?? [])
                      if (event.target.checked) current.add(position)
                      else current.delete(position)
                      onPatch(node.path, {
                        buttonPolicy: {
                          ...buttonPolicy,
                          addsign: { positions: [...current] }
                        }
                      })
                    }}
                  />
                  <span>
                    {position === 'before'
                      ? timelineLabels.addsignBefore
                      : timelineLabels.addsignAfter}
                  </span>
                </label>
              )
            })}
          </fieldset>
        ) : null}
      </div>
    )
  }

  function renderPermissions(): React.ReactNode {
    if (!tabEnabled('fieldPermissions')) {
      return <p className={workflowDesignerHintClasses}>{labels.tabNotApplicable}</p>
    }
    if (permissionRows.length === 0) {
      return <p className={workflowDesignerHintClasses}>{labels.fieldPermissionsEmpty}</p>
    }
    return (
      <div className={workflowDesignerFieldsClasses}>
        <div className={workflowDesignerToolbarClasses}>
          {WORKFLOW_FIELD_PERMISSIONS.map((permission) => (
            <ActionButton
              key={permission}
              label={`${labels.fieldPermissionAll}: ${workflowDesignerFieldPermissionLabel(permission, timelineLabels)}`}
              disabled={locked}
              onClick={() =>
                onPatch(node.path, {
                  fieldPermissions: applyWorkflowDesignerFieldPermissionColumn(
                    schema,
                    node.step.fieldPermissions,
                    permission
                  )
                })
              }
            />
          ))}
        </div>
        <table className={workflowDesignerTableClasses}>
          <thead>
            <tr>
              <th className={workflowDesignerTableHeadClasses}>{labels.titleLabel}</th>
              {WORKFLOW_FIELD_PERMISSIONS.map((permission) => (
                <th key={permission} className={workflowDesignerTableHeadClasses}>
                  {workflowDesignerFieldPermissionLabel(permission, timelineLabels)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionRows.map((row) => (
              <tr key={row.name}>
                <td className={workflowDesignerTableCellClasses}>{row.label}</td>
                {WORKFLOW_FIELD_PERMISSIONS.map((permission) => (
                  <td key={permission} className={workflowDesignerTableCellClasses}>
                    <input
                      type="radio"
                      name={`field-perm-${node.key}-${row.name}`}
                      checked={row.permission === permission}
                      disabled={locked}
                      aria-label={`${row.label} ${workflowDesignerFieldPermissionLabel(permission, timelineLabels)}`}
                      onChange={() =>
                        onPatch(node.path, {
                          fieldPermissions: {
                            ...node.step.fieldPermissions,
                            [row.name]: permission as FieldPermission
                          }
                        })
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function renderAdvanced(): React.ReactNode {
    const branches = node.kind === 'condition' ? (node.step.children ?? []) : []
    return (
      <div className={workflowDesignerFieldsClasses}>
        {node.kind === 'approve' || node.kind === 'start' ? (
          <>
            <label className={workflowDesignerFieldClasses}>
              <span className={workflowDesignerLabelClasses}>{labels.autoDecideLabel}</span>
              <select
                className={workflowDesignerControlClasses}
                value={advanced.autoDecide ?? 'manual'}
                disabled={locked}
                aria-label={labels.autoDecideLabel}
                onChange={(event) =>
                  patchAdvanced({ autoDecide: event.target.value as WorkflowAutoDecide })
                }>
                {autoDecideOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={workflowDesignerFieldClasses}>
              <span className={workflowDesignerLabelClasses}>{labels.timeoutActionLabel}</span>
              <select
                className={workflowDesignerControlClasses}
                value={advanced.timeout?.action ?? 'remind'}
                disabled={locked}
                aria-label={labels.timeoutActionLabel}
                onChange={(event) =>
                  patchAdvanced({
                    timeout: {
                      ...advanced.timeout,
                      action: event.target.value as WorkflowTimeoutAction
                    }
                  })
                }>
                {timeoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={workflowDesignerFieldClasses}>
              <span className={workflowDesignerLabelClasses}>{labels.timeoutDurationLabel}</span>
              <input
                className={workflowDesignerControlClasses}
                value={advanced.timeout?.durationLabel ?? ''}
                disabled={locked}
                aria-label={labels.timeoutDurationLabel}
                onChange={(event) =>
                  patchAdvanced({
                    timeout: { ...advanced.timeout, durationLabel: event.target.value }
                  })
                }
              />
            </label>
          </>
        ) : null}
        {node.kind === 'condition' ? (
          <div className={workflowDesignerFieldClasses}>
            <span className={workflowDesignerLabelClasses}>{labels.branchLabel}</span>
            {branches.map((branch, index) => (
              <div key={branch.key} className={workflowDesignerFieldsClasses}>
                <div className={workflowDesignerActorRowClasses}>
                  <input
                    className={workflowDesignerControlClasses}
                    value={branch.title ?? ''}
                    placeholder={labels.branchLabel}
                    disabled={locked}
                    aria-label={`${labels.branchLabel} ${index + 1}`}
                    onChange={(event) =>
                      onPatch([...node.path, branch.key], { title: event.target.value })
                    }
                  />
                  <ActionButton
                    label={labels.removeBranch}
                    disabled={locked}
                    onClick={() => onRemovePath([...node.path, branch.key])}
                  />
                </div>
                <input
                  className={workflowDesignerControlClasses}
                  value={branch.expression ?? ''}
                  placeholder={labels.branchExpressionPlaceholder}
                  disabled={locked}
                  aria-label={`${labels.branchExpression} ${index + 1}`}
                  onChange={(event) =>
                    onPatch([...node.path, branch.key], { expression: event.target.value })
                  }
                />
              </div>
            ))}
            <ActionButton
              label={labels.addBranch}
              disabled={locked}
              onClick={() =>
                onInsertChild(
                  node.path,
                  createWorkflowDesignerStep([node.step, ...(node.step.children ?? [])], {
                    kind: 'approve',
                    title: `${labels.branchLabel} ${(node.step.children?.length ?? 0) + 1}`,
                    expression: ''
                  })
                )
              }
            />
          </div>
        ) : null}
        {node.kind !== 'approve' && node.kind !== 'start' && node.kind !== 'condition' ? (
          <p className={workflowDesignerHintClasses}>{labels.tabNotApplicable}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={workflowDesignerPanelClasses}
      role="region"
      aria-label={labels.editPanelAriaLabel}
      data-slot="inspector">
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
      </div>
      <div
        className={workflowDesignerTabListClasses}
        role="tablist"
        aria-label={labels.editPanelAriaLabel}>
        {WORKFLOW_DESIGNER_INSPECTOR_TABS.map((tab) => {
          const enabled = tabEnabled(tab)
          const selected = inspectorTab === tab
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              className={workflowDesignerTabClassName(selected)}
              aria-selected={selected}
              disabled={!enabled}
              onClick={() => enabled && onTabChange(tab)}>
              {workflowDesignerInspectorTabLabel(tab, labels)}
            </button>
          )
        })}
      </div>
      <div role="tabpanel">
        {inspectorTab === 'approvers'
          ? renderApprovers()
          : inspectorTab === 'buttons'
            ? renderButtons()
            : inspectorTab === 'fieldPermissions'
              ? renderPermissions()
              : renderAdvanced()}
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
  schema,
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
  const [inspectorTab, setInspectorTab] = useState<WorkflowDesignerInspectorTab>('approvers')
  const [insertMenuPath, setInsertMenuPath] = useState<string | null>(null)
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
    return findWorkflowDesignerNode(nodes, selectedKey.split('\0'))
  }, [nodes, selectedKey])
  const issues = useMemo(() => validateWorkflowDesigner(steps), [steps])

  const handleSelect = useCallback(
    (node: WorkflowDesignerNode) => {
      setSelectedKey(workflowDesignerPathKey(node.path))
      setInspectorTab(workflowDesignerDefaultInspectorTab(node.kind))
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
      const parent = findWorkflowDesignerNode(nodes, nodePath)
      const kind = parent?.kind === 'condition' ? 'approve' : undefined
      const created =
        kind === 'approve'
          ? createWorkflowDesignerStep(steps, {
              kind: 'approve',
              title: designerLabels.branchLabel,
              expression: ''
            })
          : createWorkflowDesignerStep(steps)
      setSteps(insertWorkflowStepAtPath(steps, nodePath, created))
    },
    [designerLabels.branchLabel, nodes, setSteps, steps]
  )
  const handleCopy = useCallback(
    (nodePath: WorkflowDesignerPath) => {
      const source = findWorkflowDesignerNode(nodes, nodePath)?.step
      if (!source) return
      const copy = cloneWorkflowDesignerStepWithNewKeys(source, steps)
      const next = insertWorkflowStepAfterPath(steps, nodePath, copy)
      setSteps(next)
      const nextPath = [...nodePath.slice(0, -1), copy.key]
      setSelectedKey(workflowDesignerPathKey(nextPath))
      onSelect?.(nextPath, copy)
    },
    [nodes, onSelect, setSteps, steps]
  )
  const handleInsertKind = useCallback(
    (nodePath: WorkflowDesignerPath, kind: WorkflowStepKind) => {
      const result = insertWorkflowDesignerPaletteStep(steps, nodePath, kind, {
        ...timelineLabels,
        ...designerLabels
      })
      setSteps(result.steps)
      setInsertMenuPath(null)
      setSelectedKey(workflowDesignerPathKey(result.path))
      setInspectorTab(workflowDesignerDefaultInspectorTab(kind))
      onSelect?.(result.path, getWorkflowStepAtPath(result.steps, result.path))
    },
    [designerLabels, onSelect, setSteps, steps, timelineLabels]
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
  const handlePaletteKind = useCallback(
    (kind: WorkflowStepKind) => {
      if (!view.valid) return
      const created = createWorkflowDesignerPaletteStep(steps, kind, {
        ...timelineLabels,
        ...designerLabels
      })
      const next = insertWorkflowStepAtPath(steps, view.parentPath, created)
      setSteps(next)
      const nextPath = [...view.parentPath, created.key]
      setSelectedKey(workflowDesignerPathKey(nextPath))
      setInspectorTab(workflowDesignerDefaultInspectorTab(kind))
      onSelect?.(nextPath, created)
    },
    [designerLabels, onSelect, setSteps, steps, timelineLabels, view.parentPath, view.valid]
  )

  const emptyCopy = view.valid ? designerLabels.emptyHint : designerLabels.subpathEmpty
  const activeTab =
    selectedNode && !workflowDesignerInspectorTabEnabled(inspectorTab, selectedNode.kind)
      ? workflowDesignerDefaultInspectorTab(selectedNode.kind)
      : inspectorTab

  return (
    <div
      {...rest}
      className={rootClasses}
      style={style}
      role="region"
      aria-label={ariaLabel ?? designerLabels.ariaLabel}>
      {issues.length > 0 ? (
        <div
          className={workflowDesignerIssueBannerClasses}
          role="status"
          aria-label={designerLabels.validationAriaLabel}>
          <div>{designerLabels.publishBlocked}</div>
          <ul className={workflowDesignerIssueListClasses}>
            {issues.map((issue, index) => (
              <li key={`${issue.code}-${issue.path.join('.')}-${index}`}>
                {workflowDesignerIssueMessage(issue, designerLabels)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className={workflowDesignerShellClasses}>
        <div className={workflowDesignerTreeClasses} data-slot="canvas">
          <div
            className={workflowDesignerPaletteClasses}
            role="toolbar"
            aria-label={designerLabels.paletteAriaLabel}>
            {WORKFLOW_DESIGNER_PALETTE_KINDS.map((kind) => (
              <ActionButton
                key={kind}
                label={kindOptions.find((option) => option.value === kind)?.label ?? kind}
                disabled={locked || !view.valid}
                onClick={() => handlePaletteKind(kind)}
              />
            ))}
          </div>
          {nodes.length === 0 ? (
            <p className={workflowDesignerEmptyClasses}>{emptyCopy}</p>
          ) : (
            <ol className={workflowDesignerListClasses}>
              {nodes.map((node) => (
                <DesignerNode
                  key={node.key}
                  node={node}
                  selectedKey={selectedKey}
                  insertMenuPath={insertMenuPath}
                  locked={locked}
                  labels={designerLabels}
                  timelineLabels={timelineLabels}
                  onSelect={handleSelect}
                  onMove={handleMove}
                  onAddChild={handleAddChild}
                  onCopy={handleCopy}
                  onInsertKind={handleInsertKind}
                  onToggleInsert={(nodePath) => {
                    const key = workflowDesignerPathKey(nodePath)
                    setInsertMenuPath((current) => (current === key ? null : key))
                  }}
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
            schema={schema}
            inspectorTab={activeTab}
            kindOptions={kindOptions}
            signModeOptions={signModeOptions}
            onTabChange={setInspectorTab}
            onPatch={handlePatch}
            onInsertChild={(parentPath, step) => {
              setSteps(insertWorkflowStepAtPath(steps, parentPath, step))
            }}
            onRemovePath={handleRemove}
          />
        ) : (
          <div
            className={workflowDesignerPanelClasses}
            role="region"
            aria-label={designerLabels.editPanelAriaLabel}
            data-slot="inspector">
            <p className={workflowDesignerEmptyInspectorClasses}>{designerLabels.inspectorEmpty}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkflowDesigner
