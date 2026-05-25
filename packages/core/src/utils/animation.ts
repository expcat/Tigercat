/**
 * Animation constants and utilities for Tigercat UI components.
 *
 * All durations are in milliseconds unless otherwise specified.
 */

import { isBrowser } from './env'

// ============================================================================
// Token-backed Motion Configuration
// ============================================================================

export type MotionDurationToken = 'instant' | 'quick' | 'base' | 'relaxed' | 'slow'
export type MotionEasingToken = 'standard' | 'decelerate' | 'accelerate' | 'emphasized' | 'spring'
export type MotionDuration = MotionDurationToken | number | string
export type MotionEasing = MotionEasingToken | string
export type MotionDirection = 'none' | 'up' | 'down' | 'left' | 'right'

export interface ComponentMotionConfig {
  /** Duration token, CSS time value, or millisecond number. */
  duration?: MotionDuration
  /** Delay token, CSS time value, or millisecond number. */
  delay?: MotionDuration
  /** Easing token or CSS timing function. */
  easing?: MotionEasing
  /** Direction used by slide/translate-based component entrances. */
  direction?: MotionDirection
  /** Disable this component's animation without removing its transition styles. */
  disabled?: boolean
  /** Respect `prefers-reduced-motion`; enabled by default. */
  respectReducedMotion?: boolean
}

export const MOTION_DURATION_TOKEN_VARS: Record<MotionDurationToken, string> = {
  instant: '--tiger-motion-duration-instant',
  quick: '--tiger-motion-duration-quick',
  base: '--tiger-motion-duration-base',
  relaxed: '--tiger-motion-duration-relaxed',
  slow: '--tiger-motion-duration-slow'
}

export const MOTION_DURATION_TOKEN_FALLBACKS: Record<MotionDurationToken, string> = {
  instant: '80ms',
  quick: '150ms',
  base: '200ms',
  relaxed: '300ms',
  slow: '450ms'
}

export const MOTION_EASING_TOKEN_VARS: Record<MotionEasingToken, string> = {
  standard: '--tiger-motion-ease-standard',
  decelerate: '--tiger-motion-ease-decelerate',
  accelerate: '--tiger-motion-ease-accelerate',
  emphasized: '--tiger-motion-ease-emphasized',
  spring: '--tiger-motion-ease-spring'
}

export const MOTION_EASING_TOKEN_FALLBACKS: Record<MotionEasingToken, string> = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  emphasized: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
}

export const COMPONENT_MOTION_VARS = {
  duration: '--tiger-component-motion-duration',
  delay: '--tiger-component-motion-delay',
  easing: '--tiger-component-motion-easing',
  translateX: '--tiger-component-motion-translate-x',
  translateY: '--tiger-component-motion-translate-y'
} as const

const MOTION_DIRECTION_OFFSETS: Record<MotionDirection, { x: string; y: string }> = {
  none: { x: '0', y: '0' },
  up: { x: '0', y: '0.5rem' },
  down: { x: '0', y: '-0.5rem' },
  left: { x: '0.5rem', y: '0' },
  right: { x: '-0.5rem', y: '0' }
}

