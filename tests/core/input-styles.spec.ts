import { describe, expect, it } from 'vitest'
import {
  getInputClasses,
  getInputClearButtonClasses,
  getInputPasswordToggleClasses
} from '@expcat/tigercat-core'

const tokens = (cls: string): string[] => cls.split(/\s+/)

describe('input-styles trailing buttons', () => {
  it('keeps single-button classes at right-0', () => {
    expect(tokens(getInputClearButtonClasses())).toContain('right-0')
    expect(tokens(getInputClearButtonClasses('md'))).not.toContain('right-10')
    expect(tokens(getInputPasswordToggleClasses('md'))).toContain('right-0')
  })

  it('offsets the clear button one affix slot when requested', () => {
    expect(tokens(getInputClearButtonClasses('sm', { offset: true }))).toContain('right-8')
    expect(tokens(getInputClearButtonClasses('md', { offset: true }))).toContain('right-10')
    expect(tokens(getInputClearButtonClasses('lg', { offset: true }))).toContain('right-12')
    expect(tokens(getInputClearButtonClasses('md', { offset: true }))).not.toContain('right-0')
  })

  it('uses one-slot suffix padding by default and double-slot when dual', () => {
    expect(tokens(getInputClasses({ hasSuffix: true }))).toContain('pr-10')
    expect(tokens(getInputClasses({ hasSuffix: true }))).not.toContain('pr-20')
    expect(tokens(getInputClasses({ hasSuffix: true, hasDualSuffix: true }))).toContain('pr-20')
    expect(tokens(getInputClasses({ hasSuffix: true, hasDualSuffix: true }))).not.toContain('pr-10')
    expect(tokens(getInputClasses({ size: 'sm', hasDualSuffix: true }))).toContain('pr-16')
    expect(tokens(getInputClasses({ size: 'lg', hasDualSuffix: true }))).toContain('pr-24')
  })
})
