/**
 * FormWizard shared helpers
 *
 * Pure logic extracted from Vue / React FormWizard implementations:
 * - Index clamping
 * - Skip-aware step navigation
 * - beforeNext validator runner
 *
 * No framework imports. Both `defineComponent` (Vue) and `useCallback` (React)
 * call sites delegate to these helpers to remove ~120-150 SLOC of duplicated
 * navigation logic per framework.
 */

import type { WizardStep, FormWizardValidator } from '../types/composite'

/**
 * Clamp a candidate step index into `[0, totalCount - 1]`.
 *
 * Returns `0` when the wizard has no steps.
 */
export function clampStepIndex(next: number, totalCount: number): number {
  const max = Math.max(totalCount - 1, 0)
  return Math.min(Math.max(next, 0), max)
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
    if (!step?.disabled && !step?.skipCondition?.()) return idx
    idx += direction
  }
  return fallbackIndex
}

/**
 * Run a `beforeNext` validator (if provided) against the current step.
 *
 * Returns `true` when navigation should proceed:
 * - No validator → always `true`
 * - No current step → always `true`
 * - Validator result must be exactly `true` (string error / `false` block)
 */
export async function runStepValidation(
  currentIndex: number,
  currentStep: WizardStep | undefined,
  steps: readonly WizardStep[],
  beforeNext: FormWizardValidator | undefined
): Promise<boolean> {
  if (!beforeNext || !currentStep) return true
  const result = await beforeNext(currentIndex, currentStep, steps as WizardStep[])
  return result === true
}
