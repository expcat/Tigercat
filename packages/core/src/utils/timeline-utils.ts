import type { TimelineItem, TimelineItemPosition, TimelineMode } from '../types/timeline'

export const EMPTY_TIMELINE_ITEMS: TimelineItem[] = []

export const timelineContainerClasses = 'relative'
export const timelineListClasses = 'list-none m-0 p-0'
export const timelineItemClasses = 'relative pb-8'
export const timelineTailClasses = 'absolute w-0.5 bg-[var(--tiger-border,#e5e7eb)]'
export const timelineHeadClasses =
  'absolute z-10 flex h-[1.25rem] items-center justify-center'
export const timelineContentClasses = 'relative'
export const timelineCustomDotClasses = 'flex items-center justify-center'
export const timelineLabelClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)] mb-1'
export const timelineDescriptionClasses = 'text-[var(--tiger-text,#374151)]'

const timelineDotBase = 'w-2.5 h-2.5 rounded-full border-2 border-[var(--tiger-surface,#ffffff)]'
const timelineDotBg = 'bg-[var(--tiger-border,#d1d5db)]'
export const timelineDotClasses = `${timelineDotBase} ${timelineDotBg}`

const AXIS_TRANSLATE = '-translate-x-1/2 rtl:translate-x-1/2'
const AXIS_TRANSLATE_END = 'translate-x-1/2 rtl:-translate-x-1/2'

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
  if (mode === 'alternate') return `${timelineContainerClasses} flex flex-col`
  return timelineContainerClasses
}

export function getTimelineItemClasses(
  mode: TimelineMode,
  position?: TimelineItemPosition,
  isLast = false
): string {
  const base = isLast ? 'relative pb-0' : timelineItemClasses
  if (mode === 'right') return `${base} pe-8`
  if (mode === 'alternate') {
    return `${base} grid grid-cols-2`
  }
  return `${base} ps-8`
}

export function getTimelineTailClasses(mode: TimelineMode, isLast = false): string {
  if (isLast) return 'hidden'
  const span = `${timelineTailClasses} top-[1.25rem] -bottom-[1.25rem]`
  if (mode === 'right') return `${span} end-0 ${AXIS_TRANSLATE_END}`
  if (mode === 'alternate') return `${span} start-1/2 ${AXIS_TRANSLATE}`
  return `${span} start-0 ${AXIS_TRANSLATE}`
}

export function getTimelineHeadClasses(mode: TimelineMode): string {
  if (mode === 'right') {
    return `${timelineHeadClasses} end-0 ${AXIS_TRANSLATE_END}`
  }
  if (mode === 'alternate') {
    return `${timelineHeadClasses} start-1/2 ${AXIS_TRANSLATE}`
  }
  return `${timelineHeadClasses} start-0 ${AXIS_TRANSLATE}`
}

export function getTimelineDotClasses(color?: string, isCustom = false): string {
  if (isCustom) return timelineCustomDotClasses
  return color ? timelineDotBase : timelineDotClasses
}

export function getTimelineContentClasses(
  mode: TimelineMode,
  position?: TimelineItemPosition
): string {
  if (mode === 'right') return `${timelineContentClasses} pe-2`
  if (mode === 'alternate') {
    return position === 'left'
      ? `${timelineContentClasses} col-start-1 w-full max-w-full pe-8 text-end`
      : `${timelineContentClasses} col-start-2 w-full max-w-full ps-8 text-start`
  }
  return `${timelineContentClasses} ps-2`
}

export function getPendingDotClasses(): string {
  return 'w-2.5 h-2.5 rounded-full border-2 border-[var(--tiger-surface,#ffffff)] bg-[var(--tiger-primary,#2563eb)] animate-pulse motion-reduce:animate-none'
}

export interface TimelineDotRenderOptions {
  pending?: boolean
}
