/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { devWarn, warnUnsupportedColorProp, resetDevWarnCache } from '@expcat/tigercat-core'

describe('devWarn', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    resetDevWarnCache()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
    process.env.NODE_ENV = originalNodeEnv
  })

  it('emits a warning once per unique key', () => {
    devWarn('a', 'first')
    devWarn('a', 'first')
    devWarn('b', 'second')
    expect(warnSpy).toHaveBeenCalledTimes(2)
    expect(warnSpy).toHaveBeenCalledWith('first')
    expect(warnSpy).toHaveBeenCalledWith('second')
  })

  it('is silent in production', () => {
    process.env.NODE_ENV = 'production'
    devWarn('prod-key', 'should not appear')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  describe('warnUnsupportedColorProp', () => {
    it('warns when a color prop is present', () => {
      warnUnsupportedColorProp('Button', { color: 'primary' })
      expect(warnSpy).toHaveBeenCalledWith(
        '[Tigercat] Button does not support color. Use variant instead.'
      )
    })

    it('does not warn when no color prop is present', () => {
      warnUnsupportedColorProp('Tag', { variant: 'success' })
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('dedupes per component', () => {
      warnUnsupportedColorProp('Button', { color: 'red' })
      warnUnsupportedColorProp('Button', { color: 'blue' })
      warnUnsupportedColorProp('Tag', { color: 'red' })
      expect(warnSpy).toHaveBeenCalledTimes(2)
    })
  })
})
