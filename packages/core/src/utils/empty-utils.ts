/**
 * Empty state component utilities
 * Shared styles and helpers for Empty components (Vue + React)
 */

import type { EmptyPreset } from '../types/empty'
import type { TigerLocale } from '../types/locale'
import { getEmptyLabels } from './locale-utils'

// ---------------------------------------------------------------------------
// Layout classes
// ---------------------------------------------------------------------------

/** Outermost wrapper. Gap spaces illustration, copy, extra, and body. */
export const emptyBaseClasses =
  'flex flex-col items-center justify-center gap-4 py-10 px-4 text-center'

/** Image / illustration wrapper */
export const emptyImageClasses = ''

/** Description text */
export const emptyDescriptionClasses = 'text-sm text-[var(--tiger-text-secondary)]'

/** Actions slot wrapper */
export const emptyActionsClasses = 'flex flex-wrap items-center justify-center gap-3'

// ---------------------------------------------------------------------------
// Default descriptions per preset
// ---------------------------------------------------------------------------

export function getEmptyDescription(preset: EmptyPreset, locale?: Partial<TigerLocale>): string {
  const empty = getEmptyLabels(locale)
  switch (preset) {
    case 'no-data':
      return empty.noDataAvailable
    case 'no-results':
      return empty.noResults
    case 'error':
      return empty.error
    case 'default':
    case 'simple':
    default:
      return empty.noData
  }
}

export type EmptyImageMode = 'none' | 'builtin' | 'custom'

/**
 * One image source: hidden, the built-in preset, or a caller node.
 * `showImage: false` hides the illustration even when a custom node is passed.
 */
export function resolveEmptyImageMode(options: {
  showImage: boolean
  hasCustomImage: boolean
  preset: EmptyPreset
}): EmptyImageMode {
  if (!options.showImage) return 'none'
  if (options.hasCustomImage) return 'custom'
  if (options.preset === 'simple') return 'none'
  return 'builtin'
}

// ---------------------------------------------------------------------------
// Built-in SVG illustrations
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

export interface EmptyIllustration {
  viewBox: string
  paths: EmptyIllustrationPath[]
}

/**
 * Paths that form a minimal open-box illustration (64×41).
 */
export const emptyIllustrationPaths: EmptyIllustrationPath[] = [
  // Box body shadow
  {
    d: 'M14 22h36v16H14z',
    fill: 'var(--tiger-border)',
    opacity: 0.4
  },
  // Box body
  {
    d: 'M16 20h32v16H16z',
    fill: 'var(--tiger-surface-muted)',
    stroke: 'var(--tiger-border)',
    strokeWidth: 1.5
  },
  // Box lid left
  {
    d: 'M8 20l24-16',
    stroke: 'var(--tiger-border)',
    strokeWidth: 1.5
  },
  // Box lid right
  {
    d: 'M56 20L32 4',
    stroke: 'var(--tiger-border)',
    strokeWidth: 1.5
  },
  // Cross inside box (simple "empty" mark)
  {
    d: 'M26 26l12 6M38 26l-12 6',
    stroke: 'var(--tiger-text-disabled)',
    strokeWidth: 1
  }
]

const emptyBoxIllustration: EmptyIllustration = {
  viewBox: emptyIllustrationViewBox,
  paths: emptyIllustrationPaths
}

const emptyNoResultsIllustration: EmptyIllustration = {
  viewBox: emptyIllustrationViewBox,
  paths: [
    {
      d: 'M34 16A10 10 0 1 1 14 16 10 10 0 1 1 34 16z',
      fill: 'var(--tiger-surface-muted)',
      stroke: 'var(--tiger-border)',
      strokeWidth: 1.5
    },
    {
      d: 'M31 23l16 13',
      stroke: 'var(--tiger-text-disabled)',
      strokeWidth: 2
    }
  ]
}

const emptyErrorIllustration: EmptyIllustration = {
  viewBox: emptyIllustrationViewBox,
  paths: [
    {
      d: 'M32 6L58 36H6z',
      fill: 'var(--tiger-surface-muted)',
      stroke: 'var(--tiger-error)',
      strokeWidth: 1.5
    },
    {
      d: 'M32 16v10',
      stroke: 'var(--tiger-error)',
      strokeWidth: 1.5
    },
    {
      d: 'M32 30.5h.01',
      stroke: 'var(--tiger-error)',
      strokeWidth: 2.5
    }
  ]
}

export function getEmptyIllustration(preset: EmptyPreset): EmptyIllustration | null {
  switch (preset) {
    case 'simple':
      return null
    case 'no-results':
      return emptyNoResultsIllustration
    case 'error':
      return emptyErrorIllustration
    case 'default':
    case 'no-data':
    default:
      return emptyBoxIllustration
  }
}
