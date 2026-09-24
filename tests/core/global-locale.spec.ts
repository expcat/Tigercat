/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { createTigerLocaleScope } from '@expcat/tigercat-core'

describe('Tiger locale scope', () => {
  it('keeps two scopes from seeing each other', () => {
    const a = createTigerLocaleScope()
    const b = createTigerLocaleScope()
    const handleA = a.createHandle({ common: { okText: 'A' } })
    b.createHandle({ common: { okText: 'B' } })

    expect(a.getLocale()?.common?.okText).toBe('A')
    expect(b.getLocale()?.common?.okText).toBe('B')

    handleA.dispose()
    expect(a.getLocale()).toBeUndefined()
    expect(b.getLocale()?.common?.okText).toBe('B')
  })

  it('reads the topmost non-empty handle on that scope only', () => {
    const scope = createTigerLocaleScope()
    const lower = scope.createHandle({ common: { okText: 'Lower' } })
    const upper = scope.createHandle({ common: { cancelText: 'Upper' } })

    expect(scope.getLocale()?.common?.cancelText).toBe('Upper')
    upper.dispose()
    expect(scope.getLocale()?.common?.okText).toBe('Lower')
    lower.dispose()
    expect(scope.getLocale()).toBeUndefined()
    scope.reset()
    expect(scope.getLocale()).toBeUndefined()
  })
})
