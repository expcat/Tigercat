/**
 * Tour component utilities
 * Shared styles, navigation, and positioning helpers for Tour
 */

import type { TourPlacement, TourStep, TourStepContext, TourTarget } from '../types/tour'
import { devWarn } from './dev-warn'
import { isBrowser } from './env'
import { overlayZIndexClass } from './floating'

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

/** Full-screen mask overlay */
export const tourMaskClasses = `fixed inset-0 ${overlayZIndexClass.modal} bg-black/45`

/** Popover card — always viewport-fixed so body transform does not shift it. */
export const tourPopoverClasses = `fixed ${overlayZIndexClass.modal} w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-[var(--tiger-radius-md,0.5rem)] bg-[var(--tiger-surface-raised,#ffffff)] shadow-xl border border-[var(--tiger-border,#e5e7eb)] p-4`

export const tourTitleClasses = 'text-base font-semibold text-[var(--tiger-text,#111827)] mb-1'

export const tourDescriptionClasses = 'text-sm text-[var(--tiger-text-secondary,#6b7280)] mb-4'

export const tourFooterClasses = 'flex items-center justify-between'

export const tourIndicatorClasses = 'text-xs text-[var(--tiger-text-disabled,#9ca3af)]'

export const tourCloseButtonClasses =
  'absolute top-2 end-2 p-1 rounded-[var(--tiger-radius-md,0.5rem)] text-[var(--tiger-text-secondary,#6b7280)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] transition-colors'

export const tourPrevButtonGapClass = 'me-2'

// ---------------------------------------------------------------------------
// Active steps
// ---------------------------------------------------------------------------

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

export interface TourNavState {
  current: number
  activeSteps: ActiveTourStep[]
  active: ActiveTourStep | undefined
  activePosition: number
  isFirst: boolean
  isLast: boolean
}

export function resolveTourNav(steps: TourStep[], current: number): TourNavState {
  const activeSteps = getActiveTourSteps(steps)
  const active = getCurrentActiveTourStep(activeSteps, current, steps.length)
  const activePosition = getActiveTourStepPosition(activeSteps, active?.index)
  return {
    current,
    activeSteps,
    active,
    activePosition,
    isFirst: activePosition <= 0,
    isLast: activeSteps.length === 0 || activePosition === activeSteps.length - 1
  }
}

export function getTourStepContext(nav: TourNavState): TourStepContext | undefined {
  if (!nav.active) return undefined
  return {
    step: nav.active.step,
    index: nav.active.index,
    position: nav.activePosition,
    total: nav.activeSteps.length
  }
}

/** Trap, scroll lock, and Escape only while a dialog is actually on screen. */
export function shouldLockTourOverlay(open: boolean, hasVisibleStep: boolean): boolean {
  return open && hasVisibleStep
}

export type TourNavEvent =
  | { type: 'change'; index: number }
  | { type: 'finish' }
  | { type: 'close' }
  | { type: 'openChange'; open: false }

export function tourChangeEvents(index: number): TourNavEvent[] {
  return [{ type: 'change', index }]
}

export function tourCloseEvents(): TourNavEvent[] {
  return [{ type: 'close' }, { type: 'openChange', open: false }]
}

export function tourFinishEvents(): TourNavEvent[] {
  return [{ type: 'finish' }, { type: 'close' }, { type: 'openChange', open: false }]
}

export function tourNextEvents(nav: TourNavState): TourNavEvent[] {
  const nextStep = nav.activeSteps[nav.activePosition + 1]
  if (nextStep) return tourChangeEvents(nextStep.index)
  return tourFinishEvents()
}

export function tourPrevEvents(nav: TourNavState): TourNavEvent[] {
  const prevStep = nav.activeSteps[nav.activePosition - 1]
  if (prevStep) return tourChangeEvents(prevStep.index)
  return []
}

// ---------------------------------------------------------------------------
// Target resolution
// ---------------------------------------------------------------------------

