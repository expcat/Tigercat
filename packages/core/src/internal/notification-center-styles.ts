// NotificationCenter visual recipes shared by the React and Vue bindings.
export const notificationCenterItemClasses =
  'tiger-motion-aware group relative flex items-start gap-3.5 w-full p-3.5 rounded-[var(--tiger-radius-lg,0.75rem)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'

export const notificationCenterUnreadItemClasses =
  'bg-[var(--tiger-outline-bg-hover,#eff6ff)] border-l-[3px] border-l-[var(--tiger-primary,#2563eb)] -ml-[3px] pl-[calc(0.875rem-3px)]'
export const notificationCenterReadItemClasses =
  'border-l-[3px] border-l-transparent -ml-[3px] pl-[calc(0.875rem-3px)]'
export const notificationCenterReadTitleClasses = 'text-[var(--tiger-text-secondary,#4b5563)]'
export const notificationCenterUnreadTitleClasses = 'text-[var(--tiger-text,#111827)]'
export const notificationCenterUnreadDotClasses =
  'tiger-motion-aware w-1.5 h-1.5 rounded-full bg-[var(--tiger-primary,#2563eb)] shrink-0 shadow-sm animate-pulse'
export const notificationCenterTimeClasses =
  'text-[11px] text-[var(--tiger-text-muted,#6b7280)] font-medium whitespace-nowrap flex-shrink-0 self-center'
export const notificationCenterReadDescriptionClasses = 'text-[var(--tiger-text-muted,#6b7280)]'
export const notificationCenterUnreadDescriptionClasses =
  'text-[var(--tiger-text-secondary,#4b5563)]'
export const notificationCenterItemActionClasses =
  'tiger-motion-aware opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[var(--tiger-surface-muted,#f3f4f6)] hover:bg-[var(--tiger-fill-hover,#e5e7eb)] text-[var(--tiger-text-secondary,#374151)] border-0 flex-shrink-0 self-center [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'
export const notificationCenterEmptyIconWrapperClasses =
  'p-3.5 bg-[var(--tiger-surface-muted,#f9fafb)] rounded-full mb-3 shadow-inner'
export const notificationCenterEmptyIconClasses =
  'tiger-motion-aware w-8 h-8 text-[var(--tiger-text-muted,#9ca3af)] animate-pulse'
export const notificationCenterEmptyTextClasses =
  'font-semibold text-[var(--tiger-text-muted,#6b7280)]'
export const notificationCenterLoadingClasses = 'text-[var(--tiger-primary,#2563eb)] font-medium'
export const notificationCenterCardClasses =
  'tiger-motion-aware w-full rounded-[var(--tiger-radius-xl,1rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-[var(--tiger-shadow-glass,0_8px_30px_rgb(0_0_0_/_0.04))] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))] overflow-hidden'
export const notificationCenterTitleClasses = 'text-[var(--tiger-text,#111827)]'
export const notificationCenterUnreadBadgeClasses =
  'tiger-motion-aware inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-[var(--tiger-primary,#2563eb)] text-white shadow-sm animate-pulse'
export const notificationCenterMarkAllBaseClasses =
  'tiger-motion-aware text-xs font-semibold transition-colors'
export const notificationCenterMarkAllEnabledClasses =
  'text-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary-hover,#1d4ed8)]'
export const notificationCenterMarkAllDisabledClasses = 'text-[var(--tiger-text-muted,#9ca3af)]'
export const notificationCenterFilterGroupClasses =
  'inline-flex items-center gap-0.5 p-0.5 rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-surface-muted,#f3f4f6)] self-start'
export const notificationCenterFilterButtonClasses =
  'tiger-motion-aware px-3.5 py-1 text-xs font-semibold rounded-[var(--tiger-radius-sm,0.375rem)] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'
export const notificationCenterFilterActiveClasses =
  'bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text,#111827)] shadow-sm'
export const notificationCenterFilterIdleClasses =
  'text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-text,#111827)]'
