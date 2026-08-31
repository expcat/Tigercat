/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { resolveBadgeContent } from '@expcat/tigercat-core'

describe('resolveBadgeContent', () => {
  it('always shows dots', () => {
    expect(resolveBadgeContent({ type: 'dot' })).toEqual({ kind: 'dot' })
    expect(resolveBadgeContent({ type: 'dot', content: 0 })).toEqual({ kind: 'dot' })
  })

  it('leaves text content uncapped', () => {
    expect(resolveBadgeContent({ type: 'text', content: 150, max: 99 })).toEqual({
      kind: 'text',
      value: '150'
    })
    expect(resolveBadgeContent({ type: 'text', content: 'NEW' })).toEqual({
      kind: 'text',
      value: 'NEW'
    })
    expect(resolveBadgeContent({ type: 'text', content: '' })).toEqual({ kind: 'hidden' })
  })

  it('caps number content and honors showZero for 0 and "0"', () => {
    expect(resolveBadgeContent({ type: 'number', content: 150, max: 99 })).toEqual({
      kind: 'text',
      value: '99+'
    })
    expect(resolveBadgeContent({ type: 'number', content: '150', max: 99 })).toEqual({
      kind: 'text',
      value: '99+'
    })
    expect(resolveBadgeContent({ type: 'number', content: 0 })).toEqual({ kind: 'hidden' })
    expect(resolveBadgeContent({ type: 'number', content: '0' })).toEqual({ kind: 'hidden' })
    expect(resolveBadgeContent({ type: 'number', content: 0, showZero: true })).toEqual({
      kind: 'text',
      value: '0'
    })
    expect(resolveBadgeContent({ type: 'number', content: '0', showZero: true })).toEqual({
      kind: 'text',
      value: '0'
    })
  })

  it('hides empty and non-finite numbers', () => {
    expect(resolveBadgeContent({ type: 'number' })).toEqual({ kind: 'hidden' })
    expect(resolveBadgeContent({ type: 'number', content: '' })).toEqual({ kind: 'hidden' })
    expect(resolveBadgeContent({ type: 'number', content: Number.NaN })).toEqual({
      kind: 'hidden'
    })
    expect(resolveBadgeContent({ type: 'number', content: Number.POSITIVE_INFINITY })).toEqual({
      kind: 'hidden'
    })
  })
})
