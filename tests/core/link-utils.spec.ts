/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getLinkVariantClasses,
  getSecureRel,
  linkBaseClasses,
  resolveLinkClasses
} from '@expcat/tigercat-core'

describe('getSecureRel', () => {
  it('merges noopener noreferrer into a custom _blank rel', () => {
    const rel = getSecureRel('_blank', 'nofollow') ?? ''
    const tokens = new Set(rel.split(/\s+/))
    expect(tokens.has('nofollow')).toBe(true)
    expect(tokens.has('noopener')).toBe(true)
    expect(tokens.has('noreferrer')).toBe(true)
  })

  it('adds the secure tokens when _blank has no rel', () => {
    expect(getSecureRel('_blank', undefined)).toBe('noopener noreferrer')
  })

  it('does not add tokens for other targets', () => {
    expect(getSecureRel('_self', 'nofollow')).toBe('nofollow')
    expect(getSecureRel(undefined, undefined)).toBeUndefined()
  })
})

describe('resolveLinkClasses', () => {
  it('falls back to primary for an unknown variant and does not throw', () => {
    expect(resolveLinkClasses({ variant: 'not-a-variant' })).toBe(
      resolveLinkClasses({ variant: 'primary' })
    )
    expect(() => getLinkVariantClasses('not-a-variant')).not.toThrow()
  })

  it('underlines at rest and drops cursor-pointer when disabled', () => {
    const enabled = resolveLinkClasses({ underline: true })
    expect(enabled.split(/\s+/)).toContain('underline')
    expect(enabled.split(/\s+/)).not.toContain('hover:underline')
    expect(enabled.split(/\s+/)).toContain('cursor-pointer')
    expect(linkBaseClasses.split(/\s+/)).not.toContain('cursor-pointer')

    const disabled = resolveLinkClasses({ disabled: true })
    expect(disabled.split(/\s+/)).toContain('cursor-not-allowed')
    expect(disabled.split(/\s+/)).not.toContain('cursor-pointer')
    expect(disabled).toContain('--tiger-')
  })

  it('uses semantic text tokens for the default variant', () => {
    const classes = resolveLinkClasses({ variant: 'default' })
    expect(classes).toContain('--tiger-text')
    expect(classes).not.toContain('text-gray-')
  })
})
