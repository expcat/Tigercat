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

  it('uses logical start/end and rejects physical left/right', () => {
    expect(resolveTextAlign('start')).toBe('start')
    expect(resolveTextAlign('end')).toBe('end')
    expect(resolveTextAlign('left')).toBeUndefined()
    expect(resolveTextAlign('right')).toBeUndefined()
    expect(textAlignClasses.start).toBe('text-start')
    expect(textAlignClasses.end).toBe('text-end')
    expect(getTextClasses({ align: 'start' }).split(/\s+/)).toContain('text-start')
    expect(getTextClasses({ align: 'start' }).split(/\s+/)).not.toContain('text-left')
    expect(warnSpy).not.toHaveBeenCalled()
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

  it('falls back to base, normal, and default for inherited keys', () => {
    const fallback = getTextClasses({})
    for (const key of ['toString', 'constructor', '__proto__'] as const) {
      const classes = getTextClasses({
        size: key as never,
        weight: key as never,
        color: key as never
      })
      expect(classes).toBe(fallback)
      expect(classes).not.toContain('function')
      expect(classes).not.toContain('[object Object]')
    }
  })
})
