/**
 * Steps component utilities
 */

import type { StepsDirection, StepStatus, StepSize } from '../types/steps'

/**
 * Checkmark character used by StepsItem when status is "finish"
 */
export const stepFinishChar = '✓'

/**
 * Get Steps container classes
 */
export function getStepsContainerClasses(direction: StepsDirection): string {
  const baseClasses = 'tiger-steps w-full list-none m-0 p-0'

  if (direction === 'vertical') {
    return `${baseClasses} flex flex-col`
  }

  return `${baseClasses} flex flex-row items-start`
}

/**
 * Get Step item container classes
 */
export function getStepItemClasses(
  direction: StepsDirection,
  isLast: boolean
): string {
  const baseClasses = 'tiger-step-item relative'

  if (direction === 'vertical') {
    return `${baseClasses} flex flex-row ${!isLast ? 'pb-6' : ''}`
  }

  return `${baseClasses} flex flex-col flex-1 items-center`
}

/**
 * Get Step icon container classes
 */
export function getStepIconClasses(
  status: StepStatus,
  size: StepSize,
  simple: boolean,
  isCustomIcon: boolean
): string {
  const baseClasses =
    'tiger-step-icon relative z-10 flex items-center justify-center rounded-full border-2'

  // Size classes
  const sizeClasses = simple
    ? 'w-6 h-6 text-xs'
    : size === 'small'
      ? 'w-8 h-8 text-sm'
      : 'w-10 h-10 text-base'

  // Custom icon might need less padding
  const iconClasses = isCustomIcon ? '' : 'font-medium'

  // Status-based colors using CSS variables with fallbacks
  const activeClasses = 'bg-[var(--tiger-primary,#2563eb)] border-[var(--tiger-primary,#2563eb)] text-white'
  const statusClasses = {
    wait: 'bg-[var(--tiger-surface-muted,#f3f4f6)] border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text-muted,#6b7280)]',
    process: activeClasses,
    finish: activeClasses,
    error:
      'bg-[var(--tiger-error-bg,#fef2f2)] border-[var(--tiger-error,#ef4444)] text-[var(--tiger-error,#ef4444)]'
  }

  return `${baseClasses} ${sizeClasses} ${iconClasses} ${statusClasses[status]}`
}

/**
 * Get Step tail/connector line classes
 */
export function getStepTailClasses(
  direction: StepsDirection,
  status: StepStatus,
  isLast: boolean,
  size: StepSize,
  simple: boolean
): string {
  if (isLast) return 'hidden'

  const colorClasses =
    status === 'finish' ? 'bg-[var(--tiger-primary,#2563eb)]' : 'bg-[var(--tiger-border,#e5e7eb)]'

  // Icon sizes: simple → w-6(24px), small → w-8(32px), default → w-10(40px)
  // Center offset: simple → 12px(top-3/left-3), small → 16px(top-4/left-4), default → 20px(top-5/left-5)
  // Below-icon offset: simple → 24px(top-6), small → 32px(top-8), default → 40px(top-10)
  // Use full class strings so Tailwind JIT can detect them
  if (direction === 'vertical') {
    const verticalClasses = simple
      ? 'absolute left-3 top-6 w-0.5 h-full'
      : size === 'small'
        ? 'absolute left-4 top-8 w-0.5 h-full'
        : 'absolute left-5 top-10 w-0.5 h-full'
    return `tiger-step-tail ${verticalClasses} ${colorClasses}`
  }

  const horizontalClasses = simple
    ? 'absolute top-3 left-1/2 w-full h-0.5'
    : size === 'small'
      ? 'absolute top-4 left-1/2 w-full h-0.5'
      : 'absolute top-5 left-1/2 w-full h-0.5'

  return `tiger-step-tail ${horizontalClasses} ${colorClasses}`
}

/**
 * Get Step content container classes
 */
export function getStepContentClasses(direction: StepsDirection): string {
  const baseClasses = 'tiger-step-content'

  if (direction === 'vertical') {
    return `${baseClasses} ml-4 flex-1`
  }

  return `${baseClasses} mt-2 text-center`
}

/**
 * Get Step title classes
 */
export function getStepTitleClasses(
  status: StepStatus,
  size: StepSize,
  clickable: boolean
): string {
  const baseClasses = 'tiger-step-title font-medium'

  const sizeClasses = size === 'small' ? 'text-sm' : 'text-base'

  const statusClasses = {
    wait: 'text-[var(--tiger-text-muted,#6b7280)]',
    process: 'text-[var(--tiger-text,#111827)]',
    finish: 'text-[var(--tiger-text,#111827)]',
    error: 'text-[var(--tiger-error,#ef4444)]'
  }

  const cursorClasses = clickable
    ? 'bg-transparent border-0 p-0 cursor-pointer hover:text-[var(--tiger-primary,#2563eb)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tiger-surface,#ffffff)]'
    : ''

  return `${baseClasses} ${sizeClasses} ${statusClasses[status]} ${cursorClasses}`
}

/**
 * Get Step description classes
 */
export function getStepDescriptionClasses(status: StepStatus, size: StepSize): string {
  const baseClasses = 'tiger-step-description mt-1'

  const sizeClasses = size === 'small' ? 'text-xs' : 'text-sm'

  const statusClass = status === 'error'
    ? 'text-[var(--tiger-error,#ef4444)]'
    : 'text-[var(--tiger-text-muted,#6b7280)]'

  return `${baseClasses} ${sizeClasses} ${statusClass}`
}

/**
 * Calculate step status based on current index
 */
export function calculateStepStatus(
  index: number,
  currentIndex: number,
  currentStatus: StepStatus,
  customStatus?: StepStatus
): StepStatus {
  // Use custom status if provided
  if (customStatus) {
    return customStatus
  }

  // Before current step
  if (index < currentIndex) {
    return 'finish'
  }

  // Current step
  if (index === currentIndex) {
    return currentStatus
  }

  // After current step
  return 'wait'
}
