/**
 * Steps component utilities
 */

import type { StepsDirection, StepStatus, StepSize } from '../types/steps'

/**
 * Default check icon used by StepsItem when status is "finish"
 * (Shared between React/Vue to keep visuals consistent)
 */
export const stepFinishIconSvgClasses = 'w-5 h-5'

export const stepFinishIconViewBox = '0 0 24 24'

export const stepFinishIconPathD = 'M5 13l4 4L19 7'

export const stepFinishIconPathStrokeLinecap = 'round'

export const stepFinishIconPathStrokeLinejoin = 'round'

export const stepFinishIconPathStrokeWidth = 2

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
  isLast: boolean,
  simple: boolean
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
    'tiger-step-icon flex items-center justify-center rounded-full border-2 transition-all duration-200'

  // Size classes
  const sizeClasses = simple
    ? 'w-6 h-6 text-xs'
    : size === 'small'
      ? 'w-8 h-8 text-sm'
      : 'w-10 h-10 text-base'

  // Custom icon might need less padding
  const iconClasses = isCustomIcon ? '' : 'font-medium'

  // Status-based colors using CSS variables with fallbacks
  const statusClasses = {
    wait: 'bg-[var(--tiger-surface-muted,#f3f4f6)] border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text-muted,#6b7280)]',
    process: 'bg-[var(--tiger-primary,#2563eb)] border-[var(--tiger-primary,#2563eb)] text-white',
    finish: 'bg-[var(--tiger-primary,#2563eb)] border-[var(--tiger-primary,#2563eb)] text-white',
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
  isLast: boolean
): string {
  if (isLast) {
    return 'hidden'
  }

  const baseClasses = 'tiger-step-tail transition-all duration-200'

  // Position and size based on direction
  if (direction === 'vertical') {
    const positionClasses = 'absolute left-4 top-10 w-0.5 h-full'
    const colorClasses =
      status === 'finish' ? 'bg-[var(--tiger-primary,#2563eb)]' : 'bg-[var(--tiger-border,#e5e7eb)]'
    return `${baseClasses} ${positionClasses} ${colorClasses}`
  }

  // Horizontal
  const positionClasses = 'flex-1 h-0.5 mx-2 mt-5'
  const colorClasses =
    status === 'finish' ? 'bg-[var(--tiger-primary,#2563eb)]' : 'bg-[var(--tiger-border,#e5e7eb)]'

  return `${baseClasses} ${positionClasses} ${colorClasses}`
}

/**
 * Get Step content container classes
 */
export function getStepContentClasses(direction: StepsDirection, simple: boolean): string {
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
  const baseClasses =
    'tiger-step-title font-medium transition-colors duration-200 bg-transparent border-0 p-0'

  const sizeClasses = size === 'small' ? 'text-sm' : 'text-base'

  const statusClasses = {
    wait: 'text-[var(--tiger-text-muted,#6b7280)]',
    process: 'text-[var(--tiger-text,#111827)]',
    finish: 'text-[var(--tiger-text,#111827)]',
    error: 'text-[var(--tiger-error,#ef4444)]'
  }

  const cursorClasses = clickable
    ? 'cursor-pointer hover:text-[var(--tiger-primary,#2563eb)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tiger-surface,#ffffff)]'
    : ''

  return `${baseClasses} ${sizeClasses} ${statusClasses[status]} ${cursorClasses}`
}

/**
 * Get Step description classes
 */
export function getStepDescriptionClasses(status: StepStatus, size: StepSize): string {
  const baseClasses = 'tiger-step-description mt-1 transition-colors duration-200'

  const sizeClasses = size === 'small' ? 'text-xs' : 'text-sm'

  const statusClasses = {
    wait: 'text-[var(--tiger-text-muted,#6b7280)]',
    process: 'text-[var(--tiger-text-muted,#6b7280)]',
    finish: 'text-[var(--tiger-text-muted,#6b7280)]',
    error: 'text-[var(--tiger-error,#ef4444)]'
  }

  return `${baseClasses} ${sizeClasses} ${statusClasses[status]}`
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
