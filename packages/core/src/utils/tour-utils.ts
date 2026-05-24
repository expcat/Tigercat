/**
 * Tour component utilities
 * Shared styles and positioning helpers for Tour
 */

import type { TourPlacement, TourStep } from '../types/tour'
import { isBrowser } from './env'

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

/** Full-screen mask overlay */
export const tourMaskClasses = 'fixed inset-0 z-[1000] bg-black/45 transition-opacity duration-200'

/** Popover card */
export const tourPopoverClasses =
  'absolute z-[1001] w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-surface-raised,#ffffff)] shadow-xl border border-[var(--tiger-border,#e5e7eb)] p-4'

export interface ActiveTourStep {
  step: TourStep
  index: number
}

export function isTourStepSkipped(step: TourStep): boolean {
  const skippedByPredicate =
    typeof step.skipWhen === 'function' ? step.skipWhen() : step.skipWhen === true

  return step.skip === true || skippedByPredicate
}

export function getActiveTourSteps(steps: TourStep[]): ActiveTourStep[] {
  return steps.reduce<ActiveTourStep[]>((activeSteps, step, index) => {
    if (!isTourStepSkipped(step)) {
      activeSteps.push({ step, index })
    }

    return activeSteps
  }, [])
}

export function getCurrentActiveTourStep(
  activeSteps: ActiveTourStep[],
  current: number,
  stepCount?: number
): ActiveTourStep | undefined {
  if (activeSteps.length === 0) return undefined
  if (stepCount !== undefined && (current < 0 || current >= stepCount)) return undefined

  return (
    activeSteps.find((item) => item.index === current) ??
    activeSteps.find((item) => item.index > current) ??
    activeSteps[activeSteps.length - 1]
  )
}

export function getActiveTourStepPosition(
  activeSteps: ActiveTourStep[],
  currentIndex: number | undefined
): number {
  if (currentIndex === undefined) return -1
  return activeSteps.findIndex((item) => item.index === currentIndex)
}

/** Title */
export const tourTitleClasses = 'text-base font-semibold text-[var(--tiger-text,#111827)] mb-1'

/** Description */
export const tourDescriptionClasses = 'text-sm text-[var(--tiger-text-secondary,#6b7280)] mb-4'

/** Footer containing buttons + indicators */
export const tourFooterClasses = 'flex items-center justify-between'

/** Step indicator text */
export const tourIndicatorClasses = 'text-xs text-[var(--tiger-text-disabled,#9ca3af)]'

/** Close button */
export const tourCloseButtonClasses =
  'absolute top-2 right-2 p-1 rounded-[var(--tiger-radius-md,0.5rem)] text-[var(--tiger-text-secondary,#6b7280)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] transition-colors'

// ---------------------------------------------------------------------------
// Positioning helpers
// ---------------------------------------------------------------------------

const OFFSET = 12 // px gap between target and popover

export interface TourRect {
  top: number
  left: number
  width: number
  height: number
}

/**
 * Calculate absolute position of the popover relative to the target rect.
 */
export function getTourPopoverPosition(
  targetRect: TourRect,
  popoverWidth: number,
  popoverHeight: number,
  placement: TourPlacement
): { top: number; left: number } {
  const cx = targetRect.left + targetRect.width / 2
  const cy = targetRect.top + targetRect.height / 2

  let position: { top: number; left: number }

  switch (placement) {
    case 'top':
      position = { top: targetRect.top - popoverHeight - OFFSET, left: cx - popoverWidth / 2 }
      break
    case 'top-start':
      position = { top: targetRect.top - popoverHeight - OFFSET, left: targetRect.left }
      break
    case 'top-end':
      position = {
        top: targetRect.top - popoverHeight - OFFSET,
        left: targetRect.left + targetRect.width - popoverWidth
      }
      break
    case 'bottom':
      position = { top: targetRect.top + targetRect.height + OFFSET, left: cx - popoverWidth / 2 }
      break
    case 'bottom-start':
      position = { top: targetRect.top + targetRect.height + OFFSET, left: targetRect.left }
      break
    case 'bottom-end':
      position = {
        top: targetRect.top + targetRect.height + OFFSET,
        left: targetRect.left + targetRect.width - popoverWidth
      }
      break
    case 'left':
      position = { top: cy - popoverHeight / 2, left: targetRect.left - popoverWidth - OFFSET }
      break
    case 'right':
      position = { top: cy - popoverHeight / 2, left: targetRect.left + targetRect.width + OFFSET }
      break
    default:
      position = { top: targetRect.top + targetRect.height + OFFSET, left: cx - popoverWidth / 2 }
  }

  return clampTourPopoverPosition(position, popoverWidth, popoverHeight)
}

function clampTourPopoverPosition(
  position: { top: number; left: number },
  popoverWidth: number,
  popoverHeight: number
): { top: number; left: number } {
  if (!isBrowser()) return position

  const margin = 8
  const minLeft = window.scrollX + margin
  const minTop = window.scrollY + margin
  const maxLeft = Math.max(minLeft, window.scrollX + window.innerWidth - popoverWidth - margin)
  const maxTop = Math.max(minTop, window.scrollY + window.innerHeight - popoverHeight - margin)

  return {
    top: Math.min(Math.max(position.top, minTop), maxTop),
    left: Math.min(Math.max(position.left, minLeft), maxLeft)
  }
}

/**
 * Get bounding rect of a target element from a CSS selector.
 * Returns undefined if not found.
 */
export function getTourTargetRect(selector: string): TourRect | undefined {
  if (!isBrowser()) return undefined
  const el = document.querySelector(selector)
  if (!el) return undefined
  const r = el.getBoundingClientRect()
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  return {
    top: r.top + scrollY,
    left: r.left + scrollX,
    width: r.width,
    height: r.height
  }
}

/**
 * Style for the spotlight "hole" that sits behind the mask, revealing the target.
 */
export function getTourSpotlightStyle(rect: TourRect, padding = 4): Record<string, string> {
  return {
    position: 'fixed',
    top: `${rect.top - window.scrollY - padding}px`,
    left: `${rect.left - window.scrollX - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`,
    borderRadius: '4px',
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
    zIndex: '1000',
    pointerEvents: 'none',
    transition: 'all 0.2s ease'
  }
}
