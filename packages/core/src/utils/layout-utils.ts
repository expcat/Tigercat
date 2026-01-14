/**
 * Layout component shared classes
 *
 * Keep these classes framework-agnostic so Vue/React can stay thin.
 */

export const layoutRootClasses = 'tiger-layout flex flex-col min-h-screen'

export const layoutHeaderClasses =
  'tiger-header bg-[var(--tiger-surface,#ffffff)] border-b border-[var(--tiger-border,#e5e7eb)]'

export const layoutSidebarClasses =
  'tiger-sidebar bg-[var(--tiger-surface,#ffffff)] border-r border-[var(--tiger-border,#e5e7eb)] transition-all duration-300'

export const layoutContentClasses =
  'tiger-content flex-1 bg-[var(--tiger-layout-content-bg,#f9fafb)] p-6'

export const layoutFooterClasses =
  'tiger-footer bg-[var(--tiger-surface,#ffffff)] border-t border-[var(--tiger-border,#e5e7eb)] p-4'
