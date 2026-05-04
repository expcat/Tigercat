/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import {
  extractMentionQuery,
  positionMentionsDropdown,
  getMentionsOptionClasses
} from '@expcat/tigercat-core'

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

  it('positions dropdown with floating styles', async () => {
    const reference = document.createElement('textarea')
    const dropdown = document.createElement('div')

    Object.defineProperty(reference, 'offsetWidth', {
      configurable: true,
      value: 240
    })

    document.body.append(reference, dropdown)

    await positionMentionsDropdown(reference, dropdown, { matchReferenceWidth: true })

    expect(dropdown.style.minWidth).toBe('240px')
    expect(dropdown.style.left).not.toBe('')
    expect(dropdown.style.top).not.toBe('')

    reference.remove()
    dropdown.remove()
  })
})
