/**
 * Transition system for Tigercat UI components.
 *
 * Provides standardized enter/leave transition class sets
 * compatible with both Vue's <Transition> and React CSS-based transitions.
 */

import {
  ANIMATION_DURATION_MS,
  ANIMATION_DURATION_FAST_MS,
  EASING_ENTER,
  EASING_LEAVE
} from './animation'

// ============================================================================
// Types
// ============================================================================

/**
 * Standard transition type names
 */
export type TransitionType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'collapse'

/**
 * CSS class names for each phase of a transition
 */
export interface TransitionClasses {
  /** Classes applied before element enters (initial hidden state) */
  enterFrom: string
  /** Classes applied during the enter transition (active) */
  enterActive: string
  /** Classes applied after element has entered (final visible state) */
  enterTo: string
  /** Classes applied before element leaves (initial visible state) */
  leaveFrom: string
  /** Classes applied during the leave transition (active) */
  leaveActive: string
  /** Classes applied after element has left (final hidden state) */
  leaveTo: string
}

/**
 * Configuration for a transition
 */
export interface TransitionConfig {
  /** Transition type name */
  type: TransitionType
  /** Duration in milliseconds */
  duration?: number
  /** CSS easing for enter */
  enterEasing?: string
  /** CSS easing for leave */
  leaveEasing?: string
}

// ============================================================================
// Transition Presets
// ============================================================================

export const transitionPresets: Record<TransitionType, TransitionClasses> = {
  fade: {
    enterFrom: 'opacity-0',
    enterActive: `transition-opacity duration-300 ${EASING_ENTER}`,
    enterTo: 'opacity-100',
    leaveFrom: 'opacity-100',
    leaveActive: `transition-opacity duration-300 ${EASING_LEAVE}`,
    leaveTo: 'opacity-0'
  },
  'slide-up': {
    enterFrom: 'opacity-0 translate-y-2',
    enterActive: `transition-all duration-300 ${EASING_ENTER}`,
    enterTo: 'opacity-100 translate-y-0',
    leaveFrom: 'opacity-100 translate-y-0',
    leaveActive: `transition-all duration-300 ${EASING_LEAVE}`,
    leaveTo: 'opacity-0 translate-y-2'
  },
  'slide-down': {
    enterFrom: 'opacity-0 -translate-y-2',
    enterActive: `transition-all duration-300 ${EASING_ENTER}`,
    enterTo: 'opacity-100 translate-y-0',
    leaveFrom: 'opacity-100 translate-y-0',
    leaveActive: `transition-all duration-300 ${EASING_LEAVE}`,
    leaveTo: 'opacity-0 -translate-y-2'
  },
  'slide-left': {
    enterFrom: 'opacity-0 -translate-x-full',
    enterActive: `transition-all duration-300 ${EASING_ENTER}`,
    enterTo: 'opacity-100 translate-x-0',
    leaveFrom: 'opacity-100 translate-x-0',
    leaveActive: `transition-all duration-300 ${EASING_LEAVE}`,
    leaveTo: 'opacity-0 -translate-x-full'
  },
  'slide-right': {
    enterFrom: 'opacity-0 translate-x-full',
    enterActive: `transition-all duration-300 ${EASING_ENTER}`,
    enterTo: 'opacity-100 translate-x-0',
    leaveFrom: 'opacity-100 translate-x-0',
    leaveActive: `transition-all duration-300 ${EASING_LEAVE}`,
    leaveTo: 'opacity-0 translate-x-full'
  },
  scale: {
    enterFrom: 'opacity-0 scale-95',
    enterActive: `transition-all duration-200 ${EASING_ENTER}`,
    enterTo: 'opacity-100 scale-100',
    leaveFrom: 'opacity-100 scale-100',
    leaveActive: `transition-all duration-200 ${EASING_LEAVE}`,
    leaveTo: 'opacity-0 scale-95'
  },
  collapse: {
    enterFrom: 'opacity-0 max-h-0 overflow-hidden',
    enterActive: `transition-all duration-300 ${EASING_ENTER}`,
    enterTo: 'opacity-100 max-h-[var(--tiger-collapse-height,1000px)]',
    leaveFrom: 'opacity-100 max-h-[var(--tiger-collapse-height,1000px)]',
    leaveActive: `transition-all duration-300 ${EASING_LEAVE}`,
    leaveTo: 'opacity-0 max-h-0 overflow-hidden'
  }
}

/**
 * Get transition classes for a given type or config.
 */
export function getTransitionClasses(
  typeOrConfig: TransitionType | TransitionConfig
): TransitionClasses {
  if (typeof typeOrConfig === 'string') {
    return transitionPresets[typeOrConfig]
  }

  const preset = transitionPresets[typeOrConfig.type]
  if (!typeOrConfig.duration && !typeOrConfig.enterEasing && !typeOrConfig.leaveEasing) {
    return preset
  }

  const durationClass = typeOrConfig.duration ? `duration-[${typeOrConfig.duration}ms]` : undefined

  const enterEasing = typeOrConfig.enterEasing ?? EASING_ENTER
  const leaveEasing = typeOrConfig.leaveEasing ?? EASING_LEAVE

  return {
    enterFrom: preset.enterFrom,
    enterActive: durationClass
      ? `transition-all ${durationClass} ${enterEasing}`
      : preset.enterActive,
    enterTo: preset.enterTo,
    leaveFrom: preset.leaveFrom,
    leaveActive: durationClass
      ? `transition-all ${durationClass} ${leaveEasing}`
      : preset.leaveActive,
    leaveTo: preset.leaveTo
  }
}

/**
 * Map component names to their default transition types
 */
export const componentTransitionMap: Record<string, TransitionType> = {
  Modal: 'fade',
  Drawer: 'slide-right',
  Collapse: 'collapse',
  Dropdown: 'scale',
  Tooltip: 'scale',
  Popover: 'scale',
  Popconfirm: 'scale',
  Message: 'slide-down',
  Notification: 'slide-right'
}

/**
 * Get the default transition for a component
 */
export function getComponentTransition(componentName: string): TransitionClasses {
  const type = componentTransitionMap[componentName]
  return type ? transitionPresets[type] : transitionPresets.fade
}

// ============================================================================
// Reduced Motion
// ============================================================================

/**
 * Check if the user prefers reduced motion.
 * Returns false in SSR environments.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get transition classes that respect reduced motion preference.
 * When reduced motion is preferred, returns instant transitions (no animation).
 */
export function getAccessibleTransitionClasses(
  typeOrConfig: TransitionType | TransitionConfig
): TransitionClasses {
  if (prefersReducedMotion()) {
    return {
      enterFrom: 'opacity-0',
      enterActive: 'transition-opacity duration-0',
      enterTo: 'opacity-100',
      leaveFrom: 'opacity-100',
      leaveActive: 'transition-opacity duration-0',
      leaveTo: 'opacity-0'
    }
  }
  return getTransitionClasses(typeOrConfig)
}

/**
 * Standard transition durations aligned with Token system
 */
export const TRANSITION_DURATIONS = {
  fast: ANIMATION_DURATION_FAST_MS,
  normal: ANIMATION_DURATION_MS,
  slow: 500
} as const
