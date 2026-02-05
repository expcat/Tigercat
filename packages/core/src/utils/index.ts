/**
 * Core Utils - Re-export organized modules
 *
 * This barrel file provides both:
 * 1. Grouped exports via sub-modules (helpers/, icons/, a11y/, i18n/, styles/)
 * 2. Flat exports for backward compatibility
 */

// Re-export all from organized sub-modules
export * from './helpers'
export * from './icons'
export * from './a11y'
export * from './i18n'
export * from './styles'

// Floating UI positioning utilities
export * from './floating'

// Animation constants and utilities
export * from './animation'

// ChatWindow utilities
export * from './chat-window-utils'

// ActivityFeed utilities
export * from './activity-feed-utils'

// NotificationCenter utilities
export * from './notification-center-utils'

// CommentThread utilities
export * from './comment-thread-utils'

// Composite time helpers
export * from './composite-time-utils'
