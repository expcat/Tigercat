/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_KBD_SEPARATOR,
  DEFAULT_KBD_SIZE,
  DEFAULT_KBD_VARIANT,
  formatKbdCombo,
  formatKbdSeparatorText,
  getKbdParts,
  getKbdRootClasses,
  getKbdVariantClasses,
  kbdDefaultVariantClasses,
  resolveKbdAccessibleName,
  kbdBaseClasses,
  kbdSubtleVariantClasses,
  normalizeKbdKeys,
  resolveKbdSeparator,
  resolveKbdSize,
  resolveKbdVariant,
  tagSizeClasses
} from '@expcat/tigercat-core'

describe('kbd-utils', () => {
  describe('normalizeKbdKeys', () => {
    it('returns an empty list for missing or blank input', () => {
      expect(normalizeKbdKeys()).toEqual([])
      expect(normalizeKbdKeys(null)).toEqual([])
      expect(normalizeKbdKeys('')).toEqual([])
      expect(normalizeKbdKeys('   ')).toEqual([])
      expect(normalizeKbdKeys([])).toEqual([])
      expect(normalizeKbdKeys(['', '  '])).toEqual([])
    })

    it('treats a string as a single key', () => {
      expect(normalizeKbdKeys('Esc')).toEqual(['Esc'])
      expect(normalizeKbdKeys('  Ctrl  ')).toEqual(['Ctrl'])
    })

    it('trims array entries and drops non-strings', () => {
      expect(normalizeKbdKeys([' Ctrl ', 'K', '', '  '])).toEqual(['Ctrl', 'K'])
      expect(
        normalizeKbdKeys(['Enter', 1 as unknown as string, null as unknown as string])
      ).toEqual(['Enter'])
    })
  })

  describe('resolveKbdSeparator', () => {
    it('falls back to the default separator', () => {
      expect(resolveKbdSeparator()).toBe(DEFAULT_KBD_SEPARATOR)
      expect(resolveKbdSeparator('')).toBe(DEFAULT_KBD_SEPARATOR)
      expect(resolveKbdSeparator('   ')).toBe(DEFAULT_KBD_SEPARATOR)
    })

    it('keeps a custom non-empty separator', () => {
      expect(resolveKbdSeparator('then')).toBe('then')
      expect(resolveKbdSeparator('  /  ')).toBe('/')
    })
  })

  describe('resolveKbdSize / resolveKbdVariant', () => {
    it('accepts known values and falls back otherwise', () => {
      expect(resolveKbdSize('sm')).toBe('sm')
      expect(resolveKbdSize('lg')).toBe('lg')
      expect(resolveKbdSize(undefined)).toBe(DEFAULT_KBD_SIZE)
      expect(resolveKbdSize('xl' as never)).toBe(DEFAULT_KBD_SIZE)

      expect(resolveKbdVariant('subtle')).toBe('subtle')
      expect(resolveKbdVariant(undefined)).toBe(DEFAULT_KBD_VARIANT)
      expect(resolveKbdVariant('solid' as never)).toBe(DEFAULT_KBD_VARIANT)
    })
  })

  describe('formatKbdCombo', () => {
    it('joins keys with a readable separator', () => {
      expect(formatKbdCombo(['Ctrl', 'K'])).toBe('Ctrl + K')
      expect(formatKbdCombo(['⌘', 'Shift', 'P'], 'then')).toBe('⌘ then Shift then P')
      expect(formatKbdCombo('Enter')).toBe('Enter')
      expect(formatKbdCombo([])).toBe('')
    })
  })

  describe('resolveKbdAccessibleName', () => {
    it('names a keys combo and appends the extra key', () => {
      expect(resolveKbdAccessibleName(['Ctrl', 'K'])).toBe('Ctrl + K')
      expect(resolveKbdAccessibleName(['Ctrl'], '+', 'S')).toBe('Ctrl + S')
      expect(resolveKbdAccessibleName([])).toBeUndefined()
      expect(resolveKbdAccessibleName(undefined, '+', 'Esc')).toBeUndefined()
    })
  })

  describe('getKbdParts', () => {
    it('builds alternating key and separator parts', () => {
      expect(getKbdParts(['Ctrl', 'K'])).toEqual([
        { type: 'key', value: 'Ctrl' },
        { type: 'separator', value: '+' },
        { type: 'key', value: 'K' }
      ])
      expect(getKbdParts('Esc')).toEqual([{ type: 'key', value: 'Esc' }])
      expect(getKbdParts([])).toEqual([])
    })
  })

  describe('formatKbdSeparatorText', () => {
    it('wraps the separator in spaces', () => {
      expect(formatKbdSeparatorText()).toBe(' + ')
      expect(formatKbdSeparatorText('then')).toBe(' then ')
    })
  })

  describe('class helpers', () => {
    it('reuses Tag size classes and default chrome', () => {
      const classes = getKbdRootClasses()
      expect(classes).toContain(kbdBaseClasses)
      expect(classes).toContain(tagSizeClasses.md)
      expect(classes).toContain(kbdDefaultVariantClasses)
      expect(classes).toContain('--tiger-surface-muted')
      expect(classes).toContain('--tiger-text')
      expect(classes).not.toContain('--tiger-fill')
      expect(classes).not.toContain('#f3f4f6')
    })

    it('applies the subtle variant and extra class names', () => {
      const classes = getKbdRootClasses({ size: 'sm', variant: 'subtle', className: 'extra' })
      expect(classes).toContain(tagSizeClasses.sm)
      expect(classes).toContain(kbdSubtleVariantClasses)
      expect(classes).toContain('extra')
      expect(getKbdVariantClasses('subtle')).toBe(kbdSubtleVariantClasses)
    })
  })
})
