/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getCardClasses,
  resolveCardPadding,
  resolveCardRoot,
  cardVariantClasses
} from '@expcat/tigercat-core'

describe('resolveCardPadding', () => {
  it('returns the size-based padding by default', () => {
    expect(resolveCardPadding('sm', undefined)).toBe('p-3')
    expect(resolveCardPadding('md', undefined)).toBe('p-4')
    expect(resolveCardPadding('lg', undefined)).toBe('p-6')
    expect(resolveCardPadding('md', true)).toBe('p-4')
  })

  it('returns undefined when padding is false', () => {
    expect(resolveCardPadding('md', false)).toBeUndefined()
  })

  it('returns a custom padding class when provided', () => {
    expect(resolveCardPadding('md', 'p-8')).toBe('p-8')
  })
})

describe('getCardClasses', () => {
  it('does not put a pointer cursor on a visual-only hover', () => {
    const classes = getCardClasses('default', true, false)
    expect(classes).not.toContain('cursor-pointer')
    expect(classes).toContain('hover:-translate-y-1')
  })

  it('adds a pointer cursor only when the card is a control', () => {
    expect(getCardClasses('default', true, true)).toContain('cursor-pointer')
  })

  it('resolves transparent without a surface background class', () => {
    expect(cardVariantClasses.transparent).toContain('bg-transparent')
    expect(cardVariantClasses.transparent).not.toContain('--tiger-surface')
    const classes = getCardClasses('transparent', false)
    expect(classes).toContain('bg-transparent')
    expect(classes).not.toContain('bg-[var(--tiger-surface')
  })
})

describe('resolveCardRoot', () => {
  it('stays a static div without href or click', () => {
    expect(resolveCardRoot({ clickable: false, nestedInteractive: false })).toEqual({ tag: 'div' })
  })

  it('uses an anchor when href is the only interaction', () => {
    expect(resolveCardRoot({ href: '/x', clickable: true, nestedInteractive: false })).toEqual({
      tag: 'a'
    })
  })

  it('does not turn the root into a control when nested actions exist', () => {
    expect(resolveCardRoot({ clickable: true, nestedInteractive: true })).toEqual({ tag: 'div' })
    expect(resolveCardRoot({ href: '/x', clickable: true, nestedInteractive: true })).toEqual({
      tag: 'div'
    })
  })
})
