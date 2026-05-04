/**
 * General helpers - framework-agnostic utilities
 *
 * Organized by responsibility:
 * - Class: class name composition and coercion
 * - DOM: environment detection, clipboard, style values
 * - Motion: animation constants (re-exported from motion/)
 * - Component: imperative API, slider, back-top helpers
 */

// --- Class ---
export * from '../class-names'
export * from '../coerce-class-value'
export * from '../compose-classes'

// --- DOM ---
export * from '../env'
export * from '../style-values'
export * from '../copy-text'

// --- Motion (compat re-export; prefer importing from motion/) ---
export * from '../animation'

// --- Component helpers ---
export * from './slider-utils'
export * from '../back-top-utils'
export * from '../imperative-api'
