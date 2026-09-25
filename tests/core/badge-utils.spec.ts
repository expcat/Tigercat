/**
 * @vitest-environment node
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { getBadgeVariantClasses, resolveBadgeContent } from '@expcat/tigercat-core'

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

  it('uses a source-literal status fill so Tailwind can emit the background', () => {
    const danger = getBadgeVariantClasses('danger')
    const fill = 'bg-[color-mix(in_srgb,var(--tiger-error,#dc2626)_75%,var(--tiger-text))]'
    expect(danger.split(' ')).toContain(fill)
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../packages/core/src/utils/status-mix.ts'),
      'utf8'
    )
    expect(source).toContain(`'${fill}'`)
  })
})
