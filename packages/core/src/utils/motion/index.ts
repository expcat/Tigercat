/**
 * Motion utilities — animation constants + transition presets
 *
 * Consolidates `animation.ts` and `transition.ts` into a single
 * sub-module for easier discovery and import.
 *
 * @example
 * ```ts
 * import {
 *   ANIMATION_DURATION_MS,
 *   getTransitionClasses,
 *   prefersReducedMotion
 * } from '@expcat/tigercat-core'
 * ```
 */

export * from '../animation'
export * from '../transition'
