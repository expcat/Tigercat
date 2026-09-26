// NotificationCenter visual recipes shared by the React and Vue bindings.
export const notificationCenterItemClasses =
  'tiger-motion-aware group relative flex items-start gap-3.5 w-full p-3.5 rounded-[var(--tiger-radius-lg)] hover:bg-[var(--tiger-surface-muted)] [transition:var(--tiger-transition-base)]'

export const notificationCenterUnreadItemClasses =
  'bg-[var(--tiger-outline-bg-hover)] border-s-[3px] border-s-[var(--tiger-primary)] -ms-[3px] ps-[calc(0.875rem-3px)]'
export const notificationCenterReadItemClasses =
  'border-s-[3px] border-s-transparent -ms-[3px] ps-[calc(0.875rem-3px)]'
export const notificationCenterReadTitleClasses = 'text-[var(--tiger-text-secondary)]'
export const notificationCenterUnreadTitleClasses = 'text-[var(--tiger-text)]'
export const notificationCenterUnreadDotClasses =
  'tiger-motion-aware w-1.5 h-1.5 rounded-full bg-[var(--tiger-primary)] shrink-0 shadow-sm animate-pulse'
export const notificationCenterTimeClasses =
  'text-[11px] text-[var(--tiger-text-secondary)] font-medium whitespace-nowrap flex-shrink-0 self-center'
export const notificationCenterReadDescriptionClasses = 'text-[var(--tiger-text-secondary)]'
export const notificationCenterUnreadDescriptionClasses = 'text-[var(--tiger-text-secondary)]'
export const notificationCenterItemActionClasses =
  'tiger-motion-aware rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[var(--tiger-surface-muted)] hover:bg-[var(--tiger-ghost-bg-hover)] text-[var(--tiger-text-secondary)] border-0 flex-shrink-0 self-center [transition:var(--tiger-transition-base)]'
export const notificationCenterEmptyIconWrapperClasses =
  'p-3.5 bg-[var(--tiger-surface-muted)] rounded-full mb-3 shadow-inner'
export const notificationCenterEmptyIconClasses =
  'tiger-motion-aware w-8 h-8 text-[var(--tiger-text-secondary)] animate-pulse'
export const notificationCenterEmptyTextClasses = 'font-semibold text-[var(--tiger-text-secondary)]'
export const notificationCenterLoadingClasses = 'text-[var(--tiger-primary)] font-medium'

/**
 * One bleed that cancels the card padding. The mask is a sibling of the list
 * inside this shell, so `inset-0` covers the rows instead of the padded box
 * the negative margin used to overflow.
 */
export const notificationCenterListShellClasses = 'relative -mx-4 -mb-4'

/**
 * Opaque surface scrim. `bg-[var(--tiger-surface)]/70` does not mix alpha onto
 * a CSS variable, so the list stayed fully visible and received clicks above
 * the unlayered spinner.
 */
export const notificationCenterLoadingOverlayClasses =
  'pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-[color-mix(in_srgb,var(--tiger-surface)_92%,transparent)]'
export const notificationCenterCardClasses =
  'tiger-motion-aware w-full rounded-[var(--tiger-radius-xl)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] shadow-[var(--tiger-shadow-lg)] [transition:var(--tiger-transition-base)] overflow-hidden'
export const notificationCenterTitleClasses = 'text-[var(--tiger-text)]'
export const notificationCenterUnreadBadgeClasses =
  'tiger-motion-aware inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-[var(--tiger-primary)] text-white shadow-sm animate-pulse'
export const notificationCenterMarkAllBaseClasses =
  'tiger-motion-aware text-xs font-semibold transition-colors'
export const notificationCenterMarkAllEnabledClasses =
  'text-[var(--tiger-primary)] hover:text-[var(--tiger-primary-hover)]'
export const notificationCenterMarkAllDisabledClasses = 'text-[var(--tiger-text-secondary)]'
export const notificationCenterFilterGroupClasses =
  'inline-flex items-center gap-0.5 p-0.5 rounded-[var(--tiger-radius-md)] bg-[var(--tiger-surface-muted)] self-start'
export const notificationCenterFilterButtonClasses =
  'tiger-motion-aware px-3.5 py-1 text-xs font-semibold rounded-[var(--tiger-radius-sm)] [transition:var(--tiger-transition-base)]'
export const notificationCenterFilterActiveClasses =
  'bg-[var(--tiger-surface)] text-[var(--tiger-text)] shadow-sm'
export const notificationCenterFilterIdleClasses =
  'text-[var(--tiger-text-secondary)] hover:text-[var(--tiger-text)]'
