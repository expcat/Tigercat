/**
 * General helpers - framework-agnostic utilities
 *
 * Organized by responsibility:
 * - Class: class name composition and coercion
 * - DOM: environment detection, clipboard, style values
 * - Component: imperative API, slider math, back-top helpers
 * Motion constants live in `motion/`, not here.
 */

// --- Class ---
export * from '../class-names'
export * from '../coerce-class-value'

// --- DOM ---
export * from '../env'
export * from '../style-values'
export * from '../copy-text'

// --- Component helpers ---
export * from './slider-utils'
export * from '../scroll-root'
export * from '../back-top-utils'
export * from '../imperative-api'
export * from '../imperative-host'
