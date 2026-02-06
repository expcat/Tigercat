import type { TimelineMode, TimelineItemPosition } from '../types/timeline'

// --- Base classes ---
export const timelineContainerClasses = 'relative'
export const timelineListClasses = 'list-none m-0 p-0'
export const timelineItemClasses = 'relative pb-8'
export const timelineTailClasses = 'absolute w-0.5 bg-[var(--tiger-border,#e5e7eb)]'
export const timelineHeadClasses = 'absolute z-10 flex items-center justify-center'
export const timelineContentClasses = 'relative'
export const timelineCustomDotClasses = 'flex items-center justify-center'
export const timelineLabelClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)] mb-1'
export const timelineDescriptionClasses = 'text-[var(--tiger-text,#374151)]'

const dotBg = 'bg-[var(--tiger-timeline-dot,#d1d5db)]'
export const timelineDotClasses = `w-2.5 h-2.5 rounded-full border-2 border-[var(--tiger-surface,#ffffff)] ${dotBg}`

// Dot center offset: aligns the dot center with the baseline of timeline items
// This value accounts for half the dot height (5px) + border (2px × 2 / 2) + visual centering offset
const DOT_CENTER_OFFSET = '11px'

// --- Helpers ---

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
  if (mode === 'right') return `${base} pr-8 text-right`
  if (mode === 'alternate') {
    return position === 'left'
      ? `${base} pr-8 text-right flex flex-row-reverse`
      : `${base} pl-8 flex`
  }
  return `${base} pl-8`
}

export function getTimelineTailClasses(
  mode: TimelineMode,
  _position?: TimelineItemPosition,
  isLast = false,
  isFirst = false
): string {
  if (isLast) return 'hidden'
  const top = isFirst ? `top-[${DOT_CENTER_OFFSET}]` : 'top-0'
  // Extend line to the next item's dot center
  const span = `${timelineTailClasses} ${top} bottom-[-${DOT_CENTER_OFFSET}]`
  if (mode === 'right') return `${span} right-0 translate-x-1/2`
  if (mode === 'alternate') return `${span} left-1/2 -translate-x-1/2`
  return `${span} left-0 -translate-x-1/2`
}

/** Dot center aligns with sm-Avatar center (32 px → 16 px). */
export function getTimelineHeadClasses(
  mode: TimelineMode,
  _position?: TimelineItemPosition
): string {
  const top = `top-[${DOT_CENTER_OFFSET}]`
  if (mode === 'right') return `${timelineHeadClasses} right-0 ${top} translate-x-1/2`
  if (mode === 'alternate') return `${timelineHeadClasses} left-1/2 -translate-x-1/2 ${top}`
  return `${timelineHeadClasses} left-0 ${top} -translate-x-1/2`
}

export function getTimelineDotClasses(color?: string, isCustom = false): string {
  if (isCustom) return timelineCustomDotClasses
  if (color) return timelineDotClasses.replace(dotBg, '')
  return timelineDotClasses
}

export function getTimelineContentClasses(
  mode: TimelineMode,
  position?: TimelineItemPosition
): string {
  if (mode === 'right') return `${timelineContentClasses} pr-2`
  if (mode === 'alternate') {
    return position === 'left' ? `${timelineContentClasses} pr-8` : `${timelineContentClasses} pl-8`
  }
  return `${timelineContentClasses} pl-2`
}

export function getPendingDotClasses(): string {
  return 'w-2.5 h-2.5 rounded-full border-2 border-white bg-[var(--tiger-primary,#2563eb)] animate-pulse'
}