export type TourTargetInput =
  TourTarget | { value: TourTarget | null | undefined } | null | undefined

function unwrapTourTarget(target: TourTargetInput): TourTarget | undefined {
  if (target == null) return undefined
  if (
    typeof target === 'string' ||
    (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement)
  ) {
    return target
  }
  if (typeof target === 'object' && 'value' in target) {
    const inner = target.value
    if (inner == null) return undefined
    if (typeof inner === 'string') return inner
    if (typeof HTMLElement !== 'undefined' && inner instanceof HTMLElement) return inner
  }
  return undefined
}

export function resolveTourTarget(
  target: TourTargetInput,
  root?: ParentNode
): HTMLElement | undefined {
  if (!isBrowser()) return undefined
  const resolved = unwrapTourTarget(target)
  if (resolved == null) return undefined
  if (typeof HTMLElement !== 'undefined' && resolved instanceof HTMLElement) return resolved
  if (typeof resolved !== 'string' || resolved.trim() === '') return undefined

  try {
    const el = (root ?? document).querySelector(resolved)
    if (el instanceof HTMLElement) return el
    devWarn(`Tour.target.missing:${resolved}`, `Tour target not found: ${resolved}`)
    return undefined
  } catch {
    devWarn(`Tour.target.invalid:${resolved}`, `Invalid tour target selector: ${resolved}`)
    return undefined
  }
}

export function scrollTourTargetIntoView(target: HTMLElement): void {
  if (typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }
}

// ---------------------------------------------------------------------------
// Positioning helpers
// ---------------------------------------------------------------------------

const OFFSET = 12
const VIEWPORT_MARGIN = 8
const TOUR_MASK_HOLE_PADDING = 4

export interface TourRect {
  top: number
  left: number
  width: number
  height: number
}

export interface TourSize {
  width: number
  height: number
}

export function getTourRectFromElement(el: HTMLElement): TourRect {
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

export function getTourSizeFromElement(el: HTMLElement | null | undefined): TourSize | undefined {
  if (!el) return undefined
  const r = el.getBoundingClientRect()
  if (r.width <= 0 || r.height <= 0) return undefined
  return { width: r.width, height: r.height }
}

/**
 * Bounding rect of a target in viewport coordinates.
 * Returns undefined if the selector is illegal or the node is missing.
 */
export function getTourTargetRect(
  target: TourTargetInput,
  root?: ParentNode
): TourRect | undefined {
  const el = resolveTourTarget(target, root)
  if (!el) return undefined
  return getTourRectFromElement(el)
}

export function getOppositeTourPlacement(placement: TourPlacement): TourPlacement {
  if (placement.startsWith('top')) return placement.replace('top', 'bottom') as TourPlacement
  if (placement.startsWith('bottom')) return placement.replace('bottom', 'top') as TourPlacement
  if (placement.startsWith('left')) return placement.replace('left', 'right') as TourPlacement
  if (placement.startsWith('right')) return placement.replace('right', 'left') as TourPlacement
  return placement
}

function rawTourPopoverPosition(
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
    case 'left-start':
      return { top: targetRect.top, left: targetRect.left - popoverWidth - OFFSET }
    case 'left-end':
      return {
        top: targetRect.top + targetRect.height - popoverHeight,
        left: targetRect.left - popoverWidth - OFFSET
      }
    case 'right':
      return { top: cy - popoverHeight / 2, left: targetRect.left + targetRect.width + OFFSET }
    case 'right-start':
      return { top: targetRect.top, left: targetRect.left + targetRect.width + OFFSET }
    case 'right-end':
      return {
        top: targetRect.top + targetRect.height - popoverHeight,
        left: targetRect.left + targetRect.width + OFFSET
      }
    default:
      return { top: targetRect.top + targetRect.height + OFFSET, left: cx - popoverWidth / 2 }
  }
}

function getTourViewportSize(): { width: number; height: number } {
  if (!isBrowser()) return { width: 1024, height: 768 }
  return { width: window.innerWidth, height: window.innerHeight }
}

