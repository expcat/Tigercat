/**
 * Animation constants and utilities for Tigercat UI components.
 *
 * All durations are in milliseconds unless otherwise specified.
 */

// ============================================================================
// Animation Duration Constants
// ============================================================================

/**
 * Standard animation duration for most UI transitions (fade, slide, scale).
 * Used by: Modal, Drawer, Dropdown, Tooltip, Popover, Message, Notification
 */
export const ANIMATION_DURATION_MS = 300

/**
 * Fast animation duration for quick micro-interactions.
 * Used by: Hover effects, button states
 */
export const ANIMATION_DURATION_FAST_MS = 150

/**
 * Slow animation duration for emphasized transitions.
 * Used by: Page transitions, loading states
 */
export const ANIMATION_DURATION_SLOW_MS = 500

// ============================================================================
// Tailwind Duration Classes
// ============================================================================

/**
 * Tailwind class for standard duration
 */
export const DURATION_CLASS = 'duration-300'

/**
 * Tailwind class for fast duration
 */
export const DURATION_FAST_CLASS = 'duration-150'

/**
 * Tailwind class for slow duration
 */
export const DURATION_SLOW_CLASS = 'duration-500'

// ============================================================================
// Easing Functions
// ============================================================================

/**
 * Standard easing for most transitions
 */
export const EASING_DEFAULT = 'ease-in-out'

/**
 * Easing for elements entering the view
 */
export const EASING_ENTER = 'ease-out'

/**
 * Easing for elements leaving the view
 */
export const EASING_LEAVE = 'ease-in'

// ============================================================================
// Transition Classes
// ============================================================================

/**
 * Standard transition class combining duration and easing
 */
export const TRANSITION_BASE = `transition-all ${DURATION_CLASS} ${EASING_DEFAULT}`

/**
 * Transition for opacity changes (fade)
 */
export const TRANSITION_OPACITY = `transition-opacity ${DURATION_CLASS} ${EASING_DEFAULT}`

/**
 * Transition for transform changes (slide, scale)
 */
export const TRANSITION_TRANSFORM = `transition-transform ${DURATION_CLASS} ${EASING_DEFAULT}`

// ============================================================================
// Shake Animation (for form validation)
// ============================================================================

const SHAKE_ANIMATION_CSS = `
@keyframes tiger-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

.tiger-animate-shake {
  animation: tiger-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
`

let isStyleInjected = false

/**
 * Inject shake animation styles into the document head.
 * Safe to call multiple times - will only inject once.
 */
