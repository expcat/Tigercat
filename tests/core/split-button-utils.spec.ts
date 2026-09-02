/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SPLIT_BUTTON_SIZE,
  DEFAULT_SPLIT_BUTTON_TRIGGER_ARIA_LABEL,
  DEFAULT_SPLIT_BUTTON_VARIANT,
  getSplitButtonPrimaryClasses,
  getSplitButtonRootClasses,
  getSplitButtonTriggerClasses,
  resolveSplitButtonSize,
  resolveSplitButtonTriggerAriaLabel,
  resolveSplitButtonVariant,
  splitButtonPrimaryBlockClasses,
  splitButtonRootBlockClasses,
  splitButtonRootClasses,
  splitButtonTriggerClasses,
  splitButtonDropdownClasses
} from '@expcat/tigercat-core'

describe('split-button-utils', () => {
  describe('resolveSplitButtonSize / resolveSplitButtonVariant', () => {
    it('accepts known values and falls back otherwise', () => {
      expect(resolveSplitButtonSize('xs')).toBe('xs')
      expect(resolveSplitButtonSize('xl')).toBe('xl')
      expect(resolveSplitButtonSize(undefined)).toBe(DEFAULT_SPLIT_BUTTON_SIZE)
      expect(resolveSplitButtonSize('xxl' as never)).toBe(DEFAULT_SPLIT_BUTTON_SIZE)

      expect(resolveSplitButtonVariant('outline')).toBe('outline')
      expect(resolveSplitButtonVariant(undefined)).toBe(DEFAULT_SPLIT_BUTTON_VARIANT)
      expect(resolveSplitButtonVariant('solid' as never)).toBe(DEFAULT_SPLIT_BUTTON_VARIANT)
    })
  })

  describe('resolveSplitButtonTriggerAriaLabel', () => {
    it('falls back to the default label', () => {
      expect(resolveSplitButtonTriggerAriaLabel()).toBe(DEFAULT_SPLIT_BUTTON_TRIGGER_ARIA_LABEL)
      expect(resolveSplitButtonTriggerAriaLabel('')).toBe(DEFAULT_SPLIT_BUTTON_TRIGGER_ARIA_LABEL)
      expect(resolveSplitButtonTriggerAriaLabel('   ')).toBe(
        DEFAULT_SPLIT_BUTTON_TRIGGER_ARIA_LABEL
      )
    })

    it('keeps a custom non-empty label', () => {
      expect(resolveSplitButtonTriggerAriaLabel('More actions')).toBe('More actions')
      expect(resolveSplitButtonTriggerAriaLabel('  更多  ')).toBe('更多')
    })
  })

  describe('class builders', () => {
    it('marks the root as a split button group', () => {
      expect(getSplitButtonRootClasses()).toContain(splitButtonRootClasses)
      expect(getSplitButtonRootClasses({ className: 'extra' })).toContain('extra')
    })

    it('adds block classes on the root and primary action', () => {
      expect(getSplitButtonRootClasses({ block: true })).toContain(splitButtonRootBlockClasses)
      expect(getSplitButtonPrimaryClasses({ block: true })).toContain(
        splitButtonPrimaryBlockClasses
      )
      expect(getSplitButtonPrimaryClasses()).not.toContain(splitButtonPrimaryBlockClasses)
    })

    it('stretches the chevron trigger to the primary action height', () => {
      expect(getSplitButtonRootClasses()).toContain('items-stretch')
      expect(getSplitButtonTriggerClasses()).toContain('h-full')
      expect(splitButtonDropdownClasses).toContain('self-stretch')
    })

    it('keeps the trigger compact and joined to the primary action', () => {
      const classes = getSplitButtonTriggerClasses({ size: 'sm', className: 'extra' })
      expect(classes).toContain(splitButtonTriggerClasses)
      expect(classes).toContain('extra')
      expect(getSplitButtonTriggerClasses({ size: 'xxl' as never })).toContain('!px-2.5')
    })
  })
})
