// ActivityFeed visual recipes shared by the React and Vue bindings.
export const activityFeedActionClasses =
  'tiger-motion-aware inline-flex items-center px-2.5 py-1 rounded-[var(--tiger-radius-md)] text-xs font-semibold text-[var(--tiger-primary)] hover:bg-[var(--tiger-outline-bg-hover)] [transition:var(--tiger-transition-base)]'

export const activityFeedItemSurfaceClasses =
  'tiger-motion-aware p-4 rounded-[var(--tiger-radius-xl)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] shadow-[var(--tiger-shadow-sm)] [transition:var(--tiger-transition-base)] hover:shadow-[var(--tiger-shadow-xl)] hover:-translate-y-0.5 w-full'

export const activityFeedAvatarClasses =
  'tiger-motion-aware shrink-0 ring-2 ring-[var(--tiger-surface)] shadow-[var(--tiger-shadow-sm)] [transition:var(--tiger-transition-base)] hover:scale-105'

export const activityFeedTitleClasses =
  'tiger-motion-aware text-[var(--tiger-text)] truncate'

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

export const activityFeedGroupTitleClasses =
  'text-[var(--tiger-text)] uppercase tracking-wider'

export const activityFeedDotBaseClasses =
  'w-3 h-3 rounded-full border-2 border-[var(--tiger-surface)] shadow-sm relative z-10'

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
