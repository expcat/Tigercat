/**
 * Steps component utilities
 */

import type { StepsDirection, StepStatus, StepSize } from '../types/steps'

/**
 * Plain checkmark character for the "finish" step status.
 *
 * The default StepsItem UI renders the SVG checkmark below
 * ({@link stepFinishIconPathD}); this constant is kept as a public, lightweight
 * text fallback for consumers that render their own finish indicator.
 */
export const stepFinishChar = '✓'

/** SVG `viewBox` for the StepsItem "finish" checkmark icon */
export const stepFinishIconViewBox = '0 0 24 24'

/** SVG `stroke-width` for the StepsItem "finish" checkmark icon */
export const stepFinishIconStrokeWidth = '3'

/** SVG path `d` for the StepsItem "finish" checkmark icon */
export const stepFinishIconPathD = 'M4.5 12.75l6 6 9-13.5'

/** Size token used by tail / icon-column modifiers and `data-tiger-step-size`. */
export type StepSizeToken = 'simple' | 'sm' | 'md'

/**
 * Map `size` + `simple` to the stable modifier token used by plugin CSS.
 * `simple` wins (24px icon); `small` → sm (32px); otherwise md (40px).
 */
export function getStepSizeToken(size: StepSize, simple: boolean): StepSizeToken {
  if (simple) return 'simple'
  return size === 'small' ? 'sm' : 'md'
}

/** Value for `data-tiger-step-size` (`simple` or the `size` prop). */
export function getStepSizeDataValue(size: StepSize, simple: boolean): 'simple' | StepSize {
  if (simple) return 'simple'
  return size === 'small' ? 'small' : 'default'
}

/**
 * Plugin CSS for Steps tail + icon-column geometry.
 *
 * Connector coordinates used to live in JIT utilities (`inset-inline-start-4`,
 * `left-1/2`, `top-8`, …). Consumers that scan dist JS often miss those
 * strings, so the absolute line collapsed to the icon-column start edge.
 * Geometry now ships with `@plugin "@expcat/tigercat-core/tailwind"` so any
 * app that already loads the plugin gets a centered connector without
 * depending on purged utilities.
 */
export const stepConnectorBaseStyles = {
  '.tiger-steps': {
    '--tiger-step-gap': '1.5rem'
  },
  '.tiger-step-icon-col': {
    position: 'relative',
    flexShrink: '0',
    alignSelf: 'stretch',
    display: 'flex',
    justifyContent: 'center'
  },
  '.tiger-step-icon-col--simple': {
    width: '1.5rem',
    '--tiger-step-icon-size': '1.5rem'
  },
  '.tiger-step-icon-col--sm': {
    width: '2rem',
    '--tiger-step-icon-size': '2rem'
  },
  '.tiger-step-icon-col--md': {
    width: '2.5rem',
    '--tiger-step-icon-size': '2.5rem'
  },
  '.tiger-step-item--gap': {
    paddingBottom: 'var(--tiger-step-gap, 1.5rem)'
  },
  '.tiger-step-tail': {
    position: 'absolute',
    pointerEvents: 'none'
  },
  '.tiger-step-tail--last': {
    display: 'none'
  },
  '.tiger-step-tail--finish': {
    backgroundColor: 'var(--tiger-primary, #2563eb)'
  },
  '.tiger-step-tail--wait': {
    backgroundColor: 'var(--tiger-border, #e5e7eb)'
  },
  '.tiger-step-tail--simple': {
    '--tiger-step-icon-size': '1.5rem'
  },
  '.tiger-step-tail--sm': {
    '--tiger-step-icon-size': '2rem'
  },
  '.tiger-step-tail--md': {
    '--tiger-step-icon-size': '2.5rem'
  },
  '.tiger-step-tail--vertical': {
    left: '50%',
    width: '0.125rem',
    top: 'var(--tiger-step-icon-size, 2.5rem)',
    bottom: 'calc(-1 * var(--tiger-step-gap, 1.5rem))',
    height: 'auto',
    transform: 'translateX(-50%)'
  },
  '.tiger-step-tail--horizontal': {
    left: '50%',
    width: '100%',
    height: '0.125rem',
    top: 'calc(var(--tiger-step-icon-size, 2.5rem) / 2)'
  }
} as const

/**
 * Get Steps container classes
 */
export function getStepsContainerClasses(direction: StepsDirection): string {
  const baseClasses = 'tiger-steps w-full list-none m-0 p-0'

  if (direction === 'vertical') {
    return `${baseClasses} flex flex-col`
  }

  return `${baseClasses} flex flex-row items-start`
}

/**
 * Icon-column wrapper (vertical Steps). Width matches the icon so the tail's
 * `left: 50%` + `translateX(-50%)` sits on the icon center axis.
 */
export function getStepIconColumnClasses(size: StepSize, simple: boolean): string {
  return `tiger-step-icon-col tiger-step-icon-col--${getStepSizeToken(size, simple)}`
}

/**
 * Get Step item container classes
 */
export function getStepItemClasses(direction: StepsDirection, isLast: boolean): string {
  const baseClasses = 'tiger-step-item relative group'

  if (direction === 'vertical') {
    return `${baseClasses} flex flex-row ${!isLast ? 'tiger-step-item--gap' : ''}`.trim()
  }

  return `${baseClasses} flex flex-col flex-1 items-center`
}

/**
 * Get Step icon container classes
 */
