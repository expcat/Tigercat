import type { ProgressSize, ProgressStatus } from '../types/progress'

export const progressLineBaseClasses = 'relative overflow-hidden rounded-full'

export const progressLineInnerClasses =
  'h-full rounded-full transition-all duration-300 ease-in-out flex items-center justify-end'

export const progressTextBaseClasses = 'font-medium ml-2'

export const progressCircleBaseClasses = 'relative inline-flex items-center justify-center'

export const progressLineSizeClasses: Record<ProgressSize, string> = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
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

export const progressStripedClasses =
  'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:2rem_2rem]'

export const progressStripedAnimationClasses = 'animate-[progress-stripes_1s_linear_infinite]'

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

  return `${Math.round(percentage)}%`
}

export function clampPercentage(percentage: number): number {
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
  const circumference = 2 * Math.PI * radius
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
} {
  const width = progressCircleSizeClasses[size]
  const height = width
  const radius = (width - strokeWidth) / 2
  const cx = width / 2
  const cy = height / 2

  return { width, height, radius, cx, cy }
}

export const progressTrackBgClasses = 'bg-[color:var(--tiger-border,#e5e7eb)]'

export const progressCircleTextClasses = 'absolute inset-0 flex items-center justify-center'

export const progressCircleTrackStrokeClasses = 'text-[color:var(--tiger-border,#e5e7eb)]'
