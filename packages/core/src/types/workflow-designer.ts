/**
 * Simple JSON-tree workflow editor. Same {@link WorkflowTimelineStep} model as
 * WorkflowViewer / WorkflowTimeline — not a BPMN / Flowable / Camunda designer.
 */

import type { TigerLocale, TigerLocaleWorkflowDesigner } from './locale'
import type { WorkflowTimelineStep } from './workflow-timeline'

/**
 * Path of step `key`s from the root list down to a node.
 * An empty path is the root list.
 */
export type WorkflowDesignerPath = readonly string[]

/**
 * Patch applied to one {@link WorkflowTimelineStep}. `children` is ignored;
 * use insert / remove helpers for structure.
 */
export type WorkflowDesignerStepPatch = Omit<Partial<WorkflowTimelineStep>, 'children' | 'key'>

/**
 * Shared WorkflowDesigner props. Vue binds `modelValue` / `update:modelValue`.
 *
 * Unselected nodes are summary cards; select one to edit title / kind /
 * signMode / actors. Sibling insert is still a JSON tree, not BPMN.
 * Optional `path` scopes editing to that node's children; `onChange` still
 * emits the full tree so the parent can tree-shake this editor via subpath.
 */
export interface WorkflowDesignerProps {
  /**
   * Full workflow tree. Controlled when passed (including `[]`).
   */
  value?: WorkflowTimelineStep[]
  /**
   * Uncontrolled initial tree.
   */
  defaultValue?: WorkflowTimelineStep[]
  /**
   * Parent path of the list being edited. Omitted / `[]` edits the root list.
   * When set, the designer shows that node's children and writes them back
   * into the full tree.
   */
  path?: WorkflowDesignerPath
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * @default false
   */
  readonly?: boolean
  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>
  /**
   * Designer chrome overlay. Wins over `locale.workflowDesigner`.
   */
  labels?: Partial<TigerLocaleWorkflowDesigner>
  /**
   * Accessible name for the designer region.
   */
  ariaLabel?: string
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Emits the full tree after an edit.
   */
  onChange?: (steps: WorkflowTimelineStep[]) => void
  /**
   * Emits the selected node's full path (from the tree root) and step.
   */
  onSelect?: (path: WorkflowDesignerPath, step: WorkflowTimelineStep | undefined) => void
}
