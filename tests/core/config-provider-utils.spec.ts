import { describe, expect, it } from 'vitest'
import { resolveConfigDirection, resolveTigerConfig } from '@expcat/tigercat-core'

describe('resolveConfigDirection', () => {
  it('prefers an explicit direction prop', () => {
    expect(
      resolveConfigDirection({
        direction: 'ltr',
        locale: { locale: 'ar-SA', direction: 'rtl' },
        parentDirection: 'rtl'
      })
    ).toBe('ltr')
  })

  it('uses this layer locale.direction before parent', () => {
    expect(
      resolveConfigDirection({
        locale: { locale: 'en-US', direction: 'ltr' },
        parentDirection: 'rtl'
      })
    ).toBe('ltr')
  })

  it('infers from this layer locale id when direction is omitted', () => {
    expect(
      resolveConfigDirection({
        locale: { locale: 'en-US', empty: { noResults: 'None' } },
        parentDirection: 'rtl'
      })
    ).toBe('ltr')
  })

  it('inherits parent when this layer has no locale id', () => {
    expect(
      resolveConfigDirection({
        locale: { empty: { noResults: 'None' } },
        parentDirection: 'rtl'
      })
    ).toBe('rtl')
  })
})

describe('resolveTigerConfig', () => {
  it('writes the same direction onto config and locale', () => {
    const config = resolveTigerConfig({
      locale: { locale: 'en-US', empty: { noResults: 'None' } },
      parent: { locale: { locale: 'ar-SA', direction: 'rtl' }, direction: 'rtl' }
    })

    expect(config.direction).toBe('ltr')
    expect(config.locale?.direction).toBe('ltr')
    expect(config.locale?.locale).toBe('en-US')
  })

  it('merges overlay copy onto the parent locale', () => {
    const config = resolveTigerConfig({
      locale: { empty: { noResults: 'Inner' } },
      parent: { locale: { common: { okText: 'Outer' }, empty: { noData: 'Empty' } } }
    })

    expect(config.locale?.common?.okText).toBe('Outer')
    expect(config.locale?.empty?.noResults).toBe('Inner')
    expect(config.locale?.empty?.noData).toBe('Empty')
  })

  it('inherits theme and colorScheme from the parent', () => {
    const config = resolveTigerConfig({
      parent: { theme: 'vibrant', colorScheme: 'dark' }
    })

    expect(config.theme).toBe('vibrant')
    expect(config.colorScheme).toBe('dark')
  })
})