export function injectShakeStyle(): void {
  if (typeof document === 'undefined' || isStyleInjected) return

  const styleId = 'tiger-ui-animation-styles'
  if (document.getElementById(styleId)) {
    isStyleInjected = true
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = SHAKE_ANIMATION_CSS
  document.head.appendChild(style)
  isStyleInjected = true
}

/**
 * CSS class to apply shake animation
 */
export const SHAKE_CLASS = 'tiger-animate-shake'

// ============================================================================
// SVG Path Animation Utilities
// ============================================================================

/**
 * Calculate total length of an SVG path element.
 * Used for stroke-dasharray animations (drawing effect).
 */
export function getPathLength(pathElement: SVGPathElement): number {
  return pathElement.getTotalLength()
}

/**
 * Generate stroke-dasharray and stroke-dashoffset styles for path drawing animation.
 * @param length - Total path length (from getPathLength)
 * @param progress - Animation progress from 0 to 1
 */
export function getPathDrawStyles(
  length: number,
  progress: number
): { strokeDasharray: string; strokeDashoffset: string } {
  return {
    strokeDasharray: `${length}`,
    strokeDashoffset: `${length * (1 - progress)}`
  }
}

/**
 * SVG path animation CSS for chart lines.
 * Includes draw-in animation with configurable duration.
 */
export const SVG_PATH_ANIMATION_CSS = `
@keyframes tiger-path-draw {
  from {
    stroke-dashoffset: var(--tiger-path-length);
  }
  to {
    stroke-dashoffset: 0;
  }
}

.tiger-animate-path-draw {
  animation: tiger-path-draw var(--tiger-path-duration, 1s) ease-out forwards;
  stroke-dasharray: var(--tiger-path-length);
  stroke-dashoffset: var(--tiger-path-length);
}

@keyframes tiger-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.tiger-animate-fade-in {
  animation: tiger-fade-in var(--tiger-fade-duration, 0.5s) ease-out forwards;
}

@keyframes tiger-scale-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.tiger-animate-scale-in {
  animation: tiger-scale-in var(--tiger-scale-duration, 0.3s) ease-out forwards;
}

@keyframes tiger-bar-grow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

.tiger-animate-bar-grow {
  transform-origin: bottom;
  animation: tiger-bar-grow var(--tiger-bar-duration, 0.5s) ease-out forwards;
}

@keyframes tiger-pie-draw {
  from {
    stroke-dashoffset: var(--tiger-circumference);
  }
  to {
    stroke-dashoffset: var(--tiger-target-offset);
  }
}

.tiger-animate-pie-draw {
  animation: tiger-pie-draw var(--tiger-pie-duration, 0.8s) ease-out forwards;
}
`

let isSvgStyleInjected = false

/**
 * Inject SVG animation styles into the document head.
 * Safe to call multiple times - will only inject once.
 */
export function injectSvgAnimationStyles(): void {
  if (typeof document === 'undefined' || isSvgStyleInjected) return

  const styleId = 'tiger-ui-svg-animation-styles'
  if (document.getElementById(styleId)) {
    isSvgStyleInjected = true
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = SVG_PATH_ANIMATION_CSS
  document.head.appendChild(style)
  isSvgStyleInjected = true
}

/**
 * CSS classes for SVG animations
 */
export const SVG_ANIMATION_CLASSES = {
  pathDraw: 'tiger-animate-path-draw',
  fadeIn: 'tiger-animate-fade-in',
  scaleIn: 'tiger-animate-scale-in',
  barGrow: 'tiger-animate-bar-grow',
  pieDraw: 'tiger-animate-pie-draw'
} as const

/**
 * CSS custom properties for SVG animations
 */
export const SVG_ANIMATION_VARS = {
  pathLength: '--tiger-path-length',
  pathDuration: '--tiger-path-duration',
  fadeDuration: '--tiger-fade-duration',
  scaleDuration: '--tiger-scale-duration',
  barDuration: '--tiger-bar-duration',
  pieDuration: '--tiger-pie-duration',
  circumference: '--tiger-circumference',
  targetOffset: '--tiger-target-offset'
} as const

/**
 * Get style object for path draw animation
 */
export function getPathDrawAnimationStyle(
  pathLength: number,
  durationMs: number = 1000
): Record<string, string> {
  return {
    [SVG_ANIMATION_VARS.pathLength]: `${pathLength}`,
    [SVG_ANIMATION_VARS.pathDuration]: `${durationMs}ms`
  }
}

/**
 * Get style object for bar grow animation with staggered delay
 */
export function getBarGrowAnimationStyle(
  index: number,
  durationMs: number = 500,
  staggerMs: number = 50
): Record<string, string> {
  return {
    [SVG_ANIMATION_VARS.barDuration]: `${durationMs}ms`,
    animationDelay: `${index * staggerMs}ms`
  }
}

/**
 * Get style object for pie/donut draw animation
 */
export function getPieDrawAnimationStyle(
  circumference: number,
  targetOffset: number,
  durationMs: number = 800
): Record<string, string> {
  return {
    [SVG_ANIMATION_VARS.circumference]: `${circumference}`,
    [SVG_ANIMATION_VARS.targetOffset]: `${targetOffset}`,
    [SVG_ANIMATION_VARS.pieDuration]: `${durationMs}ms`
  }
}