function tourPopoverOverflows(
  position: { top: number; left: number },
  popoverWidth: number,
  popoverHeight: number,
  viewport: { width: number; height: number }
): boolean {
  return (
    position.left < VIEWPORT_MARGIN ||
    position.top < VIEWPORT_MARGIN ||
    position.left + popoverWidth > viewport.width - VIEWPORT_MARGIN ||
    position.top + popoverHeight > viewport.height - VIEWPORT_MARGIN
  )
}

export function clampTourPopoverPosition(
  position: { top: number; left: number },
  popoverWidth: number,
  popoverHeight: number,
  viewport = getTourViewportSize()
): { top: number; left: number } {
  const minLeft = VIEWPORT_MARGIN
  const minTop = VIEWPORT_MARGIN
  const maxLeft = Math.max(minLeft, viewport.width - popoverWidth - VIEWPORT_MARGIN)
  const maxTop = Math.max(minTop, viewport.height - popoverHeight - VIEWPORT_MARGIN)

  return {
    top: Math.min(Math.max(position.top, minTop), maxTop),
    left: Math.min(Math.max(position.left, minLeft), maxLeft)
  }
}

/**
 * Viewport-fixed popover position relative to the target rect.
 * Flips to the opposite side when the preferred placement overflows, then clamps.
 */
export function getTourPopoverPosition(
  targetRect: TourRect,
  popoverWidth: number,
  popoverHeight: number,
  placement: TourPlacement
): { top: number; left: number } {
  const viewport = getTourViewportSize()
  const preferred = rawTourPopoverPosition(targetRect, popoverWidth, popoverHeight, placement)
  if (!tourPopoverOverflows(preferred, popoverWidth, popoverHeight, viewport)) {
    return clampTourPopoverPosition(preferred, popoverWidth, popoverHeight, viewport)
  }

  const flipped = rawTourPopoverPosition(
    targetRect,
    popoverWidth,
    popoverHeight,
    getOppositeTourPlacement(placement)
  )
  if (!tourPopoverOverflows(flipped, popoverWidth, popoverHeight, viewport)) {
    return clampTourPopoverPosition(flipped, popoverWidth, popoverHeight, viewport)
  }

  return clampTourPopoverPosition(preferred, popoverWidth, popoverHeight, viewport)
}

export function getTourCenteredPosition(
  popoverWidth: number,
  popoverHeight: number
): { top: number; left: number } {
  const viewport = getTourViewportSize()
  return clampTourPopoverPosition(
    {
      top: (viewport.height - popoverHeight) / 2,
      left: (viewport.width - popoverWidth) / 2
    },
    popoverWidth,
    popoverHeight,
    viewport
  )
}

export function getTourPopoverStyle(
  targetRect: TourRect | undefined,
  popoverSize: TourSize | undefined,
  placement: TourPlacement
): Record<string, string> {
  const width = popoverSize?.width ?? 0
  const height = popoverSize?.height ?? 0
  const pos = targetRect
    ? getTourPopoverPosition(targetRect, width, height, placement)
    : getTourCenteredPosition(width, height)
  return {
    position: 'fixed',
    top: `${pos.top}px`,
    left: `${pos.left}px`
  }
}

function getTourMaskHoleRect(
  rect: TourRect,
  padding: number
): { top: number; left: number; width: number; height: number } {
  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  }
}

/**
 * Clip-path that punches a hole over the target so a full-screen painted mask
 * stays clickable on the dimmed backdrop without covering the target.
 * `rect` is in viewport coordinates (same as `position: fixed`).
 */
export function getTourMaskHoleStyle(
  rect: TourRect,
  padding = TOUR_MASK_HOLE_PADDING
): Record<string, string> {
  const hole = getTourMaskHoleRect(rect, padding)
  const left = hole.left
  const top = hole.top
  const right = hole.left + hole.width
  const bottom = hole.top + hole.height
  return {
    clipPath: `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px, ${left}px ${top}px)`
  }
}
