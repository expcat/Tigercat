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
 * while form/tabs scroll.
 */

import React, { forwardRef } from 'react'
import {
  WORKFLOW_DETAIL_SHELL_DEFAULT_ARIA_LABEL,
  classNames,
  getWorkflowDetailShellRootClasses,
  workflowDetailShellActionClasses,
  workflowDetailShellBodyClasses,
  workflowDetailShellFormClasses,
  workflowDetailShellHeaderClasses,
  workflowDetailShellTabsClasses,
  type WorkflowDetailShellProps as CoreWorkflowDetailShellProps
} from '@expcat/tigercat-core'

export interface WorkflowDetailShellProps
  extends
    Omit<CoreWorkflowDetailShellProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'style'> {
  style?: React.CSSProperties
  header?: React.ReactNode
  form?: React.ReactNode
  tabs?: React.ReactNode
  action?: React.ReactNode
  children?: React.ReactNode
}

function hasNode(node: React.ReactNode): boolean {
  if (node == null || node === false) return false
  if (Array.isArray(node)) return node.some(hasNode)
  return true
}

export const WorkflowDetailShell = forwardRef<HTMLDivElement, WorkflowDetailShellProps>(
  function WorkflowDetailShell(
    {
      showActions = true,
      ariaLabel,
      className,
      style,
      header,
      form,
      tabs,
      action,
      children,
      ...rest
    },
    ref
  ) {
    const showAction = showActions && hasNode(action)

    return (
      <div
        {...rest}
        ref={ref}
        className={classNames(getWorkflowDetailShellRootClasses(className))}
        style={style}
        role="region"
        aria-label={ariaLabel || WORKFLOW_DETAIL_SHELL_DEFAULT_ARIA_LABEL}
        data-tiger-workflow-detail-shell="">
        {hasNode(header) ? (
          <header className={workflowDetailShellHeaderClasses} data-slot="header">
            {header}
          </header>
        ) : null}
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
          <footer className={workflowDetailShellActionClasses} data-slot="action">
            {action}
          </footer>
        ) : null}
      </div>
    )
  }
)

WorkflowDetailShell.displayName = 'TigerWorkflowDetailShell'
