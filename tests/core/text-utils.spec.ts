/**
 * @vitest-environment node
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import {
  getTextClasses,
  resetDevWarnCache,
  resolveTextAlign,
  resolveTextTag,
  textAlignClasses
} from '@expcat/tigercat-core'

describe('resolveTextTag', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetDevWarnCache()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('keeps whitelist tags and falls back to p', () => {
    expect(resolveTextTag('h1')).toBe('h1')
    expect(resolveTextTag('label')).toBe('label')
    expect(resolveTextTag('script')).toBe('p')
    expect(warnSpy).toHaveBeenCalledWith(
      '[Tigercat] Text tag "script" is not allowed; falling back to p.'
    )
    expect(resolveTextTag(undefined)).toBe('p')
  })
})

describe('resolveTextAlign', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetDevWarnCache()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('uses logical start/end and maps physical aliases', () => {
    expect(resolveTextAlign('start')).toBe('start')
    expect(resolveTextAlign('end')).toBe('end')
    expect(resolveTextAlign('left')).toBe('start')
    expect(resolveTextAlign('right')).toBe('end')
    expect(textAlignClasses.start).toBe('text-start')
    expect(textAlignClasses.end).toBe('text-end')
    expect(getTextClasses({ align: 'start' }).split(/\s+/)).toContain('text-start')
    expect(getTextClasses({ align: 'start' }).split(/\s+/)).not.toContain('text-left')
    expect(warnSpy).toHaveBeenCalled()
  })

  it('falls back without dropping other classes for unknown size/color/align', () => {
    const classes = getTextClasses({
      size: 'not-a-size' as never,
      color: 'not-a-color' as never,
      align: 'diagonal' as never
    })
    expect(classes).toContain('text-base')
    expect(classes).toContain('--tiger-text')
    expect(classes.split(/\s+/)).not.toContain('undefined')
  })
})
