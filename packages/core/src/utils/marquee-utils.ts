/**
 * Marquee utility functions
 *
 * Class builders, CSS-variable style, and looping helpers shared by the
 * Vue and React Marquee implementations. Resolvers are string/number only
 * so they stay safe to evaluate during server-side rendering. Style
 * injection is guarded by `isBrowser()`.
 */

import {
  DEFAULT_MARQUEE_ARIA_LABEL,
  DEFAULT_MARQUEE_DIRECTION,
  DEFAULT_MARQUEE_DURATION_MS,
  DEFAULT_MARQUEE_GAP_PX,
  DEFAULT_MARQUEE_PAUSE_ON_HOVER,
  DEFAULT_MARQUEE_REPEAT,
  MAX_MARQUEE_REPEAT,
  type MarqueeDirection,
  type MarqueeGap
} from '../types/marquee'
import { classNames } from './class-names'
import { isBrowser } from './env'

/** Style element id used by {@link injectMarqueeStyles} */
export const MARQUEE_STYLE_ID = 'tiger-ui-marquee-styles'

/** CSS custom properties written onto the looping track */
export const MARQUEE_DURATION_VAR = '--tiger-marquee-duration'
export const MARQUEE_COPIES_VAR = '--tiger-marquee-copies'
export const MARQUEE_GAP_VAR = '--tiger-marquee-gap'

/**
 * Keyframes plus pause / reduced-motion rules. Clones stay in the DOM for
 * hydration stability; the reduced-motion block hides them and stops motion.
 */
export const MARQUEE_CSS = `
@keyframes tiger-marquee-x {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(calc(-100% / var(${MARQUEE_COPIES_VAR}, 2)), 0, 0); }
}

@keyframes tiger-marquee-y {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(0, calc(-100% / var(${MARQUEE_COPIES_VAR}, 2)), 0); }
}

.tiger-marquee-track {
  animation: tiger-marquee-x var(${MARQUEE_DURATION_VAR}, 20000ms) linear infinite;
}

.tiger-marquee-vertical > .tiger-marquee-track {
  animation-name: tiger-marquee-y;
}

.tiger-marquee-reverse > .tiger-marquee-track {
  animation-direction: reverse;
}

.tiger-marquee-content {
  gap: var(${MARQUEE_GAP_VAR}, 16px);
}

.tiger-marquee-horizontal > .tiger-marquee-track > .tiger-marquee-content {
  padding-inline-end: var(${MARQUEE_GAP_VAR}, 16px);
}

.tiger-marquee-vertical > .tiger-marquee-track > .tiger-marquee-content {
  padding-block-end: var(${MARQUEE_GAP_VAR}, 16px);
}

.tiger-marquee-static > .tiger-marquee-track {
  animation: none;
}

.tiger-marquee[data-marquee-paused='true'] > .tiger-marquee-track,
.tiger-marquee-pause-hover:hover > .tiger-marquee-track,
.tiger-marquee-pause-hover:focus-within > .tiger-marquee-track {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .tiger-marquee {
    overflow: auto;
  }

  .tiger-marquee > .tiger-marquee-track {
    animation: none !important;
    will-change: auto;
  }

  .tiger-marquee .tiger-marquee-clone {
    display: none !important;
  }

  .tiger-marquee-horizontal > .tiger-marquee-track > .tiger-marquee-content {
    padding-inline-end: 0;
  }

  .tiger-marquee-vertical > .tiger-marquee-track > .tiger-marquee-content {
    padding-block-end: 0;
  }
}
`

/** Root overflow clip */
export const marqueeRootClasses = 'tiger-marquee overflow-hidden max-w-full'

/** Pause via :hover / :focus-within as a CSS complement to JS state */
export const marqueePauseHoverClasses = 'tiger-marquee-pause-hover'

/** Horizontal axis */
export const marqueeHorizontalClasses = 'tiger-marquee-horizontal'

/** Vertical axis */
export const marqueeVerticalClasses = 'tiger-marquee-vertical'

/** Reverse the CSS animation (right / down) */
export const marqueeReverseClasses = 'tiger-marquee-reverse'

/** Skip looping animation when there is only one copy */
export const marqueeStaticClasses = 'tiger-marquee-static'

/** Looping track */
export const marqueeTrackClasses = 'tiger-marquee-track flex w-max'

/** Vertical track fills the region width and sizes to content height */
export const marqueeTrackVerticalClasses = 'flex-col w-full h-max'

/** One copy of the consumer content */
export const marqueeContentClasses = 'tiger-marquee-content flex shrink-0 items-center'

/** Vertical copy stacks children */
export const marqueeContentVerticalClasses = 'flex-col items-stretch'

/** Duplicate copies used only for the seamless loop */
export const marqueeCloneClasses = 'tiger-marquee-clone'

const MARQUEE_DIRECTIONS = new Set<MarqueeDirection>(['left', 'right', 'up', 'down'])

let isStyleInjected = false

/**
 * Inject looping keyframes and reduced-motion rules once.
 * Safe to call during render; no-ops during SSR.
 */
export function injectMarqueeStyles(): void {
  if (!isBrowser() || isStyleInjected) return

  if (document.getElementById(MARQUEE_STYLE_ID)) {
    isStyleInjected = true
    return
  }

  const style = document.createElement('style')
  style.id = MARQUEE_STYLE_ID
  style.textContent = MARQUEE_CSS
  document.head.appendChild(style)
  isStyleInjected = true
}

/**
 * Resolve direction, falling back to {@link DEFAULT_MARQUEE_DIRECTION}.
 */
