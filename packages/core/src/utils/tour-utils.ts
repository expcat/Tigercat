/**
 * Tour component utilities
 * Shared styles and positioning helpers for Tour
 */

import type { TourPlacement } from '../types/tour'

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

/** Full-screen mask overlay */
export const tourMaskClasses = 'fixed inset-0 z-[1000] bg-black/45 transition-opacity duration-200'

/** Popover card */
export const tourPopoverClasses =
  'absolute z-[1001] w-80 rounded-lg bg-[var(--tiger-surface-raised,#ffffff)] shadow-xl border border-[var(--tiger-border,#e5e7eb)] p-4'

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
  'absolute top-2 right-2 p-1 rounded-md text-[var(--tiger-text-secondary,#6b7280)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] transition-colors'

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

  switch (placement) {
    case 'top':
      return { top: targetRect.top - popoverHeight - OFFSET, left: cx - popoverWidth / 2 }
    case 'top-start':
      return { top: targetRect.top - popoverHeight - OFFSET, left: targetRect.left }
    case 'top-end':
      return {
        top: targetRect.top - popoverHeight - OFFSET,
        left: targetRect.left + targetRect.width - popoverWidth
      }
    case 'bottom':
      return { top: targetRect.top + targetRect.height + OFFSET, left: cx - popoverWidth / 2 }
    case 'bottom-start':
      return { top: targetRect.top + targetRect.height + OFFSET, left: targetRect.left }
    case 'bottom-end':
      return {
        top: targetRect.top + targetRect.height + OFFSET,
        left: targetRect.left + targetRect.width - popoverWidth
      }
    case 'left':
      return { top: cy - popoverHeight / 2, left: targetRect.left - popoverWidth - OFFSET }
    case 'right':
      return { top: cy - popoverHeight / 2, left: targetRect.left + targetRect.width + OFFSET }
    default:
      return { top: targetRect.top + targetRect.height + OFFSET, left: cx - popoverWidth / 2 }
  }
}

/**
 * Get bounding rect of a target element from a CSS selector.
 * Returns undefined if not found.
 */
export function getTourTargetRect(selector: string): TourRect | undefined {
  if (typeof document === 'undefined') return undefined
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
