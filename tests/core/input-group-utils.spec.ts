import { describe, expect, it } from 'vitest'
import { getInputGroupClasses } from '@expcat/tigercat-core'

describe('getInputGroupClasses compact', () => {
  it('uses focus-within, overlap, and first/last radius on direct children', () => {
    const compact = getInputGroupClasses(true)
    expect(compact).toContain('focus-within')
    expect(compact).not.toContain('[&>*:focus]:z-10')
    expect(compact).toContain('-ms-px')
    expect(compact).toContain('data-tiger-chrome')
    expect(compact).toContain(':first-child:not(:last-child)')
    expect(compact).toContain(':last-child:not(:first-child)')
    expect(compact).not.toContain('[&>*:first-child]:!rounded-e-none')
  })

  it('does not apply compact selectors when spaced', () => {
    const spaced = getInputGroupClasses(false)
    expect(spaced).toContain('gap-2')
    expect(spaced).not.toContain('focus-within')
  })
})
