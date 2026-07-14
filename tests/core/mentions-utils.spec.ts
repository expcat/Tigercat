/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { extractMentionQuery, getMentionsOptionClasses } from '@expcat/tigercat-core'

describe('mentions-utils', () => {
  it('extracts mention query before the cursor', () => {
    expect(extractMentionQuery('hello @ali', 10, '@')).toEqual({ query: 'ali', startPos: 6 })
    expect(extractMentionQuery('email@test', 10, '@')).toBeNull()
  })

  it('composes option classes by active and disabled state', () => {
    expect(getMentionsOptionClasses(true, false)).toContain(
      'bg-[var(--tiger-mentions-option-active'
    )
    expect(getMentionsOptionClasses(false, true)).toContain('cursor-not-allowed')
  })
})