export function resolveMarqueeDirection(direction?: MarqueeDirection): MarqueeDirection {
  if (direction && MARQUEE_DIRECTIONS.has(direction)) return direction
  return DEFAULT_MARQUEE_DIRECTION
}

/**
 * Whether the resolved direction scrolls on the block axis.
 */
export function isMarqueeVertical(direction?: MarqueeDirection): boolean {
  const resolved = resolveMarqueeDirection(direction)
  return resolved === 'up' || resolved === 'down'
}

/**
 * Whether the resolved direction should reverse the CSS animation.
 */
export function isMarqueeReverse(direction?: MarqueeDirection): boolean {
  const resolved = resolveMarqueeDirection(direction)
  return resolved === 'right' || resolved === 'down'
}

/**
 * Resolve loop duration as a CSS time value.
 * Non-finite or non-positive numbers fall back to the default.
 */
export function resolveMarqueeDuration(duration?: number): string {
  if (typeof duration === 'number' && Number.isFinite(duration) && duration > 0) {
    return `${duration}ms`
  }
  return `${DEFAULT_MARQUEE_DURATION_MS}ms`
}

/**
 * Resolve gap as a CSS length. Numbers become pixels.
 */
export function resolveMarqueeGap(gap?: MarqueeGap): string {
  if (typeof gap === 'number' && Number.isFinite(gap) && gap >= 0) {
    return `${gap}px`
  }
  if (typeof gap === 'string') {
    const trimmed = gap.trim()
    if (trimmed) return trimmed
  }
  return `${DEFAULT_MARQUEE_GAP_PX}px`
}

/**
 * Resolve how many copies to render. Floors to an integer in 1..max.
 */
export function resolveMarqueeRepeat(repeat?: number): number {
  if (typeof repeat === 'number' && Number.isFinite(repeat)) {
    const copies = Math.floor(repeat)
    if (copies >= 1) return Math.min(copies, MAX_MARQUEE_REPEAT)
  }
  return DEFAULT_MARQUEE_REPEAT
}

/**
 * Seamless CSS looping needs at least two identical copies.
 */
export function shouldLoopMarquee(repeat?: number): boolean {
  return resolveMarqueeRepeat(repeat) >= 2
}

/**
 * Resolve pause-on-hover, falling back to {@link DEFAULT_MARQUEE_PAUSE_ON_HOVER}.
 */
export function resolveMarqueePauseOnHover(value?: boolean): boolean {
  if (typeof value === 'boolean') return value
  return DEFAULT_MARQUEE_PAUSE_ON_HOVER
}

/**
 * Resolve the accessible name. Empty or whitespace-only values fall back
 * to {@link DEFAULT_MARQUEE_ARIA_LABEL}.
 */
export function resolveMarqueeAriaLabel(label?: string): string {
  if (typeof label === 'string') {
    const trimmed = label.trim()
    if (trimmed) return trimmed
  }
  return DEFAULT_MARQUEE_ARIA_LABEL
}

/**
 * Combine hover and focus-within into a single paused flag.
 */
export function isMarqueePaused(input: {
  pauseOnHover?: boolean
  hovered?: boolean
  focused?: boolean
}): boolean {
  if (!resolveMarqueePauseOnHover(input.pauseOnHover)) return false
  return Boolean(input.hovered || input.focused)
}

/**
 * Whether a focus move is still inside the marquee root.
 */
export function isMarqueeFocusInside(
  root: EventTarget | null,
  related: EventTarget | null
): boolean {
  return root instanceof Node && related instanceof Node && root.contains(related)
}

/**
 * CSS variables for one loop cycle.
 */
export function getMarqueeTrackStyle(
  input: { duration?: number; gap?: MarqueeGap; repeat?: number } = {}
): Record<string, string> {
  return {
    [MARQUEE_DURATION_VAR]: resolveMarqueeDuration(input.duration),
    [MARQUEE_COPIES_VAR]: String(resolveMarqueeRepeat(input.repeat)),
    [MARQUEE_GAP_VAR]: resolveMarqueeGap(input.gap)
  }
}

/**
 * Classes for the root region element.
 */
export function getMarqueeRootClasses(
  input: {
    direction?: MarqueeDirection
    pauseOnHover?: boolean
    repeat?: number
    className?: string
  } = {}
): string {
  const direction = resolveMarqueeDirection(input.direction)
  const looping = shouldLoopMarquee(input.repeat)
  return classNames(
    marqueeRootClasses,
    isMarqueeVertical(direction) ? marqueeVerticalClasses : marqueeHorizontalClasses,
    isMarqueeReverse(direction) && marqueeReverseClasses,
    resolveMarqueePauseOnHover(input.pauseOnHover) && marqueePauseHoverClasses,
    !looping && marqueeStaticClasses,
    input.className
  )
}

/**
 * Classes for the translating track.
 */
export function getMarqueeTrackClasses(direction?: MarqueeDirection): string {
  return classNames(
    marqueeTrackClasses,
    isMarqueeVertical(direction) && marqueeTrackVerticalClasses
  )
}

/**
 * Classes for one content copy. Clones also get {@link marqueeCloneClasses}.
 */
export function getMarqueeContentClasses(
  input: {
    direction?: MarqueeDirection
    clone?: boolean
    className?: string
  } = {}
): string {
  return classNames(
    marqueeContentClasses,
    isMarqueeVertical(input.direction) && marqueeContentVerticalClasses,
    input.clone && marqueeCloneClasses,
    input.className
  )
}
