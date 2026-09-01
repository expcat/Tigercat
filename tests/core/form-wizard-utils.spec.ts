import { describe, it, expect, vi } from 'vitest'
import {
  canClickWizardStep,
  clampStepIndex,
  findNextUnskippedStep,
  isLastAvailableStep,
  runStepValidation,
  type WizardStep
} from '@expcat/tigercat-core'

const step = (over: Partial<WizardStep> = {}): WizardStep => ({
  title: 't',
  ...over
})

describe('form-wizard-utils', () => {
  describe('clampStepIndex', () => {
    it('clamps within [0, total - 1]', () => {
      expect(clampStepIndex(-5, 3)).toBe(0)
      expect(clampStepIndex(0, 3)).toBe(0)
      expect(clampStepIndex(2, 3)).toBe(2)
      expect(clampStepIndex(99, 3)).toBe(2)
    })

    it('returns 0 when total is 0', () => {
      expect(clampStepIndex(0, 0)).toBe(0)
      expect(clampStepIndex(5, 0)).toBe(0)
      expect(clampStepIndex(-5, 0)).toBe(0)
    })

    it('treats NaN and Infinity as 0', () => {
      expect(clampStepIndex(Number.NaN, 3)).toBe(0)
      expect(clampStepIndex(Number.POSITIVE_INFINITY, 3)).toBe(0)
    })
  })

  describe('findNextUnskippedStep', () => {
    it('skips disabled steps moving forward', () => {
      const steps = [step(), step({ disabled: true }), step()]
      expect(findNextUnskippedStep(1, 1, steps, 0)).toBe(2)
    })

    it('skips steps with skipCondition returning true', () => {
      const steps = [step(), step({ skipCondition: () => true }), step()]
      expect(findNextUnskippedStep(1, 1, steps, 0)).toBe(2)
    })

    it('skips backward symmetrically', () => {
      const steps = [step(), step({ disabled: true }), step()]
      expect(findNextUnskippedStep(1, -1, steps, 2)).toBe(0)
    })

    it('returns fallback when bounds exhausted with no candidate', () => {
      const steps = [step(), step({ disabled: true }), step({ disabled: true })]
      expect(findNextUnskippedStep(1, 1, steps, 0)).toBe(0)
    })

    it('respects skipCondition that returns false (do not skip)', () => {
      const steps = [step(), step({ skipCondition: () => false }), step()]
      expect(findNextUnskippedStep(1, 1, steps, 0)).toBe(1)
    })

    it('lands on from when that step is unskipped (click later step past a skip)', () => {
      const steps = [step(), step({ skipCondition: () => true }), step()]
      expect(findNextUnskippedStep(2, 1, steps, 0)).toBe(2)
    })

    it('skips skipCondition backward from the clicked index', () => {
      const steps = [step(), step({ skipCondition: () => true }), step()]
      expect(findNextUnskippedStep(1, -1, steps, 2)).toBe(0)
    })

    it('returns fallback when the clicked last step is skipped with nothing after', () => {
      const steps = [step(), step(), step({ skipCondition: () => true })]
      expect(findNextUnskippedStep(2, 1, steps, 0)).toBe(0)
    })
  })

  describe('runStepValidation', () => {
    it('returns true when no validator', async () => {
      expect(await runStepValidation(0, step(), [step()], undefined)).toEqual({ ok: true })
    })

    it('returns true when current step is undefined', async () => {
      const validator = vi.fn().mockReturnValue(false)
      expect(await runStepValidation(0, undefined, [], validator)).toEqual({ ok: true })
      expect(validator).not.toHaveBeenCalled()
    })

    it('returns true only when validator returns boolean true', async () => {
      const s = step()
      expect(await runStepValidation(0, s, [s], () => true)).toEqual({ ok: true })
      expect(await runStepValidation(0, s, [s], () => false)).toEqual({ ok: false })
      expect(await runStepValidation(0, s, [s], () => 'error msg')).toEqual({
        ok: false,
        message: 'error msg'
      })
    })

    it('awaits async validators', async () => {
      const s = step()
      expect(await runStepValidation(0, s, [s], async () => true)).toEqual({ ok: true })
      expect(await runStepValidation(0, s, [s], async () => false)).toEqual({ ok: false })
    })

    it('passes correct arguments to validator', async () => {
      const validator = vi.fn().mockReturnValue(true)
      const steps = [step({ title: 'a' }), step({ title: 'b' })]
      await runStepValidation(1, steps[1], steps, validator)
      expect(validator).toHaveBeenCalledWith(1, steps[1], steps)
    })
  })

  describe('isLastAvailableStep', () => {
    it('treats a skipped tail as last on the previous unskipped step', () => {
      const steps = [step(), step(), step({ skipCondition: () => true })]
      expect(isLastAvailableStep(1, steps)).toBe(true)
      expect(isLastAvailableStep(0, steps)).toBe(false)
      expect(isLastAvailableStep(0, [])).toBe(false)
    })
  })

  describe('canClickWizardStep', () => {
    it('only allows going back to an unskipped step', () => {
      const steps = [step(), step({ skipCondition: () => true }), step()]
      expect(canClickWizardStep(2, 0, steps)).toBe(false)
      expect(canClickWizardStep(1, 2, steps)).toBe(false)
      expect(canClickWizardStep(0, 2, steps)).toBe(true)
    })
  })
})
