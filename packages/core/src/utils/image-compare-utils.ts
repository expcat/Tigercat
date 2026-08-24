/**
 * ImageCompare utility functions
 *
 * Class builders, position math, and clip/handle styles shared by the
 * Vue and React ImageCompare implementations. Resolvers are number/string
 * only so they stay safe to evaluate during server-side rendering.
 */

import {
  DEFAULT_IMAGE_COMPARE_ARIA_LABEL,
  DEFAULT_IMAGE_COMPARE_FIT,
  DEFAULT_IMAGE_COMPARE_ORIENTATION,
  DEFAULT_IMAGE_COMPARE_POSITION,
  DEFAULT_IMAGE_COMPARE_STEP,
  type ImageCompareOrientation
} from '../types/image-compare'
import type { ImageFit } from '../types/image'
import { classNames } from './class-names'
import { getImageImgClasses, toCSSSize } from './image-utils'
import {
  sliderGetKeyboardValue,
  sliderGetValueFromPosition,
  sliderNormalizeValue
} from './helpers/slider-utils'

/** CSS custom property written onto the root for the visible before portion */
export const IMAGE_COMPARE_POSITION_VAR = '--tiger-image-compare-position'

/** Root overflow clip */
export const imageCompareRootClasses =
  'tiger-image-compare relative overflow-hidden select-none touch-none max-w-full'

/** Horizontal axis */
export const imageCompareHorizontalClasses = 'tiger-image-compare-horizontal'

/** Vertical axis */
export const imageCompareVerticalClasses = 'tiger-image-compare-vertical'

/** Disabled pointer and keyboard */
export const imageCompareDisabledClasses = 'tiger-image-compare-disabled cursor-not-allowed'

/** After (ending) image sits in flow and sizes the widget */
export const imageCompareAfterClasses =
  'tiger-image-compare-after relative block w-full h-full [&>img]:pointer-events-none [&>img]:select-none [&>img]:max-w-none'

/** Before (starting) image overlays and is clipped by handle position */
export const imageCompareBeforeClasses =
  'tiger-image-compare-before absolute inset-0 overflow-hidden [&>img]:pointer-events-none [&>img]:select-none [&>img]:max-w-none'

/** Focusable divider / slider handle */
export const imageCompareHandleClasses =
  'tiger-image-compare-handle absolute z-10 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-offset-2'

/** Horizontal handle hit area */
export const imageCompareHandleHorizontalClasses = 'inset-y-0 w-6 -translate-x-1/2 cursor-ew-resize'

/** Vertical handle hit area */
export const imageCompareHandleVerticalClasses = 'inset-x-0 h-6 -translate-y-1/2 cursor-ns-resize'

/** Disabled handle */
export const imageCompareHandleDisabledClasses = 'cursor-not-allowed'

/** Visible divider line inside the handle */
export const imageCompareLineClasses =
  'tiger-image-compare-line absolute bg-white shadow pointer-events-none'

export const imageCompareLineHorizontalClasses = 'inset-y-0 left-1/2 w-0.5 -translate-x-1/2'

export const imageCompareLineVerticalClasses = 'inset-x-0 top-1/2 h-0.5 -translate-y-1/2'

/** Circular grabber on the divider */
export const imageCompareKnobClasses =
  'tiger-image-compare-knob relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--tiger-primary,#2563eb)] text-white shadow pointer-events-none'

const IMAGE_COMPARE_ORIENTATIONS = new Set<ImageCompareOrientation>(['horizontal', 'vertical'])

const IMAGE_FITS = new Set<ImageFit>(['contain', 'cover', 'fill', 'none', 'scale-down'])

/**
 * Resolve orientation, falling back to {@link DEFAULT_IMAGE_COMPARE_ORIENTATION}.
 */
export function resolveImageCompareOrientation(
  orientation?: ImageCompareOrientation
): ImageCompareOrientation {
  if (orientation && IMAGE_COMPARE_ORIENTATIONS.has(orientation)) return orientation
  return DEFAULT_IMAGE_COMPARE_ORIENTATION
}

