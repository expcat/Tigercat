import type { ProgressSize, ProgressStatus, ProgressType, ProgressVariant } from '../types/progress'
import { getProgressTextColorClasses, getProgressVariantClasses } from './theme-colors'

/** Stripes, fill transition, and reduced motion. Mounted components do not write to document.head. */
export const progressBaseStyles = {
  '@keyframes tiger-progress-stripes': {
    from: { backgroundPosition: '1rem 0' },
    to: { backgroundPosition: '0 0' }
  },
  '.tiger-progress-fill': {
    transitionProperty: 'width, stroke-dashoffset',
    transitionDuration: 'var(--tiger-motion-duration-slow)',
    transitionTimingFunction: 'var(--tiger-motion-ease-standard)'
  },
  '.tiger-progress-striped': {
    backgroundImage:
      'linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)',
    backgroundSize: '1rem 1rem'
  },
  '.tiger-progress-striped-animated': {
    animation: 'tiger-progress-stripes var(--tiger-motion-duration-slow) linear infinite'
  },
  '.tiger-progress-paused .tiger-progress-striped-animated, .tiger-progress-striped-animated.tiger-progress-paused':
    {
      animationPlayState: 'paused'
    },
  '@keyframes tiger-progress-indeterminate': {
    '0%': { transform: 'translateX(-120%)' },
    '100%': { transform: 'translateX(280%)' }
  },
  '.tiger-progress-indeterminate': {
    width: '40%',
    animation: 'tiger-progress-indeterminate 1.2s ease-in-out infinite'
  },
  '@media (prefers-reduced-motion: reduce)': {
    '.tiger-progress-fill': {
      transition: 'none'
    },
    '.tiger-progress-striped-animated': {
      animation: 'none'
    },
    '.tiger-progress-indeterminate': {
      animation: 'none',
      width: '100%'
    }
  }
} as const

/**
 * Line track metrics. An unset variable makes `height` invalid and the empty
 * track collapses, so each utility also carries the same length as a fallback.
 */
export const progressMetricVars = {
  '--tiger-component-progress-height-sm': '4px',
  '--tiger-component-progress-height-md': '8px',
  '--tiger-component-progress-height-lg': '12px',
  '--tiger-component-progress-border-radius': '9999px'
} as const

export const progressLineBaseClasses =
  'relative overflow-hidden rounded-[var(--tiger-component-progress-border-radius,9999px)]'

export const progressLineInnerClasses = 'tiger-progress-fill h-full rounded-[inherit]'

export const progressTextBaseClasses = 'font-medium ms-2'

export const progressCircleBaseClasses = 'relative inline-flex items-center justify-center'

export const progressLineSizeClasses: Record<ProgressSize, string> = {
  sm: 'h-[var(--tiger-component-progress-height-sm,4px)]',
  md: 'h-[var(--tiger-component-progress-height-md,8px)]',
  lg: 'h-[var(--tiger-component-progress-height-lg,12px)]'
} as const

export const progressCircleSizeClasses: Record<ProgressSize, number> = {
  sm: 80,
  md: 120,
  lg: 160
} as const

export const progressTextSizeClasses: Record<ProgressSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
} as const

export const progressStripedClasses = 'tiger-progress-striped'

export const progressStripedAnimationClasses = 'tiger-progress-striped-animated'

export function getStatusVariant(status: ProgressStatus): string {
  const statusVariantMap: Record<ProgressStatus, string> = {
    normal: '',
    success: 'success',
    exception: 'danger',
    paused: 'warning'
  }
  return statusVariantMap[status] || ''
}

export function formatProgressText(
  percentage: number,
  customText?: string,
  formatFn?: (percentage: number) => string
): string {
  if (customText !== undefined) {
    return customText
  }

  if (formatFn) {
    return formatFn(percentage)
  }

  return formatProgressPercent(percentage)
}

/** Percent sign from Intl, not a hardcoded glyph. */
export function formatProgressPercent(percentage: number, locales?: Intl.LocalesArgument): string {
  const value = clampPercentage(percentage) / 100
  return new Intl.NumberFormat(locales, {
    style: 'percent',
    maximumFractionDigits: 0
  }).format(value)
}

export function clampPercentage(percentage: number): number {
  if (!Number.isFinite(percentage)) return 0
  return Math.max(0, Math.min(100, percentage))
}

