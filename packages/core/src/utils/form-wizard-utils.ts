/**
 * FormWizard shared helpers
 *
 * Current clamping, skip-aware last-step, beforeNext outcomes, in-flight lock,
 * and chrome classes. Vue/React only bind Steps/Button/Form.
 */

import { classNames } from './class-names'
import type { WizardStep, FormWizardValidator } from '../types/composite'

/**
 * Clamp a candidate step index into `[0, totalCount - 1]`.
 *
 * `NaN` / `Infinity` become `0`. Returns `0` when the wizard has no steps.
 */
export function clampStepIndex(next: number, totalCount: number): number {
  if (!Number.isFinite(next) || totalCount <= 0) return 0
  const max = Math.max(totalCount - 1, 0)
  return Math.min(Math.max(Math.trunc(next), 0), max)
}

export function isStepSkipped(step: WizardStep | undefined): boolean {
  if (!step) return true
  return Boolean(step.disabled || step.skipCondition?.())
}

/**
 * Walk `steps` from `from` in `direction` (+1 / -1) skipping items where
 * `disabled === true` or `skipCondition()` returns `true`.
 *
 * If no valid step is found before the bounds are exceeded, returns
 * `fallbackIndex` (the caller's current index) so the caller can no-op.
 */
export function findNextUnskippedStep(
  from: number,
  direction: 1 | -1,
  steps: readonly WizardStep[],
  fallbackIndex: number
): number {
  let idx = from
  while (idx >= 0 && idx < steps.length) {
    const step = steps[idx]
    if (!isStepSkipped(step)) return idx
    idx += direction
  }
  return fallbackIndex
}

/**
 * True when there is no later unskipped step. Empty wizards are not last.
 */
export function isLastAvailableStep(index: number, steps: readonly WizardStep[]): boolean {
  if (steps.length === 0) return false
  if (isStepSkipped(steps[index])) return false
  return findNextUnskippedStep(index + 1, 1, steps, index) === index
}

/**
 * Clickable headers only go back to an already-reached unskipped step.
 * Forward navigation is Next/Finish so intermediate `fields` / `beforeNext` run.
 */
export function canClickWizardStep(
  target: number,
  current: number,
  steps: readonly WizardStep[]
): boolean {
  if (!Number.isFinite(target) || target === current) return false
  if (target < 0 || target >= steps.length) return false
  if (isStepSkipped(steps[target])) return false
  return target < current
}

export type StepValidationOutcome = { ok: true } | { ok: false; message?: string }

/**
 * Run a `beforeNext` validator (if provided) against the current step.
 *
 * - No validator / no current step → `{ ok: true }`
 * - `true` proceeds
 * - `false` blocks
 * - `string` blocks and is the visible message
 * - thrown errors block and surface `error.message`
 */
export async function runStepValidation(
  currentIndex: number,
  currentStep: WizardStep | undefined,
  steps: readonly WizardStep[],
  beforeNext: FormWizardValidator | undefined
): Promise<StepValidationOutcome> {
  if (!beforeNext || !currentStep) return { ok: true }
  try {
    const result = await beforeNext(currentIndex, currentStep, steps as WizardStep[])
    if (result === true) return { ok: true }
    if (typeof result === 'string' && result.trim()) return { ok: false, message: result }
    return { ok: false }
  } catch (error) {
    const message = error instanceof Error && error.message.trim() ? error.message : undefined
    return { ok: false, message }
  }
}

export async function runWizardAdvanceGate(options: {
  currentIndex: number
  currentStep: WizardStep | undefined
  steps: readonly WizardStep[]
  beforeNext?: FormWizardValidator
  validateFields?: (fields: string[]) => Promise<boolean>
}): Promise<StepValidationOutcome> {
  const fields = options.currentStep?.fields
  if (fields?.length && options.validateFields) {
    const valid = await options.validateFields(fields)
    if (!valid) return { ok: false }
  }
  return runStepValidation(
    options.currentIndex,
    options.currentStep,
    options.steps,
    options.beforeNext
  )
}

export function createAsyncLock(): {
  get pending(): boolean
  run<T>(fn: () => Promise<T>): Promise<T | undefined>
} {
  let pending = false
  return {
    get pending() {
      return pending
    },
    async run<T>(fn: () => Promise<T>): Promise<T | undefined> {
      if (pending) return undefined
      pending = true
      try {
        return await fn()
      } finally {
        pending = false
      }
    }
  }
}

export function getFormWizardWrapperClasses(options: {
  bordered?: boolean
  className?: string
}): string {
  return classNames(
    'tiger-form-wizard w-full tiger-motion-aware transition-colors duration-300 motion-reduce:transition-none',
    options.bordered
      ? 'rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-sm'
      : 'bg-transparent',
    options.className
  )
}

export function getFormWizardHeaderClasses(bordered?: boolean): string {
  return classNames(
    'px-6 py-5 bg-[var(--tiger-surface-muted,#f9fafb)]/95 transition-colors duration-300 motion-reduce:transition-none',
    bordered ? 'border-b border-[var(--tiger-border,#e5e7eb)]' : ''
  )
}

export function getFormWizardBodyClasses(): string {
  return 'px-8 py-6 flex flex-col items-stretch w-full min-h-[120px]'
}

export function getFormWizardActionsClasses(bordered?: boolean): string {
  return classNames(
    'flex items-center justify-between gap-3 px-8 py-4 bg-[var(--tiger-surface-muted,#f9fafb)]/95 transition-colors duration-300 motion-reduce:transition-none',
    bordered ? 'border-t border-[var(--tiger-border,#e5e7eb)]' : ''
  )
}
