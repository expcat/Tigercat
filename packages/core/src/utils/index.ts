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

// Transition system (enter/leave presets)
export * from './transition'

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

// TaskBoard utilities
export * from './task-board-utils'

// Cascader utilities
export * from './cascader-utils'

// AutoComplete utilities
export * from './auto-complete-utils'

// Transfer utilities
export * from './transfer-utils'

// TreeSelect utilities
export * from './tree-select-utils'

// Phase 1B/1C utilities (v0.6.0+)
export * from './rate-utils'
export * from './segmented-utils'
export * from './statistic-utils'
export * from './color-picker-utils'
export * from './virtual-list-utils'
export * from './stepper-utils'
export * from './calendar-utils'
export * from './mentions-utils'
export * from './qrcode-utils'

// Table v0.6.0 upgrades
export * from './table-filter-utils'
export * from './table-group-utils'
export * from './table-export-utils'

// Form v0.6.0 upgrades
export * from './form-dependency-utils'
export * from './form-history-utils'

// Responsive utilities
export * from './responsive'