/**
 * Whether the resolved orientation clips on the block axis.
 */
export function isImageCompareVertical(orientation?: ImageCompareOrientation): boolean {
  return resolveImageCompareOrientation(orientation) === 'vertical'
}

/**
 * Resolve object-fit, falling back to {@link DEFAULT_IMAGE_COMPARE_FIT}.
 */
export function resolveImageCompareFit(fit?: ImageFit): ImageFit {
  if (fit && IMAGE_FITS.has(fit)) return fit
  return DEFAULT_IMAGE_COMPARE_FIT
}

/**
 * Resolve snap increment. Non-finite or non-positive numbers fall back
 * to {@link DEFAULT_IMAGE_COMPARE_STEP}.
 */
export function resolveImageCompareStep(step?: number): number {
  if (typeof step === 'number' && Number.isFinite(step) && step > 0) return step
  return DEFAULT_IMAGE_COMPARE_STEP
}

/**
 * Clamp and snap a handle position to 0..100.
 * Non-finite values fall back to {@link DEFAULT_IMAGE_COMPARE_POSITION}.
 */
export function resolveImageComparePosition(position?: number, step?: number): number {
  const safeStep = resolveImageCompareStep(step)
  const raw =
    typeof position === 'number' && Number.isFinite(position)
      ? position
      : DEFAULT_IMAGE_COMPARE_POSITION
  return sliderNormalizeValue(raw, 0, 100, safeStep)
}

/**
 * Resolve the accessible name. Empty or whitespace-only values fall back
 * to {@link DEFAULT_IMAGE_COMPARE_ARIA_LABEL}.
 */
export function resolveImageCompareAriaLabel(label?: string): string {
  if (typeof label === 'string') {
    const trimmed = label.trim()
    if (trimmed) return trimmed
  }
  return DEFAULT_IMAGE_COMPARE_ARIA_LABEL
}

export interface ImageComparePointerRect {
  left: number
  top: number
  width: number
  height: number
}

const IMAGE_COMPARE_INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]'

/**
 * Whether a pointer target is an interactive slot child that should not start
 * a handle drag. Clicks on the handle itself are never ignored.
 */
export function isImageCompareInteractiveTarget(
  target: EventTarget | null,
  handle: EventTarget | null
): boolean {
  if (!(target instanceof Element)) return false
  if (handle instanceof Node && handle.contains(target)) return false
  return target.closest(IMAGE_COMPARE_INTERACTIVE_SELECTOR) !== null
}

/**
 * Read client coordinates from a mouse or touch event-like object.
 */
export function getImageComparePointerClientPoint(event: {
  clientX?: number
  clientY?: number
  touches?: ArrayLike<{ clientX: number; clientY: number }>
}): { clientX: number; clientY: number } | null {
  if (event.touches && event.touches.length > 0) {
    const touch = event.touches[0]
    return { clientX: touch.clientX, clientY: touch.clientY }
  }
  if (typeof event.clientX === 'number' && typeof event.clientY === 'number') {
    return { clientX: event.clientX, clientY: event.clientY }
  }
  return null
}

/**
 * Convert a pointer location inside the comparison surface into a snapped
 * 0..100 position.
 */
export function getImageComparePositionFromPointer(input: {
  clientX: number
  clientY: number
  rect: ImageComparePointerRect
  orientation?: ImageCompareOrientation
  step?: number
}): number {
  const orientation = resolveImageCompareOrientation(input.orientation)
  const step = resolveImageCompareStep(input.step)
  const { rect } = input
  if (orientation === 'vertical') {
    return sliderGetValueFromPosition(input.clientY - rect.top, rect.height, 0, 100, step)
  }
  return sliderGetValueFromPosition(input.clientX - rect.left, rect.width, 0, 100, step)
}

