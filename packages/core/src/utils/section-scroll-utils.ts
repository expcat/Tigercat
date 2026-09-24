import type { ScrollRootInput } from '../types/scroll-root'
import { prefersReducedMotion } from './transition'
import { resolveScrollRoot, type ResolvedScrollRoot } from './scroll-root'

/**
 * Shared active-href / scroll-root / reduced-motion model for Anchor and ScrollSpy.
 * The two components stay separate; they both read this model.
 */
export interface SectionScrollModel {
  activeHref: string
  scrollRoot: ResolvedScrollRoot
  reducedMotion: boolean
}

export function sectionScrollBehavior(reducedMotion?: boolean): ScrollBehavior {
  const reduce = reducedMotion ?? prefersReducedMotion()
  return reduce ? 'auto' : 'smooth'
}

export function createSectionScrollModel(options: {
  activeHref?: string
  container?: ScrollRootInput
  from?: Element | null
  reducedMotion?: boolean
}): SectionScrollModel {
  return {
    activeHref: options.activeHref ?? '',
    scrollRoot: resolveScrollRoot(options.container, { from: options.from }),
    reducedMotion: options.reducedMotion ?? prefersReducedMotion()
  }
}

/** Caller href wins when set. Otherwise the detected href. */
export function resolveSectionActiveHref(controlled: string | undefined, detected: string): string {
  if (controlled != null && controlled !== '') return controlled
  return detected
}
