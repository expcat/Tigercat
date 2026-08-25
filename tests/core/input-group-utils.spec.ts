import { describe, expect, it } from 'vitest'
import { getInputGroupClasses } from '@expcat/tigercat-core'

describe('getInputGroupClasses compact', () => {
  it('uses focus-within, overlap, and first/last radius on direct children', () => {
    const compact = getInputGroupClasses(true)
    expect(compact).toContain('[&>*:focus-within]')
    expect(compact).not.toContain('[&>*:focus]:z-10')
    expect(compact).toContain('-ml-px')
    expect(compact).toContain('[&>*:first-child]:!rounded-r-none')
    expect(compact).toContain('[&>*:last-child]:!rounded-l-none')
    expect(compact).toContain('[&>*:not(:first-child):not(:last-child)]:!rounded-none')
  })

  it('does not apply compact selectors when spaced', () => {
    const spaced = getInputGroupClasses(false)
    expect(spaced).toContain('gap-2')
    expect(spaced).not.toContain('focus-within')
  })
})
