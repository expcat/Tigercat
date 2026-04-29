import { describe, it, expect, vi } from 'vitest'
import {
  clampStepIndex,
  findNextUnskippedStep,
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
  })

  describe('runStepValidation', () => {
    it('returns true when no validator', async () => {
      expect(await runStepValidation(0, step(), [step()], undefined)).toBe(true)
    })

    it('returns true when current step is undefined', async () => {
      const validator = vi.fn().mockReturnValue(false)
      expect(await runStepValidation(0, undefined, [], validator)).toBe(true)
      expect(validator).not.toHaveBeenCalled()
    })

    it('returns true only when validator returns boolean true', async () => {
      const s = step()
      expect(await runStepValidation(0, s, [s], () => true)).toBe(true)
      expect(await runStepValidation(0, s, [s], () => false)).toBe(false)
      expect(await runStepValidation(0, s, [s], () => 'error msg')).toBe(false)
    })

    it('awaits async validators', async () => {
      const s = step()
      expect(await runStepValidation(0, s, [s], async () => true)).toBe(true)
      expect(await runStepValidation(0, s, [s], async () => false)).toBe(false)
    })

    it('passes correct arguments to validator', async () => {
      const validator = vi.fn().mockReturnValue(true)
      const steps = [step({ title: 'a' }), step({ title: 'b' })]
      await runStepValidation(1, steps[1], steps, validator)
      expect(validator).toHaveBeenCalledWith(1, steps[1], steps)
    })
  })
})
