/**
 * Shared fork/join geometry for the approval tree.
 *
 * WorkflowDesigner (flex columns) and WorkflowViewer (grid columns) both
 * separate branches by `--tiger-workflow-branch-gap`. A horizontal bar has to
 * run from the center of the first branch column to the center of the last.
 * `50 / n` percent ignores that gap, so the bar stops short of every child axis.
 */

export const WORKFLOW_BRANCH_GAP = '0.75rem'
export const WORKFLOW_BRANCH_GAP_VAR = '--tiger-workflow-branch-gap'

/** Half of the viewer card cap (`max-w` is twice this). Loop arms use the same token. */
export const WORKFLOW_VIEWER_CARD_HALF = '9rem'
export const WORKFLOW_VIEWER_CARD_HALF_VAR = '--tiger-workflow-card-half'

export function workflowBranchGapValue(): string {
  return `var(${WORKFLOW_BRANCH_GAP_VAR}, ${WORKFLOW_BRANCH_GAP})`
}

export function workflowViewerCardHalfValue(): string {
  return `var(${WORKFLOW_VIEWER_CARD_HALF_VAR}, ${WORKFLOW_VIEWER_CARD_HALF})`
}

/**
 * CSS length from the start of an equal-column track to the center of the
 * group that begins `columnsBefore` columns in and is `groupCols` wide.
 * `100%` is the track (columns plus the gaps between them).
 */
export function workflowColumnCenter(
  columns: number,
  columnsBefore: number,
  groupCols: number
): string {
  const gap = workflowBranchGapValue()
  const n = Math.max(1, columns)
  const w = Math.max(1, groupCols)
  const parts: string[] = []
  if (columnsBefore > 0) parts.push(`${columnsBefore} * (100% + ${gap}) / ${n}`)
  parts.push(`${w} * (100% - ${n - 1} * ${gap}) / ${2 * n}`)
  if (w > 1) parts.push(`${w - 1} * ${gap} / 2`)
  return `calc(${parts.join(' + ')})`
}

/**
 * Width of the designer fork bar: the distance between the first and last
 * equal-column centers, including the flex gap.
 */
export function workflowForkTrackWidth(branchCount: number): string {
  if (branchCount < 2) return '0px'
  const gap = workflowBranchGapValue()
  return `calc(100% - (100% - ${branchCount - 1} * ${gap}) / ${branchCount})`
}
