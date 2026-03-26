/**
 * Empty state component utilities
 * Shared styles and helpers for Empty components (Vue + React)
 */

import type { EmptyPreset } from '../types/empty'

// ---------------------------------------------------------------------------
// Layout classes
// ---------------------------------------------------------------------------

/** Outermost wrapper */
export const emptyBaseClasses = 'flex flex-col items-center justify-center py-10 px-4 text-center'

/** Image / illustration wrapper */
export const emptyImageClasses = 'mb-4'

/** Description text */
export const emptyDescriptionClasses = 'text-sm text-[var(--tiger-text-secondary,#6b7280)] mb-6'

/** Actions slot wrapper */
export const emptyActionsClasses = 'flex flex-wrap items-center justify-center gap-3'

// ---------------------------------------------------------------------------
// Default descriptions per preset
// ---------------------------------------------------------------------------

const presetDescriptions: Record<EmptyPreset, string> = {
  default: 'No data',
  simple: 'No data',
  'no-data': 'No data available',
  'no-results': 'No results found',
  error: 'Something went wrong'
}

export function getEmptyDescription(preset: EmptyPreset): string {
  return presetDescriptions[preset]
}

// ---------------------------------------------------------------------------
// Built-in SVG illustration
// ---------------------------------------------------------------------------

/**
 * Minimalist "empty box" illustration — a simple open box outline.
 *
 * Returned as an array of SVG element descriptors so frameworks can render
 * without `dangerouslySetInnerHTML`.
 *
 * viewBox is "0 0 64 41".
 */
export const emptyIllustrationViewBox = '0 0 64 41'

export interface EmptyIllustrationPath {
  d: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
}

/**
 * Paths that form a minimal open-box illustration (64×41).
 */
export const emptyIllustrationPaths: EmptyIllustrationPath[] = [
  // Box body shadow
  {
    d: 'M14 22h36v16H14z',
    fill: 'var(--tiger-border,#e5e7eb)',
    opacity: 0.4
  },
  // Box body
  {
    d: 'M16 20h32v16H16z',
    fill: 'var(--tiger-surface-muted,#f9fafb)',
    stroke: 'var(--tiger-border,#e5e7eb)',
    strokeWidth: 1.5
  },
  // Box lid left
  {
    d: 'M8 20l24-16',
    stroke: 'var(--tiger-border,#e5e7eb)',
    strokeWidth: 1.5
  },
  // Box lid right
  {
    d: 'M56 20L32 4',
    stroke: 'var(--tiger-border,#e5e7eb)',
    strokeWidth: 1.5
  },
  // Cross inside box (simple "empty" mark)
  {
    d: 'M26 26l12 6M38 26l-12 6',
    stroke: 'var(--tiger-text-disabled,#9ca3af)',
    strokeWidth: 1
  }
]