function hasReducedMotionPreference(): boolean {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function resolveMotionDuration(
  duration: MotionDuration | undefined,
  fallback: MotionDurationToken = 'base'
): string {
  if (typeof duration === 'number') return `${duration}ms`
  if (duration && duration in MOTION_DURATION_TOKEN_VARS) {
    const token = duration as MotionDurationToken
    return `var(${MOTION_DURATION_TOKEN_VARS[token]},${MOTION_DURATION_TOKEN_FALLBACKS[token]})`
  }
  if (typeof duration === 'string') return duration

  return `var(${MOTION_DURATION_TOKEN_VARS[fallback]},${MOTION_DURATION_TOKEN_FALLBACKS[fallback]})`
}

export function resolveMotionEasing(
  easing: MotionEasing | undefined,
  fallback: MotionEasingToken = 'standard'
): string {
  if (easing && easing in MOTION_EASING_TOKEN_VARS) {
    const token = easing as MotionEasingToken
    return `var(${MOTION_EASING_TOKEN_VARS[token]},${MOTION_EASING_TOKEN_FALLBACKS[token]})`
  }
  if (typeof easing === 'string') return easing

  return `var(${MOTION_EASING_TOKEN_VARS[fallback]},${MOTION_EASING_TOKEN_FALLBACKS[fallback]})`
}

export function shouldReduceMotion(
  config: Pick<ComponentMotionConfig, 'disabled' | 'respectReducedMotion'> = {}
): boolean {
  if (config.disabled) return true
  if (config.respectReducedMotion === false) return false
  return hasReducedMotionPreference()
}

export function getComponentMotionStyle(
  config: ComponentMotionConfig = {}
): Record<string, string> {
  const reduce = shouldReduceMotion(config)
  const direction = reduce ? 'none' : (config.direction ?? 'none')
  const offset = MOTION_DIRECTION_OFFSETS[direction]

  return {
    [COMPONENT_MOTION_VARS.duration]: reduce ? '0ms' : resolveMotionDuration(config.duration),
    [COMPONENT_MOTION_VARS.delay]: reduce ? '0ms' : resolveMotionDuration(config.delay, 'instant'),
    [COMPONENT_MOTION_VARS.easing]: resolveMotionEasing(config.easing),
    [COMPONENT_MOTION_VARS.translateX]: offset.x,
    [COMPONENT_MOTION_VARS.translateY]: offset.y
  }
}

export function getComponentMotionTransition(
  properties: string | string[] = 'all',
  config: ComponentMotionConfig = {}
): string {
  const props = Array.isArray(properties) ? properties : [properties]
  const duration = shouldReduceMotion(config) ? '0ms' : resolveMotionDuration(config.duration)
  const delay = shouldReduceMotion(config) ? '0ms' : resolveMotionDuration(config.delay, 'instant')
  const easing = resolveMotionEasing(config.easing)

  return props.map((prop) => `${prop} ${duration} ${easing} ${delay}`).join(', ')
}

export interface MotionStaggerOptions {
  stepMs?: number
  initialDelayMs?: number
  disabled?: boolean
  respectReducedMotion?: boolean
}

export function getStaggerDelay(index: number, options: MotionStaggerOptions = {}): string {
  if (shouldReduceMotion(options)) return '0ms'
  const stepMs = options.stepMs ?? 40
  const initialDelayMs = options.initialDelayMs ?? 0
  return `${Math.max(0, initialDelayMs + Math.max(0, index) * stepMs)}ms`
}

export function getStaggeredMotionStyle(
  index: number,
  config: ComponentMotionConfig & MotionStaggerOptions = {}
): Record<string, string> {
  const delay = getStaggerDelay(index, config)
  return {
    ...getComponentMotionStyle({ ...config, delay }),
    animationDelay: delay,
    transitionDelay: delay
  }
}

export interface MotionSequenceStep {
  id: string
  durationMs?: number
  gapAfterMs?: number
}

export interface ResolvedMotionSequenceStep extends Required<MotionSequenceStep> {
  index: number
  startMs: number
  style: Record<string, string>
}

export interface MotionSequenceOptions {
  durationMs?: number
  gapMs?: number
  initialDelayMs?: number
  disabled?: boolean
  respectReducedMotion?: boolean
}

export function createMotionSequence(
  steps: MotionSequenceStep[],
  options: MotionSequenceOptions = {}
): ResolvedMotionSequenceStep[] {
  const reduce = shouldReduceMotion(options)
  let cursor = reduce ? 0 : (options.initialDelayMs ?? 0)

  return steps.map((step, index) => {
    const durationMs = reduce ? 0 : (step.durationMs ?? options.durationMs ?? 200)
    const gapAfterMs = reduce ? 0 : (step.gapAfterMs ?? options.gapMs ?? 40)
    const startMs = cursor
    cursor += durationMs + gapAfterMs

    return {
      id: step.id,
      index,
      durationMs,
      gapAfterMs,
      startMs,
      style: {
        [COMPONENT_MOTION_VARS.duration]: `${durationMs}ms`,
        [COMPONENT_MOTION_VARS.delay]: `${startMs}ms`,
        animationDelay: `${startMs}ms`,
        transitionDelay: `${startMs}ms`
      }
    }
  })
}

// ============================================================================
// View Transitions API
// ============================================================================

export interface ViewTransitionLike {
  ready: Promise<void>
  finished: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition(): void
}

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void | Promise<void>) => ViewTransitionLike
}

export interface ViewTransitionOptions {
  disabled?: boolean
  respectReducedMotion?: boolean
}

export function supportsViewTransitions(options: ViewTransitionOptions = {}): boolean {
  if (shouldReduceMotion(options)) return false
  return (
    isBrowser() &&
    typeof (document as DocumentWithViewTransition).startViewTransition === 'function'
  )
}

export async function startTigercatViewTransition(
  updateCallback: () => void | Promise<void>,
  options: ViewTransitionOptions = {}
): Promise<ViewTransitionLike | undefined> {
  if (!supportsViewTransitions(options)) {
    await updateCallback()
    return undefined
  }

  return (document as DocumentWithViewTransition).startViewTransition?.(updateCallback)
}

export function getViewTransitionNameStyle(name: string): Record<string, string> {
  return { viewTransitionName: name }
}

export const VIEW_TRANSITION_CSS = `
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--tiger-motion-duration-relaxed, 300ms);
  animation-timing-function: var(--tiger-motion-ease-standard, cubic-bezier(0.4, 0, 0.2, 1));
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0ms;
  }
}
`

let isViewTransitionStyleInjected = false

export function injectViewTransitionStyles(): void {
  if (!isBrowser() || isViewTransitionStyleInjected) return

  const styleId = 'tiger-ui-view-transition-styles'
  if (document.getElementById(styleId)) {
    isViewTransitionStyleInjected = true
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = VIEW_TRANSITION_CSS
  document.head.appendChild(style)
  isViewTransitionStyleInjected = true
}

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
export const ANIMATION_DURATION_FAST_MS = 200

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
export const DURATION_FAST_CLASS = 'duration-200'

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

/**
 * Spring easing for bouncy/elastic interactions (popover, dropdown enter)
 */
export const EASING_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

/**
 * Smooth easing for gentle transitions
 */
export const EASING_SMOOTH = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

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

@media (prefers-reduced-motion: reduce) {
  .tiger-animate-shake {
    animation-duration: 0ms;
  }
}
`

let isStyleInjected = false

/**
 * Inject shake animation styles into the document head.
 * Safe to call multiple times - will only inject once.
 */
export function injectShakeStyle(): void {
  if (!isBrowser() || isStyleInjected) return

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

@media (prefers-reduced-motion: reduce) {
  .tiger-animate-path-draw,
  .tiger-animate-fade-in,
  .tiger-animate-scale-in,
  .tiger-animate-bar-grow,
  .tiger-animate-pie-draw {
    animation-duration: 0ms;
    animation-delay: 0ms;
  }
}
`

let isSvgStyleInjected = false

/**
 * Inject SVG animation styles into the document head.
 * Safe to call multiple times - will only inject once.
 */
export function injectSvgAnimationStyles(): void {
  if (!isBrowser() || isSvgStyleInjected) return

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