export function calculateCirclePath(
  radius: number,
  percentage: number
): {
  circumference: number
  strokeDasharray: string
  strokeDashoffset: number
} {
  const circumference = 2 * Math.PI * Math.max(0, radius)
  const offset = circumference - (percentage / 100) * circumference

  return {
    circumference,
    strokeDasharray: `${circumference}`,
    strokeDashoffset: offset
  }
}

export function getCircleSize(
  size: ProgressSize,
  strokeWidth: number
): {
  width: number
  height: number
  radius: number
  cx: number
  cy: number
  strokeWidth: number
} {
  const width = progressCircleSizeClasses[size]
  const height = width
  const safeStroke =
    Number.isFinite(strokeWidth) && strokeWidth > 0 ? Math.min(strokeWidth, width - 1) : 6
  const radius = Math.max(0, (width - safeStroke) / 2)
  const cx = width / 2
  const cy = height / 2

  return { width, height, radius, cx, cy, strokeWidth: safeStroke }
}

export const progressTrackBgClasses = 'bg-[color:var(--tiger-border)]'

export const progressCircleTextClasses = 'absolute inset-0 flex items-center justify-center'

export const progressCircleTrackStrokeClasses = 'text-[color:var(--tiger-border)]'

export interface ProgressViewInput {
  percentage?: number
  variant?: ProgressVariant
  status?: ProgressStatus
  type?: ProgressType
  showText?: boolean
  text?: string
  format?: (percentage: number) => string
  striped?: boolean
  stripedAnimation?: boolean
  ariaLabel?: string
  ariaLabelledby?: string
  widgetName: string
  indeterminate?: boolean
  steps?: number
  locales?: Intl.LocalesArgument
}

export interface ProgressView {
  percentage: number
  effectiveVariant: ProgressVariant
  shouldShowText: boolean
  displayText: string
  valueNow: number
  valueText?: string
  ariaLabel?: string
  striped: boolean
  stripedAnimated: boolean
  paused: boolean
  indeterminate: boolean
  steps: number
  successMark: boolean
}

/**
 * Clamp, round, status color, visible text, and ARIA for both frameworks.
 */
export function resolveProgressView(input: ProgressViewInput): ProgressView {
  const type = input.type ?? 'line'
  const passed = Math.round(clampPercentage(input.percentage ?? 0))
  const successMark = input.status === 'success'
  const percentage = successMark ? 100 : passed
  const indeterminate = Boolean(input.indeterminate) && !successMark
  const steps =
    Number.isFinite(input.steps) && (input.steps ?? 0) > 1 ? Math.floor(input.steps ?? 0) : 0
  const statusVariant = getStatusVariant(input.status ?? 'normal')
  const effectiveVariant = (statusVariant || input.variant || 'primary') as ProgressVariant
  const shouldShowText = input.showText ?? type === 'line'
  const displayText = shouldShowText
    ? input.text !== undefined || input.format
      ? formatProgressText(percentage, input.text, input.format)
      : formatProgressPercent(percentage, input.locales)
    : ''
  const hasCustomText = input.text !== undefined || input.format !== undefined
  const valueText = hasCustomText && shouldShowText ? displayText : undefined
  const ariaLabel = input.ariaLabel ?? (input.ariaLabelledby ? undefined : input.widgetName)
  const paused = input.status === 'paused'
  const striped = Boolean(input.striped) && type === 'line'
  const stripedAnimated = striped && Boolean(input.stripedAnimation) && !paused

  return {
    percentage,
    effectiveVariant,
    shouldShowText,
    displayText,
    valueNow: percentage,
    valueText,
    ariaLabel,
    striped,
    stripedAnimated,
    paused,
    indeterminate,
    steps,
    successMark
  }
}

export function getProgressFillClasses(view: ProgressView, extra?: string): string {
  return [
    progressLineInnerClasses,
    getProgressVariantClasses(view.effectiveVariant),
    view.striped ? progressStripedClasses : '',
    view.stripedAnimated ? progressStripedAnimationClasses : '',
    view.paused ? 'tiger-progress-paused' : '',
    extra ?? ''
  ]
    .filter(Boolean)
    .join(' ')
}

export function progressStepFilled(steps: number, percentage: number): boolean[] {
  const count = Math.max(0, Math.floor(steps))
  return Array.from(
    { length: count },
    (_, index) => ((index + 1) / count) * 100 <= percentage + 0.001
  )
}

export function getProgressStrokeClasses(variant: ProgressVariant): string {
  return getProgressTextColorClasses(variant)
}
