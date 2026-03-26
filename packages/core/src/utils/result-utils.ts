/**
 * Result component utilities
 * Shared styles and helpers for Result components (Vue + React)
 */

import {
  statusSuccessIconPath,
  statusWarningIconPath,
  statusErrorIconPath,
  statusInfoIconPath
} from './common-icons'

import type { ResultStatus } from '../types/result'

// ---------------------------------------------------------------------------
// Layout / container classes
// ---------------------------------------------------------------------------

/** Outermost wrapper: vertically stacked, centered */
export const resultBaseClasses = 'flex flex-col items-center justify-center py-12 px-6 text-center'

/** Icon container: circle with faded background */
export const resultIconContainerBaseClasses = 'flex items-center justify-center rounded-full mb-6'

/** Icon SVG sizing */
export const resultIconClasses = 'h-16 w-16'

/** Title text */
export const resultTitleClasses = 'text-xl font-semibold mb-2'

/** SubTitle / description text */
export const resultSubTitleClasses = 'text-sm text-[var(--tiger-text-secondary,#6b7280)] mb-8'

/** Extra content (actions slot) wrapper */
export const resultExtraClasses = 'flex flex-wrap items-center justify-center gap-3'

// ---------------------------------------------------------------------------
// Per-status color schemes
// ---------------------------------------------------------------------------

export interface ResultColorScheme {
  /** Background color of the icon circle */
  iconBg: string
  /** SVG stroke / fill colour */
  iconColor: string
  /** Title text colour */
  titleColor: string
}

const resultColors: Record<ResultStatus, ResultColorScheme> = {
  success: {
    iconBg: 'bg-[var(--tiger-success,#22c55e)]/10',
    iconColor: 'text-[var(--tiger-success,#22c55e)]',
    titleColor: 'text-[var(--tiger-text,#111827)]'
  },
  error: {
    iconBg: 'bg-[var(--tiger-error,#ef4444)]/10',
    iconColor: 'text-[var(--tiger-error,#ef4444)]',
    titleColor: 'text-[var(--tiger-text,#111827)]'
  },
  warning: {
    iconBg: 'bg-[var(--tiger-warning,#f59e0b)]/10',
    iconColor: 'text-[var(--tiger-warning,#f59e0b)]',
    titleColor: 'text-[var(--tiger-text,#111827)]'
  },
  info: {
    iconBg: 'bg-[var(--tiger-info,#3b82f6)]/10',
    iconColor: 'text-[var(--tiger-info,#3b82f6)]',
    titleColor: 'text-[var(--tiger-text,#111827)]'
  },
  '404': {
    iconBg: 'bg-[var(--tiger-info,#3b82f6)]/10',
    iconColor: 'text-[var(--tiger-info,#3b82f6)]',
    titleColor: 'text-[var(--tiger-text,#111827)]'
  },
  '403': {
    iconBg: 'bg-[var(--tiger-warning,#f59e0b)]/10',
    iconColor: 'text-[var(--tiger-warning,#f59e0b)]',
    titleColor: 'text-[var(--tiger-text,#111827)]'
  },
  '500': {
    iconBg: 'bg-[var(--tiger-error,#ef4444)]/10',
    iconColor: 'text-[var(--tiger-error,#ef4444)]',
    titleColor: 'text-[var(--tiger-text,#111827)]'
  }
}

/**
 * Get the color scheme for a given result status.
 */
export function getResultColorScheme(status: ResultStatus): ResultColorScheme {
  return resultColors[status]
}

// ---------------------------------------------------------------------------
// Icon paths per status
// ---------------------------------------------------------------------------

/**
 * Standard 24×24 stroke-icon path for simple statuses.
 * HTTP-error statuses (404/403/500) reuse semantic icons.
 */
const resultIconPaths: Record<ResultStatus, string> = {
  success: statusSuccessIconPath,
  error: statusErrorIconPath,
  warning: statusWarningIconPath,
  info: statusInfoIconPath,
  '404': statusInfoIconPath,
  '403': statusWarningIconPath,
  '500': statusErrorIconPath
}

/**
 * Get the icon SVG path for a given status.
 */
export function getResultIconPath(status: ResultStatus): string {
  return resultIconPaths[status]
}

// ---------------------------------------------------------------------------
// HTTP-error numeric labels
// ---------------------------------------------------------------------------

const httpStatusLabels: Record<string, string> = {
  '404': '404',
  '403': '403',
  '500': '500'
}

/**
 * If the status is an HTTP error code return its label, otherwise `undefined`.
 */
export function getResultHttpLabel(status: ResultStatus): string | undefined {
  return httpStatusLabels[status]
}