export function getStepIconClasses(
  status: StepStatus,
  size: StepSize,
  simple: boolean,
  isCustomIcon: boolean
): string {
  const baseClasses =
    'tiger-step-icon relative z-10 flex items-center justify-center rounded-full border-2'

  // Size classes
  const sizeClasses = simple
    ? 'w-6 h-6 text-xs'
    : size === 'small'
      ? 'w-8 h-8 text-sm'
      : 'w-10 h-10 text-base'

  // Custom icon might need less padding
  const iconClasses = isCustomIcon ? '' : 'font-medium'

  // Status-based colors using CSS variables with fallbacks
  const activeClasses =
    'bg-[var(--tiger-primary,#2563eb)] border-[var(--tiger-primary,#2563eb)] text-white ring-4 ring-[var(--tiger-primary,#2563eb)]/15 scale-105 shadow-sm transition-all duration-300 motion-reduce:transition-none'
  const statusClasses = {
    wait: 'bg-[var(--tiger-surface-muted,#f3f4f6)] border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text-muted,#6b7280)] transition-all duration-300 motion-reduce:transition-none',
    process: activeClasses,
    finish:
      'bg-[var(--tiger-primary,#2563eb)] border-[var(--tiger-primary,#2563eb)] text-white shadow-sm transition-all duration-300 motion-reduce:transition-none',
    error:
      'bg-[var(--tiger-error-bg,#fef2f2)] border-[var(--tiger-error,#ef4444)] text-[var(--tiger-error,#ef4444)] transition-all duration-300'
  }

  return `${baseClasses} ${sizeClasses} ${iconClasses} ${statusClasses[status]}`
}

/**
 * Get Step tail/connector line classes.
 *
 * Returns stable semantic tokens only. Geometry (center axis, size offsets,
 * finish/wait color) lives in {@link stepConnectorBaseStyles} via the plugin.
 */
export function getStepTailClasses(
  direction: StepsDirection,
  status: StepStatus,
  isLast: boolean,
  size: StepSize,
  simple: boolean
): string {
  if (isLast) return 'tiger-step-tail tiger-step-tail--last'

  const sizeMod = getStepSizeToken(size, simple)
  const dirMod =
    direction === 'vertical' ? 'tiger-step-tail--vertical' : 'tiger-step-tail--horizontal'
  const colorMod = status === 'finish' ? 'tiger-step-tail--finish' : 'tiger-step-tail--wait'

  return `tiger-step-tail ${dirMod} tiger-step-tail--${sizeMod} ${colorMod}`
}

/**
 * Get Step content container classes
 */
export function getStepContentClasses(direction: StepsDirection): string {
  const baseClasses = 'tiger-step-content'

  if (direction === 'vertical') {
    return `${baseClasses} ms-4 flex-1`
  }

  return `${baseClasses} mt-2 text-center`
}

/**
 * Get Step title classes
 */
export function getStepTitleClasses(
  status: StepStatus,
  size: StepSize,
  clickable: boolean
): string {
  const baseClasses = 'tiger-step-title font-medium'

  const sizeClasses = size === 'small' ? 'text-sm' : 'text-base'

  const statusClasses = {
    wait: 'text-[var(--tiger-text-muted,#6b7280)] transition-colors duration-300 motion-reduce:transition-none',
    process:
      'text-[var(--tiger-text,#111827)] font-semibold transition-colors duration-300 motion-reduce:transition-none',
    finish:
      'text-[var(--tiger-text,#111827)] transition-colors duration-300 motion-reduce:transition-none',
    error: 'text-[var(--tiger-error,#ef4444)]'
  }

  const cursorClasses = clickable
    ? 'bg-transparent border-0 p-0 cursor-pointer hover:text-[var(--tiger-primary,#2563eb)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tiger-surface,#ffffff)]'
    : ''

  return `${baseClasses} ${sizeClasses} ${statusClasses[status]} ${cursorClasses}`
}

/**
 * Get Step description classes
 */
export function getStepDescriptionClasses(status: StepStatus, size: StepSize): string {
  const baseClasses = 'tiger-step-description mt-1'

  const sizeClasses = size === 'small' ? 'text-xs' : 'text-sm'

  const statusClass =
    status === 'error'
      ? 'text-[var(--tiger-error,#ef4444)]'
      : 'text-[var(--tiger-text-muted,#6b7280)]'

  return `${baseClasses} ${sizeClasses} ${statusClass}`
}

const STEP_STATUSES: StepStatus[] = ['wait', 'process', 'finish', 'error']

export const STEPS_ITEM_COMPONENT_NAME = 'TigerStepsItem'

export function isStepStatus(value: unknown): value is StepStatus {
  return typeof value === 'string' && STEP_STATUSES.includes(value as StepStatus)
}

export function clampStepCurrent(current: number, count: number): number {
  if (!Number.isFinite(current) || count <= 0) return 0
  return Math.min(Math.max(0, Math.trunc(current)), count - 1)
}

/**
 * Calculate step status based on current index
 */
export function calculateStepStatus(
  index: number,
  currentIndex: number,
  currentStatus: StepStatus,
  customStatus?: StepStatus
): StepStatus {
  if (isStepStatus(customStatus)) return customStatus

  const current = Number.isFinite(currentIndex) ? Math.trunc(currentIndex) : 0
  const status = isStepStatus(currentStatus) ? currentStatus : 'process'

  if (index < current) return 'finish'
  if (index === current) return status
  return 'wait'
}

export function getStepStatusText(
  status: StepStatus,
  labels: { waitStatus: string; processStatus: string; finishStatus: string; errorStatus: string }
): string {
  if (status === 'finish') return labels.finishStatus
  if (status === 'process') return labels.processStatus
  if (status === 'error') return labels.errorStatus
  return labels.waitStatus
}

export function isStepsItemType(type: unknown, stepsItem: unknown): boolean {
  if (type === stepsItem) return true
  if (!type || typeof type !== 'object') return false
  const named = type as { name?: string; displayName?: string }
  return named.name === STEPS_ITEM_COMPONENT_NAME || named.displayName === 'StepsItem'
}
