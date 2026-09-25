import type { TimelineItem, TimelineItemPosition, TimelineMode } from '../types/timeline'

export const EMPTY_TIMELINE_ITEMS: TimelineItem[] = []

export const timelineContainerClasses = 'relative'
export const timelineListClasses = 'list-none m-0 p-0'
export const timelineItemClasses = 'relative pb-8'
/**
 * Vertical connector. A flex sibling of the node, so it starts on the node's
 * edge and ends on the next node's edge. A fixed `top`/`bottom` offset left
 * a stub above the first node and white gaps at each joint.
 */
export const timelineTailClasses = 'min-h-0 w-px flex-1 bg-[var(--tiger-border)]'
export const timelineHeadClasses =
  'pointer-events-auto relative z-10 flex shrink-0 items-center justify-center'
export const timelineContentClasses = 'relative'
export const timelineCustomDotClasses = 'flex shrink-0 items-center justify-center'
export const timelineLabelClasses = 'text-sm text-[var(--tiger-text-secondary)] mb-1'
export const timelineHorizontalLabelClasses = `${timelineLabelClasses} w-full px-4 text-center`
export const timelineDescriptionClasses = 'text-[var(--tiger-text)]'

const timelineDotBase = 'block h-2.5 w-2.5 shrink-0 rounded-full'
const timelineDotBg = 'bg-[var(--tiger-border)]'
export const timelineDotClasses = `${timelineDotBase} ${timelineDotBg}`

export type TimelineRailSegment = 'before' | 'after'

export function getTimelineItemKey(item: TimelineItem, index: number): string | number {
  return item.key ?? index
}

export interface ProcessTimelineItemsOptions {
  reverse?: boolean
  mode?: TimelineMode
}

/**
 * Copy, optionally reverse, and fill alternate `position`.
 * Pending items are appended by the renderer after this list
 * (they stay at the DOM end even when `reverse` is set).
 */
export function processTimelineItems(
  items: TimelineItem[] | undefined,
  options: ProcessTimelineItemsOptions = {}
): TimelineItem[] {
  const source = items ?? EMPTY_TIMELINE_ITEMS
  const list = options.reverse ? [...source].reverse() : source
  if (options.mode !== 'alternate') return list
  return list.map((item, index) => ({
    ...item,
    position: (item.position ?? (index % 2 === 0 ? 'left' : 'right')) as TimelineItemPosition
  }))
}

export function getTimelineContainerClasses(mode: TimelineMode): string {
  if (mode === 'horizontal') return `${timelineContainerClasses} flex flex-row overflow-x-auto`
  if (mode === 'alternate') return `${timelineContainerClasses} flex flex-col`
  return timelineContainerClasses
}

export function getTimelineItemClasses(
  mode: TimelineMode,
  position?: TimelineItemPosition,
  isLast = false
): string {
  const base = isLast ? 'relative pb-0' : timelineItemClasses
  if (mode === 'horizontal') return `${base} flex flex-col items-center`
  if (mode === 'right') return `${base} pe-8`
  if (mode === 'alternate') {
    return `${base} grid grid-cols-2`
  }
  return `${base} ps-8`
}

/**
 * Track that holds the node and its connector.
 * Vertical: a zero-width column on the axis, stretched through the item
 * (including the gap under the copy) so the stroke meets the next node.
 * Horizontal: a row as wide as the item; leading and trailing halves meet
 * the neighboring item at the shared edge.
 */
export function getTimelineAxisClasses(mode: TimelineMode): string {
  if (mode === 'horizontal') return 'relative flex items-center self-stretch'
  if (mode === 'right') {
    return 'pointer-events-none absolute inset-y-0 end-0 flex w-0 flex-col items-center'
  }
  if (mode === 'alternate') {
    return 'pointer-events-none absolute inset-y-0 start-1/2 flex w-0 flex-col items-center'
  }
  return 'pointer-events-none absolute inset-y-0 start-0 flex w-0 flex-col items-center'
}

/**
 * Connector stroke.
 * `omitStroke` hides the paint. On a horizontal rail the spacer stays so the
 * node remains centered; pass it for the leading half of the first item and
 * the trailing half of the last. Vertical rails only paint the `after` segment.
 */
export function getTimelineTailClasses(
  mode: TimelineMode,
  omitStroke = false,
  segment: TimelineRailSegment = 'after'
): string {
  if (mode === 'horizontal') {
    const track = 'h-px min-w-0 flex-1'
    if (omitStroke) return track
    return `${track} bg-[var(--tiger-border)]`
  }
  if (omitStroke || segment === 'before') return 'hidden'
  return timelineTailClasses
}

export function getTimelineHeadClasses(_mode: TimelineMode): string {
  return timelineHeadClasses
}

export function getTimelineDotClasses(color?: string, isCustom = false): string {
  if (isCustom) return timelineCustomDotClasses
  return color ? timelineDotBase : timelineDotClasses
}

export function getTimelineContentClasses(
  mode: TimelineMode,
  position?: TimelineItemPosition
): string {
  if (mode === 'horizontal') return `${timelineContentClasses} px-4 pt-2 text-center`
  if (mode === 'right') return `${timelineContentClasses} pe-2`
  if (mode === 'alternate') {
    return position === 'left'
      ? `${timelineContentClasses} col-start-1 w-full max-w-full pe-8 text-end`
      : `${timelineContentClasses} col-start-2 w-full max-w-full ps-8 text-start`
  }
  return `${timelineContentClasses} ps-2`
}

export function getPendingDotClasses(): string {
  return 'block h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--tiger-primary)] animate-pulse motion-reduce:animate-none'
}

export interface TimelineDotRenderOptions {
  pending?: boolean
}
