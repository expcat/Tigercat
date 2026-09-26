import type { TimelineItem, TimelineItemPosition, TimelineMode } from '../types/timeline'

export const EMPTY_TIMELINE_ITEMS: TimelineItem[] = []

export const timelineContainerClasses = 'relative'
export const timelineListClasses = 'list-none m-0 p-0'
export const timelineItemClasses = 'relative pb-8'
/**
 * Vertical connector hook. Width, centering, and the run from this node's
 * center to the next node's center live in {@link timelineBaseStyles}.
 * A 1px stroke in a zero-width column snaps to the right of an even-sized
 * dot at 1x, so the stroke is an even 2px centered on the node column.
 */
export const timelineTailClasses = 'tiger-timeline-tail bg-[var(--tiger-border)]'
export const timelineHeadClasses =
  'tiger-timeline-node pointer-events-auto relative z-10 flex shrink-0 items-center justify-center'
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
  const root = `tiger-timeline ${timelineContainerClasses}`
  if (mode === 'horizontal') return `${root} flex flex-row overflow-x-auto`
  if (mode === 'alternate') return `${root} flex flex-col`
  return root
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
 * Vertical: a node-sized column (see {@link timelineBaseStyles}), stretched
 * through the item so the stroke can reach the next node. Not `w-0`: a
 * zero-width flex line centers a 1px stroke on a half pixel and the line
 * paints to the right of the dot.
 * Horizontal: a row as wide as the item; leading and trailing halves meet
 * the neighboring item at the shared edge.
 */
export function getTimelineAxisClasses(mode: TimelineMode): string {
  if (mode === 'horizontal') return 'tiger-timeline-axis relative flex items-center self-stretch'
  const column =
    'tiger-timeline-axis pointer-events-none absolute inset-y-0 flex flex-col items-center'
  if (mode === 'right') return `${column} end-0`
  if (mode === 'alternate') return `${column} start-1/2`
  return `${column} start-0`
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

// `:is()` so a following child combinator applies to every mode. A comma
// list would attach `> .tiger-timeline-tail` only to the last selector and
// the left/right rules would style the axis itself (overriding `absolute`).
const timelineVerticalAxisSelector =
  ':is(.tiger-timeline-axis[data-timeline-axis="left"], .tiger-timeline-axis[data-timeline-axis="right"], .tiger-timeline-axis[data-timeline-axis="alternate"])'

/**
 * Vertical rail geometry. Ships with the Tailwind plugin so the stroke stays
 * on the node mid-axis even when utility strings are not scanned.
 *
 * The column is `--tiger-timeline-node-size` wide. The stroke is 2px
 * (`--tiger-timeline-stroke`) and its inline-start edge sits at 50% with a
 * negative half-stroke margin, which centers it in both writing directions.
 * It runs from this node's center to the next node's center (the node paints
 * above the stroke). Nothing is drawn above the first node.
 *
 * `--tiger-timeline-anchor-center` is the distance from the item top to the
 * node center. The default is half the node, so the marker stays on the
 * first line. ActivityFeed sets it to the avatar center.
 */
export const timelineBaseStyles = {
  '.tiger-timeline': {
    '--tiger-timeline-node-size': '0.625rem',
    '--tiger-timeline-stroke': '0.125rem',
    '--tiger-timeline-anchor-center': 'calc(var(--tiger-timeline-node-size) / 2)'
  },
  [timelineVerticalAxisSelector]: {
    width: 'var(--tiger-timeline-node-size)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  '.tiger-timeline-axis[data-timeline-axis="alternate"]': {
    marginInlineStart: 'calc(var(--tiger-timeline-node-size) / -2)'
  },
  [`${timelineVerticalAxisSelector} > .tiger-timeline-node`]: {
    position: 'relative',
    zIndex: '1',
    boxSizing: 'border-box',
    flexShrink: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--tiger-timeline-node-size)',
    height: 'var(--tiger-timeline-node-size)',
    marginTop: 'calc(var(--tiger-timeline-anchor-center) - var(--tiger-timeline-node-size) / 2)'
  },
  [`${timelineVerticalAxisSelector} > .tiger-timeline-tail`]: {
    position: 'absolute',
    zIndex: '0',
    boxSizing: 'border-box',
    inlineSize: 'var(--tiger-timeline-stroke)',
    insetInlineStart: '50%',
    marginInlineStart: 'calc(var(--tiger-timeline-stroke) / -2)',
    insetBlockStart: 'var(--tiger-timeline-anchor-center)',
    insetBlockEnd: 'calc(var(--tiger-timeline-anchor-center) * -1)',
    backgroundColor: 'var(--tiger-border)'
  }
} as const
