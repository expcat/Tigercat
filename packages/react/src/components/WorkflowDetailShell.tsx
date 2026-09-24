/**
 * Optional workflow detail layout. Node props (host integration; Admin wires a
 * real page later):
 * - `header` — title / status / meta
 * - `form` — SchemaForm (derive schema with `applyWorkflowFieldPermissions`)
 * - `tabs` — Timeline | Viewer (or any tab set)
 * - `action` — sticky WorkflowActionBar
 * - `children` — extra body content after form/tabs
 *
 * Not a second Timeline and not a form designer. Host gives a bounded height
 * (`h-full` / `flex-1 min-h-0`); do not hand-calc magic rem. Action stays pinned
 * while form/tabs scroll. `submit()` merges through `mergeWorkflowFormValues`.
 */

import React, { forwardRef, useImperativeHandle, useMemo } from 'react'
import {
  classNames,
  getWorkflowDetailShellLabels,
  getWorkflowDetailShellRootClasses,
  mergeTigerLocale,
  submitWorkflowDetailAction,
  submitWorkflowDetailForm,
  workflowDetailShellActionClasses,
  workflowDetailShellBodyClasses,
  workflowDetailShellFormClasses,
  workflowDetailShellHeaderClasses,
  workflowDetailShellTabsClasses,
  type FormValues,
  type WorkflowDetailShellProps as CoreWorkflowDetailShellProps,
  type WorkflowInstance,
  type WorkflowRuntimeAction
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface WorkflowDetailShellHandle {
  submit: (submitted?: FormValues) => FormValues
  submitAction: (
    action: WorkflowRuntimeAction,
    submitted?: FormValues
  ) => { values: FormValues; instance: WorkflowInstance }
}

export interface WorkflowDetailShellProps
  extends
    Omit<CoreWorkflowDetailShellProps, 'style' | 'onSubmit'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'style' | 'onSubmit'> {
  style?: React.CSSProperties
  header?: React.ReactNode
  form?: React.ReactNode
  tabs?: React.ReactNode
  action?: React.ReactNode
  children?: React.ReactNode
  onSubmit?: (values: FormValues) => void
  onDetailAction?: (result: {
    values: FormValues
    instance: WorkflowInstance
    action: WorkflowRuntimeAction
  }) => void
}

function hasNode(node: React.ReactNode): boolean {
  if (node == null || node === false) return false
  if (Array.isArray(node)) return node.some(hasNode)
  return true
}

export const WorkflowDetailShell = forwardRef<WorkflowDetailShellHandle, WorkflowDetailShellProps>(
  function WorkflowDetailShell(
    {
      showActions = true,
      ariaLabel,
      title,
      instance,
      className,
      style,
      header,
      form,
      tabs,
      action,
      children,
      locale,
      originalValues,
      values,
      schema,
      fieldPermissions,
      permissionMode = 'readonly',
      nodeKind,
      onSubmit,
      onDetailAction,
      ...rest
    },
    ref
  ) {
    const config = useTigerConfig()
    const labels = useMemo(
      () => getWorkflowDetailShellLabels(mergeTigerLocale(config.locale, locale)),
      [config.locale, locale]
    )
    const showAction = showActions && hasNode(action)

    const submit = (submitted?: FormValues): FormValues => {
      const merged = submitWorkflowDetailForm({
        original: originalValues,
        submitted: submitted ?? values,
        schema,
        permissions: fieldPermissions,
        mode: permissionMode,
        kind: nodeKind
      })
      onSubmit?.(merged)
      return merged
    }
    const submitAction = (action: WorkflowRuntimeAction, submitted?: FormValues) => {
      const result = submitWorkflowDetailAction({
        original: originalValues,
        submitted: submitted ?? values,
        schema,
        permissions: fieldPermissions,
        mode: permissionMode,
        kind: nodeKind,
        instance: instance ?? { steps: [] },
        action
      })
      onSubmit?.(result.values)
      onDetailAction?.({ ...result, action })
      return result
    }
    useImperativeHandle(ref, () => ({ submit, submitAction }), [
      originalValues,
      values,
      schema,
      fieldPermissions,
      permissionMode,
      nodeKind,
      instance,
      onSubmit,
      onDetailAction
    ])

    return (
      <div
        {...rest}
        className={classNames(getWorkflowDetailShellRootClasses(className))}
        style={style}
        role="region"
        aria-label={ariaLabel || labels.ariaLabel}
        data-tiger-workflow-detail-shell="">
        <div className={workflowDetailShellHeaderClasses} data-slot="header">
          {hasNode(header) ? (
            header
          ) : (
            <h1 className="text-base font-semibold">{title || labels.title}</h1>
          )}
        </div>
        <div className={workflowDetailShellBodyClasses} data-slot="body">
          {hasNode(form) ? (
            <div className={workflowDetailShellFormClasses} data-slot="form">
              {form}
            </div>
          ) : null}
          {hasNode(tabs) ? (
            <div className={workflowDetailShellTabsClasses} data-slot="tabs">
              {tabs}
            </div>
          ) : null}
          {children}
        </div>
        {showAction ? (
          <div className={workflowDetailShellActionClasses} data-slot="action">
            {action}
          </div>
        ) : null}
      </div>
    )
  }
)

WorkflowDetailShell.displayName = 'TigerWorkflowDetailShell'
