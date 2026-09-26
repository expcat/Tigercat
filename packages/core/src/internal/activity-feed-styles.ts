// ActivityFeed visual recipes shared by the React and Vue bindings.
export const activityFeedActionClasses =
  'tiger-motion-aware inline-flex items-center px-2.5 py-1 rounded-[var(--tiger-radius-md)] text-xs font-semibold text-[var(--tiger-primary)] hover:bg-[var(--tiger-outline-bg-hover)] [transition:var(--tiger-transition-base)]'

export const activityFeedItemSurfaceClasses =
  'tiger-motion-aware p-4 rounded-[var(--tiger-radius-xl)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] shadow-[var(--tiger-shadow-sm)] [transition:var(--tiger-transition-base)] hover:shadow-[var(--tiger-shadow-xl)] hover:-translate-y-0.5 w-full'

export const activityFeedAvatarClasses =
  'tiger-motion-aware shrink-0 ring-2 ring-[var(--tiger-surface)] shadow-[var(--tiger-shadow-sm)] [transition:var(--tiger-transition-base)] hover:scale-105'

export const activityFeedTitleClasses = 'tiger-motion-aware text-[var(--tiger-text)] truncate'

export const activityFeedTimeClasses =
  'shrink-0 whitespace-nowrap font-medium text-[var(--tiger-text-secondary)]'

export const activityFeedDescriptionClasses =
  'text-[var(--tiger-text-secondary)] leading-relaxed pl-0.5 mt-1'

export const activityFeedStateCardClasses =
  'bg-[var(--tiger-surface)] border-[var(--tiger-border)] rounded-[var(--tiger-radius-xl)] shadow-[var(--tiger-shadow-sm)] overflow-hidden'

export const activityFeedLoadingClasses = 'text-[var(--tiger-primary)] font-medium'

export const activityFeedEmptyIconClasses =
  'tiger-motion-aware w-12 h-12 text-[var(--tiger-text-secondary)] mb-3 animate-pulse'

export const activityFeedGroupMarkerClasses =
  'w-1.5 h-3.5 bg-[var(--tiger-primary)] rounded-full shadow-sm'

export const activityFeedGroupTitleClasses = 'text-[var(--tiger-text)] uppercase tracking-wider'

export const activityFeedDotBaseClasses =
  'box-border block h-3 w-3 rounded-full border-2 border-[var(--tiger-surface)] shadow-sm relative z-10'

/** Same diameter as the dot (`w-3`) so the marker fills the timeline node box. */
export const activityFeedTimelineDotWrapClasses =
  'relative flex h-3 w-3 shrink-0 items-center justify-center'

/**
 * Status-dot diameter. Matches the old `w-3` marker (`--spacing` * 3).
 * The timeline node box uses this so the stroke centers on the dot.
 */
export const activityFeedTimelineNodeSize = 'calc(var(--spacing, 0.25rem) * 3)'

/**
 * Distance from the timeline item top to the avatar center.
 * Card border + `p-4` + half the sm avatar. The feed sets this as
 * `--tiger-timeline-anchor-center` so the shared rail meets the avatar.
 */
export const activityFeedTimelineAvatarAnchor =
  'calc(1px + (var(--spacing, 0.25rem) * 4) + (var(--tiger-component-avatar-size-sm, 2rem) / 2))'

/** Same card inset, centered on a text-sm line when the feed hides avatars. */
export const activityFeedTimelineTextAnchor = 'calc(1px + (var(--spacing, 0.25rem) * 4) + 0.625rem)'

export function activityFeedTimelineStyle(showAvatar: boolean): Record<string, string> {
  return {
    '--tiger-timeline-node-size': activityFeedTimelineNodeSize,
    '--tiger-timeline-anchor-center': showAvatar
      ? activityFeedTimelineAvatarAnchor
      : activityFeedTimelineTextAnchor
  }
}

export const activityFeedDotPulseBaseClasses =
  'tiger-motion-aware absolute inline-flex h-full w-full rounded-full animate-ping opacity-75'

const dotVariantClasses: Record<string, string> = {
  success: 'bg-[var(--tiger-success)]',
  warning: 'bg-[var(--tiger-warning)]',
  danger: 'bg-[var(--tiger-error)]',
  primary: 'bg-[var(--tiger-primary)]',
  info: 'bg-[var(--tiger-primary)]',
  processing: 'bg-[var(--tiger-primary)]'
}

const dotPulseVariantClasses: Record<string, string> = {
  processing: 'bg-[var(--tiger-primary)]/30'
}

export const getActivityFeedDotClasses = (variant?: string) => ({
  dot: dotVariantClasses[variant ?? ''] ?? 'bg-[var(--tiger-border)]',
  pulse: variant === 'processing' ? (dotPulseVariantClasses.processing ?? '') : ''
})
