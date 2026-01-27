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
