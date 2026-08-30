/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it } from 'vitest'
import {
  createGlobalTigerLocaleHandle,
  createTigerLocaleScope,
  getGlobalTigerLocale,
  resetTigerLocaleScope
} from '@expcat/tigercat-core'

describe('Tiger locale scope', () => {
  afterEach(() => {
    resetTigerLocaleScope()
  })

  it('does not install a process-wide locale on Node until a handle is created', () => {
    expect(getGlobalTigerLocale()).toBeUndefined()
  })

  it('isolates stacks across createTigerLocaleScope instances', () => {
    const a = createTigerLocaleScope()
    const b = createTigerLocaleScope()
    const handleA = a.createHandle({ common: { okText: 'A' } })
    b.createHandle({ common: { okText: 'B' } })

    expect(a.getLocale()?.common?.okText).toBe('A')
    expect(b.getLocale()?.common?.okText).toBe('B')
    expect(getGlobalTigerLocale()).toBeUndefined()

    handleA.dispose()
    expect(a.getLocale()).toBeUndefined()
    expect(b.getLocale()?.common?.okText).toBe('B')
  })

  it('resetTigerLocaleScope drops default-scope handles so tests do not leak', () => {
    createGlobalTigerLocaleHandle({ common: { okText: 'Keep' } })
    expect(getGlobalTigerLocale()?.common?.okText).toBe('Keep')

    resetTigerLocaleScope()
    expect(getGlobalTigerLocale()).toBeUndefined()
  })

  it('reads the topmost non-empty handle on the default scope', () => {
    const lower = createGlobalTigerLocaleHandle({ common: { okText: 'Lower' } })
    const upper = createGlobalTigerLocaleHandle({ common: { cancelText: 'Upper' } })

    expect(getGlobalTigerLocale()?.common?.cancelText).toBe('Upper')
    upper.dispose()
    expect(getGlobalTigerLocale()?.common?.okText).toBe('Lower')
    lower.dispose()
    expect(getGlobalTigerLocale()).toBeUndefined()
  })
})
