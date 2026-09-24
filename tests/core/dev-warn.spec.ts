/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { devWarn, resetDevWarnCache } from '@expcat/tigercat-core'

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

  it('is silent when NODE_ENV is missing', () => {
    delete process.env.NODE_ENV
    devWarn('missing-env', 'should not appear')
    expect(warnSpy).not.toHaveBeenCalled()
  })

})
