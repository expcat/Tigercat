/**
 * Result component utilities
 * Shared styles and helpers for Result components (Vue + React)
 */

import {
  statusSuccessIconPath,
  statusWarningIconPath,
  statusErrorIconPath,
  statusInfoIconPath
} from './icons/status'

import type { ResultHeadingLevel, ResultStatus } from '../types/result'

// ---------------------------------------------------------------------------
// Layout / container classes
// ---------------------------------------------------------------------------

/** Outermost wrapper: vertically stacked, centered */
export const resultBaseClasses = 'flex flex-col items-center justify-center py-12 px-6 text-center'

/** Icon circle size in CSS pixels — equal width/height so HTTP digits stay round. */
export const RESULT_ICON_SIZE_PX = 96

/** Icon container: circle with faded background */
export const resultIconContainerBaseClasses = 'flex items-center justify-center rounded-full mb-6'

/** Icon SVG sizing */
export const resultIconClasses = 'h-16 w-16'

/** HTTP status digits inside the circle */
export const resultHttpLabelClasses = 'text-2xl font-bold tabular-nums'

/** Title text */
export const resultTitleClasses = 'text-xl font-semibold mb-2'

/** SubTitle / description text */
export const resultSubTitleClasses = 'text-sm text-[var(--tiger-text-secondary,#6b7280)] mb-8'

/** Extra content (actions slot) wrapper */
export const resultExtraClasses = 'flex flex-wrap items-center justify-center gap-3'

const RESULT_HEADING_LEVELS: ResultHeadingLevel[] = [1, 2, 3, 4, 5, 6]

export function resolveResultHeadingLevel(level?: number): ResultHeadingLevel {
  return RESULT_HEADING_LEVELS.includes(level as ResultHeadingLevel)
    ? (level as ResultHeadingLevel)
    : 2
}

export function resultHeadingTag(level?: number): `h${ResultHeadingLevel}` {
  return `h${resolveResultHeadingLevel(level)}`
}

// ---------------------------------------------------------------------------
// Per-status color schemes
// ---------------------------------------------------------------------------

export interface ResultColorScheme {
  /** Background color of the icon circle (color-mix, not a Tailwind /opacity). */
  iconBg: string
  /** SVG stroke / fill colour */
  iconColor: string
}

function mixStatusWash(cssVar: string, fallbackHex: string): string {
  return `color-mix(in srgb, var(${cssVar}, ${fallbackHex}) 12%, transparent)`
}

function statusTextClass(cssVar: string, fallbackHex: string): string {
  return `text-[var(${cssVar},${fallbackHex})]`
}

const SEMANTIC_RESULT_STATUSES = ['success', 'error', 'warning', 'info'] as const
type SemanticResultStatus = (typeof SEMANTIC_RESULT_STATUSES)[number]

const semanticColors: Record<SemanticResultStatus, ResultColorScheme> = {
  success: {
    iconBg: mixStatusWash('--tiger-success', '#16a34a'),
    iconColor: statusTextClass('--tiger-success', '#16a34a')
  },
  error: {
    iconBg: mixStatusWash('--tiger-error', '#dc2626'),
    iconColor: statusTextClass('--tiger-error', '#dc2626')
  },
  warning: {
    iconBg: mixStatusWash('--tiger-warning', '#d97706'),
    iconColor: statusTextClass('--tiger-warning', '#d97706')
  },
  info: {
    iconBg: mixStatusWash('--tiger-info', '#3b82f6'),
    iconColor: statusTextClass('--tiger-info', '#3b82f6')
  }
}

const HTTP_COLOR_BY_STATUS: Record<string, SemanticResultStatus> = {
  '404': 'info',
  '403': 'warning',
  '500': 'error'
}

function resolveSemanticStatus(
  status: ResultStatus | string | undefined | null
): SemanticResultStatus {
  if (status && (SEMANTIC_RESULT_STATUSES as readonly string[]).includes(status)) {
    return status as SemanticResultStatus
  }
  return HTTP_COLOR_BY_STATUS[status ?? ''] ?? 'info'
}

/**
 * Get the color scheme for a given result status. Unknown values fall back to info.
 */
export function getResultColorScheme(
  status: ResultStatus | string | undefined | null
): ResultColorScheme {
  return semanticColors[resolveSemanticStatus(status)]
}

// ---------------------------------------------------------------------------
// Icon paths per semantic status (HTTP codes render digits, not these paths)
// ---------------------------------------------------------------------------

const resultIconPaths: Record<SemanticResultStatus, string> = {
  success: statusSuccessIconPath,
  error: statusErrorIconPath,
  warning: statusWarningIconPath,
  info: statusInfoIconPath
}

/**
 * Get the icon SVG path for a given status. HTTP codes and unknown values
 * fall back to the info path; the component does not draw a path for HTTP.
 */
export function getResultIconPath(status: ResultStatus | string | undefined | null): string {
  const semantic = (SEMANTIC_RESULT_STATUSES as readonly string[]).includes(status ?? '')
    ? (status as SemanticResultStatus)
    : 'info'
  return resultIconPaths[semantic]
}

// ---------------------------------------------------------------------------
// HTTP-error numeric statuses
// ---------------------------------------------------------------------------

const HTTP_RESULT_STATUSES = new Set(['404', '403', '500'])

/**
 * Whether the status is an HTTP error code (`404` / `403` / `500`).
 *
 * For these statuses the Result component renders the code itself as the icon
 * content; use `isHttpResultStatus(status) ? status : undefined` at the call site.
 */
export function isHttpResultStatus(status: ResultStatus | string | undefined | null): boolean {
  return HTTP_RESULT_STATUSES.has(status ?? '')
}
