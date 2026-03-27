/**
 * Tigercat Core
 *
 * Shared Tailwind CSS configuration and utilities for Tigercat UI library
 *
 * @module @expcat/tigercat-core
 *
 * Utils are organized into submodules:
 * - helpers/  : class-names, coerce-class-value, env, style-values, copy-text, animation
 * - icons/    : common-icons (consolidated from datepicker/timepicker icons), svg-attrs
 * - a11y/     : a11y-utils, focus-utils, overlay-utils
 * - i18n/     : locale-utils, datepicker-i18n, timepicker-utils (labels), upload-labels
 * - styles/   : component-specific style utilities (button, input, select, timepicker-utils, etc.)
 */

export const version = '0.8.0'

// ============================================================================
// UTILITIES (re-exported from organized submodules for backward compatibility)
// ============================================================================
export * from './utils'

// ============================================================================
// TYPES
// ============================================================================
export * from './types'

// ============================================================================
// THEME
// ============================================================================
export * from './theme'
export * from './tailwind-plugin'

// ============================================================================
// THEME SYSTEM (v0.7.0+ — presets, ThemeManager)
// ============================================================================
export * from './themes'

// ============================================================================
// DESIGN TOKENS (v0.5.0+)
// ============================================================================
export * from './tokens'
