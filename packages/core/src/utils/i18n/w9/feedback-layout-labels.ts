/**
 * W9 strings that are not in locale data files.
 * Modal confirm copy still comes from `locale.modal`.
 */

export interface FeedbackLayoutLabels {
  sidebarCollapse: string
  sidebarExpand: string
  skeletonBusy: string
  resizableLive: string
  drawerResize: string
  splitterExpand: string
  splitterCollapse: string
  progressIndeterminate: string
  listLoading: string
  masonryOrder: string
}

export const feedbackLayoutLabels: FeedbackLayoutLabels = {
  sidebarCollapse: 'Collapse sidebar',
  sidebarExpand: 'Expand sidebar',
  skeletonBusy: 'Loading',
  resizableLive: '{width} by {height}',
  drawerResize: 'Resize drawer',
  splitterExpand: 'Expand panel',
  splitterCollapse: 'Collapse panel',
  progressIndeterminate: 'In progress',
  listLoading: 'Loading list',
  masonryOrder: 'Visual order differs from source order'
}

export function formatFeedbackLayoutLabel(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}
