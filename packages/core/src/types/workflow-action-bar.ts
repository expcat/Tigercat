/**
 * WorkflowActionBar props. The component implementation stays with
 * WorkflowTimeline; the type module is its own file.
 */

import type {
  WorkflowActionBarItem,
  WorkflowActionBarViewerRole,
  WorkflowActionPayload,
  WorkflowAddsignPosition,
  WorkflowNodeButtonPolicy,
  WorkflowReturnTarget,
  WorkflowSignMode
} from './workflow-timeline'

/**
 * Presentational action-bar props. Vue/React bindings render these.
 * Display order is approve → reject → transfer → return → addsign → cancel →
 * comment, then remaining keys in original relative order. Not a BPM engine.
 */
export interface WorkflowActionBarProps {
  /**
   * Action buttons to render. Sorted approve → reject → transfer → return →
   * addsign → cancel → comment unless a custom `renderActions` replaces the bar.
   */
  items?: WorkflowActionBarItem[]
  /** Disable every action, in addition to per-item `disabled`. */
  disabled?: boolean
  /** Accessible name for the toolbar. Defaults to "Workflow actions". */
  ariaLabel?: string
  /**
   * Enable the confirm-dialog recipe for confirming actions.
   * Per-item `confirm` overrides this.
   * @default false
   */
  confirm?: boolean
  /**
   * Show a comment field in the confirm dialog.
   */
  commentInput?: boolean
  /**
   * Require a non-empty comment before `onAction` fires. Per-item
   * `commentRequired` wins.
   */
  commentRequired?: boolean
  /** Node button table used when `items` is omitted. */
  buttonPolicy?: WorkflowNodeButtonPolicy
  /** Eligible return-to nodes for the built-in radio list. */
  returnTargets?: WorkflowReturnTarget[]
  /** Add-sign positions offered in the confirm dialog. */
  addsignPositions?: WorkflowAddsignPosition[]
  /** Current node sign mode. */
  currentSignMode?: WorkflowSignMode
  /** When true, `cancel` stays visible while deriving items from `buttonPolicy`. */
  isStarter?: boolean
  /**
   * Viewer role used when deriving items from `buttonPolicy`.
   * @default 'approver'
   */
  viewerRole?: WorkflowActionBarViewerRole
  /** Overflow menu trigger label. */
  moreLabel?: string
  /** Fired after an action is confirmed. */
  onAction?: (item: WorkflowActionBarItem, payload?: WorkflowActionPayload) => void
  /** Additional CSS classes */
  className?: string
}
