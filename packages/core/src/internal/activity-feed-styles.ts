// ActivityFeed visual recipes shared by the React and Vue bindings.
export const activityFeedActionClasses =
  'tiger-motion-aware inline-flex items-center px-2.5 py-1 rounded-[var(--tiger-radius-md,0.5rem)] text-xs font-semibold text-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'

export const activityFeedItemSurfaceClasses =
  'tiger-motion-aware p-4 rounded-[var(--tiger-radius-xl,1rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-[var(--tiger-shadow-sm,0_1px_2px_rgb(0_0_0_/_0.05))] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))] hover:shadow-[var(--tiger-shadow-glass-strong,0_4px_6px_-1px_rgb(0_0_0_/_0.1))] hover:-translate-y-0.5 w-full'

export const activityFeedAvatarClasses =
  'tiger-motion-aware shrink-0 ring-2 ring-[var(--tiger-surface,#ffffff)] shadow-[var(--tiger-shadow-sm,0_1px_2px_rgb(0_0_0_/_0.05))] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))] hover:scale-105'

export const activityFeedTitleClasses =
  'tiger-motion-aware text-[var(--tiger-text,#111827)] hover:text-[var(--tiger-primary,#2563eb)] transition-colors cursor-pointer truncate'

export const activityFeedTimeClasses =
  'shrink-0 whitespace-nowrap font-medium text-[var(--tiger-text-muted,#6b7280)]'

export const activityFeedDescriptionClasses =
  'text-[var(--tiger-text-secondary,#4b5563)] leading-relaxed pl-0.5 mt-1'

export const activityFeedStateCardClasses =
  'bg-[var(--tiger-surface,#ffffff)] border-[var(--tiger-border,#e5e7eb)] rounded-[var(--tiger-radius-xl,1rem)] shadow-[var(--tiger-shadow-sm,0_1px_2px_rgb(0_0_0_/_0.05))] overflow-hidden'

export const activityFeedLoadingClasses = 'text-[var(--tiger-primary,#2563eb)] font-medium'

export const activityFeedEmptyIconClasses =
  'tiger-motion-aware w-12 h-12 text-[var(--tiger-text-muted,#9ca3af)] mb-3 animate-pulse'

export const activityFeedGroupMarkerClasses =
  'w-1.5 h-3.5 bg-[var(--tiger-primary,#2563eb)] rounded-full shadow-sm'

export const activityFeedGroupTitleClasses =
  'text-[var(--tiger-text,#111827)] uppercase tracking-wider'

export const activityFeedDotBaseClasses =
  'w-3 h-3 rounded-full border-2 border-[var(--tiger-surface,#ffffff)] shadow-sm relative z-10'

export const activityFeedDotPulseBaseClasses =
  'tiger-motion-aware absolute inline-flex h-full w-full rounded-full animate-ping opacity-75'

const dotVariantClasses: Record<string, string> = {
  success: 'bg-[var(--tiger-success,#16a34a)]',
  warning: 'bg-[var(--tiger-warning,#d97706)]',
  error: 'bg-[var(--tiger-error,#dc2626)]',
  danger: 'bg-[var(--tiger-error,#dc2626)]',
  primary: 'bg-[var(--tiger-primary,#2563eb)]',
  info: 'bg-[var(--tiger-primary,#2563eb)]'
}

const dotPulseVariantClasses: Record<string, string> = {
  success: 'bg-[var(--tiger-success,#16a34a)]/30',
  warning: 'bg-[var(--tiger-warning,#d97706)]/30',
  error: 'bg-[var(--tiger-error,#dc2626)]/30',
  danger: 'bg-[var(--tiger-error,#dc2626)]/30',
  primary: 'bg-[var(--tiger-primary,#2563eb)]/30',
  info: 'bg-[var(--tiger-primary,#2563eb)]/30'
}

export const getActivityFeedDotClasses = (variant?: string) => ({
  dot: dotVariantClasses[variant ?? ''] ?? 'bg-[var(--tiger-border,#d1d5db)]',
  pulse: dotPulseVariantClasses[variant ?? ''] ?? ''
})
