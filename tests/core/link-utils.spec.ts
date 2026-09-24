/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  getSecureRel,
  isAllowedLinkUrl,
  isInternalLinkPath,
  resolveLinkAddress,
  resolveLinkHref
} from '@expcat/tigercat-core'

describe('link-utils protocol gate', () => {
  it('allows http(s), mailto, tel, relative paths, queries, and hashes', () => {
    for (const value of [
      'https://example.com/a',
      'http://example.com',
      'HTTP://example.com',
      'mailto:a@b.c',
      'tel:+1-555',
      '/docs',
      './docs',
      '../docs',
      'docs',
      '?q=1',
      '#section',
      '#'
    ]) {
      expect(isAllowedLinkUrl(value), value).toBe(true)
    }
  })

  it('rejects javascript, data, vbscript, protocol-relative, and disguised schemes', () => {
    for (const value of [
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      '  javascript:alert(1)',
      'java\nscript:alert(1)',
      'java\tscript:alert(1)',
      'data:text/html,hi',
      'data:image/png;base64,aaaa',
      'vbscript:msgbox(1)',
      'VbScript:msgbox(1)',
      '//evil.example',
      'blob:https://example.com/id',
      ''
    ]) {
      expect(isAllowedLinkUrl(value), JSON.stringify(value)).toBe(false)
      expect(resolveLinkHref(value)).toBeUndefined()
    }
  })

  it('treats only scheme-less addresses as internal paths', () => {
    expect(isInternalLinkPath('/app/users')).toBe(true)
    expect(isInternalLinkPath('users')).toBe(true)
    expect(isInternalLinkPath('https://example.com')).toBe(false)
    expect(isInternalLinkPath('javascript:alert(1)')).toBe(false)
    expect(isInternalLinkPath('//cdn.example/a.png')).toBe(false)
  })

  it('omits href when disabled or rejected, and secures _blank', () => {
    expect(resolveLinkHref('/ok', { disabled: true })).toBeUndefined()
    expect(resolveLinkAddress({ href: 'javascript:alert(1)', target: '_blank' })).toEqual({})
    expect(
      resolveLinkAddress({ href: 'https://example.com', target: '_blank', rel: 'nofollow' })
    ).toEqual({
      href: 'https://example.com',
      target: '_blank',
      rel: 'nofollow noopener noreferrer'
    })
    expect(getSecureRel('_self', 'nofollow')).toBe('nofollow')
  })
})