/**
 * Keyboard adjustment for the comparison handle. Reuses slider key mapping:
 * ArrowRight/ArrowUp increase, ArrowLeft/ArrowDown decrease, Home/End, PageUp/PageDown.
 */
export function getImageCompareKeyboardPosition(
  key: string,
  current: number,
  step?: number
): number | null {
  return sliderGetKeyboardValue(
    key,
    resolveImageComparePosition(current, step),
    0,
    100,
    resolveImageCompareStep(step)
  )
}

/**
 * Clip-path that reveals `position` percent of the before image.
 */
export function getImageCompareClipStyle(
  position?: number,
  orientation?: ImageCompareOrientation,
  step?: number
): Record<string, string> {
  const resolved = resolveImageComparePosition(position, step)
  const clipped = `${100 - resolved}%`
  if (isImageCompareVertical(orientation)) {
    return { clipPath: `inset(0 0 ${clipped} 0)` }
  }
  return { clipPath: `inset(0 ${clipped} 0 0)` }
}

/**
 * Absolute offset for the divider handle.
 */
export function getImageCompareHandleStyle(
  position?: number,
  orientation?: ImageCompareOrientation,
  step?: number
): Record<string, string> {
  const resolved = resolveImageComparePosition(position, step)
  if (isImageCompareVertical(orientation)) {
    return { top: `${resolved}%` }
  }
  return { left: `${resolved}%` }
}

/**
 * CSS variables and optional width/height on the root.
 */
export function getImageCompareRootStyle(
  input: {
    position?: number
    step?: number
    width?: number | string
    height?: number | string
  } = {}
): Record<string, string> {
  const position = resolveImageComparePosition(input.position, input.step)
  const style: Record<string, string> = {
    [IMAGE_COMPARE_POSITION_VAR]: `${position}%`
  }
  const width = toCSSSize(input.width)
  const height = toCSSSize(input.height)
  if (width) style.width = width
  if (height) style.height = height
  return style
}

/**
 * Classes for the root comparison surface.
 */
export function getImageCompareRootClasses(
  input: {
    orientation?: ImageCompareOrientation
    disabled?: boolean
    className?: string
  } = {}
): string {
  return classNames(
    imageCompareRootClasses,
    isImageCompareVertical(input.orientation)
      ? imageCompareVerticalClasses
      : imageCompareHorizontalClasses,
    input.disabled && imageCompareDisabledClasses,
    input.className
  )
}

/**
 * Classes for the after (in-flow) pane.
 */
export function getImageCompareAfterClasses(className?: string): string {
  return classNames(imageCompareAfterClasses, className)
}

/**
 * Classes for the before (clipped overlay) pane.
 */
export function getImageCompareBeforeClasses(className?: string): string {
  return classNames(imageCompareBeforeClasses, className)
}

/**
 * Classes for the focusable divider handle.
 */
export function getImageCompareHandleClasses(
  input: {
    orientation?: ImageCompareOrientation
    disabled?: boolean
    className?: string
  } = {}
): string {
  return classNames(
    imageCompareHandleClasses,
    isImageCompareVertical(input.orientation)
      ? imageCompareHandleVerticalClasses
      : imageCompareHandleHorizontalClasses,
    input.disabled && imageCompareHandleDisabledClasses,
    input.className
  )
}

/**
 * Classes for the visible divider line.
 */
export function getImageCompareLineClasses(orientation?: ImageCompareOrientation): string {
  return classNames(
    imageCompareLineClasses,
    isImageCompareVertical(orientation)
      ? imageCompareLineVerticalClasses
      : imageCompareLineHorizontalClasses
  )
}

/**
 * Classes for the circular grabber.
 */
export function getImageCompareKnobClasses(className?: string): string {
  return classNames(imageCompareKnobClasses, className)
}

/**
 * Classes for a src-driven `<img>` inside a pane. Reuses Image object-fit map.
 */
export function getImageCompareImgClasses(fit?: ImageFit): string {
  return getImageImgClasses(resolveImageCompareFit(fit))
}
