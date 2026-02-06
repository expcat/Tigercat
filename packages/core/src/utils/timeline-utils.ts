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

// ── Position tokens ──────────────────────────────────────────────
// IMPORTANT: Tailwind JIT scans source for COMPLETE class strings.
// NEVER interpolate variables into arbitrary-value brackets
// (e.g. top-[${var}]) — the scanner will NOT resolve them.
//
// Layout math (label text-sm 20px + mb-1 4px + content ~24px = 48px):
//   Dot top  = 18px  → dot center = 18 + 5 (half 10px dot) = 23px
//   Tail top = 23px  → line starts at dot center
//   Tail bot = -23px → line extends to next item's dot center
const HEAD_TOP = 'top-[18px]'
const TAIL_TOP = 'top-[23px]'
const TAIL_BOTTOM = '-bottom-[23px]'

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
  isLast = false
): string {
  if (isLast) return 'hidden'
  const span = `${timelineTailClasses} ${TAIL_TOP} ${TAIL_BOTTOM}`
  if (mode === 'right') return `${span} right-0 translate-x-1/2`
  if (mode === 'alternate') return `${span} left-1/2 -translate-x-1/2`
  return `${span} left-0 -translate-x-1/2`
}

export function getTimelineHeadClasses(
  mode: TimelineMode,
  _position?: TimelineItemPosition
): string {
  if (mode === 'right') return `${timelineHeadClasses} right-0 ${HEAD_TOP} translate-x-1/2`
  if (mode === 'alternate') return `${timelineHeadClasses} left-1/2 -translate-x-1/2 ${HEAD_TOP}`
  return `${timelineHeadClasses} left-0 ${HEAD_TOP} -translate-x-1/2`
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
